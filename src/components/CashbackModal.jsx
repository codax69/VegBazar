import React, { useEffect, useState } from 'react';
import { X, Wallet, TrendingUp, Sparkles } from 'lucide-react';

const CashbackModal = ({ isOpen, cashbackAmount, newBalance, onClose }) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setAnimate(true), 100);

            // Auto-close after 5 seconds
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
            className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`bg-gradient-to-br from-white to-[#f0fcf6] rounded-3xl p-8 max-w-[450px] w-full relative shadow-[0_20px_60px_rgba(14,84,11,0.3)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${animate ? 'scale-100 translate-y-0 opacity-100' : 'scale-80 translate-y-5 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 bg-white/90 border-0 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 z-10 hover:bg-[#fee] hover:rotate-90"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Confetti Animation */}
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2.5 h-2.5 -top-2.5 animate-[confetti-fall_3s_linear_forwards]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                backgroundColor: ['#0e540b', '#22c55e', '#fbbf24', '#f97316'][Math.floor(Math.random() * 4)]
                            }}
                        />
                    ))}
                </div>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-full w-20 h-20 flex items-center justify-center shadow-[0_8px_24px_rgba(251,191,36,0.3)] animate-[pulse-glow_2s_ease-in-out_infinite]">
                        <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                    </div>
                </div>

                {/* Heading */}
                <h2 className="font-funnel text-[1.75rem] font-bold text-[#0e540b] text-center mb-6">
                    🎉 Cashback Earned!
                </h2>

                {/* Cashback Amount */}
                <div className="bg-gradient-to-br from-[#0e540b] to-[#166534] rounded-2xl p-6 mb-6 shadow-[0_8px_24px_rgba(14,84,11,0.2)]">
                    <div className="flex items-center gap-2 text-[#d1fae5] text-sm font-medium mb-2 font-funnel">
                        <TrendingUp className="w-5 h-5" />
                        <span>Cashback Credited</span>
                    </div>
                    <div className="font-funnel text-5xl font-extrabold text-white text-center leading-none shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                        ₹{cashbackAmount?.toFixed(2) || '0.00'}
                    </div>
                </div>

                {/* New Balance */}
                <div className="flex items-center gap-3 bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-xl p-4 mb-6">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#166534] font-medium font-funnel">New Wallet Balance</span>
                        <span className="text-xl font-bold text-[#0e540b] font-funnel">₹{newBalance?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                {/* Message */}
                <p className="text-center text-gray-600 text-sm leading-relaxed mb-6 font-funnel">
                    Your cashback has been added to your wallet and can be used for your next order!
                </p>

                {/* Action Button */}
                <button
                    className="w-full bg-gradient-to-br from-[#0e540b] to-[#166534] text-white border-0 rounded-xl p-4 text-base font-semibold font-funnel cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(14,84,11,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(14,84,11,0.4)] active:translate-y-0"
                    onClick={handleClose}
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default CashbackModal;
