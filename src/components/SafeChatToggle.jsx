// src/components/SafeChatToggle.jsx
import { useState, useEffect } from "react";
import { FiShield, FiShieldOff } from "react-icons/fi";

const SafeChatToggle = ({ onToggle, initialValue = false }) => {
  const [isSafeMode, setIsSafeMode] = useState(initialValue);

  useEffect(() => {
    onToggle(isSafeMode);
  }, [isSafeMode, onToggle]);

  const toggleSafeMode = () => {
    setIsSafeMode(!isSafeMode);
  };

  return (
    <button
      onClick={toggleSafeMode}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        isSafeMode
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
      }`}
      title={isSafeMode ? "Safe mode ON - Profanity filtered" : "Safe mode OFF - Raw messages"}
    >
      {isSafeMode ? <FiShield size={18} /> : <FiShieldOff size={18} />}
      <span className="text-sm font-medium">{isSafeMode ? "Safe Mode" : "Unsafe Mode"}</span>
    </button>
  );
};

export default SafeChatToggle;