import React, { useState, useEffect } from "react";
import { Sparkles, Gift, PartyPopper } from "lucide-react";

const vegbazarLogo = "/vegbazar.svg";

export default function VegBazarNewYear() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#f0fcf6] via-[#e8faf2] to-[#d9f7eb] px-3 py-3 sm:px-4 sm:py-4 md:max-w-6xl">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-4 left-4 h-12 w-12 rounded-full border border-[#0e540b]/30 animate-spin" />
        <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full border border-[#f54a00]/30 animate-spin" />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <img src={vegbazarLogo} className="w-8 sm:w-10" alt="VegBazar" />
          <h1
            className="font-extrabold text-[#0e540b]"
            style={{
              fontFamily: "Trirong, serif",
              fontSize: "clamp(1.2rem,3.5vw,2rem)",
            }}
          >
            VegBazar
          </h1>
        </div>

        {/* Greeting */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-[#f54a00]" />
          <h2
            className="font-bold text-[#0e540b]"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "clamp(1rem,3vw,1.4rem)",
            }}
          >
            Happy New Year
          </h2>
          <Sparkles className="h-4 w-4 text-[#f54a00]" />
        </div>

        {/* Year Animation (unchanged, just shorter container) */}
        <div className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden mb-4">
          <div className="relative">
            {/* 202 - static part */}
            <span
              className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0e540b] to-[#166d12]"
              style={{ fontFamily: "Trirong, serif" }}
            >
              202
            </span>

            {/* Animated 5 and 6 */}
            <span className="relative inline-block w-16 md:w-24 align-baseline">
              {/* Number 5 - swipes up */}
              <span
                className={`absolute left-0 text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f54a00] to-[#ff6b2c] transition-all duration-1000 ease-out ${
                  animationComplete
                    ? "-translate-y-full opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
                style={{ fontFamily: "Trirong, serif" }}
              >
                5
              </span>

              {/* Number 6 - swipes in from below */}
              <span
                className={`absolute left-0 text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f54a00] to-[#ff6b2c] transition-all duration-1000 ease-out ${
                  animationComplete
                    ? "-translate-y-14 md:-translate-y-25 opacity-100"
                    : "translate-y-full opacity-0"
                }`}
                style={{ fontFamily: "Trirong, serif" }}
              >
                6
              </span>
            </span>
          </div>
        </div>

        {/* Subtext */}
        <p
          className="mb-0.5 font-semibold text-[#0e540b]"
          style={{
            fontFamily: "Assistant, sans-serif",
            fontSize: "clamp(0.9rem,2.8vw,1.1rem)",
          }}
        >
          Fresh Beginnings, Fresh Vegetables 🌿
        </p>
        <p
          className="mb-3 text-[#f54a00]"
          style={{
            fontFamily: "Assistant, sans-serif",
            fontSize: "clamp(0.75rem,2.6vw,0.95rem)",
          }}
        >
          Start the year healthy with farm-fresh produce
        </p>

        {/* Offers */}
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              icon: Gift,
              title: "Loyalty Reward",
              desc: "3rd Order: Free Delivery or Extra Discount",
              green: true,
            },
            {
              icon: PartyPopper,
              title: "Free Delivery",
              desc: "Above ₹250",
              green: false,
            },
            {
              icon: Sparkles,
              title: "Fresh Promise",
              desc: "Daily farm delivery",
              green: true,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/90 p-2 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full ${
                  item.green
                    ? "bg-gradient-to-br from-[#0e540b] to-[#166d12]"
                    : "bg-gradient-to-br from-[#f54a00] to-[#ff6b2c]"
                }`}
              >
                <item.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-[#0e540b]">{item.title}</h3>
              <p className="text-[11px] text-black/70">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => (window.location.href = "/vegetables")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0e540b] to-[#166d12] px-5 py-1.5 text-xs font-bold text-white shadow hover:scale-105"
          style={{ fontFamily: "Assistant, sans-serif" }}
        >
          <PartyPopper className="h-4 w-4" />
          Celebrate with Fresh Veggies
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
