import React from 'react';

const TeamMemberCard = ({ member, isLeader = false, getStatusColor }) => {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition ${
      isLeader ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className={`rounded-full ${isLeader ? 'w-16 h-16' : 'w-14 h-14'}`}
        />
        {!isLeader && member.status && (
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className={`font-semibold ${isLeader ? 'text-lg' : ''}`}>{member.name}</h3>
        <p className="text-sm text-gray-600">{member.email}</p>
        <div className="flex gap-2 mt-2">
          {member.projectRoles.map((role, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {role}
            </span>
          ))}
        </div>
      </div>
      
      <div className="text-right">
        <div className={`font-bold text-green-600 ${isLeader ? 'text-2xl' : 'text-xl'}`}>
          {member.contribution}%
        </div>
        <p className="text-xs text-gray-600">Contribution</p>
        <div className={`text-gray-600 mt-2 ${isLeader ? 'text-sm' : 'text-xs'}`}>
          <div>{member.tasksCompleted} completed</div>
          <div>{member.tasksInProgress} in progress</div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;