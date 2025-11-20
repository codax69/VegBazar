import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle,
  Edit,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import axios from "axios";
import RazorpayPayment from "./RazorpayPayment";

const VegetableCart = () => {
  const {
    vegetableOrder,
    setVegetableOrder,
    formData,
    navigate,
    setPaymentMethod,
    paymentMethod,
    setIsOrderPlaced,
  } = useOrderContext();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderCount, setOrderCount] = useState(1);

  // Helper function to extract items array from vegetableOrder
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order)) return order;
    if (order.items && Array.isArray(order.items)) return order.items;
    return [];
  };

  // Helper function to get summary
  const getOrderSummary = (order) => {
    if (order && typeof order === "object" && order.summary) {
      return order.summary;
    }
    return null;
  };

  const items = getOrderItems(vegetableOrder);
  const summary = getOrderSummary(vegetableOrder);

  // Create userSavedAddress from formData
  const userSavedAddress = formData?.address
    ? {
        label: formData.name || "My Address",
        name: formData.name || "",
        mobile: formData.mobile || "",
        address: formData.address,
        area: formData.area,
        city: formData.city,
      }
    : null;

  // Fetch order count on component mount
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/orders`
        );
        setOrderCount(response.data.data.count + 1);
        console.log("📊 Next order count:", response.data.data.count + 1);
      } catch (error) {
        console.error("❌ Error fetching order count:", error);
      }
    };

    fetchOrderCount();
  }, []);

  // Load cart from localStorage only if vegetableOrder is empty/null
  useEffect(() => {
    const currentItems = getOrderItems(vegetableOrder);
    if (!currentItems || currentItems.length === 0) {
      const savedSummary = localStorage.getItem("orderSummary");

      if (savedSummary) {
        try {
          const parsedSummary = JSON.parse(savedSummary);
          if (
            parsedSummary &&
            parsedSummary.items &&
            parsedSummary.items.length > 0
          ) {
            const normalizedItems = parsedSummary.items.map((item) => ({
              ...item,
              vegetableId: item.vegetableId || item.id,
              id: item.id || item.vegetableId,
              image: item.image || "/placeholder-vegetable.jpg",
              name: item.name,
              weight: item.weight,
              quantity: item.quantity,
              pricePerUnit: item.pricePerUnit || item.price || 0,
              marketPrice: item.marketPrice || 0,
              selectedWeightPrice: item.selectedWeightPrice || {},
              totalPrice: item.totalPrice || 0,
            }));

            setVegetableOrder({
              ...parsedSummary,
              items: normalizedItems,
            });
            console.log(
              "✅ Loaded cart from localStorage:",
              normalizedItems.length,
              "items"
            );
            return;
          }
        } catch (error) {
          console.error("❌ Error loading summary from localStorage:", error);
          localStorage.removeItem("orderSummary");
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever vegetableOrder changes
  useEffect(() => {
    const currentItems = getOrderItems(vegetableOrder);
    if (currentItems && currentItems.length >= 0) {
      const normalizedItems = currentItems.map((item) => ({
        ...item,
        vegetableId: item.vegetableId || item.id,
        id: item.id || item.vegetableId,
        image: item.image || "/placeholder-vegetable.jpg",
        name: item.name,
        weight: item.weight,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit || item.price || 0,
        marketPrice: item.marketPrice || 0,
        selectedWeightPrice: item.selectedWeightPrice || {},
        totalPrice: item.totalPrice || 0,
      }));

      if (
        vegetableOrder &&
        typeof vegetableOrder === "object" &&
        vegetableOrder.summary
      ) {
        const normalizedOrder = {
          ...vegetableOrder,
          items: normalizedItems,
        };
        localStorage.setItem("orderSummary", JSON.stringify(normalizedOrder));
      } else if (normalizedItems.length > 0) {
        localStorage.setItem(
          "orderSummary",
          JSON.stringify({
            items: normalizedItems,
            summary: {},
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  }, [vegetableOrder]);

  const deliveryCharge = 20;

  // Generate Order ID
  const generateOrderId = (orderCount) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const orderNum = String(orderCount).padStart(3, "0");

    return `ORD${year}${month}${day}${orderNum}`;
  };

  const calculateTotal = () => {
    const currentItems = getOrderItems(vegetableOrder);
    return currentItems.reduce((total, item) => {
      const price =
        parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const subtotal = summary?.subtotal || calculateTotal();
  const total = summary?.totalAmount || subtotal + deliveryCharge;

  const calculatePrice = async (orderItems) => {
    try {
      const normalizedItems = orderItems.map((item) => ({
        vegetableId: item.vegetableId || item.id,
        weight: item.weight,
        quantity: item.quantity,
      }));

      console.log("📤 Calculating prices for items:", normalizedItems);

      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/calculate-price`,
        { items: normalizedItems }
      );

      console.log("✅ Price calculation response:", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Error calculating price:", error);
      throw error;
    }
  };

  const updateQuantity = async (index, change) => {
    try {
      const currentItems = getOrderItems(vegetableOrder);
      const newQuantity = currentItems[index].quantity + change;

      if (newQuantity <= 0) {
        await removeItem(index);
        return;
      }

      const updatedItems = [...currentItems];
      updatedItems[index] = { ...updatedItems[index], quantity: newQuantity };

      const updatedPrices = await calculatePrice(updatedItems);
      const itemsWithPrices = updatedItems.map((item) => {
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
            image: item.image,
            name: item.name,
            selectedWeightPrice: item.selectedWeightPrice || {},
          };
        }
        return item;
      });

      if (Array.isArray(vegetableOrder)) {
        setVegetableOrder(itemsWithPrices);
      } else {
        setVegetableOrder({
          items: itemsWithPrices,
          summary: updatedPrices.summary || {},
          timestamp: updatedPrices.timestamp || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("❌ Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const removeItem = async (index) => {
    try {
      const currentItems = getOrderItems(vegetableOrder);
      const updatedItems = currentItems.filter((_, i) => i !== index);

      if (updatedItems.length > 0) {
        const updatedPrices = await calculatePrice(updatedItems);

        const itemsWithPrices = updatedItems.map((item) => {
          const calculatedItem = updatedPrices.items.find(
            (i) =>
              i.vegetableId === (item.id || item.vegetableId) &&
              i.weight === item.weight
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
              image: item.image,
              name: item.name,
              selectedWeightPrice: item.selectedWeightPrice || {},
            };
          }
          return item;
        });

        if (Array.isArray(vegetableOrder)) {
          setVegetableOrder(itemsWithPrices);
        } else {
          setVegetableOrder({
            items: itemsWithPrices,
            summary: updatedPrices.summary || {},
            timestamp: updatedPrices.timestamp || new Date().toISOString(),
          });
        }
      } else {
        setVegetableOrder([]);
        localStorage.removeItem("orderSummary");
      }
    } catch (error) {
      console.error("❌ Failed to remove item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = async () => {
    try {
      const currentItems = getOrderItems(vegetableOrder);

      // Debug: Log current cart state
      console.log("🛒 Current cart items:", currentItems.length);
      currentItems.forEach((item, idx) => {
        console.log(`Item ${idx + 1}:`, {
          name: item.name,
          id: item.id,
          vegetableId: item.vegetableId,
          weight: item.weight,
          quantity: item.quantity,
        });
      });

      if (!selectedAddress || !paymentMethod) {
        alert("Please select both delivery address and payment method");
        return;
      }

      if (!formData.name || !formData.mobile || !formData.address) {
        alert("Please complete your customer information first");
        navigate("/customer-info");
        return;
      }

      // Normalize all items first to ensure consistent ID fields
      const normalizedItems = currentItems.map((item) => ({
        ...item,
        vegetableId: item.vegetableId || item.id,
        id: item.id || item.vegetableId,
      }));

      console.log(
        "🔍 Normalized items before merge:",
        normalizedItems.map((i) => ({
          id: i.vegetableId || i.id,
          name: i.name,
          weight: i.weight,
          qty: i.quantity,
        }))
      );

      // Check for duplicates: merge ONLY if same ID AND same weight
      const uniqueVegetables = normalizedItems.reduce((acc, item) => {
        const vegetableId = item.vegetableId || item.id;
        const weight = item.weight;

        if (!vegetableId) {
          console.warn("⚠️ Skipping item without ID:", item);
          return acc;
        }

        // Find existing item with BOTH same ID and same weight
        const existingIndex = acc.findIndex((v) => {
          const existingId = v.vegetableId || v.id;
          return existingId === vegetableId && v.weight === weight;
        });

        if (existingIndex >= 0) {
          // Merge: same ID + same weight
          console.log(
            `🔄 Merging ${item.name} (${weight}): ${acc[existingIndex].quantity} + ${item.quantity}`
          );
          acc[existingIndex].quantity += item.quantity;
          // Recalculate price
          const pricePerUnit =
            parseFloat(acc[existingIndex].pricePerUnit) ||
            parseFloat(acc[existingIndex].price) ||
            0;
          acc[existingIndex].totalPrice =
            pricePerUnit * acc[existingIndex].quantity;
        } else {
          // Keep separate: different ID or different weight
          // console.log(`➕ Adding ${item.name} (${weight}) as separate item`);
          acc.push({
            ...item,
            vegetableId: vegetableId,
            id: vegetableId,
          });
        }

        return acc;
      }, []);

      // console.log(
      //   "✅ Final unique vegetables:",
      //   uniqueVegetables.map((i) => ({
      //     id: i.vegetableId || i.id,
      //     name: i.name,
      //     weight: i.weight,
      //     qty: i.quantity,
      //   }))
      // );

      // Update cart if duplicates were merged
      if (uniqueVegetables.length !== normalizedItems.length) {
        console.log(
          `🔄 Merging ${
            normalizedItems.length - uniqueVegetables.length
          } duplicate item(s)`
        );
        if (Array.isArray(vegetableOrder)) {
          setVegetableOrder(uniqueVegetables);
        } else {
          setVegetableOrder({ ...vegetableOrder, items: uniqueVegetables });
        }
      }

      // Recalculate prices with merged items
      const priceDetails = await calculatePrice(uniqueVegetables);

      const currentSummary = getOrderSummary(vegetableOrder);
      const subtotalAmount =
        currentSummary?.subtotal ||
        priceDetails?.summary?.subtotal ||
        calculateTotal();
      const deliveryCharges =
        currentSummary?.deliveryCharges ||
        priceDetails?.summary?.deliveryCharges ||
        deliveryCharge;
      const totalAmount =
        currentSummary?.totalAmount ||
        priceDetails?.summary?.totalAmount ||
        subtotalAmount + deliveryCharges;

      const orderId = generateOrderId(orderCount);

      const orderData = {
        orderId: orderId,
        orderType: "custom",
        customerInfo: formData,
        selectedVegetables: uniqueVegetables.map((item) => {
          const vegetableId = item.vegetableId || item.id;
          const pricePerUnit =
            parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;

          // console.log(
          //   `📦 Mapping vegetable: ${item.name}, ID: ${vegetableId}, Weight: ${item.weight}, Qty: ${item.quantity}`
          // );

          return {
            vegetable: vegetableId,
            weight: item.weight,
            quantity: item.quantity,
            pricePerUnit: pricePerUnit,
            subtotal: pricePerUnit * item.quantity,
            isFromBasket: false,
          };
        }),
        vegetablesTotal: subtotalAmount,
        deliveryCharges: deliveryCharges,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
        orderDate: new Date().toISOString(),
      };

      // console.log(
      //   "📤 Order Data being sent:",
      //   JSON.stringify(orderData, null, 2)
      // );
      // console.log(
      //   `📊 Sending ${uniqueVegetables.length} unique vegetables to backend`
      // );
      // console.log(
      //   "🆔 Vegetable IDs being sent:",
      //   uniqueVegetables.map((v) => ({
      //     id: v.vegetableId || v.id,
      //     name: v.name,
      //     weight: v.weight,
      //     qty: v.quantity,
      //   }))
      // );

      if (paymentMethod === "COD") {
        const response = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
          orderData
        );
        console.log("✅ Order created successfully:", response.data);
        localStorage.removeItem("orderSummary");
      }

      if (paymentMethod === "COD") {
        setIsOrderPlaced(true);
        window.scrollTo(0, 0);
        navigate("/order-confirmation");
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error(
        "❌ Error details:",
        error.response?.data?.message || error.message
      );

      const errorMessage = error.response?.data?.message || error.message;

      // Specific error handling for "vegetables not found"
      if (
        errorMessage.includes("vegetables not found") ||
        errorMessage.includes("Expected")
      ) {
        const sentIds = uniqueVegetables.map((v) => v.vegetableId || v.id);
        console.error("❌ Sent vegetable IDs:", sentIds);
        console.error(
          "❌ Vegetables data:",
          uniqueVegetables.map((v) => ({
            id: v.vegetableId || v.id,
            name: v.name,
            weight: v.weight,
          }))
        );

        alert(
          `Order Error: ${errorMessage}\n\nSent ${uniqueVegetables.length} vegetables but backend found less.\n\nThis usually means some items no longer exist in the database. Please try:\n1. Refreshing the vegetables page\n2. Clearing your cart and re-adding items\n3. Contacting support if the issue persists`
        );
      } else {
        alert(`Failed to create order: ${errorMessage}`);
      }

      if (error.response?.status >= 500) {
        navigate("/order-failed");
      }
    }
  };

  const isCheckoutDisabled = !selectedAddress || !paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50 pb-14 lg:pb-0">
      <div className="container mx-auto px-4 md:py-4 lg:py-3">
        {/* Header - Compact on desktop */}
        <div className="mb-4 md:mb-3">
          <div className="flex gap-1 flex-col items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 px-3 py-1.5 md:py-1 text-green-700 hover:bg-green-50 rounded-lg transition font-assistant text-sm font-semibold"
            >
              <ArrowLeft size={16} className="mr-1" />
              Continue Shopping
            </button>
            <h2 className="font-amiko text-xl md:text-lg lg:text-base font-bold text-green-700 flex items-center gap-1 sm:gap-2">
              <ShoppingBag size={20} className="md:w-4 md:h-4" />
              Your Vegetable Bag
            </h2>
          </div>
        </div>

        {/* Main Content */}
        {items.length === 0 ? (
          <div className="bg-white p-8 md:p-6 rounded-lg shadow-md text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-poppins text-lg md:text-base font-semibold text-gray-600 mb-1">
              Your cart is empty
            </h3>
            <p className="font-assistant text-gray-500 mb-4 text-sm">
              Add fresh vegetables to get started!
            </p>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/");
              }}
              className="font-assistant px-4 py-2 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-800 transition"
            >
              Browse Vegetables
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-3 md:gap-2.5">
            {/* Left Side - Cart Items */}
            <div className="flex-1 lg:w-2/3 space-y-3 md:space-y-2.5">
              {/* Mobile Bill Summary - Top */}
              <div className="lg:hidden bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-poppins text-base font-bold text-gray-800 mb-3 border-b pb-2">
                  Bill Summary
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-gray-600">
                      Subtotal
                    </span>
                    <span className="font-assistant font-semibold text-gray-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-gray-600">
                      Delivery Charge
                    </span>
                    <span className="font-assistant font-semibold text-gray-800">
                      ₹{(summary?.deliveryCharges || deliveryCharge).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins font-bold text-gray-800">
                        Total Amount
                      </span>
                      <span className="font-amiko font-bold text-green-700 text-lg">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {isCheckoutDisabled && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-assistant text-xs text-orange-700 font-semibold">
                      ⚠️ Please select delivery address and payment method below
                      to proceed
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Address - Compact on desktop */}
              <div className="bg-white p-4 md:p-3 rounded-lg shadow-md">
                <h3 className="font-poppins text-base md:text-sm font-bold text-gray-800 mb-3 md:mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-green-700 md:w-4 md:h-4" />
                  Delivery Address
                </h3>

                {!userSavedAddress ? (
                  <div className="text-center py-6 md:py-4">
                    <MapPin
                      size={48}
                      className="mx-auto text-gray-300 mb-3 md:w-10 md:h-10"
                    />
                    <p className="font-assistant text-gray-600 mb-4 text-sm md:text-xs">
                      No delivery address added yet
                    </p>
                    <button
                      onClick={() => navigate("/customer-info")}
                      className="font-assistant px-5 py-2.5 md:px-4 md:py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-sm md:text-xs font-semibold inline-flex items-center gap-2"
                    >
                      <Plus size={16} className="md:w-3.5 md:h-3.5" />
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-1.5">
                    <label
                      className={`flex gap-3 md:gap-2 p-3 md:p-2.5 rounded-lg border-2 cursor-pointer transition ${
                        selectedAddress === "saved"
                          ? "border-green-700 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value="saved"
                        checked={selectedAddress === "saved"}
                        onChange={() => setSelectedAddress("saved")}
                        className="mt-0.5 w-4 h-4 md:w-3.5 md:h-3.5 text-green-700 focus:ring-green-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 md:mb-1">
                          <span className="font-poppins font-semibold text-gray-800 text-sm md:text-xs">
                            {userSavedAddress.name}
                          </span>
                          {selectedAddress === "saved" && (
                            <CheckCircle
                              size={16}
                              className="text-green-700 md:w-3.5 md:h-3.5"
                            />
                          )}
                        </div>
                        <p className="font-assistant text-xs md:text-[11px] text-gray-600 mb-0.5">
                          {userSavedAddress.mobile}
                        </p>
                        <p className="font-assistant text-xs md:text-[11px] text-gray-700 leading-relaxed">
                          {userSavedAddress.address}, {userSavedAddress.area},{" "}
                          {userSavedAddress.city}
                        </p>
                      </div>
                    </label>

                    <button
                      onClick={() => navigate("/customer-info")}
                      className="font-assistant w-full px-4 py-2 md:px-3 md:py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm md:text-xs font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Edit size={14} className="md:w-3.5 md:h-3.5" />
                      Edit Address
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items - Compact on desktop */}
              <div className="bg-white p-3 md:p-2.5 rounded-lg shadow-md">
                <h3 className="font-poppins text-base md:text-sm font-bold text-gray-800 mb-2 md:mb-1.5 border-b pb-1.5 md:pb-1">
                  Order Items ({items.length} items,{" "}
                  {items.reduce((sum, item) => sum + item.quantity, 0)} total
                  quantity)
                </h3>
                <div className="space-y-2.5 md:space-y-2">
                  {items.map((item, index) => {
                    const itemPrice =
                      parseFloat(item.pricePerUnit) ||
                      parseFloat(item.price) ||
                      0;
                    const itemTotal =
                      parseFloat(item.totalPrice) || itemPrice * item.quantity;
                    const selectedWeightPrice = item.selectedWeightPrice || {};
                    const weightPriceDisplay = Object.entries(
                      selectedWeightPrice
                    )
                      .map(
                        ([weight, price]) =>
                          `${weight}: ₹${parseFloat(price).toFixed(2)}`
                      )
                      .join(", ");
                    const selectedWeightValue =
                      selectedWeightPrice[item.weight];
                    const marketPriceForWeight = selectedWeightValue
                      ? parseFloat(selectedWeightValue)
                      : null;

                    return (
                      <div
                        key={`${item.vegetableId || item.id}-${
                          item.weight
                        }-${index}`}
                        className="flex gap-2.5 md:gap-2 p-2.5 md:p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition"
                      >
                        <img
                          src={item.image || "/placeholder-vegetable.jpg"}
                          alt={item.name}
                          className="w-14 h-14 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "/placeholder-vegetable.jpg";
                          }}
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-assistant font-semibold text-gray-800 text-sm md:text-xs">
                              {item.name} ({item.weight})
                            </h4>

                            {weightPriceDisplay && (
                              <p className="font-assistant text-[10px] md:text-[9px] text-gray-500 mt-0.5">
                                Selected: {weightPriceDisplay}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 md:gap-1 mt-0.5">
                              <p className="font-assistant text-sm md:text-xs font-semibold text-green-700">
                                ₹{itemPrice.toFixed(2)} per {item.weight}
                              </p>

                              {marketPriceForWeight &&
                                marketPriceForWeight > itemPrice && (
                                  <p className="font-assistant text-xs md:text-[10px] line-through text-gray-400">
                                    ₹{marketPriceForWeight.toFixed(2)}
                                  </p>
                                )}
                            </div>

                            {marketPriceForWeight &&
                              marketPriceForWeight > itemPrice && (
                                <p className="font-assistant text-[10px] md:text-[9px] text-green-600 font-semibold mt-0.5">
                                  Save ₹
                                  {(marketPriceForWeight - itemPrice).toFixed(
                                    2
                                  )}{" "}
                                  per {item.weight}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center justify-between mt-1.5 md:mt-1">
                            <div className="flex items-center gap-1.5 md:gap-1">
                              <button
                                onClick={() => updateQuantity(index, -1)}
                                className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition"
                              >
                                <Minus
                                  size={12}
                                  className="text-gray-700 md:w-2.5 md:h-2.5"
                                />
                              </button>
                              <span className="font-assistant font-semibold text-gray-800 text-sm md:text-xs w-7 md:w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(index, 1)}
                                className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center bg-green-700 hover:bg-green-800 rounded-full transition"
                              >
                                <Plus
                                  size={12}
                                  className="text-white md:w-2.5 md:h-2.5"
                                />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 md:gap-1.5">
                              <p className="font-assistant font-bold text-gray-800 text-sm md:text-xs">
                                ₹{itemTotal.toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 md:p-0.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Remove item"
                              >
                                <Trash2
                                  size={14}
                                  className="md:w-3.5 md:h-3.5"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selection - Compact on desktop */}
              <div className="bg-white p-4 md:p-3 rounded-lg shadow-md">
                <h3 className="font-poppins text-base md:text-sm font-bold text-gray-800 mb-3 md:mb-2 flex items-center gap-2">
                  <CreditCard
                    size={18}
                    className="text-green-700 md:w-4 md:h-4"
                  />
                  Select Payment Method
                </h3>
                <div className="space-y-2.5 md:space-y-2">
                  <label
                    className={`flex items-center gap-3 md:gap-2 p-3 md:p-2.5 rounded-lg border-2 cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 md:w-3.5 md:h-3.5 text-green-700 focus:ring-green-700"
                    />
                    <Banknote
                      size={22}
                      className="text-gray-600 md:w-5 md:h-5"
                    />
                    <div className="flex-1">
                      <p className="font-poppins font-semibold text-gray-800 text-sm md:text-xs">
                        Cash on Delivery
                      </p>
                      <p className="font-assistant text-xs md:text-[10px] text-gray-600">
                        Pay when you receive
                      </p>
                    </div>
                    {paymentMethod === "COD" && (
                      <CheckCircle
                        size={18}
                        className="text-green-700 md:w-4 md:h-4"
                      />
                    )}
                  </label>

                  <label
                    className={`flex items-center gap-3 md:gap-2 p-3 md:p-2.5 rounded-lg border-2 cursor-pointer transition ${
                      paymentMethod === "ONLINE"
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 md:w-3.5 md:h-3.5 text-green-700 focus:ring-green-700"
                    />
                    <CreditCard
                      size={22}
                      className="text-gray-600 md:w-5 md:h-5"
                    />
                    <div className="flex-1">
                      <p className="font-poppins font-semibold text-gray-800 text-sm md:text-xs">
                        Online Payment
                      </p>
                      <p className="font-assistant text-xs md:text-[10px] text-gray-600">
                        UPI, Card, Net Banking
                      </p>
                    </div>
                    {paymentMethod === "ONLINE" && (
                      <CheckCircle
                        size={18}
                        className="text-green-700 md:w-4 md:h-4"
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side - Price Summary - Desktop Only - More Compact */}
            <div className="lg:w-1/3 hidden lg:block">
              <div className="bg-white p-3 rounded-lg shadow-md lg:sticky lg:top-4">
                <h3 className="font-poppins text-sm font-bold text-gray-800 mb-2.5 border-b pb-1.5">
                  Price Summary
                </h3>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-xs text-gray-600">
                      Subtotal
                    </span>
                    <span className="font-assistant font-semibold text-gray-800 text-sm">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-xs text-gray-600">
                      Delivery Charge
                    </span>
                    <span className="font-assistant font-semibold text-gray-800 text-sm">
                      ₹{(summary?.deliveryCharges || deliveryCharge).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins font-bold text-gray-800 text-sm">
                        Total Amount
                      </span>
                      <span className="font-amiko font-bold text-green-700 text-base">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {isCheckoutDisabled && (
                  <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-assistant text-[10px] text-orange-700 font-semibold">
                      ⚠️ Please select delivery address and payment method to
                      proceed
                    </p>
                  </div>
                )}

                {paymentMethod === "ONLINE" ? (
                  <RazorpayPayment
                    orderType="custom"
                    vegetableOrder={vegetableOrder}
                  />
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckoutDisabled}
                    className={`font-assistant w-full py-2 rounded-lg font-bold text-sm transition transform shadow-md ${
                      isCheckoutDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800 hover:scale-[1.02]"
                    }`}
                  >
                    {isCheckoutDisabled ? "Complete Selection" : "Place Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Payment Button */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="px-4 py-3">
            {paymentMethod === "ONLINE" ? (
              <div className="w-full">
                <RazorpayPayment
                  orderType="custom"
                  vegetableOrder={vegetableOrder}
                />
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
                className={`font-assistant w-full py-3 rounded-lg font-bold text-sm transition shadow-lg active:scale-95 ${
                  isCheckoutDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-700 text-white hover:bg-green-800"
                }`}
              >
                {isCheckoutDisabled
                  ? "Complete Selection to Proceed"
                  : `Place Order • ₹${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VegetableCart;
