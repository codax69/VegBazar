import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../Context/AuthProvider";
import { Navigate } from "react-router-dom";

const RegisterPage = () => {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      
      if (phoneDigits.length < 10) {
        newErrors.phone = "Phone number must be at least 10 digits";
      } else if (/^(\d)\1{9,}$/.test(phoneDigits)) {
        // Check for all same digits (e.g., 1111111111)
        newErrors.phone = "Invalid phone number (repeated digits)";
      } else {
        // Check for sequential digits (e.g., 1234567890, 9876543210)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await register(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Registration successful! Redirecting...",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setMessage({
        type: "error",
        text: result.message || "Registration failed",
      });
    }

    setLoading(false);
  };

  const handleLogin = () => {
    window.scrollTo(0, 0);
    Navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 font-poppins">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-[#0e540b] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-3 backdrop-blur-sm">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Create Account</h1>
            <p className="text-white/80 text-xs">Join VegBazar today</p>
          </div>

          <div className="p-6">
            {/* Message Alert */}
            {message.text && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <p className="font-medium">{message.text}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Mukesh Kumar"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="mukesh123@gmail.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+91 1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.password}
                  </p>
                )}
                {!errors.password && (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e24100] hover:bg-[#c93800] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-500 text-xs">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full border-2 border-[#0e540b] text-[#0e540b] hover:bg-[#0e540b] hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm"
            >
              Login to Your Account
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-600 mt-4 px-4">
          By creating an account, you agree to VegBazar's{" "}
          <a href="/terms" className="text-[#e24100] hover:underline font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[#e24100] hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;