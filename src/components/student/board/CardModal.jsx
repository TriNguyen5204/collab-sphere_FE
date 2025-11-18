import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Clock,
  User,
  AlignLeft,
  CheckCircle2,
  Circle,
  Trash2,
  Image as ImageIcon,
  Plus,
  Archive,
  Pencil,
  PencilLine,
} from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';
import ProjectMemberPopover from '../../student/ProjectMemberPopover';
import TaskModal from './TaskModal';

const CardModal = ({
  card,
  listId,
  listTitle,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  members,
}) => {
  const [isOpenTask, setIsOpenTask] = useState(false);
  const [editedCard, setEditedCard] = useState({
    ...card,
    assignedMembers: card.assignedMembers || [],
    attachments: card.attachments || [],
    riskLevel: card.riskLevel || 'low',
    labels: card.labels || [],
  });
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);

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

  const handleSave = () => {
    onUpdate(listId, editedCard);
    onClose();
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

  const toggleComplete = () => {
    const updatedCard = { ...editedCard, isCompleted: !editedCard.isCompleted };
    setEditedCard(updatedCard);
    onUpdate(listId, updatedCard);
  };

  const toggleMember = member => {
    const assignedMembers = editedCard.assignedMembers || [];
    const isAssigned = assignedMembers.some(m => m.id === member.id);

    if (isAssigned) {
      setEditedCard({
        ...editedCard,
        assignedMembers: assignedMembers.filter(m => m.id !== member.id),
      });
    } else {
      setEditedCard({
        ...editedCard,
        assignedMembers: [...assignedMembers, member],
      });
    }
    setShowMemberMenu(false);
  };

  const handleMemberClick = (member, event) => {
    setSelectedMember(member);
    setPopoverAnchor(event.currentTarget);
  };

  const handleClosePopover = () => {
    setSelectedMember(null);
    setPopoverAnchor(null);
  };

  const isOverdue =
    editedCard.dueDate &&
    new Date(editedCard.dueDate) < new Date() &&
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
                    key={member.id}
                    onClick={e => handleMemberClick(member, e)}
                    className='relative group'
                    type='button'
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
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
                          {members.map(member => {
                            const isAssigned = editedCard.assignedMembers?.some(
                              m => m.id === member.id
                            );
                            return (
                              <button
                                key={member.id}
                                onClick={() => toggleMember(member)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isAssigned
                                    ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                                type='button'
                              >
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className='w-9 h-9 rounded-full ring-2 ring-white shadow object-cover'
                                />
                                <div className='flex-1 text-left'>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-gray-800 font-medium text-sm'>
                                      {member.name}
                                    </span>
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                        member.role === 'Leader'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {member.role}
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
            {/* Due Date */}
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
                    value={editedCard.dueDate || ''}
                    onChange={e =>
                      setEditedCard({
                        ...editedCard,
                        dueDate: e.target.value || null,
                      })
                    }
                    className='flex-1 bg-transparent outline-none'
                  />
                </div>
                <div className='text-sm text-gray-600'>
                  {editedCard.dueDate ? (
                    <span>
                      {new Date(editedCard.dueDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  ) : (
                    <span>No due date set</span>
                  )}
                  {editedCard.dueDate &&
                    !editedCard.isCompleted &&
                    isOverdue && (
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
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg'
                type='button'
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            {editedCard.tasks?.map(task => (
              <div
                key={task.id}
                className='bg-gray-800 text-white p-4 rounded-xl shadow'
              >
                {/* Task header */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={task.status}
                      onChange={() => {
                        const updated = {
                          ...editedCard,
                          tasks: editedCard.tasks.map(t =>
                            t.id === task.id ? { ...t, status: !t.status } : t
                          ),
                        };
                        setEditedCard(updated);
                      }}
                      className='w-5 h-5'
                    />

                    <span
                      className={`font-semibold text-lg ${task.status ? 'line-through opacity-60' : ''}`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* UPDATE TASK */}
                    <button
                      onClick={() => {
                        const name = prompt(
                          'Nhập tên mới cho task:',
                          task.title
                        );
                        if (!name) return;
                        const updated = {
                          ...editedCard,
                          tasks: editedCard.tasks.map(t =>
                            t.id === task.id ? { ...t, title: name } : t
                          ),
                        };
                        setEditedCard(updated);
                      }}
                      className='text-gray-300 hover:text-blue-400 px-2 py-1 rounded'
                      title='Update Task'
                    >
                      <Pencil size={18} />
                    </button>

                    {/* DELETE TASK */}
                    <button
                      onClick={() => {
                        const updated = {
                          ...editedCard,
                          tasks: editedCard.tasks.filter(t => t.id !== task.id),
                        };
                        setEditedCard(updated);
                      }}
                      className='text-gray-300 hover:text-red-400 px-2 py-1 rounded'
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
                      (task.subtasks.filter(s => s.status).length /
                        task.subtasks.length) *
                        100
                    ) || 0}
                    %
                  </div>
                  <div className='w-full h-1 bg-gray-700 rounded'>
                    <div
                      className='h-1 bg-blue-500 rounded'
                      style={{
                        width: `${
                          (task.subtasks.filter(s => s.status).length /
                            task.subtasks.length) *
                            100 || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {task.subtasks?.map(sub => (
                    <div
                      key={sub.id}
                      className='flex items-center justify-between pl-2'
                    >
                      <label className='flex items-center gap-3 flex-1'>
                        <input
                          type='checkbox'
                          checked={sub.status}
                          onChange={() => {
                            const updated = {
                              ...editedCard,
                              tasks: editedCard.tasks.map(t =>
                                t.id === task.id
                                  ? {
                                      ...t,
                                      subtasks: t.subtasks.map(s =>
                                        s.id === sub.id
                                          ? { ...s, status: !s.status }
                                          : s
                                      ),
                                    }
                                  : t
                              ),
                            };
                            setEditedCard(updated);
                          }}
                          className='w-4 h-4'
                        />
                        <span
                          className={`${sub.status ? 'line-through opacity-60' : ''}`}
                        >
                          {sub.title}
                        </span>
                      </label>

                      <div className='flex items-center gap-2 pr-2'>
                        {/* UPDATE SUBTASK */}
                        <button
                          onClick={() => {
                            const name = prompt(
                              'Nhập tên mới cho subtask:',
                              sub.title
                            );
                            if (!name) return;

                            const updated = {
                              ...editedCard,
                              tasks: editedCard.tasks.map(t =>
                                t.id === task.id
                                  ? {
                                      ...t,
                                      subtasks: t.subtasks.map(s =>
                                        s.id === sub.id
                                          ? { ...s, title: name }
                                          : s
                                      ),
                                    }
                                  : t
                              ),
                            };

                            setEditedCard(updated);
                          }}
                          className='text-gray-300 hover:text-blue-400 px-1 rounded'
                          title='Update Subtask'
                        >
                          <PencilLine size={16} />
                        </button>

                        {/* DELETE SUBTASK */}
                        <button
                          onClick={() => {
                            const updated = {
                              ...editedCard,
                              tasks: editedCard.tasks.map(t =>
                                t.id === task.id
                                  ? {
                                      ...t,
                                      subtasks: t.subtasks.filter(
                                        s => s.id !== sub.id
                                      ),
                                    }
                                  : t
                              ),
                            };
                            setEditedCard(updated);
                          }}
                          className='text-gray-300 hover:text-red-400 px-1 rounded'
                          title='Delete Subtask'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add subtask button */}
                  <button
                    className='mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm'
                    onClick={() => {
                      const name = prompt('Nhập tên subtask:');
                      if (!name) return;

                      const updated = {
                        ...editedCard,
                        tasks: editedCard.tasks.map(t =>
                          t.id === task.id
                            ? {
                                ...t,
                                subtasks: [
                                  ...t.subtasks,
                                  {
                                    id: crypto.randomUUID(),
                                    title: name,
                                    status: false,
                                  },
                                ],
                              }
                            : t
                        ),
                      };
                      setEditedCard(updated);
                    }}
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
              className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all'
              type='button'
            >
              Save Changes
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
        />
      )}
    </div>
  );
};

export default CardModal;
