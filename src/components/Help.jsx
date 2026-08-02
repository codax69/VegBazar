// src/components/Help.jsx — Rebuilt with v2 1px hairline cards, Fraunces titles, and Inter typography
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
        `/api/testimonials`,
        feedback
      );
      await submitTestimonial.data;

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
    <div className="max-w-2xl mx-auto py-2 sm:py-4 px-3 space-y-6 md:space-y-8 font-body transition-colors duration-150">
      <div>
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-[var(--color-text-primary)] mb-1">
            Help & Support
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs md:text-sm font-body">
            We're here to help with your orders, deliveries, and feedback.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="bg-[var(--color-bg-surface)] rounded-[12px] p-4 md:p-5 border border-[var(--color-border)] mb-6">
          <h2 className="text-lg font-display font-semibold mb-3 flex items-center gap-2 text-[var(--color-brand-green)]">
            <MessageSquare className="w-5 h-5" /> Get in Touch
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="https://wa.me/918780564115"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-[10px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-app)] transition-colors"
            >
              <div className="p-2 rounded-full bg-[var(--color-brand-green)] text-white">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--color-text-muted)] font-body">Call or WhatsApp</p>
                <p className="text-xs font-mono font-medium text-[var(--color-text-primary)]">+91 8780564115</p>
              </div>
            </a>

            <a
              href="mailto:info.vegbazar@gmail.com"
              className="flex items-center gap-2.5 p-3 rounded-[10px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-app)] transition-colors"
            >
              <div className="p-2 rounded-full bg-[var(--color-brand-green)] text-white">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--color-text-muted)] font-body">Email Us</p>
                <p className="text-xs font-mono font-medium text-[var(--color-text-primary)]">info.vegbazar@gmail.com</p>
              </div>
            </a>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={handleFeedbackRedirect}
              className="text-white px-5 py-2.5 rounded-[10px] font-body text-xs font-medium hover:bg-[var(--color-brand-green-hover)] transition-colors bg-[var(--color-brand-green)]"
            >
              📝 Complete Our Survey
            </button>
            <p className="text-[var(--color-text-muted)] text-[11px] mt-2 font-body italic">
              Note: Give feedback and we'll serve you better.
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-[var(--color-bg-surface)] rounded-[12px] p-4 md:p-5 border border-[var(--color-border)] mb-6">
          <h2 className="text-lg font-display font-semibold mb-3 text-[var(--color-brand-green)]">
            Quick Feedback
          </h2>

          {submitted ? (
            <div className="rounded-[10px] p-4 text-center bg-[var(--color-tint-green)] border border-[var(--color-border)]">
              <div className="text-2xl mb-1 text-[var(--color-brand-green)]">✓</div>
              <p className="text-xs md:text-sm font-body font-medium text-[var(--color-brand-green)]">
                Thank you for your feedback!
              </p>
              <p className="text-[var(--color-text-muted)] text-xs font-body mt-1">
                We appreciate your time and will use it to improve VegBazar.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={feedback.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 bg-[var(--color-bg-surface)] border rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] text-xs font-body ${errors.name ? "border-red-500" : "border-[var(--color-border)]"}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1 font-body">{errors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={feedback.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 bg-[var(--color-bg-surface)] border rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] text-xs font-body ${errors.email ? "border-red-500" : "border-[var(--color-border)]"}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1 font-body">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1 text-[var(--color-text-secondary)] font-body">
                  Rate Your Experience
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className="w-5 h-5"
                        style={{
                          color: star <= feedback.rating ? "var(--color-amber)" : "var(--color-border)",
                          fill: star <= feedback.rating ? "var(--color-amber)" : "none",
                        }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-[10px] mt-1 font-body">{errors.rating}</p>
                )}
              </div>

              <div>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience... (minimum 10 characters)"
                  value={feedback.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  className={`w-full px-3 py-2 bg-[var(--color-bg-surface)] border rounded-[6px] focus:outline-none focus:border-[var(--color-brand-green)] text-xs font-body resize-none ${errors.comment ? "border-red-500" : "border-[var(--color-border)]"}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.comment && (
                    <p className="text-red-500 text-[10px] font-body">{errors.comment}</p>
                  )}
                  <p className={`text-[10px] font-mono ml-auto ${feedback.comment.length >= 10 ? "text-[var(--color-brand-green)]" : "text-[var(--color-text-muted)]"}`}>
                    {feedback.comment.length}/10 characters
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full text-white py-2.5 rounded-[10px] font-body text-xs font-medium hover:bg-[var(--color-brand-green-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-brand-green)]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

        {/* FAQs */}
        <div className="bg-[var(--color-bg-surface)] rounded-[12px] p-4 md:p-5 border border-[var(--color-border)]">
          <h2 className="text-lg font-display font-semibold mb-3 text-[var(--color-brand-green)]">
            FAQs
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What are your delivery hours?",
                a: "We deliver from 7 AM to 11 AM daily across Valsad.",
              },
              {
                q: "How do I place an order?",
                a: "Browse vegetables or baskets, add items to your cart, and proceed to checkout.",
              },
              {
                q: "What if I'm not satisfied with quality?",
                a: "Contact us immediately on WhatsApp — we'll replace or credit your wallet promptly.",
              },
              {
                q: "Do you offer bulk or corporate orders?",
                a: "Yes, contact us on WhatsApp or email for custom pricing.",
              },
            ].map((item, i) => (
              <div key={i} className="border-l-2 border-[var(--color-brand-green)] pl-3 py-0.5">
                <h3 className="font-body text-xs font-medium text-[var(--color-text-primary)] mb-0.5">
                  {item.q}
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)] font-body">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;