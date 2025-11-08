import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiCheck, FiPlus } from "react-icons/fi";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";

const CustomizedVegetableSelection = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedWeights, setSelectedWeights] = useState({});
  const [animatingCards, setAnimatingCards] = useState({});
  const [popupAnimations, setPopupAnimations] = useState({});
  const {
    setVegetableOrder,
    vegetableOrder,
    navigate,
    setSelectedOffer,
    setSelectedVegetables,
  } = useOrderContext();

  const calculatePrice = async (orderItems) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/calculate-price`,
        {
          items: orderItems.map((item) => ({
            vegetableId: item.vegetableId || item.id,
            weight: item.weight,
            quantity: item.quantity,
          })),
        }
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from server");
      }

      const currentItems = Array.isArray(vegetableOrder)
        ? vegetableOrder
        : vegetableOrder?.items || [];

      const itemsWithImages = (response.data.data.items || []).map(
        (apiItem) => {
          const existingItem = currentItems.find(
            (item) => (item.vegetableId || item.id) === apiItem.vegetableId
          );
          return {
            ...apiItem,
            image: existingItem?.image || "/placeholder-vegetable.jpg",
            name: existingItem?.name || apiItem.name,
          };
        }
      );

      const completeOrderData = {
        items: itemsWithImages,
        summary: response.data.data.summary || {},
        timestamp: response.data.data.timestamp || new Date().toISOString(),
      };

      setVegetableOrder(completeOrderData);
      return completeOrderData;
    } catch (error) {
      console.error("❌ Error calculating price:", {
        error: error.response?.data || error.message,
      });
      throw error;
    }
  };

  const handleWeightChange = (vegetable, selectedWeight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [vegetable.name]: selectedWeight,
    }));
  };

  const handleVegetableSelect = (vegetable) => {
    const selectedWeight = selectedWeights[vegetable.name];
    if (!selectedWeight) return;

    const key = `${vegetable.name}-${selectedWeight}`;

    // Trigger popup animation
    setPopupAnimations((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setPopupAnimations((prev) => ({ ...prev, [key]: false }));
    }, 400);

    // Trigger card animation
    setAnimatingCards((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAnimatingCards((prev) => ({ ...prev, [key]: false }));
    }, 200);

    setVegetableOrder((prev) => {
      const currentItems = Array.isArray(prev) ? prev : prev?.items || [];
      const vegetableId = vegetable._id || vegetable.id;

      const existingIndex = currentItems.findIndex(
        (v) =>
          (v.vegetableId || v.id) === vegetableId && v.weight === selectedWeight
      );

      if (existingIndex !== -1) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += 1;
        return Array.isArray(prev) ? updated : { ...prev, items: updated };
      }

      const newItem = {
        id: vegetableId,
        vegetableId: vegetableId,
        name: vegetable.name,
        weight: selectedWeight,
        image: vegetable.image,
        quantity: 1,
      };

      const updatedItems = [...currentItems, newItem];
      return Array.isArray(prev)
        ? updatedItems
        : { ...prev, items: updatedItems };
    });
  };

  const isItemAdded = (vegetableName, weight) => {
    const items = Array.isArray(vegetableOrder)
      ? vegetableOrder
      : vegetableOrder?.items || [];
    return items.some((v) => v.name === vegetableName && v.weight === weight);
  };

  const handleAddAllSelected = () => {
    const newItems = [];
    vegetables.forEach((vegetable) => {
      const selectedWeight = selectedWeights[vegetable.name];
      if (!selectedWeight || isItemAdded(vegetable.name, selectedWeight))
        return;

      const weightOption = vegetable.weightOptions.find(
        (w) => w.weight === selectedWeight
      );
      if (!weightOption) return;

      const key = `${vegetable.name}-${selectedWeight}`;

      // Trigger popup animation
      setPopupAnimations((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setPopupAnimations((prev) => ({ ...prev, [key]: false }));
      }, 600);

      setAnimatingCards((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setAnimatingCards((prev) => ({ ...prev, [key]: false }));
      }, 400);

      const vegetableId = vegetable._id || vegetable.id;
      newItems.push({
        id: vegetableId,
        vegetableId: vegetableId,
        name: vegetable.name,
        weight: selectedWeight,
        price: weightOption.price,
        image: vegetable.image,
        quantity: 1,
      });
    });

    if (newItems.length > 0) {
      setVegetableOrder((prev) => {
        const currentItems = Array.isArray(prev) ? prev : prev?.items || [];
        return Array.isArray(prev)
          ? [...currentItems, ...newItems]
          : { ...prev, items: [...currentItems, ...newItems] };
      });
    }
  };

  const getSelectedNotAddedCount = () =>
    vegetables.filter((vegetable) => {
      const selectedWeight = selectedWeights[vegetable.name];
      return selectedWeight && !isItemAdded(vegetable.name, selectedWeight);
    }).length;

  const handleCheckout = async () => {
    try {
      const currentItems = Array.isArray(vegetableOrder)
        ? vegetableOrder
        : vegetableOrder?.items || [];
      if (!currentItems.length) {
        setError("Please select vegetables before proceeding");
        return;
      }

      const orderItems = currentItems.map((item) => ({
        id: item.vegetableId || item.id,
        vegetableId: item.vegetableId || item.id,
        weight: item.weight,
        quantity: item.quantity,
        image: item.image,
        name: item.name,
      }));

      const priceDetails = await calculatePrice(orderItems);
      localStorage.setItem("orderSummary", JSON.stringify(priceDetails));
      window.scrollTo(0, 0);
      navigate("/veg-bag");
    } catch (error) {
      console.error("Checkout failed:", error);
      setError(error.message || "Failed to process order.");
    }
  };

  useEffect(() => {
    setSelectedOffer(null);
    setSelectedVegetables([]);
    const fetchVegetables = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_SERVER_URL}/api/vegetables`
        );
        if (!response.ok) throw new Error("Failed to fetch vegetables");
        const result = await response.json();
        setVegetables(result.data || []);
      } catch {
        setError("Failed to load vegetables. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchVegetables();
  }, []);

  const getItemCount = () => {
    const items = Array.isArray(vegetableOrder)
      ? vegetableOrder
      : vegetableOrder?.items || [];
    return items.length;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-5xl mx-auto mt-5 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              window.history.back();
              window.scrollTo(0, 0);
            }}
            className="flex items-center text-[#0e540b] hover:text-green-700 text-sm font-medium font-poppins"
          >
            <FiArrowLeft size={18} className="mr-2" />
            Back to Offers
          </button>
          <h2 className="text-2xl font-bold text-[#0e540b] font-amiko">
            Select Your Vegetables
          </h2>
          <div className="w-20" />
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm font-medium font-assistant">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0e540b] border-t-transparent"></div>
            <p className="mt-4 text-[#0e540b] font-medium font-assistant">
              Loading vegetables...
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {vegetables.map((vegetable) => {
                const selectedWeight = selectedWeights[vegetable.name];
                const isAdded = selectedWeight
                  ? isItemAdded(vegetable.name, selectedWeight)
                  : false;
                const animationKey = `${vegetable.name}-${
                  selectedWeight || ""
                }`;
                const isAnimating = animatingCards[animationKey];
                const showPopup = popupAnimations[animationKey];

                return (
                  <div
                    key={vegetable._id || vegetable.name}
                    className={`p-4 rounded-lg border-2 text-center relative transition-all transform hover:scale-105 ${
                      isAdded
                        ? "bg-green-50 border-[#0e540b] shadow-md"
                        : selectedWeight
                        ? "bg-white border-gray-300 hover:border-green-300 shadow-sm"
                        : "bg-white border-gray-300 hover:border-green-300"
                    } ${
                      isAnimating
                        ? "animate-add-to-cart animate-pulse-border"
                        : ""
                    }`}
                  >
                    {/* Tick Mark Badge */}
                    {isAdded && (
                      <div className="absolute -top-2 -right-2 z-10 bg-[#0e540b] rounded-full p-1.5 shadow-lg">
                        <FiCheck size={16} className="text-white" />
                      </div>
                    )}

                    {/* Popup Animation */}
                    {showPopup && (
                      <div className="absolute top-1/2 left-1/2 z-20 popup-animation">
                        <div className="bg-[#0e540b] text-white rounded-full p-3 shadow-2xl">
                          <FiCheck size={24} className="font-bold" />
                        </div>
                      </div>
                    )}

                    <img
                      src={vegetable.image}
                      alt={vegetable.name}
                      className="w-20 h-20 font-semibold object-cover mx-auto rounded-2xl mb-2"
                    />
                    <p className="font-medium text-sm text-gray-800 mb-2 font-assistant">
                      {vegetable.name}
                    </p>

                    {/* Dropdown */}
                    <div className="relative mb-2">
                      <select
                        value={selectedWeights[vegetable.name] || ""}
                        onChange={(e) =>
                          handleWeightChange(vegetable, e.target.value)
                        }
                        className={`w-full text-xs font-semibold appearance-none rounded-lg px-3 py-2 pr-8 border-2 transition-all duration-200 font-assistant
                          ${
                            selectedWeights[vegetable.name]
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 border-[#0e540b] text-[#0e540b] shadow-sm"
                              : "bg-white border-green-200 text-gray-500 hover:border-green-400"
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-300`}
                      >
                        <option value="">Choose Weight</option>
                        {vegetable.weightOptions?.map((option) => (
                          <option key={option.weight} value={option.weight}>
                            {option.weight} - ₹{option.price}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-[#0e540b]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleVegetableSelect(vegetable)}
                      disabled={!selectedWeights[vegetable.name]}
                      className={`w-full text-xs font-bold rounded-lg px-3 py-1.5 flex items-center justify-center gap-1 transition-all font-poppins ${
                        isAdded
                          ? "bg-[#0e540b] text-white"
                          : selectedWeights[vegetable.name]
                          ? "bg-[#0e540b] hover:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <FiCheck size={14} /> Added
                        </>
                      ) : (
                        <>
                          <FiPlus size={14} /> Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {getSelectedNotAddedCount() > 0 && (
                <button
                  onClick={handleAddAllSelected}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-[#0e540b] bg-green-100 border-2 border-[#0e540b] hover:bg-green-200 transition transform hover:scale-105 flex items-center justify-center gap-2 font-poppins"
                >
                  <FiPlus size={18} /> Add All Selected (
                  {getSelectedNotAddedCount()})
                </button>
              )}
              {getItemCount() > 0 ? (
                <button
                  onClick={handleCheckout}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white bg-[#0e540b] hover:bg-green-700 transition transform hover:scale-105 font-poppins"
                >
                  Continue to Payment ({getItemCount()} items)
                </button>
              ) : (
                <p className="text-sm text-gray-500 font-assistant">
                  Please add vegetables to proceed
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomizedVegetableSelection;
