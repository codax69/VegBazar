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
    <div className={`bg-[#ffffff] rounded-xl shadow-md border-2 border-dashed border-green-300 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <FiTag className={`${isMobile ? 'size-4' : 'size-5'} text-green-700`} />
          </div>
          <h3 className={`font-funnel font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Apply Coupon
          </h3>
        </div>
        {appliedCoupon && (
          <div className="bg-green-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
            <FiCheck className="size-3" />
            <span className="text-[10px] font-semibold font-funnel">Applied</span>
          </div>
        )}
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <div className="bg-white rounded-lg p-3 border-2 border-green-500 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded-md">
                <FiPercent className="size-4 text-green-700" />
              </div>
              <div>
                <p className={`font-bold text-green-700 font-funnel ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {appliedCoupon.code}
                </p>
                <p className={`text-gray-600 font-funnel ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
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
          <div className="bg-[#ffffff] text-white rounded-lg p-2 flex justify-between items-center">
            <span className={`font-semibold font-funnel ${isMobile ? 'text-xs' : 'text-sm'}`}>
              You save
            </span>
            <span className={`font-bold font-funnel ${isMobile ? 'text-base' : 'text-lg'}`}>
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