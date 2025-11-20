import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useOrderContext } from "../Context/OrderContext.jsx";
import {
  FiUser,
  FiMapPin,
  FiMap,
  FiNavigation,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiAlertCircle,
  FiPackage,
} from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";

const CustomerInfo = () => {
  const { formData, setFormData, navigate, selectedOffer } = useOrderContext();
  const [cities, setCities] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: formData.name || "",
      address: formData.address || "",
      city: formData.city || "",
      area: formData.area || "",
      mobile: formData.mobile || "",
      email: formData.email || "",
    },
  });

  const watchedCity = watch("city");

  /* ----------------------------------------------
      1️⃣ LOAD CUSTOMER INFO FROM LOCAL STORAGE
  ------------------------------------------------*/
  useEffect(() => {
    const saved = localStorage.getItem("customerInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((key) => {
        if (parsed[key]) setValue(key, parsed[key]);
      });

      // Also update context
      setFormData(parsed);
    }
  }, [setValue, setFormData]);

  const CityApiCall = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_SERVER_URL}/api/cities`
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    CityApiCall();
  }, []);

  useEffect(() => {
    if (watchedCity) setValue("area", "");
  }, [watchedCity, setValue]);

  /* ----------------------------------------------
      2️⃣ SAVE CUSTOMER INFO TO LOCAL STORAGE
  ------------------------------------------------*/
  const onSubmit = (data) => {
    window.scrollTo(0, 0);

    // Save to context
    setFormData(data);

    // Save to localStorage
    localStorage.setItem("customerInfo", JSON.stringify(data));

    navigate(selectedOffer ? "/billing" : "/veg-bag");
  };

  return (
    <div className="min-h-fit bg-gradient-to-br from-green-50 to-emerald-50 pt-10 md:pt-20 md:px-4 flex items-center justify-center">
      <div className="w-full md:max-w-5xl">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side */}
          <div className="hidden md:block w-full lg:w-2/5 bg-[#0e540b] text-white p-6 sm:p-8">
            <div className="mb-2 sm:mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center">
                  <FiUser className="text-[#0e540b]" />
                </div>
              </div>
            </div>

            <h1 className="text-lg font-amiko sm:text-2xl font-bold mb-1">
              Customer Information
            </h1>
            <p className="text-green-100 font-assistant  text-xs sm:text-sm mb-6 sm:mb-8">
              Provide your details to proceed with your order.
            </p>

            <div className="space-y-4 sm:space-y-5">
              {[
                {
                  icon: LuShieldCheck,
                  title: "Secure & Private",
                  desc: "Your data is encrypted and protected",
                },
                {
                  icon: FiPackage,
                  title: "Fast Delivery",
                  desc: "Quick doorstep delivery",
                },
                {
                  icon: FiPhone,
                  title: "24/7 Support",
                  desc: "Always here to help you",
                },
              // eslint-disable-next-line no-unused-vars
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0e540b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-poppins text-white text-xs sm:text-sm mb-0.5">
                      {title}
                    </h3>
                    <p className="text-green-100 font-assistant text-xs">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-3/5 bg-white p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-[#0e540b]" />
                  Full Name
                </label>
                <input
                  type="text"
                  className={`w-full font-assistant px-3 py-2 text-sm border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] bg-white`}
                  placeholder="Enter your full name"
                  {...register("name", {
                    required: "Name is required.",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters.",
                    },
                  })}
                />
                {errors.name && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-[#0e540b]" />
                  Street Address
                </label>
                <textarea
                  rows="2"
                  className={`w-full font-assistant px-3 py-2 text-sm border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] resize-none bg-white`}
                  placeholder="House no., Street name, Landmark..."
                  {...register("address", { required: "Address is required." })}
                />
                {errors.address && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* City + Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <FiMap className="w-4 h-4 text-[#0e540b]" />
                    City
                  </label>
                  <select
                    className={`w-full font-assistant px-3 py-2 text-sm border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] bg-white`}
                    {...register("city", { required: "Please select a city." })}
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <FiNavigation className="w-4 h-4 text-[#0e540b]" />
                    Area
                  </label>
                  <select
                    className={`w-full font-assistant px-3 py-2 text-sm border ${
                      errors.area ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] ${
                      !watchedCity ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                    disabled={!watchedCity}
                    {...register("area", { required: "Please select an area." })}
                  >
                    <option value="">
                      {watchedCity ? "Select Area" : "Select City First"}
                    </option>
                    {cities
                      .find((c) => c.name === watchedCity)
                      ?.areas?.map((a, idx) => (
                        <option key={idx} value={a}>
                          {a}
                        </option>
                      ))}
                  </select>
                  {errors.area && (
                    <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.area.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-[#0e540b]" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className={`w-full font-assistant px-3 py-2 text-sm border ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] bg-white`}
                  placeholder="10-digit mobile number"
                  {...register("mobile", {
                    required: "Mobile number is required.",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Enter a valid 10-digit mobile number.",
                    },
                  })}
                />
                {errors.mobile && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block font-poppins text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-[#0e540b]" />
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full font-assistant px-3 py-2 text-sm border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] bg-white`}
                  placeholder="your.email@example.com"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
                {errors.email && (
                  <p className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full font-assistant bg-[#0e540b] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0a3f08] transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4 text-sm"
              >
                Continue to Offers
                <FiArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
