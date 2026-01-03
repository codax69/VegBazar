import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Lock } from 'lucide-react';
import { useUserAuth } from '../Context/UserAuthContext';

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, handleGoogleLogin, authError, setAuthError, loginLoading } = useUserAuth();

  useEffect(() => {
    if (!showAuthModal) {
      setAuthError(''); // Clear error when modal closes
      return;
    }

    const renderButton = () => {
      if (window.google && window.google.accounts && document.getElementById('googleSignInButton')) {
        try {
          window.google.accounts.id.renderButton(
            document.getElementById('googleSignInButton'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
            }
          );
          console.log('Google Sign-In button rendered successfully');
        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
          setAuthError('Failed to load Google Sign-In. Please refresh the page.');
        }
      } else {
        console.warn('Google script not loaded or button element not found');
      }
    };

    // If Google is already initialized, render button immediately
    if (window.google && window.google.accounts) {
      renderButton();
    } else {
      // Wait for initialization
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle);
          renderButton();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google) {
          console.error('Google script failed to load within timeout');
          setAuthError('Google Sign-In failed to load. Please check your connection.');
        }
      }, 10000);
    }
  }, [showAuthModal, setAuthError]);

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to Continue
          </h2>
          <p className="text-gray-600 text-sm">
            Please sign in to place your order and track deliveries
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-2">
            Why sign in?
          </p>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              <span>Track your orders in real-time</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              <span>Save addresses for faster checkout</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              <span>View order history and reorder easily</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              <span>Get exclusive offers and discounts</span>
            </li>
          </ul>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-4">
          <div id="googleSignInButton" className="w-full flex justify-center" />
        </div>

        {/* Error Message */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
            <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-red-700 text-sm">{authError}</p>
          </div>
        )}

        {/* Loading State */}
        {loginLoading && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <div className="w-5 h-5 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
            <span className="text-sm font-medium">Signing you in...</span>
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <Lock className="w-3 h-3" />
          <span>Secured with Google OAuth 2.0</span>
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-xs text-gray-500 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthModal;