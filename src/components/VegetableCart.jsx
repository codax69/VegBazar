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
  const userSavedAddress = formData?.address ? {
    label: formData.name || "My Address",
    name: formData.name || "",
    mobile: formData.mobile || "",
    address: formData.address,
    area:formData.area,
    city:formData.city
  } : null;

  // Fetch order count on component mount
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/today/orders`
        );
        setOrderCount(response.data.data.count + 1);
        console.log(orderCount)
      } catch (error) {
        console.error("Error fetching order count:", error);
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
            const normalizedItems = parsedSummary.items.map(item => ({
              ...item,
              vegetableId: item.vegetableId || item.id,
              id: item.id || item.vegetableId,
              image: item.image || '/placeholder-vegetable.jpg',
              name: item.name,
              weight: item.weight,
              quantity: item.quantity,
              pricePerUnit: item.pricePerUnit || item.price || 0,
              totalPrice: item.totalPrice || 0
            }));
            
            setVegetableOrder({
              ...parsedSummary,
              items: normalizedItems
            });
            return;
          }
        } catch (error) {
          console.error("Error loading summary from localStorage:", error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever vegetableOrder changes
  useEffect(() => {
    const currentItems = getOrderItems(vegetableOrder);
    if (currentItems && currentItems.length >= 0) {
      const normalizedItems = currentItems.map(item => ({
        ...item,
        vegetableId: item.vegetableId || item.id,
        id: item.id || item.vegetableId,
        image: item.image || '/placeholder-vegetable.jpg',
        name: item.name,
        weight: item.weight,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit || item.price || 0,
        totalPrice: item.totalPrice || 0
      }));

      if (
        vegetableOrder &&
        typeof vegetableOrder === "object" &&
        vegetableOrder.summary
      ) {
        const normalizedOrder = {
          ...vegetableOrder,
          items: normalizedItems
        };
        localStorage.setItem("orderSummary", JSON.stringify(normalizedOrder));
      } else if (normalizedItems.length > 0) {
        localStorage.setItem("orderSummary", JSON.stringify({
          items: normalizedItems,
          summary: {},
          timestamp: new Date().toISOString()
        }));
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
      const normalizedItems = orderItems.map(item => ({
        vegetableId: item.vegetableId || item.id,
        weight: item.weight,
        quantity: item.quantity,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/calculate-price`,
        { items: normalizedItems }
      );

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
          (i) => i.vegetableId === (item.id || item.vegetableId)
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
            name: item.name
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
      console.error("Failed to update prices:", error);
      alert("Failed to update prices. Please try again.");
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
            (i) => i.vegetableId === (item.id || item.vegetableId)
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
              name: item.name
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
      console.error("Failed to update prices:", error);
      alert("Failed to update prices. Please try again.");
    }
  };

  const handleCheckout = async () => {
    try {
      const currentItems = getOrderItems(vegetableOrder);

      if (!selectedAddress || !paymentMethod) {
        alert("Please select both delivery address and payment method");
        return;
      }

      if (!formData.name || !formData.mobile || !formData.address) {
        alert("Please complete your customer information first");
        navigate("/customer-info");
        return;
      }

      const uniqueVegetables = currentItems.reduce((acc, item) => {
        const vegetableId = item.id || item.vegetableId;
        const weight = item.weight;

        if (!vegetableId) {
          console.warn("⚠️ Skipping item without ID:", item);
          return acc;
        }

        const existingIndex = acc.findIndex(
          (v) => (v.id || v.vegetableId) === vegetableId && v.weight === weight
        );

        if (existingIndex >= 0) {
          acc[existingIndex].quantity += item.quantity;
        } else {
          acc.push(item);
        }

        return acc;
      }, []);

      if (uniqueVegetables.length !== currentItems.length) {
        if (Array.isArray(vegetableOrder)) {
          setVegetableOrder(uniqueVegetables);
        } else {
          setVegetableOrder({ ...vegetableOrder, items: uniqueVegetables });
        }
        alert(
          `Merged ${
            currentItems.length - uniqueVegetables.length
          } duplicate item(s)`
        );
      }
      
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
          const vegetableId = item.id || item.vegetableId;
          const pricePerUnit =
            parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;

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

      if (paymentMethod === "COD") {
        // eslint-disable-next-line no-unused-vars
        const response = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
          orderData
        );
        localStorage.removeItem("orderSummary");
      }

      if (paymentMethod === "COD") {
        setIsOrderPlaced(true);
        window.scrollTo(0,0)
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
      alert(`Failed to create order: ${errorMessage}`);

      if (error.response?.status >= 500) {
        navigate("/order-failed");
      }
    }
  };

  const isCheckoutDisabled = !selectedAddress || !paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex gap-1 flex-col items-center justify-between">
            <button
              onClick={() => navigate("/vegetables")}
              className="flex items-center gap-1 px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition font-assistant text-sm font-semibold"
            >
              <ArrowLeft size={16} className="mr-1" />
              Continue Shopping
            </button>
            <h2 className="font-amiko text-xl sm:text-xl font-bold text-green-700 flex items-center gap-1 sm:gap-2">
              <ShoppingBag size={22} />
              Your Vegetable Bag
            </h2>
          </div>
        </div>

        {/* Main Content */}
        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-poppins text-lg font-semibold text-gray-600 mb-1">
              Your cart is empty
            </h3>
            <p className="font-assistant text-gray-500 mb-4 text-sm">
              Add fresh vegetables to get started!
            </p>
            <button
              onClick={() => window.history.back()}
              className="font-assistant px-4 py-2 bg-green-700 text-white rounded-lg font-semibold text-sm hover:bg-green-800 transition"
            >
              Browse Vegetables
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Side - Cart Items */}
            <div className="flex-1 lg:w-2/3 space-y-4">
              {/* Cart Items */}
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                <h3 className="font-poppins text-base sm:text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                  Order Items ({items.length} items,{" "}
                  {items.reduce((sum, item) => sum + item.quantity, 0)} total
                  quantity)
                </h3>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const itemPrice =
                      parseFloat(item.pricePerUnit) ||
                      parseFloat(item.price) ||
                      0;
                    const itemTotal =
                      parseFloat(item.totalPrice) || itemPrice * item.quantity;

                    const sameVegetableDifferentWeight =
                      items.filter(
                        (v, i) =>
                          i !== index &&
                          v.name === item.name &&
                          v.weight !== item.weight
                      ).length > 0;

                    return (
                      <div
                        key={`${item.name}-${item.weight}-${index}`}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition"
                      >
                        <img
                          src={item.image || '/placeholder-vegetable.jpg'}
                          alt={item.name}
                          className="md:w-20 md:h-20 w-14 h-14 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = '/placeholder-vegetable.jpg';
                          }}
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-assistant font-semibold text-gray-800 text-sm sm:text-base">
                                {item.name}
                              </h4>
                              {sameVegetableDifferentWeight && (
                                <span className="font-assistant px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                                  Multiple weights
                                </span>
                              )}
                            </div>
                            <p className="font-assistant text-xs sm:text-sm text-gray-600 font-semibold">
                              Weight: {item.weight}
                            </p>
                            <p className="font-assistant text-sm font-semibold text-green-700">
                              ₹{itemPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center md:gap-2">
                              <button
                                onClick={() => updateQuantity(index, -1)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition"
                              >
                                <Minus size={12} className="text-gray-700" />
                              </button>
                              <span className="font-assistant font-semibold text-gray-800 text-sm w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(index, 1)}
                                className="w-7 h-7 flex items-center justify-center bg-green-700 hover:bg-green-800 rounded-full transition"
                              >
                                <Plus size={12} className="text-white" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-assistant font-bold text-gray-800 text-sm sm:text-base">
                                ₹{itemTotal.toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address Selection - IMPROVED */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-poppins text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-green-700" />
                  Delivery Address
                </h3>

                {!userSavedAddress ? (
                  <div className="text-center py-6">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-assistant text-gray-600 mb-4 text-sm">
                      No delivery address added yet
                    </p>
                    <button
                      onClick={() => navigate("/customer-info")}
                      className="font-assistant px-5 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Saved Address Radio Option */}
                    <label
                      className={`flex gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
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
                        className="mt-1 w-4 h-4 text-green-700 focus:ring-green-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-poppins font-semibold text-gray-800 text-sm">
                            {userSavedAddress.name}
                          </span>
                          {selectedAddress === "saved" && (
                            <CheckCircle size={18} className="text-green-700" />
                          )}
                        </div>
                        <p className="font-assistant text-xs text-gray-600 mb-1">
                          {userSavedAddress.mobile}
                        </p>
                        <p className="font-assistant text-xs text-gray-700 leading-relaxed">
                          {userSavedAddress.address},{userSavedAddress.area},{userSavedAddress.city}
                        </p>
                      </div>
                    </label>

                    {/* Edit Address Button */}
                    <button
                      onClick={() => navigate("/customer-info")}
                      className="font-assistant w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-poppins text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-700" />
                  Select Payment Method
                </h3>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
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
                      className="w-4 h-4 text-green-700 focus:ring-green-700"
                    />
                    <Banknote size={24} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="font-poppins font-semibold text-gray-800">
                        Cash on Delivery
                      </p>
                      <p className="font-assistant text-xs text-gray-600">
                        Pay when you receive
                      </p>
                    </div>
                    {paymentMethod === "COD" && (
                      <CheckCircle size={20} className="text-green-700" />
                    )}
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
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
                      className="w-4 h-4 text-green-700 focus:ring-green-700"
                    />
                    <CreditCard size={24} className="text-gray-600" />
                    <div className="flex-1">
                      <p className="font-poppins font-semibold text-gray-800">
                        Online Payment
                      </p>
                      <p className="font-assistant text-xs text-gray-600">
                        UPI, Card, Net Banking
                      </p>
                    </div>
                    {paymentMethod === "ONLINE" && (
                      <CheckCircle size={20} className="text-green-700" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side - Price Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-4 rounded-lg shadow-md lg:sticky lg:top-4">
                <h3 className="font-poppins text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                  Price Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-sm text-gray-600">Subtotal</span>
                    <span className="font-assistant font-semibold text-gray-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-assistant text-sm text-gray-600">Delivery Charge</span>
                    <span className="font-assistant font-semibold text-gray-800">
                      ₹{(summary?.deliveryCharges || deliveryCharge).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins font-bold text-gray-800 text-base">
                        Total Amount
                      </span>
                      <span className="font-amiko font-bold text-green-700 text-lg">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                {isCheckoutDisabled && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-assistant text-xs text-orange-700 font-semibold">
                      ⚠️ Please select delivery address and payment method to
                      proceed
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                {paymentMethod === "ONLINE" ? (
                  <RazorpayPayment 
                    orderType="custom" 
                    vegetableOrder={vegetableOrder}
                  />
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckoutDisabled}
                    className={`font-assistant w-full py-3 rounded-lg font-bold text-sm sm:text-base transition transform shadow-md ${
                      isCheckoutDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800 hover:scale-[1.02]"
                    }`}
                  >
                    {isCheckoutDisabled
                      ? "Complete Selection to Proceed"
                      : "Place Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VegetableCart;