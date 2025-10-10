import React from "react";
import { ShoppingCart, User, Package, CheckCircle, File } from "lucide-react";
import { useOrderContext } from "../Context/OrderContext";

const ProgressIndicator = () => {
  const { currentRoute } = useOrderContext();
  const steps = [
    { path: "/", icon: User, label: "Customer Info" },
    { path: "/offers", icon: Package, label: "Select Offer" },
    {
      path: "/select-vegetables",
      icon: ShoppingCart,
      label: "Choose Vegetables",
    },{
      path: "/billing",
      icon: File,
      label: "Checkout",
    },
    { path: "/order-confirmation", icon: CheckCircle, label: "Order Complete" },
  ];
  const currentStep = steps.findIndex((s) => s.path === currentRoute) + 1;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center sm:mb-8 min-w-max h-16 px-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.path} className="flex items-center">
                <div
                  className={`relative w-9 sm:w-12 h-9 sm:h-12 rounded-full flex items-center justify-center transition duration-200 ${
                    isActive
                      ? "bg-[#0e540b] text-white"
                      : "bg-gray-300 text-gray-600"
                  } ${isCurrent ? "ring-4 ring-green-200 scale-100" : ""}`}
                >
                  <StepIcon size={16} />
                </div>
                <div className="ml-2 hidden sm:block khula">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-[#0e540b]" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-2 sm:mx-4 ${
                      currentStep > stepNumber ? "bg-[#0e540b]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;