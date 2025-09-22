import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

const VegetableSelection = () => {
  const { selectedOffer, selectedVegetables, setSelectedVegetables, navigate } = useOrderContext();
  const [vegetables, setVegetables] = useState([]);

  if (!selectedOffer) {
    navigate("/offers");
    return null;
  }

  // Handle toggle with limit
  const handleVegetableToggle = (vegetable) => {
    setSelectedVegetables((prev) =>
      prev.includes(vegetable)
        ? prev.filter((v) => v !== vegetable)
        : prev.length < selectedOffer.vegetableLimit
        ? [...prev, vegetable]
        : prev
    );
  };

  const handlePlaceOrder = () => {
    navigate("/order-confirmation");
  };

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await axios.get(`/api/offers/${selectedOffer._id}`);
        const data = response.data.data.vegetables || [];

        const mapped = data.map((v) => ({
          name: v.name,
          image: v.image,
        }));

        setVegetables(mapped);
      } catch (error) {
        console.error("Error fetching offer details:", error.message);
      }
    };

    if (selectedOffer?._id) {
      fetchOfferDetails();
    }
  }, [selectedOffer]);

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg text-center">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <button
          onClick={() => navigate("/offers")}
          className="amiko flex items-center text-[#0e540b] hover:text-green-700 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Offers
        </button>

        <div className="text-center">
          <h2 className="amiko text-xl sm:text-2xl md:text-3xl font-bold text-[#0e540b]">
            Select Your Vegetables
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mt-2">
            <span className="khula font-bold text-[#0e540b]">{selectedOffer.title}</span> - ₹{selectedOffer.price}
          </p>
          <p className="khula text-xs sm:text-sm text-gray-600">
            Select {selectedOffer.vegetableLimit} vegetables ({selectedVegetables.length}/
            {selectedOffer.vegetableLimit} selected)
          </p>
        </div>

        <div className="hidden sm:block w-20"></div>
      </div>

      {/* Vegetables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {vegetables.map((vegetable) => (
          <div
            key={vegetable.name}
            onClick={() => handleVegetableToggle(vegetable.name)}
            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition duration-200 text-center transform hover:scale-105 ${
              selectedVegetables.includes(vegetable.name)
                ? "bg-green-100 border-[#0e540b] text-green-700 shadow-lg"
                : "bg-white border-gray-300 hover:border-green-300 shadow-sm"
            }`}
          >
            <img
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover mx-auto rounded-2xl mb-2"
              src={vegetable.image}
              alt={vegetable.name}
            />
            <p className="font-medium text-xs sm:text-sm">{vegetable.name}</p>
            {selectedVegetables.includes(vegetable.name) && (
              <CheckCircle size={16} className="mx-auto mt-2 text-[#0e540b]" />
            )}
          </div>
        ))}
      </div>

      {/* Selected Vegetables Summary */}
      {selectedVegetables.length > 0 && (
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-6 border border-green-200">
          <h3 className="font-bold text-green-700 mb-2 text-sm sm:text-base">
            Selected Vegetables ({selectedVegetables.length}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedVegetables.map((veg, index) => (
              <span
                key={index}
                className="khula bg-green-200 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
              >
                {veg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Place Order Button */}
      <div className="text-center">
        <button
          onClick={handlePlaceOrder}
          disabled={selectedVegetables.length !== selectedOffer.vegetableLimit}
          className={`amiko w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition duration-200 ${
            selectedVegetables.length === selectedOffer.vegetableLimit
              ? "bg-[#0e540b] text-white hover:bg-[#0e540b] transform hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Place Order - ₹{selectedOffer.price}
        </button>
        {selectedVegetables.length !== selectedOffer.vegetableLimit && (
          <p className="khula text-xs sm:text-sm text-red-500 mt-2">
            Please select exactly {selectedOffer.vegetableLimit} vegetables to proceed
          </p>
        )}
      </div>
    </div>
  );
};

export default VegetableSelection;
