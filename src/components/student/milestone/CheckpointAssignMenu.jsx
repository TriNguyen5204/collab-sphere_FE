import React from 'react';
import { Users, User } from 'lucide-react';
import { useAvatar } from '../../../hooks/useAvatar';

const CheckpointAssignMenu = React.forwardRef((
  {
    isOpen,
    canAssign,
    onToggleMenu,
    onConfirm,
    teamMembers,
    selectedMemberIds,
    onToggleMember,
  },
  ref
) => {
  const disabled = !canAssign || teamMembers.length === 0;

  const MemberAvatar = ({ name, src, className, alt }) => {
    const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(name, src);
    if (shouldShowImage) {
      return (
        <img src={src} alt={alt} className={className} onError={() => setImageError(true)} />
      );
    }
    return (
      <div className={`${className} flex items-center justify-center ${colorClass}`} aria-hidden>
        <span className="select-none">{initials}</span>
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggleMenu}
        disabled={disabled}
        title={canAssign ? 'Assign members to this checkpoint' : 'Assignments locked'}
        className={`p-2 rounded-lg transition ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
      >
        <Users size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-semibold text-gray-900">Assign Members</h4>
            <p className="mt-1 text-xs text-gray-500">Toggle members to assign.</p>
          </div>

          <div className="max-h-60 overflow-y-auto ">
            {teamMembers.length === 0 ? (
              <p className="px-2 py-3 text-sm text-gray-500">No team members available.</p>
            ) : (
              teamMembers.map((member) => {
                const isSelected = selectedMemberIds.includes(member.classMemberId);
                const borderClass = isSelected ? 'border-orangeFpt-500 bg-orangeFpt-50' : 'border-gray-200 bg-white';
                const nameClass = isSelected ? 'text-orangeFpt-500' : 'text-gray-900';
                const roleLabel = member.role ? member.role.toString().replace(/_/g, ' ') : 'Member';

                return (
                  <button
                    type="button"
                    key={member.classMemberId}
                    onClick={() => onToggleMember(member.classMemberId)}
                    className="w-full text-left"
                  >
                    <div className={`flex items-center gap-3 border ${borderClass} px-3 py-2 transition hover:border-orangeFpt-500`}>
                      <MemberAvatar
                        name={member.name}
                        src={member.avatar}
                        alt={member.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${nameClass}`}>{member.name}</p>
                        <p className="text-xs uppercase text-gray-500">{roleLabel}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-xs text-gray-500">{selectedMemberIds.length} selected</span>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-orangeFpt-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-orangeFpt-600"
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

CheckpointAssignMenu.displayName = 'CheckpointAssignMenu';

export default CheckpointAssignMenu;
