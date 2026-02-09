import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Star } from "lucide-react";

const TestimonialsCarousel = ({ testimonials }) => {
  // Normalize input once
  const safeTestimonials = useMemo(
    () => (Array.isArray(testimonials) ? testimonials : []),
    [testimonials]
  );

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Clamp index if data changes
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
    }, 300);
  }, [safeTestimonials.length]);

  const handlePrev = useCallback(() => {
    if (safeTestimonials.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((c) =>
        c === 0 ? safeTestimonials.length - 1 : c - 1
      );
      setIsTransitioning(false);
    }, 300);
  }, [safeTestimonials.length]);

  const handleDotClick = (index) => {
    if (index === currentTestimonial) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Auto slide (single interval, safe dependency)
  useEffect(() => {
    if (safeTestimonials.length <= 1) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [safeTestimonials.length, handleNext]);

  const active = safeTestimonials[currentTestimonial];

  return (
    <div className="w-full bg-white shadow-lg rounded-xl mt-8 pb-6">
      <div className="md:p-6 lg:p-6 p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            What Customers Say
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
            >
              ›
            </button>
          </div>
        </div>

        {/* Empty State */}
        {safeTestimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No testimonials available
          </div>
        ) : !active ? (
          <div className="text-center py-12 text-gray-500">
            Invalid testimonial data
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch overflow-hidden">
              {/* Main Testimonial */}
              <div className="md:col-span-2">
                <div
                  className={`bg-white rounded-lg p-6 shadow-sm h-full flex flex-col justify-between transition-all duration-300 ${isTransitioning
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                    }`}
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      “{active.comment ?? "No comment provided"}”
                    </p>
                    <p className="text-sm text-gray-600">
                      — {active.name ?? "Anonymous"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < (active.rating ?? 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Card */}
              <div className="hidden md:block">
                <div
                  className={`bg-white rounded-lg p-6 shadow-sm h-full flex flex-col justify-center items-center transition-all duration-300 ${isTransitioning
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                    }`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#f54a00] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {active.initial ??
                      active.name?.charAt(0)?.toUpperCase() ??
                      "?"}
                  </div>

                  <p className="mt-3 text-sm text-gray-600 text-center">
                    {(active.comment ?? "").slice(0, 120)}
                    {active.comment?.length > 120 ? "..." : ""}
                  </p>

                  <p className="mt-2 text-xs text-gray-500 font-medium">
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
                  className={`transition-all duration-300 rounded-full ${index === currentTestimonial
                      ? "w-8 h-3 bg-[#0e540b]"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
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
