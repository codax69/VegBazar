import React from 'react';
import axios from 'axios';
import { useOrderContext } from "../Context/OrderContext";


const RazorpayPayment = () => {
    
  const { selectedOffer, selectedVegetables, formData, navigate,paymentMethod } = useOrderContext();
  
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

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
  
  
  const orderData = {
    customerInfo: formData,
    selectedOffer,
    selectedVegetables,
    orderDate: new Date().toISOString(),
    totalAmount: selectedOffer?.price ?? 0,
    orderId: generateOrderId(),
    paymentMethod,
  };


  const createOrder = async () => {
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
       navigate("/")
      if (!res) {
        alert('Razorpay SDK failed to load');
        return;
      }

      const result = await axios.post(`${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`, orderData);
      console.log(result.data.data)
      if (!result.data) {
        alert('Server error. Are you online?');
        return;
      }

      // Destructure from result.data.order or result.data depending on your API response
      const amount = selectedOffer.price + 20 * 100;
      const currency = "INR";
      const orderId = result.data.data.razorpayOrder.id;

      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID || "rzp_live_RLvTRwhfUYfTlG",
        amount:amount, 
        currency: currency || 'INR', // Default to INR if currency not provided
        name: 'VegBazar',
        description: `${selectedOffer.title} - ${selectedVegetables.join(', ')}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            };
            
            const verifyResult = await axios.post(
              `${import.meta.env.VITE_API_SERVER_URL}/api/orders/verify-payment`,
              verifyData
            );

            if (verifyResult.data.success) {
              
              navigate('/order-confirmation');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        },
        notes: {
          address: formData.address
        },
        theme: {
          color: '#0e540b'
        }
      };
      
      // Add error callback
      options.modal = {
        ondismiss: function() {
          alert('Payment cancelled');
        },
        escape: false,
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment creation error:', error);
      alert('Unable to initiate payment. Please try again.');
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={createOrder}
        className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
      >
        Pay Now - ₹{selectedOffer.price + 20}
      </button>
      <p className="mt-2 text-sm text-gray-600">
        (Includes ₹20 delivery charge)
      </p>
    </div>
  );
};

export default RazorpayPayment;