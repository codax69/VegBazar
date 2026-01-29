// Fixed Navbar.jsx with Glassmorphism (No Active Lines in Bottom Nav)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiHome, FiShoppingCart, FiPhone, FiUser, FiLogOut, FiMapPin } from "react-icons/fi";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { GiBasket } from "react-icons/gi";
import { PiPackageBold } from "react-icons/pi";
import { useOrderContext } from "../Context/OrderContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import lettuce from "../assets/lettuce_17024589.png";
import veg1 from "../assets/vegetable_12439915.png";
import veg2 from "../assets/vegetable_5029309.png";
import veg3 from "../assets/vegetables_2700637.png";
import veg4 from "../assets/vegetables_498280.png";
import veg5 from "../assets/vegetables_9241551.png";

const VegBazarLogo = "/vegbazar.svg";

const vegetableImages = [lettuce, veg1, veg2, veg3, veg4, veg5];

const Navbar = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { navigate } = useOrderContext();
  const { pathname: currentPath } = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % vegetableImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Memoized navigation items
  const navItems = useMemo(
    () => [
      { path: "/", icon: FiHome, label: "Home" },
      { path: "/offers", icon: GiBasket, label: "Basket" },
      { path: "/vegetables", icon: RiShoppingBag4Fill, label: "Vegetables" },
      { path: "/cart", icon: FiShoppingCart, label: "Cart" },
      { path: "/orders", icon: PiPackageBold, label: "Orders" },
      { path: "/support", icon: FiPhone, label: "Support" },
    ],
    []
  );

  const desktopNavItems = useMemo(
    () => [
      { path: "/", icon: FiHome, label: "Home" },
      { path: "/offers", icon: GiBasket, label: "Basket" },
      { path: "/vegetables", icon: RiShoppingBag4Fill, label: "Vegetables" },
      { path: "/cart", icon: FiShoppingCart, label: "Cart" },
      {
        path: "/orders",
        icon: PiPackageBold,
        label: "Orders",
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

  const handleLogout = useCallback(async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  }, [logout, navigate]);

  const handleAuthClick = useCallback(() => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, showUserMenu, navigate]);

  // Get user display info
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.name) {
      // Generate initials avatar
      const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return initials;
    }
    return null;
  };

  return (
    <>
      {/* Top Navbar - Desktop & Mobile */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
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
              <span className="text-[#0e540b] bg-white/40 backdrop-blur-sm px-1.5 sm:px-2 rounded-md text-xs sm:text-sm md:text-md font-extrabold tracking-wide border border-white/50">
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
                      ${isActive
                        ? "bg-green-100/80 text-black shadow-sm border border-green-200/50 backdrop-blur-sm"
                        : "text-black hover:bg-white/50 hover:backdrop-blur-sm"
                      }
                    `}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {path === "/vegetables" ? (
                      <div className="relative w-4 h-4 flex-shrink-0">
                        {vegetableImages.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt="Veg"
                            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${index === currentImageIndex
                              ? "opacity-100"
                              : "opacity-0"
                              }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-assistant">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Section - CTA & User Menu */}
            <div className="flex items-center gap-3">
              {/* Shop Now Button */}
              <button
                onClick={handleShopNow}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500/90 to-orange-600/90 backdrop-blur-sm hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-full text-sm font-semibold font-assistant shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                aria-label="Shop Now"
              >
                <RiShoppingBag4Fill className="w-4 h-4" />
                Shop Now
              </button>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={handleAuthClick}
                  disabled={isLoading}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200
                    backdrop-blur-sm border
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isAuthenticated
                      ? 'bg-green-100/50 hover:bg-green-200/50 border-green-200/50'
                      : 'bg-white/50 hover:bg-white/80 border-gray-200/50'
                    }
                  `}
                  aria-label={isLoading ? 'Loading...' : (isAuthenticated ? 'User menu' : 'Sign in')}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : isAuthenticated && user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={getUserDisplayName()}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white/60"
                    />
                  ) : isAuthenticated && getUserAvatar() ? (
                    <div className="w-7 h-7 rounded-full bg-green-600/90 text-white flex items-center justify-center text-xs font-semibold shadow-inner">
                      {getUserAvatar()}
                    </div>
                  ) : (
                    <FiUser className="w-5 h-5 text-gray-700" />
                  )}
                  {isAuthenticated && !isLoading && (
                    <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[100px] truncate">
                      {getUserDisplayName()}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu - Glassmorphism */}
                {showUserMenu && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        handleNavigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/60 flex items-center gap-2 transition-colors border-b border-gray-100"
                    >
                      <FiUser className="w-4 h-4" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('/orders');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/60 flex items-center gap-2 transition-colors"
                    >
                      <PiPackageBold className="w-4 h-4" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('/address');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/60 flex items-center gap-2 transition-colors"
                    >
                      <FiMapPin className="w-4 h-4" />
                      Address
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-2 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only - Glassmorphism */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white/95 backdrop-blur-lg border-t border-white/50
          shadow-[0_-8px_32px_0_rgba(31,38,135,0.1)]
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
                // Removed focus:ring properties to prevent border lines on click
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  px-3 py-1.5 rounded-xl min-w-[60px]
                  transition-all duration-200 ease-out
                  focus:outline-none
                  ${isActive ? "transform scale-105" : "active:scale-95"}
                `}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Icon Container */}
                <div
                  className={`
                    relative p-1.5 rounded-lg transition-all duration-200
                    ${isActive ? "bg-green-100/60 backdrop-blur-sm" : ""}
                  `}
                >
                  {path === "/vegetables" ? (
                    <div className="relative w-5 h-5">
                      {vegetableImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="Veg"
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${index === currentImageIndex
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Icon
                      className={`
                      w-5 h-5 transition-colors duration-200
                      ${isActive ? "text-green-700" : "text-black/70"}
                    `}
                      aria-hidden="true"
                    />
                  )}
                  {/* Removed Active Indicator Dot */}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] font-medium transition-all duration-200
                    ${isActive ? "text-green-800 font-semibold" : "text-black/70"}
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