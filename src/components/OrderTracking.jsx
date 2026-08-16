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
        color: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        label: "Placed",
      },
      processed: {
        icon: Package,
        color: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        label: "Processed",
      },
      shipped: {
        icon: Truck,
        color: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        label: "Shipped",
      },
      delivered: {
        icon: CheckCircle,
        color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        label: "Delivered",
      },
      cancelled: {
        icon: XCircle,
        color: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
        label: "Cancelled",
      },
    };

    const normalizedStatus = orderStatus?.toLowerCase() || "placed";
    const config = statusConfig[normalizedStatus] || statusConfig.placed;
    const Icon = config.icon;

    if (large) {
      return (
        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-mono font-medium whitespace-nowrap border ${config.color}`}
        >
          <Icon size={16} className="flex-shrink-0" />
          <span>{config.label}</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-mono font-medium whitespace-nowrap border ${config.color}`}
      >
        <Icon size={13} className="flex-shrink-0" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString, includeTime = false) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const formatCurrency = (amount) => {
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

  // Order List View
  const OrderListView = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-body transition-colors duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
            Order History
          </h1>
          <p className="font-body text-[var(--color-text-secondary)] text-xs mt-1">
            Track, manage and view all your past orders in one place.
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`font-body text-xs font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] transition-colors border ${showFilters ? "bg-[var(--color-brand-green)] text-white border-[var(--color-brand-green)]" : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {(status || startDate || endDate) && (
            <span className={`flex items-center justify-center w-4 h-4 text-[10px] font-mono rounded-full ${showFilters ? 'bg-white text-[var(--color-brand-green)]' : 'bg-[var(--color-brand-green)] text-white'}`}>
              {[status, startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel Focus */}
      {showFilters && (
        <div className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] p-5 sm:p-6 mb-8 transform origin-top transition-all duration-300 ease-out hover:border-[var(--color-brand-green)] hover:shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="font-body text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="font-body text-sm w-full px-4 py-2.5 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] focus:ring-2 focus:ring-[var(--color-tint-green)] focus:border-[var(--color-brand-green)] outline-none transition-all font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-green)]"
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
              <label className="font-body text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-body text-sm w-full px-4 py-2.5 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] focus:ring-2 focus:ring-[var(--color-tint-green)] focus:border-[var(--color-brand-green)] outline-none transition-all font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-green)]"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="total">Total Amount</option>
              </select>
            </div>

            <div>
              <label className="font-body text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="font-body text-sm w-full px-4 py-2.5 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] focus:ring-2 focus:ring-[var(--color-tint-green)] focus:border-[var(--color-brand-green)] outline-none transition-all font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-green)]"
              />
            </div>

            <div>
              <label className="font-body text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-body text-sm w-full px-4 py-2.5 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] focus:ring-2 focus:ring-[var(--color-tint-green)] focus:border-[var(--color-brand-green)] outline-none transition-all font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-green)]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex gap-3 justify-end mt-2">
              <button
                onClick={resetFilters}
                className="font-body text-sm px-6 py-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)] rounded-[10px] font-semibold transition-all"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="font-body text-sm px-8 py-2.5 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-[10px] shadow-md font-semibold transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-[var(--color-brand-green)]" size={40} />
          <p className="font-body text-[var(--color-text-muted)] font-medium animate-pulse">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 rounded-r-xl p-5 mb-6 flex items-start gap-4">
          <Info className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-body font-bold text-red-800 dark:text-red-300 mb-1">Error Loading Orders</h3>
            <p className="font-body text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] p-12 text-center flex flex-col items-center transition-all duration-300 hover:border-[var(--color-brand-green)]">
              <div className="w-20 h-20 bg-[var(--color-bg-app)] rounded-full flex items-center justify-center mb-4">
                <Package className="text-[var(--color-text-muted)]" size={40} />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">
                No orders discovered
              </h3>
              <p className="font-body text-[var(--color-text-muted)] max-w-sm mx-auto text-xs">
                Looks like you haven't placed any orders yet, or none match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] p-5 sm:p-6 hover:shadow-xl hover:border-[var(--color-brand-green)] transition-all duration-300 cursor-pointer group flex flex-col gap-5"
                  onClick={() => viewOrderDetails(order._id)}
                >
                  {/* Top Bar: Visual Focus on Date and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar size={16} className="text-[var(--color-text-muted)]" />
                        <span className="font-body text-sm font-semibold text-[var(--color-text-primary)]">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase">
                        Order ID: {order.orderId || `${order._id.slice(-6)}`}
                      </h3>
                    </div>
                    <div>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Middle Content: Items Preview */}
                  <div className="flex items-center gap-4 bg-[var(--color-bg-app)] rounded-[10px] p-3 border border-[var(--color-border)]">
                    <div className="flex -space-x-3 overflow-hidden ml-2">
                      {order.selectedVegetables?.slice(0, 4).map((item, idx) => (
                        item.vegetable?.image && (
                          <img
                            key={idx}
                            src={item.vegetable.image}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-bg-surface)] shadow-sm flex-shrink-0"
                          />
                        )
                      ))}
                      {order.selectedVegetables?.length > 4 && (
                        <div className="w-12 h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text-primary)] border-2 border-[var(--color-bg-surface)] shadow-sm z-10 relative">
                          +{order.selectedVegetables.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="font-body text-sm font-semibold text-[var(--color-text-primary)] pl-2">
                      {order.selectedVegetables?.length === 1 ? '1 Item' : `${order.selectedVegetables?.length || 0} Items`}
                    </p>
                  </div>

                  {/* Bottom Bar: Action & Huge Price Callout */}
                  <div className="flex items-end justify-between pt-1">
                    <div className="flex items-center gap-2 text-[var(--color-brand-green)] font-body text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      <span>View Order Details</span>
                      <ArrowRight size={18} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-body text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest mb-1">Total Amount</span>
                      <span className="font-mono text-2xl font-bold text-[var(--color-brand-green)] leading-none">
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
            <div className="mt-8 flex items-center justify-between bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] p-4 transition-all duration-300 hover:border-[var(--color-brand-green)]">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-body font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-app)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-body text-xs font-medium text-[var(--color-text-muted)]">Page</span>
                <span className="font-mono text-sm font-bold text-[var(--color-text-primary)] px-3 py-1 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[8px]">{page}</span>
                <span className="font-body text-xs font-medium text-[var(--color-text-muted)]">of {pagination.totalPages}</span>
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-body font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-app)] disabled:opacity-40 transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 animate-fade-in font-body">
        <button
          onClick={backToList}
          className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] mb-8 font-body text-sm font-semibold transition-colors w-fit"
        >
          <div className="p-1.5 bg-[var(--color-bg-surface)] rounded-full shadow-sm border border-[var(--color-border)] group-hover:border-[var(--color-brand-green)] transition-all duration-300">
            <ChevronLeft size={16} />
          </div>
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">

            {/* Super Header Box */}
            <div className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:border-[var(--color-brand-green)]">
              <div className="p-6 md:p-8 bg-[var(--color-bg-surface)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-body text-xs font-bold tracking-widest uppercase text-[var(--color-text-muted)]">Order Placed</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-strong)]"></div>
                      <span className="font-body text-sm font-semibold text-[var(--color-text-primary)]">{formatDate(order.orderDate, true)}</span>
                    </div>
                    <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">
                      {order.orderId || `#${order._id.slice(-6)}`}
                    </h1>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus, true)}
                  </div>
                </div>
              </div>

              {/* Metadata Stripe */}
              <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-app)] p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-stretch gap-4 p-4 rounded-[10px] bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 transition-all duration-300">
                  <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-body text-[11px] font-bold uppercase tracking-widest text-blue-800/70 dark:text-blue-300/80 mb-1">Payment Method</p>
                    <p className="font-body text-sm font-semibold text-[var(--color-text-primary)] capitalize">{order.paymentMethod}</p>
                    <span className="inline-block mt-1 font-mono text-xs font-medium px-2 py-0.5 rounded text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/40 w-fit">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Shipping Notice */}
                <div className="flex items-stretch gap-4 p-4 rounded-[10px] bg-[var(--color-tint-green)] border border-[var(--color-border)] transition-all duration-300">
                  <div className="bg-[var(--color-brand-green)]/15 p-3 rounded-lg flex items-center justify-center">
                    <Package className="text-[var(--color-brand-green)]" size={24} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-green)] mb-1">Fulfillment</p>
                    <p className="font-body text-sm font-semibold text-[var(--color-text-primary)]">{order.selectedVegetables?.length} Items</p>
                    <span className="inline-block mt-1 font-body text-xs font-medium text-[var(--color-text-muted)]">Packed with care</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items Detailed List */}
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)] mb-3.5 pl-1">
                Ordered Items
              </h2>
              <div className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-sm border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:border-[var(--color-brand-green)]">
                <div className="divide-y divide-[var(--color-border)]">
                  {order.selectedVegetables?.map((item, idx) => (
                    <div key={idx} className="p-4 sm:p-5 flex items-center gap-4 sm:gap-5 hover:bg-[var(--color-bg-app)] transition-colors">
                      {item.vegetable?.image ? (
                        <img
                          src={item.vegetable.image}
                          alt={item.vegetable.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] object-cover shadow-sm bg-[var(--color-bg-app)] p-1 border border-[var(--color-border)] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] bg-[var(--color-bg-app)] flex items-center justify-center flex-shrink-0">
                          <Package className="text-[var(--color-text-muted)]" size={24} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-body text-base sm:text-lg font-semibold text-[var(--color-text-primary)] truncate mb-1">
                          {item.vegetable?.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-[var(--color-brand-green)] bg-[var(--color-tint-green)] border border-[var(--color-border)] px-2 py-0.5 rounded-[6px]">
                            {item.quantity} × {item.weight}
                          </span>
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">
                            ({formatCurrency(item.pricePerUnit)} per unit)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-bg-surface)] rounded-[12px] shadow-md border border-[var(--color-border)] sticky top-8 transition-all duration-300 hover:border-[var(--color-brand-green)]">
              <div className="p-6 md:p-7">
                <h2 className="font-display text-lg font-semibold text-[var(--color-text-primary)] mb-5 border-b border-[var(--color-border)] pb-3">
                  Payment Summary
                </h2>

                <div className="space-y-3 font-body text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                    <span className="font-mono font-medium text-[var(--color-text-primary)]">
                      {formatCurrency(order.vegetablesTotal)}
                    </span>
                  </div>

                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-[var(--color-brand-green)] bg-[var(--color-tint-green)] p-2.5 rounded-[8px] border border-[var(--color-border)]">
                      <span>Promo Discount</span>
                      <span className="font-mono font-medium">
                        -{formatCurrency(order.couponDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Delivery Charges</span>
                    <span className="font-mono font-medium text-[var(--color-text-primary)]">
                      {order.deliveryCharges === 0
                        ? <span className="text-[var(--color-brand-green)] bg-[var(--color-tint-green)] px-2 py-0.5 rounded text-[10px] font-mono uppercase">Free</span>
                        : formatCurrency(order.deliveryCharges)}
                    </span>
                  </div>

                  {order.walletCreditUsed > 0 && (
                    <div className="flex justify-between items-center text-[var(--color-brand-green)] bg-[var(--color-tint-green)] p-2.5 rounded-[8px] border border-[var(--color-border)]">
                      <span>Wallet Credit Applied</span>
                      <span className="font-mono font-medium">
                        -{formatCurrency(order.walletCreditUsed)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total Area */}
              <div className="p-5 md:p-6 bg-[var(--color-brand-green)] rounded-b-[12px] text-white">
                <p className="font-body text-xs font-medium uppercase tracking-widest opacity-80 mb-1 text-center">
                  Grand Total
                </p>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-center tracking-tight text-white drop-shadow-md">
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
    <div className="min-h-screen bg-[var(--color-bg-app)] pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-20 transition-colors duration-150">
      {currentView === "list" ? <OrderListView /> : <OrderDetailView />}
    </div>
  );
};

export default OrderHistory;