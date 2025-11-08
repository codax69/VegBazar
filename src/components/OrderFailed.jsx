import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft, Phone, Mail } from "lucide-react";

const OrderFailed = ({ errorMessage, onRetry, onGoBack }) => {
  const isRecaptchaError =
    errorMessage?.toLowerCase().includes("recaptcha") ||
    errorMessage?.toLowerCase().includes("captcha");
  const isNetworkError =
    errorMessage?.toLowerCase().includes("network") ||
    errorMessage?.toLowerCase().includes("connection");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-red-100 p-4 rounded-full">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 font-poppins mb-3 text-center">
          Order Submission Failed
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-center mb-6 text-sm font-font-assistant">
          We couldn't process your order at this time
        </p>

        {/* Error Message Box */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-1 font-assistant">Error Details:</p>
              <p className="text-red-700 text-sm leading-relaxed">
                {errorMessage ||
                  "An unexpected error occurred. Please try again."}
              </p>
            </div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-blue-900 mb-2 text-sm font-assistant">
            💡 What you can do:
          </p>
          <ul className="space-y-2 text-sm text-blue-800">
            {isRecaptchaError ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 font-assistant">•</span>
                  <span>Refresh the page and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 font-assistant">•</span>
                  <span>Make sure you're not using a VPN or ad blocker</span>
                </li>
              </>
            ) : isNetworkError ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 font-assistant">•</span>
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 font-assistant">•</span>
                  <span>Try again in a few moments</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 font-assistant">•</span>
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2 font-assistant">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Verify all information is correct</span>
                </li>
                <li className="flex items-start gap-2 font-assistant">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Try again in a few moments</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full font-assistant bg-[#0e540b] text-white py-3 px-6 rounded-xl hover:bg-green-700 transition duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          {onGoBack && (
            <button
              onClick={onGoBack}
              className="w-full font-assistant bg-white text-gray-700 py-3 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition duration-200 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back to Review
            </button>
          )}
        </div>

        {/* Support Contact */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm mb-3 font-assistant">
            Still having trouble? Contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/918780564115"
              className="flex font-assistant items-center justify-center gap-2 text-[#0e540b] hover:text-green-700 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              <span>Call Support</span>
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="mailto:info.vegbazar@example.com"
              className="flex font-assistant items-center justify-center gap-2 text-[#0e540b] hover:text-green-700 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
