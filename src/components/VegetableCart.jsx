import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  CheckCircle,
  Wallet,
  AlertCircle,
  BarChart2,
  Sparkles,
  ChevronRight,
  X,
  TrendingUp,
  Package,
  Scale,
  RefreshCw,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useAuth } from "../Context/AuthContext.jsx";
import { useWallet } from "../Context/WalletContext.jsx";
import axios from "axios";
import RazorpayPayment from "./RazorpayPayment";
import CouponCodeSection from "./CouponCodeSection";
import AddressSection from "./AddressSection";
import OrderLoading from "./OrderLoading";

// ─── Auth header helper ───────────────────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── helpers ──────────────────────────────────────────────────────────────────
const getOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order)) return order;
  if (order.items && Array.isArray(order.items)) return order.items;
  return [];
};

const getOrderSummary = (order) => order?.summary || null;

const normalizeItem = (item) => ({
  ...item,
  vegetableId: item.vegetableId || item.id || item.product?._id || item.product,
  id: item.id || item.vegetableId || item.product?._id || item.product,
  image: item.image || item.product?.image || "/placeholder-vegetable.jpg",
  name: item.name || item.product?.name || "Unknown",
  pricePerUnit: item.pricePerUnit || item.price || 0,
  marketPrice: item.marketPrice || 0,
  selectedWeightPrice: item.selectedWeightPrice || {},
  totalPrice: item.totalPrice || 0,
});

const generateOrderId = (orderCount) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const orderNum = String(orderCount).padStart(3, "0");
  return `ORD${year}${month}${day}${orderNum}`;
};

// ─── Cart API helpers ─────────────────────────────────────────────────────────
const cartApi = {
  getCart: (params = {}) =>
    axios.get("/api/cart", { headers: authHeader(), params }),

  addItem: (payload) =>
    axios.post("/api/cart/add", payload, { headers: authHeader() }),

  updateItem: (payload) =>
    axios.put("/api/cart/update", payload, { headers: authHeader() }),

  removeItem: (payload) =>
    axios.delete("/api/cart/remove", { headers: authHeader(), data: payload }),

  clearCart: () =>
    axios.delete("/api/cart/clear", { headers: authHeader() }),

  applyCoupon: (payload) =>
    axios.post("/api/cart/coupon/apply", payload, { headers: authHeader() }),

  removeCoupon: () =>
    axios.delete("/api/cart/coupon", { headers: authHeader() }),

  getRecommendations: (limit = 5) =>
    axios.get("/api/cart/recommendations", { headers: authHeader(), params: { limit } }),

  getAnalytics: () =>
    axios.get("/api/cart/analytics", { headers: authHeader() }),

  mergeGuestCart: (guestCartItems) =>
    axios.post("/api/cart/merge", { guestCartItems }, { headers: authHeader() }),
};

// ─── Map backend cart items → normalised order items ─────────────────────────
const mapBackendCartToItems = (backendCart) => {
  if (!backendCart?.items) return [];
  return backendCart.items.map((item) => normalizeItem(item));
};

// ─── main component ───────────────────────────────────────────────────────────
const VegetableCart = () => {
  const {
    vegetableOrder,
    setVegetableOrder,
    navigate,
    setPaymentMethod,
    paymentMethod,
    setIsOrderPlaced,
  } = useOrderContext();
  const { user } = useAuth();
  const { wallet, balance, refreshBalance } = useWallet();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderCount, setOrderCount] = useState(1);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(20);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [defaultAddress, setDefaultAddress] = useState(null);

  // Wallet state
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletDeduction, setWalletDeduction] = useState(0);

  // Backend cart state
  const [backendCart, setBackendCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);

  // Recommendations & analytics
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Guest cart merge tracking
  const guestMergeAttempted = useRef(false);

  const items = useMemo(() => getOrderItems(vegetableOrder), [vegetableOrder]);
  const summary = useMemo(() => getOrderSummary(vegetableOrder), [vegetableOrder]);

  const subtotal = useMemo(() => {
    if (summary?.subtotal) return summary.subtotal;
    return items.reduce((total, item) => {
      const price = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [items, summary]);

  const total = useMemo(() => {
    if (summary?.totalAmount) return summary.totalAmount;
    return subtotal - couponDiscount + deliveryCharge;
  }, [summary, subtotal, couponDiscount, deliveryCharge]);

  // ── FIX 1: merged wallet effect — recalculates on all relevant deps ──────────
  useEffect(() => {
    if (!useWalletBalance) {
      setWalletDeduction(0);
      // Don't reset paymentMethod here — user may have already selected COD/ONLINE
      return;
    }

    const deduction = Math.min(balance, total);
    setWalletDeduction(deduction);

    const walletCoversAll = balance >= total;

    if (walletCoversAll) {
      setPaymentMethod("WALLET");
    } else {
      // Partial wallet — clear stale "WALLET" method, keep COD/ONLINE if already chosen
      if (paymentMethod === "WALLET") {
        setPaymentMethod("COD");
      }
    }
  }, [useWalletBalance, balance, total, paymentMethod]);

  const amountAfterWallet = useMemo(
    () => Math.max(0, total - walletDeduction),
    [total, walletDeduction]
  );

  const isWalletSufficient = balance >= total;

  // ── FIX 2: isCheckoutDisabled — handles partial wallet + stale "WALLET" method ─
  const isCheckoutDisabled =
    !selectedAddress ||
    (!useWalletBalance && !paymentMethod) ||
    (useWalletBalance && !isWalletSufficient && (!paymentMethod || paymentMethod === "WALLET"));

  const customerInfo = useMemo(
    () => ({
      name: user?.username || "",
      mobile: user?.phone || "",
      email: user?.email || "",
    }),
    [user]
  );

  // ── STEP 1: On mount – merge guest cart then load backend cart ────────────
  useEffect(() => {
    if (!user) return;

    const mergeAndLoad = async () => {
      setCartLoading(true);
      try {
        if (!guestMergeAttempted.current) {
          guestMergeAttempted.current = true;
          const saved = localStorage.getItem("orderSummary");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              const guestItems = (parsed?.items || []).map((item) => ({
                product: item.vegetableId || item.id,
                quantity: item.quantity,
                weight: item.weight,
                price: item.pricePerUnit || item.price || 0,
                totalPrice: item.totalPrice || 0,
              }));
              if (guestItems.length > 0) {
                await cartApi.mergeGuestCart(guestItems);
              }
            } catch (_) {
              // silent – merge failure shouldn't block load
            } finally {
              localStorage.removeItem("orderSummary");
              localStorage.removeItem("vegbazar_cart");
            }
          }
        }

        await loadBackendCart();
      } finally {
        setCartLoading(false);
      }
    };

    mergeAndLoad();
  }, [user]);

  // ── Load backend cart ─────────────────────────────────────────────────────
  const loadBackendCart = useCallback(async () => {
    try {
      const { data } = await cartApi.getCart();
      const cart = data?.data?.cart;
      setBackendCart(cart);

      if (cart) {
        const normalizedItems = mapBackendCartToItems(cart);
        setVegetableOrder((prev) => ({
          items: normalizedItems,
          summary: prev?.summary || {},
        }));

        if (cart.coupon) {
          setAppliedCoupon(cart.coupon);
          setCouponDiscount(cart.coupon.discountAmount || 0);
        }
      }
    } catch (err) {
      console.error("❌ Failed to load backend cart:", err);
    }
  }, [setVegetableOrder]);

  // ── Fetch addresses ───────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchDefaultAddress = async () => {
      const userId = user?._id || user?.id;
      if (!userId) return;
      try {
        const { data } = await axios.get("/api/addresses/active", {
          headers: authHeader(),
        });
        if (mounted && data?.data?.defaultAddress) {
          setDefaultAddress(data.data.defaultAddress);
          setSelectedAddress(data.data.defaultAddress);
        }
      } catch (err) {
        console.error("❌ Error fetching default address:", err);
      }
    };
    fetchDefaultAddress();
    return () => { mounted = false; };
  }, [user]);

  // ── Fetch order count ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchOrderCount = async () => {
      try {
        const { data } = await axios.get("/api/orders/today/total");
        if (mounted) setOrderCount((data?.data?.count || 0) + 1);
      } catch (err) {
        console.error("❌ Error fetching order count:", err);
      }
    };
    fetchOrderCount();
    return () => { mounted = false; };
  }, []);

  // ── Fetch recommendations when cart has items ─────────────────────────────
  useEffect(() => {
    if (items.length === 0) { setRecommendations([]); return; }
    let mounted = true;
    const fetchRecs = async () => {
      setRecLoading(true);
      try {
        const { data } = await cartApi.getRecommendations(6);
        if (mounted) setRecommendations(data?.data?.recommendations || []);
      } catch (_) {
        // recommendations are non-critical
      } finally {
        if (mounted) setRecLoading(false);
      }
    };
    fetchRecs();
    return () => { mounted = false; };
  }, [items.length]);

  // ── Analytics fetch ───────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await cartApi.getAnalytics();
      setAnalytics(data?.data);
    } catch (err) {
      console.error("❌ Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const handleToggleAnalytics = useCallback(async () => {
    if (!showAnalytics && !analytics) await fetchAnalytics();
    setShowAnalytics((v) => !v);
  }, [showAnalytics, analytics, fetchAnalytics]);

  // ── Price calculation API ─────────────────────────────────────────────────
  const calculatePrice = useCallback(async (orderItems, couponCode = null) => {
    const normalizedItems = orderItems.map((item) => ({
      vegetableId: item.vegetableId || item.id,
      weight: item.weight,
      quantity: item.quantity,
    }));
    const payload = { items: normalizedItems };
    if (couponCode) payload.couponCode = couponCode;
    const { data } = await axios.post("/api/orders/calculate-price", payload);
    return data.data;
  }, []);

  // ── Coupon handlers ───────────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(
    async (couponCode) => {
      try {
        try {
          const { data } = await cartApi.applyCoupon({ couponCode });
          const cart = data?.data?.cart;
          if (cart) {
            setBackendCart(cart);
            setAppliedCoupon({ code: couponCode, applied: true, discount: data?.data?.appliedCoupon?.discountAmount });
            setCouponDiscount(data?.data?.appliedCoupon?.discountAmount || 0);
            return;
          }
        } catch (_) {
          // fall through to order-calculate-price
        }

        const updatedPrices = await calculatePrice(items, couponCode);
        if (updatedPrices.coupon?.applied) {
          setAppliedCoupon(updatedPrices.coupon);
          setCouponDiscount(updatedPrices.coupon.discount || 0);
          setDeliveryCharge(updatedPrices.summary.deliveryCharges || 0);
          setVegetableOrder({ ...vegetableOrder, items, summary: updatedPrices.summary, coupon: updatedPrices.coupon });
        } else {
          throw new Error(updatedPrices.coupon?.error || "Invalid coupon code");
        }
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || "Failed to apply coupon");
      }
    },
    [items, vegetableOrder, calculatePrice, setVegetableOrder]
  );

  const handleRemoveCoupon = useCallback(async () => {
    try {
      await cartApi.removeCoupon().catch(() => { });
      const updatedPrices = await calculatePrice(items);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);
      setVegetableOrder({ ...vegetableOrder, items, summary: updatedPrices.summary, coupon: null });
    } catch (err) {
      console.error("❌ Failed to remove coupon:", err);
    }
  }, [items, vegetableOrder, calculatePrice, setVegetableOrder]);

  // ── Quantity / Remove ─────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (index, change) => {
      try {
        setLoading(true);
        setLoadingAction("Updating quantity...");
        const newQuantity = items[index].quantity + change;
        if (newQuantity <= 0) { await removeItem(index); return; }

        const item = items[index];

        await cartApi.updateItem({
          productId: item.vegetableId || item.id,
          weight: item.weight,
          quantity: newQuantity,
        }).catch((err) => console.warn("Cart API updateItem:", err.message));

        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], quantity: newQuantity };
        const updatedPrices = await calculatePrice(updatedItems, appliedCoupon?.code);

        const itemsWithPrices = updatedItems.map((it) => {
          const calc = updatedPrices.items.find(
            (i) => i.vegetableId === (it.id || it.vegetableId) && i.weight === it.weight
          );
          return calc ? { ...it, pricePerUnit: calc.pricePerUnit, totalPrice: calc.subtotal } : it;
        });

        setVegetableOrder(
          Array.isArray(vegetableOrder)
            ? itemsWithPrices
            : { items: itemsWithPrices, summary: updatedPrices.summary || {}, coupon: updatedPrices.coupon || appliedCoupon, timestamp: new Date().toISOString() }
        );
        if (updatedPrices.coupon?.discount) setCouponDiscount(updatedPrices.coupon.discount);
        setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);

        if (showAnalytics) await fetchAnalytics();
      } catch (err) {
        console.error("❌ Failed to update quantity:", err);
        alert("Failed to update quantity. Please try again.");
      } finally {
        setLoading(false);
        setLoadingAction("");
      }
    },
    [items, vegetableOrder, appliedCoupon, calculatePrice, setVegetableOrder, showAnalytics, fetchAnalytics]
  );

  const removeItem = useCallback(
    async (index) => {
      try {
        setLoading(true);
        setLoadingAction("Removing item...");
        const item = items[index];

        await cartApi.removeItem({
          productId: item.vegetableId || item.id,
          weight: item.weight,
        }).catch((err) => console.warn("Cart API removeItem:", err.message));

        const updatedItems = items.filter((_, i) => i !== index);

        if (updatedItems.length > 0) {
          const updatedPrices = await calculatePrice(updatedItems, appliedCoupon?.code);
          const itemsWithPrices = updatedItems.map((it) => {
            const calc = updatedPrices.items.find(
              (i) => i.vegetableId === (it.id || it.vegetableId) && i.weight === it.weight
            );
            return calc ? { ...it, pricePerUnit: calc.pricePerUnit, totalPrice: calc.subtotal } : it;
          });
          setVegetableOrder(
            Array.isArray(vegetableOrder)
              ? itemsWithPrices
              : { items: itemsWithPrices, summary: updatedPrices.summary || {}, coupon: updatedPrices.coupon || appliedCoupon, timestamp: new Date().toISOString() }
          );
          if (updatedPrices.coupon?.discount) setCouponDiscount(updatedPrices.coupon.discount);
          setDeliveryCharge(updatedPrices.summary.deliveryCharges || 20);
        } else {
          await cartApi.clearCart().catch(() => { });
          setVegetableOrder([]);
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setDeliveryCharge(20);
        }
      } catch (err) {
        console.error("❌ Failed to remove item:", err);
        alert("Failed to remove item. Please try again.");
      } finally {
        setLoading(false);
        setLoadingAction("");
      }
    },
    [items, vegetableOrder, appliedCoupon, calculatePrice, setVegetableOrder]
  );

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingAction("Placing your order...");

      if (!selectedAddress || (!useWalletBalance && !paymentMethod)) {
        alert("Please select both delivery address and payment method");
        return;
      }

      const normalizedItems = items.map((item) => ({
        ...item,
        vegetableId: item.vegetableId || item.id,
        id: item.id || item.vegetableId,
      }));
      const uniqueVegetables = normalizedItems.reduce((acc, item) => {
        const vegetableId = item.vegetableId || item.id;
        if (!vegetableId) return acc;
        const existingIndex = acc.findIndex(
          (v) => (v.vegetableId || v.id) === vegetableId && v.weight === item.weight
        );
        if (existingIndex >= 0) {
          acc[existingIndex].quantity += item.quantity;
          const ppu = parseFloat(acc[existingIndex].pricePerUnit) || 0;
          acc[existingIndex].totalPrice = ppu * acc[existingIndex].quantity;
        } else {
          acc.push({ ...item, vegetableId, id: vegetableId });
        }
        return acc;
      }, []);

      const priceDetails = await calculatePrice(uniqueVegetables, appliedCoupon?.code);
      const orderId = generateOrderId(orderCount);
      const userId = user?._id || user?.id;

      const finalTotal = priceDetails?.summary?.totalAmount || total;

      // ── FIX 3: recalculate walletUsed from finalTotal, then sync UI state ───
      const walletUsed = useWalletBalance ? Math.min(balance, finalTotal) : 0;
      setWalletDeduction(walletUsed); // keep UI in sync if price changed at checkout

      const remainingAmount = Math.max(0, finalTotal - walletUsed);

      // ── FIX 4: explicit effectivePaymentMethod — all 3 branches ─────────────
      let effectivePaymentMethod;
      if (useWalletBalance && walletUsed >= finalTotal) {
        effectivePaymentMethod = "WALLET";
      } else if (useWalletBalance && walletUsed > 0) {
        effectivePaymentMethod = paymentMethod === "COD" ? "WALLET_COD" : "WALLET_ONLINE";
      } else {
        effectivePaymentMethod = paymentMethod; // "COD" or "ONLINE"
      }

      const orderData = {
        orderId,
        orderType: "custom",
        userId: userId || null,
        customerInfo,
        deliveryAddressId: selectedAddress._id,
        selectedVegetables: uniqueVegetables.map((item) => ({
          vegetable: item.vegetableId || item.id,
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          pricePerUnit: parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
          subtotal: (parseFloat(item.pricePerUnit) || 0) * item.quantity,
          isFromBasket: false,
        })),
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discount || 0,
        vegetablesTotal: priceDetails?.summary?.subtotal || subtotal,
        deliveryCharges: priceDetails?.summary?.deliveryCharges || deliveryCharge,
        totalAmount: finalTotal,
        walletCreditUsed: walletUsed,
        finalPayableAmount: remainingAmount,
        remainingAmount,
        paymentMethod: effectivePaymentMethod,
        paymentStatus:
          effectivePaymentMethod === "WALLET"
            ? "completed"
            : effectivePaymentMethod === "COD" || effectivePaymentMethod === "WALLET_COD"
              ? "pending"
              : "awaiting_payment",
        orderStatus: "placed",
        orderDate: new Date().toISOString(),
      };

      if (
        effectivePaymentMethod === "WALLET" ||
        effectivePaymentMethod === "COD" ||
        effectivePaymentMethod === "WALLET_COD"
      ) {
        const res = await axios.post("/api/orders/create-order", orderData);

        await cartApi.clearCart().catch(() => { });

        sessionStorage.setItem("lastOrderData", JSON.stringify(res.data?.data || orderData));
        sessionStorage.setItem("orderJustPlaced", "true");

        setVegetableOrder([]);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setDeliveryCharge(20);
        setBackendCart(null);       // clear backend cart state
        setUseWalletBalance(false); // reset wallet toggle

        if (walletUsed > 0) await refreshBalance();

        setIsOrderPlaced(true);
        window.scrollTo(0, 0);
        navigate("/order-success", { state: { orderData: res.data?.data || orderData } });
      }
    } catch (err) {
      console.error("❌ Error creating order:", err);
      const errorMessage = err.response?.data?.message || err.message;
      alert(`Failed to create order: ${errorMessage}`);
      if (err.response?.status >= 500) navigate("/order-failed");
    } finally {
      setLoading(false);
      setLoadingAction("");
    }
  }, [
    selectedAddress, paymentMethod, items, vegetableOrder, orderCount,
    subtotal, total, appliedCoupon, deliveryCharge, calculatePrice,
    setVegetableOrder, setIsOrderPlaced, navigate, user, customerInfo,
    useWalletBalance, balance, walletDeduction, refreshBalance,
  ]);

  const handleContinueShopping = useCallback(() => navigate("/"), [navigate]);
  const handleBrowseVegetables = useCallback(() => { window.scrollTo(0, 0); navigate("/"); }, [navigate]);
  const handleChangeAddress = useCallback(() => navigate("/address"), [navigate]);

  if (loading) return <OrderLoading loadingText={loadingAction} loadingMsg="Please wait..." />;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={32} className="text-[#0e540b] animate-spin" />
          <p className="font-funnel text-sm text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] pt-5 py-14 lg:pb-0 transition-colors duration-150">
        <div className="container mx-auto px-4 md:py-4 lg:py-3">
          <div className="mb-4 md:mb-3">
            <div className="flex gap-1 flex-col items-center justify-between">
              <button
                onClick={handleContinueShopping}
                className="flex items-center gap-1 px-3 py-1.5 text-[var(--color-brand-green)] hover:bg-[var(--color-tint-green)] rounded-[10px] transition font-body text-xs font-medium"
              >
                <ArrowLeft size={16} className="mr-1" /> Continue Shopping
              </button>
              <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[var(--color-brand-green)]" /> Your Vegetable Bag
              </h2>
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)] p-8 rounded-[12px] border border-[var(--color-border)] text-center">
            <ShoppingBag size={48} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)] mb-1">Your cart is empty</h3>
            <p className="font-body text-[var(--color-text-muted)] mb-4 text-xs">Add fresh vegetables to get started!</p>
            <button
              onClick={handleBrowseVegetables}
              className="font-body px-5 py-2.5 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-[10px] font-medium text-xs transition"
            >
              Browse Vegetables
            </button>
          </div>
        </div>
      </div>
    );
  }

  const walletProps = {
    wallet,
    balance,
    useWalletBalance,
    setUseWalletBalance,
    walletDeduction,
    amountAfterWallet,
    isWalletSufficient,
    total,
  };

  return (
    <div className="max-w-7xl mx-auto py-2 sm:py-4 transition-colors duration-150">
      <div className="container mx-auto px-4 md:py-4 lg:py-3">

        {/* Header */}
        <div className="mb-4 md:mb-3">
          <div className="flex gap-1 flex-col items-center justify-baseline">
            <button
              onClick={handleContinueShopping}
              className="flex items-center gap-1 px-3 py-1.5 text-[var(--color-brand-green)] hover:bg-[var(--color-tint-green)] rounded-[10px] transition font-body text-xs font-medium"
            >
              <ArrowLeft size={16} className="mr-1" /> Continue Shopping
            </button>
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <ShoppingBag size={20} className="text-[var(--color-brand-green)]" /> Your Vegetable Bag
            </h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 md:gap-2.5">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 lg:w-2/3 space-y-3 md:space-y-2.5">

            {/* Mobile: coupon */}
            <div className="lg:hidden">
              <CouponCodeSection
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                subtotal={subtotal}
                isMobile={true}
              />
            </div>

            {/* Mobile: Bill summary */}
            <div className="lg:hidden bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-funnel text-base font-bold text-gray-800 mb-3 border-b pb-2">Bill Summary</h3>
              <BillRows
                subtotal={subtotal}
                couponDiscount={couponDiscount}
                deliveryCharge={deliveryCharge}
                {...walletProps}
              />
              {isCheckoutDisabled && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-funnel text-xs text-orange-700 font-semibold">
                    ⚠️ Please select delivery address and payment method below to proceed
                  </p>
                </div>
              )}
            </div>

            <AddressSection
              defaultAddress={defaultAddress}
              onChangeAddress={handleChangeAddress}
              user={user}
            />

            <CartItems items={items} updateQuantity={updateQuantity} removeItem={removeItem} />

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <RecommendationsPanel
                recommendations={recommendations}
                loading={recLoading}
                onNavigate={navigate}
              />
            )}

            {/* Payment method — hidden when wallet fully covers total */}
            {!(useWalletBalance && isWalletSufficient) && (
              <PaymentMethodSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            )}
          </div>

          {/* ── RIGHT COLUMN (desktop) ── */}
          <PriceSummary
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            total={total}
            isCheckoutDisabled={isCheckoutDisabled}
            paymentMethod={paymentMethod}
            vegetableOrder={vegetableOrder}
            handleCheckout={handleCheckout}
            onApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            couponDiscount={couponDiscount}
            customerInfo={customerInfo}
            selectedAddress={selectedAddress}
            {...walletProps}
          />
        </div>
      </div>

      <MobileCheckoutButton
        paymentMethod={paymentMethod}
        vegetableOrder={vegetableOrder}
        isCheckoutDisabled={isCheckoutDisabled}
        total={total}
        handleCheckout={handleCheckout}
        appliedCoupon={appliedCoupon}
        customerInfo={customerInfo}
        selectedAddress={selectedAddress}
        useWalletBalance={useWalletBalance}
        amountAfterWallet={amountAfterWallet}
        isWalletSufficient={isWalletSufficient}
        walletDeduction={walletDeduction}
      />
    </div>
  );
};

// ─── RecommendationsPanel ─────────────────────────────────────────────────────
const RecommendationsPanel = React.memo(({ recommendations, loading, onNavigate }) => {
  if (loading) return null;
  if (!recommendations?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={17} className="text-amber-500" />
        <h3 className="font-funnel font-bold text-gray-800 text-sm">Frequently Bought Together</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {recommendations.map((rec, i) => {
          const product = rec.product;
          if (!product) return null;
          return (
            <div
              key={rec.productId || i}
              className="flex-shrink-0 w-28 flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => onNavigate(`/vegetable/${rec.productId}`)}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group-hover:border-green-300 transition">
                <img
                  src={product.image || "/placeholder-vegetable.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => { e.target.src = "/placeholder-vegetable.jpg"; }}
                />
              </div>
              <p className="font-funnel text-xs text-gray-700 font-semibold text-center leading-tight line-clamp-2">
                {product.name}
              </p>
              {product.price && (
                <p className="font-funnel text-xs text-[#0e540b] font-bold">₹{product.price}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── WalletToggle ─────────────────────────────────────────────────────────────
const WalletToggle = React.memo(
  ({ wallet, balance, useWalletBalance, setUseWalletBalance, total, isWalletSufficient, walletDeduction, amountAfterWallet }) => {
    if (!wallet) return null;
    return (
      <div className={`rounded-lg border-2 p-3 transition ${useWalletBalance ? "border-[#0e540b] bg-green-50" : "border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-[#0e540b]" />
            <div>
              <p className="font-funnel font-semibold text-gray-800 text-sm">Use Wallet Balance</p>
              <p className="font-funnel text-xs text-gray-500">
                Available: <span className="font-bold text-[#0e540b]">₹{balance.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseWalletBalance((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useWalletBalance ? "bg-[#0e540b]" : "bg-gray-300"}`}
            aria-label="Toggle wallet"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${useWalletBalance ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
        {useWalletBalance && (
          <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
            <div className="flex justify-between text-xs font-funnel">
              <span className="text-gray-600">Wallet deduction</span>
              <span className="font-semibold text-[#0e540b]">-₹{walletDeduction.toFixed(2)}</span>
            </div>
            {!isWalletSufficient && (
              <>
                <div className="flex justify-between text-xs font-funnel">
                  <span className="text-gray-600">Remaining to pay</span>
                  <span className="font-semibold text-gray-800">₹{amountAfterWallet.toFixed(2)}</span>
                </div>
                <div className="flex items-start gap-1.5 mt-1.5 p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <AlertCircle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="font-funnel text-[10px] text-orange-700 font-semibold">
                    Wallet balance is insufficient. Please select a payment method for the remaining ₹{amountAfterWallet.toFixed(2)}.
                  </p>
                </div>
              </>
            )}
            {isWalletSufficient && (
              <div className="flex items-center gap-1.5 mt-1 p-2 bg-green-100 border border-green-300 rounded-md">
                <CheckCircle size={13} className="text-[#0e540b] flex-shrink-0" />
                <p className="font-funnel text-[10px] text-[#0e540b] font-semibold">
                  Your wallet covers the full amount. No other payment needed!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

// ─── BillRows ─────────────────────────────────────────────────────────────────
const BillRows = React.memo(
  ({ subtotal, couponDiscount, deliveryCharge, useWalletBalance, walletDeduction, amountAfterWallet, total, isWalletSufficient }) => (
    <div className="space-y-2 text-xs font-body">
      <div className="flex justify-between items-center">
        <span className="text-[var(--color-text-secondary)]">Subtotal</span>
        <span className="font-mono font-medium text-[var(--color-text-primary)]">₹{subtotal.toFixed(2)}</span>
      </div>
      {couponDiscount > 0 && (
        <div className="flex justify-between items-center text-[var(--color-brand-green)]">
          <span>Coupon Discount</span>
          <span className="font-mono font-medium">-₹{couponDiscount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-[var(--color-text-secondary)]">Delivery Charge</span>
        <span className="font-mono font-medium text-[var(--color-text-primary)]">
          {subtotal > 269  ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}
        </span>
      </div>
      {deliveryCharge > 0 && subtotal < 269 && (
        <div className="p-2 bg-[var(--color-tint-green)] border border-[var(--color-border)] rounded-[8px]">
          <p className="text-[11px] text-[var(--color-brand-green)] font-medium">
            🎉 Add ₹{(269 - subtotal).toFixed(2)} more for FREE delivery!
          </p>
        </div>
      )}
      {useWalletBalance && walletDeduction > 0 && (
        <div className="flex justify-between items-center text-[var(--color-brand-green)]">
          <span className="flex items-center gap-1">
            <Wallet size={13} /> Wallet Deduction
          </span>
          <span className="font-mono font-medium">-₹{walletDeduction.toFixed(2)}</span>
        </div>
      )}
      <div className="border-t border-[var(--color-border)] pt-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-[var(--color-text-primary)]">
            {useWalletBalance && !isWalletSufficient ? "Amount to Pay" : "Total Amount"}
          </span>
          <span className="font-mono font-medium text-[var(--color-brand-green)] text-base">
            ₹{(useWalletBalance ? amountAfterWallet : total).toFixed(2)}
          </span>
        </div>
        {useWalletBalance && walletDeduction > 0 && (
          <p className="text-[10px] text-[var(--color-text-muted)] text-right mt-0.5 font-mono">
            (₹{walletDeduction.toFixed(2)} paid via wallet)
          </p>
        )}
      </div>
    </div>
  )
);

// ─── CartItems ────────────────────────────────────────────────────────────────
const CartItems = React.memo(({ items, updateQuantity, removeItem }) => (
  <div className="bg-[var(--color-bg-surface)] p-3.5 rounded-[12px] border border-[var(--color-border)]">
    <h3 className="font-display text-sm font-medium text-[var(--color-text-primary)] mb-2.5 border-b border-[var(--color-border)] pb-2">
      Order Items ({items.length} items, {items.reduce((s, i) => s + i.quantity, 0)} total)
    </h3>
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <CartItem
          key={`${item.vegetableId || item.id}-${item.weight}-${index}`}
          item={item}
          index={index}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}
    </div>
  </div>
));

const CartItem = React.memo(({ item, index, updateQuantity, removeItem }) => {
  const itemPrice = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
  const itemTotal = parseFloat(item.totalPrice) || itemPrice * item.quantity;
  const selectedWeightPrice = item.selectedWeightPrice || {};
  const marketPriceForWeight = selectedWeightPrice[item.weight]
    ? parseFloat(selectedWeightPrice[item.weight])
    : null;

  return (
    <div className="flex gap-3 p-2.5 bg-[var(--color-bg-app)] rounded-[10px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
      <div className="w-14 h-14 bg-[var(--color-tint-green)] rounded-[8px] overflow-hidden flex-shrink-0 flex items-center justify-center">
        <img
          src={item.image || "/placeholder-vegetable.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = "/placeholder-vegetable.jpg"; }}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-body font-medium text-[var(--color-text-primary)] text-xs sm:text-sm">
            {item.name} ({item.weight})
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xs text-[var(--color-brand-green)] font-medium border border-dashed border-[var(--color-border-strong)] rounded-[4px] px-1.5 py-0.2">
              ₹{itemPrice.toFixed(2)} / {item.weight}
            </span>
            {marketPriceForWeight && marketPriceForWeight > itemPrice && (
              <span className="font-mono text-[11px] line-through text-[var(--color-text-muted)]">₹{marketPriceForWeight.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity(index, -1)}
              className="w-6 h-6 flex items-center justify-center bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-[6px] transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} className="text-[var(--color-text-primary)]" />
            </button>
            <span className="font-mono font-medium text-[var(--color-text-primary)] text-xs w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(index, 1)}
              className="w-6 h-6 flex items-center justify-center bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-[6px] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} className="text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-[var(--color-text-primary)] text-xs">₹{itemTotal.toFixed(2)}</span>
            <button
              onClick={() => removeItem(index)}
              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[6px] transition-colors"
              aria-label="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── PaymentMethodSection ─────────────────────────────────────────────────────
const PaymentMethodSection = React.memo(({ paymentMethod, setPaymentMethod }) => (
  <div className="bg-white p-4 md:p-3 rounded-lg shadow-md">
    <h3 className="font-funnel text-base md:text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
      <CreditCard size={18} className="text-[#0e540b]" /> Select Payment Method
    </h3>
    <div className="space-y-2.5">
      {[
        { value: "COD", Icon: Banknote, label: "Cash on Delivery", sub: "Pay when you receive" },
        { value: "ONLINE", Icon: CreditCard, label: "Online Payment", sub: "UPI, Card, Net Banking" },
      ].map(({ value, Icon, label, sub }) => (
        <label
          key={value}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${paymentMethod === value ? "border-[#0e540b] bg-green-50" : "border-gray-200 hover:border-green-300"}`}
        >
          <input
            type="radio"
            name="payment"
            value={value}
            checked={paymentMethod === value}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-4 h-4 text-[#0e540b] focus:ring-[#0e540b]"
          />
          <Icon size={22} className="text-gray-600" />
          <div className="flex-1">
            <p className="font-funnel font-semibold text-gray-800 text-sm">{label}</p>
            <p className="font-funnel text-xs text-gray-600">{sub}</p>
          </div>
          {paymentMethod === value && <CheckCircle size={18} className="text-[#0e540b]" />}
        </label>
      ))}
    </div>
  </div>
));

// ─── PriceSummary ─────────────────────────────────────────────────────────────
const PriceSummary = React.memo((props) => {
  const {
    subtotal, deliveryCharge, total, isCheckoutDisabled, paymentMethod,
    vegetableOrder, handleCheckout, onApplyCoupon, appliedCoupon,
    onRemoveCoupon, couponDiscount, customerInfo, selectedAddress,
    wallet, balance, useWalletBalance, setUseWalletBalance,
    walletDeduction, amountAfterWallet, isWalletSufficient,
  } = props;

  return (
    <div className="lg:w-1/3 hidden lg:block">
      <div className="bg-white p-3 rounded-lg shadow-md lg:sticky lg:top-4 space-y-3">
        <CouponCodeSection
          onApplyCoupon={onApplyCoupon}
          appliedCoupon={appliedCoupon}
          onRemoveCoupon={onRemoveCoupon}
          subtotal={subtotal}
          isMobile={false}
        />
        <WalletToggle
          wallet={wallet}
          balance={balance}
          useWalletBalance={useWalletBalance}
          setUseWalletBalance={setUseWalletBalance}
          total={total}
          isWalletSufficient={isWalletSufficient}
          walletDeduction={walletDeduction}
          amountAfterWallet={amountAfterWallet}
        />
        <div>
          <h3 className="font-display text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] mb-2.5 border-b border-[var(--color-border)] pb-1.5">Price Summary</h3>
          <BillRows
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            deliveryCharge={deliveryCharge}
            useWalletBalance={useWalletBalance}
            walletDeduction={walletDeduction}
            amountAfterWallet={amountAfterWallet}
            total={total}
            isWalletSufficient={isWalletSufficient}
          />
          {isCheckoutDisabled && (
            <div className="my-3 p-2 bg-amber-50 border border-amber-200 rounded-[8px] font-body">
              <p className="text-[10px] text-amber-800 font-medium">
                ⚠️ Please select delivery address and payment method to proceed
              </p>
            </div>
          )}
          {paymentMethod === "ONLINE" && !(useWalletBalance && isWalletSufficient) ? (
            <RazorpayPayment
              orderType="custom"
              vegetableOrder={vegetableOrder}
              couponCode={appliedCoupon}
              customerInfo={customerInfo}
              deliveryAddress={selectedAddress}
              isCheckoutDisabled={isCheckoutDisabled}
              walletCreditUsed={walletDeduction}
              amountAfterWallet={amountAfterWallet}
            />
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled}
              className={`w-full font-body py-2.5 sm:py-3 rounded-[10px] font-medium transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 ${isCheckoutDisabled
                  ? "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                  : "bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white"
                }`}
            >
              {isCheckoutDisabled
                ? "Complete Selection"
                : useWalletBalance && isWalletSufficient
                  ? "Pay via Wallet"
                  : "Place Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── MobileCheckoutButton ─────────────────────────────────────────────────────
const MobileCheckoutButton = React.memo(
  ({ paymentMethod, vegetableOrder, isCheckoutDisabled, total, handleCheckout, appliedCoupon, customerInfo, selectedAddress, useWalletBalance, amountAfterWallet, isWalletSufficient, walletDeduction }) => (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] shadow-lg z-50 font-body">
      <div className="px-4 py-3">
        {paymentMethod === "ONLINE" && !(useWalletBalance && isWalletSufficient) ? (
          <RazorpayPayment
            orderType="custom"
            vegetableOrder={vegetableOrder}
            couponCode={appliedCoupon}
            customerInfo={customerInfo}
            deliveryAddress={selectedAddress}
            isCheckoutDisabled={isCheckoutDisabled}
            walletCreditUsed={walletDeduction}
            amountAfterWallet={amountAfterWallet}
          />
        ) : (
          <button
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            className={`w-full font-body py-2.5 sm:py-3 rounded-[10px] font-medium transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 ${isCheckoutDisabled
                ? "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                : "bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white"
              }`}
          >
            {isCheckoutDisabled
              ? "Complete Selection to Proceed"
              : useWalletBalance && isWalletSufficient
                ? `Pay via Wallet • ₹${total.toFixed(2)}`
                : useWalletBalance
                  ? `Place Order • ₹${amountAfterWallet.toFixed(2)} remaining`
                  : `Place Order • ₹${total.toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  )
);

export default VegetableCart;