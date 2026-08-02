// src/components/WalletBalance.jsx — Rebuilt with v2 tokens, IBM Plex Mono balance, and 1px hairline border
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../Context/WalletContext';
import { Wallet as WalletIcon } from 'lucide-react';

const WalletBalance = ({ showActions = true }) => {
    const navigate = useNavigate();
    const { wallet, balance, loading, hasWallet } = useWallet();

    if (loading) {
        return (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-6 min-h-[160px] animate-pulse" />
        );
    }

    if (!hasWallet) {
        return null;
    }

    const isActive = wallet?.status === 'active';

    return (
        <div className={`rounded-[12px] p-6 text-white border border-[var(--color-border)] transition-colors duration-150 ${!isActive ? 'bg-[var(--color-text-muted)]' : 'bg-[var(--color-brand-green)]'}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-[10px] flex items-center justify-center">
                    <WalletIcon size={20} className="text-white" />
                </div>
                <span className={`py-0.5 px-2.5 rounded-full text-[11px] font-mono capitalize ${wallet?.status === 'active'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-500/20 text-red-100'
                    }`}>
                    {wallet?.status || 'active'}
                </span>
            </div>

            <div className="mb-5">
                <p className="text-xs text-white/80 font-body mb-1">Wallet Balance</p>
                <div className="text-3xl sm:text-4xl font-mono font-medium text-white tracking-tight">
                    ₹{balance?.toFixed(2) || '0.00'}
                </div>
            </div>

            {showActions && (
                <div className="flex gap-3">
                    <button
                        className="flex-1 py-2.5 px-4 bg-white/15 hover:bg-white/25 border border-white/20 rounded-[10px] text-xs font-medium font-body transition-colors text-white"
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
