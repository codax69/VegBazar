import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiHome, FiShoppingCart, FiPhone } from "react-icons/fi";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { GiBasket } from "react-icons/gi";
import { MdLocalShipping } from "react-icons/md";
import { useOrderContext } from "../Context/OrderContext";
import { useLocation } from "react-router-dom";

const VegBazarLogo = "/vegbazar.svg";

const Navbar = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const { navigate } = useOrderContext();
  const { pathname: currentPath } = useLocation();

  // Optimized scroll handler with debouncing
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const shouldShow = currentScrollY < lastScrollY || currentScrollY < 50;

        if (shouldShow !== isBottomNavVisible) {
          setIsBottomNavVisible(shouldShow);
        }

        lastScrollY = currentScrollY;
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isBottomNavVisible]);

  // Memoized navigation items
  const navItems = useMemo(
    () => [
      { path: "/", icon: FiHome, label: "Home" },
      { path: "/offers", icon: GiBasket, label: "Basket" },
      { path: "/vegetables", icon: RiShoppingBag4Fill, label: "Vegetables" },
      { path: "/veg-bag", icon: FiShoppingCart, label: "Cart" },
      { path: "/track-your-order", icon: MdLocalShipping, label: "Track" },
      { path: "/support", icon: FiPhone, label: "Support" },
    ],
    []
  );

  const desktopNavItems = useMemo(
    () => [
      { path: "/", icon: FiHome, label: "Home" },
      { path: "/offers", icon: GiBasket, label: "Basket" },
      { path: "/vegetables", icon: RiShoppingBag4Fill, label: "Vegetables" },
      { path: "/veg-bag", icon: FiShoppingCart, label: "Cart" },
      {
        path: "/track-your-order",
        icon: MdLocalShipping,
        label: "Track Order",
      },
      { path: "/support", icon: FiPhone, label: "Support" },
    ],
    []
  );

  // Memoized handlers
  const handleNavigate = useCallback(
    (path) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate(path);
    },
    [navigate]
  );

  const handleShopNow = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/vegetables");
  }, [navigate]);

  return (
    <>
      {/* Top Navbar - Desktop & Mobile */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#e8f9f0] to-[#f0fcf6] backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigate("/")}
              className="flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:scale-105"
              style={{ fontFamily: "Trirong, serif" }}
              aria-label="VegBazar Home"
            >
              <img
                src={VegBazarLogo}
                alt="VegBazar"
                className="w-6 sm:w-7 md:w-8 lg:w-9"
                loading="lazy"
              />
              <span className="text-[#023D01] backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs sm:text-sm md:text-base font-semibold tracking-wide">
                VegBazar
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {desktopNavItems.map(({ path, icon: Icon, label }) => {
                const isActive = currentPath === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigate(path)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-out
                      ${
                        isActive
                          ? "bg-green-100 text-black shadow-sm"
                          : "text-black hover:bg-green-50"
                      }
                    `}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-assistant">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleShopNow}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-full text-sm font-semibold font-assistant shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              aria-label="Shop Now"
            >
              <RiShoppingBag4Fill className="w-4 h-4" />
              Shop Now
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white/95 backdrop-blur-md
          shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
          transition-transform duration-300 ease-out
          ${isBottomNavVisible ? "translate-y-0" : "translate-y-full"}
        `}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  px-3 py-1.5 rounded-xl min-w-[60px]
                  transition-all duration-200 ease-out
                  focus:outline-none focus:ring-2 focus:ring-green-500
                  ${isActive ? "transform scale-105" : "active:scale-95"}
                `}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Icon Container */}
                <div
                  className={`
                  relative p-1.5 rounded-lg transition-all duration-200
                  ${isActive ? "bg-green-50" : ""}
                `}
                >
                  <Icon
                    className={`
                      w-5 h-5 transition-colors duration-200
                      ${isActive ? "text-green-700" : "text-black"}
                    `}
                    aria-hidden="true"
                  />
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-700 rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                  text-[10px] font-medium transition-all duration-200
                  ${isActive ? "text-green-800 font-semibold" : "text-black"}
                `}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
