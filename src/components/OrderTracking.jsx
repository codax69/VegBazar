import React, { useState } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiPhone, FiMail, FiUser, FiArrowLeft, FiCalendar, FiCreditCard, FiShoppingBag } from 'react-icons/fi';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusConfig = {
    placed: { 
      label: 'Order Placed', 
      icon: FiPackage, 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    processed: { 
      label: 'Processing', 
      icon: FiClock, 
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500'
    },
    shipped: { 
      label: 'Shipped', 
      icon: FiTruck, 
      bgColor: 'bg-orange-100',
      textColor: 'text-[#F54A00]',
      borderColor: 'border-[#F54A00]'
    },
    delivered: { 
      label: 'Delivered', 
      icon: FiCheckCircle, 
      bgColor: 'bg-green-100',
      textColor: 'text-[#0e540b]',
      borderColor: 'border-[#0e540b]'
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: FiXCircle, 
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-500'
    }
  };

  const statusOrder = ['placed', 'processed', 'shipped', 'delivered'];

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER_URL}/api/orders/${orderId.toUpperCase()}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      const orderStatus = data.orderStatus || 'placed';
      data.status = orderStatus;
      
      if (!statusConfig[data.status]) {
        data.status = 'placed';
      }
      
      if (data.selectedVegetables && Array.isArray(data.selectedVegetables)) {
        data.items = data.selectedVegetables.map(item => {
          const vegName = item.vegetable?.name || item.name || 'Unknown Item';
          const quantity = item.quantity || 1;
          const weight = item.weight || '';
          const price = item.subtotal || item.pricePerUnit || 0;
          return {
            name: vegName,
            quantity: weight ? `${quantity} x ${weight}` : `${quantity} unit(s)`,
            price: price
          };
        });
      }
      
      if (data.customerInfo) {
        const addressParts = [];
        if (data.customerInfo.address) addressParts.push(data.customerInfo.address);
        if (data.customerInfo.area) addressParts.push(data.customerInfo.area);
        if (data.customerInfo.city) addressParts.push(data.customerInfo.city);
        if (data.customerInfo.pincode) addressParts.push(data.customerInfo.pincode);
        
        data.customer = {
          name: data.customerInfo.name || 'N/A',
          phone: data.customerInfo.mobile || 'N/A',
          email: data.customerInfo.email || 'N/A',
          address: addressParts.length > 0 ? addressParts.join(', ') : 'Address not available'
        };
      } else {
        data.customer = {
          name: 'Guest User',
          phone: 'N/A',
          email: 'N/A',
          address: 'Address not available'
        };
      }
      
      if (!data.timeline || !Array.isArray(data.timeline) || data.timeline.length === 0) {
        data.timeline = [{
          status: 'placed',
          date: data.orderDate || data.createdAt || new Date().toISOString(),
          message: 'Order placed successfully'
        }];
        
        if (data.status !== 'placed') {
          const statusMessages = {
            processed: 'Order is being processed',
            shipped: 'Order shipped from warehouse',
            delivered: 'Order delivered successfully',
            cancelled: 'Order has been cancelled'
          };
          
          data.timeline.push({
            status: data.status,
            date: data.updatedAt || new Date().toISOString(),
            message: statusMessages[data.status] || `Order status: ${data.status}`
          });
        }
      }
      
      setOrderData(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Order not found. Please check your Order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const isStatusCompleted = (status, currentStatus) => {
    if (currentStatus === 'cancelled') return false;
    return statusOrder.indexOf(status) <= statusOrder.indexOf(currentStatus);
  };

  const calculateDeliveryTime = (estimatedDelivery, actualDelivery) => {
    if (actualDelivery) {
      return `Delivered on ${formatDate(actualDelivery)}`;
    }
    
    if (!estimatedDelivery) return 'Delivery date pending';
    
    try {
      const now = new Date();
      const delivery = new Date(estimatedDelivery);
      const diffTime = delivery - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'Delivery delayed';
      } else if (diffDays === 0) {
        return 'Expected today';
      } else if (diffDays === 1) {
        return 'Expected tomorrow';
      } else {
        return `Expected in ${diffDays} days`;
      }
    } catch {
      return 'Delivery date pending';
    }
  };

  const handleReset = () => {
    setOrderId('');
    setOrderData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbfefc] via-green-50 to-emerald-50 py-5 sm:py-8 px-3 sm:px-4" style={{ fontFamily: 'Assistant, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0e540b] mb-2" style={{ fontFamily: 'Amiko, sans-serif' }}>
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Enter your order ID to check delivery status</p>
        </div>

        {/* Search Box */}
        <div className="bg-[#f0fcf6] rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-t-4 border-[#0e540b]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter Order ID (e.g., ORD20241025001)"
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#0e540b] focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !orderId.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-[#0e540b] to-[#0e540b] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 flex items-center gap-3 shadow-md">
            <FiXCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Back Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-700 hover:text-[#0e540b] transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">Search Another Order</span>
            </button>

            {/* Status Card */}
            <div className="bg-[#f0fcf6] rounded-xl shadow-lg overflow-hidden">
              <div className={`${statusConfig[orderData.status]?.bgColor || 'bg-gray-100'} p-4 sm:p-6 border-b-4 ${statusConfig[orderData.status]?.borderColor || 'border-gray-500'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(statusConfig[orderData.status]?.icon || FiPackage, {
                      className: `w-6 h-6 sm:w-8 sm:h-8 ${statusConfig[orderData.status]?.textColor || 'text-gray-600'}`
                    })}
                    <div>
                      <h2 className={`text-xl sm:text-2xl font-bold ${statusConfig[orderData.status]?.textColor || 'text-gray-800'}`} style={{ fontFamily: 'Amiko, sans-serif' }}>
                        {statusConfig[orderData.status]?.label || 'Unknown Status'}
                      </h2>
                      <p className="text-gray-600 text-xs sm:text-sm">Order ID: {orderData.orderId}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(orderData.orderDate || orderData.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              {orderData.status !== 'cancelled' && (
                <div className="bg-gradient-to-r from-[#0e540b] to-[#0e540b] text-white p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm sm:text-base">Delivery Status:</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold">
                      {calculateDeliveryTime(orderData.estimatedDelivery, orderData.actualDelivery)}
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Tracker */}
              {orderData.status !== 'cancelled' ? (
                <div className="p-4 sm:p-8">
                  <div className="relative">
                    <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 sm:h-1 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0e540b] to-[#0e540b] transition-all duration-500"
                        style={{ 
                          width: `${(statusOrder.indexOf(orderData.status) / (statusOrder.length - 1)) * 100}%` 
                        }}
                      />
                    </div>

                    <div className="relative flex justify-between">
                      {statusOrder.map((status) => {
                        const config = statusConfig[status];
                        const isCompleted = isStatusCompleted(status, orderData.status);
                        const isCurrent = status === orderData.status;
                        
                        return (
                          <div key={status} className="flex flex-col items-center">
                            <div 
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-[#0e540b] text-white shadow-lg scale-110' 
                                  : 'bg-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-2 sm:ring-4 ring-green-200 animate-pulse' : ''}`}
                            >
                              {React.createElement(config.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                            </div>
                            <p className={`mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-center ${
                              isCompleted ? 'text-[#0e540b]' : 'text-gray-400'
                            }`}>
                              {config.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center">
                  <FiXCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Amiko, sans-serif' }}>Order Cancelled</h3>
                  <p className="text-sm sm:text-base text-gray-600">{orderData.cancellationReason || 'Order has been cancelled'}</p>
                </div>
              )}
            </div>

            {/* Customer & Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Customer Info */}
              <div className="bg-[#f0fcf6] rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-[#F54A00]">
                <h3 className="text-lg sm:text-xl font-bold text-[#0e540b] mb-3 sm:mb-4 flex items-center gap-2" style={{ fontFamily: 'Amiko, sans-serif' }}>
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-[#F54A00]" />
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{orderData.customer?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{orderData.customer?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base break-all">{orderData.customer?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Delivery Address</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{orderData.customer?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Order Type</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base capitalize">{orderData.orderType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-[#f0fcf6] rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-[#0e540b]">
                <h3 className="text-lg sm:text-xl font-bold text-[#0e540b] mb-3 sm:mb-4 flex items-center gap-2" style={{ fontFamily: 'Amiko, sans-serif' }}>
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-[#F54A00]" />
                  Order Summary
                </h3>
                <div className="space-y-2 mb-3 sm:mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                  {orderData.items && orderData.items.length > 0 ? (
                    orderData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start gap-2 py-2 border-b border-gray-100">
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-700 text-sm sm:text-base block break-words">{item.name}</span>
                          <span className="text-gray-500 text-xs sm:text-sm">{item.quantity}</span>
                        </div>
                        {item.price > 0 && (
                          <span className="text-gray-600 font-medium text-sm sm:text-base flex-shrink-0">₹{item.price}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No items found</p>
                  )}
                </div>
                <div className="space-y-2 pt-3 border-t-2 border-gray-200 text-sm sm:text-base">
                  {orderData.selectedOffer?.title && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Package</span>
                      <span className="font-semibold text-gray-800">{orderData.selectedOffer.title}</span>
                    </div>
                  )}
                  {orderData.vegetablesTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Items Total</span>
                      <span className="font-semibold text-gray-800">₹{orderData.vegetablesTotal}</span>
                    </div>
                  )}
                  {orderData.offerPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Offer Price</span>
                      <span className="font-semibold text-gray-800">₹{orderData.offerPrice}</span>
                    </div>
                  )}
                  {orderData.deliveryCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className="font-semibold text-gray-800">₹{orderData.deliveryCharges}</span>
                    </div>
                  )}
                  {orderData.discount > 0 && (
                    <div className="flex justify-between items-center text-[#0e540b]">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{orderData.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-base sm:text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#0e540b]">₹{orderData.totalAmount || 0}</span>
                  </div>
                  {orderData.paymentMethod && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600 flex items-center gap-1">
                        <FiCreditCard className="w-4 h-4" />
                        Payment Method
                      </span>
                      <span className="font-semibold text-gray-800">{orderData.paymentMethod}</span>
                    </div>
                  )}
                  {orderData.paymentStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-semibold px-2 py-1 rounded text-xs sm:text-sm ${orderData.paymentStatus === 'paid' ? 'bg-green-100 text-[#0e540b]' : 'bg-yellow-100 text-yellow-700'}`}>
                        {orderData.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {orderData.timeline && orderData.timeline.length > 0 && (
              <div className="bg-[#f0fcf6] rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-[#F54A00]">
                <h3 className="text-lg sm:text-xl font-bold text-[#0e540b] mb-3 sm:mb-4 flex items-center gap-2" style={{ fontFamily: 'Amiko, sans-serif' }}>
                  <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-[#F54A00]" />
                  Order Timeline
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {orderData.timeline.map((event, index) => {
                    const config = statusConfig[event.status] || statusConfig.placed;
                    return (
                      <div key={index} className="flex gap-3 sm:gap-4">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                            {React.createElement(config.icon, { 
                              className: `w-4 h-4 sm:w-5 sm:h-5 ${config.textColor}` 
                            })}
                          </div>
                          {index < orderData.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 absolute top-10" />
                          )}
                        </div>
                        <div className="flex-1 pb-4 sm:pb-6 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{config.label}</h4>
                            <span className="text-xs sm:text-sm text-gray-500">{formatDate(event.date)}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 break-words">{event.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;