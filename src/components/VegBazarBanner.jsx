// src/components/VegBazarBanner.jsx — Rebuilt with v2 CSS design tokens and Fraunces/Inter typography
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
function VegCard({ image, name, price }) {
  return (
    <div style={{
      width: "clamp(64px, 18vw, 88px)",
      background: "var(--color-bg-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      padding: "10px 6px 8px",
      textAlign: "center",
      flexShrink: 0,
    }}>
      {image
        ? <img src={image} alt={name} style={{ width: "clamp(28px,7vw,38px)", height: "clamp(28px,7vw,38px)", objectFit: "cover", borderRadius: 8, margin: "0 auto", display: "block" }} />
        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(28px,7vw,38px)", height: "clamp(28px,7vw,38px)", margin: "0 auto", borderRadius: 8, background: "var(--color-tint-green)" }}><IC.Leaf c="var(--color-brand-green)" s={18} /></div>
      }
      <div style={{ fontSize: "clamp(8px,2vw,10px)", fontWeight: 500, color: "var(--color-text-primary)", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}>{name}</div>
      <div style={{ fontSize: "clamp(9px,2.2vw,11px)", fontWeight: 600, color: "var(--color-brand-green)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{price}</div>
    </div>
  );
}

/* ─── feature chip ──────────────────────────────────────────────────── */
function Chip({ Icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", fontSize: "clamp(9px,2.2vw,11px)", fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}>
      <Icon c="var(--color-brand-green)" s={11} /> {label}
    </div>
  );
}

/* ─── main ──────────────────────────────────────────────────────────── */
export default function VegBazarBanner({
  vegetables = [
    { name: "Carrot",   price: "₹28/kg" },
    { name: "Onion",    price: "₹22/kg" },
    { name: "Broccoli", price: "₹45/kg" },
    { name: "Tomato",   price: "₹18/kg" },
  ],
  tags = ["Seasonal", "No Pesticides", "Daily Fresh"],
}) {
  const TOTAL = 4;
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
          return { image: v.image || null, name: v.name || "Vegetable", price: price ? `₹${price}${isBase ? "/set" : "/250g"}` : "₹0" };
        }));
      })
      .catch(() => {});
  }, []);

  /* timer */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCur((c) => (c + 1) % TOTAL);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  /* swipe */
  const touchStart = useRef(0);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      setCur((c) => (delta > 0 ? (c + 1) % TOTAL : (c - 1 + TOTAL) % TOTAL));
    }
  };

  /* ─── action button ─── */
  const Btn = ({ children, onClick, light = false }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
        fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 500,
        background: light ? "var(--color-bg-surface)" : "var(--color-brand-green)",
        color: light ? "var(--color-brand-green)" : "var(--color-on-brand)",
        fontFamily: "var(--font-body)",
        marginTop: "clamp(10px,2.5vw,18px)",
      }}
    >
      {children} <IC.Arrow c={light ? "var(--color-brand-green)" : "var(--color-on-brand)"} s={12} />
    </motion.button>
  );

  /* ─── slide wrapper ─── */
  const slideStyle = {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "row",
    overflow: "hidden",
  };

  /* ─── left pane ─── */
  const LP = ({ bg, children }) => (
    <div style={{
      flex: "0 0 55%", maxWidth: "55%",
      background: bg || "var(--color-brand-green)",
      padding: "clamp(16px,4vw,32px) clamp(14px,3.5vw,28px)",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {children}
    </div>
  );

  /* ─── right pane ─── */
  const RP = ({ bg, children }) => (
    <div style={{
      flex: "0 0 45%", maxWidth: "45%",
      background: bg || "var(--color-tint-green)",
      padding: "clamp(12px,3vw,24px) clamp(10px,2.5vw,20px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {children}
    </div>
  );

  /* fluid heading */
  const H = ({ children, color }) => (
    <h2 style={{
      margin: 0, lineHeight: 1.1, color: color || "var(--color-on-brand)",
      fontFamily: "var(--font-display)",
      fontSize: "clamp(18px, 4.5vw, 30px)",
      fontWeight: 600,
    }}>{children}</h2>
  );

  /* label row */
  const Label = ({ icon: Icon, text, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "clamp(6px,1.5vw,12px)" }}>
      <Icon c={color || "var(--color-on-brand)"} s={11} />
      <span style={{ color: color || "var(--color-on-brand)", fontSize: "clamp(8px,2vw,10px)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
        {text}
      </span>
    </div>
  );

  /* badge pill */
  const Pill = ({ bg, color, children }) => (
    <span style={{ display: "inline-block", background: bg, color, fontSize: "clamp(9px,2vw,11px)", fontWeight: 600, padding: "3px 8px", borderRadius: 6, fontFamily: "var(--font-mono)" }}>
      {children}
    </span>
  );

  const bannerH = "clamp(200px, 42vw, 290px)";

  return (
    <div
      style={{ width: "100%", marginTop: "clamp(12px,3vw,20px)", fontFamily: "var(--font-body)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{
        width: "100%", borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-surface)",
      }}>

        {/* ── slide track ── */}
        <div
          style={{ position: "relative", width: "100%", height: bannerH, overflow: "hidden" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* SLIDE 0 — Service Close */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "0%" : cur === 1 ? "-100%" : cur === 2 ? "-200%" : cur === 3 ? "-300%" : "0%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="var(--color-brand-green)">
              <Label icon={IC.Shield} text="Important Notice" color="var(--color-amber)" />
              <H>Service<br /><span style={{ color: "var(--color-amber)" }}>Temporarily Closed</span></H>
              <p style={{ margin: "clamp(8px,2vw,14px) 0 0", fontSize: "clamp(9px,2.2vw,11px)", color: "color-mix(in srgb, var(--color-on-brand) 85%, transparent)", lineHeight: 1.6, maxWidth: 250, fontFamily: "var(--font-body)" }}>
                We are currently closed for maintenance. Thank you for your patience. We'll be back soon!
              </p>
              <div style={{ marginTop: "clamp(8px,2vw,12px)", display: "inline-flex", items: "center", gap: 7, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--color-amber)", background: "var(--color-amber-tint)" }}>
                <IC.Shield c="var(--color-amber-ink)" s={10} />
                <span style={{ color: "var(--color-amber-ink)", fontSize: "clamp(8px,2vw,10px)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>WE'LL BE BACK SOON</span>
              </div>
            </LP>

            <RP bg="var(--color-amber-tint)">
              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <svg width="clamp(50px,12vw,80px)" height="clamp(50px,12vw,80px)" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <p style={{ fontSize: "clamp(12px,3vw,14px)", color: "var(--color-amber-ink)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  Under Maintenance
                </p>
              </div>
            </RP>
          </motion.div>

          {/* SLIDE 1 — Challenge */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "100%" : cur === 1 ? "0%" : cur === 2 ? "-100%" : cur === 3 ? "-200%" : "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="var(--color-brand-green)">
              <Label icon={IC.Trophy} text="Limited Time" />
              <H>VegBazar<br /><span style={{ color: "var(--color-amber)" }}>Fresh Challenge</span></H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "clamp(8px,2vw,14px)", alignItems: "center" }}>
                <Pill bg="var(--color-bg-surface)" color="var(--color-brand-green)">5 orders</Pill>
                <span style={{ color: "color-mix(in srgb, var(--color-on-brand) 70%, transparent)", fontSize: "clamp(9px,2vw,11px)", fontFamily: "var(--font-mono)" }}>in just</span>
                <Pill bg="var(--color-amber)" color="var(--color-amber-ink)">20 days</Pill>
              </div>
              <Btn onClick={() => navigate("/challenge")} light>Join Now</Btn>
            </LP>

            <RP bg="var(--color-tint-green)">
              <img
                src="https://res.cloudinary.com/dltmiswel/image/upload/v1775998292/reward_dhzmno.webp"
                alt="Prizes"
                style={{ position: "relative", zIndex: 1, width: "85%", maxWidth: 200, objectFit: "contain" }}
              />
            </RP>
          </motion.div>

          {/* SLIDE 2 — Features */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "200%" : cur === 1 ? "100%" : cur === 2 ? "0%" : cur === 3 ? "-100%" : "200%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="var(--color-bg-surface)">
              <img src={vegbazarLogo} alt="VegBazar" style={{ height: "clamp(16px,3.5vw,22px)", width: "auto", marginBottom: "clamp(8px,2vw,14px)", opacity: 0.9 }} />
              <H color="var(--color-text-primary)">
                Fresh Veggies,<br />
                <span style={{ color: "var(--color-brand-green)" }}>Doorstep Ready.</span>
              </H>
              <p style={{ margin: "clamp(6px,1.5vw,10px) 0 0", fontSize: "clamp(9px,2.2vw,11px)", color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 200, fontFamily: "var(--font-body)" }}>
                Direct from Valsad farms. Harvested today, delivered today.
              </p>
              <Btn onClick={() => navigate("/vegetables")}>Shop Now</Btn>
            </LP>

            <RP bg="var(--color-bg-app)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(5px,1.5vw,9px)", justifyContent: "center", position: "relative", zIndex: 1 }}>
                {features.map((f, i) => <Chip key={i} {...f} />)}
              </div>
            </RP>
          </motion.div>

          {/* SLIDE 3 — Veggies */}
          <motion.div
            style={{ ...slideStyle }}
            animate={{ x: cur === 0 ? "300%" : cur === 1 ? "200%" : cur === 2 ? "100%" : cur === 3 ? "0%" : "300%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <LP bg="var(--color-brand-green)">
              <Label icon={IC.Pulse} text="Today's Picks" />
              <H>Farm-fresh<br /><span style={{ color: "color-mix(in srgb, var(--color-on-brand) 90%, transparent)" }}>every order.</span></H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "clamp(8px,2vw,12px)" }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: "clamp(8px,2vw,10px)", fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: "color-mix(in srgb, var(--color-on-brand) 15%, transparent)", color: "var(--color-on-brand)", border: "1px solid color-mix(in srgb, var(--color-on-brand) 20%, transparent)", fontFamily: "var(--font-mono)" }}>{t}</span>
                ))}
              </div>
              <Btn onClick={() => navigate("/vegetables")} light>Browse Veggies</Btn>
            </LP>

            <RP bg="var(--color-tint-green)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(6px,1.8vw,10px)", justifyContent: "center", position: "relative", zIndex: 1 }}>
                {vegs.map((v, i) => <VegCard key={i} {...v} />)}
              </div>
            </RP>
          </motion.div>
        </div>

        {/* ── bottom bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px clamp(14px,3.5vw,24px)",
          background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border)",
        }}>
          {/* progress bar */}
          <div style={{ flex: 1, margin: "0 14px", height: 3, borderRadius: 999, background: "var(--color-border)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${((cur + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: "100%", borderRadius: 999, background: "var(--color-brand-green)" }}
            />
          </div>
          <span style={{ fontSize: "clamp(9px,2vw,11px)", fontWeight: 500, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            {cur + 1}/{TOTAL}
          </span>
        </div>
      </div>
    </div>
  );
}