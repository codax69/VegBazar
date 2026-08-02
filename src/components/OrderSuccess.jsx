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

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-4 px-3 sm:px-4 transition-colors duration-150">
      <div className="max-w-2xl w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 sm:p-6 md:p-8 rounded-[12px]">

        {/* ── Success Header ── */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CheckCircle className="h-14 w-14 sm:h-16 sm:w-16 text-[var(--color-brand-green)]" />
          </div>
          <h2 className="text-xl font-display sm:text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-1">
            Order Placed Successfully!
          </h2>
          <p className="text-xs sm:text-sm font-body text-[var(--color-text-secondary)]">
            Thank you for your order
          </p>
          <div className="mt-4 rounded-[10px] bg-[var(--color-amber-tint)] p-3 text-left text-xs font-body text-[var(--color-amber-ink)] border border-[var(--color-border)]">
            <p className="font-medium">Important notice:</p>
            <p>This is a demo order only. No home delivery will happen because the site services are currently closed.</p>
          </div>
        </div>

        {/* ── Order Summary Card ── */}
        <div className="bg-[var(--color-bg-app)] p-4 sm:p-5 rounded-[10px] mb-6 border border-[var(--color-border)]">
          <h3 className="font-display text-base sm:text-lg font-semibold mb-3 text-[var(--color-brand-green)] flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0" />
            Order Summary
          </h3>

          {/* ── Info Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-body">

            {/* Order ID */}
            <div className="flex items-start gap-2 sm:col-span-2">
              <Package className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[var(--color-text-muted)]">Order ID</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-medium text-[var(--color-text-primary)] break-all">
                    {orderInfo.orderId}
                  </span>
                  {orderInfo.orderId && orderInfo.orderId !== "N/A" && (
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1 hover:bg-[var(--color-tint-green)] rounded transition-colors flex-shrink-0"
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-[var(--color-brand-green)]" />
                        : <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
                    </button>
                  )}
                </div>
                {copied && (
                  <p className="text-[10px] text-[var(--color-brand-green)] font-mono mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Order ID copied!
                  </p>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[var(--color-text-muted)]">Customer Name</p>
                <p className="font-medium text-[var(--color-text-primary)] break-words">
                  {customerInfo?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[var(--color-text-muted)]">Mobile</p>
                <p className="font-mono text-[var(--color-text-primary)]">
                  {customerInfo?.mobile || "N/A"}
                </p>
              </div>
            </div>

            {/* Email (optional) */}
            {customerInfo?.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--color-text-muted)]">Email</p>
                  <p className="font-mono text-[var(--color-text-primary)] truncate">
                    {customerInfo.email}
                  </p>
                </div>
              </div>
            )}

            {/* Package / Order Type */}
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {orderInfo.orderType === "custom" ? "Order Type" : "Package"}
                </p>
                <p className="font-medium text-[var(--color-text-primary)] break-words">
                  {orderInfo.packageTitle}
                </p>
              </div>
            </div>

            {/* Total Amount (quick glance) */}
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[var(--color-text-muted)]">Amount Paid</p>
                <p className="font-mono font-medium text-[var(--color-brand-green)] text-base sm:text-lg">
                  ₹{orderInfo.finalPayableAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Price Breakdown ── */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="space-y-2 text-xs font-body">

              {/* Plan / subtotal row */}
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">
                  {orderInfo.orderType === "basket" ? "Plan Price" : "Subtotal"}
                </span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  ₹{(orderInfo.orderType === "basket" ? orderInfo.price : orderInfo.subtotal).toFixed(2)}
                </span>
              </div>

              {/* Coupon */}
              {orderInfo.discount > 0 && (
                <div className="flex justify-between items-center text-[var(--color-brand-green)] font-mono">
                  <span>Coupon Discount</span>
                  <span>
                    -₹{orderInfo.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Delivery */}
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Delivery Charge</span>
                <span className="font-mono text-[var(--color-text-primary)]">
                  {orderInfo.delivery === 0 ? "FREE" : `₹${orderInfo.delivery.toFixed(2)}`}
                </span>
              </div>

              {/* Wallet deduction section */}
              {orderInfo.walletUsed > 0 && (
                <>
                  <div className="border-t border-dashed border-[var(--color-border-strong)] pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)]">Bill Total</span>
                      <span className="font-mono text-[var(--color-text-primary)]">
                        ₹{orderInfo.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-brand-green)] font-mono">
                    <span className="flex items-center gap-1">
                      <Wallet size={13} /> Wallet Deduction
                    </span>
                    <span>
                      -₹{orderInfo.walletUsed.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {/* Grand total / Amount Paid */}
              <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-[var(--color-text-primary)]">
                    {orderInfo.walletUsed > 0 ? "Amount Paid" : "Total"}
                  </span>
                  <span className="font-mono font-medium text-[var(--color-brand-green)] text-base">
                    ₹{orderInfo.finalPayableAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Delivery Address ── */}
          {customerInfo?.address && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-start gap-2 text-xs font-body">
                <MapPin className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--color-text-muted)] mb-1">Delivery Address</p>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
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
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="font-display font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <ShoppingBag className="w-4 h-4 text-[var(--color-brand-green)] flex-shrink-0" />
                Selected Vegetables ({displayVegetables.length})
              </p>

              {orderInfo.orderType === "custom" ? (
                <div className="space-y-2 font-body text-xs">
                  {displayVegetables.map((veg) => (
                    <div
                      key={veg.key}
                      className="bg-[var(--color-bg-surface)] p-2.5 rounded-[8px] border border-[var(--color-border)] flex justify-between items-center"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {veg.name}
                        </span>
                        {veg.weight && veg.weight !== "N/A" && (
                          <span className="text-[11px] text-[var(--color-text-muted)] font-mono ml-1.5">
                            ({veg.weight})
                          </span>
                        )}
                      </div>
                      {veg.quantity && veg.price > 0 && (
                        <div className="text-right font-mono">
                          <span className="font-medium text-[var(--color-brand-green)]">
                            ₹{veg.subtotal.toFixed(2)}
                          </span>
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