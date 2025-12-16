import React from "react";
import { Leaf, Clock, Truck, Star } from "lucide-react";
import { GiBasket } from "react-icons/gi";

const vegbazarLogo = "/vegbazar.svg";

export default function VegBazarBanner() {
  const handleShopNow = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.href = "/vegetables";
  };

  return (
    <section className="w-full mx-auto bg-gradient-to-br from-[#f0fcf6] via-[#e8faf2] to-[#d9f7eb] py-2 px-3 rounded-xl shadow-md relative overflow-hidden sm:py-3 sm:px-4 sm:rounded-2xl sm:shadow-lg md:max-w-7xl md:py-4 md:px-6 md:rounded-3xl">
      {/* Floating decorative elements - hidden on mobile for performance */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-5 left-5 w-12 h-12 border-2 border-[#0e540b] rounded-full animate-spin sm:w-16 sm:h-16"></div>
        <div className="absolute bottom-5 right-5 w-16 h-16 border-2 border-[#f54a00] rounded-full animate-spin sm:w-20 sm:h-20"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Badge */}
        <div className="flex justify-center mb-1.5 sm:mb-2">
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#f54a00] to-[#ff6b2c] text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[10px] sm:shadow-md md:text-xs">
            <Star className="w-2.5 h-2.5 fill-white animate-pulse sm:w-3 sm:h-3" />
            <span className="font-assistant">PRE-ORDER • NEXT DAY DELIVERY</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-2 items-center sm:grid-cols-2 sm:gap-3 md:gap-4">
          {/* Left Side */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-1.5 mb-1 sm:justify-start sm:gap-2 sm:mb-1.5">
              <img
                src={vegbazarLogo}
                className="w-8 sm:w-10 md:w-12"
                alt="VegBazar"
              />
              <h1
                className="text-base font-extrabold text-[#0e540b] tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
                style={{ fontFamily: "Trirong, serif" }}
              >
                VegBazar
              </h1>
            </div>

            <h2 className="text-sm font-bold text-[#0e540b] mb-0.5 font-poppins sm:text-base md:text-lg lg:text-xl">
              Farm Fresh Vegetables
            </h2>
            <p className="text-[#f54a00] text-xs font-semibold mb-1.5 font-assistant sm:text-sm sm:mb-2 md:text-base">
              Delivered Every Morning
            </p>

            <button
              onClick={handleShopNow}
              className="inline-flex font-assistant items-center gap-1.5 bg-gradient-to-r from-[#0e540b] to-[#166d12] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm md:px-5 md:text-base"
            >
              <GiBasket className="w-3 h-3 sm:w-4 sm:h-4" />
              Shop Now
            </button>
          </div>

          {/* Right Side - Features */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all sm:p-3 sm:rounded-xl md:p-4">
              <div className="bg-gradient-to-br from-[#0e540b] to-[#166d12] w-7 h-7 rounded-full flex items-center justify-center mb-1 sm:w-8 sm:h-8 md:w-10 md:h-10">
                <Leaf className="w-3 h-3 text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-bold text-black text-[10px] mb-0.5 font-poppins sm:text-xs md:text-sm">
                Farm Fresh
              </h3>
              <p className="text-[9px] text-black/60 font-assistant sm:text-[10px] md:text-xs">
                Local farms
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all sm:p-3 sm:rounded-xl md:p-4">
              <div className="bg-gradient-to-br from-[#f54a00] to-[#ff6b2c] w-7 h-7 rounded-full flex items-center justify-center mb-1 sm:w-8 sm:h-8 md:w-10 md:h-10">
                <Clock className="w-3 h-3 text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-bold text-black text-[10px] mb-0.5 font-poppins sm:text-xs md:text-sm">
                Pre-Order
              </h3>
              <p className="text-[9px] text-black/60 font-assistant sm:text-[10px] md:text-xs">
                Order today
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all sm:p-3 sm:rounded-xl md:p-4">
              <div className="bg-gradient-to-br from-[#0e540b] to-[#166d12] w-7 h-7 rounded-full flex items-center justify-center mb-1 sm:w-8 sm:h-8 md:w-10 md:h-10">
                <Truck className="w-3 h-3 text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-bold text-black text-[10px] mb-0.5 font-poppins sm:text-xs md:text-sm">
                Next Day
              </h3>
              <p className="text-[9px] text-black/60 font-assistant sm:text-[10px] md:text-xs">
                Morning drop
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all sm:p-3 sm:rounded-xl md:p-4">
              <div className="bg-gradient-to-br from-[#f54a00] to-[#ff6b2c] w-7 h-7 rounded-full flex items-center justify-center mb-1 sm:w-8 sm:h-8 md:w-10 md:h-10">
                <Star className="w-3 h-3 text-white fill-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-bold text-black text-[10px] mb-0.5 font-poppins sm:text-xs md:text-sm">
                Quality
              </h3>
              <p className="text-[9px] text-black/60 font-assistant sm:text-[10px] md:text-xs">
                Premium pick
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Ticker */}
        <div className="mt-1.5 bg-white/50 backdrop-blur-sm rounded-full py-1 px-2 overflow-hidden sm:mt-2 sm:py-1.5 sm:px-3">
          <div className="whitespace-nowrap text-[9px] font-semibold text-black/70 animate-marquee font-assistant sm:text-[10px] md:text-xs">
            🌿 PRE-ORDER TODAY • 🚚 NEXT DAY DELIVERY • 🥬 FARM FRESH • ⭐
            PREMIUM QUALITY • 🌿 PRE-ORDER TODAY • 🚚 NEXT DAY DELIVERY • 🥬
            FARM FRESH • ⭐ PREMIUM QUALITY
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: inline-block;
        }
        @media (max-width: 640px) {
          .animate-marquee {
            animation-duration: 20s;
          }
        }
      `}</style>
    </section>
  );
}
