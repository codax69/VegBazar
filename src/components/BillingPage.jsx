import React from "react";
import { useOrderContext } from "../Context/OrderContext";
import RazorpayPayment from "./RazorpayPayment";
import { Package, Leaf, CreditCard, Banknote, Lock, CheckCircle, Truck, Shield, AlertCircle, ArrowLeft } from "lucide-react";

const BillingPage = () => {
  const {
    selectedOffer,
    selectedVegetables,
    navigate,
    paymentMethod,
    setPaymentMethod,
  } = useOrderContext();

  const deliveryCharge = 20;
  const totalAmount = selectedOffer?.price + deliveryCharge;

  if (!selectedOffer || selectedVegetables.length === 0) {
    navigate("/offers");
    return null;
  }

  const handleCOD = async () => {
    navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/select-vegetables")}
          className="flex items-center gap-2 mb-4 sm:mb-6 text-gray-700 hover:text-[#0e540b] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0e540b] mb-2">
            Checkout
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Review your order and complete payment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Selected Plan Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0e540b]" />
                  Your Plan
                </h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  {selectedOffer.title}
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Plan Value</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0e540b]">₹{selectedOffer.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs sm:text-sm">Duration</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {selectedOffer.duration || "Monthly"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Vegetables Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
                <Leaf className="w-5 h-5 text-[#0e540b]" />
                <span>Selected Vegetables</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {selectedVegetables.length} items
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedVegetables.map((veg, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-green-100 to-emerald-100 text-[#0e540b] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm border border-green-200 hover:shadow-md transition-shadow"
                  >
                    {veg}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0e540b]" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === "ONLINE"
                      ? "border-[#0e540b] bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "ONLINE" ? "border-[#0e540b]" : "border-gray-300"
                      }`}>
                        {paymentMethod === "ONLINE" && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#0e540b]"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">Online Payment</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e540b]" />
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === "COD"
                      ? "border-[#0e540b] bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "COD" ? "border-[#0e540b]" : "border-gray-300"
                      }`}>
                        {paymentMethod === "COD" && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#0e540b]"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                    </div>
                    <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e540b]" />
                  </div>
                </button>
              </div>

              {!paymentMethod && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-600">
                    Please select a payment method to continue
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bill Summary - Right Side (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0e540b]" />
                Bill Summary
              </h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-gray-600">Plan Price</span>
                  <span className="font-semibold text-sm sm:text-base text-gray-800">₹{selectedOffer.price}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-gray-600">Delivery Charge</span>
                  <span className="font-semibold text-sm sm:text-base text-gray-800">₹{deliveryCharge}</span>
                </div>

                <div className="border-t-2 border-dashed border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#0e540b]">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Savings Badge */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 mb-4 border border-green-200 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 font-medium">
                  You're getting fresh vegetables delivered to your doorstep!
                </p>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                {paymentMethod === "ONLINE" && (
                  <RazorpayPayment />
                )}
                {paymentMethod === "COD" && (
                  <button
                    onClick={handleCOD}
                    className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    Place Order - ₹{totalAmount}
                  </button>
                )}
                {!paymentMethod && (
                  <button
                    disabled
                    className="w-full py-3 sm:py-4 rounded-xl bg-gray-300 text-gray-500 font-bold cursor-not-allowed text-sm sm:text-base"
                  >
                    Select Payment Method
                  </button>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">100% Fresh</p>
              <p className="text-xs text-gray-500">Quality Guaranteed</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Fast Delivery</p>
              <p className="text-xs text-gray-500">On Time, Every Time</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Safe Payment</p>
              <p className="text-xs text-gray-500">Secure & Encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;