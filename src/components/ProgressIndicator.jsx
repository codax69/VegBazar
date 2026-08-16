// src/components/ProgressIndicator.jsx — Rebuilt ProgressIndicator with v2 hairline border, Inter font, and brand green steps
import React from "react";
import { ShoppingCart, User, Package, CheckCircle, File } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const ProgressIndicator = () => {
  const { currentRoute } = useOrderContext();

  const steps = [
    { path: "/offers", icon: Package, label: "Basket" },
    { path: "/select-vegetables", icon: ShoppingCart, label: "Items" },
    { path: "/address", icon: User, label: "Info" },
    { path: "/billing", icon: File, label: "Pay" },
    { path: "/confirmation", icon: CheckCircle, label: "Done" },
  ];

  const currentStep = steps.findIndex((s) => s.path === currentRoute) + 1;

  // Only render progress indicator on checkout flow pages
  if (currentStep === 0) return null;

  return (
    <div className="fixed top-14 md:top-16 left-0 w-full bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] z-30 py-2 transition-colors duration-150">
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;
              const StepIcon = step.icon;

              return (
                <div key={step.path} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-colors ${
                      isActive
                        ? "bg-[var(--color-brand-green)] text-white"
                        : "bg-[var(--color-bg-app)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                    } ${isCurrent ? "ring-[var(--color-brand-green)] ring-offset-2 ring-offset-[var(--color-bg-surface)]" : ""}`}
                  >
                    <StepIcon size={12} />
                  </div>

                  <div className="ml-1.5 hidden sm:block">
                    <p
                      className={`text-[12px] font-body ${
                        isActive
                          ? "text-[var(--color-brand-green)] font-medium"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-[1px] mx-1 sm:mx-2 transition-colors ${
                        currentStep > stepNumber
                          ? "bg-[var(--color-brand-green)]"
                          : "bg-[var(--color-border)]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
