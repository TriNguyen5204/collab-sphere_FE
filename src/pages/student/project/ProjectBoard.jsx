import React, { useState, useRef, useEffect } from 'react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TrelloBoard from '../../../features/student/components/board/TrelloBoard';
import { getWorkspace } from '../../../services/kanbanApi';
import { getTeamDetail } from '../../../services/teamApi';
import { SignalRProvider } from '../../../context/kanban/SignalRContext';
import { useSelector } from 'react-redux';
import SignalRErrorBoundary from '../../errors/ErrorBoundary';
import useTeam from '../../../context/useTeam';

const ProjectBoard = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const { team } = useTeam();
  const teamId = team?.teamId ?? null;
  const hubUrl = 'https://collabsphere.azurewebsites.net/KanbanServiceHub';
  const accessToken = useSelector(state => state.user.accessToken);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState();

  // Archived state remains unchanged (still managed by TrelloBoard)
  const [archivedItems, setArchivedItems] = useState({ cards: [], lists: [] });

  const boardRef = useRef(null);
  const handleUpdateArchived = items => setArchivedItems(items);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;
      try {
        const teamData = await getTeamDetail(teamId);
        if (teamData && teamData.memberInfo) {
          const formattedMembers = teamData.memberInfo.members.map(member => ({
            studentId: member.studentId,
            studentName: member.studentName,
            avatarImg: member.avatar, // ✅ avatar → avatarImg
          }));
          setMembers(formattedMembers);
          console.log('✅ Members loaded:', formattedMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchMembers();
  }, [teamId]);

  // Fetch workspace
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!teamId) return;
      try {
        const data = await getWorkspace(teamId);
        if (data) {
          const detail = data.teamWorkspaceDetail;
          setWorkspace({
            id: detail.workspaceId,
            title: detail.title,
            lists: detail.listDtos.map(list => ({
              id: list.listId,
              title: list.title,
              position: list.position,
              cards: list.cardDtos.map(card => ({
                id: card.cardId,
                title: card.title,
                description: card.description,
                riskLevel: card.riskLevel,
                dueAt: card.dueAt,
                createdAt: card.createdAt,
                position: card.position,
                isComplete: card.isComplete,
                assignedMembers: card.cardAssignmentDtos.map(member => ({
                  studentId: member.studentId,
                  studentName: member.studentName,
                  avatarImg: member.avatarImg,
                })),
                tasks: card.taskDtos.map(task => ({
                  taskId: task.taskId,
                  taskTitle: task.taskTitle,
                  isDone: task.isDone,
                  subTaskDtos: task.subTaskDtos.map(subtask => ({
                    subTaskId: subtask.subTaskId,
                    subTaskTitle: subtask.subTaskTitle,
                    order: subtask.order,
                    isDone: subtask.isDone,
                  })),
                })),
              })),
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching workspace data:', error);
      }
    };

    fetchWorkspace();
  }, [teamId]);

  // Restore functions
  const handleRestoreArchived = (type, id, listId) => {
    if (!boardRef.current) return;
    if (type === 'card') {
      const isListArchived = archivedItems.lists.some(l => l.id === listId);
      if (isListArchived) {
        boardRef.current.restoreList(listId);
      }
      boardRef.current.restoreCard(id, listId);
    } else if (type === 'list') {
      boardRef.current.restoreList(id);
    }
  };

  // Delete archived
  const handleDeleteArchived = (type, id) => {
    if (!boardRef.current) return;
    if (type === 'card') {
      boardRef.current.permanentlyDeleteCard(id);
    } else if (type === 'list') {
      boardRef.current.permanentlyDeleteList(id);
    }
  };

  return (
    <div
      className='min-h-screen min-w-full relative overflow-hidden'
      style={{ backgroundColor: "#D5DADF" }}
    >
      {/* Background with blobs */}
      <div className="absolute inset-0 bg-gray-50 -z-20"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orangeFpt-50/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-3xl"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-orangeFpt-100/30 blur-3xl"></div>
      </div>

      {workspace && (
        <ProjectBoardHeader
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          archivedItems={archivedItems}
          onRestoreArchived={handleRestoreArchived}
          onDeleteArchived={handleDeleteArchived}
          workspaceName={workspace.title}
        />
      )}

      <div className='p-6 overflow-auto h-[calc(100vh-64px)]'>
        {workspace && (
          <SignalRErrorBoundary>
            <SignalRProvider
              hubUrl={hubUrl}
              token={accessToken}
              workspaceId={workspace.id}
            >
              {/* <NormalizePositionsButton
                lists={workspace.lists}
                workspaceId={workspace.id}
              /> */}
              <TrelloBoard
                ref={boardRef}
                workspaceData={workspace}
                selectedRole={selectedRole}
                members={members}
                onUpdateArchived={handleUpdateArchived}
              />
            </SignalRProvider>
          </SignalRErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default ProjectBoard;
