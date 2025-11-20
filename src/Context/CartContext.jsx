import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceDetails, setPriceDetails] = useState({
    subtotal: 0,
    deliveryCharges: 20,
    totalAmount: 0,
    items: [],
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate prices from backend - wrapped in useCallback
  const calculatePricesFromBackend = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
      setPriceDetails({
        subtotal: 0,
        deliveryCharges: 20,
        totalAmount: 0,
        items: [],
      });
      return;
    }

    setIsCalculating(true);
    try {
      const items = cartItems.map((item) => ({
        vegetableId: item._id || item.id || item.vegetableId,
        weight: item.weight,
        quantity: item.quantity,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/orders/calculate-price`,
        { items },
        { timeout: 10000 } // Add timeout
      );

      if (response.data && response.data.data) {
        const calculatedData = response.data.data;

        // Merge calculated prices with cart items
        const updatedCartWithPrices = cartItems.map((cartItem) => {
          const calculatedItem = calculatedData.items.find(
            (item) =>
              item.vegetableId ===
              (cartItem._id || cartItem.id || cartItem.vegetableId)
          );

          if (calculatedItem) {
            return {
              ...cartItem,
              pricePerUnit: calculatedItem.pricePerUnit,
              totalPrice: calculatedItem.totalPrice,
              price: calculatedItem.pricePerUnit,
            };
          }
          return cartItem;
        });

        setCart(updatedCartWithPrices);

        setPriceDetails({
          subtotal: calculatedData.summary?.subtotal || 0,
          deliveryCharges: calculatedData.summary?.deliveryCharges || 20,
          totalAmount: calculatedData.summary?.totalAmount || 0,
          items: calculatedData.items || [],
        });
      }
    } catch (error) {
      console.error("Error calculating prices:", error);
      // Fallback to local calculation
      const subtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.pricePerUnit || item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + price * quantity;
      }, 0);

      setPriceDetails({
        subtotal,
        deliveryCharges: 20,
        totalAmount: subtotal + 20,
        items: [],
      });
    } finally {
      setIsCalculating(false);
    }
  }, []); // No dependencies needed as it doesn't use external state

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("vegbazar_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          // Calculate prices after loading cart
          if (parsedCart.length > 0) {
            calculatePricesFromBackend(parsedCart);
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem("vegbazar_cart"); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, [calculatePricesFromBackend]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("vegbazar_cart", JSON.stringify(cart));
        // Recalculate prices when cart changes
        if (cart.length > 0) {
          calculatePricesFromBackend(cart);
        } else {
          setPriceDetails({
            subtotal: 0,
            deliveryCharges: 20,
            totalAmount: 0,
            items: [],
          });
        }
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isLoading, calculatePricesFromBackend]);

  // Add item to cart with weight
  const addToCart = useCallback((item, weight = null) => {
    setCart((prevCart) => {
      const itemId = item._id || item.id;
      const itemWeight = weight || item.weight;

      // Validate item
      if (!itemId || !itemWeight) {
        console.error("Invalid item:", item);
        return prevCart;
      }

      // Check if item with same ID and weight exists
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          (cartItem._id === itemId || cartItem.id === itemId) &&
          cartItem.weight === itemWeight
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        const updated = [...prevCart];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + 1,
        };
        return updated;
      } else {
        // Add new item with quantity 1
        return [
          ...prevCart,
          {
            ...item,
            weight: itemWeight,
            quantity: 1,
            id: itemId,
            vegetableId: itemId,
          },
        ];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId, weight = null) => {
    setCart((prevCart) => {
      if (weight) {
        // Remove specific weight variant
        return prevCart.filter(
          (item) =>
            !(
              (item._id === itemId || item.id === itemId) &&
              item.weight === weight
            )
        );
      } else {
        // Remove all variants of this item
        return prevCart.filter(
          (item) => item._id !== itemId && item.id !== itemId
        );
      }
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId, weight, quantity) => {
      if (quantity <= 0) {
        removeFromCart(itemId, weight);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) => {
          const matches =
            (item._id === itemId || item.id === itemId) &&
            item.weight === weight;
          return matches ? { ...item, quantity } : item;
        })
      );
    },
    [removeFromCart]
  );

  // Increase quantity
  const increaseQuantity = useCallback((itemId, weight) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const matches =
          (item._id === itemId || item.id === itemId) && item.weight === weight;
        return matches ? { ...item, quantity: item.quantity + 1 } : item;
      })
    );
  }, []);

  // Decrease quantity
  const decreaseQuantity = useCallback((itemId, weight) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          const matches =
            (item._id === itemId || item.id === itemId) &&
            item.weight === weight;
          if (matches) {
            const newQuantity = item.quantity - 1;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("vegbazar_cart");
    setPriceDetails({
      subtotal: 0,
      deliveryCharges: 20,
      totalAmount: 0,
      items: [],
    });
  }, []);

  // Check if item is in cart (with specific weight)
  const isInCart = useCallback(
    (itemId, weight = null) => {
      if (weight) {
        return cart.some(
          (item) =>
            (item._id === itemId || item.id === itemId) &&
            item.weight === weight
        );
      }
      return cart.some((item) => item._id === itemId || item.id === itemId);
    },
    [cart]
  );

  // Get item quantity (for specific weight)
  const getItemQuantity = useCallback(
    (itemId, weight = null) => {
      const item = cart.find(
        (cartItem) =>
          (cartItem._id === itemId || cartItem.id === itemId) &&
          (!weight || cartItem.weight === weight)
      );
      return item ? item.quantity : 0;
    },
    [cart]
  );

  // Calculate total items
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  // Calculate total price (from backend calculation)
  const getTotalPrice = useCallback(() => {
    return priceDetails.totalAmount || 0;
  }, [priceDetails.totalAmount]);

  // Get subtotal (from backend calculation)
  const getSubtotal = useCallback(() => {
    return priceDetails.subtotal || 0;
  }, [priceDetails.subtotal]);

  // Get delivery charges
  const getDeliveryCharges = useCallback(() => {
    return priceDetails.deliveryCharges || 20;
  }, [priceDetails.deliveryCharges]);

  // Calculate total savings
  const getTotalSavings = useCallback(() => {
    return cart.reduce((total, item) => {
      if (
        item.originalPrice &&
        item.originalPrice > (item.price || item.pricePerUnit || 0)
      ) {
        const price = item.price || item.pricePerUnit || 0;
        const savings = (item.originalPrice - price) * item.quantity;
        return total + savings;
      }
      return total;
    }, 0);
  }, [cart]);

  // Get complete order data for checkout
  const getOrderData = useCallback(() => {
    return {
      items: cart.map((item) => ({
        vegetableId: item._id || item.id || item.vegetableId,
        name: item.name,
        weight: item.weight,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit || item.price || 0,
        totalPrice:
          item.totalPrice ||
          (item.pricePerUnit || item.price || 0) * item.quantity,
        image: item.image,
      })),
      summary: {
        subtotal: priceDetails.subtotal,
        deliveryCharges: priceDetails.deliveryCharges,
        totalAmount: priceDetails.totalAmount,
      },
      timestamp: new Date().toISOString(),
    };
  }, [cart, priceDetails]);

  const value = {
    cart,
    isLoading,
    isCalculating,
    priceDetails,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getTotalItems,
    getTotalPrice,
    getSubtotal,
    getDeliveryCharges,
    getTotalSavings,
    getOrderData,
    calculatePricesFromBackend,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
