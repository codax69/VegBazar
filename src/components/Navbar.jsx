// src/components/Navbar.jsx — Rebuilt Navbar with v2 premium minimal styling, 1px hairlines, and exclusive type
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiHome, FiShoppingCart, FiPhone, FiUser, FiLogOut, FiMapPin, FiSun, FiMoon } from "react-icons/fi";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { GiBasket } from "react-icons/gi";
import { PiPackageBold } from "react-icons/pi";
import { Wallet } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import { useWallet } from "../Context/WalletContext";
import { useTheme } from "../Context/ThemeContext";
import { useCart } from "../Context/CartContext";
import veg1 from "../assets/vegetable_12439915.png";

const VegBazarLogo = "/vegbazar.svg";

const Navbar = () => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { navigate } = useOrderContext();
  const { pathname: currentPath } = useLocation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // Safely access wallet context with fallback
  let balance = 0;
  let hasWallet = false;
  try {
    const walletContext = useWallet();
    balance = walletContext.balance;
    hasWallet = walletContext.hasWallet;
  } catch {
    // Wallet context fallback
  }

  // Safely access theme context with fallback
  let theme = "light";
  let toggleTheme = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // Theme context fallback
  }

  // Safely access cart context for live counter badge
  let cartItemCount = 0;
  try {
    const cartContext = useCart();
    cartItemCount = cartContext.cart?.reduce(
      (sum, item) => sum + (parseInt(item.quantity) || 1),
      0
    ) || 0;
  } catch {
    // Cart context fallback
  }

  // Scroll handler for mobile bottom nav visibility
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
      { path: "/cart", icon: FiShoppingCart, label: "Cart", badge: cartItemCount },
      { path: "/orders", icon: PiPackageBold, label: "Orders" },
      { path: "/support", icon: FiPhone, label: "Support" },
    ],
    [cartItemCount]
  );

  const handleNavigate = useCallback(
    (path) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate(path);
    },
    [navigate]
  );

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

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (user?.profilePicture) return user.profilePicture;
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return null;
  };

  return (
    <>
      {/* Top Navbar — v2 Hairline Border, No Glassmorphism, Premium Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-2 cursor-pointer select-none shrink-0"
              aria-label="VegBazar Home"
            >
              <img
                src={VegBazarLogo}
                alt="VegBazar Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                loading="eager"
              />
              <span className="font-display font-semibold text-[19px] sm:text-[20px] text-[var(--color-text-primary)] tracking-tight">
                VegBazar
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ path, icon: NavIcon, label, badge }) => {
                const isActive = currentPath === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigate(path)}
                    className={`
                      relative flex items-center gap-1.5 py-4 text-[13px] font-body font-medium transition-colors duration-150
                      ${isActive
                        ? "text-[var(--color-brand-green)] font-medium border-b-2 border-[var(--color-brand-green)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }
                    `}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {path === "/vegetables" ? (
                      <img
                        src={veg1}
                        alt=""
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <NavIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span>{label}</span>

                    {/* Cart Badge */}
                    {badge > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[var(--color-amber)] text-[var(--color-amber-ink)]">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle — 30-32px square icon button with 1px border */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-[32px] sm:h-[32px] rounded-[6px] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
                aria-label="Toggle dark mode"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'dark' ? (
                  <FiSun className="w-4 h-4" />
                ) : (
                  <FiMoon className="w-4 h-4" />
                )}
              </button>

              {/* User Menu Trigger */}
              <div className="relative user-menu-container">
                <button
                  onClick={handleAuthClick}
                  disabled={isLoading}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors text-[13px] font-body font-medium text-[var(--color-text-primary)]
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  aria-label={isLoading ? 'Loading...' : (isAuthenticated ? 'User menu' : 'Sign in')}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[var(--color-border-strong)] border-t-[var(--color-brand-green)] rounded-full animate-spin" />
                  ) : isAuthenticated && user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={getUserDisplayName()}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : isAuthenticated && getUserAvatar() ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-brand-green)] text-white flex items-center justify-center text-[10px] font-mono font-medium">
                      {getUserAvatar()}
                    </div>
                  ) : (
                    <FiUser className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  )}
                  {isAuthenticated && !isLoading && (
                    <span className="max-w-[80px] sm:max-w-[110px] truncate">
                      {getUserDisplayName()}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] py-2 shadow-lg z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate font-body">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate font-body mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[13px] font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-tint-green)] flex items-center gap-2 transition-colors border-b border-[var(--color-border)]"
                    >
                      <FiUser className="w-4 h-4" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('/wallet');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[13px] font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-tint-green)] flex items-center gap-2 transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>My Wallet</span>
                      {hasWallet && (
                        <span className="ml-auto text-[11px] font-mono font-medium text-[var(--color-brand-green)] bg-[var(--color-tint-green)] px-2 py-0.5 rounded-full">
                          ₹{balance?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('/orders');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[13px] font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-tint-green)] flex items-center gap-2 transition-colors"
                    >
                      <PiPackageBold className="w-4 h-4" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        handleNavigate('/address');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[13px] font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-tint-green)] flex items-center gap-2 transition-colors"
                    >
                      <FiMapPin className="w-4 h-4" />
                      Address
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-[13px] font-body text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors border-t border-[var(--color-border)] mt-1"
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

      {/* Mobile Bottom Navigation — Flat bg-bg-surface with 1px top border, no shadow, touch targets >= 44px */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-[var(--color-bg-surface)] border-t border-[var(--color-border)]
          transition-transform duration-150 ease-out
          ${isBottomNavVisible ? "translate-y-0" : "translate-y-full"}
        `}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-2 py-1 safe-area-inset-bottom w-full max-w-md mx-auto min-h-[44px]">
          {navItems.map(({ path, icon: MobileNavIcon, label, badge }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className="relative flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors duration-150 focus:outline-none"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  {path === "/vegetables" ? (
                    <img
                      src={veg1}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <MobileNavIcon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? "text-[var(--color-brand-green)]" : "text-[var(--color-text-muted)]"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[var(--color-amber)] text-[var(--color-amber-ink)] text-[9px] font-mono font-medium px-1 rounded-full">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] font-body mt-0.5 transition-colors ${
                    isActive ? "text-[var(--color-brand-green)] font-medium" : "text-[var(--color-text-muted)]"
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