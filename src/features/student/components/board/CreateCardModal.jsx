import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useAvatar } from '../../../../hooks/useAvatar';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlignLeft,
  Clock,
  User,
  Flag,
  ListChecks,
  Calendar,
  Layout
} from 'lucide-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { useSignalRContext } from '../../../../context/kanban/useSignalRContext';
import { createCard } from '../../../../hooks/kanban/signalRHelper';
import { calculateNewPosition } from '../../../../utils/positionHelper';

const riskOptions = [
  { 
    id: 'low', 
    label: 'Low', 
    baseClass: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    activeClass: 'ring-2 ring-green-500 ring-offset-1 font-bold'
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    baseClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    activeClass: 'ring-2 ring-yellow-500 ring-offset-1 font-bold'
  },
  { 
    id: 'high', 
    label: 'High', 
    baseClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    activeClass: 'ring-2 ring-red-500 ring-offset-1 font-bold'
  },
];

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

const CreateCardModal = ({
  isOpen,
  onClose,
  listId,
  workspaceId,
  members,
  list,
  onCardCreated,
  listTitle,
}) => {
  const { connection, isConnected } = useSignalRContext();
  const [isCreating, setIsCreating] = useState(false);

  // Member Dropdown State
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const memberMenuRef = useRef(null);
  const plusButtonRef = useRef(null);

  useClickOutside(memberMenuRef, () => setShowMemberDropdown(false));

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([
    {
      id: Date.now(),
      title: '',
      subtasks: [{ id: Date.now() + 1, title: '', done: false }],
    },
  ]);
  const [risk, setRisk] = useState('medium');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const getMemberMenuPosition = () => {
    const rect = plusButtonRef.current?.getBoundingClientRect();
    if (!rect) return {};
    return { top: `${rect.bottom + 8}px`, left: `${rect.left}px` };
  };

  const toggleMember = member => {
    if (selectedMembers.some(m => m.studentId === member.studentId)) {
      setSelectedMembers(
        selectedMembers.filter(m => m.studentId !== member.studentId)
      );
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a card title');
      return;
    }

    if (!isConnected || !connection) {
      toast.error('Not connected to server! Please check your connection.');
      return;
    }

    setIsCreating(true);

    try {
      const existingCards = list?.cards || [];
      const sortedCards = [...existingCards].sort(
        (a, b) => a.position - b.position
      );

      const prevPosition =
        sortedCards.length > 0
          ? sortedCards[sortedCards.length - 1].position
          : null;
      const nextPosition = null;

      const newPosition = calculateNewPosition(prevPosition, nextPosition);
      const floatPosition = parseFloat(newPosition.toFixed(1));
      let formattedDueDate = null;

      if (dueDate) {
        const dateObj = new Date(dueDate);
        if (isNaN(dateObj.getTime())) {
          toast.error('Invalid due date format');
          setIsCreating(false);
          return;
        }
        formattedDueDate = dateObj.toISOString();
      }

      const assignmentList = selectedMembers.map(m => ({
        studentId: m.studentId,
        studentName: m.studentName,
      }));

      const tasksOfCard = tasks
        .filter(t => t.title.trim())
        .map((task, index) => ({
          taskTitle: task.title,
          taskOrder: index + 1,
          subTaskOfCard: task.subtasks
            .filter(st => st.title.trim())
            .map((subtask, subIndex) => ({
              subTaskTitle: subtask.title,
              subTaskOrder: subIndex + 1,
              isDone: false,
            })),
        }));

      const tempCardId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const newCardForUI = {
        id: tempCardId,
        title: title,
        description: description,
        riskLevel: risk,
        dueAt: formattedDueDate,
        position: floatPosition,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        assignedMembers: selectedMembers.map(m => ({
          studentId: m.studentId,
          studentName: m.studentName,
          avatarImg: m.avatarImg,
        })),
        tasks: tasksOfCard.map((task, idx) => ({
          taskId: `temp-task-${Date.now()}-${idx}`,
          taskTitle: task.taskTitle,
          isDone: false,
          subTaskDtos: task.subTaskOfCard.map((st, subIdx) => ({
            subTaskId: `temp-subtask-${Date.now()}-${idx}-${subIdx}`,
            subTaskTitle: st.SubTaskTitle,
            isDone: false,
          })),
        })),
      };

      if (onCardCreated) {
        onCardCreated(listId, newCardForUI);
      }

      await createCard(
        connection,
        workspaceId,
        parseInt(listId),
        title,
        description,
        risk,
        floatPosition,
        formattedDueDate || null,
        assignmentList,
        tasksOfCard
      );

      // Reset
      setTitle('');
      setDescription('');
      setTasks([
        {
          id: Date.now(),
          title: '',
          subtasks: [{ id: Date.now() + 1, title: '', done: false }],
        },
      ]);
      setRisk('medium');
      setSelectedMembers([]);
      setDueDate('');

      toast.success('Card created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return createPortal(
    <div 
      className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn'
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col border border-gray-100'>
        
        {/* Header - Brand Gradient */}
        <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 p-6 flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                   <Layout className="text-white" size={24} />
                </div>
                <div>
                    <h2 className='text-white font-bold text-2xl tracking-tight'>
                    Create New Card
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
                onClick={onClose}
                disabled={isCreating}
                className='text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200'
                type='button'
                >
                <X size={24} />
                </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-white'>
            {/* Creating Indicator */}
          {isCreating && (
            <div className='bg-orangeFpt-50 border border-orangeFpt-200 text-orangeFpt-700 p-4 rounded-xl flex items-center gap-3 animate-pulse'>
              <div className='w-5 h-5 border-2 border-orangeFpt-500 border-t-transparent rounded-full animate-spin' />
              <p className='font-medium'>Creating card on server...</p>
            </div>
          )}

          {/* Title Input */}
          <div className='space-y-2'>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1">Card Title</label>
            <div className='flex items-start gap-4 group'>
                <Circle size={24} className='text-gray-300 mt-3 group-focus-within:text-orangeFpt-500 transition-colors duration-300' />
                <div className='flex-1'>
                <input
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isCreating}
                    className='w-full text-2xl font-bold text-gray-800 border-b-2 border-gray-100 focus:border-orangeFpt-500 focus:outline-none px-2 py-2 placeholder-gray-300 transition-all duration-200 bg-transparent'
                    placeholder='Enter card title...'
                    autoFocus
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
                Assign Members
              </h3>
              <div className='flex items-center gap-2 flex-wrap min-h-[48px] p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors'>
                {selectedMembers.map(member => (
                  <button
                    key={member.studentId}
                    onClick={() => toggleMember(member)}
                    className='relative group transition-transform hover:scale-105'
                    type='button'
                    title='Click to remove'
                  >
                    <MemberAvatar member={member} size="w-10 h-10" className="ring-2 ring-white shadow-sm" />
                    <div className='absolute inset-0 bg-gray-900/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
                      <X size={14} className='text-white' />
                    </div>
                  </button>
                ))}

                {/* Add Member Button */}
                <div className='relative'>
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    disabled={isCreating}
                    className='w-10 h-10 rounded-full border border-dashed border-gray-300 hover:border-orangeFpt-500 hover:bg-orangeFpt-50 flex items-center justify-center transition-all disabled:opacity-50 text-gray-400 hover:text-orangeFpt-500 bg-white'
                    type='button'
                  >
                    <Plus size={18} />
                  </button>

                  {/* Dropdown - Clean White */}
                  {showMemberDropdown && (
                    <>
                      <div
                        className='fixed inset-0 z-[60]'
                        onClick={() => setShowMemberDropdown(false)}
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
                            const isSelected = selectedMembers.some(
                              m => m.studentId === member.studentId
                            );
                            return (
                              <button
                                key={member.studentId}
                                onClick={() => toggleMember(member)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-orangeFpt-50 text-orangeFpt-700'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                                type='button'
                              >
                                <MemberAvatar member={member} size="w-8 h-8" className={isSelected ? 'ring-2 ring-orangeFpt-200' : ''} />
                                <div className='flex-1 text-left'>
                                  <span className='font-medium text-sm'>
                                    {member.studentName}
                                  </span>
                                </div>
                                {isSelected && (
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
                {riskOptions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRisk(r.id)}
                    disabled={isCreating}
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${r.baseClass} ${
                      risk === r.id ? r.activeClass : 'opacity-70 hover:opacity-100'
                    }`}
                    type='button'
                  >
                    {r.label}
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
              <div className='relative w-full group'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400 group-focus-within:text-orangeFpt-500 transition-colors" />
                </div>
                <input
                  type='date'
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  disabled={isCreating}
                  className='w-full pl-10 pr-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all cursor-pointer'
                />
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
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isCreating}
              placeholder='Add a more detailed description...'
              className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 resize-none transition-all placeholder-gray-400'
              rows={3}
            />
          </div>

          {/* Tasks */}
          <div className='pt-6 border-t border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-gray-800 font-bold flex items-center gap-2 text-lg'>
                <ListChecks size={22} className='text-orangeFpt-500' />
                Tasks & Subtasks
              </h3>
              <button
                onClick={() =>
                  setTasks([
                    ...tasks,
                    {
                      id: Date.now(),
                      title: '',
                      subtasks: [
                        { id: Date.now() + 1, title: '', done: false },
                      ],
                    },
                  ])
                }
                disabled={isCreating}
                className='flex items-center gap-2 text-orangeFpt-600 bg-orangeFpt-50 hover:bg-orangeFpt-100 px-4 py-2 rounded-lg disabled:opacity-50 transition-colors text-sm font-semibold'
                type='button'
              >
                <Plus size={16} />
                Add Group
              </button>
            </div>

            <div className='space-y-6'>
              {tasks.map((taskGroup, idx) => (
                <div
                  key={taskGroup.id}
                  className='bg-white border border-gray-200 shadow-sm p-5 rounded-xl hover:shadow-md transition-shadow duration-200'
                >
                  {/* Task Header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className="flex-1 flex items-center gap-3">
                        <span className="text-gray-300 font-mono text-sm font-bold">#{idx + 1}</span>
                        <input
                        className='bg-transparent text-lg font-semibold text-gray-800 placeholder-gray-300 outline-none w-full border-b border-transparent focus:border-orangeFpt-300 transition-colors pb-1'
                        placeholder='Enter Task Group Title...'
                        value={taskGroup.title}
                        onChange={e =>
                            setTasks(
                            tasks.map(t =>
                                t.id === taskGroup.id
                                ? { ...t, title: e.target.value }
                                : t
                            )
                            )
                        }
                        />
                    </div>
                    <button
                      onClick={() =>
                        setTasks(tasks.filter(t => t.id !== taskGroup.id))
                      }
                      className='text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all ml-2'
                      title='Remove Task Group'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Subtasks */}
                  <div className='space-y-2 pl-2'>
                    {taskGroup.subtasks.map((sub, subIndex) => (
                      <div
                        key={sub.id}
                        className='flex items-center justify-between group/item'
                      >
                        <div className='flex items-center gap-3 flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:bg-white focus-within:border-orangeFpt-300 focus-within:ring-2 focus-within:ring-orangeFpt-500/10 transition-all'>
                          <div className='w-1.5 h-1.5 rounded-full bg-orangeFpt-300'></div>
                          <input
                            className='bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm font-medium'
                            placeholder='Subtask title...'
                            value={sub.title}
                            onChange={e =>
                              setTasks(
                                tasks.map(t =>
                                  t.id === taskGroup.id
                                    ? {
                                        ...t,
                                        subtasks: t.subtasks.map(s =>
                                          s.id === sub.id
                                            ? { ...s, title: e.target.value }
                                            : s
                                        ),
                                      }
                                    : t
                                )
                              )
                            }
                          />
                        </div>
                        <button
                          onClick={() =>
                            setTasks(
                              tasks.map(t =>
                                t.id === taskGroup.id
                                  ? {
                                      ...t,
                                      subtasks: t.subtasks.filter(
                                        s => s.id !== sub.id
                                      ),
                                    }
                                  : t
                              )
                            )
                          }
                          className='text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all px-2'
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {/* Add Subtask Button */}
                    <button
                      onClick={() =>
                        setTasks(
                          tasks.map(t =>
                            t.id === taskGroup.id
                              ? {
                                  ...t,
                                  subtasks: [
                                    ...t.subtasks,
                                    { id: Date.now(), title: '', done: false },
                                  ],
                                }
                              : t
                          )
                        )
                      }
                      className='mt-3 ml-1 text-xs text-orangeFpt-500 hover:text-orangeFpt-700 transition-colors flex items-center gap-1 font-bold uppercase tracking-wide px-2 py-1 hover:bg-orangeFpt-50 rounded'
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
            disabled={isCreating}
            className='px-6 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl font-medium transition-all'
            type='button'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isCreating || !isConnected || !title.trim()}
            className='px-8 py-2.5 bg-orangeFpt-500 hover:bg-orangeFpt-600 text-white rounded-xl font-bold shadow-lg shadow-orangeFpt-500/30 hover:shadow-orangeFpt-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2'
            type='button'
          >
            {isCreating ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateCardModal;