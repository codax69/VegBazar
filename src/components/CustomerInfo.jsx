import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useOrderContext } from "../Context/OrderContext.jsx";

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

  // Reset area when city changes
  useEffect(() => {
    if (watchedCity) {
      setValue("area", "");
    }
  }, [watchedCity, setValue]);

  const onSubmit = (data) => {
    // Update the context with form data
    setFormData(data);
    navigate("/offers");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-lg">
      <h2 className="text-xl trirong sm:text-2xl font-extrabold text-center mb-4 sm:mb-6 text-[#0e540b]">
        Customer Information
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="khula block text-md font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            className={`khula w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
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
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="khula block text-md font-medium text-gray-700 mb-2">
            Street Address
          </label>
          <textarea
            className={`khula w-full px-3 py-2 border ${
              errors.address ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
            rows="3"
            placeholder="Enter your street address, landmark, etc."
            {...register("address", {
              required: "Address is required.",
              validate: (value) => value.trim() !== "" || "Address cannot be empty."
            })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        {/* City & Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label className="khula block text-md font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              className={`khula w-full px-3 py-2 border ${
                errors.city ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
              {...register("city", {
                required: "Please select a city."
              })}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city.message}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="khula block text-md font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              className={`khula w-full px-3 py-2 border ${
                errors.area ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
              disabled={!watchedCity}
              {...register("area", {
                required: "Please select an area."
              })}
            >
              <option value="">Select Area</option>
              {cities
                .find((c) => c.name === watchedCity)
                ?.areas?.map((a, idx) => (
                  <option className="khula font-md" key={idx} value={a}>
                    {a}
                  </option>
                ))}
            </select>
            {errors.area && (
              <p className="text-red-500 text-sm">{errors.area.message}</p>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="khula block text-md font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            className={`khula w-full px-3 py-2 border ${
              errors.mobile ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
            placeholder="Enter your mobile number"
            {...register("mobile", {
              required: "Mobile number is required.",
              pattern: {
                value: /^\d{10}$/,
                message: "Enter a valid 10-digit mobile number."
              },
              validate: (value) => value.trim() !== "" || "Mobile number cannot be empty."
            })}
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm">{errors.mobile.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="khula block text-md font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            className={`khula w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e540b]`}
            placeholder="Enter your email address"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address."
              },
              validate: (value) => value.trim() !== "" || "Email cannot be empty."
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#0e540b] text-white py-2 px-4 rounded-md hover:bg-[#0e540b]/90 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to Offers
        </button>
      </form>
    </div>
  );
};

export default CustomerInfo;
