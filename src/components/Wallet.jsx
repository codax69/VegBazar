// src/components/Wallet.jsx — Rebuilt with v2 1px hairline cards, Fraunces titles, and IBM Plex Mono figures
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../Context/WalletContext';
import { getTransactions } from '../services/walletService';
import WalletBalance from './WalletBalance';
import { ArrowUpRight, ArrowDownLeft, Clock, AlertCircle } from 'lucide-react';

const SOURCE_LABELS = {
    order_payment: 'Order Payment',
    refund: 'Refund',
    cashback: 'Cashback',
    reversal: 'Reversal',
    adjustment: 'Adjustment',
    payment: 'Payment'
};

const Wallet = () => {
    const navigate = useNavigate();
    const { loading, hasWallet, createWallet } = useWallet();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (hasWallet) {
            fetchRecentTransactions();
        }
    }, [hasWallet]);

    const fetchRecentTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const response = await getTransactions({ page: 1, limit: 5 });
            if (response && response.data) {
                setRecentTransactions(response.data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleCreateWallet = async () => {
        setCreating(true);
        try {
            await createWallet();
        } catch (error) {
            console.error('Error creating wallet:', error);
            alert('Failed to create wallet. Please try again.');
        } finally {
            setCreating(false);
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

    if (loading) {
        return (
            <div className="py-8 sm:py-12 bg-[var(--color-bg-app)] min-h-screen transition-colors duration-150 font-body">
                <div className="max-w-[800px] mx-auto px-4">
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)] rounded-full animate-spin" />
                        <p className="text-[var(--color-text-muted)] text-xs font-body">Loading wallet...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasWallet) {
        return (
            <div className="py-8 sm:py-12 bg-[var(--color-bg-app)] min-h-screen transition-colors duration-150 font-body">
                <div className="max-w-[800px] mx-auto px-4">
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] py-12 px-8 text-center shadow-xs">
                        <div className="text-[var(--color-text-muted)] mb-3 flex justify-center">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="text-xl font-display font-semibold text-[var(--color-text-primary)] mb-2">No Wallet Found</h2>
                        <p className="text-[var(--color-text-secondary)] text-xs mb-6 font-body">Create a wallet to start using VegBazar Wallet for payments and cashback.</p>
                        <button
                            className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white py-2.5 px-6 rounded-[10px] text-xs font-medium font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateWallet}
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create Wallet'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 bg-[var(--color-bg-app)] min-h-screen transition-colors duration-150 font-body">
            <div className="max-w-[800px] mx-auto px-4">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-display font-semibold text-[var(--color-text-primary)]">My Wallet</h1>
                </div>

                <WalletBalance showActions={false} />

                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-5 sm:p-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">Recent Transactions</h2>
                        <button
                            className="text-[var(--color-brand-green)] hover:underline font-body text-xs font-medium"
                            onClick={() => navigate('/wallet/transactions')}
                        >
                            View All
                        </button>
                    </div>

                    {loadingTransactions ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-text-muted)] text-xs font-body">
                            <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)] rounded-full animate-spin" />
                            <span>Loading transactions...</span>
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-muted)] gap-2">
                            <Clock size={36} />
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] font-body">No transactions yet</p>
                            <span className="text-[11px] text-[var(--color-text-muted)] font-body">Your transaction history will appear here</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction.id || transaction._id} className="flex items-center justify-between p-3.5 bg-[var(--color-bg-app)] rounded-[10px] border border-[var(--color-border)] text-xs font-body">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                                            {transaction.type === 'credit' ? (
                                                <ArrowDownLeft className="text-[var(--color-brand-green)]" size={16} />
                                            ) : (
                                                <ArrowUpRight className="text-red-500" size={16} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-[var(--color-text-primary)] capitalize">
                                                {SOURCE_LABELS[transaction.source] || transaction.source}
                                            </div>
                                            <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                                                {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-medium text-sm flex-shrink-0 ${transaction.type === 'credit' ? 'text-[var(--color-brand-green)]' : 'text-red-600'}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount ?? 0).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
