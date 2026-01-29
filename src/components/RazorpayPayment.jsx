import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useOrderContext } from "../Context/OrderContext";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/AuthProvider";

const RazorpayPayment = ({
  orderType,
  onSuccess,
  vegetableOrder,
  couponCode,
  deliveryAddress,
}) => {
  const {
    selectedOffer,
    selectedVegetables,
    formData,
    navigate,
    setIsOrderPlaced,
    paymentMethod,
  } = useOrderContext();

  const { user } = useAuth();
  const customerInfo = useMemo(() => ({
    name: user?.username || "",
    mobile: user?.phone || "",
    email: user?.email || "",
  }), [user]);

  const [orderCount, setOrderCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Helper functions
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order)) return order;
    if (order.items && Array.isArray(order.items)) return order.items;
    return [];
  };

  const getOrderSummary = (order) => {
    if (order && typeof order === "object" && order.summary)
      return order.summary;
    return null;
  };

  const isCustomOrder = useMemo(() => {
    return orderType === "custom" || getOrderItems(vegetableOrder).length > 0;
  }, [orderType, vegetableOrder]);

  const isBasketOrder = useMemo(() => {
    return (
      orderType === "basket" ||
      (selectedOffer && selectedVegetables?.length > 0)
    );
  }, [orderType, selectedOffer, selectedVegetables]);

  // ✅ FIXED: Calculate total amount with proper coupon handling
  const totalAmount = useMemo(() => {
    if (isCustomOrder && vegetableOrder) {
      const items = getOrderItems(vegetableOrder);
      const summary = getOrderSummary(vegetableOrder);

      if (summary?.totalAmount && summary.totalAmount > 0) {
        return summary.totalAmount;
      }

      const subtotal = items.reduce((acc, item) => {
        const price =
          parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 0;
        return acc + price * qty;
      }, 0);

      const delivery = summary?.deliveryCharges ?? 20;
      return subtotal > 0 ? subtotal + delivery : 0;
    }

    if (isBasketOrder && selectedOffer) {
      const offerPrice = selectedOffer.price || 0;
      const discount = couponCode?.discount || 0;
      const deliveryCharge = 20;
      return Math.max(0, offerPrice - discount) + deliveryCharge;
    }

    return 0;
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedOffer, couponCode]);

  console.log(deliveryAddress)

  const loadScript = useCallback((src) => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;

      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };

      script.onerror = () => {
        console.error("❌ Razorpay script failed to load");
        setScriptLoaded(false);
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (paymentMethod === "ONLINE") {
      loadScript("https://checkout.razorpay.com/v1/checkout.js");
    }
  }, [paymentMethod, loadScript]);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/total`,
          { timeout: 10000 }
        );
        setOrderCount(response.data?.data.count + 1);
      } catch (error) {
        console.error("Error fetching order count:", error);
        setOrderCount(1);
      }
    };

    fetchOrderCount();
  }, []);

  const generateOrderId = useCallback((count = 1) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(count).padStart(3, "0");
    return `ORD${year}${month}${day}${orderNum}`;
  }, []);

  // ✅ FIXED: Improved order data building with better error handling
  const buildOrderData = useCallback(
    (orderId) => {
      try {
        if (isCustomOrder && vegetableOrder) {
          const items = getOrderItems(vegetableOrder);
          const summary = getOrderSummary(vegetableOrder);

          // Extract coupon code properly
          const extractedCouponCode =
            typeof couponCode === "string"
              ? couponCode
              : couponCode?.code || null;

          const orderData = {
            orderId,
            orderType: "custom",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress._id || null,
            selectedVegetables: (items || []).map((item) => ({
              vegetable: item.id || item.vegetableId,
              weight: item.weight,
              quantity: item.quantity,
              pricePerUnit:
                parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              subtotal:
                (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
                (item.quantity || 0),
              isFromBasket: false,
            })),
            vegetablesTotal:
              summary?.subtotal ||
              items.reduce((total, item) => {
                const price =
                  parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
                return total + price * (item.quantity || 0);
              }, 0),
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
            orderDate: new Date().toISOString(),
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };

          return orderData;
        }

        if (isBasketOrder) {
          const extractedCouponCode =
            typeof couponCode === "string"
              ? couponCode
              : couponCode?.code || null;

          const orderData = {
            orderId,
            orderType: "basket",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress._id || null,
            selectedOffer: selectedOffer || {},
            selectedVegetables: selectedVegetables || [],
            orderDate: new Date().toISOString(),
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };

          return orderData;
        }

        throw new Error("Invalid order type");
      } catch (error) {
        console.error("❌ Error building order data:", error);
        throw error;
      }
    },
    [
      isCustomOrder,
      isBasketOrder,
      vegetableOrder,
      formData,
      customerInfo,
      deliveryAddress,
      selectedOffer,
      selectedVegetables,
      totalAmount,
      couponCode,
    ]
  );

  // ✅ FIXED: Improved payment handler with better error handling
  const createOrder = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate data
      if (!customerInfo?.name || !customerInfo?.mobile) {
        throw new Error("Customer information is incomplete");
      }

      if (totalAmount <= 0) {
        throw new Error("Invalid order amount");
      }

      // Ensure Razorpay script is loaded
      if (!scriptLoaded) {
        const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );
        if (!res) {
          throw new Error(
            "Razorpay SDK failed to load. Please check your internet connection."
          );
        }
      }

      const orderId = generateOrderId(orderCount);
      setCurrentOrderId(orderId);
      const orderData = buildOrderData(orderId);


      // Create order in backend
      const result = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
        orderData,
        { timeout: 15000 }
      );


      if (!result?.data?.data?.razorpayOrder?.id) {
        throw new Error("Failed to create order. Please try again.");
      }

      const razorpayOrderId = result.data.data.razorpayOrder.id;
      const amount = Math.round(totalAmount * 100);
      const currency = "INR";

      // ✅ FIXED: Store order data in sessionStorage for recovery
      sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));

      let description = "";
      if (isCustomOrder) {
        description = "Custom Vegetable Order";
      } else if (isBasketOrder && selectedOffer) {
        description = `${selectedOffer.title}`;
      }

      const options = {
        key: import.meta.env.KEY_ID ||"rzp_live_S9b62PxTC6AT2U",
        amount,
        currency,
        name: "VegBazar",
        description,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {

            // Build verification data
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
              couponCode:
                typeof couponCode === "string" ? couponCode : couponCode?.code,
              deliveryAddressId: deliveryAddress?._id || null,
            };

            // Add order-specific data
            if (isCustomOrder && vegetableOrder) {
              const items = getOrderItems(vegetableOrder);
              verifyData.orderType = "custom";
              verifyData.customerInfo = customerInfo;
              verifyData.selectedVegetables = items.map((item) => ({
                vegetable: item.id || item.vegetableId,
                weight: item.weight,
                quantity: item.quantity,
                pricePerUnit:
                  parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              }));
              verifyData.totalAmount = totalAmount;
            } else if (isBasketOrder) {
              verifyData.orderType = "basket";
              verifyData.customerInfo = customerInfo;
              verifyData.selectedOffer = selectedOffer;
              verifyData.selectedVegetables = selectedVegetables;
              verifyData.totalAmount = totalAmount;
            }


            const verifyResult = await axios.post(
              `${import.meta.env.VITE_API_SERVER_URL
              }/api/orders/verify-payment`,
              verifyData,
              { timeout: 15000 }
            );

            console.log("verifyResult", verifyResult.data);
            if (verifyResult.data.success) {
              // Clear pending order data
              sessionStorage.removeItem('pendingOrderData');
              // Clear cart from localStorage
              localStorage.removeItem("orderSummary");
              localStorage.removeItem("vegbazar_cart");

              setIsOrderPlaced(true);
              if (onSuccess) {
                onSuccess();
              } else {
                navigate("/confirmation", {
                  state: { orderData: verifyResult.data },
                });
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            console.error("Error details:", err.response?.data);

            // ✅ IMPORTANT: Show user-friendly error message
            setError(
              `Payment received but verification failed. Your payment ID: ${response.razorpay_payment_id}. Please contact support or try again.`
            );
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerInfo?.name || "",
          email: customerInfo?.email || "",
          contact: customerInfo?.mobile || "",
        },
        notes: {
          address: deliveryAddress?.street || "",
          area: deliveryAddress?.area || "",
          city: deliveryAddress?.city || "",
          orderId: orderId,
        },
        theme: { color: "#0e540b" },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setError("Payment cancelled. Please try again when ready.");

            // Clear pending order data
            sessionStorage.removeItem('pendingOrderData');
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("❌ Payment creation error:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Unable to initiate payment. Please try again.";
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-assistant text-red-800 font-medium mb-1">
              Payment Error
            </p>
            <p className="text-xs text-red-700 break-words">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            createOrder();
          }}
          className="w-full font-assistant py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {totalAmount > 0 ? (
        <>
          <button
            onClick={createOrder}
            disabled={isLoading}
            className="w-full py-3 font-assistant sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Pay Now
              </>
            )}
          </button>

          {!scriptLoaded && (
            <p className="text-center font-assistant text-xs text-yellow-600">
              Loading payment gateway...
            </p>
          )}

          {isBasketOrder && selectedOffer && (
            <div className="text-center space-y-1">
              <p className="font-assistant text-xs sm:text-sm text-gray-600">
                Package: ₹{selectedOffer.price}
                {couponCode && couponCode.discount > 0 && (
                  <span className="text-green-600 font-semibold ml-1">
                    - ₹{couponCode.discount} (Coupon)
                  </span>
                )}
                {" + ₹20 delivery"}
              </p>
              {couponCode && couponCode.code && (
                <p className="text-xs text-green-600 font-semibold">
                  Coupon "{couponCode.code}" applied ✓
                </p>
              )}
            </div>
          )}

          {isCustomOrder && (
            <div className="text-center space-y-1">
              <p className="font-assistant text-xs sm:text-sm text-gray-600">
                {vegetableOrder?.summary?.deliveryCharges === 0
                  ? "Free Delivery (Order above ₹250)"
                  : "Includes ₹20 delivery charge"}
              </p>
              {couponCode &&
                (typeof couponCode === "string" || couponCode.code) && (
                  <p className="text-xs text-green-600 font-semibold">
                    Coupon "
                    {typeof couponCode === "string"
                      ? couponCode
                      : couponCode.code}
                    " applied ✓
                  </p>
                )}
            </div>
          )}
        </>
      ) : (
        <button
          disabled
          className="w-full font-assistant py-3 sm:py-4 rounded-xl bg-gray-300 text-gray-600 cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Invalid Order Amount
        </button>
      )}
    </div>
  );
};

export default RazorpayPayment;