import React, { useState } from "react";
import { MapPin, Truck, IndianRupee, Users, Leaf, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const vegbazarLogo = "/vegbazar.svg";

export default function VegBazarResponsiveBanner() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Doorstep Delivery",
      shortTitle: "Delivery",
      color: "#e64200",
    },
    {
      icon: IndianRupee,
      title: "Affordable Prices",
      shortTitle: "Affordable",
      color: "#0e540b",
    },
    {
      icon: Users,
      title: "Support Farmers",
      shortTitle: "Farmers",
      color: "#e64200",
    },
    {
      icon: Leaf,
      title: "Farm Fresh",
      shortTitle: "Fresh",
      color: "#0e540b",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assured",
      shortTitle: "Quality",
      color: "#e64200",
    },
    {
      icon: RefreshCw,
      title: "Returns & Refunds",
      shortTitle: "Returns",
      color: "#0e540b",
    },
  ];

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-white via-[#fafbf9] to-white"
      style={{
        minHeight: '250px',
        fontFamily: "'funnel', 'Assistant', sans-serif"
      }}
    >
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 sm:w-1/3 bg-gradient-to-r from-[#e64200]/5 to-transparent animate-pulse"></div>
        <div className="absolute right-0 top-0 h-full w-1/2 sm:w-1/3 bg-gradient-to-l from-[#0e540b]/5 to-transparent animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto flex flex-col lg:flex-row h-full max-w-7xl justify-center lg:items-center px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 lg:py-10 gap-4 sm:gap-6 lg:gap-8">

        {/* Left Section - Logo & Hero Text */}
        <div className="flex-1 w-full lg:max-w-lg opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
          <img
            src={vegbazarLogo}
            alt="VegBazar"
            className="mb-2 sm:mb-3 h-7 sm:h-8 md:h-10 lg:h-11 animate-bounce"
          />
          <h1 className="mb-2 font-poppins font-bold sm:mb-3 text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-black leading-tight">
            <span className="text-[#0e540b]">Fresh</span>
            <span className="text-[#e64200]">Vegetables</span>
          </h1>
          <p className="mb-3 sm:mb-4 max-w-md text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed font-funnel opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
            Farm-fresh produce delivered to your doorstep in Valsad
          </p>

          {/* Free Delivery Badge */}
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e64200] to-[#c73900] px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 shadow-lg transition-all hover:shadow-xl hover:scale-105 duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0 animate-bounce" />
            <span className="text-xs font-funnel sm:text-sm md:text-base font-bold text-white whitespace-nowrap">
              ₹269+ FREE DELIVERY
            </span>
          </div>

          {/* CTA Button */}
          <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
            <button
              onClick={() => navigate("/vegetables")}
              className="group inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 font-funnnel text-xs sm:text-sm md:text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 transform"
              style={{ backgroundColor: "#0e540b" }}
            >
              Shop Now
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        {/* Right Section - USP Icons Grid */}
        <div className="flex-1 w-full lg:max-w-xl">

          {/* Desktop Grid (lg and up) - 3 columns */}
          <div className="hidden lg:grid grid-cols-3 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="flex flex-col items-center gap-2.5 rounded-lg bg-gradient-to-br from-gray-50 to-white p-3 shadow-md border border-gray-100 hover:border-gray-200 hover:shadow-lg cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-1 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  backgroundColor: hoveredFeature === idx ? '#f9fafb' : '#ffffff'
                }}
              >
                <feature.icon
                  className="h-6 w-6 flex-shrink-0 transition-all duration-500"
                  style={{
                    color: feature.color,
                    transform: hoveredFeature === idx ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)'
                  }}
                />
                <span className="text-xs font-semibold font-funnel text-gray-800 text-center transition-colors duration-300">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>

          {/* Tablet Grid (md) - 3 columns */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-br from-gray-50 to-white p-2.5 shadow-md border border-gray-100 hover:border-gray-200 hover:shadow-lg cursor-pointer transition-all duration-400 hover:scale-105 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${idx * 0.08}s`
                }}
              >
                <feature.icon
                  className="h-5 w-5 flex-shrink-0 transition-all duration-500"
                  style={{
                    color: feature.color,
                    transform: hoveredFeature === idx ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)'
                  }}
                />
                <span className="text-xs font-semibold font-funnel text-gray-800 text-center">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>

          {/* Small Tablet Grid (sm) - 3 columns with compact layout */}
          <div className="hidden sm:grid md:hidden grid-cols-3 gap-2.5">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 rounded-lg bg-gradient-to-br from-gray-50 to-white p-2.5 shadow-md border border-gray-100 transition-all duration-300 active:scale-95 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${idx * 0.08}s`
                }}
              >
                <feature.icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: feature.color }}
                />
                <span className="text-[10px] font-semibold font-funnel  text-gray-800 text-center">
                  {feature.shortTitle}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile Grid (below sm) - 2 columns */}
          <div className="grid sm:hidden grid-cols-2 gap-2.5">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-gray-50 to-white p-2.5 shadow-sm border border-gray-100 transition-all duration-300 active:scale-95 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${idx * 0.05}s`
                }}
              >
                <feature.icon
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: feature.color }}
                />
                <span className="text-[10px] font-semibold font-funnel  text-gray-800">
                  {feature.shortTitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line - Animated */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 animate-pulse"
        style={{ background: `linear-gradient(to right, #e64200, #ffffff, #0e540b)` }}
      ></div>

      {/* Tailwind Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}