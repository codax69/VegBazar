export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

export const trackOfferView = (offerId, offerName, price) => {
  trackEvent("view_item", {
    item_id: offerId,
    item_name: offerName,
    item_category: "Vegetable Offer",
    price: price,
  });
};

export const trackOfferSelect = (offerId, offerName, price) => {
  trackEvent("select_item", {
    item_id: offerId,
    item_name: offerName,
    item_category: "Vegetable Offer",
    price: price,
  });
};

export const trackAddToCart = (vegetableName, quantity) => {
  trackEvent("add_to_cart", {
    item_name: vegetableName,
    item_category: "Vegetable",
    quantity: quantity,
  });
};

export const trackBeginCheckout = (totalAmount, itemCount) => {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: totalAmount,
    items_count: itemCount,
  });
};

export const trackPurchase = (orderId, totalAmount, paymentMethod, items) => {
  trackEvent("purchase", {
    transaction_id: orderId,
    value: totalAmount,
    currency: "INR",
    payment_type: paymentMethod,
    items: items,
  });
};

// Track order tracking page visit
export const trackOrderTracking = (orderId) => {
  trackEvent("track_order", {
    order_id: orderId,
  });
};
