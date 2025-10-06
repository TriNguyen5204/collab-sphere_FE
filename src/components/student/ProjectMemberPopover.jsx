import React, { useRef } from "react";
import { X } from "lucide-react";
import useClickOutside from "../../hooks/useClickOutside";

const ProjectMemberPopover = ({ member, anchorEl, onClose }) => {
    const isCurrentUser = member.id === 1; // replace with auth user check
    const popoverRef = useRef(null);

    useClickOutside(popoverRef, onClose);

    const getPopoverStyle = () => {
        if (!anchorEl) return { display: "none" };
        const rect = anchorEl.getBoundingClientRect();
        return {
            position: "fixed",
            top: `${rect.bottom + 8}px`, // 8px margin below the avatar
            left: `${rect.left + rect.width / 2}px`,
            transform: "translateX(-50%)", // Center the popover
        };
    };

    return (
        <div ref={popoverRef} style={getPopoverStyle()} className="shadow-lg rounded-lg w-64 border border-gray-700 z-50 overflow-hidden">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 text-blue-200 hover:bg-blue-500 hover:text-white rounded-full z-10"
            >
                <X size={20} />
            </button>

            {/* Top Blue Section */}
            <div className="relative bg-blue-600 h-24 pt-12 pl-28 pr-4">
                <h3 className="font-bold text-white truncate">{member.name}</h3>
                <p className="text-sm text-blue-200">{member.role}</p>
            </div>

            {/* Avatar */}
            <div className="absolute top-8 left-4">
                <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full border-2 border-white object-cover"
                />
            </div>

            {/* Bottom Gray Section */}
            <div className="bg-gray-800 pt-8 p-4 text-white">
                <div className="space-y-1">
                    {isCurrentUser ? (
                        <>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300">
                                Edit profile info
                            </button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300 border-t border-gray-700">
                                View member's activity
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300">
                                View Profile
                            </button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300 border-t border-gray-700">
                                View member's activity
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectMemberPopover;
