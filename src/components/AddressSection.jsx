// src/components/AddressSection.jsx — Rebuilt with v2 1px hairline border, Inter typography, and brand green buttons
import React from "react";
import { MapPin, Plus, Edit, CheckCircle } from "lucide-react";

const AddressSection = React.memo(
  ({ defaultAddress, onChangeAddress, user, isLoading = false }) => (
    <div className="bg-[var(--color-bg-surface)] p-4 rounded-[12px] border border-[var(--color-border)] transition-colors duration-150">
      <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
        <MapPin size={18} className="text-[var(--color-brand-green)]" />
        Delivery Address
      </h3>
      {isLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-[var(--color-border)] border-t-[var(--color-brand-green)] mx-auto mb-2" />
          <p className="font-body text-[var(--color-text-muted)] text-xs">
            Loading address...
          </p>
        </div>
      ) : !defaultAddress ? (
        <div className="text-center py-6">
          <MapPin
            size={40}
            className="mx-auto text-[var(--color-text-muted)] mb-2"
          />
          <p className="font-body text-[var(--color-text-secondary)] mb-4 text-xs">
            No delivery address added yet
          </p>
          <button
            onClick={onChangeAddress}
            className="font-body px-4 py-2 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-[10px] transition text-xs font-medium inline-flex items-center gap-2"
          >
            <Plus size={15} />
            Add Delivery Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[10px] border-2 border-[var(--color-brand-green)] bg-[var(--color-tint-green)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-[var(--color-text-primary)] text-xs capitalize">
                  {defaultAddress.type || 'Home'}
                </span>
                {defaultAddress.isDefault && (
                  <span className="px-2 py-0.5 bg-[var(--color-brand-green)] text-white text-[10px] font-mono rounded-full">
                    Default
                  </span>
                )}
              </div>
              <CheckCircle size={18} className="text-[var(--color-brand-green)]" />
            </div>
            {user?.username && (
              <p className="font-body text-xs text-[var(--color-text-primary)] font-medium mb-1">
                {user.username}
              </p>
            )}
            {user?.phone && (
              <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mb-1">
                {user.phone}
              </p>
            )}
            <p className="font-body text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {defaultAddress.street}
            </p>
            {defaultAddress.area && (
              <p className="font-body text-xs text-[var(--color-text-muted)]">
                {defaultAddress.area}
              </p>
            )}
            <p className="font-body text-xs text-[var(--color-text-muted)]">
              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
            </p>
          </div>

          <button
            onClick={onChangeAddress}
            className="font-body w-full px-4 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] rounded-[10px] transition text-xs font-medium inline-flex items-center justify-center gap-2"
          >
            <Edit size={14} />
            Change Address
          </button>
        </div>
      )}
    </div>
  ),
);

AddressSection.displayName = "AddressSection";

export default AddressSection;
