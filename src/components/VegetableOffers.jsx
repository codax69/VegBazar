import React, { useEffect, useState } from "react";
import { Package, Check, ShoppingCart, Leaf, Tag } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

const VegetableOffers = () => {
  const { setSelectedOffer, setVegetableOrder, setSelectedVegetables, navigate } =
    useOrderContext();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/baskets`
        );
        console.log("API Response:", response.data);
        // Access baskets from data.data.baskets based on API structure
        const basketsData = response.data.data?.baskets || response.data.baskets || [];
        setOffers(basketsData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };
    fetchOffers();
  }, [])

  // Track offer click
  const handleOfferClick = async (offer) => {
    try {
      // Increment click count on backend
      await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/baskets/click/${offer._id}`
      );
    } catch (error) {
      console.error("Error tracking offer click:", error);
      // Continue with navigation even if tracking fails
    }
  };
  useEffect(() => {
    setVegetableOrder([]);
    setSelectedVegetables([]);
  }, []);

  const handleOfferSelect = async (offer) => {
    window.scrollTo(0, 0);
    setSelectedOffer(offer);

    // Track the click asynchronously
    handleOfferClick(offer);

    navigate("/select-vegetables");
  };

  return (
    <div className="min-h-screen bg-[#ffffff] pt-14 px-3 sm:pt-28 sm:px-4 md:pt-28 lg:pt-30">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#0e540b] rounded-full mb-2 sm:mb-3">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg font-amiko sm:text-xl md:text-2xl font-bold text-[#0e540b] mb-1">
              Choose Your Basket
            </h2>
            <p className="text-gray-600 text-xs font-assistant sm:text-sm px-4">
              Select the best vegetable package that suits your needs
            </p>
          </div>
        </div>

        {/* Loading State */}
        {!offers || offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">Loading offers...</p>
          </div>
        ) : (
          <>
            {/* Offers Grid - Mobile First */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="group relative bg-[#f0fcf6] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#0e540b] active:scale-95 sm:hover:-translate-y-1 sm:hover:scale-[1.02] overflow-hidden flex flex-col"
                  onClick={() => handleOfferSelect(offer)}
                >
                  {/* Header with Icon */}
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 sm:p-4 text-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#0e540b] opacity-10 rounded-bl-full"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#f0fcf6] rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e540b]" />
                      </div>
                      <h3 className="text-base font-poppins sm:text-lg font-bold text-gray-800 mb-1">
                        {offer.title}
                      </h3>
                      <div className="flex font-assistant items-center justify-center gap-1 text-gray-600 text-xs">
                        <Leaf className="w-3 h-3" />
                        <span>
                          {offer.vegetables?.length || 0} vegetables
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    {/* Price */}
                    <div className="text-center mb-3 flex-shrink-0">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0e540b]" />
                        <span className="text-xs font-medium font-assistant text-gray-600">
                          Price
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-assistant font-bold text-[#0e540b]">
                        ₹{offer.price}
                      </p>
                    </div>

                    {/* Description */}
                    {offer.description && (
                      <p className="text-gray-900 font-assistant text-sm font-bold text-center mb-3 leading-relaxed flex-shrink-0 px-2">
                        {offer.description}
                      </p>
                    )}

                    {/* Vegetables List */}
                    {offer.vegetables && offer.vegetables.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 mb-3 border border-green-100 flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 font-assistant text-[#0e540b]" />
                          What's Included:
                        </p>
                        <ul className="space-y-1.5 font-assistant">
                          {offer.vegetables.slice(0, 3).map((veg, index) => (
                            <li
                              key={veg._id || index}
                              className="text-xs text-gray-700 flex items-center gap-1.5"
                            >
                              <div className="w-1 h-1 rounded-full bg-[#0e540b] flex-shrink-0"></div>
                              <span className="truncate font-assistant">
                                {veg.vegetable?.name || veg.name || 'Vegetable'}
                              </span>
                            </li>
                          ))}
                          {offer.vegetables.length > 3 && (
                            <li className="text-xs text-[#0e540b] font-medium flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full font-assistant bg-[#0e540b] flex-shrink-0"></div>
                              +{offer.vegetables.length - 3} more vegetables
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      aria-label={`Select ${offer.title} package`}
                      className="w-full font-assistant bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2.5 sm:py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 group-hover:scale-105 text-xs sm:text-sm mt-auto"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Select Package
                    </button>
                  </div>

                  {/* Popular Badge */}
                  {offer.popular && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      Popular
                    </div>
                  )}

                  {/* Click Count Badge (Optional - for analytics) */}
                  {offer.clickCount > 0 && (
                    <div className="absolute bottom-2 left-2 bg-gray-100 text-gray-700 text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                      {offer.clickCount} views
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="mt-4 sm:mt-6 text-center px-2">
              <div className="bg-[#f0fcf6] rounded-xl shadow-md p-3 sm:p-4 max-w-2xl mx-auto border border-green-100">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Leaf className="w-4 h-4 text-[#0e540b]" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                    Fresh
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  All packages include farm-fresh, organic vegetables delivered
                  directly to your doorstep. You can customize your selection in
                  the next step.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VegetableOffers;