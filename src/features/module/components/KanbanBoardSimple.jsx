import React, { useState } from 'react';
import styles from './KanbanBoard.module.css';

const KanbanBoardSimple = ({ kanbanTasks = [], setKanbanTasks }) => {
  // Minimal drag state - only what's essential
  const [draggedTask, setDraggedTask] = useState(null);

  // Simple columns definition
  const columns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  
  // Team swimlanes
  const teams = {
    frontend: { name: 'Frontend', color: '#3b82f6' },
    backend: { name: 'Backend', color: '#10b981' },
    integration: { name: 'Integration', color: '#8b5cf6' }
  };

  // === DRAG HANDLERS (MINIMAL) ===
  
  const handleDragStart = (e, task) => {
    console.log('🚀 Drag started:', task.id);
    setDraggedTask(task);
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    
    // Simple visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Essential for drop to work
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus, newTeam = null) => {
    e.preventDefault();
    
    if (!draggedTask) {
      console.log('❌ No dragged task');
      return;
    }

    console.log('✅ Drop successful:', {
      task: draggedTask.id,
      from: `${draggedTask.team}/${draggedTask.status}`,
      to: `${newTeam || draggedTask.team}/${newStatus}`
    });

    // Update task
    setKanbanTasks(prev => 
      prev.map(task => 
        task.id === draggedTask.id 
          ? { 
              ...task, 
              status: newStatus,
              ...(newTeam && { team: newTeam })
            }
          : task
      )
    );

    // Reset drag state
    setDraggedTask(null);
  };

  const handleDragEnd = (e) => {
    console.log('🏁 Drag ended');
    // Reset visual feedback
    e.target.style.opacity = '';
    // Reset state
    setDraggedTask(null);
  };

  // === UTILITY FUNCTIONS ===
  
  const getTasksByTeamAndStatus = (team, status) => {
    return kanbanTasks.filter(task => 
      task.team === team && task.status === status
    );
  };

  // === RENDER ===
  
  const renderTask = (task) => (
    <div
      key={task.id}
      className={styles.taskCardSimple}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.taskTitle}>{task.title}</div>
      <div className={styles.taskMeta}>
        <span className={styles.taskId}>{task.id}</span>
        <span className={styles.taskPriority}>{task.priority}</span>
      </div>
    </div>
  );

  const renderColumn = (team, status) => (
    <div
      key={`${team.key}-${status}`}
      className={styles.columnSimple}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status, team.key)}
    >
      <div className={styles.columnHeader}>
        <h4>{status.replace('_', ' ')}</h4>
        <span className={styles.taskCount}>
          {getTasksByTeamAndStatus(team.key, status).length}
        </span>
      </div>
      
      <div className={styles.taskList}>
        {getTasksByTeamAndStatus(team.key, status).map(renderTask)}
      </div>
    </div>
  );

  return (
    <div className={styles.kanbanBoardSimple}>
      <div className={styles.debugInfo}>
        {draggedTask && (
          <div className={styles.debugPanel}>
            Dragging: {draggedTask.id} ({draggedTask.title})
          </div>
        )}
      </div>

      {Object.entries(teams).map(([teamKey, teamData]) => (
        <div key={teamKey} className={styles.swimlane}>
          <div 
            className={styles.swimlaneHeader}
            style={{ borderLeftColor: teamData.color }}
          >
            <h3>{teamData.name}</h3>
          </div>
          
          <div className={styles.swimlaneColumns}>
            {columns.map(status => renderColumn({ key: teamKey, ...teamData }, status))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoardSimple;