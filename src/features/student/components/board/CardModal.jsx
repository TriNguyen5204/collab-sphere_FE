import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import useToastConfirmation from '../../../../hooks/useToastConfirmation';
import { useAvatar } from '../../../../hooks/useAvatar';
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
  Layout,
  Calendar,
  ListChecks,
  Flag
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

const MemberAvatar = ({ member, size = "w-10 h-10", className = "" }) => {
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(
    member.studentName,
    member.avatarImg || member.avatar
  );

  return (
    <div
      className={`${size} ${className} flex items-center justify-center rounded-full overflow-hidden border ${
        shouldShowImage ? 'border-gray-200' : colorClass
      } bg-white`}
    >
      {shouldShowImage ? (
        <img
          src={member.avatarImg || member.avatar}
          alt={member.studentName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-bold text-xs">{initials}</span>
      )}
    </div>
  );
};

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
    { 
      name: 'Low', 
      value: 'low', 
      baseClass: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      activeClass: 'ring-2 ring-green-500 ring-offset-1 font-bold'
    },
    { 
      name: 'Medium', 
      value: 'medium', 
      baseClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      activeClass: 'ring-2 ring-yellow-500 ring-offset-1 font-bold'
    },
    { 
      name: 'High', 
      value: 'high', 
      baseClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      activeClass: 'ring-2 ring-red-500 ring-offset-1 font-bold'
    },
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

  return createPortal(
    <div className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn'>
      <div
        ref={panelRef}
        className='bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col border border-gray-100'
      >
        {/* Header - Brand Gradient */}
        <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 p-6 flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                   <Layout className="text-white" size={24} />
                </div>
                <div>
                    <h2 className='text-white font-bold text-2xl tracking-tight'>
                    Card Details
                    </h2>
                    {listTitle && (
                    <p className='text-orange-100 text-sm font-medium'>
                        in list: <span className="text-white font-semibold">{listTitle}</span>
                    </p>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {!isConnected && (
                <span className='bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm'>
                    <div className="w-2 h-2 rounded-full bg-yellow-800 animate-pulse" />
                    Offline
                </span>
                )}
                
                <button
                  onClick={handleDelete}
                  className='text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200'
                  type='button'
                  title='Delete Card'
                >
                  <Trash2 size={20} />
                </button>

                <button
                  onClick={onClose}
                  className='text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200'
                  type='button'
                  title='Close'
                >
                  <X size={24} />
                </button>
            </div>
          </div>
        </div>

        <div className='p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-white'>
          {/* Checkbox + Title */}
          <div className='space-y-2'>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1">Card Title</label>
            <div className='flex items-start gap-4 group'>
                <button
                  onClick={toggleComplete}
                  disabled={!isConnected}
                  className='mt-3 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed'
                  type='button'
                >
                  {editedCard.isCompleted ? (
                    <CheckCircle2 size={24} className='text-green-500' />
                  ) : (
                    <Circle
                      size={24}
                      className='text-gray-300 group-focus-within:text-orangeFpt-500 transition-colors duration-300'
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
                    className={`w-full text-2xl font-bold text-gray-800 border-b-2 border-gray-100 focus:border-orangeFpt-500 focus:outline-none px-2 py-2 placeholder-gray-300 transition-all duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      editedCard.isCompleted ? 'line-through opacity-70' : ''
                    }`}
                    placeholder='Card title...'
                  />
                </div>
            </div>
          </div>

          {/* Grid: Members & Risk & Date */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            
            {/* Members Section */}
            <div className="lg:col-span-1">
              <h3 className='text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm'>
                <User size={18} className='text-gray-400' />
                Members
              </h3>
              <div className='flex items-center gap-2 flex-wrap min-h-[48px] p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors'>
                {editedCard.assignedMembers?.map(assigned => {
                  const member = getMemberById(assigned.studentId) || assigned;
                  return (
                    <button
                      key={member.studentId}
                      onClick={e => handleMemberClick(member, e)}
                      className='relative group transition-transform hover:scale-105'
                      type='button'
                    >
                      <MemberAvatar member={member} size="w-10 h-10" className="ring-2 ring-white shadow-sm" />
                    </button>
                  );
                })}

                {/* Add Member Button */}
                <div className='relative'>
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberMenu(!showMemberMenu)}
                    disabled={!isConnected}
                    className='w-10 h-10 rounded-full border border-dashed border-gray-300 hover:border-orangeFpt-500 hover:bg-orangeFpt-50 flex items-center justify-center transition-all disabled:opacity-50 text-gray-400 hover:text-orangeFpt-500 bg-white'
                    type='button'
                  >
                    <Plus size={18} />
                  </button>

                  {/* Dropdown - Clean White */}
                  {showMemberMenu && (
                    <>
                      <div
                        className='fixed inset-0 z-[60]'
                        onClick={() => setShowMemberMenu(false)}
                      />
                      <div
                        ref={memberMenuRef}
                        className='fixed z-[70] w-72 bg-white rounded-xl shadow-xl p-2 border border-gray-100 ring-1 ring-black/5'
                        style={getMemberMenuPosition()}
                      >
                        <h4 className='text-gray-500 font-bold text-xs uppercase tracking-wider mb-2 px-3 py-1'>
                          Select Members
                        </h4>
                        <div className='space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar'>
                          {members?.map(member => {
                            const isAssigned = editedCard.assignedMembers?.some(
                              m => m.studentId === member.studentId
                            );
                            return (
                              <button
                                key={member.studentId}
                                onClick={() => toggleMember(member)}
                                disabled={!isConnected}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                  isAssigned
                                    ? 'bg-orangeFpt-50 text-orangeFpt-700'
                                    : 'hover:bg-gray-50 text-gray-700'
                                } disabled:opacity-50`}
                                type='button'
                              >
                                <MemberAvatar member={member} size="w-8 h-8" className={isAssigned ? 'ring-2 ring-orangeFpt-200' : ''} />
                                <div className='flex-1 text-left'>
                                  <span className='font-medium text-sm'>
                                    {member.studentName}
                                  </span>
                                </div>
                                {isAssigned && (
                                  <CheckCircle2
                                    size={18}
                                    className='text-orangeFpt-500'
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

            {/* Risk Level */}
            <div className="lg:col-span-1">
              <h3 className='text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm'>
                <Flag size={18} className='text-gray-400' />
                Risk Level
              </h3>
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
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${risk.baseClass} ${
                      editableFields.riskLevel === risk.value
                        ? risk.activeClass
                        : 'opacity-70 hover:opacity-100'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                    type='button'
                  >
                    {risk.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="lg:col-span-1">
              <h3 className='text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm'>
                <Clock size={18} className='text-gray-400' />
                Due Date
              </h3>
              <div className='space-y-2'>
                <div className='relative w-full group'>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400 group-focus-within:text-orangeFpt-500 transition-colors" />
                  </div>
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
                    className='w-full pl-10 pr-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                </div>
                {editableFields.dueAt && (
                  <div className='flex items-center gap-2 text-xs text-gray-500 pl-1'>
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
                      <span className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${dueDateStatus.color}`}>
                        <dueDateStatus.icon size={12} />
                        {dueDateStatus.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className='text-gray-700 font-semibold mb-3 flex items-center gap-2 text-sm'>
              <AlignLeft size={18} className='text-gray-400' />
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
              className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 resize-none transition-all placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
              rows={6}
            />
          </div>

          {/* Tasks */}
          <div className='pt-6 border-t border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-gray-800 font-bold flex items-center gap-2 text-lg'>
                <ListChecks size={22} className='text-orangeFpt-500' />
                Tasks
              </h3>
              <button
                onClick={() => setIsOpenTask(true)}
                disabled={!isConnected}
                className='flex items-center gap-2 text-orangeFpt-600 bg-orangeFpt-50 hover:bg-orangeFpt-100 px-4 py-2 rounded-lg disabled:opacity-50 transition-colors text-sm font-semibold'
                type='button'
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>

            {/* Tasks list */}
            <div className='space-y-6'>
              {editedCard.tasks?.map(task => (
                <div
                  key={task.taskId}
                  className='bg-white border border-gray-200 shadow-sm p-5 rounded-xl hover:shadow-md transition-shadow duration-200'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <span className="text-gray-300 font-mono text-sm font-bold">#</span>
                      <span
                        className={`text-lg font-semibold text-gray-800 ${
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
                        className='text-gray-400 hover:text-orangeFpt-500 hover:bg-orangeFpt-50 p-2 rounded-lg transition-all'
                        title='Rename Task'
                      >
                        <Pencil size={18} />
                      </button>

                      {/* ✅ Delete Task - Modal */}
                      <button
                        onClick={() => setDeleteTaskModal({ isOpen: true, taskId: task.taskId })}
                        disabled={!isConnected}
                        className='text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all'
                        title='Delete Task'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className='mt-2 mb-4'>
                    <div className='flex justify-between text-xs font-medium text-gray-500 mb-1'>
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (task.subTaskDtos.filter(s => s.isDone).length /
                            task.subTaskDtos.length) *
                            100
                        ) || 0}
                        %
                      </span>
                    </div>
                    <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-orangeFpt-500 rounded-full transition-all duration-500 ease-out'
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
                  <div className='space-y-2 pl-2'>
                    {task.subTaskDtos?.map(sub => (
                      <div
                        key={sub.subTaskId}
                        className='flex items-center justify-between group/item'
                      >
                        <label className='flex items-center gap-3 flex-1 cursor-pointer bg-gray-50 rounded-lg px-3 py-2 border border-transparent hover:bg-white hover:border-orangeFpt-200 hover:shadow-sm transition-all'>
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
                            className='w-4 h-4 cursor-pointer rounded border-gray-300 text-orangeFpt-500 focus:ring-orangeFpt-500'
                          />
                          <span
                            className={`text-sm font-medium text-gray-700 ${
                              sub.isDone ? 'line-through opacity-50' : ''
                            }`}
                          >
                            {sub.subTaskTitle}
                          </span>
                        </label>

                        <div className='flex items-center gap-1 pl-2 opacity-0 group-hover/item:opacity-100 transition-opacity'>
                          {/* ✅ Rename Subtask - Modal */}
                          <button
                            onClick={() => setEditSubtaskModal({ 
                              isOpen: true, 
                              taskId: task.taskId, 
                              subTaskId: sub.subTaskId, 
                              title: sub.subTaskTitle 
                            })}
                            disabled={!isConnected}
                            className='text-gray-400 hover:text-orangeFpt-500 p-1.5 rounded transition-colors'
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
                            className='text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors'
                            title='Delete Subtask'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* ✅ Add Subtask - Modal */}
                    <button
                      className='mt-3 ml-1 text-xs text-orangeFpt-500 hover:text-orangeFpt-700 transition-colors flex items-center gap-1 font-bold uppercase tracking-wide px-2 py-1 hover:bg-orangeFpt-50 rounded'
                      onClick={() => setAddSubtaskModal({ isOpen: true, taskId: task.taskId })}
                      disabled={!isConnected}
                    >
                      <Plus size={12} /> Add subtask
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl font-medium transition-all'
            type='button'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !isConnected}
            className='px-8 py-2.5 bg-orangeFpt-500 hover:bg-orangeFpt-600 text-white rounded-xl font-bold shadow-lg shadow-orangeFpt-500/30 hover:shadow-orangeFpt-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
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
    </div>,
    document.body
  );
};

export default CardModal;