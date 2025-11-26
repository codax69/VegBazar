import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useOrderContext } from './OrderContext';

const API_URL = import.meta.env.VITE_API_SERVER_URL;

const BillContext = createContext();

export const useBillContext = () => {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBillContext must be used within BillProvider');
  }
  return context;
};

export const BillProvider = ({ children }) => {
  const { selectedOffer, selectedVegetables, vegetableOrder, paymentMethod } = useOrderContext();
  
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(20);
  const [orderCount, setOrderCount] = useState(1);

  // Helper functions
  const getOrderItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order)) return order;
    if (order.items && Array.isArray(order.items)) return order.items;
    return [];
  };

  const getOrderSummary = (order) => {
    if (order && typeof order === 'object' && order.summary) return order.summary;
    return null;
  };

  // Detect order type
  const orderType = useMemo(() => {
    const customItems = getOrderItems(vegetableOrder);
    if (customItems.length > 0) return 'custom';
    if (selectedOffer && selectedVegetables.length > 0) return 'basket';
    return null;
  }, [vegetableOrder, selectedOffer, selectedVegetables]);

  const isCustomOrder = orderType === 'custom';
  const isBasketOrder = orderType === 'basket';

  // Sync coupon data from vegetableOrder for custom orders
  useEffect(() => {
    if (isCustomOrder && vegetableOrder) {
      const summary = getOrderSummary(vegetableOrder);
      
      // Set coupon data from vegetableOrder
      if (vegetableOrder.coupon) {
        setAppliedCoupon(vegetableOrder.coupon);
        setCouponDiscount(vegetableOrder.coupon.discount || 0);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
      
      // Set delivery charge from summary
      if (summary?.deliveryCharges !== undefined) {
        setDeliveryCharge(summary.deliveryCharges);
      }
    }
  }, [isCustomOrder, vegetableOrder]);

  // Fetch daily order count
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/today/orders`);
        setOrderCount(res.data.data.count + 1);
      } catch (err) {
        console.error('Error fetching order count:', err);
      }
    };
    fetchOrderCount();
  }, []);

  // Calculate custom order total
  const calculateCustomTotal = useCallback(() => {
    const items = getOrderItems(vegetableOrder);
    const summary = getOrderSummary(vegetableOrder);

    // Prefer valid summary total if > 0
    if (summary?.totalAmount && summary.totalAmount > 0) {
      return summary.totalAmount;
    }

    // Otherwise calculate manually
    const subtotal = items.reduce((acc, item) => {
      const price = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return acc + price * qty;
    }, 0);

    const discount = couponDiscount || 0;
    const delivery = summary?.deliveryCharges ?? deliveryCharge;
    const total = subtotal - discount + delivery;

    // Avoid showing only delivery charge
    return subtotal > 0 ? total : 0;
  }, [vegetableOrder, deliveryCharge, couponDiscount]);

  // Calculate basket order values
  const basketCalculations = useMemo(() => {
    if (!isBasketOrder) return null;

    const pricePerVegetable = selectedOffer?.price / selectedVegetables.length || 0;
    const vegBazarTotal = selectedOffer?.price || 0;
    const marketTotal = selectedVegetables.reduce(
      (sum, veg) => sum + (veg.marketPrice || veg.price || 0),
      0
    );

    // Apply coupon discount to offer price
    const subtotalAfterCoupon = Math.max(0, vegBazarTotal - couponDiscount);

    // Calculate savings (market price - offer price + coupon discount)
    const savings = marketTotal - vegBazarTotal + couponDiscount;
    const savingsPercentage = marketTotal > 0 ? ((savings / marketTotal) * 100).toFixed(0) : 0;

    // Total amount after coupon + delivery charge
    const totalAmount = subtotalAfterCoupon + deliveryCharge;

    return {
      pricePerVegetable,
      vegBazarTotal,
      marketTotal,
      savings,
      savingsPercentage,
      totalAmount,
      subtotalAfterCoupon,
    };
  }, [isBasketOrder, selectedOffer, selectedVegetables, couponDiscount, deliveryCharge]);

  // Calculate custom order values
  const customCalculations = useMemo(() => {
    if (!isCustomOrder) return null;

    const items = getOrderItems(vegetableOrder);
    const summary = getOrderSummary(vegetableOrder);

    const vegetablesTotal = summary?.subtotal || items.reduce((total, item) => {
      const price = parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0;
      return total + price * (item.quantity || 0);
    }, 0);

    const delivery = summary?.deliveryCharges ?? deliveryCharge;
    const totalAmount = calculateCustomTotal();

    return {
      vegetablesTotal,
      deliveryCharge: delivery,
      totalAmount,
      items,
      couponDiscount: couponDiscount || 0,
    };
  }, [isCustomOrder, vegetableOrder, deliveryCharge, couponDiscount, calculateCustomTotal]);

  // Get total amount based on order type
  const totalAmount = useMemo(() => {
    if (isCustomOrder) return customCalculations?.totalAmount || 0;
    if (isBasketOrder) return basketCalculations?.totalAmount || 0;
    return 0;
  }, [isCustomOrder, isBasketOrder, customCalculations, basketCalculations]);

  // Get display items
  const displayItems = useMemo(() => {
    if (isCustomOrder) return getOrderItems(vegetableOrder);
    if (isBasketOrder) return selectedVegetables;
    return [];
  }, [isCustomOrder, isBasketOrder, vegetableOrder, selectedVegetables]);

  // Get package name
  const packageName = useMemo(() => {
    if (isCustomOrder) return 'Custom Selection';
    if (isBasketOrder && selectedOffer) return selectedOffer.title;
    return 'N/A';
  }, [isCustomOrder, isBasketOrder, selectedOffer]);

  // Generate Order ID
  const generateOrderId = useCallback((count) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const orderNum = String(count).padStart(3, '0');
    return `ORD${year}${month}${day}${orderNum}`;
  }, []);

  // Handle Apply Coupon (works for both basket and custom orders)
  const handleApplyCoupon = useCallback(async (couponCode) => {
    try {
      if (isBasketOrder) {
        // Basket order coupon validation
        const { data } = await axios.post(`${API_URL}/api/orders/validate-coupon-basket`, {
          offerId: selectedOffer._id || selectedOffer.id,
          offerPrice: selectedOffer.price,
          couponCode: couponCode,
        });

        if (data.data.coupon && data.data.coupon.applied) {
          setAppliedCoupon(data.data.coupon);
          setCouponDiscount(data.data.coupon.discount || 0);
          setDeliveryCharge(data.data.coupon.deliveryCharges || 20);
        } else {
          throw new Error(data.data.coupon?.error || 'Invalid coupon code');
        }
      } else if (isCustomOrder) {
        // Custom order coupon validation
        const items = getOrderItems(vegetableOrder);
        const normalizedItems = items.map((item) => ({
          vegetableId: item.vegetableId || item.id,
          weight: item.weight,
          quantity: item.quantity,
        }));

        const { data } = await axios.post(`${API_URL}/api/orders/calculate-price`, {
          items: normalizedItems,
          couponCode: couponCode,
        });

        if (data.data.coupon && data.data.coupon.applied) {
          setAppliedCoupon(data.data.coupon);
          setCouponDiscount(data.data.coupon.discount || 0);
          setDeliveryCharge(data.data.summary.deliveryCharges || 20);
        } else {
          throw new Error(data.data.coupon?.error || 'Invalid coupon code');
        }
      } else {
        throw new Error('No active order to apply coupon');
      }
    } catch (error) {
      console.error('❌ Coupon application failed:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to apply coupon'
      );
    }
  }, [isBasketOrder, isCustomOrder, selectedOffer, vegetableOrder]);

  // Handle Remove Coupon
  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setDeliveryCharge(20);
  }, []);

  const value = {
    // Order type
    orderType,
    isCustomOrder,
    isBasketOrder,
    
    // Coupon state
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    
    // Calculations
    basketCalculations,
    customCalculations,
    totalAmount,
    
    // Display data
    displayItems,
    packageName,
    orderCount,
    
    // Payment method
    paymentMethod,
    
    // Functions
    generateOrderId,
    handleApplyCoupon,
    handleRemoveCoupon,
    getOrderItems,
    getOrderSummary,
    
    // State setters (for external updates)
    setAppliedCoupon,
    setCouponDiscount,
    setDeliveryCharge,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};