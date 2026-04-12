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
  CreditCard,
  ArrowRight,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

// API call function
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
    `/api/user/order-history?${queryParams.toString()}`,
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
  const navigate = useNavigate();
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
            navigate("/login");
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

  // Medium Size Badges aligned for better hierarchy
  const getStatusBadge = (orderStatus, large = false) => {
    const statusConfig = {
      placed: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Placed",
      },
      processed: {
        icon: Package,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Processed",
      },
      shipped: {
        icon: Truck,
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Shipped",
      },
      delivered: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      cancelled: {
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    const normalizedStatus = orderStatus?.toLowerCase() || "placed";
    const config = statusConfig[normalizedStatus] || statusConfig.placed;
    const Icon = config.icon;

    if (large) {
      return (
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-funnel font-bold shadow-sm whitespace-nowrap border ${config.color}`}
        >
          <Icon size={18} className="flex-shrink-0" />
          <span>{config.label}</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-funnel font-bold whitespace-nowrap border ${config.color}`}
      >
        <Icon size={14} className="flex-shrink-0" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString, includeTime = false) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatCurrency = (amount) => {
    console.log(amount)
    return `₹${amount.toString()}`;
  };

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

  // Order List View - Visual Hierarchy Enforced
  const OrderListView = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-funnel text-2xl font-bold text-gray-800 tracking-tight">
            Order History
          </h1>
          <p className="font-funnel text-gray-500 text-sm mt-1">
            Track, manage and view all your past orders in one place.
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`font-funnel text-sm flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold border-2 ${showFilters ? "bg-[#0e540b] text-white border-[#0e540b]" : "bg-[#f5f1e8] text-gray-800 border-gray-300 hover:border-[#0e540b] hover:shadow-xl"}`}
        >
          <Filter size={18} />
          <span>Filters</span>
          {(status || startDate || endDate) && (
            <span className={`flex items-center justify-center w-5 h-5 text-[10px] rounded-full ${showFilters ? 'bg-[#f5f1e8] text-[#0e540b]' : 'bg-[#f04700] text-white'}`}>
              {[status, startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel Focus */}
      {showFilters && (
        <div className="bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 p-5 sm:p-6 mb-8 transform origin-top transition-all duration-300 ease-out hover:border-[#0e540b] hover:shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="font-funnel text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="font-funnel text-sm w-full px-4 py-2.5 bg-[#f5f1e8] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-[#0e540b] focus:bg-[#f5f1e8] outline-none transition-all duration-300 font-medium text-gray-800 hover:border-[#0e540b] hover:shadow-md"
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
              <label className="font-funnel text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-2 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-funnel text-sm w-full px-4 py-2.5 bg-[#f5f1e8] border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0e540b] focus:border-[#0e540b] focus:bg-[#f5f1e8] outline-none transition-all duration-300 font-medium text-[#2d3748] hover:border-[#0e540b] hover:shadow-md"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="total">Total Amount</option>
              </select>
            </div>

            <div>
              <label className="font-funnel text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="font-funnel text-sm w-full px-4 py-2.5 bg-[#f5f1e8] border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0e540b] focus:border-[#0e540b] focus:bg-[#f5f1e8] outline-none transition-all duration-300 font-medium text-[#2d3748] hover:border-[#0e540b] hover:shadow-md"
              />
            </div>

            <div>
              <label className="font-funnel text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-funnel text-sm w-full px-4 py-2.5 bg-[#f5f1e8] border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0e540b] focus:border-[#0e540b] focus:bg-[#f5f1e8] outline-none transition-all duration-300 font-medium text-[#2d3748] hover:border-[#0e540b] hover:shadow-md"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex gap-3 justify-end mt-2">
              <button
                onClick={resetFilters}
                className="font-funnel text-sm px-6 py-2.5 text-[#718096] hover:bg-gray-100 rounded-xl font-bold transition-all"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="font-funnel text-sm px-8 py-2.5 bg-[#f04700] hover:bg-[#d63f00] text-white rounded-lg shadow-md font-bold transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-[#0e540b]" size={40} />
          <p className="font-funnel text-gray-500 font-medium animate-pulse">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 mb-6 flex items-start gap-4">
          <Info className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-funnel font-bold text-red-800 mb-1">Error Loading Orders</h3>
            <p className="font-funnel text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 p-12 text-center flex flex-col items-center transition-all duration-300 hover:border-[#0e540b] hover:shadow-xl">
              <div className="w-20 h-20 bg-[#f5f1e8] rounded-full flex items-center justify-center mb-4">
                <Package className="text-gray-400" size={40} />
              </div>
              <h3 className="font-funnel text-xl font-bold text-[#2d3748] mb-2">
                No orders discovered
              </h3>
              <p className="font-funnel text-gray-500 max-w-sm mx-auto">
                Looks like you haven't placed any orders yet, or none match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 p-5 sm:p-6 hover:shadow-xl hover:border-[#0e540b] transition-all duration-300 cursor-pointer group flex flex-col gap-5"
                  onClick={() => viewOrderDetails(order._id)}
                >
                  {/* Top Bar: Visual Focus on Date and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar size={16} className="text-[#a0aec0]" />
                        <span className="font-funnel text-sm font-bold text-gray-700">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      <h3 className="font-funnel text-xs font-semibold text-gray-400 tracking-wide uppercase">
                        Order ID: {order.orderId || `${order._id.slice(-6)}`}
                      </h3>
                    </div>
                    <div>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Middle Content: Items Preview */}
                  <div className="flex items-center gap-4 bg-[#f5f1e8]/50 rounded-lg p-3 border border-gray-50">
                    <div className="flex -space-x-3 overflow-hidden ml-2">
                      {order.selectedVegetables?.slice(0, 4).map((item, idx) => (
                        item.vegetable?.image && (
                          <img
                            key={idx}
                            src={item.vegetable.image}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                          />
                        )
                      ))}
                      {order.selectedVegetables?.length > 4 && (
                        <div className="w-12 h-12 rounded-full bg-[#e2e8f0] flex items-center justify-center text-sm font-bold text-[#4a5568] border-2 border-white shadow-sm z-10 relative">
                          +{order.selectedVegetables.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="font-funnel text-sm font-bold text-gray-700 pl-2">
                      {order.selectedVegetables?.length === 1 ? '1 Item' : `${order.selectedVegetables?.length || 0} Items`}
                    </p>
                  </div>

                  {/* Bottom Bar: Action & Huge Price Callout */}
                  <div className="flex items-end justify-between pt-1">
                    <div className="flex items-center gap-2 text-[#0e540b] font-funnel text-sm font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Order Details</span>
                      <ArrowRight size={18} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-funnel text-[10px] text-[#a0aec0] uppercase font-bold tracking-widest mb-1">Total Amount</span>
                      <span className="font-funnel text-2xl font-bold text-[#0e540b] leading-none">
                        {formatCurrency(order.finalPayableAmount || order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Component */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 p-4 transition-all duration-300 hover:border-[#0e540b] hover:shadow-xl">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-funnel font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-funnel text-sm font-medium text-gray-500">Page</span>
                <span className="font-funnel text-base font-bold text-[#2d3748] px-3 py-1 bg-gray-100 rounded-lg">{page}</span>
                <span className="font-funnel text-sm font-medium text-gray-500">of {pagination.totalPages}</span>
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-funnel font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Order Detail View - Focused Summary and Clear Layout
  const OrderDetailView = () => {
    const order = orders.find((o) => o._id === selectedOrderId);

    if (!order) return null;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 animate-fade-in">
        <button
          onClick={backToList}
          className="group flex items-center gap-2 text-gray-500 hover:text-[#0e540b] mb-8 font-funnel text-sm font-bold transition-colors w-fit"
        >
          <div className="p-1.5 bg-[#f5f1e8] rounded-full shadow-sm border border-gray-300 group-hover:border-[#0e540b] transition-all duration-300">
            <ChevronLeft size={16} />
          </div>
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">

            {/* Super Header Box */}
            <div className="bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 overflow-hidden transition-all duration-300 hover:border-[#0e540b] hover:shadow-xl">
              <div className="p-6 md:p-8 bg-[#f5f1e8]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-funnel text-xs font-bold tracking-widest uppercase text-gray-400">Order Placed</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span className="font-funnel text-sm font-bold text-gray-700">{formatDate(order.orderDate, true)}</span>
                    </div>
                    <h1 className="font-funnel text-2xl font-bold text-gray-800 tracking-tight">
                      {order.orderId || `#${order._id.slice(-6)}`}
                    </h1>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus, true)}
                  </div>
                </div>
              </div>

              {/* Metadata Stripe */}
              <div className="border-t border-gray-100 bg-[#f5f1e8] p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-stretch gap-4 p-4 rounded-xl bg-blue-50/50 border border-gray-300 transition-all duration-300 hover:border-[#0e540b] hover:shadow-md">
                  <div className="bg-blue-100 p-3 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-blue-600" size={24} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-funnel text-[11px] font-bold uppercase tracking-widest text-blue-800/60 mb-1">Payment Method</p>
                    <p className="font-funnel text-base font-bold text-gray-800 capitalize">{order.paymentMethod}</p>
                    <span className="inline-block mt-1 font-funnel text-xs font-bold px-2 py-0.5 rounded text-blue-700 bg-blue-100/50 w-fit">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Shipping Notice placeholder to balance layout */}
                <div className="flex items-stretch gap-4 p-4 rounded-xl bg-[#0e540b]/5 border border-gray-300 transition-all duration-300 hover:border-[#0e540b] hover:shadow-md">
                  <div className="bg-[#0e540b]/10 p-3 rounded-lg flex items-center justify-center">
                    <Package className="text-[#0e540b]" size={24} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-funnel text-[11px] font-bold uppercase tracking-widest text-[#0e540b]/60 mb-1">Fulfillment</p>
                    <p className="font-funnel text-base font-bold text-gray-800">{order.selectedVegetables?.length} Items</p>
                    <span className="inline-block mt-1 font-funnel text-xs font-bold text-[#0e540b]/80">Packed with care</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items Detailed List */}
            <div>
              <h2 className="font-funnel text-xl font-bold text-gray-800 mb-4 pl-2">
                Ordered Items
              </h2>
              <div className="bg-[#f5f1e8] rounded-xl shadow-sm border border-gray-300 overflow-hidden transition-all duration-300 hover:border-[#0e540b] hover:shadow-xl">
                <div className="divide-y divide-gray-50">
                  {order.selectedVegetables?.map((item, idx) => (
                    <div key={idx} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-[#f5f1e8]/50 transition-colors">
                      {item.vegetable?.image ? (
                        <img
                          src={item.vegetable.image}
                          alt={item.vegetable.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm bg-[#f5f1e8] p-1 border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="text-gray-400" size={24} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-funnel text-base sm:text-lg font-bold text-gray-800 truncate mb-1">
                          {item.vegetable?.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="font-funnel text-sm font-bold text-[#0e540b] bg-[#0e540b]/10 px-2 py-0.5 rounded-lg">
                            {item.quantity} × {item.weight}
                          </span>
                          <span className="font-funnel text-xs font-medium text-gray-500">
                            ({formatCurrency(item.pricePerUnit)} per unit)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-funnel text-lg font-bold text-gray-800">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary - Highest Visual Priority for Price */}
          <div className="lg:col-span-1">
            <div className="bg-[#f5f1e8] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-300 sticky top-8 transition-all duration-300 hover:border-[#0e540b] hover:shadow-xl">
              <div className="p-6 md:p-8">
                <h2 className="font-funnel text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                  Payment Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center font-funnel">
                    <span className="text-sm font-bold text-gray-500">Subtotal</span>
                    <span className="text-base font-bold text-gray-800">
                      {formatCurrency(order.vegetablesTotal)}
                    </span>
                  </div>

                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between items-center font-funnel bg-red-50 p-3 rounded-lg border border-gray-300 transition-all duration-300 hover:border-[#0e540b] hover:shadow-md">
                      <span className="text-sm font-bold text-[#f04700]">Promo Discount</span>
                      <span className="text-base font-bold text-[#f04700]">
                        -{formatCurrency(order.couponDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-funnel">
                    <span className="text-sm font-bold text-gray-500">Delivery Charges</span>
                    <span className="text-base font-bold text-gray-800">
                      {order.deliveryCharges === 0
                        ? <span className="text-[#0e540b] bg-[#0e540b]/10 px-2 py-0.5 rounded uppercase text-xs tracking-wider">Free</span>
                        : formatCurrency(order.deliveryCharges)}
                    </span>
                  </div>

                  {order.walletCreditUsed > 0 && (
                    <div className="flex justify-between items-center font-funnel bg-[#0e540b]/5 p-3 rounded-lg border border-gray-300 transition-all duration-300 hover:border-[#0e540b] hover:shadow-md">
                      <span className="text-sm font-bold text-[#0e540b]">Wallet Credit Applied</span>
                      <span className="text-base font-bold text-[#0e540b]">
                        -{formatCurrency(order.walletCreditUsed)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Massive Grand Total Area */}
              <div className="p-6 md:p-8 bg-[#31482d] rounded-b-[1.4rem] text-white">
                <p className="font-funnel text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 text-center">
                  Grand Total
                </p>
                <p className="font-funnel text-3xl font-bold text-center tracking-tight text-white drop-shadow-md">
                  {formatCurrency(order.finalPayableAmount || order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8]/50 pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-20">
      {currentView === "list" ? <OrderListView /> : <OrderDetailView />}
    </div>
  );
};

export default OrderHistory;