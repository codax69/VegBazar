import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle, CalendarDays, Trophy, ArrowRight,
  Truck, Clock3, ShoppingBag, Flame, Loader2,
} from "lucide-react";

// ─── CHALLENGE CONFIG ─────────────────────────────────────────────────────────
const CHALLENGE_START = new Date("2026-04-12T00:00:00");
const CHALLENGE_END   = new Date("2026-05-03T23:59:59");
const TARGET_ORDERS   = 5;
const TARGET_DAYS     = 20;

// ─── static date helpers ──────────────────────────────────────────────────────
const today       = new Date();
const elapsedMs   = Math.min(Math.max(0, today - CHALLENGE_START), CHALLENGE_END - CHALLENGE_START);
const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
const daysLeft    = Math.max(0, Math.ceil((CHALLENGE_END - today) / (1000 * 60 * 60 * 24)));
const dayPct      = Math.min(100, Math.round((Math.min(elapsedDays, TARGET_DAYS) / TARGET_DAYS) * 100));

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const getOrderAmount = (order) => Number(
  order.finalamounttopay ?? order.finalAmountToPay ?? order.finalPayableAmount ?? order.totalAmount ?? order.total ?? 0
);

// ─── status helpers ───────────────────────────────────────────────────────────
const statusClasses = {
  completed:    "bg-emerald-100 text-emerald-800 border-emerald-200",
  "in-progress":"bg-amber-100  text-amber-800  border-amber-200",
  upcoming:     "bg-slate-100  text-slate-600  border-slate-200",
};
const statusIcon  = { completed: CheckCircle, "in-progress": Truck, upcoming: Clock3 };
const statusLabel = { completed: "Completed", "in-progress": "In Progress", upcoming: "Upcoming" };

const StatusBadge = ({ status }) => {
  const Icon = statusIcon[status] || Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}>
      <Icon size={13} /> {statusLabel[status]}
    </span>
  );
};

// ─── ring SVG ─────────────────────────────────────────────────────────────────
function RingProgress({ pct, size = 84, stroke = 8, color, bg, children }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg}    strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ─── skeleton block ───────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ChallengePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [orders,  setOrders]  = useState([]);

  // ── fetch & filter orders in 12 Apr – 03 May 2026 window ──
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/user/order-history")
      .then((res) => {
        // normalise various API response shapes
        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.orders)
          ? res.data.orders
          : [];

        const filtered = raw
          .filter((o) => {
            const d = new Date(o.createdAt || o.date || o.orderDate || o.created_at);
            return d >= CHALLENGE_START && d <= CHALLENGE_END;
          })
          .sort((a, b) => {
            const da = new Date(a.createdAt || a.date || a.orderDate || a.created_at);
            const db = new Date(b.createdAt || b.date || b.orderDate || b.created_at);
            return db - da; // newest first
          });

        setOrders(filtered);
        setError(null);
      })
      .catch((err) => {
        console.error("order-history error:", err);
        setError("Could not load your orders. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── derived values (all from real API data) ──
  const completedOrders = orders.length;
  const ordersLeft      = Math.max(0, TARGET_ORDERS - completedOrders);
  const orderPct        = Math.min(100, Math.round((completedOrders / TARGET_ORDERS) * 100));
  const isCompleted     = completedOrders >= TARGET_ORDERS;
  const bigOrders       = orders.filter((order) => getOrderAmount(order) > 269);
  const bigOrderCount   = bigOrders.length;
  const bigOrderPct     = Math.min(100, Math.round((bigOrderCount / TARGET_ORDERS) * 100));
  const showBigOrderProgress = bigOrderCount > 0;

  // ── dynamic milestones ──
  const milestones = [
    {
      key: "start", date: "12 Apr 2026", title: "Challenge Started", status: "completed",
      description: "VegBazar Fresh Challenge begins. Place 5 orders within 20 days to win.",
    },
    {
      key: "m1", date: "18 Apr 2026", title: "Day 6 — 2 Orders",
      status: completedOrders >= 2 ? "completed" : completedOrders >= 1 ? "in-progress" : "upcoming",
      description: "2 orders placed — one-third through the challenge.",
    },
    {
      key: "m2", date: "24 Apr 2026", title: "Day 12 — Halfway",
      status: completedOrders >= 3 ? "completed" : completedOrders >= 2 ? "in-progress" : "upcoming",
      description: "3 orders placed — halfway through the 5-order target.",
    },
    {
      key: "m3", date: "29 Apr 2026", title: "Day 17 — Final Push",
      status: completedOrders >= 4 ? "completed" : completedOrders >= 3 ? "in-progress" : "upcoming",
      description: "4 orders down — just one more to go before the deadline.",
    },
    {
      key: "end", date: "03 May 2026", title: "Challenge Deadline",
      status: isCompleted ? "completed" : "upcoming",
      description: "Final cutoff. All 5 orders must be placed before this date to claim the ₹5,000 prize.",
    },
  ];

  // ── loading ──
  if (loading) return (
    <div className="min-h-screen bg-[#f5f1e8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-4">
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );

  // ── error ──
  if (error) return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-5">{error}</p>
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-[#063a06] text-white font-bold text-sm px-5 py-2.5 rounded-full">
          <Loader2 size={14} /> Retry
        </button>
      </div>
    </div>
  );

  // ── main ──
  return (
    <div className="min-h-screen bg-[#f5f1e8] py-8 sm:py-12 mt-5">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* header */}
          <div className="bg-gradient-to-br from-[#063a06] via-[#0e540b] to-[#16a34a] p-6 sm:p-8 text-white relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
              <defs><pattern id="hd" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#hd)"/>
            </svg>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={15} className="text-amber-300" />
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-200 font-semibold">VegBazar Fresh Challenge</p>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  {isCompleted ? "🎉 Challenge Complete!" : "Your Challenge Progress"}
                </h1>
                <p className="mt-2 text-sm text-emerald-100 max-w-xl leading-relaxed">
                  Place <strong className="text-white">5 orders</strong> within <strong className="text-white">20 days</strong> —{" "}
                  <strong className="text-white">12 Apr</strong> to <strong className="text-white">03 May 2026</strong> — to win from the ₹5,000 prize pool.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold text-white/90">
                  <CalendarDays size={12} />
                  12 Apr 2026 – 03 May 2026
                  <span className="ml-1 bg-white/20 rounded-full px-2 py-0.5">
                    {completedOrders} order{completedOrders !== 1 ? "s" : ""} placed
                  </span>
                </div>
              </div>
              <button onClick={() => navigate("/orders")}
                className="self-start inline-flex items-center gap-2 rounded-full bg-white text-[#063a06] font-bold text-sm px-5 py-2.5 shadow-lg transition hover:-translate-y-0.5">
                View Orders <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">

            {/* ring cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-[#f3faf0] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <RingProgress pct={orderPct} color="#0e540b" bg="#d1fae5">
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#063a06", lineHeight: 1 }}>{completedOrders}</span>
                  <span style={{ fontSize: 9,  fontWeight: 600, color: "#4a7a3a" }}>/{TARGET_ORDERS}</span>
                </RingProgress>
                <div className="text-center sm:text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Orders Done</div>
                  <div className="text-xl font-extrabold text-[#063a06]">
                    {completedOrders}<span className="text-sm font-semibold text-slate-400">/{TARGET_ORDERS}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isCompleted
                      ? <span className="text-emerald-600 font-semibold">✓ Target reached!</span>
                      : <><span className="font-semibold text-amber-600">{ordersLeft} more</span> to go</>}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fffbeb] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <RingProgress pct={dayPct} color="#f59e0b" bg="#fde68a">
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#92400e", lineHeight: 1 }}>{Math.min(elapsedDays, TARGET_DAYS)}</span>
                  <span style={{ fontSize: 9,  fontWeight: 600, color: "#b45309" }}>/{TARGET_DAYS}d</span>
                </RingProgress>
                <div className="text-center sm:text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Days Elapsed</div>
                  <div className="text-xl font-extrabold text-amber-700">
                    {Math.min(elapsedDays, TARGET_DAYS)}<span className="text-sm font-semibold text-slate-400">/{TARGET_DAYS}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-amber-600">{daysLeft} days</span> left
                  </div>
                </div>
              </div>
            </div>

            {/* progress bars */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Challenge Progress</p>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Orders · Time</h3>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border
                  ${isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                  {isCompleted ? <><CheckCircle size={13}/> Completed</> : <><Flame size={13}/> Active</>}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold"><ShoppingBag size={11}/> Orders</span>
                  <span className="font-bold text-[#063a06]">{completedOrders}/{TARGET_ORDERS} — {orderPct}%</span>
                </div>
                <div className="h-3 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#063a06] to-[#16a34a] transition-all duration-700" style={{ width: `${orderPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5 font-semibold"><CalendarDays size={11}/> Days (20-day window)</span>
                  <span className="font-bold text-amber-700">{Math.min(elapsedDays, TARGET_DAYS)}/{TARGET_DAYS} — {dayPct}%</span>
                </div>
                <div className="h-3 rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700" style={{ width: `${dayPct}%` }} />
                </div>
              </div>
              {dayPct > orderPct + 20 && !isCompleted && (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <Flame size={13} className="text-red-500 flex-shrink-0" />
                  Time is moving faster than your orders — place {ordersLeft} more order{ordersLeft > 1 ? "s" : ""} soon!
                </div>
              )}
            </div>

            {showBigOrderProgress ? (
              <div className="rounded-2xl border border-emerald-100 bg-[#ecfdf5] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">High-value orders</p>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Orders above ₹269</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Flame size={13} /> {bigOrderCount} order{bigOrderCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span className="font-semibold">Qualifying order streak</span>
                    <span className="font-bold text-[#063a06]">{bigOrderCount}/{TARGET_ORDERS} — {bigOrderPct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#0f766e] transition-all duration-700" style={{ width: `${bigOrderPct}%` }} />
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  {bigOrderCount === 1
                    ? "You have one order over ₹269 in the challenge window. Keep going to build momentum."
                    : "You have several orders above ₹269. This is your high-value challenge progress."}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2 mb-2 text-slate-900 font-semibold">
                  <Flame size={14} /> Unlock extra progress
                </div>
                Place an order above ₹269 within the challenge window to start tracking high-value order progress.
              </div>
            )}

            {/* orders from API */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Filtered from /api/user/order-history</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Orders in Challenge Window</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <CalendarDays size={13}/> 12 Apr – 03 May 2026
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <ShoppingBag size={28} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-600">No orders in the challenge window yet</p>
                  <p className="text-xs text-slate-400 mt-1">Orders placed between 12 Apr – 03 May 2026 will appear here.</p>
                  <button onClick={() => navigate("/vegetables")}
                    className="mt-4 inline-flex items-center gap-2 bg-[#063a06] text-white font-bold text-xs px-5 py-2.5 rounded-full">
                    Shop Now <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, idx) => {
                    const orderDate  = new Date(order.createdAt || order.date || order.orderDate || order.created_at);
                    const isDelivered = ["delivered", "completed"].includes((order.status || "").toLowerCase());
                    const orderNum   = completedOrders - idx; // #1 is the first order placed
                    return (
                      <div key={order._id || order.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f0f7ea] border-2 border-[#cde4c0] flex items-center justify-center text-xs font-extrabold text-[#063a06]">
                            {orderNum}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-slate-900">
                                Order #{order.orderNumber || order._id?.slice(-6) || order.id || "—"}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border
                                ${isDelivered ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                                {isDelivered ? <CheckCircle size={10}/> : <Truck size={10}/>}
                                {order.status
                                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  : "Placed"}
                              </span>
                              {getOrderAmount(order) > 269 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-amber-200 bg-amber-50 text-amber-700">
                                  <Flame size={10}/> ₹269+
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {fmt(orderDate)}
                              {(order.totalAmount || order.total) ? ` · ₹${order.totalAmount || order.total}` : ""}
                              {order.items?.length ? ` · ${order.items.length} item${order.items.length > 1 ? "s" : ""}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-[#063a06] bg-[#f0f7ea] border border-[#cde4c0] px-3 py-1.5 rounded-full shrink-0">
                          #{orderNum} of {TARGET_ORDERS}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* milestones */}
            <div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Timeline</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Order milestones</h3>
              </div>
              <div className="relative space-y-3 pl-6 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200 before:rounded-full">
                {milestones.map((m) => {
                  const dot = m.status === "completed" ? "#0e540b" : m.status === "in-progress" ? "#f59e0b" : "#cbd5e1";
                  return (
                    <div key={m.key}
                      className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                      <div style={{ position: "absolute", left: -23, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: dot, border: "2.5px solid #fff", boxShadow: `0 0 0 2px ${dot}44` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{m.title}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
                      </div>
                      <div className="text-xs font-semibold text-slate-400 sm:text-right shrink-0">{m.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f3faf0] border border-emerald-100 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-700/10 p-2.5 text-emerald-700 flex-shrink-0"><CheckCircle size={20}/></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Order health</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {isCompleted
                        ? "You've completed all 5 orders. Claim your ₹5,000 reward!"
                        : `${completedOrders} of 5 orders placed between 12 Apr – 03 May 2026. ${ordersLeft} more needed.`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-800/10 p-2.5 text-slate-700 flex-shrink-0"><ArrowRight size={20}/></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Next step</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {isCompleted
                        ? "Visit your rewards page to claim your prize from the ₹5,000 pool."
                        : `Place ${ordersLeft} more order${ordersLeft > 1 ? "s" : ""} within ${daysLeft} day${daysLeft !== 1 ? "s" : ""} to complete the challenge.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}