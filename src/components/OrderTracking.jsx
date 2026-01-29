import React, { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader,
} from "lucide-react";
import { useAuth } from "../Context/AuthProvider";

// API call function (Unchanged)
const fetchOrderHistory = async (params, token) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.search) queryParams.append("search", params.search);

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_SERVER_URL}/api/user/order-history?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error("Failed to fetch order history");
  }

  const data = await response.json();
  return data.data;
};

const OrderHistory = () => {
  const { isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState("list");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination info
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });


  // Fetch orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setError("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");

        const data = await fetchOrderHistory(
          {
            page,
            limit,
            status,
            sortBy,
            sortOrder,
            startDate,
            endDate,
          },
          token,
        );

        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);

        if (
          err.message.includes("Session expired") ||
          err.message.includes("Authentication required")
        ) {
          setTimeout(() => {
            logout();
            window.location.href = "/login";
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [
    page,
    limit,
    status,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    isAuthenticated,
    logout,
  ]);

  // Medium Size Badges
  const getStatusBadge = (orderStatus) => {
    const statusConfig = {
      placed: {
        icon: Clock,
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        label: "Placed",
      },
      processed: {
        icon: Package,
        color: "bg-blue-50 text-blue-700 border border-blue-200",
        label: "Processed",
      },
      shipped: {
        icon: Truck,
        color: "bg-purple-50 text-purple-700 border border-purple-200",
        label: "Shipped",
      },
      delivered: {
        icon: CheckCircle,
        color: "bg-green-50 text-[#0e540b] border border-[#0e540b]/20",
        label: "Delivered",
      },
      cancelled: {
        icon: XCircle,
        color: "bg-red-50 text-red-700 border border-red-200",
        label: "Cancelled",
      },
    };

    const normalizedStatus = orderStatus?.toLowerCase() || "placed";
    const config = statusConfig[normalizedStatus] || statusConfig.placed;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-poppins font-medium whitespace-nowrap ${config.color}`}
      >
        <Icon size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        <span className="hidden xs:inline">{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // No client-side filtering needed as server handles it
  const filteredOrders = orders;

  const viewOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView("detail");
  };

  const backToList = () => {
    setCurrentView("list");
    setSelectedOrderId(null);
  };

  const applyFilters = () => {
    setPage(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setStatus("");
    setSortBy("date");
    setSortOrder("desc");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Order List View
  const OrderListView = () => (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-poppins text-xl sm:text-2xl font-bold text-[#2d3748]">
          Order History
        </h1>
        <p className="font-poppins text-[#718096] text-xs sm:text-sm mt-1">
          View and track all your recent orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="font-poppins text-xs sm:text-sm flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 text-[#2d3748] rounded-lg transition-all border border-gray-200 font-medium w-full sm:w-auto"
          >
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Filters</span>
            {(status || startDate || endDate) && (
              <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-[#f04700] text-white text-[9px] sm:text-[10px] rounded-full">
                {[status, startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="font-poppins text-[10px] sm:text-xs font-semibold text-[#2d3748] mb-1 sm:mb-1.5 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="font-poppins text-xs sm:text-sm w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="processed">Processed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="font-poppins text-[10px] sm:text-xs font-semibold text-[#2d3748] mb-1 sm:mb-1.5 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-poppins text-xs sm:text-sm w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="total">Total Amount</option>
              </select>
            </div>

            <div>
              <label className="font-poppins text-[10px] sm:text-xs font-semibold text-[#2d3748] mb-1 sm:mb-1.5 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="font-poppins text-xs sm:text-sm w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-poppins text-[10px] sm:text-xs font-semibold text-[#2d3748] mb-1 sm:mb-1.5 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-poppins text-xs sm:text-sm w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-1 sm:mt-2">
              <button
                onClick={resetFilters}
                className="font-poppins text-xs sm:text-sm px-4 py-2 text-[#718096] hover:bg-gray-50 rounded-lg border border-gray-200 transition-all w-full sm:w-auto"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="font-poppins text-xs sm:text-sm px-4 sm:px-5 py-2 bg-[#0e540b] hover:bg-[#0a3d08] text-white rounded-lg transition-all shadow-sm font-medium w-full sm:w-auto"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8 sm:py-12">
          <Loader className="animate-spin text-[#f04700]" size={28} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="font-poppins text-xs sm:text-sm text-red-800 font-medium">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
              <Package className="mx-auto text-gray-300 mb-2 sm:mb-3" size={36} />
              <h3 className="font-poppins text-sm sm:text-base font-bold text-[#2d3748]">
                No orders found
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#718096] mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5 hover:shadow-md hover:border-[#0e540b]/30 transition-all cursor-pointer group"
                  onClick={() => viewOrderDetails(order._id)}
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Top Row: Order ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-poppins text-sm sm:text-base lg:text-lg font-bold text-[#2d3748] group-hover:text-[#0e540b] transition-colors truncate flex-1">
                        {order.orderId || `#${order._id.slice(-6)}`}
                      </h3>
                      {getStatusBadge(order.orderStatus)}
                    </div>

                    {/* Middle Row: Order Info */}
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-[#718096]">
                      <div className="flex items-center gap-1 sm:gap-1.5 font-poppins text-[10px] sm:text-xs lg:text-sm">
                        <Calendar size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 font-poppins text-[10px] sm:text-xs lg:text-sm">
                        <Package size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {order.selectedVegetables?.length || 0} items
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 font-poppins text-xs sm:text-sm font-semibold text-[#2d3748]">
                        <span className="whitespace-nowrap">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Images & Arrow */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-x-auto flex-1 pb-1">
                        <div className="flex -space-x-2 sm:-space-x-3">
                          {order.selectedVegetables
                            ?.slice(0, 3)
                            .map(
                              (item, idx) =>
                                item.vegetable?.image && (
                                  <img
                                    key={idx}
                                    src={item.vegetable.image}
                                    alt=""
                                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white ring-1 ring-gray-100 shadow-sm flex-shrink-0"
                                  />
                                ),
                            )}
                        </div>
                        {order.selectedVegetables?.length > 3 && (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-500 flex-shrink-0">
                            +{order.selectedVegetables.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-[#0e540b] transition-colors flex-shrink-0 sm:w-5 sm:h-5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 sm:mt-5 flex items-center justify-between bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-2 sm:p-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>

              <span className="font-poppins text-xs sm:text-sm font-medium text-[#2d3748]">
                Page {page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} className="text-gray-600 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Order Detail View
  const OrderDetailView = () => {
    const order = orders.find((o) => o._id === selectedOrderId);

    if (!order) return null;

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <button
          onClick={backToList}
          className="font-poppins text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 text-[#718096] hover:text-[#0e540b] mb-4 sm:mb-5 transition-colors font-medium"
        >
          <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Orders
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5 border-b border-gray-100 pb-4 sm:pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                  <h1 className="font-poppins text-lg sm:text-xl lg:text-2xl font-bold text-[#2d3748] truncate">
                    {order.orderId || `Order #${order._id.slice(-6)}`}
                  </h1>
                  {getStatusBadge(order.orderStatus)}
                </div>
                <p className="font-poppins text-[10px] sm:text-xs lg:text-sm text-[#718096]">
                  Placed on {formatDate(order.orderDate)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-poppins text-xs sm:text-sm text-[#718096]">
                  Total Amount
                </p>
                <p className="font-poppins text-lg sm:text-xl lg:text-2xl font-bold text-[#0e540b]">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="font-poppins text-[10px] sm:text-xs font-bold uppercase text-[#718096] mb-1">
                Payment
              </p>
              <p className="font-poppins text-xs sm:text-sm font-medium text-[#2d3748]">
                {order.paymentMethod}
              </p>
              <p className="font-poppins text-[10px] sm:text-xs text-[#718096] capitalize mt-0.5">
                Status: {order.paymentStatus}
              </p>
            </div>
            <div>
              {/* Address placeholder */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Items List */}
          <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h2 className="font-poppins text-xs sm:text-sm font-bold text-[#2d3748] mb-3 sm:mb-4">
              Order Items ({order.selectedVegetables?.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {order.selectedVegetables?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-2.5 sm:p-3 bg-gray-50/50 rounded-lg sm:rounded-xl border border-gray-100 hover:border-[#0e540b]/20 transition-all"
                >
                  {item.vegetable?.image && (
                    <img
                      src={item.vegetable.image}
                      alt={item.vegetable.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover shadow-sm flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins text-xs sm:text-sm lg:text-base font-bold text-[#2d3748] truncate">
                      {item.vegetable?.name}
                    </h3>
                    <p className="font-poppins text-[10px] sm:text-xs lg:text-sm text-[#718096] mt-0.5">
                      {item.quantity} × {item.weight}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-poppins text-xs sm:text-sm lg:text-base font-bold text-[#2d3748]">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="font-poppins text-[10px] sm:text-xs text-[#718096]">
                      {formatCurrency(item.pricePerUnit)}/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="h-fit bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h2 className="font-poppins text-xs sm:text-sm font-bold text-[#2d3748] mb-3 sm:mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between font-poppins text-xs sm:text-sm text-[#718096]">
                <span>Vegetables Total</span>
                <span className="font-medium text-[#2d3748]">
                  {formatCurrency(order.vegetablesTotal)}
                </span>
              </div>

              {order.couponDiscount > 0 && (
                <div className="flex justify-between font-poppins text-xs sm:text-sm text-[#f04700]">
                  <span>Discount</span>
                  <span className="font-bold">
                    -{formatCurrency(order.couponDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-poppins text-xs sm:text-sm text-[#718096]">
                <span>Delivery Charges</span>
                <span className="font-medium text-[#2d3748]">
                  {order.deliveryCharges === 0
                    ? "FREE"
                    : formatCurrency(order.deliveryCharges)}
                </span>
              </div>

              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-poppins text-sm sm:text-base font-bold text-[#2d3748]">
                  Grand Total
                </span>
                <span className="font-poppins text-base sm:text-lg font-bold text-[#f04700]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-8 bg-gray-50">
      {currentView === "list" ? <OrderListView /> : <OrderDetailView />}
    </div>
  );
};

export default OrderHistory;