import React from "react";
import { ArrowLeft, Package, Check, ShoppingCart, Leaf, Tag } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const VegetableOffers = () => {
  const { offers, setSelectedOffer, navigate } = useOrderContext();

  const handleOfferSelect = (offer) => {
    window.scrollTo(0, 0);
    setSelectedOffer(offer);
    navigate("/select-vegetables");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-6 sm:py-12 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <button
            onClick={() => {navigate("/"); window.scrollTo(0, 0);}}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0e540b] transition-colors group mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0e540b] rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0e540b] mb-2">
              Choose Your Package
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Select the best vegetable package that suits your needs
            </p>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#0e540b] transform hover:-translate-y-1 hover:scale-[1.02] overflow-hidden"
              onClick={() => handleOfferSelect(offer)}
            >
              {/* Header with Icon */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#0e540b] opacity-10 rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-8 h-8 text-[#0e540b]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {offer.title}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-gray-600 text-sm">
                    <Leaf className="w-4 h-4" />
                    <span>{offer.vegetables.length / 2 } vegetables</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-[#0e540b]" />
                    <span className="text-sm font-medium text-gray-600">Price</span>
                  </div>
                  <p className="text-4xl font-bold text-[#0e540b]">
                    ₹{offer.price}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-center mb-4 text-sm min-h-[40px]">
                  {offer.description}
                </p>

                {/* Vegetables List */}
                <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0e540b]" />
                    What's Included:
                  </p>
                  <ul className="space-y-2">
                    {offer.vegetables.slice(0, 3).map((veg, index) => (
                      <li 
                        key={veg._id || index}
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0e540b]"></div>
                        {veg.name}
                      </li>
                    ))}
                    {offer.vegetables.length > 3 && (
                      <li className="text-sm text-[#0e540b] font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0e540b]"></div>
                        +{offer.vegetables.length - 3} more vegetables
                      </li>
                    )}
                  </ul>
                </div>

                {/* Select Button */}
                <button
                  aria-label={`Select ${offer.title} package`}
                  className="w-full bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Select Package
                </button>
              </div>

              {/* Popular Badge */}
              {offer.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                  Popular
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-md p-6 max-w-2xl mx-auto border border-green-100">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-[#0e540b]" />
              <h3 className="text-lg font-semibold text-gray-800">
                Fresh & Organic
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              All packages include farm-fresh, organic vegetables delivered directly to your doorstep. 
              You can customize your selection in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VegetableOffers;
