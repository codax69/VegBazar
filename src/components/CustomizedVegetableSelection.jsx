import React, { useEffect, useState } from "react";
import { ArrowLeft, ShoppingBag, Plus, Minus, Leaf } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

const CustomizedVegetableSelection = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});
  const {
    setVegetableOrder,
    vegetableOrder,
    navigate,
    setSelectedOffer,
    setSelectedVegetables,
  } = useOrderContext();
  
  console.log(cartItems);
  console.log(vegetableOrder);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("orderSummary");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const items = parsed.items || [];
        const cartMap = {};
        items.forEach(item => {
          const key = `${item.id || item.vegetableId}-${item.weight}`;
          cartMap[key] = item.quantity;
        });
        setCartItems(cartMap);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  // Get price for specific weight
  const getPriceForWeight = (veg, weight) => {
    const weightKey = `weight${weight}`;
    if (veg.prices && typeof veg.prices === 'object') {
      return veg.prices[weightKey] || 0;
    }
    return veg.price || 0;
  };

  // Get market price for specific weight
  const getMarketPriceForWeight = (veg, weight) => {
    const weightKey = `weight${weight}`;
    if (veg.marketPrices && typeof veg.marketPrices === 'object') {
      return veg.marketPrices[weightKey] || 0;
    }
    return veg.originalPrice || veg.price || 0;
  };

  // Get available weights for a vegetable
  const getAvailableWeights = (veg) => {
    if (!veg.prices || typeof veg.prices !== 'object') {
      return ["250g"];
    }
    const weights = [];
    if (veg.prices.weight1kg && veg.prices.weight1kg > 0) weights.push("1kg");
    if (veg.prices.weight500g && veg.prices.weight500g > 0) weights.push("500g");
    if (veg.prices.weight250g && veg.prices.weight250g > 0) weights.push("250g");
    return weights.length > 0 ? weights : ["250g"];
  };

  // Get selected weight for a vegetable
  const getSelectedWeight = (vegId) => {
    return selectedWeights[vegId] || "250g";
  };

  // Set selected weight for a vegetable
  const setSelectedWeight = (vegId, weight) => {
    setSelectedWeights(prev => ({
      ...prev,
      [vegId]: weight
    }));
  };

  // Add to cart function - FIXED to merge duplicate weight+vegetable combos
  const handleAddToCart = async (veg) => {
    const weight = getSelectedWeight(veg._id);
    const cartKey = `${veg._id}-${weight}`;
    const currentQty = cartItems[cartKey] || 0;
    const newQty = currentQty + 1;

    setCartItems(prev => ({
      ...prev,
      [cartKey]: newQty
    }));

    const savedCart = localStorage.getItem("orderSummary");
    let cartData = savedCart ? JSON.parse(savedCart) : { items: [] };
    
    // Find existing item with SAME vegetableId AND weight
    const existingItemIndex = cartData.items.findIndex(
      item => (item.id || item.vegetableId) === veg._id && item.weight === weight
    );

    const priceForWeight = getPriceForWeight(veg, weight);
    const marketPriceForWeight = getMarketPriceForWeight(veg, weight);

    if (existingItemIndex >= 0) {
      // MERGE: Increase quantity of existing item
      cartData.items[existingItemIndex].quantity = newQty;
      cartData.items[existingItemIndex].pricePerUnit = priceForWeight;
      cartData.items[existingItemIndex].price = priceForWeight;
      cartData.items[existingItemIndex].marketPrice = marketPriceForWeight;
    } else {
      // ADD NEW: Create new cart item
      cartData.items.push({
        id: veg._id,
        vegetableId: veg._id,
        name: veg.name,
        image: veg.image || '/placeholder-vegetable.jpg',
        weight: weight,
        quantity: 1,
        pricePerUnit: priceForWeight,
        price: priceForWeight,
        marketPrice: marketPriceForWeight,
        totalPrice: priceForWeight
      });
    }

    try {
      const normalizedItems = cartData.items.map(item => ({
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
          (i) => i.vegetableId === (item.id || item.vegetableId) && i.weight === item.weight
        );
        if (calculatedItem) {
          return {
            ...item,
            pricePerUnit: calculatedItem.pricePerUnit || item.pricePerUnit || 0,
            totalPrice: calculatedItem.totalPrice || calculatedItem.pricePerUnit * item.quantity || 0,
          };
        }
        return item;
      });

      cartData.summary = updatedPrices.summary || {};
      cartData.timestamp = updatedPrices.timestamp || new Date().toISOString();

    } catch (error) {
      console.error("Error calculating prices:", error);
    }

    localStorage.setItem("orderSummary", JSON.stringify(cartData));
    setVegetableOrder(cartData);
  };

  // Remove from cart function - FIXED
  const handleRemoveFromCart = async (veg) => {
    const weight = getSelectedWeight(veg._id);
    const cartKey = `${veg._id}-${weight}`;
    const currentQty = cartItems[cartKey] || 0;
    
    if (currentQty <= 1) {
      // Remove item completely
      const newCartItems = { ...cartItems };
      delete newCartItems[cartKey];
      setCartItems(newCartItems);

      const savedCart = localStorage.getItem("orderSummary");
      if (savedCart) {
        let cartData = JSON.parse(savedCart);
        cartData.items = cartData.items.filter(
          item => !((item.id || item.vegetableId) === veg._id && item.weight === weight)
        );

        if (cartData.items.length > 0) {
          try {
            const normalizedItems = cartData.items.map(item => ({
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
                (i) => i.vegetableId === (item.id || item.vegetableId) && i.weight === item.weight
              );
              if (calculatedItem) {
                return {
                  ...item,
                  pricePerUnit: calculatedItem.pricePerUnit || item.pricePerUnit || 0,
                  totalPrice: calculatedItem.totalPrice || calculatedItem.pricePerUnit * item.quantity || 0,
                };
              }
              return item;
            });

            cartData.summary = updatedPrices.summary || {};
            cartData.timestamp = updatedPrices.timestamp || new Date().toISOString();
          } catch (error) {
            console.error("Error calculating prices:", error);
          }

          localStorage.setItem("orderSummary", JSON.stringify(cartData));
          setVegetableOrder(cartData);
        } else {
          localStorage.removeItem("orderSummary");
          setVegetableOrder([]);
        }
      }
    } else {
      // Decrease quantity
      const newQty = currentQty - 1;
      setCartItems(prev => ({
        ...prev,
        [cartKey]: newQty
      }));

      const savedCart = localStorage.getItem("orderSummary");
      if (savedCart) {
        let cartData = JSON.parse(savedCart);
        const itemIndex = cartData.items.findIndex(
          item => (item.id || item.vegetableId) === veg._id && item.weight === weight
        );

        if (itemIndex >= 0) {
          cartData.items[itemIndex].quantity = newQty;

          try {
            const normalizedItems = cartData.items.map(item => ({
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
                (i) => i.vegetableId === (item.id || item.vegetableId) && i.weight === item.weight
              );
              if (calculatedItem) {
                return {
                  ...item,
                  pricePerUnit: calculatedItem.pricePerUnit || item.pricePerUnit || 0,
                  totalPrice: calculatedItem.totalPrice || calculatedItem.pricePerUnit * item.quantity || 0,
                };
              }
              return item;
            });

            cartData.summary = updatedPrices.summary || {};
            cartData.timestamp = updatedPrices.timestamp || new Date().toISOString();
          } catch (error) {
            console.error("Error calculating prices:", error);
          }

          localStorage.setItem("orderSummary", JSON.stringify(cartData));
          setVegetableOrder(cartData);
        }
      }
    }
  };

  const getCartQuantity = (vegId, weight) => {
    return cartItems[`${vegId}-${weight}`] || 0;
  };

  const VegetableCard = ({ veg }) => {
    const selectedWeight = getSelectedWeight(veg._id);
    const quantity = getCartQuantity(veg._id, selectedWeight);
    const availableWeights = getAvailableWeights(veg);
    const actualPrice = getPriceForWeight(veg, selectedWeight);
    const marketPrice = getMarketPriceForWeight(veg, selectedWeight);
    const savings = marketPrice - actualPrice;

    return (
      <div className="w-full p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 bg-white border-gray-300 shadow-md transition-all duration-200 hover:border-[#0e540b] hover:shadow-xl">
        {/* Vegetable Image */}
        <div className="text-center">
          <div className="relative">
            {veg.image ? (
              <img
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover mx-auto rounded-lg sm:rounded-xl mb-1.5 sm:mb-2"
                src={veg.image}
                alt={veg.name}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-50 to-[#effdf5] rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 flex items-center justify-center mx-auto">
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
                onClick={() => setSelectedWeight(veg._id, weight)}
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
            onClick={() => handleAddToCart(veg)}
            className="w-full font-assistant bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            aria-label={`Add ${veg.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#0e540b] rounded-lg px-2 py-1.5">
            <button
              onClick={() => handleRemoveFromCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-white rounded-md hover:bg-gray-100 transition"
            >
              <Minus size={14} className="text-[#0e540b]" />
            </button>
            <span className="font-assistant font-bold text-white text-sm px-2">
              {quantity}
            </span>
            <button
              onClick={() => handleAddToCart(veg)}
              className="w-7 h-7 flex items-center justify-center bg-white rounded-md hover:bg-gray-100 transition"
            >
              <Plus size={14} className="text-[#0e540b]" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleCheckout = async () => {
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
      navigate("/veg-bag");
    } catch (error) {
      console.error("Checkout failed:", error);
      setError(error.message || "Failed to process order.");
    }
  };

  // Fetch vegetables using axios
  useEffect(() => {
    setSelectedOffer(null);
    setSelectedVegetables([]);
    
    const fetchVegetables = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`
        );
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
  }, [setSelectedOffer, setSelectedVegetables]);

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="w-full max-w-7xl mx-auto mt-5 bg-white p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center md:justify-between gap-10 mb-8 pb-4 border-b-2 border-gray-100">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo(0, 0);
            }}
            className="flex items-center text-[#0e540b] hover:text-green-700 font-medium transition-colors font-poppins"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h2 className="text-2xl text-center sm:text-3xl font-bold text-[#0e540b] font-amiko">
            Select Your Vegetables
          </h2>
          <div className="w-20" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded font-assistant">
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
            <p className="text-gray-500 font-medium font-assistant">No vegetables available</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 mb-8">
              {vegetables.map((veg) => (
                <VegetableCard key={veg._id} veg={veg} />
              ))}
            </div>

            {/* Footer */}
            {getTotalItems() > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-50">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600 font-assistant">Total Items</p>
                    <p className="text-2xl font-bold text-[#0e540b] font-assistant">{getTotalItems()}</p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-[#0e540b] to-[#063a06] hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-poppins"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Continue to Checkout
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