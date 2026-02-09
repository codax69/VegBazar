import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../services/walletService';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, Filter } from 'lucide-react';

const WalletTransactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({ type: null, source: null });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [page, filter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await getTransactions({
                page,
                limit: 20,
                type: filter.type,
                source: filter.source,
            });
            setTransactions(response.data.transactions || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleFilterChange = (filterType, value) => {
        setFilter((prev) => ({
            ...prev,
            [filterType]: value === 'all' ? null : value,
        }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilter({ type: null, source: null });
        setPage(1);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-6">
            <div className="max-w-[800px] mx-auto px-4">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        className="bg-white border border-gray-200 rounded-[10px] w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
                        onClick={() => navigate('/wallet')}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="flex-1 text-2xl font-bold text-gray-900 font-funnel m-0">Transaction History</h1>
                    <button
                        className="bg-white border border-gray-200 rounded-[10px] w-10 h-10 flex items-center justify-center cursor-pointer transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:border-[#0e540b] hover:text-[#0e540b]"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-xl p-5 mb-5 shadow-sm flex gap-4 flex-wrap items-end">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 font-funnel">Type</label>
                            <select
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm font-funnel bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-[#0e540b] focus:shadow-[0_0_0_3px_rgba(14,84,11,0.1)]"
                                value={filter.type || 'all'}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 font-funnel">Source</label>
                            <select
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm font-funnel bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-[#0e540b] focus:shadow-[0_0_0_3px_rgba(14,84,11,0.1)]"
                                value={filter.source || 'all'}
                                onChange={(e) => handleFilterChange('source', e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="order">Order</option>
                                <option value="refund">Refund</option>
                                <option value="cashback">Cashback</option>
                                <option value="payment">Payment</option>
                            </select>
                        </div>
                        <button
                            className="bg-transparent text-[#0e540b] border border-[#0e540b] py-2.5 px-5 rounded-lg text-sm font-semibold font-funnel cursor-pointer transition-all duration-200 hover:bg-[rgba(14,84,11,0.1)]"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0e540b] rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-funnel">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white rounded-2xl py-12 px-8 text-center shadow-sm">
                        <p className="text-base font-semibold text-gray-500 m-0 mb-2 font-funnel">No transactions found</p>
                        <span className="text-sm text-gray-400 font-funnel">Your transaction history will appear here</span>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                            {transactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                                        {transaction.type === 'credit' ? (
                                            <ArrowDownLeft className="text-green-500 bg-[rgba(34,197,94,0.1)] p-2.5 rounded-[10px]" size={20} />
                                        ) : (
                                            <ArrowUpRight className="text-red-500 bg-[rgba(239,68,68,0.1)] p-2.5 rounded-[10px]" size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] font-semibold text-gray-900 capitalize font-funnel mb-1">{transaction.source}</div>
                                        <div className="text-[13px] text-gray-500 font-funnel">
                                            {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                        </div>
                                        {transaction.description && (
                                            <div className="text-[13px] text-gray-400 mt-1 font-funnel">{transaction.description}</div>
                                        )}
                                    </div>
                                    <div className={`text-base font-bold font-funnel flex-shrink-0 ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amountInRupees?.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6 p-5 bg-white rounded-xl shadow-sm">
                                <button
                                    className="bg-[#0e540b] text-white border-0 py-2.5 px-5 rounded-lg text-sm font-semibold font-funnel cursor-pointer transition-all duration-200 hover:bg-[#165a13] hover:-translate-y-px disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-semibold text-gray-700 font-funnel">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="bg-[#0e540b] text-white border-0 py-2.5 px-5 rounded-lg text-sm font-semibold font-funnel cursor-pointer transition-all duration-200 hover:bg-[#165a13] hover:-translate-y-px disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WalletTransactions;
