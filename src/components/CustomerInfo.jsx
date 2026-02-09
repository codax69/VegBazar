import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useOrderContext } from "../Context/OrderContext.jsx";
import { useAuth } from "../Context/AuthContext.jsx";
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
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiStar,
} from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";

const AddressCard = memo(({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault
}) => (
  <div
    onClick={() => onSelect(address)}
    className={`bg-white rounded-xl shadow-md p-4 cursor-pointer 
      transform-gpu will-change-transform
      transition-all duration-300 ease-out
      ${isSelected
        ? "ring-2 ring-[#0e540b] bg-green-50 scale-[1.01]"
        : "hover:shadow-lg hover:scale-[1.005]"
      }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-bold text-gray-800 capitalize">{address.type || 'Home'}</h4>
          {address.isDefault && (
            <span className="px-2 py-0.5 bg-[#0e540b] text-white text-xs rounded-full
              animate-pulse-subtle flex items-center gap-1">
              <FiStar className="w-3 h-3" />
              Default
            </span>
          )}
          <div className={`transform transition-all duration-200 ease-out
            ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <FiCheck className="w-5 h-5 text-[#0e540b]" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">{address.street}</p>
        {address.area && (
          <p className="text-sm text-gray-600 mb-1">{address.area}</p>
        )}
        <p className="text-sm text-gray-600 mb-1">{address.city}</p>
        <p className="text-sm text-gray-600">
          {address.state} - {address.pincode}
        </p>
      </div>

      <div className="flex gap-2 ml-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }}
          className="p-2 hover:bg-green-100 rounded-full transition-all duration-200 
            hover:scale-110 active:scale-95"
          title="Edit"
        >
          <FiEdit2 className="w-4 h-4 text-[#0e540b]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(address._id);
          }}
          className="p-2 hover:bg-red-100 rounded-full transition-all duration-200
            hover:scale-110 active:scale-95"
          title="Delete"
        >
          <FiTrash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>

    {!address.isDefault && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSetDefault(address._id);
        }}
        className="mt-3 text-sm text-[#0e540b] hover:underline font-semibold
          transition-all duration-200 hover:translate-x-1 flex items-center gap-1"
      >
        <FiStar className="w-3 h-3" />
        Set as Default
      </button>
    )}
  </div>
));

AddressCard.displayName = 'AddressCard';

const AddressSkeleton = memo(() => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

AddressSkeleton.displayName = 'AddressSkeleton';

const infoItems = [
  {
    icon: LuShieldCheck,
    title: "Secure & Private",
    desc: "Your data is encrypted",
  },
  {
    icon: FiPackage,
    title: "Fast Delivery",
    desc: "Quick doorstep service",
  },
  {
    icon: FiPhone,
    title: "24/7 Support",
    desc: "Always here to help",
  },
];

const CustomerInfo = () => {
  const { formData, setFormData, navigate, selectedOffer } = useOrderContext();
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      type: "home",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    },
  });

  const watchedCity = watch("city");

  const availableAreas = useMemo(() => {
    if (!watchedCity) return [];
    return cities.find((c) => c.name === watchedCity)?.areas || [];
  }, [watchedCity, cities]);

  const fetchAddresses = useCallback(async () => {
    if (!user?._id && !user?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_SERVER_URL}/api/addresses/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const addressData = response.data?.data?.addresses || response.data?.addresses || response.data || [];
      const addressList = Array.isArray(addressData) ? addressData : [];
      setAddresses(addressList);

      // Auto-select default address
      const defaultAddr = response.data?.data?.defaultAddress || addressList.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (addressList.length > 0) {
        // If no default, select the first address
        setSelectedAddress(addressList[0]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.id]);

  const fetchCities = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_SERVER_URL}/api/cities`
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  }, []);

  useEffect(() => {
    fetchCities();
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchCities, fetchAddresses]);

  useEffect(() => {
    if (watchedCity) setValue("area", "");
  }, [watchedCity, setValue]);

  const handleSelectAddress = useCallback((address) => {
    setSelectedAddress(address);
  }, []);

  const handleEditAddress = useCallback((address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
    requestAnimationFrame(() => {
      setValue("type", address.type || "home");
      setValue("street", address.street);
      setValue("city", address.city);
      setTimeout(() => setValue("area", address.area || ""), 50);
      setValue("state", address.state);
      setValue("pincode", address.pincode);
      setValue("isDefault", address.isDefault || false);
    });
  }, [setValue]);

  const handleDeleteAddress = useCallback(async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const previousAddresses = addresses;
    setAddresses(prev => prev.filter(a => a._id !== addressId));
    if (selectedAddress?._id === addressId) {
      const remainingAddresses = addresses.filter(a => a._id !== addressId);
      setSelectedAddress(remainingAddresses.length > 0 ? remainingAddresses[0] : null);
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_SERVER_URL}/api/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (error) {
      console.error("Error deleting address:", error);
      setAddresses(previousAddresses);
      alert("Failed to delete address. Please try again.");
    }
  }, [addresses, selectedAddress]);

  const handleSetDefault = useCallback(async (addressId) => {
    const previousAddresses = addresses;

    // Optimistic update
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a._id === addressId
    })));

    // Update selected address if it's the one being set as default
    const updatedAddress = addresses.find(a => a._id === addressId);
    if (updatedAddress) {
      setSelectedAddress({ ...updatedAddress, isDefault: true });
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_SERVER_URL}/api/addresses/${addressId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh addresses to ensure consistency
      await fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
      setAddresses(previousAddresses);
      alert("Failed to set default address. Please try again.");
    }
  }, [addresses, fetchAddresses]);

  const onSubmit = useCallback(async (data) => {
    try {
      setSaving(true);

      if (editingAddress) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_SERVER_URL}/api/addresses/${editingAddress._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_SERVER_URL}/api/addresses/add`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      await fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      reset({
        type: "home",
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error saving address:", error);
      const errorMessage = error.response?.data?.message || "Failed to save address. Please try again.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [editingAddress, fetchAddresses, reset]);

  const handleContinue = useCallback(() => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFormData(selectedAddress);
    navigate(selectedOffer ? "/billing" : "/cart");
  }, [selectedAddress, setFormData, navigate, selectedOffer]);

  const handleAddNew = useCallback(() => {
    setEditingAddress(null);
    reset({
      type: "home",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0, // Set as default if first address
    });
    setShowAddressForm(true);
  }, [reset, addresses.length]);

  const handleCloseForm = useCallback(() => {
    setShowAddressForm(false);
    setEditingAddress(null);
    reset();
  }, [reset]);

  const continueButtonText = useMemo(() =>
    `Continue to ${selectedOffer ? "Billing" : "Cart"}`,
    [selectedOffer]
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-10 md:pt-20 pb-24 md:pb-10 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiMapPin className="text-[#0e540b]" />
            Delivery Address
          </h1>
          <p className="text-gray-600 mt-2">
            {addresses.length > 0
              ? "Select a delivery address or add a new one"
              : "Add your delivery address to continue"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Saved Addresses */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add New Address Button */}
            {!showAddressForm && (
              <button
                onClick={handleAddNew}
                className="w-full p-4 border-2 border-dashed border-[#0e540b] rounded-xl
                  bg-green-50 hover:bg-green-100 transition-all duration-300 ease-out
                  flex items-center justify-center gap-3 text-[#0e540b] font-semibold
                  hover:scale-[1.01] active:scale-[0.99] transform-gpu"
              >
                <FiPlus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Add New Address
              </button>
            )}

            {/* Address Form */}
            <div className={`transform-gpu transition-all duration-300 ease-out overflow-hidden
              ${showAddressForm
                ? 'opacity-100 max-h-[2000px] translate-y-0'
                : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none'
              }`}>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200
                      hover:rotate-90 active:scale-90"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Address Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-[#0e540b]" />
                      Address Type
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent transition-all duration-200"
                      {...register("type")}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-[#0e540b]" />
                      Street Address
                    </label>
                    <textarea
                      rows="2"
                      className={`w-full px-3 py-2 text-sm border transition-all duration-200 ${errors.street ? "border-red-500 shake" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent resize-none`}
                      placeholder="House no., Street name, Landmark..."
                      {...register("street", {
                        required: "Street address is required.",
                      })}
                    />
                    {errors.street && (
                      <p className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-slide-in">
                        <FiAlertCircle className="w-3 h-3" />
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* City + Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FiMap className="w-4 h-4 text-[#0e540b]" />
                        City
                      </label>
                      <select
                        className={`w-full px-3 py-2 text-sm border transition-all duration-200 ${errors.city ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent`}
                        {...register("city", {
                          required: "Please select a city.",
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
                        <p className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-slide-in">
                          <FiAlertCircle className="w-3 h-3" />
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FiNavigation className="w-4 h-4 text-[#0e540b]" />
                        Area
                      </label>
                      <select
                        className={`w-full px-3 py-2 text-sm border transition-all duration-200 ${errors.area ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent ${!watchedCity
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : ""
                          }`}
                        disabled={!watchedCity}
                        {...register("area", {
                          required: "Please select an area.",
                        })}
                      >
                        <option value="">
                          {watchedCity ? "Select Area" : "Select City First"}
                        </option>
                        {availableAreas.map((a, idx) => (
                          <option key={idx} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      {errors.area && (
                        <p className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-slide-in">
                          <FiAlertCircle className="w-3 h-3" />
                          {errors.area.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State + Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FiMap className="w-4 h-4 text-[#0e540b]" />
                        State
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 text-sm border transition-all duration-200 ${errors.state ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent`}
                        placeholder="Enter state"
                        {...register("state", {
                          required: "State is required.",
                        })}
                      />
                      {errors.state && (
                        <p className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-slide-in">
                          <FiAlertCircle className="w-3 h-3" />
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FiNavigation className="w-4 h-4 text-[#0e540b]" />
                        Pincode
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 text-sm border transition-all duration-200 ${errors.pincode ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e540b] focus:border-transparent`}
                        placeholder="6-digit pincode"
                        {...register("pincode", {
                          required: "Pincode is required.",
                          pattern: {
                            value: /^\d{6}$/,
                            message: "Enter a valid 6-digit pincode.",
                          },
                        })}
                      />
                      {errors.pincode && (
                        <p className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-slide-in">
                          <FiAlertCircle className="w-3 h-3" />
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Set as Default Checkbox */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <input
                      type="checkbox"
                      id="isDefault"
                      className="w-4 h-4 text-[#0e540b] border-gray-300 rounded focus:ring-[#0e540b]"
                      {...register("isDefault")}
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                      <FiStar className="w-4 h-4 text-[#0e540b]" />
                      Set as default address
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-3 rounded-lg font-semibold text-white
                      bg-[#0e540b] hover:bg-[#0a3f08] transition-all duration-300 ease-out
                      flex items-center justify-center gap-2
                      hover:shadow-lg active:scale-[0.98] transform-gpu
                      disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheck className="w-5 h-5" />
                    )}
                    {saving
                      ? "Saving..."
                      : editingAddress ? "Update Address" : "Save Address"
                    }
                  </button>
                </form>
              </div>
            </div>

            {/* Saved Addresses List */}
            {loading ? (
              <AddressSkeleton />
            ) : addresses.length === 0 && !showAddressForm ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No addresses yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your first delivery address to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div
                    key={address._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AddressCard
                      address={address}
                      isSelected={selectedAddress?._id === address._id}
                      onSelect={handleSelectAddress}
                      onEdit={handleEditAddress}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefault}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#0e540b] text-white rounded-xl p-6 sticky top-24
              transform-gpu transition-all duration-300 hover:shadow-xl">
              <div className="mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3
                  animate-bounce-subtle">
                  <FiMapPin className="text-[#0e540b] w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delivery Information</h3>
                <p className="text-green-100 text-sm">
                  Manage your delivery addresses
                </p>
              </div>

              <div className="space-y-4">
                {infoItems.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 transform transition-all duration-300
                      hover:translate-x-1"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-lg 
                      flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-5 h-5 text-[#0e540b]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
                      <p className="text-green-100 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button - Desktop */}
        <div className="hidden md:block mt-6">
          <button
            onClick={handleContinue}
            disabled={!selectedAddress}
            className={`w-full px-6 py-4 rounded-xl font-bold text-lg
              flex items-center justify-center gap-3 transition-all duration-300 ease-out
              transform-gpu
              ${selectedAddress
                ? "bg-[#0e540b] hover:bg-[#0a3f08] text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {continueButtonText}
            <FiArrowRight className={`w-5 h-5 transition-transform duration-300
              ${selectedAddress ? 'group-hover:translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Continue Button - Mobile (Fixed) */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 
          shadow-lg z-50 transform-gpu backdrop-blur-sm bg-opacity-95">
          <div className="px-4 py-3">
            <button
              onClick={handleContinue}
              disabled={!selectedAddress}
              className={`w-full px-6 py-3.5 rounded-xl font-bold text-base
                flex items-center justify-center gap-2 transition-all duration-300 ease-out
                transform-gpu
                ${selectedAddress
                  ? "bg-[#0e540b] hover:bg-[#0a3f08] text-white shadow-lg active:scale-[0.97]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {continueButtonText}
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.2s ease-out forwards;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .shake {
          animation: shake 0.3s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default CustomerInfo;