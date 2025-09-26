import React, { useState, useEffect, useRef } from 'react';
import {
    Squares2X2Icon,
    UserGroupIcon,
    ClockIcon,
    LinkIcon,
    StarIcon,
    ChatBubbleLeftRightIcon,
    BoltIcon,
    EyeIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import styles from './KanbanBoard.module.css';

const KanbanBoard = ({
    kanbanTasks = [],
    setKanbanTasks,
    kanbanColumns,
    draggedCard,
    setDraggedCard
}) => {
    // Safety check for required props
    if (!setKanbanTasks || !setDraggedCard) {
        console.error('KanbanBoard: Missing required props setKanbanTasks or setDraggedCard');
        return <div>Error: Missing required props</div>;
    }

    // Enhanced state management for educational collaboration
    const [viewMode, setViewMode] = useState('swimlanes'); // swimlanes, timeline, personal
    const [selectedTeam, setSelectedTeam] = useState('all'); // all, frontend, backend, integration
    const [showDependencies, setShowDependencies] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        priority: 'all',
        technology: 'all',
        assignee: 'all',
        dueDate: 'all'
    });

    // Customizable swimlanes and columns
    const [customSwimlanes, setCustomSwimlanes] = useState({
        frontend: {
            name: 'Frontend Development',
            icon: '🎨',
            color: '#3b82f6',
            columns: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
        },
        backend: {
            name: 'Backend Development',
            icon: '⚙️',
            color: '#10b981',
            columns: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
        },
        integration: {
            name: 'Integration & Testing',
            icon: '🔗',
            color: '#8b5cf6',
            columns: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
        }
    });

    const [editingHeaders, setEditingHeaders] = useState({});

    // Minimal drag state
    const [isDragging, setIsDragging] = useState(false);
    
    // Use ref to store current drag task (synchronous access)
    const currentDragTask = useRef(null);

    // ✅ Improved reset function
    const resetDragState = () => {
        console.log('🔄 Resetting drag state');
        
        // Clear ref first (synchronous)
        currentDragTask.current = null;
        
        // Then clear state (this will automatically remove CSS classes via component re-render)
        setDraggedCard(null);
        setIsDragging(false);
        
        // ✅ Clean up any lingering inline styles that might interfere
        const allCards = document.querySelectorAll(`.${styles.enhancedTaskCard}`);
        allCards.forEach(card => {
            card.style.opacity = '';
            card.style.transform = '';
        });
    };

    // Debug effect to monitor task data (throttled)
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('KanbanBoard: Tasks updated, count:', kanbanTasks.length);
            console.log('KanbanBoard: Current teams:', kanbanTasks.map(t => t.team).filter((v, i, a) => a.indexOf(v) === i));
        }, 100);
        return () => clearTimeout(timer);
    }, [kanbanTasks]);

    // Cleanup mechanism for stuck drag states
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && (isDragging || draggedCard)) {
                console.log('Escape pressed - cancelling drag');
                resetDragState();
            }
        };

        // Also cleanup on mouse up if drag state is stuck
        const handleMouseUp = (e) => {
            // Only cleanup if we have a drag state but no active drag operation
            if ((isDragging || draggedCard) && !e.buttons) {
                console.log('Mouse up detected with stuck drag state - cleaning up');
                resetDragState();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, draggedCard]);


    const handleDragStart = (e, task) => {
        console.log('🚀 Drag started:', task.id, task.title);

        // Store in ref immediately (synchronous)
        currentDragTask.current = task;

        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.setData('application/json', JSON.stringify(task));

        // ✅ Set state immediately and synchronously
        setDraggedCard(task);
        setIsDragging(true);

        // ✅ Let CSS handle visual feedback - don't override with inline styles
        // The dragging class will be applied via the draggedCard state in the component
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // ESSENTIAL - without this, drop won't work
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeave = (e) => {
        // Only handle drag leave if we're actually leaving the drop zone
        // This prevents false triggers when moving between child elements
        if (!e.currentTarget.contains(e.relatedTarget)) {
            // Could add visual feedback cleanup here if needed
        }
    };

    const handleDrop = (e, newStatus, newTeam = null) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🎯 Drop event triggered:', { newStatus, newTeam });

        // ✅ Try multiple sources to get the task data
        let taskToMove = null;

        // First: Check ref (most reliable during drag)
        if (currentDragTask.current) {
            taskToMove = currentDragTask.current;
            console.log('📍 Got task from ref:', taskToMove.id);
        }
        // Second: Check state
        else if (draggedCard) {
            taskToMove = draggedCard;
            console.log('📍 Got task from state:', taskToMove.id);
        }
        // Third: Get from dataTransfer
        else {
            try {
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData) {
                    taskToMove = JSON.parse(jsonData);
                    console.log('📍 Got task from JSON dataTransfer:', taskToMove.id);
                } else {
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                        taskToMove = kanbanTasks.find(task => task.id === taskId);
                        console.log('📍 Got task from text dataTransfer:', taskToMove?.id);
                    }
                }
            } catch (error) {
                console.log('❌ Could not get drag data:', error);
            }
        }

        console.log('✅ Drop processing:', {
            taskId: taskToMove?.id,
            from: taskToMove ? `${taskToMove.team}/${taskToMove.status}` : 'unknown',
            to: `${newTeam || taskToMove?.team}/${newStatus}`,
            hasTask: !!taskToMove
        });

        if (!taskToMove) {
            console.log('❌ No task to move - aborting');
            resetDragState();
            return;
        }

        // Check if position actually changed
        const finalTeam = newTeam || taskToMove.team;
        const isDifferentPosition = taskToMove.status !== newStatus || taskToMove.team !== finalTeam;

        if (isDifferentPosition) {
            console.log('🎯 Moving task:', taskToMove.id);
            
            // ✅ Update task position immediately
            setKanbanTasks(prev =>
                prev.map(task =>
                    task.id === taskToMove.id
                        ? {
                            ...task,
                            status: newStatus,
                            team: finalTeam,
                            lastModified: new Date().toISOString()
                        }
                        : task
                )
            );
        } else {
            console.log('🔄 Same position - no change needed');
        }

        // ✅ Always reset drag state after drop
        resetDragState();
    };

    const handleDragEnd = (e) => {
        console.log('🏁 Drag ended');
        
        // ✅ Clean up any inline styles that might have been applied
        if (e.target) {
            e.target.style.opacity = '';
            e.target.style.transform = '';
        }

        // ✅ Reset drag state - CSS classes will be removed automatically via state
        currentDragTask.current = null;
        setDraggedCard(null);
        setIsDragging(false);
    };

    // Validation function for drop targets
    const validateDropTarget = (task, newStatus, newTeam) => {
        if (!task) {
            console.log('No task provided for validation');
            return false;
        }

        // Check if the new status exists in the column definitions
        if (!enhancedColumns[newStatus]) {
            console.log('Invalid status:', newStatus);
            return false;
        }

        // Check if the team exists (if team change is attempted)
        if (newTeam && !customSwimlanes[newTeam]) {
            console.log('Invalid team:', newTeam);
            return false;
        }

        // Check if the task is blocked and trying to move forward
        if (isTaskBlocked(task) && isProgressingForward(task.status, newStatus)) {
            console.log('Task is blocked, cannot progress forward');
            return false;
        }

        return true;
    };

    // Helper function to check if status change is forward progression
    const isProgressingForward = (currentStatus, newStatus) => {
        const statusOrder = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const newIndex = statusOrder.indexOf(newStatus);
        return newIndex > currentIndex;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            critical: '#ef4444',
            high: '#f97316',
            medium: '#eab308',
            low: '#6b7280'
        };
        return colors[priority] || colors.medium;
    };

    const getTasksByStatus = (status) => {
        return kanbanTasks.filter(task => task.status === status);
    };

    // Enhanced task filtering with educational context
    const getTasksByTeamAndStatus = (team, status) => {
        return kanbanTasks.filter(task =>
            task.team === team &&
            task.status === status &&
            matchesActiveFilters(task)
        );
    };

    const matchesActiveFilters = (task) => {
        if (activeFilters.priority !== 'all' && task.priority !== activeFilters.priority) return false;
        if (activeFilters.technology !== 'all' &&
            (!task.technologies || !Array.isArray(task.technologies) || !task.technologies.includes(activeFilters.technology))) return false;
        if (activeFilters.assignee !== 'all' && task.assignee !== activeFilters.assignee) return false;
        return true;
    };

    // Dependency management
    const getTaskDependencies = (taskId) => {
        return kanbanTasks.filter(task =>
            (task.dependencies && task.dependencies.includes(taskId)) ||
            (task.blockedBy && task.blockedBy.includes(taskId))
        );
    };

    const isTaskBlocked = (task) => {
        if (!task.blockedBy || !Array.isArray(task.blockedBy)) return false;
        return task.blockedBy.some(depId => {
            const depTask = kanbanTasks.find(t => t.id === depId);
            return depTask && depTask.status !== 'DONE';
        });
    };

    // Educational progress tracking
    const calculateTaskProgress = (task) => {
        const baseProgress = Number(task.progress) || 0;
        const skillProgress = (task.skillsAcquired && Array.isArray(task.skillsAcquired)) ? task.skillsAcquired.length : 0;
        const reviewProgress = (task.peerReviews && task.peerReviews.completed) ? Number(task.peerReviews.completed) : 0;
        return Math.min(100, Math.max(0, baseProgress + (skillProgress * 5) + (reviewProgress * 10)));
    };

    const getSkillLevel = (skill) => {
        const levels = { beginner: '🌱', intermediate: '🌿', advanced: '🌳', expert: '⭐' };
        return levels[skill] || '🌱';
    };

    // Swimlane and Column Management Functions
    const addNewSwimlane = () => {
        const swimlaneId = `swimlane_${Date.now()}`;
        const newSwimlane = {
            name: 'New Team',
            icon: '👥',
            color: '#6b7280',
            columns: ['BACKLOG', 'IN_PROGRESS', 'DONE']
        };

        setCustomSwimlanes(prev => ({
            ...prev,
            [swimlaneId]: newSwimlane
        }));

        // Start editing the new swimlane name
        setEditingHeaders(prev => ({
            ...prev,
            [`swimlane_${swimlaneId}`]: true
        }));
    };

    const deleteSwimlane = (swimlaneId) => {
        setCustomSwimlanes(prev => {
            const newSwimlanes = { ...prev };
            delete newSwimlanes[swimlaneId];
            return newSwimlanes;
        });
    };

    const updateSwimlane = (swimlaneId, field, value) => {
        setCustomSwimlanes(prev => ({
            ...prev,
            [swimlaneId]: {
                ...prev[swimlaneId],
                [field]: value
            }
        }));
    };

    const addColumnToSwimlane = (swimlaneId) => {
        const columnId = `COLUMN_${Date.now()}`;
        setCustomSwimlanes(prev => ({
            ...prev,
            [swimlaneId]: {
                ...prev[swimlaneId],
                columns: [...prev[swimlaneId].columns, columnId]
            }
        }));

        // Add the column to enhancedColumns
        setEnhancedColumns(prev => ({
            ...prev,
            [columnId]: { title: 'New Column', color: '#6b7280' }
        }));
    };

    const deleteColumnFromSwimlane = (swimlaneId, columnId) => {
        setCustomSwimlanes(prev => ({
            ...prev,
            [swimlaneId]: {
                ...prev[swimlaneId],
                columns: prev[swimlaneId].columns.filter(col => col !== columnId)
            }
        }));
    };

    const updateColumnTitle = (columnId, title) => {
        setEnhancedColumns(prev => ({
            ...prev,
            [columnId]: {
                ...prev[columnId],
                title: title
            }
        }));
    };

    // State for enhanced columns (make it stateful)
    const [enhancedColumns, setEnhancedColumns] = useState({
        // Standard columns matching task statuses
        BACKLOG: { title: 'Backlog', color: '#6b7280' },
        TODO: { title: 'To Do', color: '#8b5cf6' },
        IN_PROGRESS: { title: 'In Progress', color: '#f59e0b' },
        REVIEW: { title: 'Review', color: '#06b6d4' },
        DONE: { title: 'Done', color: '#22c55e' },
        // Additional columns for flexibility
        DESIGN_REVIEW: { title: 'Design Review', color: '#8b5cf6' },
        API_DESIGN: { title: 'API Design', color: '#8b5cf6' },
        IN_DEVELOPMENT: { title: 'In Development', color: '#f59e0b' },
        UI_TESTING: { title: 'UI Testing', color: '#06b6d4' },
        API_TESTING: { title: 'API Testing', color: '#06b6d4' },
        INTEGRATION_TESTING: { title: 'Integration Testing', color: '#06b6d4' },
        QA_VALIDATION: { title: 'QA Validation', color: '#84cc16' },
        READY_FOR_INTEGRATION: { title: 'Ready for Integration', color: '#10b981' },
        STAGING: { title: 'Staging', color: '#f97316' },
        PRODUCTION: { title: 'Production', color: '#ef4444' }
    });

    // Enhanced Task Card Component with Educational Features
    const EnhancedTaskCard = ({ task, team }) => {
        const isBlocked = isTaskBlocked(task);
        const progress = calculateTaskProgress(task);
        const dependencies = getTaskDependencies(task.id);

        return (
            <div
                className={`${styles.enhancedTaskCard} ${draggedCard?.id === task.id ? styles.dragging : ''} ${isBlocked ? styles.blocked : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
            >
                {/* Task Header with Team Badge and Priority */}
                <div className={styles.taskHeader}>
                    <div className={styles.taskMeta}>
                        <div className={styles.teamBadge} style={{ backgroundColor: customSwimlanes[team]?.color }}>
                            {customSwimlanes[team]?.icon} {task.role || 'Full-stack'}
                        </div>
                        <div className={`${styles.priorityIndicator} ${styles[task.priority]}`}>
                            {task.priority === 'high' && <BoltIcon className="w-3 h-3" />}
                            {task.priority === 'medium' && <ClockIcon className="w-3 h-3" />}
                            {task.priority === 'low' && <EyeIcon className="w-3 h-3" />}
                        </div>
                    </div>

                    {/* Dependency and Block Indicators */}
                    {(dependencies.length > 0 || isBlocked) && (
                        <div className={styles.dependencyIndicators}>
                            {isBlocked && <div className={styles.blockedIndicator}>🚫</div>}
                            {dependencies.length > 0 && (
                                <div className={styles.dependencyCount}>
                                    <LinkIcon className="w-3 h-3" />
                                    {dependencies.length}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Task Title and Description */}
                <h5 className={styles.taskTitle}>{task.title}</h5>
                <p className={styles.taskDescription}>{task.description}</p>

                {/* Technology Stack Tags */}
                {task.technologies && (
                    <div className={styles.techStack}>
                        {task.technologies.map((tech, index) => (
                            <span key={index} className={styles.techTag}>
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Educational Context */}
                <div className={styles.educationalContext}>
                    {task.skillsRequired && (
                        <div className={styles.skillsSection}>
                            <span className={styles.sectionLabel}>Skills:</span>
                            <div className={styles.skillsList}>
                                {task.skillsRequired.map((skill, index) => (
                                    <span key={index} className={styles.skillBadge}>
                                        {getSkillLevel(skill.level)} {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.learningOutcomes && (
                        <div className={styles.learningOutcomes}>
                            <span className={styles.sectionLabel}>Learning:</span>
                            <span className={styles.outcomeText}>{task.learningOutcomes}</span>
                        </div>
                    )}
                </div>

                {/* Enhanced Progress Tracking */}
                <div className={styles.taskProgress}>
                    <div className={styles.progressHeader}>
                        <div className={styles.progressInfo}>
                            <span>Progress: {progress}%</span>
                            <span className={styles.timeTracking}>
                                {task.timeSpent || 0}h / {task.estimatedHours}h
                            </span>
                        </div>
                        {task.gitIntegration && (
                            <div className={styles.gitStatus}>
                                <span className={`${styles.gitBadge} ${task.gitIntegration.status}`}>
                                    {task.gitIntegration.branch}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                        {task.milestones && (
                            <div className={styles.milestoneMarkers}>
                                {task.milestones.map((milestone, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.milestoneMarker} ${milestone.completed ? styles.completed : ''}`}
                                        style={{ left: `${milestone.percentage}%` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Footer with Collaboration Features */}
                <div className={styles.taskFooter}>
                    <div className={styles.taskAssignee}>
                        <div className={styles.assigneeAvatar}>
                            {task.assignee ? task.assignee.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                        </div>
                        <span className={styles.assigneeName}>{task.assignee || 'Unassigned'}</span>
                        {task.peerReviewers && task.peerReviewers.length > 0 && (
                            <div className={styles.reviewerAvatars}>
                                {task.peerReviewers.map((reviewer, index) => (
                                    <div key={index} className={styles.reviewerAvatar}>
                                        {reviewer ? reviewer.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.taskActions}>
                        {task.hasChat && (
                            <button className={styles.actionButton}>
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            </button>
                        )}
                        {task.hasAttachments && (
                            <button className={styles.actionButton}>
                                📎 {task.attachmentCount}
                            </button>
                        )}
                        <div className={styles.dueDate}>
                            <span className={task.isOverdue ? styles.overdue : ''}>
                                Due: {task.dueDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Assessment Integration */}
                {task.assessmentCriteria && (
                    <div className={styles.assessmentBar}>
                        <span className={styles.assessmentLabel}>Grade Contribution:</span>
                        <div className={styles.gradeProgress}>
                            <StarIcon className="w-3 h-3" />
                            <span>{task.assessmentCriteria.points}pts</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.educationalKanbanBoard}>
            {/* Control Panel */}
            <div className={styles.controlPanel}>
                <div className={styles.viewControls}>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'swimlanes' ? styles.active : ''}`}
                        onClick={() => setViewMode('swimlanes')}
                    >
                        <UserGroupIcon className="w-4 h-4" />
                        Team View
                    </button>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'timeline' ? styles.active : ''}`}
                        onClick={() => setViewMode('timeline')}
                    >
                        <ClockIcon className="w-4 h-4" />
                        Timeline
                    </button>
                    <button
                        className={`${styles.viewButton} ${viewMode === 'personal' ? styles.active : ''}`}
                        onClick={() => setViewMode('personal')}
                    >
                        <EyeIcon className="w-4 h-4" />
                        My Tasks
                    </button>
                </div>

                <div className={styles.filterControls}>
                    <button className={styles.filterButton}>
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        className={`${styles.dependencyToggle} ${showDependencies ? styles.active : ''}`}
                        onClick={() => setShowDependencies(!showDependencies)}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Dependencies
                    </button>
                </div>
            </div>

            {/* Swimlane Management */}
            <div className={styles.swimlaneManager}>
                <button className={styles.addSwimlaneButton} onClick={addNewSwimlane}>
                    ➕ Add Team Swimlane
                </button>
            </div>

            {/* Swimlane-based Board */}
            <div className={styles.swimlaneBoard}>
                {Object.entries(customSwimlanes).map(([teamKey, team]) => (
                    <div key={teamKey} className={styles.swimlane}>
                        {/* Team Header */}
                        <div className={styles.swimlaneHeader} style={{ borderLeftColor: team.color }}>
                            <div className={styles.teamInfo}>
                                <span className={styles.teamIcon}>{team.icon}</span>
                                <div className={styles.editableHeader}>
                                    {editingHeaders[`swimlane_${teamKey}`] ? (
                                        <input
                                            className={styles.headerInput}
                                            value={team.name}
                                            onChange={(e) => updateSwimlane(teamKey, 'name', e.target.value)}
                                            onBlur={() => setEditingHeaders(prev => ({ ...prev, [`swimlane_${teamKey}`]: false }))}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    setEditingHeaders(prev => ({ ...prev, [`swimlane_${teamKey}`]: false }));
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className={styles.teamName}
                                            onClick={() => setEditingHeaders(prev => ({ ...prev, [`swimlane_${teamKey}`]: true }))}
                                        >
                                            {team.name}
                                        </h3>
                                    )}
                                </div>
                                <span className={styles.teamTaskCount}>
                                    {kanbanTasks.filter(task => task.team === teamKey).length} tasks
                                </span>
                            </div>
                            <div className={styles.teamProgress}>
                                <div className={styles.teamVelocity}>
                                    Velocity: {Math.round(Math.random() * 100)}%
                                </div>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => deleteSwimlane(teamKey)}
                                    title="Delete Swimlane"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Team Columns */}
                        <div className={styles.swimlaneColumns}>
                            {team.columns.map(columnKey => (
                                <div
                                    key={columnKey}
                                    className={`${styles.swimlaneColumn} ${isDragging ? styles.dropZone : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, columnKey, teamKey)}
                                >
                                    <div className={styles.columnHeader}>
                                        <div
                                            className={styles.columnIndicator}
                                            style={{ backgroundColor: enhancedColumns[columnKey]?.color }}
                                        />
                                        <div className={styles.columnHeaderEdit}>
                                            {editingHeaders[`column_${columnKey}`] ? (
                                                <input
                                                    className={styles.columnTitleInput}
                                                    value={enhancedColumns[columnKey]?.title || ''}
                                                    onChange={(e) => updateColumnTitle(columnKey, e.target.value)}
                                                    onBlur={() => setEditingHeaders(prev => ({ ...prev, [`column_${columnKey}`]: false }))}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setEditingHeaders(prev => ({ ...prev, [`column_${columnKey}`]: false }));
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <h4
                                                    className={styles.columnTitle}
                                                    onClick={() => setEditingHeaders(prev => ({ ...prev, [`column_${columnKey}`]: true }))}
                                                >
                                                    {enhancedColumns[columnKey]?.title}
                                                </h4>
                                            )}
                                        </div>
                                        <span className={styles.taskCount}>
                                            {getTasksByTeamAndStatus(teamKey, columnKey).length}
                                        </span>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => deleteColumnFromSwimlane(teamKey, columnKey)}
                                            title="Delete Column"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className={styles.columnTasks}>
                                        {getTasksByTeamAndStatus(teamKey, columnKey).map((task) => (
                                            <EnhancedTaskCard
                                                key={`${teamKey}-${columnKey}-${task.id}`}
                                                task={task}
                                                team={teamKey}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Add Column Button */}
                            <button
                                className={styles.addColumnButton}
                                onClick={() => addColumnToSwimlane(teamKey)}
                            >
                                ➕ Add Column
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dependency Visualization Overlay */}
            {showDependencies && (
                <div className={styles.dependencyOverlay}>
                    {/* SVG dependency arrows would be rendered here */}
                    <svg className={styles.dependencyCanvas}>
                        {/* Dependency lines connecting related tasks */}
                    </svg>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;