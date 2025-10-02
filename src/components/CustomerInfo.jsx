import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useOrderContext } from "../Context/OrderContext.jsx";
import { User, MapPin, Map, Navigation, Phone, Mail, ArrowRight, AlertCircle } from "lucide-react";

const CustomerInfo = () => {
  const { formData, setFormData, navigate } = useOrderContext();
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
      email: formData.email || ""
    }
  });

  const watchedCity = watch("city");

  const CityApiCall = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_SERVER_URL}/api/cities`);
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    CityApiCall();
  }, []);

  useEffect(() => {
    if (watchedCity) {
      setValue("area", "");
    }
  }, [watchedCity, setValue]);

  const onSubmit = (data) => {
    setFormData(data);
    navigate("/offers");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0e540b] rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#0e540b] mb-2">
            Customer Information
          </h2>
          <p className="text-gray-600 text-base">
            Please fill in your details to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0e540b]" />
                Full Name
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 text-base border ${
                  errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
                placeholder="Enter your full name"
                {...register("name", {
                  required: "Name is required.",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters."
                  },
                  validate: (value) => value.trim() !== "" || "Name cannot be empty."
                })}
              />
              {errors.name && (
                <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0e540b]" />
                Street Address
              </label>
              <textarea
                className={`w-full px-4 py-3 text-base border ${
                  errors.address ? "border-red-500 bg-red-50" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] resize-none`}
                rows="3"
                placeholder="House no., Street name, Landmark..."
                {...register("address", {
                  required: "Address is required.",
                  validate: (value) => value.trim() !== "" || "Address cannot be empty."
                })}
              />
              {errors.address && (
                <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* City */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#0e540b]" />
                  City
                </label>
                <select
                  className={`w-full px-4 py-3 text-base border ${
                    errors.city ? "border-red-500 bg-red-50" : "border-gray-300"
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
                  <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                    <AlertCircle className="w-5 h-5" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Area */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#0e540b]" />
                  Area
                </label>
                <select
                  className={`w-full px-4 py-3 text-base border ${
                    errors.area ? "border-red-500 bg-red-50" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] ${
                    !watchedCity ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                  disabled={!watchedCity}
                  {...register("area", { required: "Please select an area." })}
                >
                  <option value="">{watchedCity ? "Select Area" : "Select City First"}</option>
                  {cities
                    .find((c) => c.name === watchedCity)
                    ?.areas?.map((a, idx) => (
                      <option key={idx} value={a}>
                        {a}
                      </option>
                    ))}
                </select>
                {errors.area && (
                  <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                    <AlertCircle className="w-5 h-5" />
                    {errors.area.message}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#0e540b]" />
                Mobile Number
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3 text-base border ${
                  errors.mobile ? "border-red-500 bg-red-50" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
                placeholder="10-digit mobile number"
                {...register("mobile", {
                  required: "Mobile number is required.",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Enter a valid 10-digit mobile number."
                  }
                })}
              />
              {errors.mobile && (
                <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5" />
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0e540b]" />
                Email Address
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 text-base border ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
                placeholder="your.email@example.com"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address."
                  }
                })}
              />
              {errors.email && (
                <p className="flex items-center gap-1 mt-2 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0e540b] text-white font-semibold py-4 px-6 rounded-lg hover:bg-[#0e540b] transition-all duration-300 shadow-md flex items-center justify-center gap-3 mt-6 text-base"
            >
              Continue to Offers
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-base text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your information is secure and will not be shared
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
