import React, { useEffect, useState } from "react";
import { Sparkles, PartyPopper, Sun } from "lucide-react";
import kiteSvg from "../assets/vegbazarkite.svg";
const vegbazarLogo = "/vegbazar.svg";

export default function VegBazarMakarsankranti() {
  const [kiteFly, setKiteFly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setKiteFly(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative mx-auto w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff7e6] via-[#fff1d6] to-[#ffe6b3] px-4 py-20 md:max-w-6xl">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <Sun className="absolute right-6 top-6 h-14 w-14 text-[#ff9f1c]/40 animate-pulse" />
        <div className="absolute bottom-6 left-6 h-10 w-10 rounded-full border border-[#e63946]/30 animate-spin" />
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <img src={vegbazarLogo} className="w-8 sm:w-10" alt="VegBazar" />
          <h1
            className="font-extrabold text-[#0e540b]"
            style={{ fontFamily: "Trirong, serif" }}
          >
            VegBazar
          </h1>
        </div>

        {/* Greeting */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-[#e63946]" />
          <h2
            className="font-bold text-[#9c2a2a]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Happy Makarsankranti
          </h2>
          <Sparkles className="h-4 w-4 text-[#e63946]" />
        </div>

        {/* Kite Animation */}
        {/* Kite Animation with PNG */}
        <div className="relative mb-4 flex h-36 items-center justify-center overflow-hidden">
          <div
            className={`relative transition-all duration-1000 ease-out ${
              kiteFly
                ? "-translate-y-2 translate-x-6 rotate-6 opacity-100"
                : "translate-y-24 -translate-x-6 -rotate-12 opacity-0"
            }`}
          >
            {/* Kite PNG — FRONT */}
            <img
              src={kiteSvg}
              alt="Makarsankranti Kite"
              className="relative z-20 w-20 sm:w-24 drop-shadow-lg
                 animate-[kite-float_3s_ease-in-out_infinite]"
            />

            {/* Manja — BEHIND but ATTACHED */}
            <div
              className="absolute z-10 left-1/2 top-full h-24 w-px
                 -translate-x-1/2 bg-[#6d4c41]"
            />
          </div>
        </div>

        {/* Text */}
        <p
          className="mb-1 font-semibold text-[#0e540b]"
          style={{ fontFamily: "Assistant, sans-serif" }}
        >
          Til-Gud Ghya, God-God Bola 🍬🪁
        </p>
        <p
          className="mb-3 text-[#e63946]"
          style={{ fontFamily: "Assistant, sans-serif", fontSize: "0.9rem" }}
        >
          Fresh harvest • Sweet beginnings • Healthy homes
        </p>

        {/* Festive Highlights */}
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              title: "Til & Groundnut",
              desc: "Pure, festive quality",
              color: "from-[#6d4c41] to-[#8d6e63]",
            },
            {
              title: "Free Delivery",
              desc: "Orders above ₹249",
              color: "from-[#0e540b] to-[#166d12]",
            },
            {
              title: "Fresh Veggies",
              desc: "Same-day farm supply",
              color: "from-[#ff9f1c] to-[#ffbf69]",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-white/90 p-2 shadow-sm">
              <div
                className={`mx-auto mb-1 h-7 w-7 rounded-full bg-gradient-to-br ${item.color}`}
              />
              <h3 className="text-xs font-bold text-[#0e540b]">{item.title}</h3>
              <p className="text-[11px] text-black/70">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => (window.location.href = "/vegetables")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff9f1c] px-5 py-1.5 text-xs font-bold text-white shadow hover:scale-105"
          style={{ fontFamily: "Assistant, sans-serif" }}
        >
          <PartyPopper className="h-4 w-4" />
          Order Festive Freshness
        </button>
      </div>
    </section>
  );
}
