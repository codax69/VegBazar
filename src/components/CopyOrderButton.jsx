import React,{ useState } from "react";
import {FaCopy} from "react-icons/fa6"
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
      className="text-gray-600 hover:text-green-600 transition flex items-center gap-1"
    >
      <FaCopy className="w-3 h-3" />
      <span className="text-xs sm:text-sm">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

export default CopyOrderButton;
