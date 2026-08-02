// src/components/WalletTransactions.jsx — Rebuilt with v2 1px hairline cards, IBM Plex Mono transaction amounts, and Fraunces title
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../services/walletService';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft, Filter } from 'lucide-react';

const SOURCE_LABELS = {
    order_payment: 'Order Payment',
    refund: 'Refund',
    cashback: 'Cashback',
    reversal: 'Reversal',
    adjustment: 'Adjustment',
    payment: 'Payment'
};

const WalletTransactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({ type: null, source: null });
    const [showFilters, setShowFilters] = useState(false);

    const fetchTransactions = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await getTransactions({
                page,
                limit: 20,
                type: filter.type,
                source: filter.source,
            });
            if (response && response.data) {
                setTransactions(response.data.transactions || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

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
        <div className="min-h-[calc(100vh-80px)] bg-[var(--color-bg-app)] py-6 transition-colors duration-150">
            <div className="max-w-[800px] mx-auto px-4">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-[10px] w-9 h-9 flex items-center justify-center transition-colors text-[var(--color-text-primary)]"
                        onClick={() => navigate('/wallet')}
                        aria-label="Go back to wallet"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="flex-1 text-xl font-display font-semibold text-[var(--color-text-primary)] m-0">Transaction History</h1>
                    <button
                        className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-[10px] w-9 h-9 flex items-center justify-center transition-colors text-[var(--color-text-secondary)]"
                        onClick={() => setShowFilters(!showFilters)}
                        aria-label="Toggle filters"
                    >
                        <Filter size={18} />
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-4 mb-5 flex gap-4 flex-wrap items-end font-body">
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 font-body">Type</label>
                            <select
                                className="w-full py-2 px-3 border border-[var(--color-border)] rounded-[8px] text-xs font-body bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-green)]"
                                value={filter.type || 'all'}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 font-body">Source</label>
                            <select
                                className="w-full py-2 px-3 border border-[var(--color-border)] rounded-[8px] text-xs font-body bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-green)]"
                                value={filter.source || 'all'}
                                onChange={(e) => handleFilterChange('source', e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="order_payment">Order Payment</option>
                                <option value="refund">Refund</option>
                                <option value="cashback">Cashback</option>
                                <option value="reversal">Reversal</option>
                                <option value="adjustment">Adjustment</option>
                            </select>
                        </div>
                        <button
                            className="bg-transparent text-[var(--color-brand-green)] border border-[var(--color-brand-green)] py-2 px-4 rounded-[8px] text-xs font-medium font-body transition-colors hover:bg-[var(--color-tint-green)]"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                        <div className="w-10 h-10 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)] rounded-full animate-spin"></div>
                        <p className="text-[var(--color-text-muted)] text-xs font-body">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] py-12 px-6 text-center">
                        <p className="text-sm font-display font-semibold text-[var(--color-text-primary)] mb-1">No transactions found</p>
                        <span className="text-xs text-[var(--color-text-muted)] font-body">Your transaction history will appear here</span>
                    </div>
                ) : (
                    <>
                        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-3 flex flex-col gap-2.5">
                            {transactions.map((transaction) => (
                                <div key={transaction.id || transaction._id} className="flex items-start gap-3 p-3 bg-[var(--color-bg-app)] rounded-[10px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
                                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0">
                                        {transaction.type === 'credit' ? (
                                            <ArrowDownLeft className="text-[var(--color-brand-green)] bg-[var(--color-tint-green)] p-2 rounded-[8px]" size={18} />
                                        ) : (
                                            <ArrowUpRight className="text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-[8px]" size={18} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-body font-medium text-[var(--color-text-primary)] capitalize mb-0.5">
                                            {SOURCE_LABELS[transaction.source] || transaction.source}
                                        </div>
                                        <div className="text-[11px] text-[var(--color-text-muted)] font-body">
                                            {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                        </div>
                                        {transaction.description && (
                                            <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 font-body">{transaction.description}</div>
                                        )}
                                    </div>
                                    <div className={`text-xs sm:text-sm font-mono font-medium flex-shrink-0 ${transaction.type === 'credit' ? 'text-[var(--color-brand-green)]' : 'text-red-500'}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount ?? 0).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px]">
                                <button
                                    className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white py-2 px-4 rounded-[8px] text-xs font-medium font-body transition-colors disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-mono font-medium text-[var(--color-text-primary)]">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white py-2 px-4 rounded-[8px] text-xs font-medium font-body transition-colors disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
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
