import React, { useState } from "react";
import { Phone, Mail, MessageSquare, Send } from "lucide-react";
import axios from "axios";

const Help = () => {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    comment: "",
    rating: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackRedirect = () => {
    const googleFormUrl = "https://forms.cloud.microsoft/r/b7J31zqjZS";
    window.open(googleFormUrl, "_blank", "noopener,noreferrer");
  };

  const handleRatingClick = (rating) => {
    setFeedback({ ...feedback, rating });
    setErrors({ ...errors, rating: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!feedback.name.trim()) {
      newErrors.name = "Name is required";
    } else if (feedback.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!feedback.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(feedback.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!feedback.comment.trim()) {
      newErrors.comment = "Comment is required";
    } else if (feedback.comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters";
    }

    if (feedback.rating === 0) {
      newErrors.rating = "Please provide a rating";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitTestimonial = await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/testimonials`,
        feedback
      );
      const data = await submitTestimonial.data;
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({ name: "", email: "", comment: "", rating: 0 });
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback({ ...feedback, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen md:pt-20 pb-10 px-3 bg-[#ffffff]">
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-[#0e540b] mb-1">
            Help & Support
          </h1>
          <p className="text-gray-700 text-xs md:text-sm font-assistant">
            We're here to help with your orders, deliveries, and feedback.
          </p>
        </div>

        <div className="bg-[#f0fcf6] rounded-lg shadow-sm p-4 md:p-5 border border-gray-100">
          <h2 className="text-xl md:text-2xl font-poppins font-semibold mb-3 flex items-center gap-2 text-[#0e540b]">
            <MessageSquare className="w-5 h-5" /> Get in Touch
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="https://wa.me/918780564115"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-md hover:bg-gray-50 transition-all"
            >
              <div className="p-2 rounded-full bg-[#0e540b]">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 font-assistant">Call or WhatsApp</p>
                <p className="text-sm font-amiko text-[#0e540b] font-semibold">+91 8780564115</p>
              </div>
            </a>

            <a
              href="mailto:info.vegbazar@gmail.com"
              className="flex items-center gap-2.5 p-3 rounded-md hover:bg-gray-50 transition-all"
            >
              <div className="p-2 rounded-full bg-[#0e540b]">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 font-assistant">Email Us</p>
                <p className="text-sm font-amiko text-[#0e540b] font-semibold">info.vegbazar@gmail.com</p>
              </div>
            </a>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={handleFeedbackRedirect}
              className="text-white px-5 py-2 rounded-md font-amiko text-sm hover:opacity-90 transition-all"
              style={{ backgroundColor: "#0e540b" }}
            >
              📝 Complete Our Survey
            </button>
            <p className="text-gray-600 text-[11px] mt-2 font-assistant italic">
              Note: Give feedback and we'll serve you better.
            </p>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-sm p-4 md:p-5 border border-gray-100">
          <h2 className="text-xl font-poppins font-semibold mb-3 text-[#0e540b]">
            Quick Feedback
          </h2>

          {submitted ? (
            <div className="rounded-md p-4 text-center bg-gray-50">
              <div className="text-3xl mb-2 text-[#0e540b]">✓</div>
              <p className="text-sm md:text-base font-poppins font-semibold text-[#0e540b]">
                Thank you for your feedback!
              </p>
              <p className="text-gray-600 text-xs md:text-sm font-assistant">
                We appreciate your time and will use it to improve VegBazar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={feedback.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none text-xs md:text-sm font-assistant ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    style={{ borderColor: errors.name ? "#ef4444" : "#dcdcdc" }}
                    onFocus={(e) => !errors.name && (e.target.style.borderColor = "#0e540b")}
                    onBlur={(e) => !errors.name && (e.target.style.borderColor = "#dcdcdc")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1 font-assistant">{errors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={feedback.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none text-xs md:text-sm font-assistant ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    style={{ borderColor: errors.email ? "#ef4444" : "#dcdcdc" }}
                    onFocus={(e) => !errors.email && (e.target.style.borderColor = "#0e540b")}
                    onBlur={(e) => !errors.email && (e.target.style.borderColor = "#dcdcdc")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1 font-assistant">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 text-gray-700 font-assistant">
                  Rate Your Experience
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`w-5 h-5 ${
                          star <= feedback.rating ? "fill-current" : ""
                        }`}
                        style={{
                          color: star <= feedback.rating ? "#0e540b" : "#cbd5e0",
                        }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-[10px] mt-1 font-assistant">{errors.rating}</p>
                )}
              </div>

              <div>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience... (minimum 10 characters)"
                  value={feedback.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none text-xs md:text-sm font-assistant resize-none ${
                    errors.comment ? "border-red-500" : ""
                  }`}
                  style={{ borderColor: errors.comment ? "#ef4444" : "#dcdcdc" }}
                  onFocus={(e) => !errors.comment && (e.target.style.borderColor = "#0e540b")}
                  onBlur={(e) => !errors.comment && (e.target.style.borderColor = "#dcdcdc")}
                ></textarea>
                <div className="flex justify-between items-center mt-1">
                  {errors.comment && (
                    <p className="text-red-500 text-[10px] font-assistant">{errors.comment}</p>
                  )}
                  <p className={`text-[10px] font-assistant ml-auto ${
                    feedback.comment.length >= 10 ? "text-green-600" : "text-gray-500"
                  }`}>
                    {feedback.comment.length}/10 characters
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full text-white py-2 rounded-md font-amiko text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0e540b" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-sm p-4 md:p-5 border border-gray-100">
          <h2 className="text-xl font-poppins font-semibold mb-3 text-[#0e540b]">
            FAQs
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What are your delivery hours?",
                a: "We deliver from 7 AM to 8 PM. Choose your preferred slot during checkout.",
              },
              {
                q: "How do I place an order?",
                a: "Browse, add items to cart, and checkout. Pay online or cash on delivery.",
              },
              {
                q: "What if I'm not satisfied with quality?",
                a: "Contact us immediately — we'll replace or refund promptly.",
              },
              {
                q: "Do you offer bulk or corporate orders?",
                a: "Yes, contact us on WhatsApp or email for special pricing.",
              },
            ].map((item, i) => (
              <div key={i} className="border-l-4 pl-3 py-1" style={{ borderColor: "#0e540b" }}>
                <h3 className="font-poppins text-sm text-gray-800 mb-0.5">
                  {item.q}
                </h3>
                <p className="text-[11px] text-gray-600 font-assistant">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;