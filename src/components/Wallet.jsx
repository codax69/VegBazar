import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../Context/WalletContext';
import { getTransactions } from '../services/walletService';
import WalletBalance from './WalletBalance';
import { ArrowUpRight, ArrowDownLeft, Clock, AlertCircle } from 'lucide-react';

const Wallet = () => {
    const navigate = useNavigate();
    const { wallet, balance, loading, hasWallet, createWallet } = useWallet();
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
            setRecentTransactions(response.data.transactions || []);
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
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 pt-40">
                <div className="max-w-[800px] mx-auto px-4">
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0e540b] rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-funnel">Loading wallet...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasWallet) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 pt-40">
                <div className="max-w-[800px] mx-auto px-4">
                    <div className="bg-white rounded-2xl py-12 px-8 text-center shadow-sm">
                        <div className="text-gray-400 mb-4 flex justify-center">
                            <AlertCircle size={64} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-funnel">No Wallet Found</h2>
                        <p className="text-gray-500 mb-6 font-funnel">Create a wallet to start using VegBazar Wallet for payments and cashback.</p>
                        <button
                            className="bg-gradient-to-br from-[#0e540b] to-[#165a13] text-white border-0 py-3.5 px-8 rounded-[10px] text-base font-semibold font-funnel cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(14,84,11,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(14,84,11,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
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
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 pt-40">
            <div className="max-w-[800px] mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-[28px] font-bold text-gray-900 font-funnel m-0">My Wallet</h1>
                </div>

                <WalletBalance showActions={false} />

                <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-semibold text-gray-900 m-0 font-funnel">Recent Transactions</h2>
                        <button
                            className="bg-transparent text-[#0e540b] border-0 py-2 px-4 rounded-lg text-sm font-semibold font-funnel cursor-pointer transition-all duration-200 hover:bg-[rgba(14,84,11,0.1)]"
                            onClick={() => navigate('/wallet/transactions')}
                        >
                            View All
                        </button>
                    </div>

                    {loadingTransactions ? (
                        <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
                            <div className="w-6 h-6 border-[3px] border-gray-200 border-t-[#0e540b] rounded-full animate-spin"></div>
                            <p className="font-funnel">Loading transactions...</p>
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                            <Clock size={48} />
                            <p className="text-base font-semibold text-gray-500 m-0 font-funnel">No transactions yet</p>
                            <span className="text-sm text-gray-400 font-funnel">Your transaction history will appear here</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {recentTransactions.map((transaction) => (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
