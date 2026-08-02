import React, { useState, useCallback } from "react";
import { FiPercent, FiCheck, FiX, FiTag, FiAlertCircle } from "react-icons/fi";

const CouponCodeSection = ({
  onApplyCoupon,
  appliedCoupon = null,
  onRemoveCoupon,
  subtotal = 0,
  isMobile = false
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    setError("");

    try {
      await onApplyCoupon(couponCode.toUpperCase().trim());
      setCouponCode("");
    } catch (err) {
      setError(err.message || "Invalid coupon code");
    } finally {
      setIsApplying(false);
    }
  }, [couponCode, onApplyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    onRemoveCoupon();
    setCouponCode("");
    setError("");
  }, [onRemoveCoupon]);

  const handleInputChange = useCallback((e) => {
    setCouponCode(e.target.value.toUpperCase());
    setError("");
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleApplyCoupon();
    }
  }, [handleApplyCoupon]);

  return (
    <div className={`bg-[var(--color-bg-app)] rounded-[10px] border border-[var(--color-border)] ${isMobile ? 'p-3' : 'p-4'} font-body`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-tint-green)] p-1.5 rounded-[6px]">
            <FiTag className={`${isMobile ? 'size-4' : 'size-5'} text-[var(--color-brand-green)]`} />
          </div>
          <h3 className={`font-display font-semibold text-[var(--color-text-primary)] ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Apply Coupon
          </h3>
        </div>
        {appliedCoupon && (
          <div className="bg-[var(--color-brand-green)] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <FiCheck className="size-3" />
            <span className="text-[10px] font-mono">Applied</span>
          </div>
        )}
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <div className="bg-[var(--color-bg-surface)] rounded-[8px] p-3 border border-[var(--color-brand-green)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-[var(--color-tint-green)] p-1.5 rounded-md">
                <FiPercent className="size-4 text-[var(--color-brand-green)]" />
              </div>
              <div>
                <p className={`font-mono font-medium text-[var(--color-brand-green)] ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {appliedCoupon.code}
                </p>
                <p className={`text-[var(--color-text-secondary)] font-body ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {appliedCoupon.discountType === "percentage"
                    ? `${appliedCoupon.discountValue}% OFF`
                    : `₹${appliedCoupon.discountValue} OFF`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              aria-label="Remove coupon"
            >
              <FiX className={`${isMobile ? 'size-4' : 'size-5'}`} />
            </button>
          </div>

          {/* Discount Amount */}
          <div className="bg-[var(--color-tint-green)] text-[var(--color-brand-green)] rounded-[6px] p-2 flex justify-between items-center">
            <span className={`font-body font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              You save
            </span>
            <span className={`font-mono font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
              ₹{appliedCoupon.discount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      ) : (
        /* Coupon Input */
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={couponCode}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter coupon code"
                disabled={isApplying}
                className={`w-full ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2.5'} bg-white border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-funnel font-semibold text-gray-800 placeholder-gray-400 uppercase disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {couponCode && !isApplying && (
                <button
                  onClick={() => {
                    setCouponCode("");
                    setError("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="size-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponCode.trim()}
              className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-5 py-2.5'} bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none font-funnel whitespace-nowrap`}
            >
              {isApplying ? (
                <div className="flex items-center gap-1.5">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Applying</span>
                </div>
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2">
              <FiAlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <p className={`text-red-600 font-funnel ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                {error}
              </p>
            </div>
          )}

          {/* Info Text */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <FiPercent className={`${isMobile ? 'size-3' : 'size-3.5'}`} />
            <p className={`font-funnel ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              Enter your coupon code to get instant discount
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCodeSection;