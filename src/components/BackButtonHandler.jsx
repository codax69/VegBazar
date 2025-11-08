import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OrderContext } from "../Context/OrderContext";

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedOffer } = useContext(OrderContext);

  useEffect(() => {
    // Define the route flow for back navigation
    const getBackRoute = (currentPath) => {
      const routes = {
        "/billing": "/order-confirmation",
        "/order-confirmation": selectedOffer ? "/select-vegetables" : "/vegetables",
        "/select-vegetables": "/offers",
        "/offers": "/customer-info",
        "/customer-info": "/",
        "/vegetables": "/customer-info",
        "/veg-bag": "/vegetables",
      };
      return routes[currentPath];
    };

    // Handler for Android back button and browser back
    const handleBackButton = (e) => {
      const currentPath = location.pathname;
      const backRoute = getBackRoute(currentPath);

      // If we have a defined back route, intercept and navigate
      if (backRoute) {
        e.preventDefault();
        window.history.pushState(null, "", currentPath);
        navigate(backRoute);
      }
      // If at home ("/"), allow default behavior (exit app)
    };

    // For mobile: push state to create a history entry
    if (location.pathname !== "/") {
      window.history.pushState(null, "", location.pathname);
    }

    // Listen to popstate (fires on back button)
    window.addEventListener("popstate", handleBackButton);

    // Mobile-specific: Listen for beforeunload as fallback
    const handleBeforeUnload = (e) => {
      // Only trigger on certain routes where we want to confirm exit
      if (["/billing", "/order-confirmation"].includes(location.pathname)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location.pathname, navigate, selectedOffer]);

  // Mobile-specific: Handle Android hardware back button via visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User returned to app, ensure we have proper history
        if (location.pathname !== "/") {
          window.history.pushState(null, "", location.pathname);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  return null;
};

export default BackButtonHandler;