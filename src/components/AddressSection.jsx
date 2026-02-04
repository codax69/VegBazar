import React from "react";
import { MapPin, Plus, Edit, CheckCircle } from "lucide-react";

const AddressSection = React.memo(
  ({ defaultAddress, onChangeAddress, user, isLoading = false }) => (
    <div className="bg-[#f0fcf6] p-4 md:p-3 rounded-lg shadow-md">
      <h3 className="font-poppins text-base md:text-sm font-bold text-gray-800 mb-3 md:mb-2 flex items-center gap-2">
        <MapPin size={18} className="text-[#0e540b] md:w-4 md:h-4" />
        Delivery Address
      </h3>
      {isLoading ? (
        <div className="text-center py-6 md:py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-[#0e540b] mx-auto mb-2"></div>
          <p className="font-assistant text-gray-600 text-sm md:text-xs">
            Loading address...
          </p>
        </div>
      ) : !defaultAddress ? (
        <div className="text-center py-6 md:py-4">
          <MapPin
            size={48}
            className="mx-auto text-gray-300 mb-3 md:w-10 md:h-10"
          />
          <p className="font-assistant text-gray-600 mb-4 text-sm md:text-xs">
            No delivery address added yet
          </p>
          <button
            onClick={onChangeAddress}
            className="font-assistant px-5 py-2.5 md:px-4 md:py-2 bg-[#0e540b] text-white rounded-lg hover:bg-green-800 transition text-sm md:text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus size={16} className="md:w-3.5 md:h-3.5" />
            Add Delivery Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 md:p-2.5 rounded-lg border-2 border-[#0e540b] bg-green-50">
            <div className="flex items-center justify-between mb-2 md:mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-poppins font-semibold text-gray-800 text-sm md:text-xs capitalize">
                  {defaultAddress.type || 'Home'}
                </span>
                {defaultAddress.isDefault && (
                  <span className="px-2 py-0.5 bg-[#0e540b] text-white text-[10px] rounded-full">
                    Default
                  </span>
                )}
              </div>
              <CheckCircle size={18} className="text-[#0e540b] md:w-4 md:h-4" />
            </div>
            {user?.username && (
              <p className="font-assistant text-sm md:text-xs text-gray-800 font-semibold mb-1">
                {user.username}
              </p>
            )}
            {user?.phone && (
              <p className="font-assistant text-xs md:text-[11px] text-gray-700 mb-1.5">
                {user.phone}
              </p>
            )}
            <p className="font-assistant text-xs md:text-[11px] text-gray-700 leading-relaxed">
              {defaultAddress.street}
            </p>
            {defaultAddress.area && (
              <p className="font-assistant text-xs md:text-[11px] text-gray-600">
                {defaultAddress.area}
              </p>
            )}
            <p className="font-assistant text-xs md:text-[11px] text-gray-600">
              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
            </p>
          </div>

          <button
            onClick={onChangeAddress}
            className="font-assistant w-full px-4 py-2 md:px-3 md:py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm md:text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <Edit size={14} className="md:w-3.5 md:h-3.5" />
            Change Address
          </button>
        </div>
      )}
    </div>
  ),
);

AddressSection.displayName = "AddressSection";

export default AddressSection;
