import React, { useMemo, useState } from 'react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import EvaluationTabs from '../../../features/student/components/evaluation/EvaluationTabs';
import PeerEvaluationForm from '../../../features/student/components/evaluation/PeerEvaluationForm';
import ReceivedEvaluations from '../../../features/student/components/evaluation/ReceivedEvaluations';
import LecturerTeamEvaluation from '../../../features/student/components/evaluation/LecturerTeamEvaluation';
import useTeam from '../../../context/useTeam';
import { useSelector } from 'react-redux';

const PeerEvaluationPage = () => {
  const { team, teamId, isLoading } = useTeam();
  const { userId } = useSelector((s) => s.user);
  const [activeTab, setActiveTab] = useState('evaluate');
  const teamMembers = useMemo(() => {
    const members = team?.memberInfo?.members;
    if (Array.isArray(members) && members.length) {
      return members.map((m) => ({
        studentId: m?.studentId ?? m?.userId ?? m?.id,
        name: m?.studentName ?? m?.fullName ?? m?.name,
        role:
          m?.roleName ??
          (Number(m?.teamRole) === 1 ? 'Leader' : 'Member') ??
          m?.role ??
          'Member',
        avatar: m?.avatar ?? null,
        isCurrentUser: String(m?.studentId ?? m?.userId ?? m?.id) === String(userId),
      }));
    }
    return [
      { studentId: 1, name: 'Alice Johnson', role: 'Team Leader', avatar: 'AJ', isCurrentUser: true },
      { studentId: 2, name: 'Bob Smith', role: 'Frontend Developer', avatar: 'BS', isCurrentUser: false },
      { studentId: 3, name: 'Charlie Brown', role: 'Backend Developer', avatar: 'CB', isCurrentUser: false },
      { studentId: 4, name: 'Diana Prince', role: 'UI/UX Designer', avatar: 'DP', isCurrentUser: false },
    ];
  }, [team, userId]);

  if (isLoading && !team) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#D5DADF' }}>
        <p className="text-slate-600 text-sm">Loading team information...</p>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#D5DADF' }}>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-base font-semibold text-slate-800">Select a team to continue</p>
          <p className="text-sm text-slate-500 mt-2">Go back to your projects and open a workspace before evaluating peers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6">
        <EvaluationTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'evaluate' && (
            <PeerEvaluationForm
              teamMembers={teamMembers}
              teamId={teamId}
            />
          )}

          {activeTab === 'received' && (
            <ReceivedEvaluations teamId={teamId} />
          )}
          {activeTab === 'lecturer' && (
            <LecturerTeamEvaluation teamId={teamId} />
          )}
        </div>
      </main>
    </div>
  );
};

export default PeerEvaluationPage;
