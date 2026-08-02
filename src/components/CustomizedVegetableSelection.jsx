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
        className={`w-full p-3.5 sm:p-4 rounded-[12px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] transition-colors duration-150 relative flex flex-col justify-between ${
          isCompletelyOutOfStock ? "opacity-60" : ""
        }`}
      >
        <div>
          {/* Flat Tint Image Area (1:1 Aspect Ratio Square) */}
          <div className="relative w-full aspect-square bg-[var(--color-tint-green)] rounded-[10px] flex items-center justify-center overflow-hidden mb-2.5">
            {veg.image ? (
              <img
                className={`w-full h-full object-cover ${isCompletelyOutOfStock ? "grayscale" : ""}`}
                src={veg.image}
                alt={veg.name}
                loading="lazy"
                decoding="async"
                width="96"
              />
            ) : (
              <Leaf className="w-6 h-6 text-[var(--color-brand-green)] opacity-60" />
            )}
            {isCompletelyOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="bg-[#16241A] text-white px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-medium">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product Title & Subtitle */}
          <div className="mb-2">
            <h3 className="font-body font-medium text-[13px] sm:text-[14px] text-[var(--color-text-primary)] leading-tight truncate">
              {veg.name}
              {isSetModel && <span className="ml-1 text-[10px] text-[var(--color-text-muted)]">📦</span>}
            </h3>
            <p className="font-body text-[11px] text-[var(--color-text-muted)] mt-0.5">
              {veg.category || "Farm Fresh"}
            </p>
          </div>

          {/* Weight/Set Selection — Border Only Active State */}
          {!isCompletelyOutOfStock && availableOptions.length > 1 && (
            <div className="flex gap-1.5 mb-3 flex-wrap">
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
                    className={`px-2.5 py-1 text-[11px] font-body rounded-[20px] border transition-colors ${
                      disabled
                        ? "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50 line-through cursor-not-allowed"
                        : isActive
                        ? "border-[var(--color-brand-green)] text-[var(--color-brand-green)] font-medium"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Signature Price Ledger Tag (Mono + Dashed Border) */}
          {!isCompletelyOutOfStock && !isCurrentOptionOutOfStock && (
            <div className="flex items-center justify-between gap-1 mb-3">
              <span className="font-mono font-medium text-[12px] sm:text-[13px] text-[var(--color-text-primary)] border border-dashed border-[var(--color-border-strong)] rounded-[6px] px-2 py-0.5">
                ₹{actualPrice.toFixed(2)} / {selectedOptionData?.label}
              </span>
              {marketPrice > actualPrice && (
                <span className="font-mono text-[11px] text-[var(--color-text-muted)] line-through">
                  ₹{marketPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Add to Cart Button or Stepper */}
        {isCompletelyOutOfStock ? (
          <div className="w-full bg-[var(--color-border)] text-[var(--color-text-muted)] font-body text-[12px] font-medium py-2 px-3 rounded-[10px] text-center cursor-not-allowed">
            Unavailable
          </div>
        ) : isCurrentOptionOutOfStock ? (
          <div className="w-full bg-[var(--color-amber-tint)] text-[var(--color-amber-ink)] font-body text-[12px] font-medium py-2 px-3 rounded-[10px] text-center cursor-not-allowed">
            Sold Out
          </div>
        ) : quantity === 0 ? (
          <button
            onClick={() => onAddToCart(veg)}
            className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-body text-[12px] font-medium py-2 px-3 rounded-[10px] active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-1.5"
            aria-label={`Add ${veg.name} to cart`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add to cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[var(--color-brand-green)] text-white rounded-[10px] px-2 py-1">
            <button
              onClick={() => onRemoveFromCart(veg)}
              className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-[6px] transition-colors"
            >
              <Minus size={14} className="text-white" />
            </button>
            <span className="font-mono font-medium text-xs px-2">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(veg)}
              className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-[6px] transition-colors"
            >
              <Plus size={14} className="text-white" />
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
          `/api/orders/calculate-price`,
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
    [],
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
        const sortByStock = (a, b) => {
          const aOut = a.outOfStock || (a.stockKg === 0 && (a.stockPieces === 0 || a.stockPieces == null));
          const bOut = b.outOfStock || (b.stockKg === 0 && (b.stockPieces === 0 || b.stockPieces == null));
          if (aOut && !bOut) return 1;
          if (!aOut && bOut) return -1;
          return 0;
        };

        const response = await axios.get(`/api/vegetables/random`);
        const veggiesData = (response.data?.data || []).sort(sortByStock);
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
  }, [setSelectedOffer, setSelectedVegetables]);

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
    <div className="min-h-screen bg-[var(--color-bg-app)] pb-36 lg:py-4 md:pb-10 md:py-4 font-body transition-colors duration-150">
      <div className="w-full max-w-7xl mx-auto mt-5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center md:justify-between gap-10 mb-8 pb-4 border-b border-[var(--color-border)] font-body">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo(0, 0);
            }}
            className="flex items-center text-[var(--color-brand-green)] hover:underline font-medium transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </button>
          <h2 className="text-xl text-center sm:text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            Select Your Vegetables
          </h2>
          <div className="w-20" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-md mx-auto font-body">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-9 py-2.5 border border-[var(--color-border)] rounded-[8px] leading-5 bg-[var(--color-bg-surface)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-green)] sm:text-xs text-[var(--color-text-primary)] transition-colors duration-150"
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
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)]" />
          </div>
        ) : (
          <>
            {filteredVegetables.length === 0 ? (
              <div className="text-center py-12 font-body">
                <p className="text-[var(--color-text-secondary)] text-sm font-medium">No vegetables found</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-1">Try adjusting your search query</p>
              </div>
            ) : (
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
            )}

            {/* Bottom Floating Bar */}
            {totalItems > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] shadow-lg z-50 font-body">
                {/* Checkout Bar */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 max-w-7xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-[10px] text-[var(--color-text-muted)]">Total Items</p>
                      <p className="text-sm font-mono font-medium text-[var(--color-brand-green)]">
                        {totalItems}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="px-6 py-2.5 rounded-[10px] font-body font-medium text-xs sm:text-sm text-white bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Checkout</span>
                  </button>
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