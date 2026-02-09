import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWallet, createWallet as createWalletAPI, getBalance } from '../services/walletService';
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
    const fetchWallet = async () => {
        if (!isAuthenticated) {
            setWallet(null);
            setBalance(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const walletData = await getWallet();

            if (walletData) {
                setWallet(walletData.data.wallet);
                setBalance(walletData.data.wallet.balance);
            } else {
                // Wallet doesn't exist - automatically create one for the user
                try {
                    const newWalletResponse = await createWalletAPI();
                    setWallet(newWalletResponse.data.wallet);
                    setBalance(0);
                } catch (createErr) {
                    console.error('Error auto-creating wallet:', createErr);
                    // If wallet creation fails, set to null
                    setWallet(null);
                    setBalance(0);
                }
            }
        } catch (err) {
            console.error('Error fetching wallet:', err);

            // If error is 404 (wallet not found), try to create one
            if (err.response?.status === 404) {
                try {
                    const newWalletResponse = await createWalletAPI();
                    setWallet(newWalletResponse.data.wallet);
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
    };

    // Create wallet
    const createWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await createWalletAPI();
            setWallet(response.data.wallet);
            setBalance(0);
            return response;
        } catch (err) {
            console.error('Error creating wallet:', err);
            setError(err.response?.data?.message || 'Failed to create wallet');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Refresh balance
    const refreshBalance = async () => {
        if (!isAuthenticated || !wallet) return;

        try {
            const balanceData = await getBalance();
            setBalance(balanceData.data.balance);
        } catch (err) {
            console.error('Error refreshing balance:', err);
        }
    };

    // Fetch wallet on mount and when user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchWallet();
        } else {
            setWallet(null);
            setBalance(0);
        }
    }, [isAuthenticated, user]);

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
