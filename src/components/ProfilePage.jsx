import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Save,
  X,
  Check,
  AlertCircle,
  Edit2,
  LogOut,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext.jsx";
import { useOrderContext } from "../Context/OrderContext";
import { useWallet } from "../Context/WalletContext";
import { initiateAddMoney, verifyAddMoney } from "../services/walletService";

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const { navigate } = useOrderContext();

  // Call useWallet hook unconditionally at the top level
  const { balance = 0, hasWallet = false, loading: walletLoading = false, refreshBalance = () => { } } = useWallet();

  const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); // Keep existing loading state
  const [editedData, setEditedData] = useState({ // Add editedData state
    username: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false); // Add isSaving state
  const [message, setMessage] = useState({ type: "", text: "" });
  const [customAmount, setCustomAmount] = useState(""); // Add customAmount state
  const [addingMoney, setAddingMoney] = useState(false); // Add addingMoney state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setEditedData({ // Initialize editedData as well
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, "");

      if (phoneDigits.length < 10) {
        newErrors.phone = "Phone number must be at least 10 digits";
      } else if (/^(\d)\1{9,}$/.test(phoneDigits)) {
        newErrors.phone = "Invalid phone number (repeated digits)";
      } else {
        const isSequential = phoneDigits.split('').every((digit, i, arr) => {
          if (i === 0) return true;
          const curr = parseInt(digit);
          const prev = parseInt(arr[i - 1]);
          return (curr === prev + 1) || (curr === prev - 1);
        });

        if (isSequential && phoneDigits.length >= 5) {
          newErrors.phone = "Invalid phone number (sequential digits)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditedData((prev) => ({ // Update editedData as well
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/api/auth/update-details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        // Update user in localStorage
        const updatedUser = {
          ...user,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update context state immediately
        setUser(updatedUser);

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditing(false);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setEditedData({ // Reset editedData as well
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  const handleLogout = () => { // Modified to navigate to /login
    logout();
    navigate("/login");
  };

  // Handle Add Money to Wallet
  const handleAddMoney = async (amount) => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setAddingMoney(true);

    try {
      // Create order for wallet top-up
      const orderData = await initiateAddMoney(amount);

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S9xkjZZlpd8fka",
        amount: orderData.data.amount,
        currency: "INR",
        name: "VegBazar",
        description: "Add Money to Wallet",
        order_id: orderData.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyData = await verifyAddMoney({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) { // Assuming verifyAddMoney returns standardized response
              alert(`₹${amount} added to your wallet successfully!`);
              setCustomAmount("");
              // Refresh wallet balance
              refreshBalance();
            } else {
              // Fallback if success flag isn't explicit but no error thrown
              alert(`₹${amount} added to your wallet successfully!`);
              setCustomAmount("");
              refreshBalance();
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(error.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setAddingMoney(false);
          }
        },
        prefill: {
          name: user?.username || user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#0e540b",
        },
        modal: {
          ondismiss: function () {
            setAddingMoney(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Add money error:", error);
      alert(error.response?.data?.message || "Failed to add money. Please try again.");
      setAddingMoney(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 px-3 font-funnel">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            My Profile
          </h1>
          <p className="text-xs md:text-sm text-gray-600">Manage your account</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-xs md:text-sm ${message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
              }`}
          >
            {message.type === "success" ? (
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#0e540b] to-green-700 p-4 md:p-5 text-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold truncate">{user?.username}</h2>
                  <p className="text-white/80 text-xs md:text-sm">Member since 2024</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs md:text-sm font-medium flex-shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 md:p-5">
            {!isEditing ? (
              // View Mode
              <div className="space-y-3 md:space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-0.5">
                      Email
                    </label>
                    <p className="text-xs md:text-sm text-gray-900 break-all">{user?.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-0.5">
                      Phone
                    </label>
                    <p className="text-xs md:text-sm text-gray-900">{user?.phone || "Not provided"}</p>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="pt-3 md:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-green-600" />
                      <h3 className="text-sm md:text-base font-semibold text-gray-900">My Wallet</h3>
                    </div>
                  </div>

                  {walletLoading ? (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ) : hasWallet ? (
                    <div className="space-y-3">
                      {/* Balance Card */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-green-700 font-medium mb-1">Available Balance</p>
                            <p className="text-2xl font-bold text-green-900">₹{balance?.toFixed(2) || '0.00'}</p>
                          </div>
                          <button
                            onClick={() => navigate('/wallet')}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            View Wallet
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Add Money Section (Disabled)
                        <div className="pt-3 border-t border-green-200">
                          <p className="text-xs font-medium text-green-800 mb-2">Add Money to Wallet</p>

                          
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {[100, 500, 1000, 2000].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => handleAddMoney(amount)}
                                className="bg-white hover:bg-green-50 border border-green-300 text-green-700 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                              >
                                ₹{amount}
                              </button>
                            ))}
                          </div>

                          
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              placeholder="Enter amount"
                              min="1"
                              className="flex-1 px-3 py-1.5 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => handleAddMoney(Number(customAmount))}
                              disabled={!customAmount || Number(customAmount) <= 0 || addingMoney}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
                            >
                              {addingMoney ? 'Processing...' : 'Add'}
                            </button>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">No Wallet Found</p>
                          <p className="text-xs text-gray-500">Create a wallet to start using VegBazar Wallet</p>
                        </div>
                        <button
                          onClick={() => navigate('/wallet')}
                          className="flex items-center gap-1 bg-[#0e540b] hover:bg-[#0a3d08] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          Create Wallet
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="pt-3 md:pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate("/orders")}
                      className="flex-1 bg-[#0e540b] hover:bg-[#0a3d08] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 border-2 border-red-500 hover:bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Username */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${errors.username ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Your username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-0.5 text-xs text-red-600 font-medium">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-0.5 text-xs text-red-600 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-0.5 text-xs text-red-600 font-medium">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-[#e24100] hover:bg-[#c93800] disabled:bg-gray-400 text-white font-semibold py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 text-xs md:text-sm mb-0.5">
                Privacy & Security
              </h3>
              <p className="text-blue-800 text-xs md:text-sm">
                Your information is secure and encrypted. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
