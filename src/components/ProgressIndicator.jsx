import React from "react";
import { ShoppingCart, User, Package, CheckCircle, File } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const ProgressIndicator = () => {
  const { currentRoute } = useOrderContext();

  const steps = [
    { path: "/offers", icon: Package, label: "Basket" },
    { path: "/select-vegetables", icon: ShoppingCart, label: "Items" },
    { path: "/customer-info", icon: User, label: "Info" },
    { path: "/billing", icon: File, label: "Pay" },
    { path: "/order-confirmation", icon: CheckCircle, label: "Done" },
  ];

  const currentStep = steps.findIndex((s) => s.path === currentRoute) + 1;

  return (
    <div className="fixed md:top-16 top-10 left-0 w-full bg-white/95 backdrop-blur-sm shadow-sm shadow-[#0e540b]/20 z-30 py-2">
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center mt-2 mb-2 min-w-max h-4 px-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;
              const StepIcon = step.icon;

              return (
                <div key={step.path} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition duration-200 ${
                      isActive
                        ? "bg-[#0e540b] text-white"
                        : "bg-gray-300 text-gray-600"
                    } ${isCurrent ? "ring-2 ring-green-300 scale-105" : ""}`}
                  >
                    <StepIcon size={10} />
                  </div>

                  <div className="ml-1 hidden sm:block">
                    <p
                      className={`text-xs font-medium ${
                        isActive ? "text-[#0e540b]" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-[2px] mx-1 sm:mx-2 rounded-full transition ${
                        currentStep > stepNumber
                          ? "bg-[#0e540b]"
                          : "bg-gray-300"
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
