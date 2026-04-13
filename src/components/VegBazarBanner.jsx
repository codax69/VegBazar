import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const vegbazarLogo = "/vegbazar.svg";

/* ─── tiny icon set ─────────────────────────────────────────────────── */
const IC = {
  Pin:     (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Rupee:   (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Farm:    (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Leaf:    (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  Shield:  (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Refresh: (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.26"/></svg>,
  Trophy:  (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>,
  Pulse:   (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Arrow:   (p) => <svg width={p.s||12} height={p.s||12} viewBox="0 0 24 24" fill="none" stroke={p.c||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

/* ─── veg card ──────────────────────────────────────────────────────── */
function VegCard({ emoji, image, name, price }) {
  return (
    <div style={{
      width: "clamp(64px, 18vw, 88px)",
      background: "#fff",
      border: "1.5px solid #d4e8c8",
      borderRadius: 16,
      padding: "10px 6px 8px",
      textAlign: "center",
      boxShadow: "0 2px 10px rgba(14,84,11,0.08)",
      flexShrink: 0,
    }}>
      {image
        ? <img src={image} alt={name} style={{ width: "clamp(28px,7vw,38px)", height: "clamp(28px,7vw,38px)", objectFit: "cover", borderRadius: 10, margin: "0 auto", display: "block" }} />
        : <div style={{ fontSize: "clamp(20px,5vw,28px)", lineHeight: 1 }}>{emoji}</div>
      }
      <div style={{ fontSize: "clamp(8px,2vw,10px)", fontWeight: 700, color: "#2d5a1a", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      <div style={{ fontSize: "clamp(9px,2.2vw,11px)", fontWeight: 800, color: "#0e540b", marginTop: 2 }}>{price}</div>
    </div>
  );
}

/* ─── feature chip ──────────────────────────────────────────────────── */
function Chip({ Icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, background: "#fff", border: "1.5px solid #cde4c0", fontSize: "clamp(9px,2.2vw,11px)", fontWeight: 600, color: "#1a3d0a", whiteSpace: "nowrap" }}>
      <Icon c="#2a7a1a" s={11} /> {label}
    </div>
  );
}

/* ─── main ──────────────────────────────────────────────────────────── */
export default function VegBazarBanner({
  vegetables = [
    { emoji: "🥕", name: "Carrot",   price: "₹28/kg" },
    { emoji: "🧅", name: "Onion",    price: "₹22/kg" },
    { emoji: "🥦", name: "Broccoli", price: "₹45/kg" },
    { emoji: "🍅", name: "Tomato",   price: "₹18/kg" },
  ],
  tags = ["Seasonal", "No Pesticides", "Daily Fresh"],
}) {
  const TOTAL = 3;
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [vegs, setVegs] = useState(vegetables);
  const timerRef = useRef(null);

  const features = [
    { Icon: IC.Pin,     label: "Local Delivery"  },
    { Icon: IC.Rupee,   label: "Best Prices"     },
    { Icon: IC.Farm,    label: "Farm Direct"     },
    { Icon: IC.Leaf,    label: "Always Fresh"    },
    { Icon: IC.Shield,  label: "Quality Checked" },
    { Icon: IC.Refresh, label: "Easy Returns"    },
  ];

  /* fetch vegs */
  useEffect(() => {
    axios.get("/api/vegetables/random")
      .then(res => {
        const data = res.data?.data || res.data;
        if (!Array.isArray(data) || !data.length) return;
        const sorted = [...data].sort((a, b) => {
          const aOut = a.outOfStock || (a.stockKg === 0 && (a.stockPieces === 0 || a.stockPieces == null));
          const bOut = b.outOfStock || (b.stockKg === 0 && (b.stockPieces === 0 || b.stockPieces == null));
          return (aOut ? 1 : 0) - (bOut ? 1 : 0);
        });
        setVegs(sorted.slice(0, 4).map(v => {
          const isBase = v.priceType === "base" || v.setPricing?.enabled;
          const price  = isBase
            ? v.setPricing?.sets?.price || v.prices?.base || 0
            : v.prices?.weight250g || v.prices?.weight1kg || v.originalPrice || 0;
          return { image: v.image || null, emoji: "🍃", name: v.name || "Vegetable", price: price ? `₹${price}${isBase ? "/set" : "/250g"}` : "₹0" };
        }));
      })
      .catch(() => {});
  }, []);

  /* auto-play */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % TOTAL), 5000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  /* drag */
  const dragRef = useRef({ startX: 0 });
  const onTouchStart = (e) => { dragRef.current.startX = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd   = (e) => {
    const dx = e.changedTouches[0].clientX - dragRef.current.startX;
    if (Math.abs(dx) > 40) setCur(c => dx < 0 ? (c + 1) % TOTAL : (c - 1 + TOTAL) % TOTAL);
    setPaused(false);
  };

  /* ─── shared btn ─── */
  const Btn = ({ children, onClick, light }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 20px", borderRadius: 999, border: "none", cursor: "pointer",
        fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 700,
        background: light ? "#fff" : "#063a06",
        color: light ? "#063a06" : "#fff",
        boxShadow: light ? "0 2px 12px rgba(0,0,0,0.10)" : "0 4px 16px rgba(6,58,6,0.35)",
        fontFamily: "'Poppins', sans-serif",
        marginTop: "clamp(10px,2.5vw,18px)",
      }}
    >
      {children} <IC.Arrow c={light ? "#063a06" : "#86efac"} s={12} />
    </motion.button>
  );

  /* ─── slide wrapper (always row, clips overflow) ─── */
  const slideStyle = {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "row",
    overflow: "hidden",
  };

  /* ─── left pane ─── */
  const LP = ({ bg, children }) => (
    <div style={{
      flex: "0 0 55%", maxWidth: "55%",
      background: bg || "#063a06",
      padding: "clamp(16px,4vw,32px) clamp(14px,3.5vw,28px)",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* subtle dot grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}>
        <defs><pattern id="dpg" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#fff"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dpg)"/>
      </svg>
      {children}
    </div>
  );

  /* ─── right pane ─── */
  const RP = ({ bg, children }) => (
    <div style={{
      flex: "0 0 45%", maxWidth: "45%",
      background: bg || "#f0f7ea",
      padding: "clamp(12px,3vw,24px) clamp(10px,2.5vw,20px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}>
        <defs><pattern id="gp" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#063a06" strokeWidth="0.8"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#gp)"/>
      </svg>
      {children}
    </div>
  );

  /* fluid heading */
  const H = ({ children, color }) => (
    <h2 style={{
      margin: 0, lineHeight: 1.05, color: color || "#fff",
      fontFamily: "'Funnel Display', Georgia, serif",
      fontSize: "clamp(18px, 4.5vw, 30px)",
      fontWeight: 800, letterSpacing: "-0.01em",
    }}>{children}</h2>
  );

  /* label row */
  const Label = ({ icon: Icon, text, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "clamp(6px,1.5vw,12px)" }}>
      <Icon c={color || "#86efac"} s={11} />
      <span style={{ color: color || "#86efac", fontSize: "clamp(8px,2vw,10px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Poppins', sans-serif" }}>
        {text}
      </span>
    </div>
  );

  /* badge pill */
  const Pill = ({ bg, color, children }) => (
    <span style={{ display: "inline-block", background: bg, color, fontSize: "clamp(9px,2vw,11px)", fontWeight: 800, padding: "4px 10px", borderRadius: 999, fontFamily: "'Poppins', sans-serif" }}>
      {children}
    </span>
  );

  const bannerH = "clamp(200px, 42vw, 290px)";

  return (
    <div
      style={{ width: "100%", marginTop: "clamp(12px,3vw,20px)", fontFamily: "'Funnel Sans', Poppins, sans-serif" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{
        width: "100%", borderRadius: "clamp(14px,3vw,22px)",
        overflow: "hidden", boxShadow: "0 6px 30px rgba(14,84,11,0.12)",
        background: "#f0f7ea",
      }}>

        {/* ── slide track ── */}
        <div
          style={{ position: "relative", width: "100%", height: bannerH, overflow: "hidden" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* SLIDE 0 — Challenge */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "0%" : cur === 1 ? "-100%" : cur === 2 ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="#063a06">
              <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: "#0e540b", opacity: 0.5, filter: "blur(24px)", pointerEvents: "none" }} />
              <Label icon={IC.Trophy} text="Limited Time" />
              <H>VegBazar<br /><span style={{ color: "#86efac" }}>Fresh Challenge</span></H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "clamp(8px,2vw,14px)", alignItems: "center" }}>
                <Pill bg="#86efac" color="#063a06">5 orders</Pill>
                <span style={{ color: "#86efac88", fontSize: "clamp(9px,2vw,11px)" }}>in just</span>
                <Pill bg="#fbbf24" color="#78350f">20 days</Pill>
              </div>
              <div style={{ marginTop: "clamp(8px,2vw,12px)", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 10, border: "1.5px solid rgba(167,139,250,0.4)", background: "rgba(109,40,217,0.2)" }}>
                <IC.Trophy c="#c4b5fd" s={10} />
                <span style={{ color: "#c4b5fd", fontSize: "clamp(8px,2vw,10px)", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>WIN ₹5,000 PRIZE POOL</span>
              </div>
              <Btn onClick={() => navigate("/challenge")} light>Join Now</Btn>
            </LP>

            <RP bg="#e8f5e0">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: "130%", aspectRatio: "1", borderRadius: "50%", border: "40px solid rgba(14,84,11,0.05)" }} />
              </div>
              <img
                src="https://res.cloudinary.com/dltmiswel/image/upload/v1775998292/reward_dhzmno.webp"
                alt="Prizes"
                style={{ position: "relative", zIndex: 1, width: "90%", maxWidth: 220, objectFit: "contain", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))" }}
              />
            </RP>
          </motion.div>

          {/* SLIDE 1 — Features */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "100%" : cur === 1 ? "0%" : cur === 2 ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="#fff">
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "linear-gradient(to bottom, #063a06, #16a34a, #063a06)", borderRadius: "0 4px 4px 0" }} />
              <img src={vegbazarLogo} alt="VegBazar" style={{ height: "clamp(16px,3.5vw,22px)", marginBottom: "clamp(8px,2vw,14px)", opacity: 0.85 }} />
              <H color="#0d2a06">
                Fresh Veggies,<br />
                <span style={{ color: "#0e540b" }}>Doorstep Ready.</span>
              </H>
              <p style={{ margin: "clamp(6px,1.5vw,10px) 0 0", fontSize: "clamp(9px,2.2vw,11px)", color: "#5a7a4a", lineHeight: 1.6, maxWidth: 200 }}>
                Direct from Valsad farms. Harvested today, delivered today.
              </p>
              <Btn onClick={() => navigate("/vegetables")}>Shop Now</Btn>
            </LP>

            <RP bg="#f4f9f0">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(5px,1.5vw,9px)", justifyContent: "center", position: "relative", zIndex: 1 }}>
                {features.map((f, i) => <Chip key={i} {...f} />)}
              </div>
            </RP>
          </motion.div>

          {/* SLIDE 2 — Veggies */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "-100%" : cur === 1 ? "100%" : cur === 2 ? "0%" : "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="#063a06">
              <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "#16a34a", opacity: 0.3, filter: "blur(20px)", pointerEvents: "none" }} />
              <Label icon={IC.Pulse} text="Today's Picks" />
              <H>Farm-fresh<br /><span style={{ color: "#86efac" }}>every order.</span></H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "clamp(8px,2vw,12px)" }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: "clamp(8px,2vw,10px)", fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}>{t}</span>
                ))}
              </div>
              <Btn onClick={() => navigate("/vegetables")} light>Browse Veggies</Btn>
            </LP>

            <RP bg="#f0f7ea">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(6px,1.8vw,10px)", justifyContent: "center", position: "relative", zIndex: 1 }}>
                {vegs.map((v, i) => <VegCard key={i} {...v} />)}
              </div>
            </RP>
          </motion.div>
        </div>

        {/* ── bottom bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px clamp(14px,3.5vw,24px)",
          background: "#fff", borderTop: "1px solid #e2f0da",
        }}>
          {/* progress bar */}
          <div style={{ flex: 1, margin: "0 14px", height: 3, borderRadius: 999, background: "#e2f0da", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${((cur + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #063a06, #16a34a)" }}
            />
          </div>
          <span style={{ fontSize: "clamp(9px,2vw,11px)", fontWeight: 600, color: "#7aaa5a", fontFamily: "'Poppins', sans-serif" }}>
            {cur + 1}/{TOTAL}
          </span>
        </div>
      </div>
    </div>
  );
}