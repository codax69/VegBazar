import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { OrderContext } from "./Context/OrderContext";
import { ThemeProvider } from "./Context/ThemeContext";
import CustomerInfo from "./components/CustomerInfo";
import VegetableOffers from "./components/VegetableOffers";
import VegetableSelection from "./components/VegetableSelection";
import OrderConfirmation from "./components/OrderConfirmation";
import ProgressIndicator from "./components/ProgressIndicator";
import Help from "./components/Help";
import BillingPage from "./components/BillingPage";
import CustomizedVegetableSelection from "./components/CustomizedVegetableSelection";
import VegetableCart from "./components/VegetableCart";
import HomePage from "./components/HomePage";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Navbar from "./components/Navbar";
import OrderTracking from "./components/OrderTracking";
import { Home, Tag, ShoppingBag, Phone, Menu, X } from "lucide-react";
import BackButtonHandler from "./components/BackButtonHandler";
import { CartProvider, useCart } from "./Context/CartContext";
import { BillProvider } from "./Context/BillContext";
import BillingSuccess from "./components/BillingSuccess";

const AppContent = () => {
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

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER_URL}/api/offers`
      );
      const data = await response.json();
      setOffers(data.data.offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Fetch vegetables
  const fetchVegetables = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`
      );
      const data = await response.json();
      setAllVegetables(
        data.data.map((v) => ({
          name: v.name,
          image: v.image,
        }))
      );
    } catch (error) {
      console.error("Error fetching vegetables:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchVegetables();
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
    <ThemeProvider>
      <OrderContext.Provider value={contextValue}>
        <BillProvider>
        <BackButtonHandler />
        <div className="min-h-screen bg-[#f0fcf6] flex flex-col">
          <Navbar />
          <div className="pt-16 flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {![
              "/",
              "/veg-bag",
              "/vegetables",
              "/track-your-order",
              "/help",
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
              <Route path="/help" element={<Help />} />
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
        </Router>
      </CartProvider>
    </GoogleReCaptchaProvider>
  );
};

export default VegetableSellingApp;
