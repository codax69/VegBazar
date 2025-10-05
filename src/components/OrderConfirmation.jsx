import React, { useState, useEffect } from "react";
import axios from "axios";
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { apiCall } from "../utils/apiCall";
import ReCAPTCHA from "react-google-recaptcha";

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
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
  };

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Check captcha first
    if (!captchaValue) {
      setSubmitError("Please complete the captcha verification");
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Verify recaptcha with backend
      const recaptchaResponse = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/auth/recaptcha`,
        { captchaToken: captchaValue }
      );

      if (!recaptchaResponse.data.success) {
        throw new Error("Captcha verification failed");
      }

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
      setSubmitError(
        err?.response?.data?.message ?? "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-16 w-16 text-[#0e540b] animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Processing Your Order
          </h3>
          <p className="text-gray-600">
            Please wait while we confirm your order...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (submitError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Order Submission Failed
          </h2>
          <p className="text-gray-600 mb-6">{submitError}</p>
          <button
            onClick={() => {
              setSubmitError(null);
              setCaptchaValue(null);
            }}
            className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-[#0e540b] animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0e540b] mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-200">
            <h3 className="font-bold text-lg mb-4 text-[#0e540b] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Summary
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-800">
                    {orderData.orderId}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Customer Name</p>
                  <p className="font-semibold text-gray-800">{formData.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Mobile</p>
                  <p className="font-semibold text-gray-800">
                    {formData.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 truncate">
                    {formData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Package</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOffer.title}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-bold text-[#0e540b] text-lg">
                    ₹{selectedOffer.price}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0e540b]" />
                Selected Vegetables ({selectedVegetables.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedVegetables.map((veg, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-green-200"
                  >
                    {veg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">Next Steps</p>
                <p className="text-gray-700 text-sm">
                  Your order has been received and will be processed shortly.
                  You will receive a confirmation call on{" "}
                  <strong>{formData.mobile}</strong> within 30 minutes.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNewOrder}
            className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

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
                        ₹{selectedOffer?.price + 20}
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

            {/* ReCAPTCHA */}
            <div className="flex justify-center mb-6">
              <ReCAPTCHA
                sitekey={import.meta.env.RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !captchaValue}
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