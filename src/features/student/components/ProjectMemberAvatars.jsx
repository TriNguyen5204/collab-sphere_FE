import React, { useRef, useCallback, useState } from "react";
import useTeam from "../../../context/useTeam";
import { useAvatar } from '../../../hooks/useAvatar';
import ProjectMemberPopover from "./ProjectMemberPopover";
import { useNavigate } from "react-router-dom";

const ProjectMemberAvatars = ({ onSelect }) => {
  const { team } = useTeam();
  const rawMembers = team?.memberInfo?.members ?? [];
  const maxVisible = 5;
  const visibleMembers = rawMembers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, rawMembers.length - maxVisible);
  const buttonRefs = useRef(new Map());
  const [activeMember, setActiveMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const navigate = useNavigate();

  const registerButtonRef = useCallback((memberId) => (node) => {
    if (!buttonRefs.current) return;
    if (node) {
      buttonRefs.current.set(memberId, node);
    } else {
      buttonRefs.current.delete(memberId);
    }
  }, []);

  const closePopover = useCallback(() => {
    setActiveMember(null);
    setPopoverAnchor(null);
  }, []);

  const handleMemberClick = useCallback(
    (member, memberId) => {
      const anchor = buttonRefs.current?.get(memberId) ?? null;
      if (!anchor) return;
      if (activeMember?.id === member.id) {
        closePopover();
        return;
      }
      setActiveMember(member);
      setPopoverAnchor(anchor);
      if (typeof onSelect === "function") {
        onSelect(member, anchor);
      }
    },
    [activeMember?.id, closePopover, onSelect]
  );

  const handleViewProfile = useCallback(
    (member) => {
      if (!member?.id) return;
      closePopover();
      navigate(`/${member.id}/profile`);
    },
    [closePopover, navigate]
  );

  const MemberAvatar = ({ name, src, alt, className }) => {
    const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(name, src);
    if (shouldShowImage) {
      return (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={className}
        />
      );
    }

    return (
      <div className={`${className} flex items-center justify-center ${colorClass}`} aria-hidden>
        <span className="select-none">{initials}</span>
      </div>
    );
  };

  return (
    <div className="flex -space-x-2 relative">
      {visibleMembers.map((m) => {
        const normalizedId = m.userId ?? m.studentId ?? m.lecturerId ?? m.id;
        const displayMember = {
          id: normalizedId,
          name: m.studentName || m.fullname || m.fullName || m.name || "Member",
          role: m.teamRole === 1 ? "Leader" : "Member",
          avatar: m.avatar || m.avatarUrl,
        };
        return (
          <button
            key={normalizedId || m.studentId}
            type="button"
            ref={registerButtonRef(normalizedId)}
            onClick={() => handleMemberClick(displayMember, normalizedId)}
            className="relative group"
            title={displayMember.name}
          >
            <MemberAvatar
              name={displayMember.name}
              src={displayMember.avatar}
              alt={displayMember.name}
              className="w-8 h-8 rounded-full bg-white object-cover border group-hover:brightness-75 hover:ring-1 hover:ring-gray-800 transition"
            />
          </button>
        );
      })}
      {hiddenCount > 0 && (
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium hover:bg-gray-400 transition">
          +{hiddenCount}
        </button>
      )}
      {activeMember && popoverAnchor && (
        <ProjectMemberPopover
          member={activeMember}
          anchorEl={popoverAnchor}
          onClose={closePopover}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  );
};

export default ProjectMemberAvatars;
