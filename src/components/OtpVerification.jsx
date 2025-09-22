import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Smartphone, RefreshCw } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const OtpVerification = ({ onSuccess }) => {
  const { formData, navigate } = useOrderContext();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(""); // Clear error when user starts typing

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || "";
      }
      setOtp(newOtp);
      
      // Focus the last filled input or first empty one
      const nextEmptyIndex = newOtp.findIndex(digit => digit === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("/api/otp/verify", {
        email: formData.email,
        otp: otpString,
      });
      if (response.data.success) {
        onSuccess();
      } else {
        setError("Invalid OTP, please try again");
        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setError("Verification failed, please try again");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    
    try {
      const response = await axios.post("/api/otp/resend", {
        email: formData.email,
      });
      
      if (response.data.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError("Failed to resend OTP, please try again");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP, please try again");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={() => navigate("/select-vegetables")}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="text-green-600" size={28} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 text-sm">
          We've sent a verification code to
        </p>
        <p className="text-gray-800 font-semibold">
          {formData.email}
        </p>
      </div>

      {/* OTP Input Boxes */}
      <div className="mb-6">
        <div className="flex justify-center gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg transition-all duration-200 ${
                digit
                  ? "border-green-500 bg-green-50 text-green-700"
                  : error
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white hover:border-gray-400 focus:border-green-500"
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20`}
              autoComplete="off"
            />
          ))}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerifyOtp}
        disabled={loading || otp.join("").length !== 6}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
          loading || otp.join("").length !== 6
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 transform hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Verifying...
          </div>
        ) : (
          "Verify OTP"
        )}
      </button>

      {/* Resend Section */}
      <div className="text-center mt-6">
        {!canResend ? (
          <p className="text-gray-600 text-sm">
            Didn't receive the code?{" "}
            <span className="text-green-600 font-semibold">
              Resend in {formatTime(timer)}
            </span>
          </p>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-green-600 hover:text-green-700 font-semibold text-sm underline transition-colors flex items-center justify-center mx-auto"
          >
            {resending ? (
              <>
                <RefreshCw className="animate-spin mr-1" size={14} />
                Sending...
              </>
            ) : (
              "Resend OTP"
            )}
          </button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Make sure to check your messages and enter the 6-digit code
      </p>
    </div>
  );
};

export default OtpVerification;