import React from "react";

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  description,
  handleClick,
  children,
  buttonText = "Schedule meeting",
  buttonIcon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal content */}
      <div className="bg-slate-700 text-white w-full max-w-[520px] rounded-2xl shadow-xl p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl font-bold"
        >
          ×
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">{title}</h1>

        {/* Optional description */}
        {description && (
          <p className="text-gray-300 mb-4 text-sm">{description}</p>
        )}

        {/* Content */}
        <div className="flex flex-col gap-4 mb-6">{children}</div>

        {/* Action button */}
        <button
          onClick={handleClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {buttonIcon && <span>{buttonIcon}</span>}
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default MeetingModal;
