// src/components/OrderFailed.jsx — Rebuilt OrderFailed with v2 hairline card, Fraunces title, and Inter typography
import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft, Phone } from "lucide-react";

const OrderFailed = ({ errorMessage, onRetry, onGoBack }) => {
  const isRecaptchaError =
    errorMessage?.toLowerCase().includes("recaptcha") ||
    errorMessage?.toLowerCase().includes("captcha");
  const isNetworkError =
    errorMessage?.toLowerCase().includes("network") ||
    errorMessage?.toLowerCase().includes("connection");

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] flex items-center justify-center p-4 transition-colors duration-150">
      <div className="max-w-lg w-full bg-[var(--color-bg-surface)] p-6 sm:p-8 rounded-[12px] border border-[var(--color-border)]">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-red-600 dark:text-red-400 mb-1.5 text-center">
          Order Submission Failed
        </h2>

        {/* Subtitle */}
        <p className="text-[var(--color-text-muted)] text-center mb-6 text-xs font-body">
          We couldn't process your order at this time
        </p>

        {/* Error Message Box */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-[10px] p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body font-medium text-red-800 dark:text-red-300 text-xs mb-1">Error Details:</p>
              <p className="text-red-700 dark:text-red-400 text-xs leading-relaxed font-body">
                {errorMessage || "An unexpected error occurred. Please try again."}
              </p>
            </div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-[var(--color-tint-green)] border border-[var(--color-border)] rounded-[10px] p-4 mb-6">
          <p className="font-body font-medium text-[var(--color-brand-green)] mb-2 text-xs">
            💡 What you can do:
          </p>
          <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)] font-body">
            {isRecaptchaError ? (
              <>
                <li className="flex items-start gap-2">
                  <span>• Refresh the page and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• Make sure you're not using a VPN or ad blocker</span>
                </li>
              </>
            ) : isNetworkError ? (
              <>
                <li className="flex items-start gap-2">
                  <span>• Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• Try again in a few moments</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span>• Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• Verify all information is correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>• Try again in a few moments</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRetry}
            className="w-full font-body bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white py-2.5 px-5 rounded-[10px] font-medium transition text-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={onGoBack}
            className="w-full font-body bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] py-2.5 px-5 rounded-[10px] font-medium transition text-xs flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Support Help */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center">
          <p className="text-[11px] font-body text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            Need help? Contact support at +91 94278 61006
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
