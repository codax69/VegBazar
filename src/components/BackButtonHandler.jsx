import { useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OrderContext } from "../Context/OrderContext";

/**
 * BackButtonHandler Component
 * Manages browser back button and Android hardware back button behavior
 * Provides controlled navigation flow and prevents unwanted exits
 */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedOffer, isOrderPlaced } = useContext(OrderContext);
  const isHandlingBack = useRef(false);

  // Define custom back navigation routes
  const getBackRoute = useCallback(
    (currentPath) => {
      // Route mapping for back navigation
      const routes = {
        // Order flow
        "/order-confirmation": "/veg-bag",
        "/billing": selectedOffer ? "/select-vegetables" : "/veg-bag",
        "/select-vegetables": "/offers",
        
        // Shopping flow
        "/veg-bag": "/",
        "/vegetables": "/",
        "/offers": "/",
        
        // Info pages
        "/customer-info": 
          selectedOffer ? "/select-vegetables" : "/",
        "/track-your-order": "/",
        "/help": "/",
      };

      return routes[currentPath] || null;
    },
    [selectedOffer]
  );

  // Check if route should be protected from leaving
  const isProtectedRoute = useCallback((path) => {
    return ["/billing", "/order-confirmation"].includes(path);
  }, []);

  // Main back button handler
  const handleBackButton = useCallback(
    (e) => {
      // Prevent duplicate handling
      if (isHandlingBack.current) return;
      isHandlingBack.current = true;

      const currentPath = location.pathname;
      const backRoute = getBackRoute(currentPath);

      // Home route - allow default behavior (exit app/close tab)
      if (currentPath === "/") {
        isHandlingBack.current = false;
        return;
      }

      // If we have a defined back route, intercept and navigate
      if (backRoute) {
        e.preventDefault();
        e.stopPropagation();
        
        // Push current state back to prevent immediate back action
        window.history.pushState(null, "", currentPath);
        
        // Navigate to custom back route
        navigate(backRoute, { replace: false });
        
        // Reset handling flag after navigation
        setTimeout(() => {
          isHandlingBack.current = false;
        }, 100);
      } else {
        // No custom route defined, allow default behavior
        isHandlingBack.current = false;
      }
    },
    [location.pathname, navigate, getBackRoute]
  );

  // Handle beforeunload for protected routes
  const handleBeforeUnload = useCallback(
    (e) => {
      // Warn user before leaving on critical pages
      if (isProtectedRoute(location.pathname) && !isOrderPlaced) {
        const message =
          "You have an order in progress. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    },
    [location.pathname, isProtectedRoute, isOrderPlaced]
  );

  // Main effect for back button handling
  useEffect(() => {
    const currentPath = location.pathname;

    // Push state to create history entry (except for home)
    if (currentPath !== "/") {
      window.history.pushState(null, "", currentPath);
    }

    // Add event listeners
    window.addEventListener("popstate", handleBackButton);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleBackButton);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      isHandlingBack.current = false;
    };
  }, [location.pathname, handleBackButton, handleBeforeUnload]);

  // Handle Android app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When user returns to app, ensure proper history state
      if (document.visibilityState === "visible" && location.pathname !== "/") {
        window.history.pushState(null, "", location.pathname);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  // Handle Android hardware back button double-tap to exit
  useEffect(() => {
    let backPressedOnce = false;
    let backPressTimer = null;

    const handleDoubleBackPress = () => {
      if (location.pathname === "/") {
        if (backPressedOnce) {
          // Second press - allow exit
          window.history.back();
          backPressedOnce = false;
        } else {
          // First press - show toast message
          backPressedOnce = true;
          
          // Optional: Show toast notification
          const toast = document.createElement("div");
          toast.textContent = "Press back again to exit";
          toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
          `;
          document.body.appendChild(toast);

          // Remove toast after 2 seconds
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove();
            }
          }, 2000);

          // Reset backPressedOnce after 2 seconds
          backPressTimer = setTimeout(() => {
            backPressedOnce = false;
          }, 2000);
        }
      }
    };

    // Listen for custom back event (if you dispatch it from popstate)
    window.addEventListener("custombackpress", handleDoubleBackPress);

    return () => {
      window.removeEventListener("custombackpress", handleDoubleBackPress);
      if (backPressTimer) clearTimeout(backPressTimer);
    };
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isHandlingBack.current = false;
    };
  }, []);

  return null;
};

export default BackButtonHandler;