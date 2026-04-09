import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch wallet data
    const fetchWallet = useCallback(async () => {
        if (!isAuthenticated) {
            setWallet(null);
            setBalance(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/wallet');
            if (response.data) {
                setWallet(response.data.data.wallet);
                setBalance(response.data.data.wallet.balance);
            }
        } catch (err) {
            console.error('Error fetching wallet:', err);

            // If error is 404 (wallet not found), try to create one
            if (err.response?.status === 404) {
                try {
                    const newWalletResponse = await axios.post('/api/wallet');
                    setWallet(newWalletResponse.data.data.wallet);
                    setBalance(0);
                } catch (createErr) {
                    console.error('Error auto-creating wallet:', createErr);
                    setError(createErr.response?.data?.message || 'Failed to create wallet');
                    setWallet(null);
                    setBalance(0);
                }
            } else {
                setError(err.response?.data?.message || 'Failed to fetch wallet');
                setWallet(null);
                setBalance(0);
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Create wallet
    const createWallet = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/wallet');
            setWallet(response.data.data.wallet);
            setBalance(0);
            return response;
        } catch (err) {
            console.error('Error creating wallet:', err);
            setError(err.response?.data?.message || 'Failed to create wallet');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh balance
    const refreshBalance = useCallback(async () => {
        if (!isAuthenticated || !wallet) return;

        try {
            const response = await axios.get('/api/wallet/balance');
            setBalance(response.data.data.balance);
            if (response.data.data.wallet) {
                 setWallet(response.data.data.wallet); // also update wallet status
            }
        } catch (err) {
            console.error('Error refreshing balance:', err);
        }
    }, [isAuthenticated, wallet]);

    // Fetch wallet on mount and when user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchWallet();
        } else {
            setWallet(null);
            setBalance(0);
        }
    }, [isAuthenticated, user, fetchWallet]);

    // Periodically refresh the wallet when it is active
    useEffect(() => {
        let intervalId;
        if (isAuthenticated && wallet && wallet.status === 'active') {
             // Poll for latest balance and wallet data every 15 seconds
             intervalId = setInterval(() => {
                 refreshBalance();
             }, 15000); 
        }

        return () => {
             if (intervalId) {
                  clearInterval(intervalId);
             }
        };
    }, [isAuthenticated, wallet, refreshBalance]);

    const value = {
        wallet,
        balance,
        loading,
        error,
        hasWallet: wallet !== null,
        fetchWallet,
        createWallet,
        refreshBalance,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
