import React from "react";
import { Loader2 } from "lucide-react";

const OrderLoading = () => {
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
};

export default OrderLoading;