import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  MapPin,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";
import { useWallet } from "../Context/WalletContext";
import CashbackModal from "./CashbackModal";

const BillingSuccess = ({ onNewOrder }) => {
  const location = useLocation();
  const { navigate } = useOrderContext();
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);

  // Get orderData from navigation state
  const orderData = location.state?.orderData;
  // console.log(orderData);

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate("/offers");
    }
  }, [orderData, navigate]);

  // Show cashback modal if cashback exists
  useEffect(() => {
    if (orderData?.cashback && orderData.cashback > 0) {
      // Refresh wallet balance to get updated amount
      refreshBalance();
      // Show modal after a short delay
      setTimeout(() => {
        setShowCashbackModal(true);
      }, 500);
    }
  }, [orderData, refreshBalance]);

  // Extract customer info with user data fallback
  const customerInfo = useMemo(() => {
    if (user) {
      return {
        name: user.username || user.name || orderData?.customerInfo?.name || "N/A",
        mobile: user.phone || user.mobile || orderData?.customerInfo?.mobile || "N/A",
        email: user.email || orderData?.customerInfo?.email || null,
        address: orderData?.customerInfo?.address || null,
        area: orderData?.customerInfo?.area || null,
        city: orderData?.customerInfo?.city || null,
      };
    }
    return orderData?.customerInfo || {};
  }, [user, orderData]);

  // Helper function to get vegetable name
  const getVegetableName = (veg) => {
    if (!veg) return "Unknown";

    if (veg.name) return veg.name;

    if (veg.vegetable && veg.vegetable.name) return veg.vegetable.name;

    if (typeof veg === "string") return veg;

    return "Unknown Vegetable";
  };

  // Format vegetables for display
  const displayVegetables = useMemo(() => {
    const vegsToDisplay = orderData?.selectedVegetables || [];

    if (!vegsToDisplay || vegsToDisplay.length === 0) return [];

    return vegsToDisplay.map((veg, index) => {
      // Handle nested vegetable object structure from API
      const vegData = veg.vegetable || veg;

      return {
        key: `veg-${index}`,
        name: getVegetableName(veg),
        quantity: veg?.quantity || 1,
        weight: veg?.weight || vegData?.weight || "N/A",
        price: veg?.pricePerUnit || veg?.price || 0,
        subtotal: veg?.subtotal || (veg?.pricePerUnit || veg?.price || 0) * (veg?.quantity || 1),
      };
    });
  }, [orderData?.selectedVegetables]);

  // Calculate order summary from orderData
  const orderInfo = useMemo(() => {
    if (!orderData) {
      return {
        orderId: "N/A",
        orderType: "basket",
        packageTitle: "N/A",
        subtotal: 0,
        discount: 0,
        delivery: 0,
        totalAmount: 0,
        selectedVegetables: [],
      };
    }

    const {
      orderId = "N/A",
      orderType = "basket",
      vegetablesTotal = 0,
      couponDiscount = 0,
      deliveryCharges = 0,
      totalAmount = 0,
      selectedVegetables = [],
      selectedOffer = {},
    } = orderData;

    // Determine package title
    const packageTitle =
      orderType === "custom"
        ? "Custom Selection"
        : orderType === "basket"
          ? selectedOffer?.title || "Basket Package"
          : "N/A";

    const result = {
      orderId,
      orderType,
      packageTitle,
      subtotal: vegetablesTotal || selectedOffer?.price || 0,
      discount: couponDiscount,
      delivery: deliveryCharges,
      totalAmount,
      selectedVegetables,
      price: selectedOffer?.price || 0,
    };

    // console.log("orderInfo object:", result);

    return result;
  }, [orderData]);

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderInfo.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle new order
  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    }
    navigate("/");
    window.scrollTo(0, 0);
  };

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center py-6 px-3 sm:px-4 pt-20">
      <div className="max-w-2xl w-full bg-[#f0fcf6] p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-[#0e540b] animate-pulse" />
          </div>
          <h2 className="text-xl font-amiko sm:text-2xl md:text-3xl font-bold text-[#0e540b] mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-sm sm:text-base font-funnel text-gray-600">
            Thank you for your order
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl mb-6 border border-green-200">
          <h3 className="font-bold text-base font-funnel sm:text-lg mb-4 text-[#0e540b] flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0" />
            Order Summary
          </h3>

          {/* Customer & Order Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            {/* Order ID with Copy Button */}
            <div className="flex items-start gap-2 sm:col-span-2">
              <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  Order ID
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 font-funnel break-all">
                    {orderInfo.orderId}
                  </span>
                  {orderInfo.orderId && orderInfo.orderId !== "N/A" && (
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1.5 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-funnel mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Order ID copied!
                  </p>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  Customer Name
                </p>
                <p className="font-semibold text-gray-800 font-funnel break-words">
                  {customerInfo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  Mobile
                </p>
                <p className="font-semibold text-gray-800 font-funnel">
                  {customerInfo?.mobile || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            {customerInfo?.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-funnel text-gray-500">
                    Email
                  </p>
                  <p className="font-semibold text-gray-800 font-funnel truncate">
                    {customerInfo.email}
                  </p>
                </div>
              </div>
            )}

            {/* Package/Order Type */}
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  {orderInfo.orderType === "custom" ? "Order Type" : "Package"}
                </p>
                <p className="font-semibold text-gray-800 font-funnel break-words">
                  {orderInfo.packageTitle}
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  Total Amount
                </p>
                <p className="font-bold text-[#0e540b] text-lg sm:text-xl">
                  ₹{orderInfo.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-assistant text-yellow-700">
              <strong>Important:</strong> Please save your Order ID for tracking.
              We send order confirmations via email.
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">Plan Price</span>
                <span className="font-assistant font-semibold text-gray-800">
                  ₹{orderInfo.price.toFixed(2)}
                </span>
              </div>

              {orderInfo.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-assistant">Coupon Discount</span>
                  <span className="font-assistant font-semibold">
                    -₹{orderInfo.discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">
                  Delivery Charge
                </span>
                <span className="font-assistant font-semibold text-gray-800">
                  {orderInfo.delivery === 0
                    ? "FREE"
                    : `₹${orderInfo.delivery.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-funnel font-bold text-gray-800">
                    Total
                  </span>
                  <span className="font-amiko font-bold text-[#0e540b] text-lg">
                    ₹{orderInfo.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address - if available */}
          {customerInfo?.address && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-funnel text-gray-500 mb-1">
                    Delivery Address
                  </p>
                  <p className="text-sm font-assistant text-gray-700 break-words">
                    {customerInfo.address}
                    {customerInfo.area && `, ${customerInfo.area}`}
                    {customerInfo.city && `, ${customerInfo.city}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Vegetables Section */}
          {displayVegetables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="font-semibold font-funnel text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4 text-[#0e540b] flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>

              {/* Custom Orders - Detailed list */}
              {orderInfo.orderType === "custom" ? (
                <div className="space-y-2">
                  {displayVegetables.map((veg) => (
                    <div
                      key={veg.key}
                      className="bg-[#f0fcf6] p-2 sm:p-3 rounded-lg border border-green-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800 font-assistant text-sm break-words">
                          {veg.name}
                        </span>
                        {veg.weight && veg.weight !== "N/A" && (
                          <span className="text-xs text-gray-600 font-assistant ml-2">
                            ({veg.weight})
                          </span>
                        )}
                      </div>
                      {veg.quantity && veg.price > 0 && (
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-gray-600 font-assistant">
                            ₹{parseFloat(veg.price).toFixed(2)} × {veg.quantity}
                          </div>
                          <div className="font-semibold text-green-700 text-sm font-assistant">
                            ₹{veg.subtotal.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Basket Orders - Simple tags */
                <div className="flex flex-wrap gap-2">
                  {displayVegetables.map((veg) => (
                    <span
                      key={veg.key}
                      className="bg-green-100 font-assistant text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-funnel font-medium border border-green-200"
                    >
                      {veg.name}
                      {veg.weight && veg.weight !== "N/A" && ` (${veg.weight})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Status Badge */}
        {orderData?.paymentStatus && (
          <div className="mb-6 p-4 rounded-xl border-l-4 border-green-600 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 font-assistant text-sm sm:text-base">
                  Payment Status:{" "}
                  <span className="capitalize text-green-700">
                    {orderData.paymentStatus.replace("_", " ")}
                  </span>
                </p>
                {orderData.paymentMethod && (
                  <p className="text-xs sm:text-sm text-gray-600 font-assistant mt-1">
                    Payment Method:{" "}
                    <span className="font-semibold">
                      {orderData.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : orderData.paymentMethod === "ONLINE"
                          ? "Online Payment"
                          : orderData.paymentMethod}
                    </span>
                  </p>
                )}
                {orderData.razorpayPaymentId && (
                  <p className="text-xs text-gray-500 font-assistant mt-1">
                    Payment ID: {orderData.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps Card */}
        {/* <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 font-assistant mb-1 text-sm sm:text-base">
                Next Steps
              </p>
              <p className="text-gray-700 text-xs sm:text-sm font-assistant">
                Your order has been received and will be processed shortly. You
                will receive a confirmation call on{" "}
                <strong className="text-gray-900">
                  {customerInfo?.mobile || "your registered number"}
                </strong>{" "}
                within 30 minutes.
              </p>
            </div>
          </div>
        </div> */}

        {/* Place Another Order Button */}
        <button
          onClick={handleNewOrder}
          className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base font-assistant"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          Place Another Order
        </button>
      </div>

      {/* Cashback Modal */}
      <CashbackModal
        isOpen={showCashbackModal}
        cashbackAmount={orderData?.cashback || 0}
        newBalance={balance}
        onClose={() => setShowCashbackModal(false)}
      />
    </div>
  );
};

export default BillingSuccess;