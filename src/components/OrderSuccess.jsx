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
} from "lucide-react";
import CopyOrderButton from "./CopyOrderButton";

const OrderSuccess = ({
  orderData,
  formData,
  selectedOffer,
  selectedVegetables,
  onNewOrder,
}) => {
  // Helper function to extract vegetable name
  const getVegetableName = (veg) => {
    if (typeof veg === "string") return veg;
    if (typeof veg === "object" && veg?.name) return veg.name;
    return "Unknown Vegetable";
  };

  // Determine order type and calculate total
  const orderInfo = useMemo(() => {
    const isCustomOrder = orderData?.orderType === "custom";
    const isBasketOrder = orderData?.orderType === "basket";

    let totalAmount = 0;
    let packageTitle = "N/A";

    if (isCustomOrder) {
      totalAmount = orderData?.totalAmount || 0;
      packageTitle = "Custom Selection";
    } else if (isBasketOrder) {
      totalAmount = (selectedOffer?.price || 0) + 20;
      packageTitle = selectedOffer?.title || "Basket Package";
    }

    return {
      isCustomOrder,
      isBasketOrder,
      totalAmount,
      packageTitle,
    };
  }, [orderData, selectedOffer]);

  // Format vegetables for display
  const displayVegetables = useMemo(() => {
    if (!selectedVegetables || selectedVegetables.length === 0) return [];

    return selectedVegetables.map((veg, index) => ({
      key: index,
      name: getVegetableName(veg),
      quantity: veg?.quantity,
      weight: veg?.weight,
      price: veg?.pricePerUnit || veg?.price,
    }));
  }, [selectedVegetables]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-6 px-3 sm:px-4 pt-20">
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl mb-6 border border-green-200">
          <h3 className="font-bold text-base font-poppins sm:text-lg mb-4 text-[#0e540b] flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0" />
            Order Summary
          </h3>

          {/* Customer & Order Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            {/* Order ID */}
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-poppins text-gray-500">
                    Order ID
                  </p>
                  <span className="font-semibold text-gray-800 font-assistant break-all">
                    {orderData?.orderId || "N/A"}
                  </span>
                </div>
                {orderData?.orderId && (
                  <CopyOrderButton orderId={orderData.orderId} />
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
                  {formData?.name || "N/A"}
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
                  {formData?.mobile || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
                  Email
                </p>
                <p className="font-semibold text-gray-800 font-assistant truncate">
                  {formData?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Package/Order Type */}
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-poppins text-gray-500">
                  {orderInfo.isCustomOrder ? "Order Type" : "Package"}
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

          {/* Delivery Address - if available */}
          {formData?.address && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-1">
                    Delivery Address
                  </p>
                  <p className="text-sm font-assistant text-gray-700 break-words">
                    {formData.address}
                    {formData.area && `, ${formData.area}`}
                    {formData.city && `, ${formData.city}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Vegetables Section */}
          {displayVegetables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="font-semibold font-poppins text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4 text-[#0e540b]  flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>

              {/* For Custom Orders - Show detailed list */}
              {orderInfo.isCustomOrder ? (
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
                        {veg.weight && (
                          <span className="text-xs text-gray-600 font-assistant ml-2">
                            ({veg.weight})
                          </span>
                        )}
                      </div>
                      {veg.quantity && veg.price && (
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-gray-600 font-assistant">
                            ₹{parseFloat(veg.price).toFixed(2)} × {veg.quantity}
                          </div>
                          <div className="font-semibold text-green-700 text-sm font-assistant">
                            ₹{(parseFloat(veg.price) * veg.quantity).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // For Basket Orders - Show simple tags
                <div className="flex flex-wrap gap-2">
                  {displayVegetables.map((veg) => (
                    <span
                      key={veg.key}
                      className="bg-green-100 font-assistant text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-poppins font-medium border border-green-200"
                    >
                      {veg.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Steps Card */}
        <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 font-assistant mb-1 text-sm sm:text-base">
                Next Steps
              </p>
              <p className="text-gray-700 text-xs sm:text-sm font-assistant">
                Your order has been received and will be processed shortly. You
                will receive a confirmation call on{" "}
                <strong className="text-gray-900">{formData?.mobile}</strong>{" "}
                within 30 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Place Another Order Button */}
        <button
          onClick={onNewOrder}
          className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 font-assistant" />
          Place Another Order
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
