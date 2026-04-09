import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useOrderContext } from "../Context/OrderContext";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/AuthContext.jsx";
import { useWallet } from "../Context/WalletContext.jsx";

// ─── Auth header helper ───────────────────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RazorpayPayment = ({
  orderType,
  onSuccess,
  vegetableOrder,
  couponCode,
  deliveryAddress,
  isCheckoutDisabled,
  walletCreditUsed = 0,
  amountAfterWallet = null,
}) => {
  const {
    selectedOffer,
    selectedVegetables,
    formData,
    navigate,
    setIsOrderPlaced,
    setVegetableOrder,
    paymentMethod,
  } = useOrderContext();

  const { user } = useAuth();
  const { refreshBalance } = useWallet();

  const customerInfo = useMemo(
    () => ({
      name: user?.username || "",
      mobile: user?.phone || "",
      email: user?.email || "",
    }),
    [user],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // ─── helpers ──────────────────────────────────────────────────────────────
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

  // ─── clear all cart state after order ────────────────────────────────────
  const clearCartAfterOrder = useCallback(async () => {
    // 1. Backend cart clear
    try {
      await axios.delete("/api/cart/clear", { headers: authHeader() });
    } catch (_) {
      // non-critical
    }

    // 2. React state reset
    if (setVegetableOrder) setVegetableOrder([]);

    // 3. localStorage / sessionStorage cleanup
    localStorage.removeItem("orderSummary");
    localStorage.removeItem("vegbazar_cart");
    sessionStorage.removeItem("pendingOrderData");
  }, [setVegetableOrder]);

  const isCustomOrder = useMemo(() => {
    return orderType === "custom" || getOrderItems(vegetableOrder).length > 0;
  }, [orderType, vegetableOrder]);

  const isBasketOrder = useMemo(() => {
    return (
      orderType === "basket" ||
      (selectedOffer && selectedVegetables?.length > 0)
    );
  }, [orderType, selectedOffer, selectedVegetables]);

  // ─── total amount ─────────────────────────────────────────────────────────
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

      const delivery = summary?.deliveryCharges ?? 30;
      return subtotal > 0 ? subtotal + delivery : 0;
    }

    if (isBasketOrder && selectedOffer) {
      const offerPrice = selectedOffer.price || 0;
      const discount = couponCode?.discount || 0;
      const deliveryCharge = selectedOffer.deliveryCharges ?? 30;
      return Math.max(0, offerPrice - discount) + deliveryCharge;
    }

    return 0;
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedOffer, couponCode]);

  // ─── actual charge amount after wallet deduction ──────────────────────────
  // Always use amountAfterWallet when provided (passed from VegetableCart).
  // Razorpay must only charge the remaining amount, not the full total.
  const chargeAmount = useMemo(() => {
    if (amountAfterWallet !== null && amountAfterWallet !== undefined) {
      return Math.max(0, amountAfterWallet);
    }
    return totalAmount;
  }, [amountAfterWallet, totalAmount]);

  const displayAmount = chargeAmount;

  // ─── load Razorpay script ─────────────────────────────────────────────────
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

  // ─── build order data ─────────────────────────────────────────────────────
  const buildOrderData = useCallback(
    (orderId) => {
      try {
        const extractedCouponCode =
          typeof couponCode === "string" ? couponCode : couponCode?.code || null;

        if (isCustomOrder && vegetableOrder) {
          const items = getOrderItems(vegetableOrder);
          const summary = getOrderSummary(vegetableOrder);

          const selectedVegetablesData = (items || []).map((item) => ({
            vegetable: item.id || item.vegetableId,
            weight: item.weight,
            quantity: item.quantity,
            pricePerUnit: parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
            subtotal:
              (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
              (item.quantity || 0),
            isFromBasket: false,
          }));

          return {
            orderId,
            orderType: "custom",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress?._id || null,
            selectedVegetables: selectedVegetablesData,
            vegetablesTotal:
              summary?.subtotal ||
              items.reduce((total, item) => {
                const price = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
                return total + price * (item.quantity || 0);
              }, 0),
            totalAmount,
            paymentMethod: walletCreditUsed > 0 ? "WALLET_ONLINE" : "ONLINE",
            walletCreditUsed,
            finalPayableAmount: amountAfterWallet ?? totalAmount,
            orderStatus: "placed",
            orderDate: new Date().toISOString(),
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };
        }

        if (isBasketOrder) {
          return {
            orderId,
            orderType: "basket",
            customerInfo: customerInfo || formData || {},
            deliveryAddressId: deliveryAddress?._id || null,
            selectedBasket: selectedOffer?._id || selectedOffer?.id || selectedOffer,
            selectedVegetables: selectedVegetables || [],
            orderDate: new Date().toISOString(),
            totalAmount,
            paymentMethod: walletCreditUsed > 0 ? "WALLET_ONLINE" : "ONLINE",
            walletCreditUsed,
            finalPayableAmount: amountAfterWallet ?? totalAmount,
            orderStatus: "placed",
            couponCode: extractedCouponCode,
            couponDiscount: couponCode?.discount || 0,
          };
        }

        throw new Error("Invalid order type");
      } catch (error) {
        console.error("❌ Error building order data:", error);
        throw error;
      }
    },
    [
      isCustomOrder, isBasketOrder, vegetableOrder, formData, customerInfo,
      deliveryAddress, selectedOffer, selectedVegetables, totalAmount,
      couponCode, walletCreditUsed, amountAfterWallet,
    ],
  );

  // ─── create & open Razorpay ───────────────────────────────────────────────
  const createOrder = async () => {
    if (isLoading) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    try {
      if (!customerInfo?.name || !customerInfo?.mobile) {
        throw new Error("Customer information is incomplete");
      }

      // Validate full order total (not chargeAmount — wallet may cover everything)
      if (totalAmount <= 0) {
        throw new Error("Invalid order amount");
      }

      const extractedCouponCode =
        typeof couponCode === "string" ? couponCode : couponCode?.code || null;

      if (!scriptLoaded) {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }
      }

      const orderData = buildOrderData(null);

      const result = await axios.post(`/api/orders/create-order`, orderData, {
        timeout: 15000,
      });

      if (!result?.data?.data?.razorpayOrder?.id) {
        throw new Error("Failed to create order. Please try again.");
      }

      const razorpayOrderId = result.data.data.razorpayOrder.id;
      const actualOrderId = result.data.data.orderData.orderId;
      const actualChargeAmount = result.data.data.razorpayOrder.amount;
      // Use backend's Razorpay amount (already wallet-adjusted).
      // Fall back to chargeAmount (amountAfterWallet) — never full totalAmount.
      const amount = actualChargeAmount || Math.round(chargeAmount * 100);
      const currency = "INR";

      orderData.orderId = actualOrderId;
      sessionStorage.setItem("pendingOrderData", JSON.stringify(orderData));

      const description = isCustomOrder
        ? "Custom Vegetable Order"
        : selectedOffer?.title || "Basket Order";

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SZLIBsr5d3H2uH",
        amount,
        currency,
        name: "VegBazar",
        description,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: actualOrderId,
              orderType: isCustomOrder ? "custom" : "basket",
              customerInfo,
              deliveryAddressId: deliveryAddress?._id || null,
              couponCode: extractedCouponCode,
              totalAmount,           // full order total (for records)
              walletCreditUsed,      // wallet portion
              finalPayableAmount: chargeAmount, // actual Razorpay charged amount
            };

            if (isCustomOrder && vegetableOrder) {
              const items = getOrderItems(vegetableOrder);
              verifyData.selectedVegetables = items.map((item) => ({
                vegetable: item.id || item.vegetableId,
                weight: item.weight,
                quantity: item.quantity,
                pricePerUnit: parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
              }));
            } else if (isBasketOrder) {
              verifyData.selectedBasket =
                selectedOffer?._id || selectedOffer?.id || selectedOffer;
              verifyData.selectedVegetables = selectedVegetables;
            }

            const verifyResult = await axios.post(
              `/api/orders/verify-payment`,
              verifyData,
              { timeout: 15000 },
            );

            if (verifyResult.data.success) {
              // ── FIX: clear cart fully after successful online payment ──────
              await clearCartAfterOrder();

              // refresh wallet balance if wallet was used
              if (walletCreditUsed > 0) await refreshBalance();

              setIsOrderPlaced(true);

              if (onSuccess) {
                onSuccess();
              } else {
                navigate("/order-success", {
                  state: { orderData: verifyResult.data.data || verifyResult.data },
                });
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            if (isMounted) {
              setError(
                `Payment received but verification failed. Your payment ID: ${response.razorpay_payment_id}. Please contact support.`,
              );
            }
          } finally {
            if (isMounted) setIsLoading(false);
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
          orderId: actualOrderId,
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

      let errorMessage = "Unable to initiate payment. Please try again.";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      if (isMounted) setIsLoading(false);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
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
          onClick={() => { setError(null); createOrder(); }}
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

      {totalAmount > 0 ? (  // use totalAmount — chargeAmount can be 0 when wallet covers all
        <>
          <button
            onClick={createOrder}
            disabled={isCheckoutDisabled || isLoading}
            className={`w-full font-funnel py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 ${
              isCheckoutDisabled || isLoading
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
                Pay Now ₹{displayAmount.toFixed(2)}
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
                    {" "}- ₹{couponCode.discount} (Coupon)
                  </span>
                )}
                {` + ₹${selectedOffer.deliveryCharges ?? 30} delivery`}
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
                  ? "Free Delivery (Order above ₹269)"
                  : `Includes ₹${vegetableOrder?.summary?.deliveryCharges ?? 30} delivery charge`}
              </div>
              {couponCode && (typeof couponCode === "string" || couponCode.code) && (
                <div className="text-green-600 font-semibold">
                  Coupon "{typeof couponCode === "string" ? couponCode : couponCode.code}" applied ✓
                </div>
              )}
              {walletCreditUsed > 0 && (
                <div className="text-[#0e540b] font-semibold">
                  ₹{walletCreditUsed.toFixed(2)} paid via wallet
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