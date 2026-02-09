import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../Context/WalletContext';
import { Wallet as WalletIcon, TrendingUp, TrendingDown } from 'lucide-react';

const WalletBalance = ({ showActions = true }) => {
    const navigate = useNavigate();
    const { wallet, balance, loading, hasWallet } = useWallet();

    if (loading) {
        return (
            <div className="bg-gray-100 rounded-2xl p-6 text-white shadow-[0_10px_40px_rgba(14,84,11,0.2)] relative overflow-hidden transition-all duration-200 min-h-[180px]">
                <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-lg"></div>
            </div>
        );
    }

    if (!hasWallet) {
        return null;
    }

    const isActive = wallet?.status === 'active';

    return (
        <div className={`rounded-2xl p-6 text-whitev pt-10 shadow-[0_10px_40px_rgba(14,84,11,0.2)] relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_48px_rgba(14,84,11,0.3)] ${!isActive ? 'bg-gradient-to-br from-gray-500 to-gray-600 opacity-70' : 'bg-gradient-to-br from-[#0e540b] to-[#165a13]'}`}>
            <div className="flex justify-between items-center mb-5">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-[10px]">
                    <WalletIcon size={24} />
                </div>
                <div className="wallet-status">
                    <span className={`py-1 px-3 rounded-[20px] text-xs font-semibold capitalize font-funnel ${wallet?.status === 'active'
                        ? 'bg-green-500/20 text-green-200 border border-green-200/30'
                        : 'bg-red-500/20 text-red-200 border border-red-200/30'
                        }`}>
                        {wallet?.status || 'active'}
                    </span>
                </div>
            </div>

            <div className="mb-5">
                <div className="text-sm text-white/80 mb-2 font-funnel">Wallet Balance</div>
                <div className="text-4xl font-bold text-white font-funnel tracking-tight">
                    ₹{balance?.toFixed(2) || '0.00'}
                </div>
            </div>

            {showActions && (
                <div className="flex gap-3">
                    <button
                        className="flex-1 py-3 px-5 border border-white/20 rounded-[10px] text-sm font-semibold font-funnel cursor-pointer transition-all duration-200 bg-white/15 text-white hover:bg-white/25 hover:-translate-y-px active:translate-y-0"
                        onClick={() => navigate('/wallet/transactions')}
                    >
                        View Transactions
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletBalance;
