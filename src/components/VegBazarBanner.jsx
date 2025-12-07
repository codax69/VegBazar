import React from "react";
import vegbazarLogo from "../../public/vegbazar.svg";

export default function VegBazarBanner() {
  const vegbazar =
    vegbazarLogo

  return (
    <section className="w-full sm:w-full md:max-w-7xl lg:max-w-7xl mx-auto bg-gradient-to-br from-[#f0fcf6] via-[#e8faf2] to-[#d9f7eb] py-1 sm:py-3 px-1 sm:px-1 rounded-3xl shadow-md shadow-gray-400 relative overflow-hidden font-assistant">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <div className="max-w-xl mx-auto text-center relative z-10">
        {/* Pre-Order Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white text-[#f54a00] px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold mb-1 shadow-sm animate-bounce">
          <span className="w-1.5 h-1.5 bg-[#f54a00] rounded-full animate-ping"></span>
          <span>PRE-ORDER NOW</span>
        </div>
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
          <div className="h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center flex-shrink-0">
            <img
              src={vegbazar}
              className="w-full transform hover:scale-110 transition-transform"
              alt="VegBazar Logo"
              width="48"
              height="48"
            />
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl text-[#0e540b] font-extrabold tracking-tight trirong">
            VegBazar
          </h1>
        </div>
        {/* Main Tagline with pre-order message */}
        <div className="mb-1 sm:mb-2">
          <p className="text-sm sm:text-base font-assistant lg:text-lg text-gray-600 leading-relaxed mb-1">
            Fresh vegetables from local farms
          </p>
          <p className="text-xs sm:text-sm font-poppins text-[#f54a00] font-bold animate-pulse">
            Order 4 PM - 7 PM • Get Fresh Next Morning
          </p>
        </div>
        {/* Feature Pills - Compact */}
        <div className="flex font-assistant flex-wrap items-center justify-center gap-1.5 mb-2">
          <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#0e540b] shadow-sm">
            Farm Fresh
          </span>
          <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#f54a00] shadow-sm">
            Pre-Order
          </span>
          <span className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#0e540b] shadow-sm">
            Morning Delivery
          </span>
        </div>
        {/* Ticker */}
        <div className="overflow-hidden">
          <div className="whitespace-nowrap text-[9px] sm:text-[11px] text-gray-600 font-medium inline-block animate-marquee">
            PRE-ORDER 4PM-7PM • FRESH MORNING DELIVERY • FARM TO HOME • ORDER
            TODAY • PRE-ORDER 4PM-7PM • FRESH MORNING DELIVERY
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
