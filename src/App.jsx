import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { OrderContext } from "./Context/OrderContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { UserAuthProvider } from "./Context/UserAuthContext";
import { CartProvider } from "./Context/CartContext";
import { BillProvider } from "./Context/BillContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Navbar from "./components/Navbar";
import BackButtonHandler from "./components/BackButtonHandler";
import AuthModal from "./components/AuthModal";
import ProgressIndicator from "./components/ProgressIndicator";

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
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
    >
      <Router>
        <ThemeProvider>
          <UserAuthProvider>
            <AppWithOrderContext />
          </UserAuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleReCaptchaProvider>
  );
};

// Separate component to provide OrderContext before CartProvider and BillProvider
const AppWithOrderContext = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Fetch offers with caching
  const fetchOffers = async () => {
    try {
      const cached = sessionStorage.getItem('offers');
      if (cached) {
        setOffers(JSON.parse(cached));
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER_URL}/api/offers`
      );
      const data = await response.json();
      setOffers(data.data.offers);
      sessionStorage.setItem('offers', JSON.stringify(data.data.offers));
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
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`
      );
      const data = await response.json();
      const vegetables = data.data.map((v) => ({
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

  return (
    <OrderContext.Provider value={contextValue}>
      <CartProvider>
        <BillProvider>
          <AppContent />
        </BillProvider>
      </CartProvider>
    </OrderContext.Provider>
  );
};

export default VegetableSellingApp;