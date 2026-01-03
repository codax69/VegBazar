import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
    initializeGoogleOAuth();
  }, []);

  const initializeGoogleOAuth = () => {
    const initialize = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleLoginCredential,
          });
          console.log('Google OAuth initialized successfully');
        } catch (error) {
          console.error('Error initializing Google OAuth:', error);
        }
      }
    };

    if (window.google) {
      initialize();
    } else {
      console.log('Waiting for Google script to load...');
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          console.log('Google script loaded, initializing OAuth...');
          initialize();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkGoogle);
        console.error('Google script failed to load within timeout');
      }, 10000);
    }
  };

  const handleGoogleLoginCredential = async (response) => {
    setAuthError('');
    setLoginLoading(true);
    const result = await handleGoogleLogin(response.credential);
    if (!result.success) {
      setAuthError(result.message || 'Login failed. Please try again.');
    }
    setLoginLoading(false);
  };

  const checkAuth = async () => {
    // Skip auth check since we're not using localStorage
    // Authentication will be session-only
    setLoading(false);
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/auth/google`,
        { credential },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { accessToken, user: userData } = response.data;
        
        // Store user data in state only (session-based)
        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Google login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    handleGoogleLogin,
    logout,
    requireAuth,
    authError,
    setAuthError,
    loginLoading,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};