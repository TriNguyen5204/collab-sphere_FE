import React, { useState } from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: '#6b7280' },
  { id: 'TODO', title: 'To Do', color: '#8b5cf6' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
  { id: 'REVIEW', title: 'Review', color: '#06b6d4' },
  { id: 'DONE', title: 'Done', color: '#22c55e' }
];

const ROLE_COLORS = {
  'UI/UX': '#ec4899',
  'Frontend Engineer': '#3b82f6',
  'Backend Engineer': '#10b981',
  'Database Engineer': '#0ea5e9',
  'Integration Specialist': '#a855f7',
  'QA Engineer': '#f97316'
};

const KanbanBoard = ({ kanbanTasks = [], setKanbanTasks, selectedRole = 'all' }) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getColumnTasks = (columnId) => {
    return kanbanTasks.filter(task => {
      const matchesStatus = task.status === columnId;
      const matchesRole = selectedRole === 'all' || task.role === selectedRole;
      return matchesStatus && matchesRole;
    });
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = (e) => {
    // Reset state - CSS will handle visual reset via isDragging class
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (!taskId) return;

    setKanbanTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    // Reset drag state immediately
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className={styles.board}>
      {/* <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Squares2X2Icon className={styles.icon} />
          <div>
            <h2 className={styles.title}>Project Kanban Board</h2>
            <p className={styles.subtitle}>Organize and track your team tasks</p>
          </div>
        </div>
      </div> */}

      <div className={styles.columns}>
        {COLUMNS.map(column => {
          const tasks = getColumnTasks(column.id);
          
          return (
            <div
              key={column.id}
              className={`${styles.column} ${
                dragOverColumn === column.id ? styles.columnDragOver : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={styles.columnHeader}>
                <div className={styles.indicator} style={{ backgroundColor: column.color }} />
                <h3 className={styles.columnTitle}>{column.title}</h3>
                <span className={styles.count}>{tasks.length}</span>
              </div>

              <div className={styles.taskList}>
                {tasks.length === 0 ? (
                  <div className={styles.emptyState}>No tasks</div>
                ) : (
                  tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedTaskId === task.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskCard = ({ task, onDragStart, onDragEnd, isDragging }) => {
  const roleColor = ROLE_COLORS[task.role] || '#6b7280';

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className={styles.cardHeader}>
        <span className={styles.taskId}>{task.id}</span>
        {task.priority && (
          <span className={`${styles.priority} ${styles[task.priority.toLowerCase()]}`}>{task.priority}</span>
        )}
      </div>

      <h4 className={styles.cardTitle}>{task.title}</h4>

      {task.description && <p className={styles.cardDescription}>{task.description}</p>}

      <div className={styles.cardFooter}>
        {task.role && (
          <span className={styles.roleBadge} style={{ backgroundColor: `${roleColor}15`, color: roleColor }}>{task.role}</span>
        )}

        {task.progress !== undefined && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
          </div>
        )}
      </div>

      {task.technologies && task.technologies.length > 0 && (
        <div className={styles.technologies}>
          {task.technologies.slice(0, 3).map((tech, idx) => <span key={idx} className={styles.tech}>{tech}</span>)}
          {task.technologies.length > 3 && <span className={styles.techMore}>+{task.technologies.length - 3}</span>}
        </div>
      )}

      {task.assignee && (
        <div className={styles.assignee}>
          <div className={styles.avatar}>{task.assignee.charAt(0).toUpperCase()}</div>
          <span>{task.assignee}</span>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
