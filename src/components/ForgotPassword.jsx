// src/components/ForgotPassword.jsx — Rebuilt with v2 1px hairline card, Fraunces title, and brand green primary CTA
import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import vegbazarLogo from "../assets/vegbazar.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setMessage({
          type: "success",
          text: "Password reset link has been sent to your email",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send reset link",
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
    <div className="min-h-screen bg-[var(--color-bg-app)] flex items-center justify-center p-4 font-body transition-colors duration-150">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-bg-surface)] rounded-[12px] border border-[var(--color-border)] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[var(--color-brand-green)] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-3">
              <img src={vegbazarLogo} className="w-10 h-10" alt="VegBazar Logo" />
            </div>
            <h1 className="text-xl font-display font-semibold mb-1">Forgot Password?</h1>
            <p className="text-white/80 text-xs font-body">
              We'll send you reset instructions
            </p>
          </div>

          <div className="p-6">
            {/* Message Alert */}
            {message.text && (
              <div
                className={`mb-4 p-3 rounded-[8px] flex items-start gap-2 text-xs font-body ${message.type === "success"
                  ? "bg-[var(--color-tint-green)] text-[var(--color-brand-green)] border border-[var(--color-border)]"
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

            {!emailSent ? (
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 font-body">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] font-body text-xs text-[var(--color-text-primary)]"
                      placeholder="yourname@email.com"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)] font-body">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-medium py-2.5 rounded-[10px] transition-colors disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed font-body text-xs flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Reset Link
                    </span>
                  )}
                </button>
              </div>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-tint-green)] rounded-full mb-3">
                  <CheckCircle className="w-6 h-6 text-[var(--color-brand-green)]" />
                </div>
                <h3 className="text-base font-display font-semibold text-[var(--color-text-primary)] mb-1.5">
                  Check Your Email
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4 font-body">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] font-body">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setMessage({ type: "", text: "" });
                    }}
                    className="text-[var(--color-brand-green)] hover:underline font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            {/* Back to Login Button */}
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-4 flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] font-medium py-2 rounded-[8px] transition-colors text-xs font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
