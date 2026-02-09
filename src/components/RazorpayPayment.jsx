import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useOrderContext } from "../Context/OrderContext";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/AuthContext.jsx";

const RazorpayPayment = ({
  orderType,
  onSuccess,
  vegetableOrder,
  couponCode,
  deliveryAddress,
  isCheckoutDisabled,
}) => {
  const {
    selectedOffer,
    selectedVegetables,
    formData,
    navigate,
    setIsOrderPlaced,
    paymentMethod,
  } = useOrderContext();

  const { user } = useAuth();

  const customerInfo = useMemo(
    () => ({
      name: user?.username || "",
      mobile: user?.phone || "",
      email: user?.email || "",
    }),
    [user]
  );

  const [orderCount, setOrderCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Helper functions
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order)) return order;
    if (order.items && Array.isArray(order.items)) return order.items;
    return [];
  };

  const getOrderSummary = (order) => {
    if (order && typeof order === "object" && order.summary) return order.summary;
    return null;
  };

  const isCustomOrder = useMemo(() => {
    return orderType === "custom" || getOrderItems(vegetableOrder).length > 0;
  }, [orderType, vegetableOrder]);

  const isBasketOrder = useMemo(() => {
    return (
      orderType === "basket" ||
      (selectedOffer && selectedVegetables?.length > 0)
    );
  }, [orderType, selectedOffer, selectedVegetables]);

  // Calculate total amount with proper coupon handling
  const totalAmount = useMemo(() => {
    if (isCustomOrder && vegetableOrder) {
      const items = getOrderItems(vegetableOrder);
      const summary = getOrderSummary(vegetableOrder);

      if (summary?.totalAmount && summary.totalAmount > 0) {
        return summary.totalAmount;
      }

      const subtotal = items.reduce((acc, item) => {
        const price = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 0;
        return acc + price * qty;
      }, 0);

      const delivery = summary?.deliveryCharges ?? 20;
      return subtotal > 0 ? subtotal + delivery : 0;
    }

    if (isBasketOrder && selectedOffer) {
      const offerPrice = selectedOffer.price || 0;
      const discount = couponCode?.discount || 0;
      const deliveryCharge = 20;
      return Math.max(0, offerPrice - discount) + deliveryCharge;
    }

    return 0;
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedOffer, couponCode]);

  const loadScript = useCallback((src) => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
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

  useEffect(() => {
    if (paymentMethod === "ONLINE") {
      loadScript("https://checkout.razorpay.com/v1/checkout.js");
    }
  }, [paymentMethod, loadScript]);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/total`,
          { timeout: 10000 }
        );
        setOrderCount(response.data?.data.count + 1);
      } catch (error) {
        console.error("Error fetching order count:", error);
        setOrderCount(1);
      }
    };

    fetchOrderCount();
  }, []);

  const generateOrderId = useCallback((count = 1) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(count).padStart(3, "0");
    return `ORD${year}${month}${day}${orderNum}`;
  }, []);

  // Build order data that matches backend expectations
  const buildOrderData = useCallback(
    (orderId) => {
      try {
        // Extract coupon code properly
        const extractedCouponCode =
          typeof couponCode === "string" ? couponCode : couponCode?.code || null;

        if (isCustomOrder && vegetableOrder) {
          const items = getOrderItems(vegetableOrder);
          const summary = getOrderSummary(vegetableOrder);

          // Map items to match backend's expected structure
          const selectedVegetablesData = (items || []).map((item) => ({
            vegetable: item.id || item.vegetableId,
            weight: item.weight,
            quantity: item.quantity,
            pricePerUnit:
              parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
            subtotal:
              (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
              (item.quantity || 0),
            isFromBasket: false,
          }));

          const orderData = {
            orderId,
            orderType: "custom",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress?._id || null,
            selectedVegetables: selectedVegetablesData,
            vegetablesTotal:
              summary?.subtotal ||
              items.reduce((total, item) => {
                const price =
                  parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
                return total + price * (item.quantity || 0);
              }, 0),
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
            orderDate: new Date().toISOString(),
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };

          return orderData;
        }

        if (isBasketOrder) {
          const orderData = {
            orderId,
            orderType: "basket",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress?._id || null,
            selectedBasket: selectedOffer?._id || selectedOffer?.id || selectedOffer,
            selectedVegetables: selectedVegetables || [],
            orderDate: new Date().toISOString(),
            totalAmount: totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "awaiting_payment",
            orderStatus: "placed",
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };

          return orderData;
        }

        throw new Error("Invalid order type");
      } catch (error) {
        console.error("❌ Error building order data:", error);
        throw error;
      }
    },
    [
      isCustomOrder,
      isBasketOrder,
      vegetableOrder,
      formData,
      customerInfo,
      deliveryAddress,
      selectedOffer,
      selectedVegetables,
      totalAmount,
      couponCode,
    ]
  );

  // Improved payment handler
  const createOrder = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate data
      if (!customerInfo?.name || !customerInfo?.mobile) {
        throw new Error("Customer information is incomplete");
      }

      if (totalAmount <= 0) {
        throw new Error("Invalid order amount");
      }

      // Extract coupon code once at the beginning
      const extractedCouponCode =
        typeof couponCode === "string" ? couponCode : couponCode?.code || null;

      // Ensure Razorpay script is loaded
      if (!scriptLoaded) {
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

      console.log("📦 Order Data being sent:", orderData);

      // Create order in backend
      const result = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
        orderData,
        { timeout: 15000 }
      );

      console.log("✅ Backend response:", result.data);

      if (!result?.data?.data?.razorpayOrder?.id) {
        throw new Error("Failed to create order. Please try again.");
      }

      const razorpayOrderId = result.data.data.razorpayOrder.id;
      const amount = Math.round(totalAmount * 100);
      const currency = "INR";

      // Store order data in sessionStorage for recovery
      sessionStorage.setItem("pendingOrderData", JSON.stringify(orderData));

      let description = "";
      if (isCustomOrder) {
        description = "Custom Vegetable Order";
      } else if (isBasketOrder && selectedOffer) {
        description = `${selectedOffer.title}`;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S9xkjZZlpd8fka",
        amount,
        currency,
        name: "VegBazar",
        description,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            console.log("💳 Payment response:", response);

            // Now extractedCouponCode is available here
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
              orderType: isCustomOrder ? "custom" : "basket",
              customerInfo: customerInfo,
              deliveryAddressId: deliveryAddress?._id || null,
              couponCode: extractedCouponCode,
              totalAmount: totalAmount,
            };

            // Add order-specific data
            if (isCustomOrder && vegetableOrder) {
              const items = getOrderItems(vegetableOrder);
              verifyData.selectedVegetables = items.map((item) => ({
                vegetable: item.id || item.vegetableId,
                weight: item.weight,
                quantity: item.quantity,
                pricePerUnit:
                  parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              }));
            } else if (isBasketOrder) {
              verifyData.selectedBasket = selectedOffer?._id || selectedOffer?.id || selectedOffer;
              verifyData.selectedVegetables = selectedVegetables;
            }

            console.log("🔍 Verify Data being sent:", verifyData);

            const verifyResult = await axios.post(
              `${import.meta.env.VITE_API_SERVER_URL}/api/orders/verify-payment`,
              verifyData,
              { timeout: 15000 }
            );

            console.log("✅ Verification response:", verifyResult.data);

            if (verifyResult.data.success) {
              // Clear pending order data
              sessionStorage.removeItem("pendingOrderData");
              // Clear cart from localStorage
              localStorage.removeItem("orderSummary");
              localStorage.removeItem("vegbazar_cart");
              setIsOrderPlaced(true);

              if (onSuccess) {
                onSuccess();
              } else {
                // Navigate to new success page with cashback support
                navigate("/order-success", {
                  state: {
                    orderData: verifyResult.data.data || verifyResult.data
                  },
                });
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            console.error("Error details:", err.response?.data);
            setError(
              `Payment received but verification failed. Your payment ID: ${response.razorpay_payment_id}. Please contact support.`
            );
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerInfo?.name || "",
          email: customerInfo?.email || "",
          contact: customerInfo?.mobile || "",
        },
        notes: {
          address: deliveryAddress?.street || "",
          area: deliveryAddress?.area || "",
          city: deliveryAddress?.city || "",
          orderId: orderId,
        },
        theme: { color: "#0e540b" },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setError("Payment cancelled. Please try again when ready.");
            sessionStorage.removeItem("pendingOrderData");
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

  // UI code remains the same...
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2 text-sm sm:text-base">
                Payment Error
              </h3>
              <p className="text-red-700 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            createOrder();
          }}
          className="w-full font-funnel py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#0e540b] to-green-700 text-white font-bold hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      {isCheckoutDisabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs sm:text-sm">
          ⚠️ Please select delivery address and payment method to proceed
        </div>
      )}

      {totalAmount > 0 ? (
        <>
          <button
            onClick={createOrder}
            disabled={isCheckoutDisabled || isLoading}
            className={`w-full font-funnel py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 ${isCheckoutDisabled || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#0e540b] to-green-700 text-white hover:from-green-700 hover:to-[#0e540b] hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Processing...
              </>
            ) : isCheckoutDisabled ? (
              <>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Select Address & Payment
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Pay Now ₹{totalAmount.toFixed(2)}
              </>
            )}
          </button>

          {!scriptLoaded && (
            <div className="mt-2 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading payment gateway...
            </div>
          )}

          {isBasketOrder && selectedOffer && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 text-center space-y-1">
              <div>
                Package: ₹{selectedOffer.price}
                {couponCode && couponCode.discount > 0 && (
                  <span className="text-green-600 font-semibold">
                    {" "}
                    - ₹{couponCode.discount} (Coupon)
                  </span>
                )}
                {" + ₹20 delivery"}
              </div>
              {couponCode && couponCode.code && (
                <div className="text-green-600 font-semibold">
                  Coupon "{couponCode.code}" applied ✓
                </div>
              )}
            </div>
          )}

          {isCustomOrder && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 text-center space-y-1">
              <div>
                {vegetableOrder?.summary?.deliveryCharges === 0
                  ? "Free Delivery (Order above ₹250)"
                  : "Includes ₹20 delivery charge"}
              </div>
              {couponCode &&
                (typeof couponCode === "string" || couponCode.code) && (
                  <div className="text-green-600 font-semibold">
                    Coupon "
                    {typeof couponCode === "string" ? couponCode : couponCode.code}
                    " applied ✓
                  </div>
                )}
            </div>
          )}
        </>
      ) : (
        <button
          disabled
          className="w-full font-funnel py-3 sm:py-4 rounded-xl bg-gray-300 text-gray-500 cursor-not-allowed font-bold text-sm sm:text-base"
        >
          Invalid Order Amount
        </button>
      )}
    </div>
  );
};

export default RazorpayPayment;