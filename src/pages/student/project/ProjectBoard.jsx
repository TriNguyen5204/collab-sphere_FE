import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TrelloBoard from '../../../components/student/board/TrelloBoard';

const ProjectBoard = () => {
  const [selectedRole, setSelectedRole] = useState('all');

  // Archived items state
  const [archivedItems, setArchivedItems] = useState({ cards: [], lists: [] });
  const boardRef = useRef(null);

  const handleUpdateArchived = (items) => setArchivedItems(items);

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
        <div className="p-6 overflow-auto min-h-screen">
          <TrelloBoard 
            ref={boardRef}
            selectedRole={selectedRole}
            onUpdateArchived={handleUpdateArchived}
          />
        </div>
    </div>
  );
};

export default ProjectBoard;