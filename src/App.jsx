import React, { useState, useEffect } from "react";
import { OrderContext } from "./Context/OrderContext";
import CustomerInfo from "./components/CustomerInfo";
import VegetableOffers from "./components/VegetableOffers";
import VegetableSelection from "./components/VegetableSelection";
import OrderConfirmation from "./components/OrderConfirmation";
import ProgressIndicator from "./components/ProgressIndicator";
import Help from "./components/Help";
import BillingPage from "./components/BillingPage";
import BackButtonHandler from "./components/BackButtonHandler";

const VegetableSellingApp = () => {
  const [currentRoute, setCurrentRoute] = useState("/");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mobile: "",
    email: "",
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [allVegetables, setAllVegetables] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  // Fetch offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER_URL}/api/offers`);
      const data = await response.json();
      setOffers(data.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  // Fetch vegetables
  const fetchVegetables = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`);
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

  const navigate = (path) => setCurrentRoute(path);

  const resetOrder = () => {
    setCurrentRoute("/");
    setFormData({ name: "", address: "", mobile: "", email: "" });
    setSelectedOffer(null);
    setSelectedVegetables([]);
  };

  const contextValue = {
    currentRoute,
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
    setPaymentMethod
  };

  return (
    <OrderContext.Provider value={contextValue}>
      <BackButtonHandler/>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-green-100">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <h1 className="trirong text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-4 sm:mb-8 text-[#0e540b]">
            VegBazar
          </h1>
          <ProgressIndicator />

          {/* Conditional rendering instead of Router */}
          {currentRoute === "/" && <CustomerInfo />}
          {/* {currentRoute === "/" && <OfferVegetables />} */}
          {currentRoute === "/offers" && <VegetableOffers />}
          {currentRoute === "/select-vegetables" && <VegetableSelection />}
          {currentRoute === "/order-confirmation" && <OrderConfirmation />}
          {currentRoute === "/billing" && <BillingPage />}
        </div>
        
        <Help />
      </div>
    </OrderContext.Provider>
  );
};

export default VegetableSellingApp;
