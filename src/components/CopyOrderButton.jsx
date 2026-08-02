// src/components/CopyOrderButton.jsx — Rebuilt with v2 tokens & IBM Plex Mono text
import React, { useState } from "react";
import { FaCopy } from "react-icons/fa6";

const CopyOrderButton = ({ orderId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy Order ID For Tracking"
      className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors flex items-center gap-1 px-2 py-0.5 rounded-[6px] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-xs font-mono"
    >
      <FaCopy className="w-3 h-3" />
      <span>{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
};

export default CopyOrderButton;
