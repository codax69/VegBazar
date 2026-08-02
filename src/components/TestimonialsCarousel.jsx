// src/components/TestimonialsCarousel.jsx — Rebuilt with v2 1px hairline cards, Fraunces title, and Inter typography
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Star } from "lucide-react";

const TestimonialsCarousel = ({ testimonials }) => {
  const safeTestimonials = useMemo(
    () => (Array.isArray(testimonials) ? testimonials : []),
    [testimonials]
  );

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentTestimonial >= safeTestimonials.length) {
      setCurrentTestimonial(0);
    }
  }, [safeTestimonials.length, currentTestimonial]);

  const handleNext = useCallback(() => {
    if (safeTestimonials.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((c) =>
        c === safeTestimonials.length - 1 ? 0 : c + 1
      );
      setIsTransitioning(false);
    }, 200);
  }, [safeTestimonials.length]);

  const handlePrev = useCallback(() => {
    if (safeTestimonials.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((c) =>
        c === 0 ? safeTestimonials.length - 1 : c - 1
      );
      setIsTransitioning(false);
    }, 200);
  }, [safeTestimonials.length]);

  const handleDotClick = (index) => {
    if (index === currentTestimonial) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial(index);
      setIsTransitioning(false);
    }, 200);
  };

  useEffect(() => {
    if (safeTestimonials.length <= 1) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [safeTestimonials.length, handleNext]);

  const active = safeTestimonials[currentTestimonial];

  return (
    <div className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] mt-8 pb-6 transition-colors duration-150 font-body">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-[var(--color-text-primary)]">
            What Customers Say
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-[8px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] flex items-center justify-center transition-colors text-sm"
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-[8px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] flex items-center justify-center transition-colors text-sm"
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>

        {/* Empty State */}
        {safeTestimonials.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)] text-xs font-body">
            No testimonials available
          </div>
        ) : !active ? (
          <div className="text-center py-12 text-[var(--color-text-muted)] text-xs font-body">
            Invalid testimonial data
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch overflow-hidden">
              {/* Main Testimonial */}
              <div className="md:col-span-2">
                <div
                  className={`bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] p-5 sm:p-6 h-full flex flex-col justify-between transition-opacity duration-200 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div>
                    <p className="text-sm sm:text-base font-body font-medium text-[var(--color-text-primary)] mb-2 leading-relaxed">
                      “{active.comment ?? "No comment provided"}”
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] font-body">
                      — {active.name ?? "Anonymous"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (active.rating ?? 0)
                            ? "text-[var(--color-amber)] fill-[var(--color-amber)]"
                            : "text-[var(--color-border)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Card */}
              <div className="hidden md:block">
                <div
                  className={`bg-[var(--color-bg-app)] border border-[var(--color-border)] rounded-[10px] p-5 h-full flex flex-col justify-center items-center text-center transition-opacity duration-200 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-brand-green)] text-white text-base font-mono font-medium flex items-center justify-center mb-3">
                    {active.initial ?? active.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] font-body line-clamp-3">
                    {active.comment}
                  </p>

                  <p className="mt-2 text-[11px] text-[var(--color-text-muted)] font-mono">
                    Rating: {active.rating ?? 0}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center items-center gap-2 mt-6">
              {safeTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentTestimonial
                      ? "w-6 h-2 bg-[var(--color-brand-green)]"
                      : "w-2 h-2 bg-[var(--color-border)] hover:bg-[var(--color-border-strong)]"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
