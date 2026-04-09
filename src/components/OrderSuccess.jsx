import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  MapPin,
  Copy,
  Check,
  AlertCircle,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";
import { useWallet } from "../Context/WalletContext";
import CashbackModal from "./CashbackModal";

// ─── helpers ──────────────────────────────────────────────────────────────────

const getVegetableName = (veg) => {
  if (!veg) return "Unknown";
  if (veg.name) return veg.name;
  if (veg.vegetable?.name) return veg.vegetable.name;
  if (typeof veg === "string") return veg;
  return "Unknown Vegetable";
};

const PAYMENT_METHOD_LABELS = {
  COD: "Cash on Delivery",
  ONLINE: "Online Payment",
  WALLET: "Wallet",
  WALLET_COD: "Wallet + Cash on Delivery",
  WALLET_ONLINE: "Wallet + Online",
};

// ─── main component ───────────────────────────────────────────────────────────


const OrderSuccess = ({ orderData: propOrderData, onNewOrder }) => {
  const location = useLocation();
  const { navigate } = useOrderContext();
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();

  const [copied, setCopied] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);

  // ── resolve orderData from prop OR router state ───────────────────────────
  const rawOrderData = useMemo(
    () => propOrderData || location.state?.orderData || null,
    [propOrderData, location.state]
  );

  // Unwrap { data: { ... } } API envelope if present
  const orderData = useMemo(
    () => rawOrderData?.data || rawOrderData,
    [rawOrderData]
  );

  // ── guard: redirect when no data available ────────────────────────────────
  useEffect(() => {
    if (!orderData) navigate("/offers");
  }, [orderData, navigate]);

  // ── cashback modal ────────────────────────────────────────────────────────
  useEffect(() => {
    if (orderData?.cashbackAmount && orderData.cashbackAmount > 0) {
      refreshBalance();
      const t = setTimeout(() => setShowCashbackModal(true), 500);
      return () => clearTimeout(t);
    }
  }, [orderData, refreshBalance]);

  // ── customerInfo ──────────────────────────────────────────────────────────
  const customerInfo = useMemo(() => {
    if (user) {
      return {
        name: user.username || user.name || orderData?.customerInfo?.name || "N/A",
        mobile: user.phone || user.mobile || orderData?.customerInfo?.mobile || "N/A",
        email: user.email || orderData?.customerInfo?.email || null,
        address: orderData?.customerInfo?.address || null,
        area: orderData?.customerInfo?.area || null,
        city: orderData?.customerInfo?.city || null,
      };
    }
    return orderData?.customerInfo || {};
  }, [user, orderData]);

  // ── orderInfo ─────────────────────────────────────────────────────────────
  const orderInfo = useMemo(() => {
    if (!orderData) {
      return {
        orderId: "N/A",
        orderType: "basket",
        packageTitle: "N/A",
        price: 0,
        subtotal: 0,
        discount: 0,
        delivery: 0,
        totalAmount: 0,
        finalPayableAmount: 0,
        selectedVegetables: [],
        walletUsed: 0,
        remainingAmount: 0,
      };
    }

    const {
      orderId = "N/A",
      orderType = "basket",
      vegetablesTotal = 0,
      couponDiscount = 0,
      deliveryCharges = 0,
      totalAmount = 0,
      finalPayableAmount,
      selectedVegetables = [],
      selectedOffer = {},
      walletUsed = 0,
      walletDeduction = 0,
      walletCreditUsed = 0,
      remainingAmount = 0,
    } = orderData;

    const packageTitle =
      orderType === "custom"
        ? "Custom Selection"
        : orderType === "basket"
        ? selectedOffer?.title || "Basket Package"
        : "N/A";

    const effectiveWalletUsed = walletUsed || walletDeduction || walletCreditUsed || 0;

    // finalPayableAmount = what customer actually paid (after wallet).
    // Fall back to computing it.
    const computedFinalPayable =
      finalPayableAmount != null
        ? finalPayableAmount
        : Math.max(0, totalAmount - effectiveWalletUsed);

    return {
      orderId,
      orderType,
      packageTitle,
      price: selectedOffer?.price || vegetablesTotal || 0,
      subtotal: vegetablesTotal || selectedOffer?.price || 0,
      discount: couponDiscount,
      delivery: deliveryCharges,
      totalAmount,
      finalPayableAmount: computedFinalPayable,
      selectedVegetables,
      walletUsed: effectiveWalletUsed,
      remainingAmount,
    };
  }, [orderData]);

  // ── displayVegetables ─────────────────────────────────────────────────────
  const displayVegetables = useMemo(() => {
    const vegs = orderInfo.selectedVegetables || [];
    return vegs.map((veg, index) => {
      const vegData = veg.vegetable || veg;
      return {
        key: `veg-${index}`,
        name: getVegetableName(veg),
        quantity: veg?.quantity || 1,
        weight: veg?.weight || vegData?.weight || "N/A",
        price: veg?.pricePerUnit || veg?.price || 0,
        subtotal:
          veg?.subtotal ||
          (veg?.pricePerUnit || veg?.price || 0) * (veg?.quantity || 1),
      };
    });
  }, [orderInfo.selectedVegetables]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderInfo.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNewOrder = () => {
    sessionStorage.removeItem("lastOrderData");
    sessionStorage.removeItem("orderJustPlaced");
    localStorage.removeItem("orderSummary");
    localStorage.removeItem("vegbazar_cart");
    if (onNewOrder) onNewOrder();
    navigate("/");
    window.scrollTo(0, 0);
  };

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-[#f3efe6] flex items-center justify-center py-6 px-3 sm:px-4 pt-20">
      <div className="max-w-2xl w-full bg-[#f3efe6] p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">

        {/* ── Success Header ── */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-[#0e540b] animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
          </div>
          <h2 className="text-xl font-amiko sm:text-2xl md:text-3xl font-bold text-[#0e540b] mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-sm sm:text-base font-funnel text-gray-600">
            Thank you for your order
          </p>
        </div>

        {/* ── Order Summary Card ── */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl mb-6 border border-green-200">
          <h3 className="font-bold text-base font-funnel sm:text-lg mb-4 text-[#0e540b] flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0" />
            Order Summary
          </h3>

          {/* ── Info Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">

            {/* Order ID */}
            <div className="flex items-start gap-2 sm:col-span-2">
              <Package className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">Order ID</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 font-funnel break-all">
                    {orderInfo.orderId}
                  </span>
                  {orderInfo.orderId && orderInfo.orderId !== "N/A" && (
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1.5 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-green-600" />
                        : <Copy className="w-4 h-4 text-gray-600" />}
                    </button>
                  )}
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-funnel mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Order ID copied!
                  </p>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">Customer Name</p>
                <p className="font-semibold text-gray-800 font-funnel break-words">
                  {customerInfo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">Mobile</p>
                <p className="font-semibold text-gray-800 font-funnel">
                  {customerInfo?.mobile || "N/A"}
                </p>
              </div>
            </div>

            {/* Email (optional) */}
            {customerInfo?.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-funnel text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 font-funnel truncate">
                    {customerInfo.email}
                  </p>
                </div>
              </div>
            )}

            {/* Package / Order Type */}
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">
                  {orderInfo.orderType === "custom" ? "Order Type" : "Package"}
                </p>
                <p className="font-semibold text-gray-800 font-funnel break-words">
                  {orderInfo.packageTitle}
                </p>
              </div>
            </div>

            {/* Total Amount (quick glance) */}
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-funnel text-gray-500">Amount Paid</p>
                <p className="font-bold text-[#0e540b] text-lg sm:text-xl">
                  ₹{orderInfo.finalPayableAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Save Order ID notice (only for COD where no email confirmation) ── */}
          {(orderData?.paymentMethod === "COD" || orderData?.paymentMethod === "WALLET_COD") && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-funnel text-yellow-700">
                <strong>Important:</strong> Please save your Order ID for tracking. We do not send order confirmations via email.
              </p>
            </div>
          )}

          {/* ── Price Breakdown ── */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="space-y-2 text-sm">

              {/* Plan / subtotal row — label differs by order type */}
              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">
                  {orderInfo.orderType === "basket" ? "Plan Price" : "Subtotal"}
                </span>
                <span className="font-assistant font-semibold text-gray-800">
                  ₹{(orderInfo.orderType === "basket" ? orderInfo.price : orderInfo.subtotal).toFixed(2)}
                </span>
              </div>

              {/* Coupon */}
              {orderInfo.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-assistant">Coupon Discount</span>
                  <span className="font-assistant font-semibold">
                    -₹{orderInfo.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Delivery */}
              <div className="flex justify-between items-center">
                <span className="font-assistant text-gray-600">Delivery Charge</span>
                <span className="font-assistant font-semibold text-gray-800">
                  {orderInfo.delivery === 0 ? "FREE" : `₹${orderInfo.delivery.toFixed(2)}`}
                </span>
              </div>

              {/* Wallet deduction section */}
              {orderInfo.walletUsed > 0 && (
                <>
                  <div className="border-t border-dashed border-green-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-assistant text-gray-600">Bill Total</span>
                      <span className="font-assistant font-semibold text-gray-800">
                        ₹{orderInfo.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-[#0e540b] flex items-center gap-1">
                      <Wallet size={13} /> Wallet Deduction
                    </span>
                    <span className="font-assistant font-semibold text-[#0e540b]">
                      -₹{orderInfo.walletUsed.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {/* Grand total / Amount Paid */}
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-funnel font-bold text-gray-800">
                    {orderInfo.walletUsed > 0 ? "Amount Paid" : "Total"}
                  </span>
                  <span className="font-amiko font-bold text-[#0e540b] text-lg">
                    ₹{orderInfo.finalPayableAmount.toFixed(2)}
                  </span>
                </div>
                {orderInfo.walletUsed > 0 && (
                  <p className="font-funnel text-[10px] text-gray-400 text-right mt-0.5">
                    ₹{orderInfo.walletUsed.toFixed(2)} paid via wallet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Wallet banner ── */}
          {orderInfo.walletUsed > 0 && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
              <Wallet className="w-4 h-4 text-[#0e540b] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-funnel font-bold text-[#0e540b]">Wallet Used</p>
                <p className="text-xs font-funnel text-gray-700 mt-0.5">
                  ₹{orderInfo.walletUsed.toFixed(2)} was deducted from your wallet balance for this order.
                </p>
              </div>
            </div>
          )}

          {/* ── Delivery Address ── */}
          {customerInfo?.address && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-funnel text-gray-500 mb-1">Delivery Address</p>
                  <p className="text-sm font-assistant text-gray-700 break-words">
                    {customerInfo.address}
                    {customerInfo.area && `, ${customerInfo.area}`}
                    {customerInfo.city && `, ${customerInfo.city}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Selected Vegetables ── */}
          {displayVegetables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="font-semibold font-funnel text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4 text-[#0e540b] flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>

              {orderInfo.orderType === "custom" ? (
                <div className="space-y-2">
                  {displayVegetables.map((veg) => (
                    <div
                      key={veg.key}
                      className="bg-[#f3efe6] p-2 sm:p-3 rounded-lg border border-green-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800 font-assistant text-sm break-words">
                          {veg.name}
                        </span>
                        {veg.weight && veg.weight !== "N/A" && (
                          <span className="text-xs text-gray-600 font-assistant ml-2">
                            ({veg.weight})
                          </span>
                        )}
                      </div>
                      {veg.quantity && veg.price > 0 && (
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-gray-600 font-assistant">
                            ₹{parseFloat(veg.price).toFixed(2)} × {veg.quantity}
                          </div>
                          <div className="font-semibold text-green-700 text-sm font-assistant">
                            ₹{veg.subtotal.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displayVegetables.map((veg) => (
                    <span
                      key={veg.key}
                      className="bg-green-100 font-assistant text-green-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-funnel font-medium border border-green-200"
                    >
                      {veg.name}
                      {veg.weight && veg.weight !== "N/A" && ` (${veg.weight})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Payment Status Badge ── */}
        {orderData?.paymentStatus && (
          <div className="mb-6 p-4 rounded-xl border-l-4 border-green-600 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 font-assistant text-sm sm:text-base">
                  Payment Status:{" "}
                  <span className="capitalize text-green-700">
                    {orderData.paymentStatus.replace(/_/g, " ")}
                  </span>
                </p>
                {orderData.paymentMethod && (
                  <p className="text-xs sm:text-sm text-gray-600 font-assistant mt-1">
                    Payment Method:{" "}
                    <span className="font-semibold">
                      {PAYMENT_METHOD_LABELS[orderData.paymentMethod] || orderData.paymentMethod}
                    </span>
                  </p>
                )}
                {orderData.razorpayPaymentId && (
                  <p className="text-xs text-gray-500 font-assistant mt-1">
                    Payment ID: {orderData.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <button
          onClick={handleNewOrder}
          className="w-full bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base font-assistant"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          Place Another Order
        </button>
      </div>

      {/* ── Cashback Modal ── */}
      <CashbackModal
        isOpen={showCashbackModal}
        cashbackAmount={orderData?.cashbackAmount || 0}
        newBalance={balance}
        onClose={() => setShowCashbackModal(false)}
      />
    </div>
  );
};

export default OrderSuccess;