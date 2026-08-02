// src/components/ResetPassword.jsx — Rebuilt with v2 1px hairline card, Fraunces title, and Inter typography
import React, { useState } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    Key,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import vegbazarLogo from "../assets/vegbazar.svg";

const ResetPassword = () => {
    const navigate = useNavigate();
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
            const token = window.location.pathname.split('/').pop();

            const response = await fetch(
                `/api/auth/reset-password/${token}`,
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
                    navigate('/login');
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
        <div className="min-h-screen bg-[var(--color-bg-app)] flex items-center justify-center p-3 font-body transition-colors duration-150">
            <div className="w-full max-w-sm">
                <div className="bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-[var(--color-brand-green)] p-6 text-white text-center relative">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-2">
                            <img src={vegbazarLogo} alt="VegBazar Logo" className="w-8 h-8" />
                        </div>
                        <h1 className="text-xl font-display font-semibold mb-0.5 text-white">Reset Password</h1>
                        <p className="text-white/80 text-xs font-body">
                            Create a new password for your account
                        </p>
                    </div>

                    <div className="p-5">
                        {/* Message Alert */}
                        {message.text && (
                            <div
                                className={`mb-4 p-3 rounded-[8px] flex items-start gap-2 text-xs font-body ${message.type === "success"
                                    ? "bg-[var(--color-tint-green)] text-[var(--color-brand-green)] border border-[var(--color-border)]"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-brand-green)]" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                                )}
                                <p className="font-medium">{message.text}</p>
                            </div>
                        )}

                        {!resetSuccess && (
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3.5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 font-body">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full pl-9 pr-10 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] font-body text-xs text-[var(--color-text-primary)]"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
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
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1 font-body">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full pl-9 pr-10 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] font-body text-xs text-[var(--color-text-primary)]"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
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
                                <div className="bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[8px] p-2.5 font-body">
                                    <p className="text-xs text-[var(--color-text-primary)] font-medium">
                                        Password Requirements:
                                    </p>
                                    <ul className="text-[11px] text-[var(--color-text-secondary)] mt-1 space-y-0.5">
                                        <li>• At least 6 characters long</li>
                                        <li>• Must match confirmation password</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !formData.password || !formData.confirmPassword}
                                    className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-medium py-2.5 rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-xs font-body"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <p className="text-center text-xs text-[var(--color-text-secondary)] mt-4 px-4 font-body">
                    Remember your password?{" "}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-[var(--color-brand-green)] hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;