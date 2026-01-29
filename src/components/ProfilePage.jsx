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
} from "lucide-react";
import { useAuth } from "../Context/AuthProvider";
import { useOrderContext } from "../Context/OrderContext";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { navigate } = useOrderContext();
  const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL 

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
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

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditing(false);

        // Refresh page after short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 px-3 font-poppins">
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
            className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-xs md:text-sm ${
              message.type === "success"
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
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${
                        errors.username ? "border-red-500" : "border-gray-300"
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
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${
                        errors.email ? "border-red-500" : "border-gray-300"
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
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition ${
                        errors.phone ? "border-red-500" : "border-gray-300"
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
