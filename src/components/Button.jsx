// src/components/Button.jsx — v2 Shared Button component with 4 variants & 5 interactive states
import React from "react";

const Button = ({
  variant = "primary",
  disabled = false,
  children,
  className = "",
  type = "button",
  onClick,
  ...props
}) => {
  // Base classes according to v2 design tokens
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] font-medium font-body transition-all duration-100 ease-out focus-visible:outline-2 focus-visible:outline-[var(--color-brand-green)] focus-visible:outline-offset-2 select-none";

  // Variant classes
  let variantClasses = "";
  if (disabled || variant === "disabled") {
    variantClasses =
      "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed border-0 opacity-100 pointer-events-none";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-transparent border border-[var(--color-brand-green)] text-[var(--color-brand-green)] hover:border-[var(--color-brand-green-hover)] hover:text-[var(--color-brand-green-hover)] active:scale-[0.98]";
  } else if (variant === "ghost") {
    variantClasses =
      "bg-transparent border-0 text-[var(--color-text-secondary)] hover:bg-[var(--color-tint-green)] hover:text-[var(--color-text-primary)] active:scale-[0.98]";
  } else {
    // default: primary
    variantClasses =
      "bg-[var(--color-brand-green)] border-0 text-white hover:bg-[var(--color-brand-green-hover)] active:scale-[0.98]";
  }

  return (
    <button
      type={type}
      disabled={disabled || variant === "disabled"}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
