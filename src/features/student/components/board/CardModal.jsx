import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import useToastConfirmation from '../../../../hooks/useToastConfirmation';
import {
  X,
  Clock,
  User,
  AlignLeft,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Pencil,
  PencilLine,
  AlertCircle,
} from 'lucide-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import ProjectMemberPopover from '../ProjectMemberPopover';
import TaskModal from './TaskModal';
import EditTaskModal from './EditTaskModal';
import AddSubtaskModal from './AddSubtaskModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useSignalRContext } from '../../../../context/kanban/useSignalRContext';
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
} from '../../../../hooks/kanban/signalRHelper';

const CardModal = ({
  card,
  listId,
  listTitle,
  onClose,
  onDelete,
  members,
  workspaceId,
  lists,
}) => {
  const confirmWithToast = useToastConfirmation();
  const getMemberById = studentId => {
    return members?.find(m => m.studentId === studentId);
  };
  const { connection, isConnected } = useSignalRContext();
  const [isOpenTask, setIsOpenTask] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Modal states
  const [editTaskModal, setEditTaskModal] = useState({ isOpen: false, taskId: null, title: '' });
  const [editSubtaskModal, setEditSubtaskModal] = useState({ isOpen: false, taskId: null, subTaskId: null, title: '' });
  const [addSubtaskModal, setAddSubtaskModal] = useState({ isOpen: false, taskId: null });
  const [deleteTaskModal, setDeleteTaskModal] = useState({ isOpen: false, taskId: null });
  const [deleteSubtaskModal, setDeleteSubtaskModal] = useState({ isOpen: false, taskId: null, subTaskId: null });

  const dateInputRef = useRef(null);
  const plusButtonRef = useRef(null);
  const memberMenuRef = useRef(null);
  const panelRef = useRef(null);

  useClickOutside(memberMenuRef, () => setShowMemberMenu(false));

  // ✅ Automatically sync card from lists state (real-time)
  const editedCard = useMemo(() => {
    const currentList = lists?.find(l => String(l.id) === String(listId));
    const currentCard = currentList?.cards.find(
      c => String(c.id) === String(card.id)
    );

    if (currentCard) {
      return {
        ...currentCard,
        assignedMembers: currentCard.assignedMembers || [],
        riskLevel: currentCard.riskLevel || 'low',
        tasks: currentCard.tasks || [],
        dueAt: currentCard.dueAt || null,
      };
    }

    return {
      ...card,
      assignedMembers: card.assignedMembers || [],
      riskLevel: card.riskLevel || 'low',
      tasks: card.tasks || [],
      dueAt: card.dueAt || null,
    };
  }, [lists, listId, card]);

  const formatDateForInput = dateString => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Format thành YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [editableFields, setEditableFields] = useState({
    title: card.title,
    description: card.description || '',
    riskLevel: card.riskLevel || 'low',
    dueAt: formatDateForInput(card.dueAt) || null,
  });

  // Sync editableFields khi editedCard thay đổi
  useEffect(() => {
    setEditableFields({
      title: editedCard.title,
      description: editedCard.description || '',
      riskLevel: editedCard.riskLevel || 'low',
      dueAt: formatDateForInput(editedCard.dueAt) || null,
    });
  }, [editedCard]);

  const getMemberMenuPosition = () => {
    const rect = plusButtonRef.current?.getBoundingClientRect();
    if (!rect) return {};
    return { top: `${rect.bottom + 8}px`, left: `${rect.left}px` };
  };

  const handleSave = async () => {
    if (!editableFields.title.trim()) {
      toast.error('Card title cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      let formattedDueAt = null;
      if (editableFields.dueAt) {
        const dateObj = new Date(editableFields.dueAt);
        if (!isNaN(dateObj.getTime())) {
          formattedDueAt = dateObj.toISOString();
        }
      }
      
      await updateCardDetails(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        {
          title: editableFields.title,
          description: editableFields.description,
          riskLevel: editableFields.riskLevel,
          dueAt: formattedDueAt,
        }
      );

      toast.success('Card updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmWithToast(
      'Are you sure you want to delete this card?',
      {
        description: "This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel"
      }
    );
    if (confirmed) {
      onDelete(listId, editedCard.id);
      toast.success('Card deleted successfully');
      onClose();
    }
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
      // ✅ Không cần update state - SignalR sẽ xử lý
    } catch (error) {
      console.error('Error toggling card completion:', error);
      toast.error('Failed to update card status');
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
        toast.success(`${member.studentName} removed from card`);
      } else {
        await assignMemberToCard(
          connection,
          workspaceId,
          parseInt(listId),
          parseInt(editedCard.id),
          member.studentId,
          member.studentName
        );
        toast.success(`${member.studentName} assigned to card`);
      }
      // ✅ Không cần update state - SignalR sẽ xử lý
      setShowMemberMenu(false);
    } catch (error) {
      console.error('Error toggling member:', error);
      toast.error('Failed to update member assignment');
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

  // ✅ TASK HANDLERS - CHỈ GỌI SIGNALR, KHÔNG UPDATE STATE
  const handleCreateTask = async taskData => {
    try {
      await createTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        taskData.title
      );

      setIsOpenTask(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleRenameTask = async (taskId, newTitle) => {
    if (!newTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    try {
      await renameTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        newTitle
      );

      toast.success('Task renamed successfully!');
    } catch (error) {
      console.error('Error renaming task:', error);
      toast.error('Failed to rename task');
    }
  };

  const handleDeleteTask = async taskId => {

    try {
      await deleteTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId)
      );

      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // ✅ SUBTASK HANDLERS - CHỈ GỌI SIGNALR
  const handleCreateSubtask = async (taskId, title) => {
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

      toast.success('Subtask created successfully!');
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Failed to create subtask');
    }
  };

  const handleRenameSubtask = async (taskId, subTaskId, newTitle) => {
    if (!newTitle.trim()) {
      toast.error('Subtask title cannot be empty');
      return;
    }

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

      toast.success('Subtask renamed successfully!');
    } catch (error) {
      console.error('Error renaming subtask:', error);
      toast.error('Failed to rename subtask');
    }
  };

  const handleDeleteSubtask = async (taskId, subTaskId) => {

    try {
      await deleteSubTask(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(editedCard.id),
        parseInt(taskId),
        parseInt(subTaskId)
      );

      toast.success('Subtask deleted successfully!');
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast.error('Failed to delete subtask');
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

      toast.success(!currentStatus ? 'Subtask completed!' : 'Subtask reopened');
    } catch (error) {
      console.error('Error toggling subtask:', error);
      toast.error('Failed to update subtask status');
    }
  };

  // ✅ Calculate due date status
  const getDueDateStatus = () => {
    if (!editedCard.dueAt) return null;
    
    const dueDate = new Date(editedCard.dueAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (editedCard.isCompleted) {
      return { label: 'Complete', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    }
    
    if (diffDays < 0) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    }
    
    if (diffDays === 0) {
      return { label: 'Due Today', color: 'bg-orange-100 text-orange-700', icon: Clock };
    }
    
    if (diffDays <= 3) {
      return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    }
    
    return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: Clock };
  };

  const dueDateStatus = getDueDateStatus();

  const riskLevels = [
    { name: 'Low', value: 'low', bg: 'bg-green-500' },
    { name: 'Medium', value: 'medium', bg: 'bg-yellow-500' },
    { name: 'High', value: 'high', bg: 'bg-red-500' },
  ];
  
  const getAvatarUrl = member => {
    const avatarUrl = member?.avatarImg || member?.avatar;
    
    if (
      !avatarUrl ||
      avatarUrl === 'https://res.cloudinary.com/dn5xgbmqq/image/upload'
    ) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.studentName || 'User')}&background=random&color=fff&size=128`;
    }

    return avatarUrl;
  };

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
              disabled={!isConnected}
              className='mt-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed'
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
                value={editableFields.title}
                onChange={e =>
                  setEditableFields(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                disabled={!isConnected}
                className={`text-2xl font-bold text-gray-800 border-2 border-gray-200 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed ${
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
                {editedCard.assignedMembers?.map(assigned => {
                  const member = getMemberById(assigned.studentId) || assigned;
                  return (
                    <button
                      key={member.studentId}
                      onClick={e => handleMemberClick(member, e)}
                      className='relative group'
                      type='button'
                    >
                      <img
                        src={getAvatarUrl(member)}
                        alt={member.studentName}
                        className='w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-blue-400 transition-all object-cover'
                      />
                    </button>
                  );
                })}
                <div className='relative'>
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberMenu(!showMemberMenu)}
                    disabled={!isConnected}
                    className='w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                    type='button'
                  >
                    <Plus size={20} className='text-gray-600' />
                  </button>

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
                        <div className='space-y-1 max-h-[300px] overflow-y-auto'>
                          {members?.map(member => {
                            const isAssigned = editedCard.assignedMembers?.some(
                              m => m.studentId === member.studentId
                            );
                            return (
                              <button
                                key={member.studentId}
                                onClick={() => toggleMember(member)}
                                disabled={!isConnected}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isAssigned
                                    ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200'
                                    : 'hover:bg-gray-50'
                                } disabled:opacity-50`}
                                type='button'
                              >
                                <img
                                  src={member.avatarImg}
                                  alt={member.studentName}
                                  className='w-9 h-9 rounded-full ring-2 ring-white shadow object-cover'
                                />
                                <div className='flex-1 text-left'>
                                  <span className='text-gray-800 font-medium text-sm'>
                                    {member.studentName}
                                  </span>
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
                      setEditableFields(prev => ({
                        ...prev,
                        riskLevel: risk.value,
                      }))
                    }
                    disabled={!isConnected}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${risk.bg} ${
                      editableFields.riskLevel === risk.value
                        ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                        : 'opacity-50 hover:opacity-100 text-white'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                    type='button'
                  >
                    {risk.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                    value={editableFields.dueAt || ''}
                    onChange={e =>
                      setEditableFields(prev => ({
                        ...prev,
                        dueAt: e.target.value || null,
                      }))
                    }
                    disabled={!isConnected}
                    className='flex-1 bg-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                </div>
                <div className='text-sm text-gray-600'>
                  {editableFields.dueAt ? (
                    <div className='flex items-center gap-2'>
                      <span>
                        {new Date(editableFields.dueAt).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>
                      {dueDateStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${dueDateStatus.color}`}>
                          <dueDateStatus.icon size={14} />
                          {dueDateStatus.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>No due date set</span>
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
              value={editableFields.description}
              onChange={e =>
                setEditableFields(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={!isConnected}
              placeholder='Add a more detailed description...'
              className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              rows={6}
            />
          </div>

          {/* Tasks */}
          <div className='mt-4 space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-gray-800 font-semibold flex items-center gap-2'>
                <Plus size={20} className='text-gray-600' />
                Tasks
              </h3>
              <button
                onClick={() => setIsOpenTask(true)}
                disabled={!isConnected}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                type='button'
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            {/* Tasks list */}
            {editedCard.tasks?.map(task => (
              <div
                key={task.taskId}
                className='bg-gray-800 text-white p-4 rounded-xl shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`font-semibold text-lg ${
                        task.isDone ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {task.taskTitle}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* ✅ Rename Task - Modal */}
                    <button
                      onClick={() => setEditTaskModal({ 
                        isOpen: true, 
                        taskId: task.taskId, 
                        title: task.taskTitle 
                      })}
                      disabled={!isConnected}
                      className='text-gray-300 hover:text-blue-400 px-2 py-1 rounded disabled:opacity-50 transition-colors'
                      title='Rename Task'
                    >
                      <Pencil size={18} />
                    </button>

                    {/* ✅ Delete Task - Modal */}
                    <button
                      onClick={() => setDeleteTaskModal({ isOpen: true, taskId: task.taskId })}
                      disabled={!isConnected}
                      className='text-gray-300 hover:text-red-400 px-2 py-1 rounded disabled:opacity-50 transition-colors'
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
                      className='h-1 bg-blue-500 rounded transition-all'
                      style={{
                        width: `${
                          (task.subTaskDtos.filter(s => s.isDone).length /
                            task.subTaskDtos.length) *
                            100 || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {task.subTaskDtos?.map(sub => (
                    <div
                      key={sub.subTaskId}
                      className='flex items-center justify-between pl-2'
                    >
                      <label className='flex items-center gap-3 flex-1 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={sub.isDone}
                          onChange={() =>
                            handleToggleSubtaskDone(
                              task.taskId,
                              sub.subTaskId,
                              sub.isDone
                            )
                          }
                          disabled={!isConnected}
                          className='w-4 h-4 cursor-pointer disabled:cursor-not-allowed'
                        />
                        <span
                          className={
                            sub.isDone ? 'line-through opacity-60' : ''
                          }
                        >
                          {sub.subTaskTitle}
                        </span>
                      </label>

                      <div className='flex items-center gap-2 pr-2'>
                        {/* ✅ Rename Subtask - Modal */}
                        <button
                          onClick={() => setEditSubtaskModal({ 
                            isOpen: true, 
                            taskId: task.taskId, 
                            subTaskId: sub.subTaskId, 
                            title: sub.subTaskTitle 
                          })}
                          disabled={!isConnected}
                          className='text-gray-300 hover:text-blue-400 px-1 rounded disabled:opacity-50 transition-colors'
                          title='Rename Subtask'
                        >
                          <PencilLine size={16} />
                        </button>

                        {/* ✅ Delete Subtask - Modal */}
                        <button
                          onClick={() => setDeleteSubtaskModal({ 
                            isOpen: true, 
                            taskId: task.taskId, 
                            subTaskId: sub.subTaskId 
                          })}
                          disabled={!isConnected}
                          className='text-gray-300 hover:text-red-400 px-1 rounded disabled:opacity-50 transition-colors'
                          title='Delete Subtask'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* ✅ Add Subtask - Modal */}
                  <button
                    className='mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    onClick={() => setAddSubtaskModal({ isOpen: true, taskId: task.taskId })}
                    disabled={!isConnected}
                  >
                    Add an item
                  </button>
                </div>
              </div>
            ))}
          </div>
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
            className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ✅ All Modals */}
      
      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={editTaskModal.isOpen}
        onClose={() => setEditTaskModal({ isOpen: false, taskId: null, title: '' })}
        onSave={(newTitle) => {
          handleRenameTask(editTaskModal.taskId, newTitle);
          setEditTaskModal({ isOpen: false, taskId: null, title: '' });
        }}
        initialTitle={editTaskModal.title}
        type='task'
      />

      {/* Edit Subtask Modal */}
      <EditTaskModal
        isOpen={editSubtaskModal.isOpen}
        onClose={() => setEditSubtaskModal({ isOpen: false, taskId: null, subTaskId: null, title: '' })}
        onSave={(newTitle) => {
          handleRenameSubtask(editSubtaskModal.taskId, editSubtaskModal.subTaskId, newTitle);
          setEditSubtaskModal({ isOpen: false, taskId: null, subTaskId: null, title: '' });
        }}
        initialTitle={editSubtaskModal.title}
        type='subtask'
      />

      {/* Add Subtask Modal */}
      <AddSubtaskModal
        isOpen={addSubtaskModal.isOpen}
        onClose={() => setAddSubtaskModal({ isOpen: false, taskId: null })}
        onSave={(title) => {
          handleCreateSubtask(addSubtaskModal.taskId, title);
          setAddSubtaskModal({ isOpen: false, taskId: null });
        }}
      />

      {/* Delete Task Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTaskModal.isOpen}
        onClose={() => setDeleteTaskModal({ isOpen: false, taskId: null })}
        onConfirm={() => {
          handleDeleteTask(deleteTaskModal.taskId);
          setDeleteTaskModal({ isOpen: false, taskId: null });
        }}
        type='task'
      />

      {/* Delete Subtask Modal */}
      <ConfirmDeleteModal
        isOpen={deleteSubtaskModal.isOpen}
        onClose={() => setDeleteSubtaskModal({ isOpen: false, taskId: null, subTaskId: null })}
        onConfirm={() => {
          handleDeleteSubtask(deleteSubtaskModal.taskId, deleteSubtaskModal.subTaskId);
          setDeleteSubtaskModal({ isOpen: false, taskId: null, subTaskId: null });
        }}
        type='subtask'
      />

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
          isOpen={isOpenTask}
          onClose={() => setIsOpenTask(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};

export default CardModal;