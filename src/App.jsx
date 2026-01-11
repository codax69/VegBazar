import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { OrderContext } from "./Context/OrderContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { UserAuthProvider, useUserAuth } from "./Context/UserAuthContext";
import { CartProvider } from "./Context/CartContext";
import { BillProvider } from "./Context/BillContext";
import Navbar from "./components/Navbar";
import BackButtonHandler from "./components/BackButtonHandler";
import AuthModal from "./components/AuthModal";
import ProgressIndicator from "./components/ProgressIndicator";

const API_URL = import.meta.env.VITE_API_SERVER_URL;

// Lazy load components for better performance
const HomePage = lazy(() => import("./components/HomePage"));
const CustomerInfo = lazy(() => import("./components/CustomerInfo"));
const VegetableOffers = lazy(() => import("./components/VegetableOffers"));
const VegetableSelection = lazy(() => import("./components/VegetableSelection"));
const OrderConfirmation = lazy(() => import("./components/OrderConfirmation"));
const Help = lazy(() => import("./components/Help"));
const BillingPage = lazy(() => import("./components/BillingPage"));
const CustomizedVegetableSelection = lazy(() => import("./components/CustomizedVegetableSelection"));
const VegetableCart = lazy(() => import("./components/VegetableCart"));
const OrderTracking = lazy(() => import("./components/OrderTracking"));
const BillingSuccess = lazy(() => import("./components/BillingSuccess"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const AppContent = () => {
  const location = useLocation();

  const hideProgressRoutes = [
    "/",
    "/veg-bag",
    "/vegetables",
    "/customized-vegetables",
    "/track-your-order",
    "/support",
    "/cart",
  ];

  return (
    <>
      <BackButtonHandler />
      <Navbar />
      {!hideProgressRoutes.includes(location.pathname) && <ProgressIndicator />}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes - No Auth Required */}
          <Route path="/" element={<HomePage />} />
          <Route path="/offers" element={<VegetableOffers />} />
          <Route path="/vegetables" element={<VegetableSelection />} />
          <Route path="/support" element={<Help />} />
          <Route
            path="/customized-vegetables"
            element={<CustomizedVegetableSelection />}
          />

          {/* Protected Routes - Auth Required */}
          <Route
            path="/address"
            element={
              <ProtectedRoute>
                <CustomerInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing-success"
            element={
              <ProtectedRoute>
                <BillingSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track-your-order"
            element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <VegetableCart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      <AuthModal />
    </>
  );
};

// Main App wrapper with all providers
const VegetableSellingApp = () => {
  return (
    <Router>
      <ThemeProvider>
        <UserAuthProvider>
          <AppWithOrderContext />
        </UserAuthProvider>
      </ThemeProvider>
    </Router>
  );
};

// Separate component to provide OrderContext before CartProvider and BillProvider
const AppWithOrderContext = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useUserAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    area: "",
    mobile: "",
    email: "",
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [allVegetables, setAllVegetables] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [vegetableOrder, setVegetableOrder] = useState([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Validate Google OAuth2 token expiry
  const isTokenExpired = (token) => {
    try {
      // Decode JWT token (assuming it's a JWT from Google OAuth)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // If we can't decode, assume it's expired
    }
  };

  // Handle token expiry - only logout if token is actually expired
  const handleTokenExpiry = () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      logout();
      navigate("/");
      return;
    }

    // Check if token is actually expired
    if (isTokenExpired(token)) {
      console.log("Token expired. Logging out...");
      logout();
      navigate("/");
    }
  };

  // Setup axios interceptor for token management
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          // Check token expiry before making request
          if (isTokenExpired(token)) {
            handleTokenExpiry();
            return Promise.reject(new Error("Token expired"));
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only logout on 401/403 if token is actually expired
        if (error.response?.status === 401 || error.response?.status === 403) {
          const token = localStorage.getItem("authToken");
          if (token && isTokenExpired(token)) {
            handleTokenExpiry();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Fetch user profile on mount if token exists and is valid
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setIsAuthChecking(false);
        return;
      }

      // Check if token is expired before making API call
      if (isTokenExpired(token)) {
        console.log("Token expired on mount. Logging out...");
        handleTokenExpiry();
        setIsAuthChecking(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.data.user);
          
          // Optionally populate form data with user info
          if (response.data.data.user) {
            setFormData((prev) => ({
              ...prev,
              name: response.data.data.user.name || prev.name,
              mobile: response.data.data.user.mobile || prev.mobile,
              email: response.data.data.user.email || prev.email,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        
        // Only logout if token is expired
        if (error.response?.status === 401 || error.response?.status === 403) {
          const token = localStorage.getItem("authToken");
          if (token && isTokenExpired(token)) {
            handleTokenExpiry();
          }
        }
      } finally {
        setIsAuthChecking(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Periodic token validation - checks every 1 minute and only logs out if expired
  useEffect(() => {
    const validateTokenExpiry = () => {
      const token = localStorage.getItem("authToken");
      
      if (!token || !user) return;

      // Check token expiry
      if (isTokenExpired(token)) {
        console.log("Token expired during periodic check. Logging out...");
        handleTokenExpiry();
      }
    };

    // Validate immediately and then every minute
    validateTokenExpiry();
    const interval = setInterval(validateTokenExpiry, 60 * 1000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [user]);

  // Fetch offers with caching
  const fetchOffers = async () => {
    try {
      const cached = sessionStorage.getItem('offers');
      if (cached) {
        setOffers(JSON.parse(cached));
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/offers`);
      setOffers(response.data.data.offers);
      sessionStorage.setItem('offers', JSON.stringify(response.data.data.offers));
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Fetch vegetables with caching
  const fetchVegetables = async () => {
    try {
      const cached = sessionStorage.getItem('vegetables');
      if (cached) {
        setAllVegetables(JSON.parse(cached));
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/vegetables`);
      const vegetables = response.data.data.map((v) => ({
        name: v.name,
        image: v.image,
      }));
      setAllVegetables(vegetables);
      sessionStorage.setItem('vegetables', JSON.stringify(vegetables));
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchVegetables();
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOffline = () => {
      window.location.href = "/offline.html";
    };

    const handleOnline = () => {
      // Optionally handle online state
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial online status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const resetOrder = () => {
    navigate("/");
    setFormData({
      name: "",
      address: "",
      city: "",
      area: "",
      mobile: "",
      email: "",
    });
    setSelectedOffer(null);
    setSelectedVegetables([]);
    setIsOrderPlaced(false);
    setPaymentMethod("");
  };

  const contextValue = {
    currentRoute: location.pathname,
    formData,
    setFormData,
    selectedOffer,
    setSelectedOffer,
    selectedVegetables,
    setSelectedVegetables,
    offers,
    allVegetables,
    navigate,
    resetOrder,
    isOrderPlaced,
    setIsOrderPlaced,
    paymentMethod,
    setPaymentMethod,
    setVegetableOrder,
    vegetableOrder,
  };

  // Show loading while checking authentication
  if (isAuthChecking) {
    return <LoadingSpinner />;
  }

  return (
    <OrderContext.Provider value={contextValue}>
      <CartProvider>
        <BillProvider>
        <BackButtonHandler />
        <div className="min-h-screen bg-[#ffffff] flex flex-col">
          <Navbar />
          <div className="pt-16 flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {![
              "/",
              "/veg-bag",
              "/vegetables",
              "/track-your-order",
              "/support",
              ...(selectedOffer === null ? ["/customer-info"] : []),
            ].includes(location.pathname) && <ProgressIndicator />}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/customer-info" element={<CustomerInfo />} />
              <Route path="/offers" element={<VegetableOffers />} />
              <Route
                path="/vegetables"
                element={<CustomizedVegetableSelection />}
              />
              <Route
                path="/select-vegetables"
                element={<VegetableSelection />}
              />
              <Route path="/billing" element={<BillingPage />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="/veg-bag" element={<VegetableCart />} />
              <Route path="/track-your-order" element={<OrderTracking />} />
              <Route path="/support" element={<Help />} />
              <Route path="/order-success" element={<BillingSuccess />} />
            </Routes>
          </div>
        </div>
        </BillProvider>
      </OrderContext.Provider>
    </ThemeProvider>
  );
};

// Wrap with Router and Google ReCaptcha
const VegetableSellingApp = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY}
      scriptProps={{ async: false, defer: false, appendTo: "head" }}
    >
      <CartProvider>
        <Router>
          <AppContent />
        </BillProvider>
      </CartProvider>
    </OrderContext.Provider>
  );
};

export default VegetableSellingApp;
