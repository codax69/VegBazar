// src/components/OrderLoading.jsx — Rebuilt OrderLoading with v2 hairline card, Inter typography, and brand green spinner
import React from "react";
import { Loader2 } from "lucide-react";

const OrderLoading = ({ loadingText = "Loading", loadingMsg = "Please wait..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-app)] transition-colors duration-150">
      <div className="max-w-md w-full bg-[var(--color-bg-surface)] p-8 rounded-[12px] border border-[var(--color-border)] text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 text-[var(--color-brand-green)] animate-spin" />
        </div>
        <h3 className="text-lg font-display font-semibold text-[var(--color-text-primary)] mb-2">
          {loadingText}
        </h3>
        <p className="text-xs font-body text-[var(--color-text-muted)]">
          {loadingMsg}
        </p>
      </div>
    </div>
  );
};

export default OrderLoading;