import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ArrowLeft, CheckCircle, List, XCircle } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

// Memoized VegetableCard component with enhanced out-of-stock styling
const VegetableCard = memo(({ 
  vegetable, 
  isSelected, 
  isDisabled, 
  onToggle 
}) => {
  const isOutOfStock = vegetable.outOfStock || vegetable.stockKg === 0;
  
  return (
    <button
      onClick={() => !isDisabled && !isOutOfStock && onToggle(vegetable)}
      disabled={isDisabled || isOutOfStock}
      className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 touch-manipulation active:scale-95 relative ${
        isOutOfStock
          ? "bg-red-50 border-red-300 opacity-90 cursor-not-allowed"
          : isSelected
          ? "bg-green-100 border-[#0e540b] shadow-lg"
          : "bg-[#f0fcf6] border-gray-300 shadow-md hover:border-green-400"
      } ${isDisabled && !isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={`${isOutOfStock ? "Out of stock" : isSelected ? "Deselect" : "Select"} ${vegetable.name}`}
      aria-pressed={isSelected}
      aria-disabled={isOutOfStock}
    >
      <div className="text-center">
        <div className="relative">
          <img
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover mx-auto rounded-lg sm:rounded-xl mb-2 ${
              isOutOfStock ? "grayscale opacity-50" : ""
            }`}
            src={vegetable.image}
            alt={vegetable.name}
            loading="lazy"
            decoding="async"
          />
          {isSelected && !isOutOfStock && (
            <div className="absolute -top-1 -right-1 bg-[#0e540b] rounded-full p-1">
              <CheckCircle size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
          )}
          {isOutOfStock && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg sm:rounded-xl">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                  OUT OF STOCK
                </span>
              </div>
              <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5">
                <XCircle size={14} className="text-white" />
              </div>
            </>
          )}
        </div>
        <p className={`font-medium font-assistant text-sm sm:text-base leading-tight px-1 ${
          isOutOfStock ? "text-red-600 line-through" : "text-gray-800"
        }`}>
          {vegetable.name}
        </p>
        {isOutOfStock && (
          <p className="font-assistant text-[10px] sm:text-xs text-red-500 font-semibold mt-1">
            Unavailable
          </p>
        )}
      </div>
    </button>
  );
});
VegetableCard.displayName = 'VegetableCard';

// Memoized Action Section
const ActionSection = memo(({ 
  canProceed, 
  remainingCount, 
  selectedCount,
  onContinue 
}) => (
  <div className="hidden sm:block text-center space-y-2 sm:space-y-3">
    {canProceed ? (
      <button
        onClick={onContinue}
        className="font-assistant w-full px-6 sm:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-bold 
        text-sm sm:text-base md:text-lg transition-all duration-300 text-white transform hover:scale-105 active:scale-95
        bg-[#0e540b] hover:bg-gradient-to-r hover:from-[#0e540b] hover:to-[#063a06] shadow-lg hover:shadow-xl
        touch-manipulation min-h-[44px] sm:min-h-[48px]"
      >
        Continue to Checkout
      </button>
    ) : (
      <div className="space-y-2">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
          <p className="font-assistant text-xs sm:text-sm text-red-600 font-medium">
            Please select {remainingCount} more vegetable
            {remainingCount !== 1 ? "s" : ""} to proceed
          </p>
        </div>
        {selectedCount === 0 && (
          <p className="font-assistant text-xs sm:text-sm text-gray-500 px-2">
            👆 Tap on vegetables above to select them
          </p>
        )}
      </div>
    )}
  </div>
));

ActionSection.displayName = 'ActionSection';

// Memoized Mobile Bottom Bar
const MobileBottomBar = memo(({ 
  canProceed, 
  remainingCount, 
  selectedCount,
  onContinue 
}) => (
  <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#f0fcf6] border-t-2 border-gray-200 shadow-2xl z-50">
    <div className="px-4 py-3">
      {canProceed ? (
        <button
          onClick={onContinue}
          className="font-assistant w-full px-6 py-3.5 rounded-xl font-bold 
          text-base transition-all duration-300 text-white transform active:scale-95
          bg-[#0e540b] shadow-lg
          touch-manipulation min-h-[52px] flex items-center justify-center"
        >
          Continue to Checkout
        </button>
      ) : (
        <div className="space-y-2">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
            <p className="font-assistant text-sm text-red-600 font-medium text-center">
              Select {remainingCount} more vegetable{remainingCount !== 1 ? "s" : ""} to proceed
            </p>
          </div>
          {selectedCount === 0 && (
            <p className="font-assistant text-xs text-gray-500 text-center">
              Tap on vegetables above to select them
            </p>
          )}
        </div>
      )}
    </div>
  </div>
));

MobileBottomBar.displayName = 'MobileBottomBar';

const VegetableSelection = () => {
  const { selectedOffer, selectedVegetables, setSelectedVegetables, navigate } =
    useOrderContext();
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  // Memoize API URL
  const API_URL = useMemo(() => import.meta.env.VITE_API_SERVER_URL, []);
 console.log(selectedOffer)
 console.log(vegetables)
  // Get effective vegetable limit (treat 0 as 1)
  const effectiveLimit = useMemo(() => {
    const limit = selectedOffer?.vegetableLimit || 0;
    return limit === 0 ? 1 : limit;
  }, [selectedOffer?.vegetableLimit]);

  // Get the price for the offer's specified weight
  const getPriceForOfferWeight = useCallback((prices, marketPrices, offerWeight) => {
    if (!prices || !offerWeight) return null;
    
    const weightMap = {
      '1kg': 'weight1kg',
      '500g': 'weight500g',
      '250g': 'weight250g',
      '100g': 'weight100g',
    };

    const key = weightMap[offerWeight];
    if (!key || prices[key] === undefined) {
      const availableKey = Object.keys(weightMap).find(w => prices[weightMap[w]] !== undefined);
      if (availableKey) {
        return {
          weight: availableKey,
          price: prices[weightMap[availableKey]],
          marketPrice: marketPrices?.[weightMap[availableKey]] || prices[weightMap[availableKey]]
        };
      }
      return null;
    }

    return {
      weight: offerWeight,
      price: prices[key],
      marketPrice: marketPrices?.[key] || prices[key]
    };
  }, []);

  // Memoize selected vegetable IDs for faster lookups
  const selectedIds = useMemo(
    () => new Set(selectedVegetables.map(v => v._id)),
    [selectedVegetables]
  );

  const isSelected = useCallback(
    (vegetableId) => selectedIds.has(vegetableId),
    [selectedIds]
  );

  const handleVegetableToggle = useCallback(
    (vegetable) => {
      // Strict check: Don't allow selection if out of stock
      if (vegetable.outOfStock || vegetable.stockKg === 0) {
        console.log(`${vegetable.name} is out of stock and cannot be selected`);
        return;
      }

      setSelectedVegetables((prev) => {
        const alreadySelected = prev.some((v) => v._id === vegetable._id);

        if (alreadySelected) {
          return prev.filter((v) => v._id !== vegetable._id);
        } else if (prev.length < effectiveLimit) {
          return [
            ...prev,
            {
              name: vegetable.name,
              price: vegetable.priceForOffer.price,
              marketPrice: vegetable.priceForOffer.marketPrice,
              weight: vegetable.priceForOffer.weight,
              _id: vegetable._id,
              image: vegetable.image,
            },
          ];
        }
        return prev;
      });
    },
    [effectiveLimit, setSelectedVegetables]
  );

  const handleAllVegetables = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/all-vegetables");
  }, [navigate]);

  // Fetch vegetables with loading state
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!selectedOffer?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/offers/${selectedOffer._id}`
        );
        const data = response.data.data.vegetables || [];
        console.log({data})
        const offerWeight = selectedOffer?.weight || selectedOffer?.totalWeight || '500g';
        
        const processedVegetables = data
          .map(v => {
            const priceForOffer = getPriceForOfferWeight(v.prices, v.marketPrices, offerWeight,v.outOfStock,v.stockKg);
            return priceForOffer ? { ...v, priceForOffer } : null;
          })
          .filter(Boolean);
        console.log(processedVegetables)
        setVegetables(processedVegetables);
      } catch (error) {
        console.error("Error fetching offer details:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [selectedOffer, getPriceForOfferWeight, API_URL]);

  // Memoized calculations
  const canProceed = useMemo(
    () => selectedVegetables.length === effectiveLimit,
    [selectedVegetables.length, effectiveLimit]
  );

  const remainingCount = useMemo(
    () => effectiveLimit - selectedVegetables.length,
    [effectiveLimit, selectedVegetables.length]
  );

  const handleContinue = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/customer-info");
  }, [navigate]);

  const handleBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/offers");
  }, [navigate]);

  // Redirect if no offer selected
  useEffect(() => {
    if (!selectedOffer) {
      navigate("/offers");
    }
  }, [selectedOffer, navigate]);

  if (!selectedOffer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-5 pb-20 sm:pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-[#f0fcf6] rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-5 md:p-7">
          {/* Mobile-First Header */}
          <div className="mb-4 sm:mb-5">
            {/* Back Button and All Vegetables Button Row */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button
                onClick={handleBack}
                className="font-assistant flex items-center text-[#0e540b] hover:text-green-700 transition-colors text-sm sm:text-base touch-manipulation active:scale-95"
                aria-label="Back to Offers"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Offers
              </button>
              
              <button
                onClick={handleAllVegetables}
                className="font-assistant flex items-center gap-1.5 px-3 py-1.5 bg-[#0e540b] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors touch-manipulation active:scale-95"
                aria-label="View All Vegetables"
              >
                <List size={16} />
                <span className="hidden xs:inline">All Vegetables</span>
                <span className="xs:hidden">All</span>
              </button>
            </div>

            {/* Title Section */}
            <div className="text-center px-2">
              <h2 className="font-amiko text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#0e540b] leading-tight mb-2">
                Select Your Vegetables
              </h2>
              <p className="text-sm sm:text-base md:text-lg font-poppins text-gray-700 mb-1">
                <span className="font-bold text-[#0e540b]">
                  {selectedOffer.title}
                </span>{" "}
                - ₹{selectedOffer.price}
              </p>
              
              {selectedOffer.description && (
                <p className="text-xs sm:text-sm text-gray-600 font-assistant mb-2 px-2">
                  {selectedOffer.description}
                </p>
              )}

              <div className="inline-flex font-poppins items-center gap-2 bg-green-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="font-assistant text-xs sm:text-sm md:text-base font-semibold">
                  <span
                    className={canProceed ? "text-green-600" : "text-gray-700"}
                  >
                    {selectedVegetables.length}
                  </span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-700">
                    {effectiveLimit}
                  </span>
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">selected</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-200 border-t-green-600"></div>
            </div>
          ) : (
            <>
              {/* Vegetables Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                {vegetables.map((vegetable) => {
                  const selected = isSelected(vegetable._id);
                  const isOutOfStock = vegetable.outOfStock || vegetable.stockKg === 0;
                  const isDisabled = !selected && !isOutOfStock && selectedVegetables.length >= effectiveLimit;

                  return (
                    <VegetableCard
                      key={vegetable._id}
                      vegetable={vegetable}
                      isSelected={selected}
                      isDisabled={isDisabled}
                      onToggle={handleVegetableToggle}
                    />
                  );
                })}
              </div>

              {/* Desktop Action Section */}
              <ActionSection
                canProceed={canProceed}
                remainingCount={remainingCount} 
                selectedCount={selectedVegetables.length}
                onContinue={handleContinue}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        canProceed={canProceed}
        remainingCount={remainingCount}
        selectedCount={selectedVegetables.length}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default VegetableSelection;