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
import { CartProvider } from "./Context/CartContext";
import { BillProvider } from "./Context/BillContext";
import { AuthProvider, ProtectedRoute as AuthProtectedRoute, PublicRoute } from "./Context/AuthProvider";
import Navbar from "./components/Navbar";
import BackButtonHandler from "./components/BackButtonHandler";
import ProgressIndicator from "./components/ProgressIndicator";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import RestPassword from "./components/ResetPassword"
import ForgotPassword from "./components/ForgotPassword"
import PWAInstallBanner from "./components/PWAInstallBanner";

const API_URL = import.meta.env.VITE_API_SERVER_URL;

const HomePage = lazy(() => import("./components/HomePage"));
const CustomerInfo = lazy(() => import("./components/CustomerInfo"));
const VegetableOffers = lazy(() => import("./components/VegetableOffers"));
const VegetableSelection = lazy(() =>
  import("./components/VegetableSelection")
);
const OrderConfirmation = lazy(() => import("./components/OrderConfirmation"));
const Help = lazy(() => import("./components/Help"));
const BillingPage = lazy(() => import("./components/BillingPage"));
const CustomizedVegetableSelection = lazy(() =>
  import("./components/CustomizedVegetableSelection")
);
const VegetableCart = lazy(() => import("./components/VegetableCart"));
const OrderTracking = lazy(() => import("./components/OrderTracking"));
const BillingSuccess = lazy(() => import("./components/BillingSuccess"));
const OrderFailed = lazy(() => import("./components/OrderFailed"));

// Loading component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #4CAF50",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Separate component to provide OrderContext
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
    role: "user"
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [allVegetables, setAllVegetables] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [vegetableOrder, setVegetableOrder] = useState([]);
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
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
        // Token refresh is handled by AuthContext
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Fetch offers with caching
  const fetchOffers = async () => {
    try {
      const cached = sessionStorage.getItem("offers");
      if (cached) {
        setOffers(JSON.parse(cached));
        return;
      }

      const response = await axios.get(`${API_URL}/api/offers`);
      setOffers(response.data?.data.offers);
      console.log(offers)
      sessionStorage.setItem(
        "offers",
        JSON.stringify(response.data?.data.offers)
      );
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Fetch vegetables with caching
  const fetchVegetables = async () => {
    try {
      const cached = sessionStorage.getItem("vegetables");
      if (cached) {
        setAllVegetables(JSON.parse(cached));
        return;
      }

      const response = await axios.get(`${API_URL}/api/vegetables`);
      const vegetables = response.data?.data.map((v) => ({
        name: v.name,
        image: v.image,
      }));
      console.log(vegetables);
      setAllVegetables(vegetables);
      sessionStorage.setItem("vegetables", JSON.stringify(vegetables));
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

  const hideProgressRoutes = [
    "/",
    "/cart",
    "/vegetables",
    "/customized-vegetables",
    "/orders",
    "/support",
    "/cart",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:token",
    "/address",
    "/confirmation",
    "/order-failed",
  ];

  return (
    <OrderContext.Provider value={contextValue}>
      <CartProvider>
        <BillProvider>
          <BackButtonHandler />
          <div className="min-h-screen bg-[#ffffff] flex flex-col">
            <PWAInstallBanner/>
            <Navbar />
            <div className="pt-10 flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2">
              {!hideProgressRoutes.includes(location.pathname) && (
                <ProgressIndicator />
              )}

              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes - Redirect to dashboard if logged in */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute redirectTo="/">
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute redirectTo="/">
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Public Routes - No Auth Required */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/offers" element={<VegetableOffers />} />
                  <Route
                    path="/vegetables"
                    element={<CustomizedVegetableSelection />}
                  />
                  <Route path="/support" element={<Help />} />
                  <Route
                    path="/select-vegetables"
                    element={<VegetableSelection />}
                  />
                  <Route path="/reset-password/:token" element={<RestPassword/>} />
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                  {/* Protected Routes - Auth Required */}
                  <Route
                    path="/address"
                    element={

                      <CustomerInfo />

                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <BillingPage />
                      </AuthProtectedRoute>
                    }
                  />
                  <Route
                    path="/confirmation"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <OrderConfirmation />
                      </AuthProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <BillingSuccess />
                      </AuthProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <OrderTracking />
                      </AuthProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <VegetableCart />
                      </AuthProtectedRoute>
                    }
                  /> <Route
                    path="/order-failed"
                    element={
                      <AuthProtectedRoute redirectTo="/login">
                        <OrderFailed />
                      </AuthProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </div>
        </BillProvider>
      </CartProvider>
    </OrderContext.Provider>
  );
};

// Main App wrapper with all providers
const VegetableSellingApp = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppWithOrderContext />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default VegetableSellingApp;