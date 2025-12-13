import React from 'react';
import { useAvatar } from '../../../../hooks/useAvatar';

const MemberAvatar = ({ member, size = "w-10 h-10", className = "" }) => {
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(
    member.studentName || member.name,
    member.avatarImg || member.avatar
  );

  return (
    <div
      className={`${size} ${className} flex items-center justify-center rounded-full overflow-hidden border ${
        shouldShowImage ? 'border-gray-200 bg-white' : colorClass
      } shadow-sm transition-transform hover:scale-105`}
      title={member.studentName || member.name}
    >
      {shouldShowImage ? (
        <img
          src={member.avatarImg || member.avatar}
          alt={member.studentName || member.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-bold text-xs">{initials}</span>
      )}
    </div>
  );
};

export default MemberAvatar;
