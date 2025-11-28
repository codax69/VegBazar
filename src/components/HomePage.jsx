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
import vegbazarLogo from "../../public/vegbazar.svg";
import axios from "axios";

// Memoized VegetableCard component to prevent unnecessary re-renders
const VegetableCard = memo(
  ({
    veg,
    onAddToCart,
    onRemoveFromCart,
    selectedWeight,
    onWeightChange,
    quantity,
  }) => {
    const availableWeights = useMemo(() => {
      if (!veg.prices || typeof veg.prices !== "object") return ["250g"];
      const weights = [];
      if (veg.prices.weight1kg && veg.prices.weight1kg > 0) weights.push("1kg");
      if (veg.prices.weight500g && veg.prices.weight500g > 0)
        weights.push("500g");
      if (veg.prices.weight250g && veg.prices.weight250g > 0)
        weights.push("250g");
      return weights.length > 0 ? weights : ["250g"];
    }, [veg.prices]);

    const { actualPrice, marketPrice, savings } = useMemo(() => {
      const weightKey = `weight${selectedWeight}`;
      const actual = veg.prices?.[weightKey] || veg.price || 0;
      const market =
        veg.marketPrices?.[weightKey] || veg.originalPrice || actual;
      return {
        actualPrice: actual,
        marketPrice: market,
        savings: market - actual,
      };
    }, [veg, selectedWeight]);

    return (
      <div className="w-full p-2 md:p-4 rounded-lg sm:rounded-xl border-2 bg-[#] border-gray-300 shadow-md transition-all duration-200 hover:border-[#0e540b] hover:shadow-xl">
        {/* Vegetable Image with explicit dimensions */}
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-1.5 sm:mb-2">
            {veg.image ? (
              <img
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                src={veg.image}
                alt={veg.name}
                loading="lazy"
                decoding="async"
                width="96"
                height="96"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-[#effdf5] rounded-lg sm:rounded-xl flex items-center justify-center">
                <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-[#0e540b]/30" />
              </div>
            )}
          </div>
          <p className="font-medium font-assistant text-xs sm:text-sm leading-tight mb-1.5 sm:mb-2 px-1">
            {veg.name}
          </p>
        </div>

        {/* Weight Selection */}
        {availableWeights.length > 1 && (
          <div className="flex gap-1 mb-2 justify-center flex-wrap">
            {availableWeights.map((weight) => (
              <button
                key={weight}
                onClick={() => onWeightChange(veg._id, weight)}
                className={`px-2 py-1 text-[10px] font-assistant font-semibold rounded-md transition-all ${
                  selectedWeight === weight
                    ? "bg-[#0e540b] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {weight}
              </button>
            ))}
          </div>
        )}

        {/* Price Display */}
        <div className="mt-1 sm:mt-2 text-center mb-2">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <p className="font-assistant text-[#0e540b] font-bold text-sm sm:text-base">
              ₹{actualPrice.toFixed(2)}
            </p>
            {marketPrice > actualPrice && (
              <p className="font-assistant text-gray-400 line-through text-[10px] sm:text-xs">
                ₹{marketPrice.toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-[11px] sm:text-[11px] text-gray-500 font-assistant">
            per {selectedWeight}
          </p>
          {savings > 0 && (
            <p className="text-[9px] sm:text-[10px] text-green-600 font-assistant font-semibold mt-0.5">
              Save ₹{savings.toFixed(2)}
            </p>
          )}
        </div>

        {/* Add to Cart Button or Quantity Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => onAddToCart(veg)}
            className="w-full font-assistant bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            aria-label={`Add ${veg.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#0e540b] rounded-lg px-2 py-1.5">
            <button
              onClick={() => onRemoveFromCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-[#f0fcf6] rounded-md hover:bg-gray-100 transition"
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="text-[#0e540b]" />
            </button>
            <span className="font-assistant font-bold text-white text-sm px-2">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-[#f0fcf6] rounded-md hover:bg-gray-100 transition"
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

VegetableCard.displayName = "VegetableCard";

// Memoized OfferCard component
const OfferCard = memo(({ offer, onNavigate }) => {
  return (
    <div
      onClick={onNavigate}
      className="group relative bg-[#f0fcf6] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#0e540b] active:scale-95 sm:hover:-translate-y-1 sm:hover:scale-[1.02] overflow-hidden flex flex-col"
    >
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
            <span>{offer.vegetables?.length / 2 || 0} vegetables</span>
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
  const { setVegetableOrder, navigate } = useOrderContext();
  const [topSellingVegetables, setTopSellingVegetables] = useState([]);
  const [suggestedVegetables, setSuggestedVegetables] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [veggiesRes, offersRes, testimonialsRes] = await Promise.all([
          axios
            .get(`${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`)
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

        // Split vegetables into two different sections
        // Top 10 Selling - first 10 vegetables
        setTopSellingVegetables(allVegetables.slice(0, 10));

        // Suggested for session - next 6 vegetables (from index 10 to 16)
        // If there aren't enough vegetables, it will show whatever is available
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
        console.error("Error fetching data:", error);
      } finally {
        setVegLoading(false);
        setLoading(false);
        setTestimonialsLoading(false);
      }
    };

    fetchAllData();
  }, []);
  // Memoized helper functions
  const getPriceForWeight = useCallback((veg, weight) => {
    const weightKey = `weight${weight}`;
    if (veg.prices && typeof veg.prices === "object") {
      return veg.prices[weightKey] || 0;
    }
    return veg.price || 0;
  }, []);

  const getMarketPriceForWeight = useCallback((veg, weight) => {
    const weightKey = `weight${weight}`;
    if (veg.marketPrices && typeof veg.marketPrices === "object") {
      return veg.marketPrices[weightKey] || 0;
    }
    return veg.originalPrice || veg.price || 0;
  }, []);

  const getSelectedWeight = useCallback(
    (vegId) => {
      return selectedWeights[vegId] || "250g";
    },
    [selectedWeights]
  );

  const setSelectedWeight = useCallback((vegId, weight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [vegId]: weight,
    }));
  }, []);

  // Debounced price calculation to reduce API calls
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
      console.error("Error calculating prices:", error);
      return cartData;
    }
  }, []);

  const handleAddToCart = useCallback(
    async (veg) => {
      const weight = getSelectedWeight(veg._id);
      const cartKey = `${veg._id}-${weight}`;
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
          (item.id || item.vegetableId) === veg._id && item.weight === weight
      );

      const priceForWeight = getPriceForWeight(veg, weight);
      const marketPriceForWeight = getMarketPriceForWeight(veg, weight);

      if (existingItemIndex >= 0) {
        cartData.items[existingItemIndex].quantity = newQty;
        cartData.items[existingItemIndex].pricePerUnit = priceForWeight;
        cartData.items[existingItemIndex].price = priceForWeight;
        cartData.items[existingItemIndex].marketPrice = marketPriceForWeight;
      } else {
        cartData.items.push({
          id: veg._id,
          vegetableId: veg._id,
          name: veg.name,
          image: veg.image || "/placeholder-vegetable.jpg",
          weight: weight,
          quantity: 1,
          pricePerUnit: priceForWeight,
          price: priceForWeight,
          marketPrice: marketPriceForWeight,
          totalPrice: priceForWeight,
        });
      }

      cartData = await calculatePrices(cartData);
      localStorage.setItem("orderSummary", JSON.stringify(cartData));
      setVegetableOrder(cartData);
    },
    [
      cartItems,
      getSelectedWeight,
      getPriceForWeight,
      getMarketPriceForWeight,
      calculatePrices,
      setVegetableOrder,
    ]
  );

  const handleRemoveFromCart = useCallback(
    async (veg) => {
      const weight = getSelectedWeight(veg._id);
      const cartKey = `${veg._id}-${weight}`;
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
                item.weight === weight
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
              item.weight === weight
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
    [cartItems, getSelectedWeight, calculatePrices, setVegetableOrder]
  );

  const getCartQuantity = useCallback(
    (vegId, weight) => {
      return cartItems[`${vegId}-${weight}`] || 0;
    },
    [cartItems]
  );

  const features = useMemo(
    () => [
      {
        icon: Clock,
        title: "Delivery",
        desc: "fast delivery to your doorstep",
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
    window.scrollTo(0, 0);
    navigate("/veg-bag");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f0fcf6] md:pt-10">
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

      {/* Hero Section with fixed dimensions to prevent CLS */}
      <section className="w-full sm:w-full md:max-w-7xl lg:max-w-7xl mx-auto bg-[#bbf0ae] py-1 sm:py-3 px-1 sm:px-1 rounded-3xl shadow-md shadow-gray-400">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-1">
            <div className="h-10 sm:h-12 w-12 sm:w-12 flex items-center justify-center flex-shrink-0">
              <img
                src={vegbazarLogo}
                className="w-full"
                alt="VegBazar Logo"
                width="48"
                height="48"
              />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold trirong text-gray-900 tracking-tight">
              VegBazar
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Fresh vegetables from local farms
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full sm:w-full md:max-w-7xl lg:max-w-7xl h-full mx-auto px-1 md:py-5">
        {/* Top 10 Selling Vegetables Section */}
        <div className="w-full bg-[#f0fcf6] shadow-lg rounded-xl mt-8 pb-6">
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
                    selectedWeight={getSelectedWeight(veg._id)}
                    onWeightChange={setSelectedWeight}
                    quantity={getCartQuantity(
                      veg._id,
                      getSelectedWeight(veg._id)
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top 6 Suggest Vegetables for this Session */}
        <div className="w-full bg-[#f0fcf6] shadow-lg rounded-xl mt-8 pb-6">
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
                    selectedWeight={getSelectedWeight(veg._id)}
                    onWeightChange={setSelectedWeight}
                    quantity={getCartQuantity(
                      veg._id,
                      getSelectedWeight(veg._id)
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Poster with fixed dimensions */}
        <div className="w-full my-6 mx-auto min-h-[256px] bg-[#0e540b] rounded-3xl flex flex-col md:flex-row lg:flex-row items-center shadow-2xl shadow-gray-400 overflow-hidden">
          <div className="lg:w-1/3 md:w-1/3 h-64 md:h-full bg-[#0e540b] flex items-center justify-center">
            <img
              src={Store}
              alt="Fruit store illustration"
              width="300"
              height="300"
              loading="lazy"
            />
          </div>
          <h3 className="text-4xl font-bold md:text-2xl md:text-left lg:text-4xl text-white text-center py-8 lg:py-0 lg:text-left px-6 flex-1">
            Buy Crispy and Fresh Vegetables to Energize Your Day!
          </h3>
          <div className="lg:w-1/3 md:w-1/3 h-64 md:h-full bg-[#0e540b] lg:flex md:flex hidden items-center justify-center">
            <img
              src={Veggies}
              alt="Vegetables illustration"
              width="300"
              height="300"
              loading="lazy"
            />
          </div>
        </div>

        {/* Top Offers Section */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Special Baskets
              </h2>
              <p className="text-sm text-gray-500">
                Curated combos at unbeatable prices
              </p>
            </div>
            <button
              onClick={handleNavigateToOffers}
              className="flex items-center gap-1 text-[#0e540b] font-semibold text-sm hover:gap-2 transition-all"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0e540b]"></div>
            </div>
          ) : topOffers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 font-medium">
                No baskets available right now
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {topOffers.map((offer) => (
                <OfferCard
                  key={offer._id}
                  offer={offer}
                  onNavigate={handleNavigateToOffers}
                />
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <section className="w-full py-12 px-2 bg-[#f0fcf6]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 bg-[#effdf5] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#0e540b]/10">
                      <Icon className="w-7 h-7 text-[#0e540b]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {!testimonialsLoading && testimonials.length > 0 && (
          <div className="w-full mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                What Our Customers Say
              </h2>
              <p className="text-sm text-gray-500">
                Loved by thousands across India
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-[#effdf5] to-white rounded-3xl p-8 shadow-xl border-2 border-[#0e540b]/10">
                <div className="flex gap-2 mb-6 justify-center">
                  {[
                    ...Array(testimonials[currentTestimonial]?.rating || 5),
                  ].map((_, k) => (
                    <Star
                      key={k}
                      className="w-6 h-6 fill-[#f54a00] text-[#f54a00]"
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6 text-center italic">
                  "{testimonials[currentTestimonial]?.comment}"
                </p>

                <div className="flex items-center gap-4 justify-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0e540b] to-[#0a3d08] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {testimonials[currentTestimonial]?.initial}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonials[currentTestimonial]?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Verified Customer
                    </div>
                  </div>
                </div>

                {testimonials.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentTestimonial
                            ? "w-8 h-3 bg-[#0e540b]"
                            : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`View testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="w-full bg-gradient-to-r from-[#0e540b] via-[#0a3d08] to-[#0e540b] rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready for Farm Fresh Vegetables?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Start your healthy journey today
          </p>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/vegetables");
            }}
            className="bg-[#f0fcf6] text-[#0e540b] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#0e540b] text-white py-12 mt-12 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#f0fcf6]/10 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">VegBazar</span>
              </div>
              <p className="text-white/70 text-sm">
                Fresh vegetables from local farms, delivered to your doorstep in
                10 minutes.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Our Farmers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Delivery Areas
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate("/help");
                    }}
                    className="text-white/70 hover:text-white transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate("/track-your-order");
                    }}
                    className="text-white/70 hover:text-white transition-colors text-left"
                  >
                    Track Order
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Return Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>info.vegbazar@gmail.com</li>
                <li>+91 87805 64115</li>
                <li>Valsad, Gujarat</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-sm text-white/70">
              © 2025 VegBazar — Made with 💚 for farmers & families
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
