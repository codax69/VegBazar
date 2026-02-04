import React, { useMemo, useCallback, memo, useState, useEffect } from "react";
import { useOrderContext } from "../Context/OrderContext";

import { useBillContext } from "../Context/BillContext";
import { useAuth } from "../Context/AuthProvider";
import RazorpayPayment from "./RazorpayPayment";
import CouponCodeSection from "./CouponCodeSection";
import AddressSection from "./AddressSection";
import axios from "axios";
import {
  FiPackage,
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiAlertCircle,
  FiArrowLeft,
  FiPercent,
} from "react-icons/fi";
import { LuBanknote } from "react-icons/lu";
import { BiLeaf } from "react-icons/bi";
import OrderLoading from "./OrderLoading";
import OrderFailed from "./OrderFailed";

const API_URL = import.meta.env.VITE_API_SERVER_URL;

// Memoized components for better performance
const PaymentMethodButton = memo(({ method, isActive, onClick }) => {
  const isOnline = method === "ONLINE";

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${isActive
        ? "border-[#023D01] bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
        : "border-gray-200 hover:border-[#023D01] hover:bg-gray-100"
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`size-4 rounded-full border-2 flex items-center justify-center ${isActive ? "border-[#0e540b]" : "border-gray-300"
              }`}
          >
            {isActive && <div className="size-2 rounded-full bg-[#0e540b]" />}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">
              {isOnline ? "Online Payment" : "Cash on Delivery"}
            </p>
            <p className="text-[10px] text-black">
              {isOnline ? "UPI, Cards, Net Banking" : "Pay when you receive"}
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
});

PaymentMethodButton.displayName = "PaymentMethodButton";

const TrustBadge = memo(({ icon: Icon, title, desc }) => (
  <div className="space-y-1">
    <Icon className="size-6 text-green-600 mx-auto" />
    <p className="text-xs font-semibold font-poppins text-gray-800">{title}</p>
    <p className="text-[10px] font-assistant text-gray-500">{desc}</p>
  </div>
));

TrustBadge.displayName = "TrustBadge";

const VegetableTag = memo(({ name, price }) => (
  <div className="bg-gradient-to-r font-assistant from-green-100 to-emerald-100 text-[#0e540b] px-2.5 py-1 rounded-lg font-medium text-xs border border-green-200">
    {name} - ₹{price}
  </div>
));

VegetableTag.displayName = "VegetableTag";

const BillingPage = () => {
  const {
    selectedOffer,
    selectedVegetables,
    formData,
    navigate,
    paymentMethod,
    setPaymentMethod,
    setIsOrderPlaced,
  } = useOrderContext();

  const {
    isBasketOrder,
    basketCalculations,
    totalAmount,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    handleApplyCoupon,
    handleRemoveCoupon,
  } = useBillContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderCount, setOrderCount] = useState(null);

  const [isLoadingOrderCount, setIsLoadingOrderCount] = useState(true);
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);

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

  const handleChangeAddress = useCallback(() => navigate("/address"), [navigate]);

  // Generate Order ID function
  const generateOrderId = useCallback((count) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(count).padStart(3, "0");
    return `ORD${year}${month}${day}${orderNum}`;
  }, []);

  // Fetch order count on mount
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        setIsLoadingOrderCount(true);
        const res = await axios.get(`${API_URL}/api/orders/all`);
        setOrderCount(res.data?.data.count + 1);
      } catch (err) {
        console.error("Error fetching order count:", err);
        // Fallback: use timestamp-based ID if fetch fails
        setOrderCount(Date.now() % 1000);
      } finally {
        setIsLoadingOrderCount(false);
      }
    };

    fetchOrderCount();
  }, []);

  // Redirect if no basket order
  useEffect(() => {
    if (!isBasketOrder || !selectedOffer || selectedVegetables.length === 0) {
      window.scrollTo(0, 0);
      navigate("/offers");
    }
  }, [isBasketOrder, selectedOffer, selectedVegetables, navigate]);

  const calculations = basketCalculations;

  // Order Data - Memoized with all dependencies
  const orderData = useMemo(() => {
    if (!orderCount) return null;

    const orderId = generateOrderId(orderCount);
    return {
      orderId,
      customerInfo: formData || {},
      selectedOffer: selectedOffer || {},
      orderType: "basket",
      selectedVegetables: selectedVegetables || [],
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      couponCode: appliedCoupon?.code || null,
      couponDiscount: couponDiscount || 0,
      deliveryCharges: deliveryCharge,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",

      orderStatus: "placed",
      deliveryAddressId: selectedAddress?._id || null,
    };
  }, [
    orderCount,
    formData,
    selectedOffer,
    selectedVegetables,
    totalAmount,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    paymentMethod,

    generateOrderId,
    selectedAddress,
  ]);

  const handleCOD = useCallback(
    async (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);

      if (!orderData) {
        setSubmitError("Order data not ready. Please wait.");
        return;
      }

      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitError(null);

      if (paymentMethod === "COD" && !selectedAddress) {
        setSubmitError("Please select a delivery address");
        setIsSubmitting(false);
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/api/orders/create-order`,
          orderData
        );

        if (res.status >= 200 && res.status < 300) {
          setIsOrderPlaced(true);
          // Navigate with order data in state
          navigate("/billing-success", {
            state: { orderData: orderData }
          });
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
    [isSubmitting, orderData, setIsOrderPlaced, navigate]
  );

  // Memoized handlers
  const handleBack = useCallback(() => {
    window.scrollTo(0, 0);
    navigate("/select-vegetables");
  }, [navigate]);

  const handlePaymentMethodChange = useCallback(
    (method) => {
      setPaymentMethod(method);
    },
    [setPaymentMethod]
  );

  // Trust badges data
  const trustBadges = useMemo(
    () => [
      { icon: FiCheckCircle, title: "Fresh", desc: "Quality Guaranteed" },
      { icon: FiTruck, title: "Same Day Delivery", desc: "7 to 10 AM" },
      { icon: FiShield, title: "Safe Payment", desc: "Encrypted & Secure" },
    ],
    []
  );

  // Redirect if no offer selected
  if (!selectedOffer || selectedVegetables.length === 0) {
    return null;
  }

  // Loading and Error States
  if (isSubmitting) return <OrderLoading loadingText="Placing order...." loadingMsg="Please wait while we confirm your order..." />;
  if (isLoadingOrderCount) return <OrderLoading loadingText="Loading" />;
  if (submitError)
    return (
      <OrderFailed
        errorMessage={submitError}
        onRetry={() => setSubmitError(null)}
        onGoBack={() => {
          window.scrollTo(0, 0);
          navigate("/select-vegetables");
        }}
      />
    );

  return (
    <div className="min-h-screen bg-[#ffffff] pt-8 md:pt-20 pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 mb-3 text-gray-700 hover:text-[#0e540b] transition-colors group"
          aria-label="Go back to select vegetables"
        >
          <FiArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium font-assistant text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-amiko sm:text-2xl font-bold text-[#0e540b] mb-1">
            Checkout
          </h1>
          <p className="text-xs font-assistant text-gray-600">
            Review your order and complete payment
          </p>
        </div>

        {/* Coupon Section - Mobile (Before Bill Summary) */}
        <div className="md:hidden lg:hidden mb-4">
          <CouponCodeSection
            onApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            subtotal={calculations.vegBazarTotal}
            isMobile={true}
          />
        </div>

        {/* Top Bill Summary - Prominent Display */}
        <div className="md:hidden lg:hidden bg-gradient-to-r from-[#0e540b] to-green-700 text-white rounded-2xl shadow-2xl p-6 mb-6 border-2 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-poppins flex items-center gap-2">
              <FiShield className="size-5" />
              Order Summary
            </h2>
            {calculations.savings > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <FiPercent className="size-4" />
                <span className="text-sm font-bold">
                  Save {calculations.savingsPercentage}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Plan Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-assistant opacity-90">
                Plan Price
              </span>
              <span className="text-lg font-bold font-assistant">
                ₹{calculations.vegBazarTotal}
              </span>
            </div>

            {/* Market Price */}
            {calculations.marketTotal > calculations.vegBazarTotal && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-assistant opacity-90">
                  Market Price
                </span>
                <span className="text-base font-assistant line-through opacity-75">
                  ₹{calculations.marketTotal.toFixed(2)}
                </span>
              </div>
            )}

            {/* Coupon Discount */}
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-sm font-assistant font-semibold">
                  Coupon Discount
                </span>
                <span className="text-lg font-bold font-assistant text-green-200">
                  -₹{couponDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Savings */}
            {calculations.savings > 0 && (
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-sm font-assistant font-semibold">
                  Total Savings
                </span>
                <span className="text-lg font-bold font-assistant text-green-200">
                  ₹{calculations.savings.toFixed(2)}
                </span>
              </div>
            )}

            {/* Delivery Charge */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-assistant opacity-90">
                Delivery Charge
              </span>
              <span className="text-base font-assistant">
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-white/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold font-assistant">
                  Total Amount
                </span>
                <span className="text-3xl font-bold font-assistant">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-3">
            {/* Selected Plan */}
            <div className="bg-[#f0fcf6] text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-poppins font-bold text-gray-800 flex items-center gap-1.5">
                  <FiPackage className="size-4 text-[#0e540b]" />
                  Your Plan
                </h2>
                <span className="bg-green-100 font-poppins text-green-800 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                  {selectedOffer.title}
                </span>
              </div>
              <div className="bg-[#ffff] rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-xs">Plan Value</p>
                  <p className="text-xl font-bold font-assistant text-[#0e540b]">
                    ₹{selectedOffer.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Vegetables */}
            <div className="bg-[#f5f5f5] text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-poppins font-bold text-gray-800 flex items-center gap-1.5">
                  <BiLeaf className="size-4 text-[#0e540b]" />
                  Selected Vegetables
                </h2>
                <span className="text-xs font-assistant text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedVegetables.length} items
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedVegetables.map((veg, i) => (
                  <VegetableTag
                    key={`${veg.id || veg._id}-${i}`}
                    name={veg.name}
                    price={calculations.pricePerVegetable.toFixed(2)}
                  />
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#ffffff] text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
              <h2 className="text-base font-poppins font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <FiCreditCard className="size-4 text-[#0e540b]" />
                Payment Method
              </h2>
              <div className="space-y-2 mb-4">
                <AddressSection
                  defaultAddress={defaultAddress}
                  onChangeAddress={handleChangeAddress}
                  user={user}
                />
              </div>

              <div className="space-y-2">
                <PaymentMethodButton
                  method="ONLINE"
                  isActive={paymentMethod === "ONLINE"}
                  onClick={() => handlePaymentMethodChange("ONLINE")}
                />
                <PaymentMethodButton
                  method="COD"
                  isActive={paymentMethod === "COD"}
                  onClick={() => handlePaymentMethodChange("COD")}
                />
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

          {/* Right Section - Desktop Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-[#ffffff] text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100 lg:sticky lg:top-4 space-y-3">
              {/* Coupon Section - Desktop (Top of sidebar) */}
              <CouponCodeSection
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                subtotal={calculations.vegBazarTotal}
                isMobile={false}
              />

              {/* Quick Summary */}
              <div>
                <h2 className="text-base font-poppins font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <FiShield className="size-4 text-[#0e540b]" />
                  Quick Summary
                </h2>

                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-assistant">Plan Price</span>
                    <span className="font-semibold font-assistant text-gray-800">
                      ₹{selectedOffer.price}
                    </span>
                  </div>

                  {/* Coupon Discount */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between font-assistant text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                      <span className="font-semibold">Coupon Discount</span>
                      <span className="font-bold">
                        -₹{couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-assistant text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-gray-800">
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>

                  {calculations.savings > 0 && (
                    <div className="flex justify-between font-assistant text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                      <span className="font-semibold">Total Savings</span>
                      <span className="font-bold">
                        ₹{calculations.savings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between items-center">
                    <span className="font-bold font-assistant text-gray-800">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-[#0e540b]">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="space-y-2 mt-3">
                  {paymentMethod === "ONLINE" && orderData && (
                    <RazorpayPayment
                      orderType="basket"
                      couponCode={appliedCoupon?.code}
                      deliveryAddress={selectedAddress}
                    />
                  )}
                  {paymentMethod === "COD" && (
                    <button
                      onClick={handleCOD}
                      disabled={!orderData}
                      className="w-full py-2.5 rounded-xl font-assistant bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Order
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
        </div>

        {/* Trust Badges */}
        <div className="mt-4 bg-[#ffffff] text-[#023D01] rounded-xl shadow-lg p-4 border border-green-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            {trustBadges.map((badge, i) => (
              <TrustBadge
                key={i}
                icon={badge.icon}
                title={badge.title}
                desc={badge.desc}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#ffffff] border-t border-gray-200 shadow-2xl z-50">
        <div className="px-4 py-3">
          {/* Bill Summary - Compact */}
          <div className="space-y-1 mb-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-assistant">Total Amount</span>
              <span className="text-xl font-bold text-[#0e540b]">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            {calculations.savings > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-assistant">You save</span>
                <span className="text-green-600 font-semibold font-assistant">
                  ₹{calculations.savings.toFixed(2)} (
                  {calculations.savingsPercentage}%)
                </span>
              </div>
            )}
          </div>

          {/* Payment Button */}
          {paymentMethod === "ONLINE" && orderData && (
            <div className="w-full">
              <RazorpayPayment
                orderType="basket"
                couponCode={appliedCoupon?.code}
                deliveryAddress={selectedAddress}
              />
            </div>
          )}
          {paymentMethod === "COD" && (
            <button
              onClick={handleCOD}
              disabled={!orderData}
              className="w-full py-3 rounded-xl font-assistant bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order - ₹{totalAmount.toFixed(2)}
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