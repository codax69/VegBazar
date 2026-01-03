import React, { useEffect } from 'react';
import { useUserAuth } from '../Context/UserAuthContext';
import { ShoppingBag, Lock } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, requireAuth } = useUserAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      requireAuth();
    }
  }, [loading, isAuthenticated, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Authentication Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            Please sign in to continue with your order and access this page.
          </p>

          <div className="bg-white/80 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Sign in to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 text-left">
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Complete your purchase</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Track your orders</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Save addresses & preferences</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            The authentication modal will appear automatically
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;