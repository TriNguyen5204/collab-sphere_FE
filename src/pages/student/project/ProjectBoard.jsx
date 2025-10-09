import React, { useState, useRef } from 'react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TrelloBoard from '../../../components/student/board/TrelloBoard';

const ProjectBoard = () => {
  const [selectedRole, setSelectedRole] = useState('all');

  // Archived items state (receive from TrelloBoard)
  const [archivedItems, setArchivedItems] = useState({ cards: [], lists: [] });
  const boardRef = useRef(null);

  const handleUpdateArchived = (items) => setArchivedItems(items);

  const handleRestoreArchived = (type, id, listId) => {
    if (!boardRef.current) return;
    if (type === 'card') {
      // If the parent list is archived, restore it first
      const isListArchived = archivedItems.lists.some(l => l.id === listId);
      if (isListArchived) {
        boardRef.current.restoreList(listId);
      }
      boardRef.current.restoreCard(id, listId);
    } else if (type === 'list') {
      boardRef.current.restoreList(id);
    }
  };

  const handleDeleteArchived = (type, id) => {
    if (!boardRef.current) return;
    if (type === 'card') {
      boardRef.current.permanentlyDeleteCard(id);
    } else if (type === 'list') {
      boardRef.current.permanentlyDeleteList(id);
    }
  };

  return (
    <div className="min-h-screen min-w-full" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader 
        selectedRole={selectedRole} 
        onRoleChange={setSelectedRole}
        archivedItems={archivedItems}
        onRestoreArchived={handleRestoreArchived}
        onDeleteArchived={handleDeleteArchived}
      />
      
      <main className="p-6 min-w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
          <p className="text-gray-600 text-sm mt-1">Organize and track your tasks</p>
        </div>

        <div className="inline-block min-w-full">
          <TrelloBoard 
            ref={boardRef}
            selectedRole={selectedRole}
            onUpdateArchived={handleUpdateArchived}
          />
        </div>
      </main>
    </div>
  );
};

export default ProjectBoard;