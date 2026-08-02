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
import axios from "axios";
import VegBazarBanner from "./VegBazarBanner";
import TestimonialsCarousel from "./TestimonialsCarousel";
import Footer from "./Footer";

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

    // ✅ FIX: Calculate currentOption first (no useMemo needed)
    const currentOption = isSetModel ? selectedSet : selectedWeight;

    // ✅ FIX: Get selected option data directly
    const selectedOptionData =
      availableOptions.find((opt) => opt.value === currentOption) ||
      availableOptions[0];

    // ✅ FIX: Simple calculations without useMemo
    const isCurrentOptionOutOfStock = !selectedOptionData?.inStock;
    const actualPrice = selectedOptionData?.price || 0;
    const marketPrice = selectedOptionData?.marketPrice || actualPrice;
    const savings = marketPrice - actualPrice;

    // Get stock warning message
    const stockWarning = useMemo(() => {
      if (isCompletelyOutOfStock || !isCurrentOptionOutOfStock) return null;

      const availableOpts = availableOptions.filter((opt) => opt.inStock);

      if (availableOpts.length === 0) return null;

      if (isSetModel) {
        const stockPieces = veg.stockPieces || 0;
        return {
          message: `Only ${stockPieces} piece${stockPieces !== 1 ? "s" : ""
            } left`,
          alternatives: availableOpts.map((opt) => opt.label).join(", "),
        };
      } else {
        const stockKg = veg.stockKg || 0;
        return {
          message: `Only ${stockKg}kg available`,
          alternatives: availableOpts.map((opt) => opt.label).join(", "),
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
                width="100"
                height="100"
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

          {/* Stock Warning Pill (Plain Copy, Alert Icon, Amber Tint) */}
          {stockWarning && (
            <div className="mb-2.5 px-2 py-1 bg-[var(--color-amber-tint)] text-[var(--color-amber-ink)] rounded-[20px] text-[10px] sm:text-[11px] font-body font-medium flex items-center gap-1">
              <span className="text-[11px]">⚠️</span>
              <span className="truncate">{stockWarning.message}</span>
            </div>
          )}

          {/* Weight/Set Selector — Border Only Active State, No Solid Fill */}
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
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="text-white" />
            </button>
            <span className="font-mono font-medium text-xs px-2">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(veg)}
              className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-[6px] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

VegetableCard.displayName = "VegetableCard";

VegetableCard.displayName = "VegetableCard";
// Memoized OfferCard component
const OfferCard = memo(({ offer, onNavigate }) => {
  return (
    <div
      onClick={onNavigate}
      className="group relative bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors duration-150 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="bg-[var(--color-tint-green)] p-3.5 text-center relative overflow-hidden shrink-0">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-[var(--color-bg-surface)] rounded-full border border-[var(--color-border)] mb-2 group-hover:scale-105 transition-transform">
          <ShoppingCart className="w-5 h-5 text-[var(--color-brand-green)]" />
        </div>
        <h3 className="text-base font-display font-semibold text-[var(--color-text-primary)] mb-1">
          {offer.title}
        </h3>
        <div className="flex font-body items-center justify-center gap-1 text-[var(--color-text-secondary)] text-xs">
          <Leaf className="w-3.5 h-3.5" />
          <span>{offer.vegetables?.length || 0} vegetables</span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <div className="text-center mb-3 shrink-0">
          <span className="font-mono font-medium text-lg sm:text-xl text-[var(--color-text-primary)] border border-dashed border-[var(--color-border-strong)] rounded-[6px] px-2.5 py-0.5 inline-block">
            ₹{offer.price}
          </span>
        </div>

        {offer.description && (
          <p className="text-[var(--color-text-secondary)] font-body text-xs text-center mb-3 leading-relaxed shrink-0">
            {offer.description}
          </p>
        )}

        {offer.vegetables && offer.vegetables.length > 0 && (
          <div className="bg-[var(--color-bg-app)] rounded-[8px] p-2.5 mb-3 border border-[var(--color-border)] shrink-0">
            <p className="text-xs font-medium text-[var(--color-text-primary)] mb-1.5 flex items-center gap-1 font-body">
              <Check className="w-3.5 h-3.5 text-[var(--color-brand-green)]" />
              What's Included:
            </p>
            <ul className="space-y-1 font-body text-xs text-[var(--color-text-secondary)]">
              {offer.vegetables.slice(0, 3).map((veg, index) => (
                <li
                  key={veg._id || index}
                  className="flex items-center gap-1.5 truncate"
                >
                  <div className="w-1 h-1 rounded-full bg-[var(--color-brand-green)] shrink-0" />
                  <span className="truncate">{veg.vegetable?.name || veg.name || 'Vegetable'}</span>
                </li>
              ))}
              {offer.vegetables.length > 3 && (
                <li className="text-[var(--color-brand-green)] font-medium flex items-center gap-1.5 text-[11px]">
                  <div className="w-1 h-1 rounded-full bg-[var(--color-brand-green)] shrink-0" />
                  +{offer.vegetables.length - 3} more vegetables
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          aria-label={`Select ${offer.title} package`}
          className="w-full font-body bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-medium py-2 px-3 rounded-[10px] transition-colors text-xs flex items-center justify-center gap-1.5 mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Select
        </button>
      </div>

      {offer.popular && (
        <div className="absolute top-2 right-2 bg-[var(--color-amber)] text-[var(--color-amber-ink)] text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
          Popular
        </div>
      )}
    </div>
  );
});

OfferCard.displayName = "OfferCard";

const Homepage = () => {
  const [topOffers, setTopOffers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vegLoading, setVegLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [cartItems, setCartItems] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});
  const [selectedSets, setSelectedSets] = useState({});
  const { setVegetableOrder, navigate, setSelectedOffer, setSelectedVegetables } = useOrderContext();
  const [topSellingVegetables, setTopSellingVegetables] = useState([]);
  const [suggestedVegetables, setSuggestedVegetables] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [veggiesRes, offersRes, testimonialsRes] = await Promise.all([
          axios
            .get(
              `/api/vegetables/home/veg`
            )
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(
              `/api/baskets/top-baskets/suggestion`
            )
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(
              `/api/testimonials/published`
            )
            .catch(() => ({ data: { data: { testimonials: [] } } })),
        ]);

        const sortByStock = (a, b) => {
          const aOut = a.outOfStock || (a.stockKg === 0 && (a.stockPieces === 0 || a.stockPieces == null));
          const bOut = b.outOfStock || (b.stockKg === 0 && (b.stockPieces === 0 || b.stockPieces == null));
          if (aOut && !bOut) return 1;
          if (!aOut && bOut) return -1;
          return 0;
        };

        const allVegetables = (veggiesRes.data?.data || []).sort(sortByStock);
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
        `/api/orders/calculate-price`,
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

  // Track offer/basket click
  const handleOfferClick = useCallback(async (offer) => {
    try {
      // Increment click count on backend
      await axios.post(
        `/api/baskets/click/${offer._id}`
      );
    } catch (error) {
      console.error("Error tracking offer click:", error);
      // Continue with navigation even if tracking fails
    }
  }, []);

  const handleNavigateToOffers = useCallback(() => {
    window.scrollTo(0, 0);
    navigate("/offers");
  }, [navigate]);

  const handleNavigateToVegBag = useCallback(() => {
    const savedCart = localStorage.getItem("orderSummary");
    const cartData = savedCart ? JSON.parse(savedCart) : null;

    // ✅ Log each item with correct price
    if (cartData?.items) {
      cartData.items.forEach((item, idx) => { });
    }

    window.scrollTo(0, 0);
    navigate("/cart");
  }, [navigate]);

  // Handle offer/basket selection with click tracking
  const handleOfferSelect = useCallback(async (offer) => {
    window.scrollTo(0, 0);

    // Clear previous selections
    setVegetableOrder([]);
    setSelectedVegetables([]);

    // Set the selected offer
    setSelectedOffer(offer);

    // Track the click asynchronously
    handleOfferClick(offer);

    // Navigate to vegetable selection
    navigate("/select-vegetables");
  }, [navigate, setSelectedOffer, setSelectedVegetables, setVegetableOrder, handleOfferClick]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] md:pt-10 transition-colors duration-150 font-body">
      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <button
          onClick={handleNavigateToVegBag}
          className="fixed bottom-24 md:bottom-20 right-8 z-50 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white p-3.5 rounded-full shadow-lg transition-transform duration-150 hover:scale-105 flex items-center gap-2"
          aria-label={`View cart with ${totalCartItems} items`}
        >
          <ShoppingCart className="w-5 h-5 text-white" />
          <span className="font-mono font-medium text-xs text-white">{totalCartItems}</span>
        </button>
      )}

      {/* Hero Section */}
      <VegBazarBanner />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 md:py-5 space-y-6 sm:space-y-8">
        {/* Top 10 Selling Vegetables Section */}
        <div className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 sm:p-6 transition-colors duration-150">
          <h3 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)] mb-6">
            Top 10 Selling Vegetables
          </h3>
          {vegLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)]" />
            </div>
          ) : topSellingVegetables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-xs sm:text-sm font-body">No vegetables available</p>
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

        {/* Top 6 Suggest Vegetables for this Session */}
        <div className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 sm:p-6 transition-colors duration-150">
          <h3 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)] mb-6">
            Top 6 Suggested Vegetables for this Session
          </h3>
          {vegLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)]" />
            </div>
          ) : suggestedVegetables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-xs sm:text-sm font-body">
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

        {/* Baskets Section */}
        <div className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 sm:p-6 transition-colors duration-150">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)]">Top Baskets</h3>
            <button
              onClick={handleNavigateToOffers}
              className="text-xs sm:text-sm text-[var(--color-brand-green)] font-body font-medium hover:underline"
            >
              View all baskets →
            </button>
          </div>

          {topOffers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] text-xs sm:text-sm font-body">No baskets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topOffers.map((offer) => (
                <OfferCard
                  key={offer._id || offer.id}
                  offer={offer}
                  onNavigate={() => handleOfferSelect(offer)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Testimonials */}
        <TestimonialsCarousel testimonials={testimonials} />

        {/* Features / Why choose us */}
        <div className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 sm:p-6 transition-colors duration-150">
          <h3 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)] mb-6">
            Why VegBazar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] p-4 flex flex-col items-center text-center transition-colors"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-tint-green)] mb-3">
                  <f.icon className="w-5 h-5 text-[var(--color-brand-green)]" />
                </div>
                <h4 className="font-display font-semibold text-sm text-[var(--color-text-primary)]">{f.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="w-full pt-4 pb-12">
          <div className="max-w-4xl mx-auto bg-[var(--color-brand-green)] text-white rounded-[12px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--color-border)]">
            <div>
              <h3 className="text-lg sm:text-xl font-display font-semibold text-white">
                Ready to order fresh vegetables?
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-body mt-1">
                Fast delivery · Farm fresh · Great prices
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNavigateToVegBag}
                className="px-4 py-2 bg-white text-[var(--color-brand-green)] font-medium font-body text-xs rounded-[10px] hover:bg-white/90 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate("/vegetables")}
                className="px-4 py-2 border border-white text-white font-medium font-body text-xs rounded-[10px] hover:bg-white/10 transition-colors"
              >
                Browse Vegetables
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
