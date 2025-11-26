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
import { useBillContext } from "../Context/BillContext";
import OrderSuccess from "./OrderSuccess";
import OrderFailed from "./OrderFailed";
import OrderLoading from "./OrderLoading";

const OrderConfirmation = () => {
  const {
    formData,
    selectedOffer,
    resetOrder,
    navigate,
    setIsOrderPlaced,
    isOrderPlaced,
    paymentMethod,
  } = useOrderContext();

  const {
    orderType,
    isCustomOrder,
    isBasketOrder,
    displayItems,
    packageName,
    totalAmount,
    orderCount,
    generateOrderId,
    customCalculations,
    basketCalculations,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
  } = useBillContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [savedOrderData, setSavedOrderData] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // ✅ CRITICAL: Check for saved order on mount and immediately show success
  useEffect(() => {
    const orderDataFromStorage = sessionStorage.getItem("lastOrderData");
    console.log("🔍 Checking sessionStorage on mount:", orderDataFromStorage);
    
    if (orderDataFromStorage) {
      try {
        const parsedData = JSON.parse(orderDataFromStorage);
        console.log("✅ Found order data:", parsedData);
        setSavedOrderData(parsedData);
        // ✅ Immediately set order as placed to show success page
        setIsOrderPlaced(true);
      } catch (error) {
        console.error("❌ Error parsing order data:", error);
      }
    } else {
      console.log("ℹ️ No saved order data found");
    }
  }, []); // ✅ Run only once on mount

  // Redirect if no order type and no saved order data
  useEffect(() => {
    if (!orderType && !savedOrderData && !isOrderPlaced) {
      console.log("⚠️ No order data, redirecting to home");
      navigate("/");
      window.scrollTo(0, 0);
    }
  }, [orderType, savedOrderData, isOrderPlaced, navigate]);

  const handleNewOrder = () => {
    console.log("🔄 Clearing order data and resetting");
    sessionStorage.removeItem("lastOrderData");
    sessionStorage.removeItem("orderJustPlaced");
    localStorage.removeItem("orderSummary");
    localStorage.removeItem("vegbazar_cart");
    setIsOrderPlaced(false);
    setSavedOrderData(null);
    resetOrder();
  };

  // Calculate total savings for basket orders
  const totalSavings = useMemo(() => {
    if (!isBasketOrder || !basketCalculations) return 0;
    return basketCalculations.savings || 0;
  }, [isBasketOrder, basketCalculations]);

  // Prepare order data
  const orderData = useMemo(() => {
    // ✅ PRIORITY: Use saved order data from VegetableCart (COD)
    if (savedOrderData) {
      console.log("📦 Using saved order data:", savedOrderData);
      return savedOrderData;
    }

    // Otherwise, prepare order data for basket orders
    const orderId = generateOrderId(orderCount);

    if (isCustomOrder && customCalculations) {
      const items = customCalculations.items;

      return {
        orderId,
        orderType: "custom",
        customerInfo: formData || {},
        selectedVegetables: (items || []).map((item) => ({
          vegetable: item.id || item.vegetableId,
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          pricePerUnit:
            parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
          subtotal:
            (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
            (item.quantity || 0),
          isFromBasket: false,
        })),
        vegetablesTotal: customCalculations.vegetablesTotal,
        deliveryCharges: customCalculations.deliveryCharge,
        totalAmount: customCalculations.totalAmount,
        couponDiscount: customCalculations.couponDiscount || 0,
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
        selectedVegetables: displayItems || [],
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount ?? 0,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        deliveryCharges: deliveryCharge,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
      };
    }

    return { orderId, orderType: "unknown" };
  }, [
    savedOrderData,
    formData,
    selectedOffer,
    displayItems,
    orderCount,
    paymentMethod,
    isCustomOrder,
    isBasketOrder,
    totalAmount,
    customCalculations,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    generateOrderId,
  ]);

  // Submit Order (for basket orders only - custom COD already created)
  const handleSubmitOrder = useCallback(
    async (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);

      // If order already created (COD from VegetableCart), just show success
      if (savedOrderData) {
        console.log("✅ Order already exists, showing success");
        setIsOrderPlaced(true);
        return;
      }

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

        if (res.status >= 200 && res.status < 300) {
          sessionStorage.setItem("lastOrderData", JSON.stringify(orderData));
          setIsOrderPlaced(true);
        } else {
          setSubmitError("Order save failed. Try again.");
        }
      } catch (err) {
        console.error("Order submission error:", err);
        setSubmitError(err?.response?.data?.message || err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [executeRecaptcha, isSubmitting, orderData, setIsOrderPlaced, savedOrderData]
  );

  // Log state changes
  useEffect(() => {
    console.log("🔄 State Update:", {
      isOrderPlaced,
      hasSavedData: !!savedOrderData,
      isSubmitting,
      hasError: !!submitError,
    });
  }, [isOrderPlaced, savedOrderData, isSubmitting, submitError]);

  // ✅ RENDER LOGIC: Show success immediately if order is placed
  if (isOrderPlaced && orderData) {
    console.log("✅ Rendering OrderSuccess with data:", orderData);
    return (
      <OrderSuccess
        orderData={orderData}
        formData={formData}
        selectedOffer={selectedOffer}
        selectedVegetables={orderData.selectedVegetables || displayItems}
        onNewOrder={handleNewOrder}
      />
    );
  }

  if (isSubmitting) {
    console.log("⏳ Showing loading state");
    return <OrderLoading />;
  }
  
  if (submitError) {
    console.log("❌ Showing error:", submitError);
    return (
      <OrderFailed
        errorMessage={submitError}
        onRetry={() => setSubmitError(null)}
        onGoBack={() => {
          window.scrollTo(0, 0);
          navigate(savedOrderData || isCustomOrder ? "/veg-bag" : "/billing");
        }}
      />
    );
  }

  // Show confirmation form for basket orders
  console.log("📋 Showing confirmation form");
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 pt-20">
      <div className="max-w-5xl mx-auto px-4">
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

        <div className="bg-[#f0fcf6] rounded-xl shadow-lg overflow-hidden">
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

          <div className="p-5">
            {/* Order details here for basket orders */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">Order ID</p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {orderData.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">Full Name</p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {formData.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">Mobile Number</p>
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
                      <p className="text-xs text-gray-500 font-poppins">Email Address</p>
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
                      <p className="text-xs text-gray-500 font-poppins">Total Amount</p>
                      <p className="font-bold text-[#0e540b] text-lg">
                        ₹{totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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