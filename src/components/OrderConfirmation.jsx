import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  CheckCircle,
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShoppingBag,
  Shield,
  TrendingDown,
} from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";
import { useBillContext } from "../Context/BillContext";
import OrderSuccess from "./OrderSuccess";
import OrderFailed from "./OrderFailed";
import OrderLoading from "./OrderLoading";
import { useAuth } from "../Context/AuthProvider";

const OrderConfirmation = () => {
  const {
    formData,
    selectedOffer,
    resetOrder,
    navigate,
    setIsOrderPlaced,
    isOrderPlaced,
    paymentMethod,
  } = useOrderContext();
  const { user } = useAuth();

  const {
    orderType,
    isCustomOrder,
    isBasketOrder,
    displayItems,
    packageName,
    totalAmount,
    orderCount,
    generateOrderId,
    customCalculations,
    basketCalculations,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
  } = useBillContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [savedOrderData, setSavedOrderData] = useState(null);

  // ✅ Check for saved order on mount
  useEffect(() => {
    const orderDataFromStorage = sessionStorage.getItem("lastOrderData");

    if (orderDataFromStorage) {
      try {
        const parsedData = JSON.parse(orderDataFromStorage);
        // Handle both direct data and nested response structure
        const actualData =
          parsedData?.data?.data || parsedData?.data || parsedData;
        setSavedOrderData(actualData);
        setIsOrderPlaced(true);
      } catch (error) {
        console.error("❌ Error parsing order data:", error);
      }
    } else {
      // console.log("ℹ️ No saved order data found");
    }
  }, [setIsOrderPlaced]);

  // Redirect if no order type and no saved order data
  useEffect(() => {
    if (!orderType && !savedOrderData && !isOrderPlaced) {
      navigate("/");
      window.scrollTo(0, 0);
    }
  }, [orderType, savedOrderData, isOrderPlaced, navigate]);

  const handleNewOrder = () => {
    sessionStorage.removeItem("lastOrderData");
    sessionStorage.removeItem("orderJustPlaced");
    localStorage.removeItem("orderSummary");
    localStorage.removeItem("vegbazar_cart");
    setIsOrderPlaced(false);
    setSavedOrderData(null);
    resetOrder();
  };

  // Calculate total savings for basket orders
  const totalSavings = useMemo(() => {
    if (!isBasketOrder || !basketCalculations) return 0;
    return basketCalculations.savings || 0;
  }, [isBasketOrder, basketCalculations]);

  // Prepare order data
  const orderData = useMemo(() => {
    // ✅ Use saved order data if available
    if (savedOrderData) {
      return savedOrderData;
    }

    const orderId = generateOrderId(orderCount);

    // Custom order preparation
    if (isCustomOrder && customCalculations) {
      const items = customCalculations.items || [];

      return {
        orderId,
        orderType: "custom",
        customerInfo: { name: user?.username || "", email: user?.email || "", mobile: user?.phone || "" } || {},
        selectedVegetables: items.map((item) => ({
          vegetable: item.id || item.vegetableId,
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          pricePerUnit:
            parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0,
          subtotal:
            (parseFloat(item.pricePerUnit) || parseFloat(item.price) || 0) *
            (item.quantity || 0),
          isFromBasket: false,
        })),
        vegetablesTotal: customCalculations.vegetablesTotal || 0,
        deliveryCharges: customCalculations.deliveryCharge || 0,
        totalAmount: customCalculations.totalAmount || 0,
        couponDiscount: customCalculations.couponDiscount || 0,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "pending" : "Completed",
        orderStatus: "placed",
        orderDate: new Date().toISOString(),
      };
    }

    // Basket order preparation
    if (isBasketOrder) {
      return {
        orderId,
        customerInfo: formData || {},
        selectedOffer: selectedOffer || {},
        orderType: "basket",
        selectedVegetables: displayItems || [],
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount ?? 0,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0,
        deliveryCharges: deliveryCharge || 0,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
        orderStatus: "placed",
      };
    }

    return { orderId, orderType: "unknown" };
  }, [
    savedOrderData,
    formData,
    selectedOffer,
    displayItems,
    orderCount,
    paymentMethod,
    isCustomOrder,
    isBasketOrder,
    totalAmount,
    customCalculations,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    generateOrderId,
  ]);

  // Submit Order
  const handleSubmitOrder = useCallback(
    async (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);

      // If order already exists, just show success
      if (savedOrderData) {
        setIsOrderPlaced(true);
        return;
      }

      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/orders/create-order`,
          orderData
        );

        if (res.status >= 200 && res.status < 300) {
          // ✅ Store the order data from the response (actual created order)
          const createdOrder = res.data?.data || orderData;
          sessionStorage.setItem("lastOrderData", JSON.stringify(createdOrder));
          setIsOrderPlaced(true);
        } else {
          setSubmitError("Order save failed. Try again.");
        }
      } catch (err) {
        console.error("Order submission error:", err);
        setSubmitError(err?.response?.data?.message || err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      orderData,
      setIsOrderPlaced,
      savedOrderData,
    ]
  );

  // ✅ Show success if order is placed
  if (isOrderPlaced && orderData) {
    // Extract order data - handle both direct orderData and nested response.data.data
    const actualOrderData =
      orderData?.data?.data || orderData?.data || orderData;

    return (
      <OrderSuccess orderData={actualOrderData} onNewOrder={handleNewOrder} />
    );
  }

  if (isSubmitting) {
    return <OrderLoading />;
  }

  if (submitError) {
    return (
      <OrderFailed
        errorMessage={submitError}
        onRetry={() => setSubmitError(null)}
        onGoBack={() => {
          window.scrollTo(0, 0);
          navigate(savedOrderData || isCustomOrder ? "/cart" : "/billing");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] py-4 pt-20">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => {
            navigate(isCustomOrder ? "/cart" : "/billing");
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 mb-3 text-gray-700 hover:text-[#0e540b] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium font-assistant text-sm">Back</span>
        </button>

        <div className="bg-[#f0fcf6] rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0e540b] to-green-700 p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Package className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white font-amiko">
                Confirm Your Order
              </h2>
            </div>
            <p className="text-center text-green-100 text-xs font-assistant">
              Review your order details before confirmation
            </p>
          </div>

          <div className="p-5">
            {/* Customer & Order Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Order ID
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {orderData?.orderId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Full Name
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {formData?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Mobile Number
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {formData?.mobile || "N/A"}
                      </p>
                    </div>
                  </div>
                  {formData?.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-poppins">
                          Email
                        </p>
                        <p className="font-semibold text-gray-800 font-assistant text-sm truncate">
                          {formData.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        {isCustomOrder ? "Order Type" : "Package"}
                      </p>
                      <p className="font-semibold text-gray-800 font-assistant text-sm">
                        {packageName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-poppins">
                        Total Amount
                      </p>
                      <p className="font-bold text-[#0e540b] text-lg">
                        ₹{(totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {formData?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#0e540b] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-poppins">
                          Delivery Address
                        </p>
                        <p className="font-semibold text-gray-800 font-assistant text-sm break-words">
                          {formData.address}
                          {formData.area && `, ${formData.area}`}
                          {formData.city && `, ${formData.city}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coupon Info - if applied */}
            {(orderData?.couponCode || appliedCoupon) &&
              (couponDiscount > 0 || orderData?.couponDiscount > 0) && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-assistant">
                        Coupon Applied
                      </p>
                      <p className="font-semibold text-green-700 font-assistant text-sm">
                        {orderData?.couponCode ||
                          appliedCoupon?.code ||
                          "Discount Applied"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-assistant">
                        Discount
                      </p>
                      <p className="font-bold text-green-700 text-sm">
                        -₹
                        {(
                          orderData?.couponDiscount ||
                          couponDiscount ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Selected Vegetables */}
            {orderData?.selectedVegetables &&
              orderData.selectedVegetables.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4 text-[#0e540b]" />
                    Selected Items ({orderData.selectedVegetables.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orderData.selectedVegetables.map((veg, index) => {
                      // Handle nested vegetable structure from API
                      const vegName =
                        veg.name || veg.vegetable?.name || "Unknown";
                      const vegWeight =
                        veg.weight || veg.vegetable?.weight || "";

                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 font-assistant">
                              {vegName}
                            </span>
                            {vegWeight && (
                              <span className="text-xs text-gray-600 ml-2">
                                ({vegWeight})
                              </span>
                            )}
                          </div>
                          {veg.quantity && veg.pricePerUnit && (
                            <div className="text-right">
                              <div className="text-xs text-gray-600">
                                ₹{parseFloat(veg.pricePerUnit).toFixed(2)} ×{" "}
                                {veg.quantity}
                              </div>
                              <div className="font-semibold text-green-700">
                                ₹{(veg.subtotal || 0).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* reCAPTCHA Notice */}
            <div className="bg-gray-50 p-2 rounded-lg mb-4 border border-gray-200">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-assistant">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>
                  Protected by reCAPTCHA v3.
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Privacy
                  </a>{" "}
                  -{" "}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terms
                  </a>
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r font-assistant from-[#0e540b] to-green-700 text-white font-bold py-3 px-5 rounded-lg hover:from-green-700 hover:to-[#0e540b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm & Place Order
            </button>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-gray-600">
          <p className="flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#0e540b] font-assistant" />
            Your order information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
