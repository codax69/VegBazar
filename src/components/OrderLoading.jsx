import React from "react";
import { Loader2 } from "lucide-react";

const OrderLoading = ({loadingText,loadingMsg="Please wait"}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#f0fcf6] p-8 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-16 w-16 text-[#0e540b] animate-spin" />
        </div>
        <h3 className="text-xl font-poppins font-bold text-gray-800 mb-2">
          {loadingText}
        </h3>
        <p className="text-gray-600 font-assistant">
          {loadingMsg}
        </p>
      </div>
    </div>
  );
};

export default OrderLoading;