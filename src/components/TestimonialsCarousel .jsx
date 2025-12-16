import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const TestimonialsCarousel = ({testimonials}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

//   const testimonials = [
//     {
//       comment: "Amazing service! The quality exceeded all my expectations and the team was incredibly professional.",
//       name: "Sarah Johnson",
//       initial: "SJ",
//       rating: 5
//     },
//     {
//       comment: "I've been using this product for months now and it has completely transformed my workflow.",
//       name: "Michael Chen",
//       initial: "MC",
//       rating: 5
//     },
//     {
//       comment: "Outstanding customer support and excellent value for money. Highly recommend to everyone!",
//       name: "Emily Rodriguez",
//       initial: "ER",
//       rating: 4
//     },
//     {
//       comment: "The attention to detail and commitment to quality is what sets them apart from competitors.",
//       name: "David Thompson",
//       initial: "DT",
//       rating: 5
//     }
//   ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((c) => (c === testimonials.length - 1 ? 0 : c + 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((c) => (c === 0 ? testimonials.length - 1 : c - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleDotClick = (index) => {
    if (index !== currentTestimonial) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTestimonial(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className="w-full bg-[#ffffff] shadow-lg rounded-xl mt-8 pb-6">
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
              <span className="text-xl font-bold">‹</span>
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
            >
              <span className="text-xl font-bold">›</span>
            </button>
          </div>
        </div>

        {testimonialsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0e540b]"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No testimonials available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch overflow-hidden">
              <div className="md:col-span-2">
                <div 
                  className={`bg-white rounded-lg p-6 shadow-sm h-full flex flex-col justify-between transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                  }`}
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      "{testimonials[currentTestimonial].comment}"
                    </p>
                    <p className="text-sm text-gray-600">
                      — {testimonials[currentTestimonial].name}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 transition-all duration-300 ${
                          i < testimonials[currentTestimonial].rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div 
                  className={`bg-white rounded-lg p-6 shadow-sm h-full flex flex-col justify-center items-center transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#f54a00] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {testimonials[currentTestimonial].initial}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 text-center">
                    {testimonials[currentTestimonial].comment.slice(0, 120)}
                    ...
                  </p>
                  <p className="mt-2 text-xs text-gray-500 font-medium">
                    Rating: {testimonials[currentTestimonial].rating}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center items-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentTestimonial
                      ? 'w-8 h-3 bg-[#0e540b]'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
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