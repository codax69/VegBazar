import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import vegbazarLogo from "../assets/vegbazar.svg";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setMessage({ type: "success", text: "Login successful! Redirecting..." });

        // Get redirect path from result
        const redirectPath = result.redirectTo || "/";

        // Small delay to show success message, then redirect
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Login failed. Please try again."
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again."
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 font-funnel">
      <div className="w-full max-w-sm">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-[#0e540b] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-3 backdrop-blur-sm">
              <img src={vegbazarLogo} className="w-12 h-12" alt="vegbazar logo" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome Back!</h1>
            <p className="text-white/80 text-xs">Sign in to continue to VegBazar</p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Message Alert */}
            {message.text && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === "success"
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Input */}
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
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-funnel text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="yourname@email.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs text-[#e24100] hover:text-[#c93800] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-funnel text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
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
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </span>
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
                  New to VegBazar?
                </span>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full border-2 border-[#0e540b] text-[#0e540b] hover:bg-[#0e540b] hover:text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4 px-4">
          By continuing, you agree to VegBazar's{" "}
          <a
            href="/terms"
            className="text-[#e24100] hover:underline font-medium"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-[#e24100] hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;