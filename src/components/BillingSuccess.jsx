import React, { useMemo } from "react";
import {
  CheckCircle,
  Package,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  MapPin,
  FileText,
  Truck,
  Shield,
  Percent,
} from "lucide-react";

const BillingSuccess = ({ orderData, onNewOrder }) => {
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

  // Format vegetables for display (without prices)
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
  const billingInfo = useMemo(() => {
    if (!orderData) {
      return {
        orderId: "N/A",
        subtotal: 0,
        discount: 0,
        delivery: 0,
        totalAmount: 0,
        savings: 0,
        savingsPercentage: 0,
      };
    }

    const subtotal = orderData.vegetablesTotal || orderData.selectedOffer?.price || 0;
    const discount = orderData.couponDiscount || 0;
    const delivery = orderData.deliveryCharges || 20;
    const total = orderData.totalAmount || 0;
    const marketTotal = orderData.marketTotal || subtotal;
    const savings = marketTotal - subtotal + discount;
    const savingsPercentage = marketTotal > 0 ? ((savings / marketTotal) * 100).toFixed(0) : 0;

    return {
      orderId: orderData.orderId || "N/A",
      subtotal,
      discount,
      delivery,
      totalAmount: total,
      paymentMethod: orderData.paymentMethod || "COD",
      paymentStatus: orderData.paymentStatus || "pending",
      packageTitle: orderData.selectedOffer?.title || "N/A",
      savings,
      savingsPercentage,
    };
  }, [orderData]);

  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-6 px-3 sm:px-4 pt-20">
      <div className="max-w-2xl w-full bg-[#f0fcf6] p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-green-100">
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

        {/* Savings Badge */}
        {billingInfo.savings > 0 && (
          <div className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-300">
            <div className="flex items-center justify-center gap-2">
              <Percent className="w-5 h-5 text-green-700" />
              <p className="text-lg font-bold font-poppins text-green-800">
                You Saved ₹{billingInfo.savings.toFixed(2)} ({billingInfo.savingsPercentage}%)
              </p>
            </div>
          </div>
        )}

        {/* Billing Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl mb-6 border border-green-200">
          <h3 className="font-bold text-base font-poppins sm:text-lg mb-4 text-[#0e540b] flex items-center gap-2">
            <FileText className="w-5 h-5 flex-shrink-0" />
            Billing Summary
          </h3>

          {/* Order ID */}
          <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">Order ID</p>
                <p className="font-semibold font-assistant text-gray-800 break-all text-sm sm:text-base">
                  {billingInfo.orderId}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
            <p className="font-semibold font-poppins text-gray-700 mb-3 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#0e540b]" />
              Customer Information
            </p>
            <div className="space-y-2.5">
              {/* Name */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-assistant text-gray-500">Name</p>
                  <p className="font-medium font-assistant text-gray-800 break-words text-sm">
                    {customerInfo?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-assistant text-gray-500">Mobile</p>
                  <p className="font-medium font-assistant text-gray-800 text-sm">
                    {customerInfo?.mobile || "N/A"}
                  </p>
                </div>
              </div>

              {/* Email */}
              {customerInfo?.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-assistant text-gray-500">Email</p>
                    <p className="font-medium font-assistant text-gray-800 break-all text-sm">
                      {customerInfo.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Address */}
              {customerInfo?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-assistant text-gray-500">Delivery Address</p>
                    <p className="text-sm font-assistant text-gray-700 break-words">
                      {customerInfo.address}
                      {customerInfo.area && `, ${customerInfo.area}`}
                      {customerInfo.city && `, ${customerInfo.city}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Package */}
          {billingInfo.packageTitle && billingInfo.packageTitle !== "N/A" && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-assistant text-gray-500">Selected Package</p>
                  <p className="font-semibold font-assistant text-gray-800 text-sm">
                    {billingInfo.packageTitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Vegetables */}
          {displayVegetables.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
              <p className="font-semibold font-poppins text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <ShoppingBag className="w-4 h-4 text-[#0e540b] flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>
              <div className="space-y-2">
                {displayVegetables.map((veg) => (
                  <div
                    key={veg.key}
                    className="flex justify-between items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#0e540b] rounded-full"></div>
                      <span className="font-medium font-assistant text-gray-800 text-sm">
                        {veg.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 font-assistant font-medium">
                      {veg.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <p className="font-semibold font-poppins text-gray-700 mb-3 text-sm">
              Price Summary
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">Plan Price</span>
                <span className="font-semibold font-assistant text-gray-800">
                  ₹{billingInfo.subtotal.toFixed(2)}
                </span>
              </div>

              {billingInfo.discount > 0 && (
                <div className="flex justify-between items-center bg-green-50 px-2 py-1.5 rounded-lg">
                  <span className="font-assistant text-green-700 font-semibold">Coupon Discount</span>
                  <span className="font-bold font-assistant text-green-700">
                    -₹{billingInfo.discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">Delivery Charge</span>
                <span className="font-semibold font-assistant text-gray-800">
                  {billingInfo.delivery === 0
                    ? "FREE"
                    : `₹${billingInfo.delivery.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold font-poppins text-gray-800">Total Amount</span>
                  <span className="font-bold font-amiko text-[#0e540b] text-xl">
                    ₹{billingInfo.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6 p-4 rounded-xl border-l-4 border-blue-600 bg-blue-50">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold font-assistant text-gray-800 text-sm sm:text-base">
                Payment Method:{" "}
                <span className="text-blue-700">
                  {billingInfo.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </span>
              </p>
              <p className="text-xs sm:text-sm font-assistant text-gray-600 mt-1">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {billingInfo.paymentStatus.replace("_", " ")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Delivery & Call Information */}
        <div className="mb-6 space-y-3">
          {/* Delivery Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold font-assistant text-gray-800 mb-1 text-sm sm:text-base">
                  Same Day Delivery
                </p>
                <p className="text-gray-700 text-xs sm:text-sm font-assistant">
                  Your order will be delivered between <strong>4:00 PM - 5:00 PM</strong> today
                </p>
              </div>
            </div>
          </div>

          {/* Call Confirmation */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold font-assistant text-gray-800 mb-1 text-sm sm:text-base">
                  Confirmation Call
                </p>
                <p className="text-gray-700 text-xs sm:text-sm font-assistant">
                  You will receive a confirmation call on{" "}
                  <strong className="text-gray-900">
                    {customerInfo?.mobile || "your registered number"}
                  </strong>{" "}
                  within 30 minutes to confirm your order and delivery details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border border-green-300">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-6 h-6 text-green-700" />
            <div className="text-center">
              <p className="font-bold font-poppins text-green-800 text-sm">100% Fresh & Quality Guaranteed</p>
              <p className="text-xs font-assistant text-green-700">Safe and Secure Delivery</p>
            </div>
          </div>
        </div>

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