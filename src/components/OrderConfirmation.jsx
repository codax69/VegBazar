import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  CheckCircle,
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShoppingBag,
  Shield,
  TrendingDown,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import OrderSuccess from "./OrderSuccess";
import OrderFailed from "./OrderFailed";
import OrderLoading from "./OrderLoading";

const OrderConfirmation = () => {
  const {
    formData,
    selectedOffer,
    selectedVegetables,
    resetOrder,
    navigate,
    vegetableOrder,
    setIsOrderPlaced,
    isOrderPlaced,
    paymentMethod,
  } = useOrderContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderCount, setOrderCount] = useState(1);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Helpers
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

  // Detect order type
  const orderType = useMemo(() => {
    const customItems = getOrderItems(vegetableOrder);
    if (customItems.length > 0) return "custom";
    if (selectedOffer && selectedVegetables.length > 0) return "basket";
    return null;
  }, [vegetableOrder, selectedOffer, selectedVegetables]);

  const isCustomOrder = orderType === "custom";
  const isBasketOrder = orderType === "basket";

  useEffect(() => {
    if (!orderType) {
      navigate("/");
      window.scrollTo(0, 0);
    }
  }, [orderType, navigate]);

  // Fetch daily order count
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/orders`
        );
        setOrderCount(res.data.data.count + 1);
      } catch (err) {
        console.error("Error fetching order count:", err);
      }
    };
    fetchOrderCount();
  }, []);

  const handleNewOrder = () => resetOrder();

  const generateOrderId = (count = 1) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(count).padStart(3, "0");
    return `ORD${year}${month}${day}${orderNum}`;
  };

  // 🧮 Fix — Robust total calculation
  const calculateCustomTotal = () => {
    const items = getOrderItems(vegetableOrder);
    const summary = getOrderSummary(vegetableOrder);

    // Prefer valid summary total if > 0
    if (summary?.totalAmount && summary.totalAmount > 0)
      return summary.totalAmount;

    // Otherwise calculate manually
    const subtotal = items.reduce((acc, item) => {
      const price =
        parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return acc + price * qty;
    }, 0);

    const delivery = summary?.deliveryCharges ?? 20;
    const total = subtotal + delivery;

    // Avoid showing only delivery charge
    return subtotal > 0 ? total : 0;
  };

  const calculateTotalSavings = () => {
    return selectedVegetables.reduce((t, v) => {
      const vegPrice = v.price || 0;
      const marketPrice = v.marketPrice || vegPrice;
      return t + (marketPrice - vegPrice);
    }, 0);
  };

  const totalSavings = calculateTotalSavings();

  const displayItems = useMemo(() => {
    if (isCustomOrder) return getOrderItems(vegetableOrder);
    if (isBasketOrder) return selectedVegetables;
    return [];
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedVegetables]);

  const packageName = useMemo(() => {
    if (isCustomOrder) return "Custom Selection";
    if (isBasketOrder && selectedOffer) return selectedOffer.title;
    return "N/A";
  }, [isCustomOrder, isBasketOrder, selectedOffer]);

  const totalAmount = useMemo(() => {
    if (isCustomOrder) return calculateCustomTotal();
    if (isBasketOrder && selectedOffer) return (selectedOffer.price || 0) + 20;
    return 0;
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedOffer]);

  // 🧱 Prepare order data
  const orderData = useMemo(() => {
    const orderId = generateOrderId(orderCount);

    if (isCustomOrder) {
      const items = getOrderItems(vegetableOrder);
      const summary = getOrderSummary(vegetableOrder);

      return {
        orderId,
        orderType: "custom",
        customerInfo: formData || {},
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
          (items || []).reduce((total, item) => {
            const price =
              parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
            return total + price * (item.quantity || 0);
          }, 0),
        deliveryCharges: summary?.deliveryCharges ?? 20,
        totalAmount: summary?.totalAmount ?? totalAmount ?? 0,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
        orderDate: new Date().toISOString(),
      };
    }

    if (isBasketOrder) {
      return {
        orderId,
        customerInfo: formData || {},
        selectedOffer: selectedOffer || {},
        orderType: "basket",
        selectedVegetables: selectedVegetables || [],
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount ?? 0,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
      };
    }

    // fallback — prevent null
    return { orderId, orderType: "unknown" };
  }, [
    formData,
    selectedOffer,
    selectedVegetables,
    vegetableOrder,
    orderCount,
    paymentMethod,
    isCustomOrder,
    isBasketOrder,
    totalAmount,
  ]);
  // console.log(orderData)

  // 🧾 Submit Order
  const handleSubmitOrder = useCallback(
    async (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);

      if (!executeRecaptcha) {
        setSubmitError("reCAPTCHA not ready. Try again shortly.");
        return;
      }

      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const captchaToken = await executeRecaptcha("submit_order");
        if (!captchaToken) throw new Error("Captcha not generated.");

        const captchaRes = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/verify-captcha`,
          { token: captchaToken, action: "submit_order" }
        );

        if (!captchaRes.data.success)
          throw new Error("Captcha verification failed.");

        const res = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
          orderData
        );

        if (res.status >= 200 && res.status < 300) setIsOrderPlaced(true);
        else setSubmitError("Order save failed. Try again.");
      } catch (err) {
        console.error("Order submission error:", err);
        setSubmitError(err?.response?.data?.message || err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [executeRecaptcha, isSubmitting, orderData, setIsOrderPlaced]
  );

  // States
  if (isSubmitting) return <OrderLoading />;
  if (submitError)
    return (
      <OrderFailed
        errorMessage={submitError}
        onRetry={() => setSubmitError(null)}
        onGoBack={() => {
          window.scrollTo(0, 0);
          navigate("/billing");
        }}
      />
    );
  if (isOrderPlaced)
    return (
      <OrderSuccess
        orderData={orderData}
        formData={formData}
        selectedOffer={selectedOffer}
        selectedVegetables={displayItems}
        onNewOrder={handleNewOrder}
      />
    );

  if (isSubmitting) {
    return <OrderLoading />;
  }

  if (submitError) {
    return (
      <OrderFailed
        errorMessage={submitError}
        onRetry={() => setSubmitError(null)}
        onGoBack={() => {
          window.scrollTo(0, 0);
          navigate("/billing");
        }}
      />
    );
  }

  if (isOrderPlaced) {
    return (
      <OrderSuccess
        orderData={orderData}
        formData={formData}
        selectedOffer={selectedOffer}
        selectedVegetables={displayItems}
        onNewOrder={handleNewOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 pt-20">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => {
            navigate(isCustomOrder ? "/veg-bag" : "/billing");
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 mb-3 text-gray-700 hover:text-[#0e540b] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium font-assistant text-sm">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0e540b] to-green-700 p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Package className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white font-amiko">
                Confirm Your Order
              </h2>
            </div>
            <p className="text-center text-green-100 text-xs font-assistant">
              Review your order details before confirmation
            </p>
          </div>

          {/* Order Details */}
          <div className="p-5">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Order ID
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {orderData.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Full Name
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {formData.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Mobile Number
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {formData.mobile}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-poppins">
                        Email Address
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm truncate">
                        {formData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        {isCustomOrder ? "Order Type" : "Package Selected"}
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {packageName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Total Amount
                      </p>
                      <p className="font-bold text-[#0e540b] text-lg">
                        ₹{totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section - Inline */}
              {formData.address && (
                <div className="mb-4 pb-4 border-b border-green-200">
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-[#0e540b] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins mb-0.5 font-poppins">
                        Delivery Address
                      </p>
                      <p className="text-gray-700 text-xs font-assistant">
                        {formData.address}, {formData.area}, {formData.city}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vegetables Section */}
              <div>
                <p className="font-semibold font-assistant text-gray-700 mb-2 flex items-center gap-2 text-sm">
                  <ShoppingBag className="w-4 h-4 text-[#0e540b]" />
                  {isCustomOrder
                    ? "Selected Vegetables"
                    : "Vegetables in Package"}{" "}
                  ({displayItems.length} items)
                </p>

                {isCustomOrder ? (
                  // Custom order - show items with quantities and prices
                  <div className="space-y-2 mb-3">
                    {displayItems.map((item, i) => {
                      const price =
                        parseFloat(item.pricePerUnit) ||
                        parseFloat(item.price) ||
                        0;
                      const itemTotal = price * item.quantity;
                      return (
                        <div
                          key={i}
                          className="bg-white p-2 rounded border border-green-200 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <span className="font-medium font-assistant text-gray-800 text-sm">
                              {item.name}
                            </span>
                            <span className="text-xs font-assistant text-gray-600 ml-2">
                              ({item.weight})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-assistant text-gray-600">
                              ₹{price.toFixed(2)} × {item.quantity}
                            </div>
                            <div className="font-semibold font-assistant text-green-700 text-sm">
                              ₹{itemTotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : isBasketOrder ? (
                  // Basket order - show vegetable names only
                  <div className="space-y-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-amber-700" />
                        <span className="font-semibold font-assistant text-amber-900 text-sm">
                          {selectedOffer?.title}
                        </span>
                      </div>
                      <div className="text-xs font-assistant text-amber-800">
                        Package Price: ₹{selectedOffer?.price || 0}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {displayItems.map((v, i) => (
                        <span
                          key={i}
                          className="bg-green-100 font-assistant text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-200"
                        >
                          {typeof v === "string" ? v : v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Total Savings - Only for basket orders */}
                {isBasketOrder && totalSavings > 0 && (
                  <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-poppins text-green-800 flex items-center gap-1.5 text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Total Savings (vs Market Price)
                      </span>
                      <span className="font-bold text-base font-assistant text-green-700">
                        ₹{Math.round(totalSavings)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Summary - For custom orders */}
                {isCustomOrder && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-200">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-assistant">
                          Vegetables Total
                        </span>
                        <span className="font-semibold">
                          ₹{(orderData.vegetablesTotal || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-assistant">
                          Delivery Charges
                        </span>
                        <span className="font-semibold">
                          ₹{(orderData.deliveryCharges || 20).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5 flex justify-between">
                        <span className="font-bold text-gray-800">
                          Total Amount
                        </span>
                        <span className="font-bold text-green-700 text-base font-assistant">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Summary - For basket orders */}
                {isBasketOrder && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-200">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-poppins">
                          Package Price
                        </span>
                        <span className="font-semibold font-assistant">
                          ₹{(selectedOffer?.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-poppins">
                          Delivery Charges
                        </span>
                        <span className="font-semibold font-assistant">
                          ₹20.00
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5 flex justify-between">
                        <span className="font-bold text-gray-800 font-poppins">
                          Total Amount
                        </span>
                        <span className="font-bold font-assistant text-green-700 text-base">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* reCAPTCHA v3 Badge Info */}
            <div className="bg-gray-50 p-2 rounded-lg mb-4 border border-gray-200">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-assistant">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>
                  Protected by reCAPTCHA v3.
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Privacy
                  </a>{" "}
                  -{" "}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terms
                  </a>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !executeRecaptcha}
              className="w-full bg-gradient-to-r font-assistant from-[#0e540b] to-green-700 text-white font-bold py-3 px-5 rounded-lg hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm & Place Order
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-3 text-center text-xs text-gray-600">
          <p className="flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#0e540b] font-assistant" />
            Your order information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
