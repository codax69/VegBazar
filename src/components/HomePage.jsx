import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  ShoppingBag,
  Package,
  Leaf,
  Star,
  ChevronRight,
  Clock,
  ArrowRight,
  Check,
  ShoppingCart,
  Tag,
  Plus,
  Minus,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import Veggies from "../assets/veggies.svg";
import Store from "../assets/Fruit-Store.svg";
import axios from "axios";
import { GiBasket } from "react-icons/gi";
import VegBazarBanner from "./VegBazarBanner";
import TestimonialsCarousel from "./TestimonialsCarousel";

// Updated VegetableCard component supporting both weight and set pricing
const hasEnoughStock = (veg, option, isSetModel) => {
  if (isSetModel) {
    const setIndex = parseInt(option.replace("set", ""));
    const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
    const selectedSet = sets[setIndex];

    if (!selectedSet) return false;

    const stockPieces = veg.stockPieces || 0;
    const requiredPieces = selectedSet.quantity || 1;

    return stockPieces >= requiredPieces;
  } else {
    const stockKg = veg.stockKg || 0;

    // Convert weight string to kg
    let requiredKg = 0;
    if (option === "1kg") requiredKg = 1;
    else if (option === "500g") requiredKg = 0.5;
    else if (option === "250g") requiredKg = 0.25;

    return stockKg >= requiredKg;
  }
};

const VegetableCard = memo(
  ({
    veg,
    onAddToCart,
    onRemoveFromCart,
    selectedWeight,
    onWeightChange,
    selectedSet,
    onSetChange,
    quantity,
  }) => {
    // Determine pricing model
    const isSetModel =
      veg.pricingType === "set" ||
      veg.setPricing?.enabled === true ||
      veg.setPricingEnabled === true;

    // Check if completely out of stock
    const isCompletelyOutOfStock =
      veg.outOfStock ||
      (isSetModel
        ? veg.stockPieces === 0 || veg.stockPieces == null
        : veg.stockKg === 0 || veg.stockKg == null);

    // Get available options based on model and stock
    const availableOptions = useMemo(() => {
      if (isSetModel) {
        const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
        return sets.map((set, idx) => {
          const optionValue = `set${idx}`;
          const inStock = hasEnoughStock(veg, optionValue, true);

          return {
            id: idx,
            label: set.label || `${set.quantity} ${set.unit}`,
            value: optionValue,
            price: set.price,
            marketPrice: set.marketPrice || set.price,
            inStock,
            pieces: set.quantity || 1,
          };
        });
      } else {
        if (!veg.prices || typeof veg.prices !== "object") {
          return [
            {
              id: 0,
              label: "250g",
              value: "250g",
              price: 0,
              marketPrice: 0,
              inStock: hasEnoughStock(veg, "250g", false),
              kg: 0.25,
            },
          ];
        }

        const weights = [];
        if (veg.prices.weight1kg > 0) {
          weights.push({
            id: 0,
            label: "1kg",
            value: "1kg",
            price: veg.prices.weight1kg,
            marketPrice: veg.marketPrices?.weight1kg || veg.prices.weight1kg,
            inStock: hasEnoughStock(veg, "1kg", false),
            kg: 1,
          });
        }
        if (veg.prices.weight500g > 0) {
          weights.push({
            id: 1,
            label: "500g",
            value: "500g",
            price: veg.prices.weight500g,
            marketPrice: veg.marketPrices?.weight500g || veg.prices.weight500g,
            inStock: hasEnoughStock(veg, "500g", false),
            kg: 0.5,
          });
        }
        if (veg.prices.weight250g > 0) {
          weights.push({
            id: 2,
            label: "250g",
            value: "250g",
            price: veg.prices.weight250g,
            marketPrice: veg.marketPrices?.weight250g || veg.prices.weight250g,
            inStock: hasEnoughStock(veg, "250g", false),
            kg: 0.25,
          });
        }

        return weights.length > 0
          ? weights
          : [
              {
                id: 0,
                label: "250g",
                value: "250g",
                price: veg.price || 0,
                marketPrice: veg.price || 0,
                inStock: hasEnoughStock(veg, "250g", false),
                kg: 0.25,
              },
            ];
      }
    }, [veg, isSetModel]);

    const currentOption = isSetModel ? selectedSet : selectedWeight;
    const selectedOptionData =
      availableOptions.find((opt) => opt.value === currentOption) ||
      availableOptions[0];

    // Check if current selection is out of stock
    const isCurrentOptionOutOfStock = !selectedOptionData?.inStock;

    const { actualPrice, marketPrice, savings } = useMemo(() => {
      const actual = selectedOptionData?.price || 0;
      const market = selectedOptionData?.marketPrice || actual;
      return {
        actualPrice: actual,
        marketPrice: market,
        savings: market - actual,
      };
    }, [selectedOptionData]);

    // Get stock warning message
    const stockWarning = useMemo(() => {
      if (isCompletelyOutOfStock || !isCurrentOptionOutOfStock) return null;

      const availableOptions = availableOptions.filter((opt) => opt.inStock);

      if (availableOptions.length === 0) return null;

      if (isSetModel) {
        const stockPieces = veg.stockPieces || 0;
        return {
          message: `Only ${stockPieces} piece${
            stockPieces !== 1 ? "s" : ""
          } left`,
          alternatives: availableOptions.map((opt) => opt.label).join(", "),
        };
      } else {
        const stockKg = veg.stockKg || 0;
        return {
          message: `Only ${stockKg}kg available`,
          alternatives: availableOptions.map((opt) => opt.label).join(", "),
        };
      }
    }, [
      veg,
      isSetModel,
      isCurrentOptionOutOfStock,
      isCompletelyOutOfStock,
      availableOptions,
    ]);

    return (
      <div
        className={`w-full p-2 md:p-4 rounded-lg sm:rounded-xl border-2 shadow-md transition-all duration-200 relative ${
          isCompletelyOutOfStock
            ? "bg-gray-100 border-gray-300 opacity-75"
            : "bg-[#ffffff] border-gray-300 hover:border-[#0e540b] hover:shadow-xl"
        }`}
      >
        {/* Vegetable Image */}
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-1.5 sm:mb-2">
            {veg.image ? (
              <img
                className={`w-full h-full object-cover rounded-lg sm:rounded-xl ${
                  isCompletelyOutOfStock ? "grayscale" : ""
                }`}
                src={veg.image}
                alt={veg.name}
                loading="lazy"
                decoding="async"
                width="100"
                height="100"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br rounded-lg sm:rounded-xl flex items-center justify-center ${
                  isCompletelyOutOfStock
                    ? "from-gray-200 to-gray-300"
                    : "from-gray-50 to-[#ffffff]"
                }`}
              >
                <Leaf
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    isCompletelyOutOfStock
                      ? "text-gray-400"
                      : "text-[#0e540b]/30"
                  }`}
                />
              </div>
            )}
            {isCompletelyOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg sm:rounded-xl">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
          <p
            className={`font-medium text-xs sm:text-sm leading-tight mb-1.5 sm:mb-2 px-1 ${
              isCompletelyOutOfStock ? "text-gray-500" : ""
            }`}
          >
            {veg.name}
            {isSetModel && (
              <span className="ml-1 text-[10px] text-purple-600">📦</span>
            )}
          </p>
        </div>

        {/* Stock Warning Banner */}
        {stockWarning && (
          <div className="mb-2 px-2 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-[10px] sm:text-[11px] text-orange-700 font-medium text-center">
              ⚠️ {stockWarning.message}
            </p>
            <p className="text-[9px] sm:text-[10px] text-orange-600 text-center mt-0.5">
              Try: {stockWarning.alternatives}
            </p>
          </div>
        )}

        {/* Weight/Set Selection */}
        {!isCompletelyOutOfStock && availableOptions.length > 1 && (
          <div className="flex gap-2 mb-3 justify-center flex-wrap">
            {availableOptions.map((option) => {
              const isActive = currentOption === option.value;
              const disabled = !option.inStock;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.inStock) {
                      isSetModel
                        ? onSetChange(veg._id, option.value)
                        : onWeightChange(veg._id, option.value);
                    }
                  }}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-300 relative
            ${
              disabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60 line-through"
                : isActive
                ? "bg-[#0e540b] text-white shadow-md scale-[1.02]"
                : "bg-[#ffffff] text-gray-700 hover:bg-[#e8f2e8] hover:text-[#0e540b] shadow-sm"
            }`}
                >
                  {option.label}
                  {disabled && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Price Display */}
        {!isCompletelyOutOfStock && !isCurrentOptionOutOfStock && (
          <div className="mt-1 sm:mt-2 text-center mb-2">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <p className="text-[#0e540b] font-bold text-sm sm:text-base">
                ₹{actualPrice.toFixed(2)}
              </p>
              {marketPrice > actualPrice && (
                <p className="text-gray-400 line-through text-[10px] sm:text-xs">
                  ₹{marketPrice.toFixed(2)}
                </p>
              )}
            </div>
            <p className="text-[11px] sm:text-[11px] text-gray-500">
              per {selectedOptionData?.label}
            </p>
            {savings > 0 && (
              <p className="text-[9px] sm:text-[10px] text-green-600 font-semibold mt-0.5">
                Save ₹{savings.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Add to Cart Button or Quantity Controls */}
        {isCompletelyOutOfStock ? (
          <div className="w-full bg-gray-300 text-gray-600 font-semibold py-2 px-3 rounded-lg text-xs sm:text-sm text-center cursor-not-allowed">
            Unavailable
          </div>
        ) : isCurrentOptionOutOfStock ? (
          <div className="w-full bg-orange-100 text-orange-700 font-semibold py-2 px-3 rounded-lg text-xs sm:text-sm text-center cursor-not-allowed">
            Out of Stock
          </div>
        ) : quantity === 0 ? (
          <button
            onClick={() => onAddToCart(veg)}
            className="w-full bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            aria-label={`Add ${veg.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#0e540b] rounded-lg px-2 py-1.5">
            <button
              onClick={() => onRemoveFromCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-[#ffffff] rounded-md hover:bg-gray-100 transition"
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="text-[#0e540b]" />
            </button>
            <span className="font-bold text-white text-sm px-2">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-[#ffffff] rounded-md hover:bg-gray-100 transition"
              aria-label="Increase quantity"
            >
              <Plus size={14} className="text-[#0e540b]" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Memoized OfferCard component
const OfferCard = memo(({ offer, onNavigate }) => {
  return (
    <div
      onClick={onNavigate}
      className="group relative bg-[#ffffff] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#0e540b] active:scale-95 sm:hover:-translate-y-1 sm:hover:scale-[1.02] overflow-hidden flex flex-col"
    >
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 sm:p-4 text-center relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#0e540b] opacity-10 rounded-bl-full"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#ffffff] rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e540b]" />
          </div>
          <h3 className="text-base font-poppins sm:text-lg font-bold text-gray-800 mb-1">
            {offer.title}
          </h3>
          <div className="flex font-assistant items-center justify-center gap-1 text-gray-600 text-xs">
            <Leaf className="w-3 h-3" />
            {/* <span>{offer.vegetables?.length / 2 || 0} vegetables</span> */}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
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

        {offer.description && (
          <p className="text-gray-900 font-assistant text-sm font-bold text-center mb-3 leading-relaxed flex-shrink-0 px-2">
            {offer.description}
          </p>
        )}

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
                  <span className="truncate font-assistant">{veg.name}</span>
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

        <button
          aria-label={`Select ${offer.title} package`}
          className="w-full font-assistant bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2.5 sm:py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 group-hover:scale-105 text-xs sm:text-sm mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Select
        </button>
      </div>

      {offer.popular && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
          Popular
        </div>
      )}
    </div>
  );
});

OfferCard.displayName = "OfferCard";

const Homepage = () => {
  const [vegetables, setVegetables] = useState([]);
  const [topOffers, setTopOffers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vegLoading, setVegLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});
  const [selectedSets, setSelectedSets] = useState({});
  const { setVegetableOrder, navigate } = useOrderContext();
  const [topSellingVegetables, setTopSellingVegetables] = useState([]);
  const [suggestedVegetables, setSuggestedVegetables] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [veggiesRes, offersRes, testimonialsRes] = await Promise.all([
          axios
            .get(
              `${import.meta.env.VITE_API_SERVER_URL}/api/vegetables/home/veg`
            )
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(
              `${
                import.meta.env.VITE_API_SERVER_URL
              }/api/offers/Top-offers/suggestion`
            )
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(
              `${
                import.meta.env.VITE_API_SERVER_URL
              }/api/testimonials/published`
            )
            .catch(() => ({ data: { data: { testimonials: [] } } })),
        ]);

        const allVegetables = veggiesRes.data?.data || [];
        setVegetables(allVegetables);
        setTopSellingVegetables(allVegetables.slice(0, 10));
        setSuggestedVegetables(allVegetables.slice(10, 16));
        setTopOffers(offersRes.data?.data || []);

        const apiData = testimonialsRes.data?.data?.testimonials || [];
        if (Array.isArray(apiData) && apiData.length > 0) {
          const formatted = apiData.map((t) => ({
            name: t.name || "Anonymous",
            comment: t.comment || "Great service!",
            rating: t.rating || 5,
            initial: t.name ? t.name.charAt(0).toUpperCase() : "A",
          }));
          setTestimonials(formatted);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setVegLoading(false);
        setLoading(false);
        setTestimonialsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getPriceForOption = useCallback((veg, option) => {
    const isSetModel =
      veg.pricingType === "set" ||
      veg.setPricing?.enabled ||
      veg.setPricingEnabled;

    if (isSetModel) {
      const setIndex = parseInt(option.replace("set", ""));
      const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
      return sets[setIndex]?.price || 0;
    } else {
      const weightKey = `weight${option}`;
      return veg.prices?.[weightKey] || veg.price || 0;
    }
  }, []);

  const getMarketPriceForOption = useCallback((veg, option) => {
    const isSetModel =
      veg.pricingType === "set" ||
      veg.setPricing?.enabled ||
      veg.setPricingEnabled;

    if (isSetModel) {
      const setIndex = parseInt(option.replace("set", ""));
      const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
      return sets[setIndex]?.marketPrice || sets[setIndex]?.price || 0;
    } else {
      const weightKey = `weight${option}`;
      return (
        veg.marketPrices?.[weightKey] || veg.originalPrice || veg.price || 0
      );
    }
  }, []);

  const getSelectedOption = useCallback(
    (veg) => {
      const isSetModel =
        veg.pricingType === "set" ||
        veg.setPricing?.enabled ||
        veg.setPricingEnabled;

      if (isSetModel) {
        return selectedSets[veg._id] || "set0";
      } else {
        return selectedWeights[veg._id] || "250g";
      }
    },
    [selectedWeights, selectedSets]
  );

  const setSelectedWeight = useCallback((vegId, weight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [vegId]: weight,
    }));
  }, []);

  const setSelectedSet = useCallback((vegId, set) => {
    setSelectedSets((prev) => ({
      ...prev,
      [vegId]: set,
    }));
  }, []);

  const calculatePrices = useCallback(async (cartData) => {
    try {
      const normalizedItems = cartData.items.map((item) => ({
        vegetableId: item.vegetableId || item.id,
        weight: item.weight,
        quantity: item.quantity,
      }));


      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/calculate-price`,
        { items: normalizedItems }
      );

      const updatedPrices = response.data.data;

      cartData.items = cartData.items.map((item) => {
        const calculatedItem = updatedPrices.items.find(
          (i) =>
            i.vegetableId === (item.id || item.vegetableId) &&
            i.weight === item.weight
        );
        if (calculatedItem) {
          return {
            ...item,
            pricePerUnit: calculatedItem.pricePerUnit || item.pricePerUnit || 0,
            totalPrice:
              calculatedItem.totalPrice ||
              calculatedItem.pricePerUnit * item.quantity ||
              0,
          };
        }
        return item;
      });

      cartData.summary = updatedPrices.summary || {};
      cartData.timestamp = updatedPrices.timestamp || new Date().toISOString();

      return cartData;
    } catch (error) {
      console.error("❌ Error calculating prices:", error);
      return cartData;
    }
  }, []);

  const handleAddToCart = useCallback(
    async (veg) => {
      const option = getSelectedOption(veg);
      const cartKey = `${veg._id}-${option}`;
      const currentQty = cartItems[cartKey] || 0;
      const newQty = currentQty + 1;

    

      setCartItems((prev) => ({
        ...prev,
        [cartKey]: newQty,
      }));

      const savedCart = localStorage.getItem("orderSummary");
      let cartData = savedCart ? JSON.parse(savedCart) : { items: [] };


      const existingItemIndex = cartData.items.findIndex(
        (item) =>
          (item.id || item.vegetableId) === veg._id && item.weight === option
      );

      const priceForOption = getPriceForOption(veg, option);
      const marketPriceForOption = getMarketPriceForOption(veg, option);

      // ✅ Get the correct label for the selected option
      const isSetModel =
        veg.pricingType === "set" ||
        veg.setPricing?.enabled ||
        veg.setPricingEnabled;
      let optionLabel = option;

      if (isSetModel) {
        const setIndex = parseInt(option.replace("set", ""));
        const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
        optionLabel = sets[setIndex]?.label || option;
      }

      

      if (existingItemIndex >= 0) {
        cartData.items[existingItemIndex].quantity = newQty;
        cartData.items[existingItemIndex].pricePerUnit = priceForOption;
        cartData.items[existingItemIndex].price = priceForOption;
        cartData.items[existingItemIndex].marketPrice = marketPriceForOption;
        cartData.items[existingItemIndex].weight = option;
        cartData.items[existingItemIndex].weightLabel = optionLabel;
      } else {
        cartData.items.push({
          id: veg._id,
          vegetableId: veg._id,
          name: veg.name,
          image: veg.image || "/placeholder-vegetable.jpg",
          weight: option,
          weightLabel: optionLabel,
          quantity: 1,
          pricePerUnit: priceForOption,
          price: priceForOption,
          marketPrice: marketPriceForOption,
          totalPrice: priceForOption,
          isSetModel,
        });
      }

      cartData = await calculatePrices(cartData);
      localStorage.setItem("orderSummary", JSON.stringify(cartData));
      setVegetableOrder(cartData);
        },
    [
      cartItems,
      getSelectedOption,
      getPriceForOption,
      getMarketPriceForOption,
      calculatePrices,
      setVegetableOrder,
    ]
  );

  const handleRemoveFromCart = useCallback(
    async (veg) => {
      const option = getSelectedOption(veg);
      const cartKey = `${veg._id}-${option}`;
      const currentQty = cartItems[cartKey] || 0;
      if (currentQty <= 1) {
        const newCartItems = { ...cartItems };
        delete newCartItems[cartKey];
        setCartItems(newCartItems);

        const savedCart = localStorage.getItem("orderSummary");
        if (savedCart) {
          let cartData = JSON.parse(savedCart);
          cartData.items = cartData.items.filter(
            (item) =>
              !(
                (item.id || item.vegetableId) === veg._id &&
                item.weight === option
              )
          );


          if (cartData.items.length > 0) {
            cartData = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(cartData));
            setVegetableOrder(cartData);
          } else {
            localStorage.removeItem("orderSummary");
            setVegetableOrder([]);
          }
        }
      } else {
        const newQty = currentQty - 1;
        setCartItems((prev) => ({
          ...prev,
          [cartKey]: newQty,
        }));

        const savedCart = localStorage.getItem("orderSummary");
        if (savedCart) {
          let cartData = JSON.parse(savedCart);
          const itemIndex = cartData.items.findIndex(
            (item) =>
              (item.id || item.vegetableId) === veg._id &&
              item.weight === option
          );

          if (itemIndex >= 0) {
            cartData.items[itemIndex].quantity = newQty;
            cartData = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(cartData));
            setVegetableOrder(cartData);
          }
        }
      }
    },
    [cartItems, getSelectedOption, calculatePrices, setVegetableOrder]
  );

  const getCartQuantity = useCallback(
    (veg) => {
      const option = getSelectedOption(veg);
      return cartItems[`${veg._id}-${option}`] || 0;
    },
    [cartItems, getSelectedOption]
  );

  const features = useMemo(
    () => [
      {
        icon: Clock,
        title: "Delivery",
        desc: "Next Morning Delivery Available 8 AM - 10 AM",
      },
      {
        icon: Leaf,
        title: "Farm Fresh",
        desc: "Directly sourced from local farmers",
      },
      {
        icon: Star,
        title: "Quality Promise",
        desc: "100% fresh or replace on your door guarantee",
      },
      {
        icon: Package,
        title: "Special Baskets",
        desc: "Curated combos at best prices",
      },
    ],
    []
  );

  const totalCartItems = useMemo(
    () => Object.values(cartItems).reduce((sum, qty) => sum + qty, 0),
    [cartItems]
  );
  const handleNavigateToOffers = useCallback(() => {
    window.scrollTo(0, 0);
    navigate("/offers");
  }, [navigate]);

  const handleNavigateToVegBag = useCallback(() => {
    const savedCart = localStorage.getItem("orderSummary");
    const cartData = savedCart ? JSON.parse(savedCart) : null;

    // ✅ Log each item with correct price
    if (cartData?.items) {
      cartData.items.forEach((item, idx) => {});
    }

    window.scrollTo(0, 0);
    navigate("/cart");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#ffffff] md:pt-10">
      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <button
          onClick={handleNavigateToVegBag}
          className="fixed bottom-24 md:bottom-20 right-10 z-50 bg-[#0e540b] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center gap-2"
          aria-label={`View cart with ${totalCartItems} items`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{totalCartItems}</span>
        </button>
      )}

      {/* Hero Section */}
      <VegBazarBanner />

      {/* Main Content */}
      <div className="w-full sm:w-full md:max-w-7xl lg:max-w-7xl h-full mx-auto px-1 md:py-5">
        {/* Top 10 Selling Vegetables Section */}
        <div className="w-full bg-[#ffffff] shadow-lg rounded-xl mt-8 pb-6">
          <div className="md:p-6 lg:p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Top 10 Selling Vegetables
            </h3>
            {vegLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0e540b]"></div>
              </div>
            ) : topSellingVegetables.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No vegetables available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-5">
                {topSellingVegetables.map((veg) => (
                  <VegetableCard
                    key={veg._id}
                    veg={veg}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    selectedWeight={selectedWeights[veg._id] || "250g"}
                    onWeightChange={setSelectedWeight}
                    selectedSet={selectedSets[veg._id] || "set0"}
                    onSetChange={setSelectedSet}
                    quantity={getCartQuantity(veg)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top 6 Suggest Vegetables for this Session */}
        <div className="w-full bg-[#ffffff] shadow-lg rounded-xl mt-8 pb-6">
          <div className="md:p-6 lg:p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Top 6 Suggested Vegetables for this Session
            </h3>
            {vegLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0e540b]"></div>
              </div>
            ) : suggestedVegetables.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No suggested vegetables available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 xl:grid-cols-6">
                {suggestedVegetables.map((veg) => (
                  <VegetableCard
                    key={veg._id}
                    veg={veg}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    selectedWeight={selectedWeights[veg._id] || "250g"}
                    onWeightChange={setSelectedWeight}
                    selectedSet={selectedSets[veg._id] || "set0"}
                    onSetChange={setSelectedSet}
                    quantity={getCartQuantity(veg)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className="w-full bg-[#ffffff] shadow-lg rounded-xl mt-8 pb-6">
          <div className="md:p-6 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Top Offers</h3>
              <button
                onClick={handleNavigateToOffers}
                className="text-sm text-[#0e540b] font-semibold hover:underline"
              >
                View all offers →
              </button>
            </div>

            {topOffers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No offers available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topOffers.map((offer) => (
                  <OfferCard
                    key={offer._id || offer.id}
                    offer={offer}
                    onNavigate={() => {
                      navigate(`/offers/${offer._id || offer.id}`);
                      window.scrollTo(0, 0);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials */}
        <TestimonialsCarousel testimonials={testimonials} />

        {/* Features / Why choose us */}
        <div className="w-full bg-[#ffffff] shadow-lg rounded-xl mt-8 pb-6">
          <div className="md:p-6 lg:p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why VegBazar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 flex flex-col items-center text-center shadow-sm"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0e540b]/10 mb-3">
                    <f.icon className="w-5 h-5 text-[#0e540b]" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{f.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="w-full mt-8 pb-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Ready to order fresh vegetables?
              </h3>
              <p className="text-sm opacity-90">
                Fast delivery · Farm fresh · Great prices
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNavigateToVegBag}
                className="px-4 py-2 bg-white text-[#0e540b] rounded-md font-semibold hover:brightness-95 transition"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate("/vegetables")}
                className="px-4 py-2 border border-white rounded-md hover:bg-white/10 transition"
              >
                Browse Vegetables
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
