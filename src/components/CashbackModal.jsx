// src/components/CashbackModal.jsx — Rebuilt with v2 tokens, Fraunces heading, and IBM Plex Mono currency
import React, { useEffect, useState } from 'react';
import { X, Wallet, TrendingUp, Sparkles } from 'lucide-react';

const CashbackModal = ({ isOpen, cashbackAmount, newBalance, onClose }) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setAnimate(true), 100);

            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => {
            setShow(false);
            onClose();
        }, 300);
    };

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${animate ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] p-6 sm:p-8 max-w-[420px] w-full relative transition-all duration-200 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    onClick={handleClose}
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-[var(--color-tint-green)] rounded-full w-14 h-14 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-[var(--color-brand-green)]" />
                    </div>
                </div>

                {/* Heading */}
                <h2 className="font-display text-xl font-semibold text-[var(--color-brand-green)] text-center mb-4">
                    🎉 Cashback Earned!
                </h2>

                {/* Cashback Amount Banner */}
                <div className="bg-[var(--color-brand-green)] rounded-[10px] p-5 mb-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs font-body mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Cashback Credited</span>
                    </div>
                    <div className="font-mono text-3xl sm:text-4xl font-medium text-white">
                        ₹{cashbackAmount?.toFixed(2) || '0.00'}
                    </div>
                </div>

                {/* New Balance Pill */}
                <div className="flex items-center gap-3 bg-[var(--color-tint-green)] border border-[var(--color-border)] rounded-[10px] p-3.5 mb-5">
                    <Wallet className="w-5 h-5 text-[var(--color-brand-green)] flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[11px] text-[var(--color-text-muted)] font-body">New Wallet Balance</span>
                        <span className="text-base font-mono font-medium text-[var(--color-text-primary)]">₹{newBalance?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleClose}
                    className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-body text-xs font-medium py-2.5 px-4 rounded-[10px] transition-colors"
                >
                    Got It
                </button>
            </div>
        </div>
    );
};

export default CashbackModal;
