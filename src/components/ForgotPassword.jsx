import React, { useState } from "react";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Send,
  Leaf,
} from "lucide-react";
import vegbazarLogo from"../assets/vegbazar.svg";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER_URL}/api/auth/forgot-password`,
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 font-poppins">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-[#0e540b] p-6 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-3 backdrop-blur-sm">
              <img src={vegbazarLogo} className="w-12 h-12" alt="VegBazar Logo" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Forgot Password?</h1>
            <p className="text-white/80 text-xs">
              We'll send you reset instructions
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

            {!emailSent ? (
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e540b] focus:border-transparent outline-none transition font-poppins text-sm"
                      placeholder="yourname@email.com"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email}
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
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setMessage({ type: "", text: "" });
                    }}
                    className="text-[#0e540b] hover:text-[#0a3708] font-medium hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            {/* Back to Login Button */}
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full mt-4 flex items-center justify-center gap-2 text-[#0e540b] hover:text-[#0a3708] font-semibold py-2.5 rounded-lg hover:bg-green-50 transition-all duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-600 mt-4 px-4">
          Remember your password?{" "}
          <button
            onClick={() => (window.location.href = "/login")}
            className="text-[#e24100] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
