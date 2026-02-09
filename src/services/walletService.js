import axios from "axios";

const API_URL = import.meta.env.VITE_API_SERVER_URL;

/**
 * Wallet API Service
 * Handles all wallet-related API calls
 */

/**
 * Get user's wallet
 * @returns {Promise} Wallet data with balance
 */
export const getWallet = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Wallet doesn't exist
      return null;
    }
    throw error;
  }
};

/**
 * Create wallet for user
 * @returns {Promise} Created wallet data
 */
export const createWallet = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/wallet`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get wallet balance
 * @returns {Promise} Balance data
 */
export const getBalance = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/balance`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get transaction history
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @param {string} type - Filter by type: 'credit' or 'debit'
 * @param {string} source - Filter by source
 * @returns {Promise} Transaction history with pagination
 */
export const getTransactions = async ({
  page = 1,
  limit = 20,
  type = null,
  source = null,
} = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (type) params.append("type", type);
    if (source) params.append("source", source);

    const response = await axios.get(
      `${API_URL}/api/wallet/transactions?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user has sufficient balance
 * @param {number} amount - Amount to check
 * @returns {Promise<boolean>} True if sufficient balance
 */
export const hasSufficientBalance = async (amount) => {
  try {
    const response = await getBalance();
    return response.data.balance >= amount;
  } catch (error) {
    return false;
  }
};

/**
 * Initiate add money transaction
 * @param {number} amount - Amount to add
 * @returns {Promise} Order details for Razorpay
 */
export const initiateAddMoney = async (amount) => {
  try {
    const response = await axios.post(`${API_URL}/api/wallet/add-money`, {
      amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify add money payment
 * @param {Object} paymentData - Razorpay payment data
 * @returns {Promise} Verification result
 */
export const verifyAddMoney = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/wallet/verify-payment`,
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
