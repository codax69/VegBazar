import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { apiCall } from "../utils/apiCall";
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
    setIsOrderPlaced,
    isOrderPlaced,
    paymentMethod,
  } = useOrderContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (!selectedOffer || !selectedVegetables.length) {
      navigate("/");
    }
  }, [selectedOffer, selectedVegetables, navigate]);

  const handleNewOrder = () => {
    resetOrder();
  };

  function generateOrderId() {
    const now = new Date();
    const datePart = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14);

    const millis = now.getMilliseconds().toString().padStart(3, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `ORD${datePart}${millis}${random}`;
  }

  const orderData = {
    customerInfo: formData,
    selectedOffer,
    selectedVegetables,
    orderDate: new Date().toISOString(),
    totalAmount: selectedOffer?.price ?? 0,
    orderId: generateOrderId(),
    paymentMethod,
  };

  const handleSubmitOrder = useCallback(async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      setSubmitError("reCAPTCHA not ready yet. Please wait a moment and try again.");
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Get reCAPTCHA v3 token
      const captchaToken = await executeRecaptcha('submit_order');
      
      if (!captchaToken) {
        throw new Error("Failed to generate reCAPTCHA token. Please refresh the page.");
      }

      console.log("Captcha token generated successfully");

      // Verify recaptcha with backend
      const recaptchaResponse = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/auth/recaptcha`,
        { 
          token: captchaToken,
          action: 'submit_order'
        }
      );

      if (!recaptchaResponse.data.success) {
        throw new Error(recaptchaResponse.data.message || "Captcha verification failed. Please try again.");
      }

      console.log("Captcha verified successfully", recaptchaResponse.data);

      // Submit to Google Sheets
      const result = await apiCall(orderData);

      // Submit to API
      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
        orderData
      );

      const okSheets =
        !!result && (result.success === true || result.status === "ok");
      const okApi = response && response.status >= 200 && response.status < 300;

      if (okSheets && okApi) {
        setIsOrderPlaced(true);
      } else {
        setSubmitError("Failed to save order. Please try again.");
      }
    } catch (err) {
      console.error(
        "Order submission error:",
        err?.response?.data || err?.message
      );
      
      // Better error handling
      let errorMessage = "An error occurred. Please try again.";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [executeRecaptcha, isSubmitting, orderData, setIsOrderPlaced]);

  // Loading State
  if (isSubmitting) {
    return <OrderLoading />;
  }

  // Error State
  if (submitError) {
    return (
      <OrderFailed 
        errorMessage={submitError} 
        onRetry={() => setSubmitError(null)}
        onGoBack={() => navigate("/billing")}
      />
    );
  }

  // Success State
  if (isOrderPlaced) {
    return (
      <OrderSuccess
        orderData={orderData}
        formData={formData}
        selectedOffer={selectedOffer}
        selectedVegetables={selectedVegetables}
        onNewOrder={handleNewOrder}
      />
    );
  }

  // Main Confirmation Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2 mb-6 text-gray-700 hover:text-[#0e540b] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0e540b] to-green-700 p-6 sm:p-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Package className="w-8 h-8 text-white" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Confirm Your Order
              </h2>
            </div>
            <p className="text-center text-green-100 text-sm">
              Review your order details before confirmation
            </p>
          </div>

          {/* Order Details */}
          <div className="p-6 sm:p-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 mb-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Order ID
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {orderData.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Full Name
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {formData.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Mobile Number
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {formData.mobile}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Email Address
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {formData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Package Selected
                      </p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {selectedOffer?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                        Total Amount
                      </p>
                      <p className="font-bold text-[#0e540b] text-lg sm:text-xl">
                        ₹{selectedOffer?.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vegetables Section */}
              <div className="mt-6 pt-6 border-t border-green-200">
                <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0e540b]" />
                  Selected Vegetables ({selectedVegetables.length} items)
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedVegetables.map((v, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm border border-green-200"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Address Section */}
            {formData.address && (
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">
                      Delivery Address
                    </p>
                    <p className="text-gray-700 text-sm">{formData.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* reCAPTCHA v3 Badge Info */}
            <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>
                  Protected by reCAPTCHA v3. 
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Privacy
                  </a>
                  {' '}-{' '}
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
              className="w-full bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Confirm & Place Order
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#0e540b]" />
            Your order information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;