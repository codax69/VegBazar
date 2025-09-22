import React from "react";
import { ArrowLeft } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const VegetableOffers = () => {
  const { offers, setSelectedOffer, navigate } = useOrderContext();

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer);
    navigate("/select-vegetables");
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
        <button
          onClick={() => navigate("/")}
          className="amiko flex items-center text-[#0e540b] hover:text-green-700 mb-4 sm:mb-0"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h2 className="trirong text-2xl sm:text-3xl font-bold text-[#0e540b] text-center">
          Choose Your Vegetable Offer
        </h2>
        <div className="hidden sm:block"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border-2 hover:border-[#0e540b] transform hover:scale-105"
            onClick={() => handleOfferSelect(offer)}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🛒</div>
              <h3 className="amiko text-xl font-bold text-gray-800">
                {offer.title}
              </h3>
            </div>
            <p className="amiko text-3xl font-bold text-[#0e540b] text-center mb-2">
              ₹{offer.price}
            </p>
            <p className="khula text-gray-600 text-lg text-center mb-4">
              {offer.description}
            </p>
            <div className="space-y-1">
              <p className="khula text-sm font-medium text-gray-700">
                Includes:
              </p>
              <ul className="text-sm text-gray-600">
                {offer.vegetables.slice(0, 3).map((veg, index) => (
                  <li key={veg._id || index}>• {veg.name}</li>
                ))}
                {offer.vegetables.length > 3 && (
                  <li>• +{offer.vegetables.length - 3} more vegetables</li>
                )}
              </ul>
            </div>

            <button className="khula w-full mt-4 bg-[#0e540b] text-white py-2 px-4 rounded-md hover:bg-[#0e540b] transition duration-200">
              Select This Package
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VegetableOffers;
