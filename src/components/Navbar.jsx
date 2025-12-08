import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiHome, FiShoppingCart, FiPhone, FiMenu, FiX } from "react-icons/fi";
import VegBazarLogo from "../../public/vegbazar.svg";
import { useOrderContext } from "../Context/OrderContext";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { GiBasket } from "react-icons/gi";
import { MdLocalShipping } from "react-icons/md";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const { navigate } = useOrderContext();
  const { pathname: currentPath } = useLocation();

  // Optimized scroll handler with requestAnimationFrame
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingUp = currentScrollY < lastScrollY;
          const shouldShow = scrollingUp || currentScrollY < 50;

          setIsBottomNavVisible(shouldShow);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized navigation items to prevent recreation on every render
  const bottomNavItems = useMemo(
    () => [
      { path: "/", icon: FiHome, label: "Home" },
      { path: "/offers", icon: GiBasket, label: "Basket" },
      { path: "/vegetables", icon: RiShoppingBag4Fill, label: "Vegetables" },
      { path: "/veg-bag", icon: FiShoppingCart, label: "Cart" },
      { path: "/track-your-order", icon: MdLocalShipping, label: "Track" },
      { path: "/help", icon: FiPhone, label: "Contact" },
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
      { path: "/help", icon: FiPhone, label: "Contact" },
    ],
    []
  );

  // Memoized navigation handlers to prevent recreation
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      setMobileMenuOpen(false);
    },
    [navigate]
  );

  const handleLogoClick = useCallback(() => {
    scrollTo(0, 0);
    navigate("/");
  }, [navigate]);
  const handleShopNow = useCallback(() => {
    scrollTo(0, 0);
    navigate("/vegetables");
  }, [navigate]);

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#f0fcf6] text-[#023D01] shadow-md shadow-[#023D01]/20">
        <div className="container max-w-7xl mx-auto px-4 pt-2 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
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

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            {desktopNavItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <button
                  onClick={() => {
                    scrollTo(0, 0);
                    navigate(path);
                  }}
                  className={`flex items-center font-assistant gap-1 cursor-pointer transition hover:text-green-600 focus:outline-none focus:text-green-600 ${
                    currentPath === path ? "text-green-600 font-semibold" : ""
                  }`}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA Button */}
          <button
            onClick={handleShopNow}
            className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold font-assistant transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Shop Now"
          >
            Shop Now
          </button>
        </div>

        {/* Mobile Menu */}
        {/* {mobileMenuOpen && (
          <div className="md:hidden bg-[#f0fcf6] border-t border-green-700 shadow-inner">
            <ul className="flex flex-col gap-2 py-3 text-sm font-medium px-4">
              {desktopNavItems.map(({ path, icon: Icon, label }) => (
                <li key={path}>
                  <button
                    onClick={() => handleNavigate(path)}
                    className="flex items-center font-assistant gap-2 py-2 border-b border-green-700 w-full text-left hover:text-green-600"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </li>
              ))}
              <button
                onClick={handleShopNow}
                className="mt-3 w-full font-assistant bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-semibold"
              >
                Shop Now
              </button>
            </ul>
          </div>
        )} */}
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <nav
        className={`fixed -bottom-1 left-0 w-full z-50 bg-[#f0fcf6] border-t border-gray-200 shadow-lg md:hidden transition-transform duration-300 ease-in-out ${
          isBottomNavVisible ? "translate-y-0" : "translate-y-full"
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map(({ path, icon: Icon, label }) => {
            const active = currentPath === path;
            return (
              <button
                key={path}
                onClick={() => {
                  scrollTo(0, 0);
                  navigate(path);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-300 px-3 py-1 rounded-lg focus:outline-none ${
                  active ? "scale-110" : "scale-100"
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={`relative p-2 rounded-full transition-all duration-300 ${
                    active ? "bg-green-50" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      active ? "text-green-600" : "text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    active ? "text-green-600 font-semibold" : "text-gray-500"
                  }`}
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
