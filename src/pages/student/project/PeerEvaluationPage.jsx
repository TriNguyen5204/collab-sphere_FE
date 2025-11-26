import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import EvaluationTabs from '../../../components/student/evaluation/EvaluationTabs';
import PeerEvaluationForm from '../../../components/student/evaluation/PeerEvaluationForm';
import ReceivedEvaluations from '../../../components/student/evaluation/ReceivedEvaluations';
import LecturerTeamEvaluation from '../../../components/student/evaluation/LecturerTeamEvaluation';
import useTeam from '../../../context/useTeam';
import { useSelector } from 'react-redux';

const PeerEvaluationPage = () => {
  const { projectId, projectName, teamId } = useParams();
  const { team } = useTeam();
  const { userId } = useSelector((s) => s.user);
  const [activeTab, setActiveTab] = useState('evaluate');
  const [teamMembers] = useState(() => {
    const fromNew = team?.memberInfo?.members?.map((m) => ({
      studentId: m?.studentId,
      name: m?.studentName,
      // teamRole: 1 => Leader, 0 => Member
      role: Number(m?.teamRole) === 1 ? 'Leader' : 'Member',
      avatar: m?.avatar || null,
      isCurrentUser: String(m?.studentId) === String(userId),
    }));
    const fromCtx = fromNew && fromNew.length
      ? fromNew
      : team?.memberInfo?.members?.map((m) => ({
          studentId: m?.userId || m?.id,
          name: m?.fullName || m?.name,
          role: m?.roleName || (Number(m?.teamRole) === 1 ? 'Leader' : 'Member') || m?.role,
          avatar: m?.avatar || null,
          isCurrentUser: String(m?.userId || m?.id) === String(userId),
        }));
    if (fromCtx && fromCtx.length) return fromCtx;
    return [
      { studentId: 1, name: 'Alice Johnson', role: 'Team Leader', avatar: 'AJ', isCurrentUser: true },
      { studentId: 2, name: 'Bob Smith', role: 'Frontend Developer', avatar: 'BS', isCurrentUser: false },
      { studentId: 3, name: 'Charlie Brown', role: 'Backend Developer', avatar: 'CB', isCurrentUser: false },
      { studentId: 4, name: 'Diana Prince', role: 'UI/UX Designer', avatar: 'DP', isCurrentUser: false },
    ];
  });

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