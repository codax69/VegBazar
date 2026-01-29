import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Leaf,
  Search,
  X,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

// Helper function to check if specific option has enough stock
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

// Updated VegetableCard component with stock-aware options
const VegetableCard = memo(
  ({
    veg,
    selectedWeight,
    selectedSet,
    quantity,
    onWeightChange,
    onSetChange,
    onAddToCart,
    onRemoveFromCart,
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

    return (
      <div
        className={`w-full p-2 md:p-4 rounded-lg sm:rounded-xl border-2 shadow-md transition-all duration-200 relative ${
          isCompletelyOutOfStock
            ? "bg-gray-100 border-gray-300 opacity-75"
            : "bg-[#f0fcf6] border-gray-300 hover:border-[#0e540b] hover:shadow-xl"
        }`}
      >
        {/* Vegetable Image */}
        <div className="text-center">
          <div className="relative">
            {veg.image ? (
              <img
                className={`w-28 h-28 sm:w-30 sm:h-30 md:w-32 md:h-32 object-cover mx-auto rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 ${
                  isCompletelyOutOfStock ? "grayscale" : ""
                }`}
                src={veg.image}
                alt={veg.name}
                loading="lazy"
                decoding="async"
                height="96"
                width="96"
              />
            ) : (
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 flex items-center justify-center mx-auto ${
                  isCompletelyOutOfStock
                    ? "from-gray-200 to-gray-300"
                    : "from-gray-50 to-[#effdf5]"
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
              isCompletelyOutOfStock ? "text-gray-500" : "text-black"
            }`}
          >
            {veg.name}
            {isSetModel && (
              <span className="ml-1 text-[10px] text-purple-600">📦</span>
            )}
          </p>
        </div>

        {/* Weight/Set Selection */}
        {!isCompletelyOutOfStock && availableOptions.length > 1 && (
          <div className="flex gap-1 mb-2 justify-center flex-wrap">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.inStock) {
                    isSetModel
                      ? onSetChange(veg._id, option.value)
                      : onWeightChange(veg._id, option.value);
                  }
                }}
                disabled={!option.inStock}
                className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  !option.inStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through"
                    : currentOption === option.value
                      ? "bg-[#0e540b] text-white"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
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
            <p className="text-[11px] sm:text-[11px] text-black">
              per {selectedOptionData?.label}
            </p>
            {savings > 0 && (
              <p className="text-[9px] sm:text-[10px] text-[#0e540b] font-semibold mt-0.5">
                Off ₹{savings.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Add to Cart Button or Quantity Controls */}
        {isCompletelyOutOfStock ? (
          <div className="w-full bg-gray-300 text-black font-semibold py-2 px-3 rounded-lg text-xs sm:text-sm text-center cursor-not-allowed">
            Unavailable
          </div>
        ) : isCurrentOptionOutOfStock ? (
          <div className="w-full bg-orange-100 text-orange-700 font-semibold py-2 px-3 rounded-lg text-xs sm:text-sm text-center">
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
            >
              <Minus size={14} className="text-[#0e540b]" />
            </button>
            <span className="font-bold text-white text-sm px-2">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-[#ffffff] rounded-md hover:bg-gray-100 transition"
            >
              <Plus size={14} className="text-[#0e540b]" />
            </button>
          </div>
        )}
      </div>
    );
  },
);

VegetableCard.displayName = "VegetableCard";

const CustomizedVegetableSelection = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});
  const [selectedSets, setSelectedSets] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const {
    setVegetableOrder,
    navigate,
    setSelectedOffer,
    setSelectedVegetables,
  } = useOrderContext();

  // Memoize API URL
  const API_URL = useMemo(() => import.meta.env.VITE_API_SERVER_URL, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("orderSummary");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const items = parsed.items || [];
        const cartMap = {};
        items.forEach((item) => {
          const key = `${item.id || item.vegetableId}-${item.weight}`;
          cartMap[key] = item.quantity;
        });
        setCartItems(cartMap);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  // Calculate prices
  const calculatePrices = useCallback(
    async (cartData) => {
      try {
        const normalizedItems = cartData.items.map((item) => ({
          vegetableId: item.vegetableId || item.id,
          weight: item.weight,
          quantity: item.quantity,
        }));

        const response = await axios.post(
          `${API_URL}/api/orders/calculate-price`,
          { items: normalizedItems },
        );

        const updatedPrices = response.data.data;

        cartData.items = cartData.items.map((item) => {
          const calculatedItem = updatedPrices.items.find(
            (i) =>
              i.vegetableId === (item.id || item.vegetableId) &&
              i.weight === item.weight,
          );
          if (calculatedItem) {
            return {
              ...item,
              pricePerUnit:
                calculatedItem.pricePerUnit || item.pricePerUnit || 0,
              totalPrice:
                calculatedItem.totalPrice ||
                calculatedItem.pricePerUnit * item.quantity ||
                0,
            };
          }
          return item;
        });

        cartData.summary = updatedPrices.summary || {};
        cartData.timestamp =
          updatedPrices.timestamp || new Date().toISOString();

        return cartData;
      } catch (error) {
        console.error("Error calculating prices:", error);
        return cartData;
      }
    },
    [API_URL],
  );

  // Get price for specific option
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
      if (veg.prices && typeof veg.prices === "object") {
        return veg.prices[weightKey] || 0;
      }
      return veg.price || 0;
    }
  }, []);

  // Get market price for specific option
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
      if (veg.marketPrices && typeof veg.marketPrices === "object") {
        return veg.marketPrices[weightKey] || 0;
      }
      return veg.originalPrice || veg.price || 0;
    }
  }, []);

  // Get selected option for a vegetable
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
    [selectedWeights, selectedSets],
  );

  // Set selected weight for a vegetable
  const setSelectedWeight = useCallback((vegId, weight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [vegId]: weight,
    }));
  }, []);

  // Set selected set for a vegetable
  const setSelectedSet = useCallback((vegId, set) => {
    setSelectedSets((prev) => ({
      ...prev,
      [vegId]: set,
    }));
  }, []);

  // Add to cart function
  const handleAddToCart = useCallback(
    async (veg) => {
      const option = getSelectedOption(veg);
      const isSetModel =
        veg.pricingType === "set" ||
        veg.setPricing?.enabled ||
        veg.setPricingEnabled;

      // Check if option has enough stock
      if (!hasEnoughStock(veg, option, isSetModel)) {
        setError("Selected option is out of stock");
        setTimeout(() => setError(""), 3000);
        return;
      }

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
          (item.id || item.vegetableId) === veg._id && item.weight === option,
      );

      const priceForOption = getPriceForOption(veg, option);
      const marketPriceForOption = getMarketPriceForOption(veg, option);

      // Get the correct label for the selected option
      let optionLabel = option;

      if (isSetModel) {
        const setIndex = parseInt(option.replace("set", ""));
        const sets = veg.setPricing?.sets || veg.sets || veg.setOptions || [];
        optionLabel =
          sets[setIndex]?.label ||
          `${sets[setIndex]?.quantity} ${sets[setIndex]?.unit}`;
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

      const updatedCart = await calculatePrices(cartData);
      localStorage.setItem("orderSummary", JSON.stringify(updatedCart));
      setVegetableOrder(updatedCart);
    },
    [
      cartItems,
      getSelectedOption,
      getPriceForOption,
      getMarketPriceForOption,
      calculatePrices,
      setVegetableOrder,
    ],
  );

  // Remove from cart function
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
              ),
          );

          if (cartData.items.length > 0) {
            const updatedCart = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(updatedCart));
            setVegetableOrder(updatedCart);
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
              item.weight === option,
          );

          if (itemIndex >= 0) {
            cartData.items[itemIndex].quantity = newQty;
            const updatedCart = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(updatedCart));
            setVegetableOrder(updatedCart);
          }
        }
      }
    },
    [cartItems, getSelectedOption, calculatePrices, setVegetableOrder],
  );

  // FIXED: Remove from cart in preview with proper vegetableId and weight
  const handleRemoveFromCartPreview = useCallback(
    async (vegetableId, weight) => {
      const cartKey = `${vegetableId}-${weight}`;
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
                (item.id || item.vegetableId) === vegetableId &&
                item.weight === weight
              ),
          );

          if (cartData.items.length > 0) {
            const updatedCart = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(updatedCart));
            setVegetableOrder(updatedCart);
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
              (item.id || item.vegetableId) === vegetableId &&
              item.weight === weight,
          );

          if (itemIndex >= 0) {
            cartData.items[itemIndex].quantity = newQty;
            const updatedCart = await calculatePrices(cartData);
            localStorage.setItem("orderSummary", JSON.stringify(updatedCart));
            setVegetableOrder(updatedCart);
          }
        }
      }
    },
    [cartItems, calculatePrices, setVegetableOrder],
  );

  const getCartQuantity = useCallback(
    (veg) => {
      const option = getSelectedOption(veg);
      return cartItems[`${veg._id}-${option}`] || 0;
    },
    [cartItems, getSelectedOption],
  );

  const handleCheckout = useCallback(async () => {
    try {
      const savedCart = localStorage.getItem("orderSummary");
      if (!savedCart) {
        setError("Please add vegetables before proceeding");
        return;
      }

      const cartData = JSON.parse(savedCart);
      if (!cartData.items || cartData.items.length === 0) {
        setError("Please add vegetables before proceeding");
        return;
      }

      window.scrollTo(0, 0);
      navigate("/cart");
    } catch (error) {
      console.error("Checkout failed:", error);
      setError(error.message || "Failed to process order.");
    }
  }, [navigate]);

  // Fetch vegetables
  useEffect(() => {
    setSelectedOffer(null);
    setSelectedVegetables([]);

    const fetchVegetables = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/vegetables/random`);
        const veggiesData = response.data?.data || [];
        setVegetables(veggiesData);
      } catch (error) {
        console.error("Error fetching vegetables:", error);
        setError("Failed to load vegetables. Please try again.");
        setVegetables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVegetables();
  }, [API_URL, setSelectedOffer, setSelectedVegetables]);

  // Memoize total items calculation
  const totalItems = useMemo(() => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  }, [cartItems]);

  // Get cart items with vegetable details (instant from state)
  const cartItemsWithDetails = useMemo(() => {
    const items = [];
    
    Object.entries(cartItems).forEach(([key, quantity]) => {
      if (quantity > 0) {
        const [vegId, weight] = key.split('-');
        const vegetable = vegetables.find(v => v._id === vegId);
        
        if (vegetable) {
          items.push({
            id: vegetable._id,
            vegetableId: vegetable._id,
            name: vegetable.name,
            image: vegetable.image || "/placeholder-vegetable.jpg",
            quantity: quantity,
            weight: weight
          });
        }
      }
    });
    
    return items;
  }, [cartItems, vegetables]);

  // Filter vegetables based on search query
  const filteredVegetables = useMemo(() => {
    if (!searchQuery.trim()) return vegetables;
    const query = searchQuery.toLowerCase().trim();
    return vegetables.filter((veg) => veg.name.toLowerCase().includes(query));
  }, [vegetables, searchQuery]);

  return (
    <div className="min-h-screen bg-[#ffffff] pb-36 lg:py-4 md:pb-10 md:py-4">
      <div className="w-full max-w-7xl mx-auto mt-5 bg-[#ffffff] p-4 sm:p-1 md:p-8">
        {/* Header */}
        <div className="flex items-center md:justify-between gap-10 mb-8 pb-4 border-b-2 border-gray-100">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo(0, 0);
            }}
            className="flex items-center text-[#0e540b] hover:text-green-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h2 className="text-2xl text-center sm:text-3xl font-bold text-[#0e540b]">
            Select Your Vegetables
          </h2>
          <div className="w-20" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-[#0e540b] focus:ring-1 focus:ring-[#0e540b] sm:text-sm transition-colors duration-200"
            placeholder="Search vegetables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0e540b]"></div>
          </div>
        ) : vegetables.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">No vegetables available</p>
          </div>
        ) : filteredVegetables.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">
              No vegetables found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 mb-8">
              {filteredVegetables.map((veg) => (
                <VegetableCard
                  key={veg._id}
                  veg={veg}
                  selectedWeight={selectedWeights[veg._id] || "250g"}
                  selectedSet={selectedSets[veg._id] || "set0"}
                  quantity={getCartQuantity(veg)}
                  onWeightChange={setSelectedWeight}
                  onSetChange={setSelectedSet}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                />
              ))}
            </div>

            {/* Footer with Cart Preview */}
            {totalItems > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t-2 border-gray-200 shadow-2xl z-50">
                {/* Checkout Bar */}
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 overflow-x-auto">
                  <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between min-w-min">
                    <div className="text-center sm:text-left flex-shrink-0">
                      <p className="text-[11px] sm:text-xs text-gray-600">Total Items</p>
                      <p className="text-base sm:text-lg font-bold text-[#0e540b]">
                        {totalItems}
                      </p>
                    </div>
                    <div className="w-full sm:flex-1 overflow-x-auto px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#f0fcf6] to-[#e8f9ed] rounded-lg md:mx-2">
                      <div className="flex gap-1.5 sm:gap-2 min-w-max">
                        {cartItemsWithDetails
                          .slice(0, 10)
                          .map((item, index) => (
                            <div
                              key={`${item.id || item.vegetableId}-${item.weight}-${index}`}
                              className="flex flex-col items-center group flex-shrink-0"
                            >
                              <div className="relative">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white shadow-md border-2 border-[#0e540b] overflow-hidden flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-[#0e540b]/30" />
                                  )}
                                </div>
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#0e540b] text-white rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-bold shadow-md">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFromCartPreview(item.id || item.vegetableId, item.weight);
                                  }}
                                  className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Remove from cart"
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </button>
                              </div>
                              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-700 mt-0.5 text-center max-w-[40px] sm:max-w-[45px] truncate font-medium">
                                {item.name}
                              </p>
                            </div>
                          ))}
                        {cartItemsWithDetails.length > 10 && (
                          <div className="flex flex-col items-center justify-center flex-shrink-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-[#0e540b] shadow-md flex items-center justify-center">
                              <span className="text-white font-bold text-[8px] sm:text-[9px] md:text-xs">
                                +{cartItemsWithDetails.length - 10}
                              </span>
                            </div>
                            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-700 mt-0.5">
                              more
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#0e540b] to-[#063a06] hover:from-[#063a06] hover:to-[#051f04] hover:shadow-2xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-transparent hover:border-[#ffffff]/30 flex-shrink-0"
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Checkout</span>
                      <span className="sm:hidden">Go</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomizedVegetableSelection;