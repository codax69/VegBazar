import React from "react";
import { useOrderContext } from "../Context/OrderContext";
import RazorpayPayment from "./RazorpayPayment";
import {
  FiPackage,
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { LuBanknote } from "react-icons/lu";
import { BiLeaf } from "react-icons/bi";

const BillingPage = () => {
  const {
    selectedOffer,
    selectedVegetables,
    navigate,
    paymentMethod,
    setPaymentMethod,
  } = useOrderContext();

  const deliveryCharge = 20;

  if ((!selectedOffer || selectedVegetables.length === 0)) {
    window.scrollTo(0, 0);
    navigate("/offers");
    return null;
  }

  const pricePerVegetable = selectedOffer?.price / selectedVegetables.length || 0;
  const vegBazarTotal = selectedOffer?.price || 0;
  const marketTotal = selectedVegetables.reduce(
    (sum, veg) => sum + (veg.marketPrice || veg.price || 0),
    0
  );

  // eslint-disable-next-line no-unused-vars
  const savings = marketTotal - vegBazarTotal;
  const totalAmount = selectedOffer?.price + deliveryCharge;

  const handleCOD = async () => {
    window.scrollTo(0, 0);
    navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-20 pb-24 lg:pb-0">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            navigate(window.history());
          }}
          className="flex items-center gap-1.5 mb-3 text-gray-700 hover:text-[#0e540b] transition-colors group"
        >
          <FiArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium font-assistant text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-amiko sm:text-2xl font-bold text-[#0e540b] mb-1">
            Checkout
          </h1>
          <p className="text-xs font-assistant  text-gray-600">
            Review your order and complete payment
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-3">
            {/* Selected Plan */}
            <div className="bg-white text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-poppins font-bold text-gray-800 flex items-center gap-1.5">
                  <FiPackage className="size-4 text-[#0e540b]" />
                  Your Plan
                </h2>
                <span className="bg-green-100 font-poppins text-green-800 px-2.5 py-0.5 rounded-full text-md font-semibold">
                  {selectedOffer.title}
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-xs">Plan Value</p>
                  <p className="text-xl font-bold font-assistant text-[#0e540b]">
                    ₹{selectedOffer.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Vegetables */}
            <div className="bg-white text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <h2 className="text-base font-poppins font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <BiLeaf className="size-4 text-[#0e540b]" />
                Selected Vegetables
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {selectedVegetables.map((veg, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r font-assistant from-green-100 to-emerald-100 text-[#0e540b] px-2.5 py-1 rounded-lg font-medium text-xs border border-green-200"
                  >
                    {veg.name} - ₹{pricePerVegetable.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <h2 className="text-base font-poppins font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <FiCreditCard className="size-4 text-[#0e540b]" />
                Payment Method
              </h2>

              <div className="space-y-2">
                {["ONLINE", "COD"].map((method) => {
                  const isActive = paymentMethod === method;
                  const isOnline = method === "ONLINE";
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        isActive
                          ? "border-[#023D01] bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
                          : "border-gray-200 hover:border-[#023D01] hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`size-4 rounded-full border-2 flex items-center justify-center ${
                              isActive
                                ? "border-[#0e540b]"
                                : "border-gray-300"
                            }`}
                          >
                            {isActive && (
                              <div className="size-2 rounded-full bg-[#0e540b]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {isOnline ? "Online Payment" : "Cash on Delivery"}
                            </p>
                            <p className="text-[10px] text-black">
                              {isOnline
                                ? "UPI, Cards, Net Banking"
                                : "Pay when you receive"}
                            </p>
                          </div>
                        </div>
                        {isOnline ? (
                          <FiCreditCard className="size-5 text-[#0e540b]" />
                        ) : (
                          <LuBanknote className="size-5 text-[#0e540b]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!paymentMethod && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-1.5">
                  <FiAlertCircle className="size-3.5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-assistant text-red-600">
                    Please select a payment method to continue
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Desktop Only */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100 lg:sticky lg:top-4">
              <h2 className="text-base font-poppins font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <FiShield className="size-4 text-[#0e540b]" />
                Bill Summary
              </h2>

              <div className="space-y-2 mb-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Plan Price</span>
                  <span className="font-semibold font-assistant text-gray-800">
                    ₹{selectedOffer.price}
                  </span>
                </div>
                <div className="flex justify-between font-assistant text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-800">
                    ₹{deliveryCharge}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between items-center">
                  <span className="font-bold font-assistant text-gray-800">Total Amount</span>
                  <span className="text-xl font-bold text-[#0e540b]">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <div className="space-y-2 mt-3">
                {paymentMethod === "ONLINE" && <RazorpayPayment orderType="basket" />}
                {paymentMethod === "COD" && (
                  <button
                    onClick={handleCOD}
                    className="w-full py-2.5 rounded-xl font-assistant bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Place Order - ₹{totalAmount}
                  </button>
                )}
                {!paymentMethod && (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-assistant bg-gray-300 text-gray-500 font-bold cursor-not-allowed"
                  >
                    Select Payment Method
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center font-assistant justify-center space-x-1.5 text-[10px] text-gray-500">
                <FiLock className="size-3" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 bg-white text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: FiCheckCircle, title: "Fresh", desc: "Quality Guaranteed" },
              { icon: FiTruck, title: "Same Day Delivery", desc: "4–5 PM" },
              { icon: FiShield, title: "Safe Payment", desc: "Encrypted & Secure" },
            // eslint-disable-next-line no-unused-vars
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="space-y-1">
                <Icon className="size-6 text-green-600 mx-auto" />
                <p className="text-xs font-semibold font-poppins text-gray-800">{title}</p>
                <p className="text-[10px] font-assistant text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="px-4 py-3">
          {/* Bill Summary - Compact */}
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-600 font-assistant">Total Amount</span>
            <span className="text-lg font-bold text-[#0e540b]">₹{totalAmount}</span>
          </div>

          {/* Payment Button */}
          {paymentMethod === "ONLINE" && (
            <div className="w-full">
              <RazorpayPayment orderType="basket" />
            </div>
          )}
          {paymentMethod === "COD" && (
            <button
              onClick={handleCOD}
              className="w-full py-3 rounded-xl font-assistant bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg active:scale-95"
            >
              Place Order - ₹{totalAmount}
            </button>
          )}
          {!paymentMethod && (
            <button
              disabled
              className="w-full py-3 rounded-xl font-assistant bg-gray-300 text-gray-500 font-bold cursor-not-allowed"
            >
              Select Payment Method
            </button>
          )}

          {/* Secure Badge */}
          <div className="mt-2 flex items-center font-assistant justify-center space-x-1.5 text-[10px] text-gray-500">
            <FiLock className="size-3" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;