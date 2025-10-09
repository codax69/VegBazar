import React from "react";
import {
  CheckCircle,
  Package,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
} from "lucide-react";

const OrderSuccess = ({ orderData, formData, selectedOffer, selectedVegetables, onNewOrder }) => {
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
          onClick={onNewOrder}
          className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Place Another Order
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;