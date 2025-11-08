import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useOrderContext } from "../Context/OrderContext";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";

const RazorpayPayment = ({ orderType, onSuccess, vegetableOrder }) => {
  const {
    selectedOffer,
    selectedVegetables,
    formData,
    navigate,
    setIsOrderPlaced,
    paymentMethod,
  } = useOrderContext();

  const [orderCount, setOrderCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Helper functions for order items
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order)) return order;
    if (order.items && Array.isArray(order.items)) return order.items;
    return [];
  };

  const getOrderSummary = (order) => {
    if (order && typeof order === "object" && order.summary)
      return order.summary;
    return null;
  };

  // Determine if custom or basket order
  const isCustomOrder = useMemo(() => {
    return orderType === "custom" || getOrderItems(vegetableOrder).length > 0;
  }, [orderType, vegetableOrder]);

  const isBasketOrder = useMemo(() => {
    return (
      orderType === "basket" ||
      (selectedOffer && selectedVegetables?.length > 0)
    );
  }, [orderType, selectedOffer, selectedVegetables]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (isCustomOrder && vegetableOrder) {
      const items = getOrderItems(vegetableOrder);
      const summary = getOrderSummary(vegetableOrder);

      if (summary?.totalAmount && summary.totalAmount > 0) {
        return summary.totalAmount;
      }

      const subtotal = items.reduce((acc, item) => {
        const price =
          parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 0;
        return acc + price * qty;
      }, 0);

      const delivery = summary?.deliveryCharges ?? 20;
      return subtotal > 0 ? subtotal + delivery : 0;
    }

    if (isBasketOrder && selectedOffer) {
      return (selectedOffer.price || 0) + 20;
    }

    return 0;
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedOffer]);

  // Load Razorpay script dynamically
  const loadScript = useCallback((src) => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        // console.log("✅ Razorpay already loaded");
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      // console.log("⏳ Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = src;
      
      script.onload = () => {
        // console.log("✅ Razorpay script loaded successfully");
        setScriptLoaded(true);
        resolve(true);
      };
      
      script.onerror = () => {
        console.error("❌ Razorpay script failed to load");
        setScriptLoaded(false);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }, []);

  // Pre-load Razorpay script when component mounts or payment method changes
  useEffect(() => {
    if (paymentMethod === "ONLINE") {
      loadScript("https://checkout.razorpay.com/v1/checkout.js");
    }
  }, [paymentMethod, loadScript]);

  // Fetch daily order count
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/orders`,
          { timeout: 10000 }
        );
        setOrderCount(response.data.data.count + 1);
      } catch (error) {
        console.error("Error fetching order count:", error);
        setOrderCount(1); // Fallback to 1
      }
    };

    fetchOrderCount();
  }, []);

  // Generate unique order ID
  const generateOrderId = useCallback((count = 1) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(count).padStart(3, "0");
    return `ORD${year}${month}${day}${orderNum}`;
  }, []);

  // Build order data
  const buildOrderData = useCallback(
    (orderId) => {
      try {
        if (isCustomOrder && vegetableOrder) {
          const items = getOrderItems(vegetableOrder);
          const summary = getOrderSummary(vegetableOrder);

          return {
            orderId,
            orderType: "custom",
            customerInfo: formData || {},
            selectedVegetables: (items || []).map((item) => ({
              vegetable: item.id || item.vegetableId,
              weight: item.weight,
              quantity: item.quantity,
              pricePerUnit:
                parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              subtotal:
                (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
                (item.quantity || 0),
              isFromBasket: false,
            })),
            vegetablesTotal:
              summary?.subtotal ||
              items.reduce((total, item) => {
                const price =
                  parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
                return total + price * (item.quantity || 0);
              }, 0),
            deliveryCharges: summary?.deliveryCharges ?? 20,
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
            orderDate: new Date().toISOString(),
          };
        }

        if (isBasketOrder) {
          return {
            orderId,
            orderType: "basket",
            customerInfo: formData || {},
            selectedOffer: selectedOffer || {},
            selectedVegetables: selectedVegetables || [],
            orderDate: new Date().toISOString(),
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
          };
        }

        throw new Error("Invalid order type");
      } catch (error) {
        console.error("Error building order data:", error);
        throw error;
      }
    },
    [
      isCustomOrder,
      isBasketOrder,
      vegetableOrder,
      formData,
      selectedOffer,
      selectedVegetables,
      totalAmount,
    ]
  );

  // Create order and initiate payment
  const createOrder = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate data
      if (!formData?.name || !formData?.mobile) {
        throw new Error("Customer information is incomplete");
      }

      if (totalAmount <= 0) {
        throw new Error("Invalid order amount");
      }

      // Ensure Razorpay script is loaded
      if (!scriptLoaded) {
        // console.log("🔄 Script not loaded yet, loading now...");
        const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );
        if (!res) {
          throw new Error(
            "Razorpay SDK failed to load. Please check your internet connection."
          );
        }
      }

      const orderId = generateOrderId(orderCount);
      setCurrentOrderId(orderId);
      const orderData = buildOrderData(orderId);

      // console.log("📦 Creating order...", orderId);

      // Create order in backend
      const result = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
        orderData,
        { timeout: 15000 }
      );

      if (!result?.data?.data?.razorpayOrder?.id) {
        throw new Error("Failed to create order. Please try again.");
      }

      const razorpayOrderId = result.data.data.razorpayOrder.id;
      const amount = Math.round(totalAmount * 100); // Convert to paise
      const currency = "INR";

      // console.log("💳 Opening Razorpay payment modal...");

      // Get order description
      let description = "";
      if (isCustomOrder) {
        description = "Custom Vegetable Order";
      } else if (isBasketOrder && selectedOffer) {
        description = `${selectedOffer.title}`;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_RLvTRwhfUYfTlG",
        amount,
        currency,
        name: "VegBazar",
        description,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // console.log("✅ Payment successful, verifying...");
          try {
            // Build verification data based on order type
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            };

            // Add order-specific data
            if (isCustomOrder && vegetableOrder) {
              const items = getOrderItems(vegetableOrder);
              verifyData.orderType = "custom";
              verifyData.customerInfo = formData;
              verifyData.selectedVegetables = items.map((item) => ({
                vegetable: item.id || item.vegetableId,
                weight: item.weight,
                quantity: item.quantity,
                pricePerUnit: parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              }));
            } else if (isBasketOrder) {
              verifyData.orderType = "basket";
              verifyData.customerInfo = formData;
              verifyData.selectedOffer = selectedOffer;
              verifyData.selectedVegetables = selectedVegetables;
            }

            // console.log("🔍 Verifying payment with data:", {
            //   ...verifyData,
            //   razorpay_signature: "[HIDDEN]"
            // });

            const verifyResult = await axios.post(
              `${import.meta.env.VITE_API_SERVER_URL}/api/orders/verify-payment`,
              verifyData,
              { timeout: 15000 }
            );

            // console.log("✅ Verification response:", verifyResult.data);

            if (verifyResult.data.success) {
              // console.log("✅ Payment verified successfully");
              setIsOrderPlaced(true);
              if (onSuccess) {
                onSuccess();
              } else {
                navigate("/order-confirmation");
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            console.error("Error details:", err.response?.data);
            setError(
              err.response?.data?.message || 
              "Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id
            );
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData?.name || "",
          email: formData?.email || "",
          contact: formData?.mobile || "",
        },
        notes: {
          address: formData?.address || "",
          area: formData?.area || "",
          city: formData?.city || "",
        },
        theme: { color: "#0e540b" },
        modal: {
          ondismiss: function () {
            // console.log("⚠️ Payment cancelled by user");
            setIsLoading(false);
            setError("Payment cancelled. Please try again when ready.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("❌ Payment creation error:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Unable to initiate payment. Please try again.";
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Display error if any
  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-assistant text-red-800 font-medium mb-1">
              Payment Error
            </p>
            <p className="text-xs text-red-700 break-words">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            createOrder();
          }}
          className="w-full font-assistant py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {totalAmount > 0 ? (
        <>
          <button
            onClick={createOrder}
            disabled={isLoading}
            className="w-full py-3 font-assistant sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Pay Now - ₹{totalAmount.toFixed(2)}
              </>
            )}
          </button>

          {!scriptLoaded && (
            <p className="text-center font-assistant text-xs text-yellow-600">
              Loading payment gateway...
            </p>
          )}

          {isBasketOrder && selectedOffer && (
            <p className="text-center font-assistant text-xs sm:text-sm text-gray-600">
              Package: ₹{selectedOffer.price} + ₹20 delivery charge
            </p>
          )}

          {isCustomOrder && (
            <p className="text-center font-assistant text-xs sm:text-sm text-gray-600">
              Includes ₹20 delivery charge
            </p>
          )}
        </>
      ) : (
        <button
          disabled
          className="w-full font-assistant py-3 sm:py-4 rounded-xl bg-gray-300 text-gray-600 cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Invalid Order Amount
        </button>
      )}
    </div>
  );
};

export default RazorpayPayment;