import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const vegbazarLogo = "/vegbazar.svg";


// ─── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-[7px] px-2.5 py-[5px] bg-white rounded-full border border-gray-200 text-[10px] font-semibold text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <Icon size={11} color={color} className="flex-shrink-0" />
      {title}
    </div>
  );
}

// ─── Veg Card ─────────────────────────────────────────────────────────────────
function VegCard({ emoji, image, name, price }) {
  return (
    <div className="w-20 rounded-[14px] bg-white border border-gray-200 px-1.5 py-2 text-center shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      {image ? (
        <img src={image} alt={name} className="w-[34px] h-[34px] object-cover mx-auto rounded-md block" />
      ) : (
        <div className="text-[22px] leading-none">{emoji}</div>
      )}
      <div className="text-[9px] font-semibold text-gray-700 mt-[3px]">{name}</div>
      <div className="text-[10px] font-extrabold text-[#0e540b] font-heading mt-0.5">{price}</div>
    </div>
  );
}

// ─── Slide Label ──────────────────────────────────────────────────────────────
function SlideLabel({ children, color }) {
  return (
    <div
      className="text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-[5px] mb-2"
      style={{ color }}
    >
      {children}
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  MapPin: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>,
  Rupee: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  Users: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Leaf: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  Shield: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Refresh: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.26" /></svg>,
  Tag: ({ color }) => <svg className="flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Activity: ({ color }) => <svg className="flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  Trophy: ({ color }) => <svg className="flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>,
};

// ─── Main Banner ──────────────────────────────────────────────────────────────
export default function VegBazarBanner({
  vegetables = [
    { emoji: "🥕", name: "Carrot", price: "₹28/kg" },
    { emoji: "🧅", name: "Onion", price: "₹22/kg" },
    { emoji: "🥦", name: "Broccoli", price: "₹45/kg" },
    { emoji: "🍅", name: "Tomato", price: "₹18/kg" },
  ],
  tags = ["Seasonal", "No Pesticides", "Daily Fresh"],
}) {
  const TOTAL = 3;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const features = [
    { icon: icons.MapPin, title: "Local Delivery", color: "#063a06" },
    { icon: icons.Rupee, title: "Best Prices", color: "#0e540b" },
    { icon: icons.Users, title: "Farm Direct", color: "#063a06" },
    { icon: icons.Leaf, title: "Always Fresh", color: "#0e540b" },
    { icon: icons.Shield, title: "Quality Checked", color: "#063a06" },
    { icon: icons.Refresh, title: "Easy Returns", color: "#0e540b" },
  ];

  const [randomVegs, setRandomVegs] = useState(vegetables);

  useEffect(() => {
    axios.get("/api/vegetables/random")
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const sortByStock = (a, b) => {
            const aOut = a.outOfStock || (a.stockKg === 0 && (a.stockPieces === 0 || a.stockPieces == null));
            const bOut = b.outOfStock || (b.stockKg === 0 && (b.stockPieces === 0 || b.stockPieces == null));
            if (aOut && !bOut) return 1;
            if (!aOut && bOut) return -1;
            return 0;
          };
          const sorted = data.sort(sortByStock);
          const formatted = sorted.slice(0, 4).map(v => ({
            image: v.image || null,
            emoji: "🍃",
            name: v.name || "Vegetable",
            price: `₹${v.marketPrices.weight1kg || v.originalPrice || 0}`
          }));
          setRandomVegs(formatted);
        }
      })
      .catch(err => console.error("Failed to fetch random vegs for banner:", err));
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % TOTAL);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, TOTAL]);

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 40;
    if (offset < -threshold || velocity < -200) {
      setCurrent((prev) => (prev + 1) % TOTAL);
    } else if (offset > threshold || velocity > 200) {
      setCurrent((prev) => (prev - 1 + TOTAL) % TOTAL);
    }
  };

  const btnClasses = (green = false) =>
    `inline-block px-[18px] py-[7px] rounded-full text-white text-[11px] font-bold mt-3 border-none cursor-pointer font-body transition-all ` +
    (green ? "bg-[#063a06]" : "bg-gradient-to-br from-[#0e540b] to-[#063a06]");

  return (
    <>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="font-body bg-white rounded-[20px] overflow-hidden relative select-none mt-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex h-full cursor-grab touch-pan-y"
          whileTap={{ cursor: "grabbing" }}
        >

          {/* ── SLIDE 0 — Fresh Challenge ── */}
          <div
            className="min-w-full bg-white h-full flex flex-row items-center justify-between py-5 px-6 gap-4 box-border relative overflow-hidden"
          >
            {/* Paisley watermark */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ opacity: 0.045 }}
              viewBox="0 0 400 264"
              preserveAspectRatio="xMidYMid slice"
            >
              <circle cx="70" cy="55" r="42" stroke="#2d6010" strokeWidth="2" fill="none" />
              <circle cx="70" cy="55" r="28" stroke="#2d6010" strokeWidth="1.5" fill="none" />
              <circle cx="330" cy="205" r="42" stroke="#2d6010" strokeWidth="2" fill="none" />
              <circle cx="330" cy="205" r="28" stroke="#2d6010" strokeWidth="1.5" fill="none" />
              <ellipse cx="145" cy="215" rx="28" ry="46" stroke="#2d6010" strokeWidth="1.5" fill="none" transform="rotate(-30 145 215)" />
              <ellipse cx="285" cy="48" rx="28" ry="46" stroke="#2d6010" strokeWidth="1.5" fill="none" transform="rotate(20 285 48)" />
              <circle cx="200" cy="132" r="58" stroke="#2d6010" strokeWidth="0.8" fill="none" />
            </svg>

            {/* Hatch — top-left */}
            <svg className="absolute top-0 left-0 w-20 opacity-30 pointer-events-none" viewBox="0 0 80 80">
              <defs>
                <pattern id="hatch-tl" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="9" stroke="#b8a07a" strokeWidth="3.5" />
                </pattern>
              </defs>
              <rect width="80" height="80" fill="url(#hatch-tl)" />
            </svg>

            {/* Hatch — bottom-right */}
            <svg className="absolute bottom-0 right-0 w-20 h-20 opacity-30 pointer-events-none" viewBox="0 0 80 80">
              <defs>
                <pattern id="hatch-br" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="9" stroke="#b8a07a" strokeWidth="3.5" />
                </pattern>
              </defs>
              <rect width="80" height="80" fill="url(#hatch-br)" />
            </svg>

            {/* Left: Text */}
            <div className="flex-[1_1_200px] relative z-10">

              {/* Label */}
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
                style={{
                  fontFamily: "'Poppins', 'Funnel Sans', sans-serif",
                  color: "#4a7c1f",
                }}
              >
                <icons.Trophy color="#4a7c1f" />
                Limited Time Challenge
              </div>

              {/* Heading */}
              <h1
                className="m-0 leading-[1.08] text-[#1a4a08]"
                style={{
                  fontFamily: "'Funnel Display', sans-serif",
                  fontSize: "26px",
                  fontWeight: 800,
                }}
              >
                VegBazar Fresh<br />
                <span style={{ color: "#0e540b" }}>Challenge</span>
              </h1>

              {/* Order pills */}
              <div className="flex items-center gap-1.5 my-2">
                <span
                  className="bg-[#0e540b] text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  5 orders
                </span>
                <span
                  className="text-[11px] text-[#7a8a6a] font-medium"
                  style={{ fontFamily: "'Funnel Sans', sans-serif" }}
                >
                  in
                </span>
                <span
                  className="bg-[#063a06] text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  20 days
                </span>
              </div>

              {/* Prize badge */}
              <div className="inline-flex items-center gap-1.5 border-2 border-purple-600 rounded-[7px] px-3 py-[5px] mb-2.5 bg-purple-50">
                <icons.Trophy color="#7c3aed" />
                <span
                  className="text-[10px] font-bold text-purple-700"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "0.03em",
                  }}
                >
                  WIN FROM ₹5000 PRIZE POOL
                </span>
              </div>

              {/* CTA text */}
              <div
                className="text-[10px] font-bold uppercase tracking-wider text-orange-500"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Start your fresh journey today →
              </div>
            </div>

            {/* Right: Challenge image */}
            <div className="flex-[1_1_140px] flex items-center justify-center relative z-10">
              <img
                src="https://res.cloudinary.com/dltmiswel/image/upload/v1775998292/reward_dhzmno.webp"
                alt="VegBazar Fresh Challenge Prizes"
                className="w-full max-w-[220px] object-contain"
              />
            </div>
          </div>

          {/* ── SLIDE 1 — Features ── */}
          <div className="min-w-full flex flex-row items-center justify-between py-5 px-6 gap-4 box-border flex-wrap">
            <div className="flex-[1_1_200px] max-w-full">
              <img src={vegbazarLogo} alt="VegBazar" className="h-[22px] mb-2" />
              <h1 className="font-heading text-[26px] font-extrabold leading-[1.1] text-[#1a1a1a] m-0">
                <span className="text-[#063a06]">Fresh Veggies,</span><br />
                <span className="text-[#0e540b]">Doorstep Ready</span>
              </h1>
              <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                Direct from Valsad farmers — no middlemen.
              </p>
              <motion.button
                className={btnClasses()}
                onClick={() => navigate("/vegetables")}
                whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(14,84,11,.28)" }}
                whileTap={{ scale: 0.96 }}
              >
                Shop Now →
              </motion.button>
            </div>
            <div className="flex flex-row flex-wrap gap-1.5 flex-[1_1_140px] justify-center">
              {features.map((f, i) => <FeaturePill key={i} {...f} />)}
            </div>
          </div>

          {/* ── SLIDE 2 — Vegetables ── */}
          <div className="min-w-full flex flex-row items-center justify-between py-5 px-6 gap-4 box-border flex-wrap">
            <div className="flex-[1_1_200px]">
              <SlideLabel color="#0e540b">
                <icons.Activity color="#0e540b" />
                Today's Picks
              </SlideLabel>
              <h1 className="font-heading text-2xl font-extrabold leading-[1.1] text-[#1a1a1a] m-0">
                <span className="text-[#0e540b]">Farm-fresh</span><br />
                <span className="text-[#063a06]">every order</span>
              </h1>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {tags.map((t) => (
                  <span key={t} className="text-[9px] font-bold py-[3px] px-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {t}
                  </span>
                ))}
              </div>
              <motion.button
                className={btnClasses(true)}
                onClick={() => navigate("/vegetables")}
                whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(14,84,11,.28)" }}
                whileTap={{ scale: 0.96 }}
              >
                Browse Now →
              </motion.button>
            </div>
            <div className="flex flex-row flex-wrap gap-2 flex-[1_1_140px] justify-center">
              {randomVegs.map((v, i) => (
                <VegCard key={i} {...v} />
              ))}
            </div>
          </div>

        </motion.div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[5px] z-10">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setCurrent(i)}
              animate={{
                width: i === current ? 18 : 6,
                backgroundColor: i === current ? "#0e540b" : "#9ca3af",
                opacity: i === current ? 1 : 0.4
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full cursor-pointer"
            />
          ))}
        </div>

        {/* Bottom gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#063a06] via-[#16a34a] to-[#0e540b]" />
      </div>
    </>
  );
}