import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:4000/api';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Decode JWT token to check expiration
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Get time until token expires (in milliseconds)
  const getTokenExpiryTime = (token) => {
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return expirationTime - Date.now();
    } catch (error) {
      return 0;
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        return data.data.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (identifier, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (response.ok && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error' };
    }
  }, []);

  // Setup automatic token refresh before expiration
  const setupTokenRefresh = useCallback((token) => {
    const timeUntilExpiry = getTokenExpiryTime(token);

    if (timeUntilExpiry <= 0) {
      // Token already expired, try to refresh immediately
      refreshAccessToken().then(newToken => {
        if (!newToken) {
          logout();
        } else {
          setupTokenRefresh(newToken);
        }
      });
      return;
    }

    // Refresh token 5 minutes before it expires
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    const timeToRefresh = refreshTime > 0 ? refreshTime : 0;

    // console.log(`Token will refresh in ${Math.floor(timeToRefresh / 1000 / 60)} minutes`);

    const timeoutId = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setupTokenRefresh(newToken);
      } else {
        // If refresh fails, logout user
        logout();
      }
    }, timeToRefresh);

    // Return cleanup function
    return () => clearTimeout(timeoutId);
  }, [refreshAccessToken, logout]);

  // Check authentication status on mount and setup auto-refresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // console.log('Access token expired, attempting refresh...');

        // Try to refresh the token
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Token refreshed successfully
          const user = JSON.parse(storedUser);
          setUser(user);
          setIsAuthenticated(true);

          // Setup auto-refresh for new token
          setupTokenRefresh(newToken);
        } else {
          // Refresh failed, logout user
          await logout();
        }
      } else {
        // Token is valid
        const user = JSON.parse(storedUser);
        setUser(user);
        setIsAuthenticated(true);

        // Setup auto-refresh
        setupTokenRefresh(token);
      }

      setIsLoading(false);
    };

    initAuth();
  }, [refreshAccessToken, logout, setupTokenRefresh]);

  // Verify token on page focus (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        const token = localStorage.getItem('accessToken');

        if (isTokenExpired(token)) {
          const newToken = await refreshAccessToken();
          if (!newToken) {
            await logout();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, refreshAccessToken, logout]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
export const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};