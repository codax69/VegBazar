import React, { useState, useEffect } from 'react';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle, 
  FiClock, FiMapPin, FiPhone, FiMail, FiUser, FiArrowLeft, 
  FiCalendar, FiCreditCard, FiShoppingBag, FiRefreshCw 
} from 'react-icons/fi';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5000';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Status configuration
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
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500'
  },
  delivered: {
    label: 'Delivered',
    icon: FiCheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-500'
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

// Utility Functions
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
    
    if (diffDays < 0) return 'Delivery delayed';
    if (diffDays === 0) return 'Expected today';
    if (diffDays === 1) return 'Expected tomorrow';
    return `Expected in ${diffDays} days`;
  } catch {
    return 'Delivery date pending';
  }
};

// Order List Component
const OrderList = ({ orders, onSelectOrder, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FiShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No orders found</p>
        <p className="text-gray-400 text-sm mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const status = order.orderStatus || order.status || 'placed';
          const config = statusConfig[status] || statusConfig.placed;
          
          return (
            <div
              key={order._id || order.orderId}
              onClick={() => onSelectOrder(order)}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(config.icon, {
                      className: `w-5 h-5 ${config.textColor}`
                    })}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Order #{order.orderId}
                  </h3>
                  
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(order.orderDate || order.createdAt)}
                  </p>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {order.items?.length || order.selectedVegetables?.length || 0} items
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{order.totalAmount || 0}
                  </p>
                  {status !== 'cancelled' && status !== 'delivered' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {calculateDeliveryTime(order.estimatedDelivery, order.actualDelivery)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Order Details Component
const OrderDetails = ({ order, onBack }) => {
  const status = order.orderStatus || order.status || 'placed';
  const config = statusConfig[status] || statusConfig.placed;
  
  const isStatusCompleted = (checkStatus, currentStatus) => {
    if (currentStatus === 'cancelled') return false;
    return statusOrder.indexOf(checkStatus) <= statusOrder.indexOf(currentStatus);
  };

  // Process order items
  const items = order.items || (order.selectedVegetables?.map(item => ({
    name: item.vegetable?.name || item.name || 'Unknown Item',
    quantity: item.weight ? `${item.quantity || 1} x ${item.weight}` : `${item.quantity || 1} unit(s)`,
    price: item.subtotal || item.pricePerUnit || 0
  }))) || [];

  // Process customer info
  const customer = order.customer || (() => {
    if (order.customerInfo) {
      const addressParts = [
        order.customerInfo.address,
        order.customerInfo.area,
        order.customerInfo.city,
        order.customerInfo.pincode
      ].filter(Boolean);
      
      return {
        name: order.customerInfo.name || 'N/A',
        phone: order.customerInfo.mobile || 'N/A',
        email: order.customerInfo.email || 'N/A',
        address: addressParts.length > 0 ? addressParts.join(', ') : 'Address not available'
      };
    }
    return {
      name: 'Guest User',
      phone: 'N/A',
      email: 'N/A',
      address: 'Address not available'
    };
  })();

  // Process timeline
  const timeline = order.timeline || [
    {
      status: 'placed',
      date: order.orderDate || order.createdAt || new Date().toISOString(),
      message: 'Order placed successfully'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
      >
        <FiArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      {/* Status Card */}
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-6`}>
        <div className="flex items-center gap-4 mb-4">
          {React.createElement(config.icon, {
            className: `w-8 h-8 ${config.textColor}`
          })}
          <div>
            <h2 className={`text-2xl font-bold ${config.textColor}`}>
              {config.label}
            </h2>
            <p className="text-gray-700 mt-1">Order ID: {order.orderId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FiCalendar className="w-5 h-5" />
          <span className="font-medium">Order Date:</span>
          <span>{formatDate(order.orderDate || order.createdAt)}</span>
        </div>

        {status !== 'cancelled' && (
          <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700">Delivery Status:</p>
            <p className={`text-lg font-semibold ${config.textColor}`}>
              {calculateDeliveryTime(order.estimatedDelivery, order.actualDelivery)}
            </p>
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      {status !== 'cancelled' ? (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex justify-between items-center relative">
            {statusOrder.map((statusKey, index) => {
              const statusConf = statusConfig[statusKey];
              const isCompleted = isStatusCompleted(statusKey, status);
              const isCurrent = statusKey === status;

              return (
                <div key={statusKey} className="flex flex-col items-center relative z-10 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? `${statusConf.bgColor} ${statusConf.borderColor} ${statusConf.textColor}`
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-opacity-30 ' + statusConf.bgColor : ''}`}
                  >
                    {React.createElement(statusConf.icon, { className: 'w-6 h-6' })}
                  </div>
                  <p className={`text-xs sm:text-sm mt-2 font-medium text-center ${
                    isCompleted ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {statusConf.label}
                  </p>
                  {index < statusOrder.length - 1 && (
                    <div
                      className={`absolute top-6 left-1/2 w-full h-0.5 ${
                        isStatusCompleted(statusOrder[index + 1], status)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      style={{ transform: 'translateY(-50%)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Order Cancelled</h3>
          <p className="text-gray-700">{order.cancellationReason || 'Order has been cancelled'}</p>
        </div>
      )}

      {/* Customer & Order Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            Customer Details
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-800">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiPhone className="w-4 h-4" /> Phone
              </p>
              <p className="font-medium text-gray-800">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiMail className="w-4 h-4" /> Email
              </p>
              <p className="font-medium text-gray-800">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiMapPin className="w-4 h-4" /> Delivery Address
              </p>
              <p className="font-medium text-gray-800">{customer.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Type</p>
              <p className="font-medium text-gray-800">{order.orderType || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiShoppingBag className="w-5 h-5" />
            Order Summary
          </h3>

          <div className="space-y-3 mb-4">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity}</p>
                  </div>
                  {item.price > 0 && (
                    <p className="font-semibold text-gray-800">₹{item.price}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items found</p>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t-2 border-gray-200">
            {order.selectedOffer?.title && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Package</span>
                <span className="font-medium">{order.selectedOffer.title}</span>
              </div>
            )}
            {order.vegetablesTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Total</span>
                <span className="font-medium">₹{order.vegetablesTotal}</span>
              </div>
            )}
            {order.offerPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offer Price</span>
                <span className="font-medium">₹{order.offerPrice}</span>
              </div>
            )}
            {order.deliveryCharges > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium">₹{order.deliveryCharges}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span>₹{order.totalAmount || 0}</span>
            </div>
          </div>

          {order.paymentMethod && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <FiCreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-800">{order.paymentMethod}</p>
              </div>
            </div>
          )}
          {order.paymentStatus && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="font-medium text-gray-800">{order.paymentStatus.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h3>
          
          <div className="space-y-4">
            {timeline.map((event, index) => {
              const eventConfig = statusConfig[event.status] || statusConfig.placed;
              return (
                <div key={index} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eventConfig.bgColor} ${eventConfig.textColor}`}>
                      {React.createElement(eventConfig.icon, { className: 'w-5 h-5' })}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1 flex-1" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <h4 className="font-semibold text-gray-800">{eventConfig.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                    <p className="text-gray-600 mt-2">{event.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const OrderTracking = () => {
  const [view, setView] = useState('list'); // 'list' or 'details'
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch orders on component mount
  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/user/orders');
      const orders = response.data || response.orders || response || [];
      setUserOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setView('details');
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setView('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {view === 'list' ? 'My Orders' : 'Order Details'}
          </h1>
          <p className="text-gray-600">
            {view === 'list' 
              ? 'View and track all your orders'
              : 'Complete information about your order'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {view === 'list' && (
            <OrderList
              orders={userOrders}
              onSelectOrder={handleSelectOrder}
              loading={loading}
              onRefresh={fetchUserOrders}
            />
          )}

          {view === 'details' && selectedOrder && (
            <OrderDetails order={selectedOrder} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;