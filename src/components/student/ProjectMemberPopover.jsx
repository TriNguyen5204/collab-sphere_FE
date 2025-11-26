import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

const ProjectMemberPopover = ({ member, anchorEl, onClose, onViewProfile }) => {
    const userId = useSelector((state) => state.user.userId);
    if (!member) return null;

    const memberIdentifier = member.id ?? null;
    const isCurrentUser =
        memberIdentifier !== null && userId !== undefined && String(memberIdentifier) === String(userId);
    const popoverRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isPositioned, setIsPositioned] = useState(false);

    const updatePosition = useCallback(() => {
        const anchor = anchorEl;
        const popover = popoverRef.current;
        if (!anchor || !popover) return;

        const anchorRect = anchor.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const gutter = 12;

        let top = anchorRect.bottom + gutter;
        let left = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;

        if (top + popoverRect.height > window.innerHeight) {
            top = Math.max(gutter, anchorRect.top - gutter - popoverRect.height);
        }

        const maxLeft = Math.max(gutter, window.innerWidth - popoverRect.width - gutter);
        left = Math.min(Math.max(left, gutter), maxLeft);

        setPosition({ top, left });
        setIsPositioned(true);
    }, [anchorEl]);

    useLayoutEffect(() => {
        setIsPositioned(false);
        if (!anchorEl) return;
        const raf = window.requestAnimationFrame(() => updatePosition());
        return () => window.cancelAnimationFrame(raf);
    }, [anchorEl, member, updatePosition]);

    useEffect(() => {
        if (!anchorEl) return undefined;
        const handleReposition = () => updatePosition();
        window.addEventListener("resize", handleReposition);
        window.addEventListener("scroll", handleReposition, true);
        return () => {
            window.removeEventListener("resize", handleReposition);
            window.removeEventListener("scroll", handleReposition, true);
        };
    }, [anchorEl, updatePosition]);

    useEffect(() => {
        const popover = popoverRef.current;
        if (!popover) return undefined;

        const handlePointerDown = (event) => {
            if (popover.contains(event.target)) return;
            if (anchorEl && anchorEl.contains(event.target)) return;
            onClose?.();
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [anchorEl, onClose]);

    return (
        <div
            ref={popoverRef}
            className="fixed z-50 w-[22rem] rounded-xl border border-gray-200 bg-white shadow-2xl"
            style={{ top: position.top, left: position.left, visibility: isPositioned ? 'visible' : 'hidden' }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 text-white hover:bg-red-300 hover:text-red-700 rounded-full z-10"
            >
                <X size={20} />
            </button>

            {/* Top Blue Section */}
            <div className="relative bg-orangeFpt-500 h-24 pt-12 pl-28 pr-4 rounded-t-xl">
                <h3 className="font-bold text-white truncate">{member.name}</h3>
                <p className="text-sm text-blue-200">{member.role}</p>
            </div>

            {/* Avatar */}
            <div className="absolute top-8 left-4">
                <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full border border-white object-cover bg-white"
                />
            </div>

            {/* Bottom Gray Section */}
            <div className="bg-white pt-8 p-4 text-gray-900 rounded-b-xl border-t border-gray-100">
                <div className="space-y-1">
                    {isCurrentUser ? (
                        <>
                            <button
                                type="button"
                                onClick={() => onViewProfile?.(member)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                            >
                                Edit profile info
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => onViewProfile?.(member)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                            >
                                View Profile
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectMemberPopover;
