/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiArrowRight,
  FiStar,
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
  FiInfo,
} from "react-icons/fi";
import { BiLeaf, BiPhoneCall } from "react-icons/bi";
import { FaMapPin, FaRupeeSign } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { GiBasket } from "react-icons/gi";
import { useOrderContext } from "../Context/OrderContext";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { ShoppingCart, Leaf, Tag, Check } from "lucide-react";
import axios from "axios";

export default function VegBazarLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const { navigate, setSelectedOffer } = useOrderContext();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isPaused && testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  // Add these navigation functions
  const goToTestimonialSlide = (index) => {
    setCurrentTestimonialIndex(index);
  };

  const goToPreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Fetch Top 3 Offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_SERVER_URL
          }/api/offers/Top-offers/suggestion`
        );

        const apiData = response.data;

        if (apiData?.data) {
          setOffers(apiData.data);
        } else {
          console.warn("No offers data found in response");
          setOffers([]);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_SERVER_URL}/api/testimonials/published`
        );

        // Access the nested array properly
        const apiData = response.data?.data?.testimonials || [];

        if (Array.isArray(apiData) && apiData.length > 0) {
          const formattedTestimonials = apiData.map((testimonial) => ({
            name: testimonial.name || "Anonymous",
            location: "Valsad",
            text: testimonial.comment || "No comment provided.",
            initial: testimonial.name
              ? testimonial.name.charAt(0).toUpperCase()
              : "?",
            rating: testimonial.rating || 5,
            email: testimonial.email || "",
          }));

          setTestimonials(formattedTestimonials);
        } else {
          console.warn("No testimonials data found in response");
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([
          {
            name: "Priya Sharma",
            location: "Valsad",
            text: "Incredibly fresh! Love supporting local farmers.",
            initial: "P",
            rating: 5,
          },
          {
            name: "Rajesh Tandel",
            location: "Valsad",
            text: "Flexible weights = less waste. Great idea!",
            initial: "R",
            rating: 5,
          },
          {
            name: "Anita Patel",
            location: "Valsad",
            text: "Weekly delivery keeps my kitchen stocked effortlessly.",
            initial: "A",
            rating: 5,
          },
        ]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handle offer click - increment count and navigate
  const handleOfferClick = async (offer) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_SERVER_URL}/api/offers/${offer._id}/click`
      );
    } catch (error) {
      console.error("Error recording click:", error);
    }

    setSelectedOffer(offer);
    navigate("/selected-vegetable");
    window.scrollTo(0, 0);
  };

  const features = [
    {
      icon: BiLeaf,
      title: "Farm Fresh Daily",
      desc: "Morning harvest, evening delivery — no cold storage.",
    },
    {
      icon: FiUsers,
      title: "Support Local Farmers",
      desc: "Buy directly from nearby farmers. Help communities thrive.",
    },
    {
      icon: FaRupeeSign,
      title: "Flexible Weights",
      desc: "Pick 100g–1kg. Perfect portions, zero waste.",
    },
    {
      icon: FiPackage,
      title: "Weekly Packages",
      desc: "Subscribe for weekly veggie boxes at discounts.",
    },
    {
      icon: FiCreditCard,
      title: "Easy Payments",
      desc: "COD or online — secure, quick, convenient.",
    },
  ];

  const weights = [
    { weight: "100g", desc: "Try new veggies" },
    { weight: "250g", desc: "For couples" },
    { weight: "500g", desc: "Small families" },
    { weight: "1kg", desc: "Best value" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-[#0e540b]">
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-white rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-[#F54A00] rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "0.2s", animationDuration: "3s" }}
            ></div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div
            className="opacity-0 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="font-amiko text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Fresh from Local Farms
              <br />
              <span className="font-Amiko text-white">to Your Doorstep</span>
            </h1>

            <p className="font-assistant text-base sm:text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed px-4 font-medium">
              Taste the freshness of local farms delivered straight to you —
              Fresh Vegetables, Offerable prices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
              <button
                onClick={() => {
                  navigate("/vegetables");
                  window.scrollTo(0, 0);
                }}
                className="group font-assistant hover:cursor-pointer bg-[#F54A00] hover:bg-[#e04400] text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-200 flex items-center gap-2.5 hover:shadow-2xl hover:shadow-[#F54A00]/40 hover:scale-105 w-full sm:w-auto justify-center"
              >
                <RiShoppingBag4Fill className="w-5 h-5" />
                Vegetable Shopping
                <FiArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  strokeWidth={2.5}
                />
              </button>

              <button
                onClick={() => {
                  navigate("/offers");
                  window.scrollTo(0, 0);
                }}
                className="group font-assistant hover:cursor-pointer bg-[#F54A00] hover:bg-[#e04400] text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-200 flex items-center gap-2.5 hover:shadow-2xl hover:shadow-[#FF6B35]/40 hover:scale-105 w-full sm:w-auto justify-center"
              >
                <GiBasket className="w-5 h-5" strokeWidth={2.5} />
                Basket Shopping
                <FiArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  strokeWidth={2.5}
                />
              </button>

              <a
                href="#features"
                className="font-assistant bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-200 hover:scale-105 w-full sm:w-auto text-center flex items-center gap-2.5 justify-center"
              >
                <FiInfo className="w-5 h-5" strokeWidth={2.5} />
                Learn More
              </a>
            </div>

            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="inline-flex flex-col items-center gap-2 text-white/70">
                <span className="text-sm font-medium tracking-wide font-assistant">
                  Scroll to explore
                </span>
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1.5 animate-bounce">
                  <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-[#fafdfb] to-white"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2
              className={`font-amiko text-3xl sm:text-4xl md:text-5xl font-bold text-[#0E540B] mb-4 tracking-tight transition-all duration-700 ${
                visibleSections.has("features")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Why Choose VegBazar?
            </h2>
            <p
              className={`text-base font-assistant sm:text-lg text-gray-600 leading-relaxed transition-all duration-700 delay-100 ${
                visibleSections.has("features")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Fresh vegetables, happy customers, empowered farmers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-[#0E540B]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                    visibleSections.has("features")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    transitionDelay: `${i * 100 + 200}ms`,
                  }}
                >
                  <div className="w-14 h-14 bg-[#0E540B]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#0E540B]/15 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#0E540B]" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-poppins font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-assistant text-base text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Special Offers Section */}
      <section
        id="products"
        className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-[#fafdfb] to-white"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2
              className={`text-3xl font-amiko sm:text-4xl md:text-5xl font-bold text-[#0E540B] mb-4 tracking-tight transition-all duration-700 ${
                visibleSections.has("products")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Special Offers
            </h2>
            <p
              className={`text-base sm:text-lg font-assistant text-gray-600 leading-relaxed transition-all duration-700 delay-100 ${
                visibleSections.has("products")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Save more with curated packages
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E540B]"></div>
            </div>
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm">
                No offers available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:gap-6 max-w-6xl mx-auto">
              {offers.map((offer, i) => {
                const badges = [" Popular", "Premium", "Best Value"];
                const badgeColors = [
                  "bg-gradient-to-r from-orange-500 to-red-500",
                  "bg-gradient-to-r from-yellow-500 to-amber-500",
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                ];

                return (
                  <div
                    key={offer._id}
                    className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#0e540b] active:scale-95 sm:hover:-translate-y-1 sm:hover:scale-[1.02] overflow-hidden flex flex-col ${
                      visibleSections.has("products")
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-12"
                    }`}
                    style={{
                      transitionDelay: `${i * 100 + 200}ms`,
                    }}
                    onClick={() => handleOfferClick(offer)}
                  >
                    <div
                      className={`absolute top-2 right-2 z-20 ${badgeColors[i]} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}
                    >
                      <span>{badges[i]}</span>
                    </div>

                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 sm:p-4 text-center relative overflow-hidden flex-shrink-0">
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#0e540b] opacity-10 rounded-bl-full"></div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e540b]" />
                        </div>
                        <h3 className="text-base font-poppins sm:text-lg font-bold text-gray-800 mb-1">
                          {offer.title}
                        </h3>
                        <div className="flex font-assistant items-center justify-center gap-1 text-gray-600 text-xs">
                          <Leaf className="w-3 h-3" />
                          <span>
                            {offer.vegetables?.length || 0} vegetables
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div className="text-center mb-3 flex-shrink-0">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0e540b]" />
                          <span className="text-xs font-medium font-assistant text-gray-600">
                            Price
                          </span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-assistant font-bold text-[#0e540b]">
                          ₹{offer.price}
                        </p>
                      </div>

                      {offer.description && (
                        <p className="text-gray-600 font-assistant text-center mb-3 text-xs leading-relaxed flex-shrink-0 px-2">
                          {offer.description}
                        </p>
                      )}

                      {offer.vegetables && offer.vegetables.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 mb-3 border border-green-100 flex-shrink-0">
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 font-assistant text-[#0e540b]" />
                            What's Included:
                          </p>
                          <ul className="space-y-1.5 font-assistant">
                            {offer.vegetables.slice(0, 3).map((veg, index) => (
                              <li
                                key={veg._id || index}
                                className="text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <div className="w-1 h-1 rounded-full bg-[#0e540b] flex-shrink-0"></div>
                                <span className="truncate font-assistant">
                                  {veg.name}
                                </span>
                              </li>
                            ))}
                            {offer.vegetables.length > 3 && (
                              <li className="text-xs text-[#0e540b] font-medium flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full font-assistant bg-[#0e540b] flex-shrink-0"></div>
                                +{offer.vegetables.length - 3} more vegetables
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      <button
                        aria-label={`Select ${offer.title} package`}
                        className="w-full font-assistant bg-gradient-to-r from-[#0e540b] to-[#063a06] text-white font-semibold py-2.5 sm:py-2 px-3 rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 group-hover:scale-105 text-xs sm:text-sm mt-auto"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Select Package
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 sm:py-24 md:py-28 bg-white"
        data-animate
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2
              className={`text-3xl font-amiko sm:text-4xl md:text-5xl font-bold text-[#0E540B] mb-4 tracking-tight transition-all duration-700 ${
                visibleSections.has("how-it-works")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              How It Works
            </h2>
            <p
              className={`text-base font-assistant sm:text-lg text-gray-600 leading-relaxed transition-all duration-700 delay-100 ${
                visibleSections.has("how-it-works")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              From farm to your table in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                num: 1,
                title: "Browse & Select",
                desc: "Choose fresh vegetables and weights.",
              },
              {
                num: 2,
                title: "Place Order",
                desc: "Checkout easily with COD or online payment.",
              },
              {
                num: 3,
                title: "Receive Fresh",
                desc: "Delivered fresh the same day or next morning.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`relative text-center hover:cursor-pointer transition-all duration-700 ${
                  visibleSections.has("how-it-works")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${i * 150 + 200}ms`,
                }}
              >
                <div className="inline-flex font-assistant items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E540B] to-[#0a4008] text-white text-2xl font-bold mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl font-poppins font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="font-assistant text-base text-gray-600 leading-relaxed">
                  {step.desc}
                </p>

                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#0E540B]/30 to-transparent">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0E540B]/40 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weight Options */}
      <section
        className="py-20 sm:py-24 md:py-28 bg-gradient-to-br from-[#0E540B] via-[#0a4008] to-[#083307] text-white relative overflow-hidden"
        data-animate
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-[350px] h-[350px] bg-emerald-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-amiko sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Choose Your Perfect Portion
          </h2>
          <p className="font-assistant text-white/80 text-base sm:text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
            Flexible weights for every need
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 hover:cursor-pointer">
            {weights.map((w, i) => (
              <div
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/offers");
                }}
                key={i}
                className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 shadow-xl"
              >
                <h3 className="text-4xl font-poppins font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {w.weight}
                </h3>
                <p className="font-assistant text-sm text-white/80 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="stories"
        className="py-20 sm:py-24 md:py-28 bg-gradient-to-br from-[#f5faf6] to-[#fef9f5]"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2
              className={`text-3xl font-amiko sm:text-4xl md:text-5xl font-bold text-[#0E540B] mb-4 tracking-tight transition-all duration-700 ${
                visibleSections.has("stories")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              What Our Customers Say
            </h2>
            <p
              className={`text-base font-assistant sm:text-lg text-gray-600 leading-relaxed transition-all duration-700 delay-100 ${
                visibleSections.has("stories")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Loved by thousands across India
            </p>
          </div>

          {testimonialsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E540B]"></div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm">
                No testimonials available at the moment
              </p>
            </div>
          ) : (
            <div
              className="relative max-w-4xl mx-auto"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${currentTestimonialIndex * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial, i) => (
                    <div key={i} className="min-w-full px-4">
                      <div
                        className={`bg-white p-8 md:p-12 rounded-2xl border-2 border-gray-200 shadow-lg max-w-3xl mx-auto ${
                          visibleSections.has("stories")
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-12"
                        } transition-all duration-500`}
                      >
                        <div className="flex gap-1 mb-6 justify-center">
                          {[...Array(testimonial.rating)].map((_, k) => (
                            <FiStar
                              key={k}
                              className="w-6 h-6 fill-[#F54A00] text-[#F54A00]"
                              strokeWidth={0}
                            />
                          ))}
                        </div>

                        <p className="font-assistant text-gray-700 italic leading-relaxed mb-8 text-lg md:text-xl text-center">
                          "{testimonial.text}"
                        </p>

                        <div className="flex items-center gap-4 justify-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#0E540B] to-[#0a4008] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {testimonial.initial}
                          </div>
                          <div>
                            <div className="font-bold font-poppins text-gray-900 text-base">
                              {testimonial.name}
                            </div>
                            <div className="text-sm font-assistant text-gray-500">
                              {testimonial.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows - Only show if more than 1 testimonial */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousTestimonial}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 border-2 border-gray-200"
                    aria-label="Previous testimonial"
                  >
                    <FiArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <button
                    onClick={goToNextTestimonial}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 border-2 border-gray-200"
                    aria-label="Next testimonial"
                  >
                    <FiArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots Navigation - Only show if more than 1 testimonial */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonialSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentTestimonialIndex
                          ? "w-8 h-3 bg-[#0E540B]"
                          : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-r from-[#F54A00] via-orange-600 to-[#F54A00] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-amiko md:text-5xl font-bold mb-4 tracking-tight">
            Ready for Farm Fresh?
          </h2>
          <p className="font-assistant text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
            Start your fresh journey today
          </p>

          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/offers");
            }}
            className="group bg-white text-[#F54A00] px-10 py-4 rounded-full font-bold text-base hover:bg-gray-50 transition-all duration-200 flex items-center font-assistant gap-2.5 mx-auto hover:shadow-2xl hover:scale-105"
          >
            <FiShoppingBag className="w-5 h-5" strokeWidth={2.5} />
            Shop Now
            <FiArrowRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#0a3d08] to-[#041f04] text-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#F54A00] rounded-xl flex items-center justify-center shadow-sm">
                  <GiBasket className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold">VegBazar</span>
              </div>
              <p className="font-assistant text-white/70 text-sm leading-relaxed">
                Fresh vegetables from local farms, delivered to your doorstep
                with love.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3 text-sm">Quick Links</h3>
              <ul className="space-y-2">
                {["About Us", "Our Farmers", "Delivery Areas", "FAQ"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-assistant text-white/70 hover:text-white text-sm transition-colors duration-200 inline-block hover:translate-x-0.5"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3 text-sm">Support</h3>
              <ul className="space-y-2">
                {[
                  "Contact Us",
                  "Track Order",
                  "Return Policy",
                  "Privacy Policy",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-assistant text-white/70 hover:text-white text-sm transition-colors duration-200 inline-block hover:translate-x-0.5"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3 text-sm">
                Get in Touch
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="opacity-70">
                    <SiGmail />
                  </span>
                  <span className="font-assistant">
                    info.vegbazar@gmail.com
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="opacity-70">
                    <BiPhoneCall />
                  </span>
                  <span className="font-assistant">+91 87805 64115</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="opacity-70">
                    <FaMapPin />
                  </span>
                  <span className="font-assistant">
                    Vashiyar velly, Valsad, Gujarat
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="font-assistant text-xs text-white/60">
              © 2025 VegBazar — Made with 💚 for farmers & families
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
