import React, { useState, useRef } from 'react';
import {
  X,
  Clock,
  User,
  AlignLeft,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Archive,
  Pencil,
  PencilLine,
} from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';
import ProjectMemberPopover from '../../student/ProjectMemberPopover';
import TaskModal from './TaskModal';
import { useSignalRContext } from '../../../context/kanban/useSignalRContext';
import {
  updateCardDetails,
  markCardComplete,
  assignMemberToCard,
  unassignMemberFromCard,
  createTask,
  renameTask,
  deleteTask,
  createSubTask,
  renameSubTask,
  deleteSubTask,
  markSubTaskDone,
} from '../../../hooks/kanban/signalRHelper';

const CardModal = ({
  card,
  listId,
  listTitle,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  members,
  workspaceId,
}) => {
  const { connection, isConnected } = useSignalRContext();
  const [isOpenTask, setIsOpenTask] = useState(false);
  const [editedCard, setEditedCard] = useState({
    ...card,
    assignedMembers: card.assignedMembers || [],
    riskLevel: card.riskLevel || 'low',
    tasks: card.tasks || [],
    dueAt: card.dueAt || null,
  });
  console.log('Edited Card in Modal:', editedCard);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const dateInputRef = useRef(null);
  const plusButtonRef = useRef(null);
  const memberMenuRef = useRef(null);
  const panelRef = useRef(null);
  // useClickOutside(panelRef, onClose);
  useClickOutside(memberMenuRef, () => setShowMemberMenu(false));

  // helper to anchor member menu to plus icon
  const getMemberMenuPosition = () => {
    const rect = plusButtonRef.current?.getBoundingClientRect();
    if (!rect) return {};
    return { top: `${rect.bottom + 8}px`, left: `${rect.left}px` };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCardDetails(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        {
          title: editedCard.title,
          description: editedCard.description,
          riskLevel: editedCard.riskLevel,
          dueAt: editedCard.dueAt,
        }
      );

      onUpdate(listId, editedCard);
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(listId, editedCard.id);
      onClose();
    }
  };

  const handleArchive = () => {
    onArchive(listId, editedCard.id);
    onClose();
  };

  const toggleComplete = async () => {
    const newStatus = !editedCard.isCompleted;

    try {
      await markCardComplete(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        newStatus
      );

      setEditedCard(prev => ({ ...prev, isCompleted: newStatus }));
    } catch (error) {
      console.error('Error toggling card completion:', error);
      alert('Failed to update card status');
    }
  };

  const toggleMember = async member => {
    const assignedMembers = editedCard.assignedMembers || [];
    const isAssigned = assignedMembers.some(
      m => m.studentId === member.studentId
    );

    try {
      if (isAssigned) {
        await unassignMemberFromCard(
          connection,
          workspaceId,
          parseInt(listId),
          parseInt(editedCard.id),
          member.studentId
        );

        setEditedCard(prev => ({
          ...prev,
          assignedMembers: assignedMembers.filter(
            m => m.studentId !== member.studentId
          ),
        }));
      } else {
        await assignMemberToCard(
          connection,
          workspaceId,
          parseInt(listId),
          parseInt(editedCard.id),
          member.studentId,
          member.studentName
        );

        setEditedCard(prev => ({
          ...prev,
          assignedMembers: [...assignedMembers, member],
        }));
      }
      setShowMemberMenu(false);
    } catch (error) {
      console.error('Error toggling member:', error);
      alert('Failed to update member assignment');
    }
  };

  const handleMemberClick = (member, event) => {
    setSelectedMember(member);
    setPopoverAnchor(event.currentTarget);
  };

  const handleClosePopover = () => {
    setSelectedMember(null);
    setPopoverAnchor(null);
  };
  const handleCreateTask = async (taskData) => {
    try {
      await createTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        taskData.title
      );
      
      // Tạm thời thêm vào UI (SignalR event sẽ cập nhật lại)
      const newTask = {
        taskId: `temp-${Date.now()}`,
        taskTitle: taskData.title,
        isDone: false,
        subTaskDtos: taskData.subtasks.map((st, idx) => ({
          subTaskId: `temp-sub-${Date.now()}-${idx}`,
          subTaskTitle: st.text,
          isDone: false,
        })),
      };
      
      setEditedCard(prev => ({
        ...prev,
        tasks: [...(prev.tasks || []), newTask],
      }));
      
      setIsOpenTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleRenameTask = async (taskId, newTitle) => {
    if (!newTitle.trim()) return;
    
    try {
      await renameTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        newTitle
      );
      
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.taskId === taskId ? { ...t, taskTitle: newTitle } : t
        ),
      }));
    } catch (error) {
      console.error('Error renaming task:', error);
      alert('Failed to rename task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      await deleteTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId)
      );
      
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.taskId !== taskId),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleToggleTaskDone = async (taskId, currentStatus) => {
    try {
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.taskId === taskId ? { ...t, isDone: !currentStatus } : t
        ),
      }));
      
      // Note: Backend có thể cần endpoint riêng cho việc này
      // Tạm thời chỉ update UI
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleCreateSubtask = async (taskId) => {
    const title = prompt('Enter subtask title:');
    if (!title) return;
    
    try {
      await createSubTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        title,
        false
      );
      
      // UI sẽ được cập nhật qua SignalR event
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert('Failed to create subtask');
    }
  };

  const handleRenameSubtask = async (taskId, subTaskId, newTitle) => {
    if (!newTitle.trim()) return;
    
    try {
      await renameSubTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        parseInt(subTaskId),
        newTitle
      );
      
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.taskId === taskId
            ? {
                ...t,
                subTaskDtos: t.subTaskDtos.map(s =>
                  s.subTaskId === subTaskId ? { ...s, subTaskTitle: newTitle } : s
                ),
              }
            : t
        ),
      }));
    } catch (error) {
      console.error('Error renaming subtask:', error);
      alert('Failed to rename subtask');
    }
  };

  const handleDeleteSubtask = async (taskId, subTaskId) => {
    if (!window.confirm('Delete this subtask?')) return;
    
    try {
      await deleteSubTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        parseInt(subTaskId)
      );
      
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.taskId === taskId
            ? {
                ...t,
                subTaskDtos: t.subTaskDtos.filter(s => s.subTaskId !== subTaskId),
              }
            : t
        ),
      }));
    } catch (error) {
      console.error('Error deleting subtask:', error);
      alert('Failed to delete subtask');
    }
  };

  const handleToggleSubtaskDone = async (taskId, subTaskId, currentStatus) => {
    try {
      await markSubTaskDone(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        parseInt(subTaskId),
        !currentStatus
      );
      
      setEditedCard(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.taskId === taskId
            ? {
                ...t,
                subTaskDtos: t.subTaskDtos.map(s =>
                  s.subTaskId === subTaskId ? { ...s, isDone: !currentStatus } : s
                ),
              }
            : t
        ),
      }));
    } catch (error) {
      console.error('Error toggling subtask:', error);
      alert('Failed to update subtask status');
    }
  };

  // Fix: sử dụng dueAt thay vì dueDate
  const isOverdue =
    editedCard.dueAt &&
    new Date(editedCard.dueAt) < new Date() &&
    !editedCard.isCompleted;

  const riskLevels = [
    {
      name: 'Low',
      value: 'low',
      bg: 'bg-green-500',
      hoverBg: 'hover:bg-green-600',
    },
    {
      name: 'Medium',
      value: 'medium',
      bg: 'bg-yellow-500',
      hoverBg: 'hover:bg-yellow-600',
    },
    {
      name: 'High',
      value: 'high',
      bg: 'bg-red-500',
      hoverBg: 'hover:bg-red-600',
    },
  ];

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
      <div
        ref={panelRef}
        className='bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp'
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-white font-bold text-2xl md:text-3xl'>
              {listTitle}
            </h2>
            {!isConnected && (
                <span className='text-yellow-300 text-sm bg-yellow-900/30 px-2 py-1 rounded'>
                  ⚠️ Offline
                </span>
              )}
            <div className='flex items-center gap-2'>
              {/* Move Archive/Delete to header */}
              <button
                onClick={handleArchive}
                className='text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2'
                type='button'
                title='Archive Card'
              >
                <Archive size={18} />
                Archive
              </button>
              <button
                onClick={handleDelete}
                className='text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2'
                type='button'
                title='Delete Card'
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={onClose}
                className='text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all'
                type='button'
                title='Close'
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
        <div className='p-6 overflow-y-auto max-h-[calc(95vh-180px)] space-y-6'>
          {/* Checkbox + Title */}
          <div className='flex items-start gap-3'>
            <button
              onClick={toggleComplete}
              className='mt-1 transition-all duration-200 hover:scale-110'
              type='button'
            >
              {editedCard.isCompleted ? (
                <CheckCircle2 size={32} className='text-green-600' />
              ) : (
                <Circle
                  size={32}
                  className='text-gray-400 hover:text-gray-600'
                />
              )}
            </button>
            <div className='flex-1'>
              <input
                type='text'
                value={editedCard.title}
                onChange={e =>
                  setEditedCard({ ...editedCard, title: e.target.value })
                }
                className={`text-2xl font-bold text-gray-800 border-2 border-gray-200 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 w-full ${
                  editedCard.isCompleted ? 'line-through opacity-70' : ''
                }`}
                placeholder='Card title...'
              />
            </div>
          </div>

          {/* Members and Risk */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Members */}
            <div>
              <h3 className='text-gray-800 font-semibold mb-3 flex items-center gap-2'>
                <User size={20} className='text-gray-600' />
                Members
              </h3>
              <div className='flex items-center gap-2 flex-wrap'>
                {editedCard.assignedMembers?.map(member => (
                  <button
                    key={member.studentId}
                    onClick={e => handleMemberClick(member, e)}
                    className='relative group'
                    type='button'
                  >
                    <img
                      src={member.avatarImg}
                      alt={member.studentName}
                      className='w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-blue-400 transition-all object-cover'
                    />
                  </button>
                ))}
                <div className='relative'>
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberMenu(!showMemberMenu)}
                    className='w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all'
                    type='button'
                  >
                    <Plus size={20} className='text-gray-600' />
                  </button>

                  {/* Member Menu - anchored to plus icon */}
                  {showMemberMenu && (
                    <>
                      <div
                        className='fixed inset-0 z-[60]'
                        onClick={() => setShowMemberMenu(false)}
                      />
                      <div
                        ref={memberMenuRef}
                        className='fixed z-[70] w-80 bg-white rounded-xl shadow-2xl p-3 border border-gray-200'
                        style={getMemberMenuPosition()}
                      >
                        <h4 className='text-gray-800 font-semibold mb-3 px-2 flex items-center gap-2'>
                          <User size={16} />
                          Select Members
                        </h4>
                        <div className='space-y-1'>
                          {members?.map(member => {
                            const isAssigned = editedCard.assignedMembers?.some(
                              m => m.studentId === member.studentId
                            );
                            return (
                              <button
                                key={member.id}
                                onClick={() => toggleMember(member)}
                                disabled={!isConnected}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isAssigned
                                    ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                                type='button'
                              >
                                <img
                                  src={member.avatarImg}
                                  alt={member.studentName}
                                  className='w-9 h-9 rounded-full ring-2 ring-white shadow object-cover'
                                />
                                <div className='flex-1 text-left'>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-gray-800 font-medium text-sm'>
                                      {member.studentName}
                                    </span>
                                  </div>
                                </div>
                                {isAssigned && (
                                  <CheckCircle2
                                    size={18}
                                    className='text-blue-600'
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Labels */}
            <div>
              <h3 className='text-gray-800 font-semibold mb-3'>Risk Level</h3>
              <div className='flex flex-wrap gap-2'>
                {riskLevels.map(risk => (
                  <button
                    key={risk.value}
                    onClick={() =>
                      setEditedCard({ ...editedCard, riskLevel: risk.value })
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${risk.bg} ${
                      editedCard.riskLevel === risk.value
                        ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                        : 'opacity-50 hover:opacity-100 text-white'
                    }`}
                    type='button'
                  >
                    {risk.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details: Due Date (left) + Attachments (right) */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Due Date - Fix: sử dụng dueAt */}
            <div>
              <h3 className='text-gray-800 font-semibold mb-3 flex items-center gap-2'>
                <Clock size={20} className='text-gray-600' />
                Due Date
              </h3>
              <div className='space-y-2'>
                <div className='w-full bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2'>
                  <input
                    ref={dateInputRef}
                    type='date'
                    value={editedCard.dueAt || ''}
                    onChange={e =>
                      setEditedCard({
                        ...editedCard,
                        dueAt: e.target.value || null,
                      })
                    }
                    className='flex-1 bg-transparent outline-none'
                  />
                </div>
                <div className='text-sm text-gray-600'>
                  {editedCard.dueAt ? (
                    <span>
                      {new Date(editedCard.dueAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span>No due date set</span>
                  )}
                  {editedCard.dueAt && !editedCard.isCompleted && isOverdue && (
                    <span className='ml-2 text-xs font-semibold bg-red-600 text-white px-2 py-0.5 rounded-full'>
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className='text-gray-800 font-semibold mb-3 flex items-center gap-2'>
              <AlignLeft size={20} className='text-gray-600' />
              Description
            </h3>
            <textarea
              value={editedCard.description || ''}
              onChange={e =>
                setEditedCard({ ...editedCard, description: e.target.value })
              }
              placeholder='Add a more detailed description...'
              className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all'
              rows={6}
            />
          </div>
          {/* Task list */}
          <div className='mt-4 space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-gray-800 font-semibold flex items-center gap-2'>
                <Plus size={20} className='text-gray-600' />
                Tasks
              </h3>

              <button
                onClick={() => setIsOpenTask(true)}
                disabled={!isConnected}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg'
                type='button'
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            {editedCard.tasks?.map(task => (
              <div
                key={task.taskId}
                className='bg-gray-800 text-white p-4 rounded-xl shadow'
              >
                {/* Task header */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={task.isDone}
                      onChange={() => handleToggleTaskDone(task.taskId, task.isDone)}
                      disabled={!isConnected}
                      className='w-5 h-5'
                    />

                    <span
                      className={`font-semibold text-lg ${task.status ? 'line-through opacity-60' : ''}`}
                    >
                      {task.taskTitle}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* UPDATE TASK */}
                    <button
                      onClick={() => {
                        const name = prompt('Enter new task title:', task.taskTitle);
                        if (name) handleRenameTask(task.taskId, name);
                      }}
                      disabled={!isConnected}
                      className='text-gray-300 hover:text-blue-400 px-2 py-1 rounded disabled:opacity-50'
                      title='Rename Task'
                    >
                      <Pencil size={18} />
                    </button>

                    {/* DELETE TASK */}
                    <button
                      onClick={() => handleDeleteTask(task.taskId)}
                      disabled={!isConnected}
                      className='text-gray-300 hover:text-red-400 px-2 py-1 rounded disabled:opacity-50'
                      title='Delete Task'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className='mt-2 mb-3'>
                  <div className='text-xs text-gray-400'>
                    {Math.round(
                      (task.subTaskDtos.filter(s => s.isDone).length /
                        task.subTaskDtos.length) *
                        100
                    ) || 0}
                    %
                  </div>
                  <div className='w-full h-1 bg-gray-700 rounded'>
                    <div
                      className='h-1 bg-blue-500 rounded'
                      style={{
                        width: `${
                          (task.subTaskDtos.filter(s => s.isDone).length /
                            task.subTaskDtos.length) *
                            100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {task.subTaskDtos?.map(sub => (
                    <div
                      key={sub.subTaskId} // ✅ Đổi từ sub.id → sub.subTaskId
                      className='flex items-center justify-between pl-2'
                    >
                      <label className='flex items-center gap-3 flex-1'>
                        <input
                          type='checkbox'
                          checked={sub.isDone}
                          onChange={() =>
                            handleToggleSubtaskDone(task.taskId, sub.subTaskId, sub.isDone)
                          }
                          disabled={!isConnected}
                          className='w-4 h-4'
                        />
                        <span
                          className={`${sub.isDone ? 'line-through opacity-60' : ''}`} 
                        >
                          {sub.subTaskTitle}{' '}
                        </span>
                      </label>

                      <div className='flex items-center gap-2 pr-2'>
                        {/* UPDATE SUBTASK */}
                        <button
                          onClick={() => {
                            const name = prompt('Enter new subtask title:', sub.subTaskTitle);
                            if (name) handleRenameSubtask(task.taskId, sub.subTaskId, name);
                          }}
                          disabled={!isConnected}
                          className='text-gray-300 hover:text-blue-400 px-1 rounded disabled:opacity-50'
                          title='Rename Subtask'
                        >
                          <PencilLine size={16} />
                        </button>

                        {/* DELETE SUBTASK */}
                        <button
                          onClick={() => handleDeleteSubtask(task.taskId, sub.subTaskId)}
                          disabled={!isConnected}
                          className='text-gray-300 hover:text-red-400 px-1 rounded disabled:opacity-50'
                          title='Delete Subtask'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add subtask button */}
                  <button
                    className='mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50'
                    onClick={() => handleCreateSubtask(task.taskId)}
                    disabled={!isConnected}
                  >
                    Thêm một mục
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-all'
              type='button'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isConnected}
              className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all'
              type='button'
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Member Popover */}
      {selectedMember && popoverAnchor && (
        <ProjectMemberPopover
          member={selectedMember}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
        />
      )}
      {/* Task Modal */}
      {isOpenTask && (
        <TaskModal
          isOpen={isOpenTask === true}
          onClose={() => setIsOpenTask(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};

export default CardModal;
