import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const BillingSuccess = ({ onNewOrder }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  // Get orderData from navigation state
  const orderData = location.state?.orderData;

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate("/offers");
    }
  }, [orderData, navigate]);

  // Extract customer info
  const customerInfo = useMemo(() => {
    return orderData?.customerInfo || {};
  }, [orderData]);

  // Helper function to get vegetable name
  const getVegetableName = (veg) => {
    if (typeof veg === "string") return veg;
    if (typeof veg === "object" && veg?.name) return veg.name;
    return "Unknown Vegetable";
  };

  // Format vegetables for display
  const displayVegetables = useMemo(() => {
    const vegsToDisplay = orderData?.selectedVegetables || [];
    if (!vegsToDisplay || vegsToDisplay.length === 0) return [];

    return vegsToDisplay.map((veg, index) => ({
      key: index,
      name: getVegetableName(veg),
      weight: veg?.weight || "N/A",
    }));
  }, [orderData]);

  // Order billing info
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
      };
    }

    const subtotal = orderData.selectedOffer?.price || 0;
    const discount = orderData.couponDiscount || 0;
    const delivery = orderData.deliveryCharges || 20;
    const total = orderData.totalAmount || 0;

    return {
      orderId: orderData.orderId || "N/A",
      orderType: "basket",
      packageTitle: orderData.selectedOffer?.title || "N/A",
      subtotal,
      discount,
      delivery,
      totalAmount: total,
      paymentMethod: orderData.paymentMethod || "COD",
      paymentStatus: orderData.paymentStatus || "pending",
    };
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

  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    } else {
      navigate("/offers");
    }
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
          <p className="text-sm sm:text-base font-assistant text-gray-600">
            Thank you for your order
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-[#ffffff] p-4 sm:p-6 rounded-xl mb-6 border border-green-200">
          <h3 className="font-bold text-base font-poppins sm:text-lg mb-4 text-[#0e540b] flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0" />
            Order Summary
          </h3>

          {/* Customer & Order Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            {/* Order ID with Copy Button */}
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-poppins text-gray-500">
                    Order ID
                  </p>
                  <span className="font-semibold text-gray-800 font-assistant break-all">
                    {orderInfo.orderId}
                  </span>
                </div>
                {orderInfo.orderId && orderInfo.orderId !== "N/A" && (
                  <button
                    onClick={handleCopyOrderId}
                    className="ml-2 p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
                  Customer Name
                </p>
                <p className="font-semibold text-gray-800 font-assistant break-words">
                  {customerInfo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
                  Mobile
                </p>
                <p className="font-semibold text-gray-800 font-assistant">
                  {customerInfo?.mobile || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            {customerInfo?.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-poppins text-gray-500">
                    Email
                  </p>
                  <p className="font-semibold text-gray-800 font-assistant truncate">
                    {customerInfo.email}
                  </p>
                </div>
              </div>
            )}

            {/* Package */}
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
                  Package
                </p>
                <p className="font-semibold text-gray-800 font-assistant break-words">
                  {orderInfo.packageTitle}
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
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
              <strong>Important:</strong> Please copy your Order ID for tracking. We do not send order confirmations via email.
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">Plan Price</span>
                <span className="font-assistant font-semibold text-gray-800">
                  ₹{orderInfo.subtotal.toFixed(2)}
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
                  <span className="font-poppins font-bold text-gray-800">
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
                  <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-1">
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
              <p className="font-semibold font-poppins text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4 text-[#0e540b] flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>

              {/* Show simple tags for basket orders */}
              <div className="flex flex-wrap gap-2">
                {displayVegetables.map((veg) => (
                  <span
                    key={veg.key}
                    className="bg-green-100 font-assistant text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-poppins font-medium border border-green-200"
                  >
                    {veg.name} ({veg.weight})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Status Badge */}
        {orderInfo.paymentStatus && (
          <div className="mb-6 p-4 rounded-xl border-l-4 border-green-600 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 font-assistant text-sm sm:text-base">
                  Payment Status:{" "}
                  <span className="capitalize text-green-700">
                    {orderInfo.paymentStatus.replace("_", " ")}
                  </span>
                </p>
                {orderInfo.paymentMethod && (
                  <p className="text-xs sm:text-sm text-gray-600 font-assistant mt-1">
                    Payment Method:{" "}
                    <span className="font-semibold">
                      {orderInfo.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
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
    </div>
  );
};

export default BillingSuccess;