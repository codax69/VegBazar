import React, { useState } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    Key,
    Leaf,
} from "lucide-react";
import vegbazarLogo from"../assets/vegbazar.svg";

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [resetSuccess, setResetSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            setLoading(false);
            return;
        }

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = window.location.pathname.split('/').pop();

            const response = await fetch(
                `${import.meta.env.VITE_API_SERVER_URL}/api/auth/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password: formData.password }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResetSuccess(true);
                setMessage({
                    type: "success",
                    text: "Password reset successful! Redirecting to login...",
                });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setMessage({
                    type: "error",
                    text: data.message || "Failed to reset password",
                });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: "Network error. Please try again",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 font-poppins">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Header Section */}
                    <div className="bg-[#0e540b] p-6 text-white text-center relative">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-3 backdrop-blur-sm">
                            <img src={vegbazarLogo} alt="VegBazar Logo" className="w-12 h-12"  />
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
                        <p className="text-white/80 text-xs">
                            Create a new password for your account
                        </p>
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

                        {!resetSuccess && (
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3.5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Requirements Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                    <p className="text-xs text-blue-700 font-semibold">
                                        Password Requirements:
                                    </p>
                                    <ul className="text-xs text-blue-600 mt-1 space-y-0.5">
                                        <li>• At least 6 characters long</li>
                                        <li>• Must match confirmation password</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !formData.password || !formData.confirmPassword}
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
                                            Resetting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Key className="w-4 h-4" />
                                            Reset Password
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-gray-600 mt-4 px-4">
                    Remember your password?{" "}
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="text-[#e24100] hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;