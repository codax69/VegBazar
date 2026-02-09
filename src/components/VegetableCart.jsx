import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle,
  Edit,
  CloudCog,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import RazorpayPayment from "./RazorpayPayment";
import CouponCodeSection from "./CouponCodeSection";
import AddressSection from "./AddressSection";
import OrderLoading from "./OrderLoading";
const API_URL = import.meta.env.VITE_API_SERVER_URL;

const getOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order)) return order;
  if (order.items && Array.isArray(order.items)) return order.items;
  return [];
};

const getOrderSummary = (order) => {
  return order?.summary || null;
};

const normalizeItem = (item) => ({
  ...item,
  vegetableId: item.vegetableId || item.id,
  id: item.id || item.vegetableId,
  image: item.image || "/placeholder-vegetable.jpg",
  pricePerUnit: item.pricePerUnit || item.price || 0,
  marketPrice: item.marketPrice || 0,
  selectedWeightPrice: item.selectedWeightPrice || {},
  totalPrice: item.totalPrice || 0,
});

const generateOrderId = (orderCount) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const orderNum = String(orderCount).padStart(3, "0");
  return `ORD${year}${month}${day}${orderNum}`;
};

const VegetableCart = () => {
  const {
    vegetableOrder,
    setVegetableOrder,
    navigate,
    setPaymentMethod,
    paymentMethod,
    setIsOrderPlaced,
  } = useOrderContext();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderCount, setOrderCount] = useState(1);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(20);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [defaultAddress, setDefaultAddress] = useState(null);

  // Memoized items and summary
  const items = useMemo(() => getOrderItems(vegetableOrder), [vegetableOrder]);
  const summary = useMemo(
    () => getOrderSummary(vegetableOrder),
    [vegetableOrder],
  );

  const subtotal = useMemo(() => {
    if (summary?.subtotal) return summary.subtotal;
    return items.reduce((total, item) => {
      const price =
        parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [items, summary]);

  const total = useMemo(() => {
    if (summary?.totalAmount) {
      return summary.totalAmount;
    }
    return subtotal - couponDiscount + deliveryCharge;
  }, [summary, subtotal, couponDiscount, deliveryCharge]);

  const isCheckoutDisabled = !selectedAddress || !paymentMethod;

  const customerInfo = useMemo(() => ({
    name: user?.username || "",
    mobile: user?.phone || "",
    email: user?.email || "",
  }), [user]);

  // Fetch default address from API
  useEffect(() => {
    let isMounted = true;

    const fetchDefaultAddress = async () => {
      const userId = user?._id || user?.id;
      if (!userId) {
        return;
      }

      try {
        const { data } = await axios.get(
          `${API_URL}/api/addresses/active`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (isMounted && data?.data.defaultAddress) {
          setDefaultAddress(data.data.defaultAddress);
          setSelectedAddress(data.data.defaultAddress);
        }

      } catch (error) {
        console.error("❌ Error fetching default address:", error);
        setDefaultAddress(null);
      }
    };

    fetchDefaultAddress();
    return () => {
      isMounted = false;
    };
  }, [user]);
  // Fetch order count on mount
  useEffect(() => {
    let isMounted = true;

    const fetchOrderCount = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/orders/today/total`);
        if (isMounted) {
          setOrderCount(data?.data.count + 1);
        }
      } catch (error) {
        console.error("❌ Error fetching order count:", error);
      }
    };

    fetchOrderCount();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    if (items.length === 0) {
      const orderJustPlaced = sessionStorage.getItem("orderJustPlaced");
      if (orderJustPlaced) {
        sessionStorage.removeItem("orderJustPlaced");
        return;
      }

      const savedSummary = localStorage.getItem("orderSummary");
      if (savedSummary) {
        try {
          const parsedSummary = JSON.parse(savedSummary);
          if (parsedSummary?.items?.length > 0) {
            const normalizedItems = parsedSummary.items.map(normalizeItem);
            setVegetableOrder({
              ...parsedSummary,
              items: normalizedItems,
            });

            if (parsedSummary.summary?.deliveryCharges !== undefined) {
              setDeliveryCharge(parsedSummary.summary.deliveryCharges);
            }
          }
        } catch (error) {
          console.error("❌ Error loading cart:", error);
          localStorage.removeItem("orderSummary");
        }
      }
    }
  }, []);

  // Auto-recalculate delivery charge when subtotal changes
  useEffect(() => {
    const recalculateDelivery = async () => {
      if (items.length === 0 || loading) return;

      const orderJustPlaced = sessionStorage.getItem("orderJustPlaced");
      if (orderJustPlaced) return;

      try {
        const updatedPrices = await calculatePrice(items, appliedCoupon?.code);

        if (updatedPrices?.summary?.deliveryCharges !== undefined) {
          const newDeliveryCharge = updatedPrices.summary.deliveryCharges;

          if (newDeliveryCharge !== deliveryCharge) {
            setDeliveryCharge(newDeliveryCharge);

            setVegetableOrder({
              ...vegetableOrder,
              items: items,
              summary: updatedPrices.summary,
              coupon: updatedPrices.coupon || appliedCoupon,
            });
          }
        }
      } catch (error) {
        console.error("❌ Failed to recalculate delivery charge:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      recalculateDelivery();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [subtotal, items.length]);

  // Save cart to localStorage
  useEffect(() => {
    const orderJustPlaced = sessionStorage.getItem("orderJustPlaced");
    if (orderJustPlaced) {
      return;
    }

    if (items.length > 0) {
      const timeoutId = setTimeout(() => {
        const normalizedItems = items.map(normalizeItem);
        const orderData = vegetableOrder?.summary
          ? { ...vegetableOrder, items: normalizedItems }
          : {
            items: normalizedItems,
            summary: {},
            timestamp: new Date().toISOString(),
          };
        localStorage.setItem("orderSummary", JSON.stringify(orderData));
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (items.length === 0) {
      localStorage.removeItem("orderSummary");
      localStorage.removeItem("vegbazar_cart");
    }
  }, [items, vegetableOrder]);

  // Memoized API call for price calculation
  const calculatePrice = useCallback(async (orderItems, couponCode = null) => {
    const normalizedItems = orderItems.map((item) => ({
      vegetableId: item.vegetableId || item.id,
      weight: item.weight,
      quantity: item.quantity,
    }));

    const payload = {
      items: normalizedItems,
    };

    if (couponCode) {
      payload.couponCode = couponCode;
    }

    const { data } = await axios.post(
      `${API_URL}/api/orders/calculate-price`,
      payload,
    );
    return data.data;
  }, []);

  const handleApplyCoupon = useCallback(
    async (couponCode) => {
      try {
        const updatedPrices = await calculatePrice(items, couponCode);

        if (updatedPrices.coupon && updatedPrices.coupon.applied) {
          setAppliedCoupon(updatedPrices.coupon);
          setCouponDiscount(updatedPrices.coupon.discount || 0);
          setDeliveryCharge(updatedPrices.summary.deliveryCharges || 0);

          setVegetableOrder({
            ...vegetableOrder,
            items: items,
            summary: updatedPrices.summary,
            coupon: updatedPrices.coupon,
          });
        } else {
          throw new Error(updatedPrices.coupon?.error || "Invalid coupon code");
        }
      } catch (error) {
        console.error("❌ Coupon application failed:", error);
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          "Failed to apply coupon",
        );
      }
    },
    [items, vegetableOrder, calculatePrice, setVegetableOrder],
  );

  const handleRemoveCoupon = useCallback(async () => {
    try {
      const updatedPrices = await calculatePrice(items);

      setAppliedCoupon(null);
      setCouponDiscount(0);
      setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);

      setVegetableOrder({
        ...vegetableOrder,
        items: items,
        summary: updatedPrices.summary,
        coupon: null,
      });
    } catch (error) {
      console.error("❌ Failed to remove coupon:", error);
    }
  }, [items, vegetableOrder, calculatePrice, setVegetableOrder]);

  const updateQuantity = useCallback(
    async (index, change) => {
      try {
        setLoading(true);
        setLoadingAction("Updating quantity...");

        const newQuantity = items[index].quantity + change;

        if (newQuantity <= 0) {
          await removeItem(index);
          return;
        }

        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], quantity: newQuantity };

        const updatedPrices = await calculatePrice(
          updatedItems,
          appliedCoupon?.code,
        );
        const itemsWithPrices = updatedItems.map((item) => {
          const calculatedItem = updatedPrices.items.find(
            (i) =>
              i.vegetableId === (item.id || item.vegetableId) &&
              i.weight === item.weight,
          );
          return calculatedItem
            ? {
              ...item,
              pricePerUnit: calculatedItem.pricePerUnit,
              totalPrice: calculatedItem.subtotal,
            }
            : item;
        });

        setVegetableOrder(
          Array.isArray(vegetableOrder)
            ? itemsWithPrices
            : {
              items: itemsWithPrices,
              summary: updatedPrices.summary || {},
              coupon: updatedPrices.coupon || appliedCoupon,
              timestamp: updatedPrices.timestamp || new Date().toISOString(),
            },
        );

        if (updatedPrices.coupon?.discount) {
          setCouponDiscount(updatedPrices.coupon.discount);
        }
        setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);
      } catch (error) {
        console.error("❌ Failed to update quantity:", error);
        alert("Failed to update quantity. Please try again.");
      } finally {
        setLoading(false);
        setLoadingAction("");
      }
    },
    [items, vegetableOrder, appliedCoupon, calculatePrice, setVegetableOrder],
  );

  const removeItem = useCallback(
    async (index) => {
      try {
        setLoading(true);
        setLoadingAction("Removing item...");

        const updatedItems = items.filter((_, i) => i !== index);

        if (updatedItems.length > 0) {
          const updatedPrices = await calculatePrice(
            updatedItems,
            appliedCoupon?.code,
          );
          const itemsWithPrices = updatedItems.map((item) => {
            const calculatedItem = updatedPrices.items.find(
              (i) =>
                i.vegetableId === (item.id || item.vegetableId) &&
                i.weight === item.weight,
            );
            return calculatedItem
              ? {
                ...item,
                pricePerUnit: calculatedItem.pricePerUnit,
                totalPrice: calculatedItem.subtotal,
              }
              : item;
          });

          setVegetableOrder(
            Array.isArray(vegetableOrder)
              ? itemsWithPrices
              : {
                items: itemsWithPrices,
                summary: updatedPrices.summary || {},
                coupon: updatedPrices.coupon || appliedCoupon,
                timestamp:
                  updatedPrices.timestamp || new Date().toISOString(),
              },
          );

          if (updatedPrices.coupon?.discount) {
            setCouponDiscount(updatedPrices.coupon.discount);
          }
          setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);
        } else {
          setVegetableOrder([]);
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setDeliveryCharge(20);
          localStorage.removeItem("orderSummary");
        }
      } catch (error) {
        console.error("❌ Failed to remove item:", error);
        alert("Failed to remove item. Please try again.");
      } finally {
        setLoading(false);
        setLoadingAction("");
      }
    },
    [items, vegetableOrder, appliedCoupon, calculatePrice, setVegetableOrder],
  );

  const handleCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingAction("Placing your order...");

      if (!selectedAddress || !paymentMethod) {
        alert("Please select both delivery address and payment method");
        setLoading(false);
        setLoadingAction("");
        return;
      }

      // Normalize items
      const normalizedItems = items.map((item) => ({
        ...item,
        vegetableId: item.vegetableId || item.id,
        id: item.id || item.vegetableId,
      }));

      // Remove duplicates and merge quantities
      const uniqueVegetables = normalizedItems.reduce((acc, item) => {
        const vegetableId = item.vegetableId || item.id;
        if (!vegetableId) return acc;

        const existingIndex = acc.findIndex(
          (v) =>
            (v.vegetableId || v.id) === vegetableId && v.weight === item.weight,
        );

        if (existingIndex >= 0) {
          acc[existingIndex].quantity += item.quantity;
          const pricePerUnit = parseFloat(acc[existingIndex].pricePerUnit) || 0;
          acc[existingIndex].totalPrice =
            pricePerUnit * acc[existingIndex].quantity;
        } else {
          acc.push({ ...item, vegetableId, id: vegetableId });
        }
        return acc;
      }, []);

      if (uniqueVegetables.length !== normalizedItems.length) {
        setVegetableOrder(
          Array.isArray(vegetableOrder)
            ? uniqueVegetables
            : { ...vegetableOrder, items: uniqueVegetables },
        );
      }

      // Calculate price details
      const priceDetails = await calculatePrice(
        uniqueVegetables,
        appliedCoupon?.code,
      );
      const orderId = generateOrderId(orderCount);

      const userId = user?._id || user?.id;
      const orderData = {
        orderId,
        orderType: "custom",
        userId: userId || null,
        customerInfo,
        deliveryAddressId: selectedAddress._id,
        selectedVegetables: uniqueVegetables.map((item) => ({
          vegetable: item.vegetableId || item.id,
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          pricePerUnit:
            parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
          subtotal: (parseFloat(item.pricePerUnit) || 0) * item.quantity,
          isFromBasket: false,
        })),
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discount || 0,
        vegetablesTotal: priceDetails?.summary?.subtotal || subtotal,
        deliveryCharges:
          priceDetails?.summary?.deliveryCharges || deliveryCharge,
        totalAmount: priceDetails?.summary?.totalAmount || total,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
        orderDate: new Date().toISOString(),
      };
      // // console.log("Order Data:", orderData);
      // Handle COD payment
      if (paymentMethod === "COD") {
        await axios.post(`${API_URL}/api/orders/create-order`, orderData);

        sessionStorage.setItem("lastOrderData", JSON.stringify(orderData));
        sessionStorage.setItem("orderJustPlaced", "true");

        setVegetableOrder([]);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setDeliveryCharge(20);

        localStorage.removeItem("orderSummary");
        localStorage.removeItem("vegbazar_cart");

        setIsOrderPlaced(true);

        window.scrollTo(0, 0);
        navigate("/confirmation");
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to create order: ${errorMessage}`);

      if (error.response?.status >= 500) {
        navigate("/order-failed");
      }
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  }, [
    selectedAddress,
    paymentMethod,
    items,
    vegetableOrder,
    orderCount,
    subtotal,
    total,
    appliedCoupon,
    deliveryCharge,
    calculatePrice,
    setVegetableOrder,
    setAppliedCoupon,
    setCouponDiscount,
    setDeliveryCharge,
    setIsOrderPlaced,
    navigate,
    user,
    customerInfo,
  ]);

  const handleContinueShopping = useCallback(() => navigate("/"), [navigate]);
  const handleBrowseVegetables = useCallback(() => {
    window.scrollTo(0, 0);
    navigate("/");
  }, [navigate]);
  const handleChangeAddress = useCallback(() => navigate("/address"), [navigate]);

  if (loading) {
    return (
      <OrderLoading loadingText={loadingAction} loadingMsg="Please wait..." />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-5 py-14 lg:pb-0">
        <div className="container mx-auto px-4 md:py-4 lg:py-3">
          <div className="mb-4 md:mb-3">
            <div className="flex gap-1 flex-col items-center justify-between">
              <button
                onClick={handleContinueShopping}
                className="flex items-center gap-1 px-3 py-1.5 md:py-1 text-[#0e540b] hover:bg-green-50 rounded-lg transition font-funnel text-sm font-semibold"
              >
                <ArrowLeft size={16} className="mr-1" />
                Continue Shopping
              </button>
              <h2 className="font-amiko text-xl md:text-xl lg:text-xl font-bold text-[#0e540b] flex items-center gap-1 sm:gap-2">
                <ShoppingBag size={20} className="md:w-4 md:h-4" />
                Your Vegetable Bag
              </h2>
            </div>
          </div>
          <div className="bg-[#f0fcf6] p-8 md:p-6 rounded-lg shadow-md text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-funnel text-lg md:text-base font-semibold text-gray-600 mb-1">
              Your cart is empty
            </h3>
            <p className="font-funnel text-gray-500 mb-4 text-sm">
              Add fresh vegetables to get started!
            </p>
            <button
              onClick={handleBrowseVegetables}
              className="font-funnel px-4 py-2 bg-[#0e540b] text-white rounded-lg font-semibold text-sm hover:bg-green-800 transition"
            >
              Browse Vegetables
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 pb-14 pt-4 lg:pb-0">
      <div className="container mx-auto px-4 md:py-4 lg:py-3">
        <div className="mb-4 md:mb-3">
          <div className="flex gap-1 flex-col items-center justify-baseline">
            <button
              onClick={handleContinueShopping}
              className="flex items-center gap-1 px-3 py-1.5 md:py-1 text-[#0e540b] hover:bg-green-50 rounded-lg transition font-funnel text-sm font-semibold"
            >
              <ArrowLeft size={16} className="mr-1" />
              Continue Shopping
            </button>
            <h2 className="font-amiko text-xl md:text-xl lg:text-xl font-bold text-[#0e540b] flex items-center gap-1 sm:gap-2">
              <ShoppingBag size={20} className="md:w-4 md:h-4" />
              Your Vegetable Bag
            </h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 md:gap-2.5">
          <div className="flex-1 lg:w-2/3 space-y-3 md:space-y-2.5">
            <div className="lg:hidden">
              <CouponCodeSection
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                subtotal={subtotal}
                isMobile={true}
              />
            </div>

            <div className="lg:hidden bg-[#f0fcf6] p-4 rounded-lg shadow-md">
              <h3 className="font-funnel text-base font-bold text-gray-800 mb-3 border-b pb-2">
                Bill Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-funnel text-gray-600">Subtotal</span>
                  <span className="font-funnel font-semibold text-gray-800">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-funnel">Coupon Discount</span>
                    <span className="font-funnel font-semibold">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-funnel text-gray-600">
                    Delivery Charge
                  </span>
                  <span className="font-funnel font-semibold text-gray-800">
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>

                {deliveryCharge > 0 && subtotal < 269 && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-funnel text-xs text-green-700 font-semibold">
                      🎉 Add ₹{(269 - subtotal).toFixed(2)} more for FREE
                      delivery!
                    </p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-funnel font-bold text-gray-800">
                      Total Amount
                    </span>
                    <span className="font-amiko font-bold text-[#0e540b] text-lg">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {isCheckoutDisabled && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-funnel text-xs text-orange-700 font-semibold">
                    ⚠️ Please select delivery address and payment method below
                    to proceed
                  </p>
                </div>
              )}
            </div>

            <AddressSection
              defaultAddress={defaultAddress}
              onChangeAddress={handleChangeAddress}
              user={user}
            />

            <CartItems
              items={items}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />

            <PaymentMethodSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>

          <PriceSummary
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            total={total}
            isCheckoutDisabled={isCheckoutDisabled}
            paymentMethod={paymentMethod}
            vegetableOrder={vegetableOrder}
            handleCheckout={handleCheckout}
            onApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            couponDiscount={couponDiscount}
            customerInfo={customerInfo}
            selectedAddress={selectedAddress}
          />
        </div>
      </div>

      <MobileCheckoutButton
        paymentMethod={paymentMethod}
        vegetableOrder={vegetableOrder}
        isCheckoutDisabled={isCheckoutDisabled}
        total={total}
        handleCheckout={handleCheckout}
        appliedCoupon={appliedCoupon}
        customerInfo={customerInfo}
        selectedAddress={selectedAddress}
      />
    </div>
  );
};

const CartItems = React.memo(({ items, updateQuantity, removeItem }) => (
  <div className="bg-[#f0fcf6] p-3 md:p-2.5 rounded-lg shadow-md">
    <h3 className="font-funnel text-base md:text-sm font-bold text-gray-800 mb-2 md:mb-1.5 border-b pb-1.5 md:pb-1">
      Order Items ({items.length} items,{" "}
      {items.reduce((sum, item) => sum + item.quantity, 0)} total quantity)
    </h3>
    <div className="space-y-2.5 md:space-y-2">
      {items.map((item, index) => (
        <CartItem
          key={`${item.vegetableId || item.id}-${item.weight}-${index}`}
          item={item}
          index={index}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}
    </div>
  </div>
));

const CartItem = React.memo(({ item, index, updateQuantity, removeItem }) => {
  const itemPrice =
    parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
  const itemTotal = parseFloat(item.totalPrice) || itemPrice * item.quantity;
  const selectedWeightPrice = item.selectedWeightPrice || {};
  const marketPriceForWeight = selectedWeightPrice[item.weight]
    ? parseFloat(selectedWeightPrice[item.weight])
    : null;

  return (
    <div className="flex gap-2.5 md:gap-2 p-2.5 md:p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition">
      <img
        src={item.image || "/placeholder-vegetable.jpg"}
        alt={item.name}
        className="w-14 h-14 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
        onError={(e) => {
          e.target.src = "/placeholder-vegetable.jpg";
        }}
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-funnel font-semibold text-gray-800 text-sm md:text-xs">
            {item.name} ({item.weight})
          </h4>
          <div className="flex items-center gap-1.5 md:gap-1 mt-0.5">
            <p className="font-funnel text-sm md:text-xs font-semibold text-[#0e540b]">
              ₹{itemPrice.toFixed(2)} per {item.weight}
            </p>
            {marketPriceForWeight && marketPriceForWeight > itemPrice && (
              <p className="font-funnel text-xs md:text-[10px] line-through text-gray-400">
                ₹{marketPriceForWeight.toFixed(2)}
              </p>
            )}
          </div>
          {marketPriceForWeight && marketPriceForWeight > itemPrice && (
            <p className="font-funnel text-[10px] md:text-[9px] text-green-600 font-semibold mt-0.5">
              Save ₹{(marketPriceForWeight - itemPrice).toFixed(2)} per{" "}
              {item.weight}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5 md:mt-1">
          <div className="flex items-center gap-1.5 md:gap-1">
            <button
              onClick={() => updateQuantity(index, -1)}
              className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition"
              aria-label="Decrease quantity"
            >
              <Minus size={12} className="text-gray-700 md:w-2.5 md:h-2.5" />
            </button>
            <span className="font-funnel font-semibold text-gray-800 text-sm md:text-xs w-7 md:w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(index, 1)}
              className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center bg-[#0e540b] hover:bg-green-800 rounded-full transition"
              aria-label="Increase quantity"
            >
              <Plus size={12} className="text-white md:w-2.5 md:h-2.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-1.5">
            <p className="font-funnel font-bold text-gray-800 text-sm md:text-xs">
              ₹{itemTotal.toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(index)}
              className="p-1 md:p-0.5 text-red-500 hover:bg-red-50 rounded-lg transition"
              aria-label="Remove item"
            >
              <Trash2 size={14} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const PaymentMethodSection = React.memo(
  ({ paymentMethod, setPaymentMethod }) => (
    <div className="bg-[#f0fcf6] p-4 md:p-3 rounded-lg shadow-md">
      <h3 className="font-funnel text-base md:text-sm font-bold text-gray-800 mb-3 md:mb-2 flex items-center gap-2">
        <CreditCard size={18} className="text-[#0e540b] md:w-4 md:h-4" />
        Select Payment Method
      </h3>
      <div className="space-y-2.5 md:space-y-2">
        <label
          className={`flex items-center gap-3 md:gap-2 p-3 md:p-2.5 rounded-lg border-2 cursor-pointer transition ${paymentMethod === "COD"
            ? "border-[#0e540b] bg-green-50"
            : "border-gray-200 hover:border-green-300"
            }`}
        >
          <input
            type="radio"
            name="payment"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#0e540b] focus:ring-[#0e540b]"
          />
          <Banknote size={22} className="text-gray-600 md:w-5 md:h-5" />
          <div className="flex-1">
            <p className="font-funnel font-semibold text-gray-800 text-sm md:text-xs">
              Cash on Delivery
            </p>
            <p className="font-funnel text-xs md:text-[10px] text-gray-600">
              Pay when you receive
            </p>
          </div>
          {paymentMethod === "COD" && (
            <CheckCircle size={18} className="text-[#0e540b] md:w-4 md:h-4" />
          )}
        </label>
        <label
          className={`flex items-center gap-3 md:gap-2 p-3 md:p-2.5 rounded-lg border-2 cursor-pointer transition ${paymentMethod === "ONLINE"
            ? "border-[#0e540b] bg-green-50"
            : "border-gray-200 hover:border-green-300"
            }`}
        >
          <input
            type="radio"
            name="payment"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#0e540b] focus:ring-[#0e540b]"
          />
          <CreditCard size={22} className="text-gray-600 md:w-5 md:h-5" />
          <div className="flex-1">
            <p className="font-funnel font-semibold text-gray-800 text-sm md:text-xs">
              Online Payment
            </p>
            <p className="font-funnel text-xs md:text-[10px] text-gray-600">
              UPI, Card, Net Banking
            </p>
          </div>
          {paymentMethod === "ONLINE" && (
            <CheckCircle size={18} className="text-[#0e540b] md:w-4 md:h-4" />
          )}
        </label>
      </div>
    </div>
  ),
);

const PriceSummary = React.memo(
  ({
    subtotal,
    deliveryCharge,
    total,
    isCheckoutDisabled,
    paymentMethod,
    vegetableOrder,
    handleCheckout,
    onApplyCoupon,
    appliedCoupon,
    onRemoveCoupon,
    couponDiscount,
    customerInfo,
    selectedAddress,
  }) => (
    <div className="lg:w-1/3 hidden lg:block">
      <div className="bg-[#f0fcf6] p-3 rounded-lg shadow-md lg:sticky lg:top-4 space-y-3">
        <CouponCodeSection
          onApplyCoupon={onApplyCoupon}
          appliedCoupon={appliedCoupon}
          onRemoveCoupon={onRemoveCoupon}
          subtotal={subtotal}
          isMobile={false}
        />

        <div>
          <h3 className="font-funnel text-sm font-bold text-gray-800 mb-2.5 border-b pb-1.5">
            Price Summary
          </h3>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="font-funnel text-xs text-gray-600">
                Subtotal
              </span>
              <span className="font-funnel font-semibold text-gray-800 text-sm">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="font-funnel text-xs">Coupon Discount</span>
                <span className="font-funnel font-semibold text-sm">
                  -₹{couponDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="font-funnel text-xs text-gray-600">
                Delivery Charge
              </span>
              <span className="font-funnel font-semibold text-gray-800 text-sm">
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge.toFixed(2)}`}
              </span>
            </div>

            {deliveryCharge > 0 && subtotal < 269 && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-funnel text-xs text-green-700 font-semibold">
                  🎉 Add ₹{(269 - subtotal).toFixed(2)} more for FREE delivery!
                </p>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-funnel font-bold text-gray-800 text-sm">
                  Total Amount
                </span>
                <span className="font-amiko font-bold text-[#0e540b] text-base">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {isCheckoutDisabled && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-funnel text-[10px] text-orange-700 font-semibold">
                ⚠️ Please select delivery address and payment method to proceed
              </p>
            </div>
          )}
          {paymentMethod === "ONLINE" ? (
            <RazorpayPayment
              orderType="custom"
              vegetableOrder={vegetableOrder}
              couponCode={appliedCoupon}
              customerInfo={customerInfo}
              deliveryAddress={selectedAddress}
              isCheckoutDisabled={isCheckoutDisabled}
            />
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled}
              className={`w-full font-funnel py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 ${isCheckoutDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0e540b] to-green-700 text-white hover:from-green-700 hover:to-[#0e540b] hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
            >
              {isCheckoutDisabled ? "Complete Selection" : "Place Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  ),
);

const MobileCheckoutButton = React.memo(
  ({
    paymentMethod,
    vegetableOrder,
    isCheckoutDisabled,
    total,
    handleCheckout,
    appliedCoupon,
    customerInfo,
    selectedAddress,
  }) => (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#f0fcf6] border-t border-gray-200 shadow-2xl z-50">
      <div className="px-4 py-3">
        {paymentMethod === "ONLINE" ? (
          <div className="w-full">
            <RazorpayPayment
              orderType="custom"
              vegetableOrder={vegetableOrder}
              couponCode={appliedCoupon}
              customerInfo={customerInfo}
              deliveryAddress={selectedAddress}
              isCheckoutDisabled={isCheckoutDisabled}
            />
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            className={`w-full font-funnel py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 ${isCheckoutDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#0e540b] to-green-700 text-white hover:from-green-700 hover:to-[#0e540b] hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
          >
            {isCheckoutDisabled
              ? "Complete Selection to Proceed"
              : `Place Order • ₹${total.toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  ),
);

export default VegetableCart;