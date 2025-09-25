import React, { useState,useEffect } from "react";
import axios from "axios";
import { CheckCircle,ArrowLeft } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
// import OtpVerification from "../components/OtpVerification";
import { apiCall } from "../utils/apiCall";

// const OrderConfirmation = () => {
//   const { formData, selectedOffer, selectedVegetables, resetOrder } =
//     useOrderContext();
//   // const [showOtp, setShowOtp] = useState(false);
//   const [isOrderPlaced, setIsOrderPlaced] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Generate unique order ID
//   const generateOrderId = () => {
//     return (
//       "ORD" +
//       new Date().toISOString().replace(/[-:.TZ]/g, "") +
//       Math.floor(Math.random() * 100000)
//     );
//   };

//   // Step 1: Send OTP using MSG91 backend API
//   // const handleSendOtp = async () => {
//   //   if (!formData.mobile) {
//   //     alert("Mobile number is missing!");
//   //     return;
//   //   }
//   //   try {
//   //     setLoading(true);
//   //     await axios.post("/api/otp/send", { email: formData.email });
//   //     setShowOtp(true);
//   //   } catch (err) {
//   //     console.error("Failed to send OTP:", err);
//   //     alert("Failed to send OTP. Please try again.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Step 2: Place order after OTP verification
//   const handlePlaceOrder = async () => {
//     const orderData = {
//       orderId: generateOrderId(),
//       ...formData,
//       offerId: selectedOffer?._id || null,
//       selectedVegetables,
//       status: "pending",
//       createdAt: new Date(),
//     };

//     try {
//       const res = await apiCall("orders", "POST", orderData);
//       if (res.success) {
//         setIsOrderPlaced(true);
//       } else {
//         alert("Something went wrong while placing order.");
//       }
//     } catch (err) {
//       console.error("Order failed:", err);
//       alert("Failed to place order. Please try again.");
//     }
//   };
  

//   // OTP verification screen
//   // if (showOtp) {
//   //   return <OtpVerification onSuccess={handlePlaceOrder} />;
//   // }

//   return (
//     <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
//       {!isOrderPlaced ? (
//         <>
//           <h2 className="text-xl font-bold mb-4 text-green-700">
//             Confirm Your Order
//           </h2>

//           {/* Show summary */}
//           <p className="mb-2">
//             <strong>Name:</strong> {formData.name}
//           </p>
//           <p className="mb-2">
//             <strong>Address:</strong> {formData.address}
//           </p>
//           <p className="mb-2">
//             <strong>Email:</strong> {formData.email}
//           </p>
//           <p className="mb-4">
//             <strong>Offer:</strong> {selectedOffer?.title}
//           </p>

//           <button
//             // onClick={handleSendOtp}
//             onClick={handlePlaceOrder}
//             disabled={loading}
//             className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             {loading ? "Sending OTP..." : "Place Order (Verify OTP)"}
//           </button>
//         </>
//       ) : (
//         <div className="text-center">
//           <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold">
//             Order Placed Successfully!
//           </h3>
//           <button
//             onClick={resetOrder}
//             className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg"
//           >
//             New Order
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderConfirmation;


const OrderConfirmation = () => {
  const { formData, selectedOffer, selectedVegetables, resetOrder, navigate } =
    useOrderContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Guard
  useEffect(() => {
    if (!selectedOffer || !selectedVegetables.length) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOffer, selectedVegetables]);
  
  function generateOrderId() {
    const now = new Date();
    const datePart = now
      .toISOString()
      .replace(/[-:.TZ]/g, "") // 20250901T104321Z → 20250901104321
      .slice(0, 14); // YYYYMMDDHHMMSS

    const millis = now.getMilliseconds().toString().padStart(3, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `ORD${datePart}${millis}${random}`;
  }
  
  const handleNewOrder = () => {
    resetOrder();
  };
  const orderData = {
    customerInfo: formData,
    selectedOffer,
    selectedVegetables,
    orderDate: new Date().toISOString(),
    totalAmount: selectedOffer?.price ?? 0,
    orderId: generateOrderId(),
  };

 const handleSubmitOrder = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  setSubmitError(null);
  try {
    const result = await apiCall(orderData);
    const response = await axios.post(`${import.meta.env.VITE_API_SERVER_URL}/api/orders/add`, orderData);
    const okSheets =
      !!result && (result.success === true || result.status === "ok");
    const okApi = response && response.status >= 200 && response.status < 300;
    if (okSheets && okApi) {
      setIsOrderPlaced(true);
    } else {
      setSubmitError("Failed to save order. Please try again.");
    }
  } catch (err) {
    console.error(
      "Order submission error:",
      err?.response?.data || err?.message
    );
    setSubmitError(
      err?.response?.data?.message ?? "An error occurred. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  // Auto submit once on mount if we have required data

  if (isSubmitting) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-[#0e540b] border-t-transparent rounded-full"></div>
        <p className="khula text-gray-600">Processing your order...</p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-red-500 mb-4">❌</div>
        <h2 className="text-xl font-bold text-red-600 mb-4 khula ">
          Order Submission Failed
        </h2>
        <p className="text-gray-600 mb-4">{submitError}</p>
        <button
          onClick={handleSubmitOrder}
          className="bg-[#0e540b] text-white py-3 px-6 rounded-md hover:bg-[#0e540b] transition duration-200 khula"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-[#0e540b] mb-4">
          <CheckCircle size={64} className="mx-auto animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-[#0e540b] mb-4 amiko">
          🎉 Order Placed Successfully!
        </h2>

        <div className="text-left bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6 border border-green-200">
          <h3 className="font-bold mb-3 text-green-700 trirong">📋 Order Summary:</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong className="khula">Order ID:</strong> {orderData.orderId}
            </p>
            <p>
              <strong className="khula">Name:</strong> {formData.name}
            </p>
            <p>
              <strong className="khula">Mobile:</strong> {formData.mobile}
            </p>
            <p>
              <strong className="khula">Email:</strong> {formData.email}
            </p>
            <p>
              <strong className="khula">Package:</strong> {selectedOffer.title}
            </p>
            <p>
              <strong className="khula">Amount:</strong>{" "}
              <span className="amiko text-[#0e540b] font-bold">
                ₹{selectedOffer.price}
              </span>
            </p>
          </div>

          <div className="mt-4">
            <strong className="text-green-700 khula">🥬 Vegetables Selected:</strong>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedVegetables.map((veg, index) => (
                <span
                  key={index}
                  className="amiko bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                >
                  {veg}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
          <p className="text-gray-700 text-sm khula">
            📞 Your order has been received and will be processed shortly. You
            will receive a confirmation call on{" "}
            <strong>{formData.mobile}</strong> within 30 minutes.
          </p>
        </div>

        <button
          onClick={handleNewOrder}
          className="amiko bg-[#0e540b] text-white py-3 px-6 rounded-md hover:bg-[#0e540b] transition duration-200 transform hover:scale-105 font-medium"
        >
          🛒 Place Another Order
        </button>
      </div>
    );
  }

  // Fallback UI: show summary + confirm button
  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg">
  {/* Back Button & Heading */}
  <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-center relative">
    
    {/* Back Button */}
    <button
      onClick={() => navigate("/select-vegetables")}
      className="khula text-[#0e540b] hover:text-green-700 text-sm sm:text-base font-medium mb-4 sm:mb-0 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center"
    >
      <ArrowLeft size={18} className="mr-2" />
      Back
    </button>

    {/* Heading */}
    <h2 className="trirong text-center text-xl sm:text-2xl md:text-3xl font-bold text-[#0e540b]">
      Confirm Your Order
    </h2>
  </div>
</div>


  <div className="bg-green-50 p-5 sm:p-6 rounded-xl border border-green-200 mb-8">
    <div className="space-y-2 text-sm sm:text-base text-gray-800">
      <p>
        <strong className="text-gray-900">Order ID:</strong>{" "}
        <span className="text-gray-700">{orderData.orderId}</span>
      </p>
      <p>
        <strong className="text-gray-900">Name:</strong>{" "}
        <span className="text-gray-700">{formData.name}</span>
      </p>
      <p>
        <strong className="text-gray-900">Mobile:</strong>{" "}
        <span className="text-gray-700">{formData.mobile}</span>
      </p>
      <p>
        <strong className="text-gray-900">Email:</strong>{" "}
        <span className="text-gray-700">{formData.email}</span>
      </p>
      <p>
        <strong className="text-gray-900">Package:</strong>{" "}
        <span className="text-gray-700">{selectedOffer?.title}</span>
      </p>
      <p>
        <strong className="text-gray-900">Amount:</strong>{" "}
        <span className="text-[#0e540b] font-semibold">
          ₹{selectedOffer?.price}
        </span>
      </p>

      {/* Vegetables */}
      <div className="pt-3">
        <strong className="text-gray-900">Vegetables:</strong>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedVegetables.map((v, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Confirm Button */}
  <div className="text-center">
    <button
      onClick={handleSubmitOrder}
      className="w-full sm:w-auto bg-[#0e540b] text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
    >
      Confirm & Place Order
    </button>
  </div>

  );
};
export default OrderConfirmation;
