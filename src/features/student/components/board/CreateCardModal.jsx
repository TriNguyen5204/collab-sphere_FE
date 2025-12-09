import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
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
} from 'lucide-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { useSignalRContext } from '../../../../context/kanban/useSignalRContext';
import { createCard } from '../../../../hooks/kanban/signalRHelper';
import { calculateNewPosition } from '../../../../utils/positionHelper';

const riskOptions = [
  { id: 'low', label: 'Low', color: 'bg-green-500' },
  { id: 'medium', label: 'Medium', color: 'bg-orange-500' },
  { id: 'high', label: 'High', color: 'bg-red-500' },
];

const CreateCardModal = ({
  isOpen,
  onClose,
  listId,
  workspaceId,
  members,
  list,
  onCardCreated,
  listTitle // Optional: pass this if you want it in the header
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
      setTasks([{ id: Date.now(), title: '', subtasks: [{ id: Date.now() + 1, title: '', done: false }] }]);
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

  const getAvatarUrl = member => {
    const avatarUrl = member?.avatarImg || member?.avatar;
    if (!avatarUrl || avatarUrl.includes('cloudinary') && avatarUrl.endsWith('upload')) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.studentName || 'User')}&background=random&color=fff&size=128`;
    }
    return avatarUrl;
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
      <div className='bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp'>
        
        {/* Header - Gradient like CardModal */}
        <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-white font-bold text-2xl md:text-3xl'>
              Create New Card {listTitle ? `in ${listTitle}` : ''}
            </h2>
            {!isConnected && (
              <span className='text-yellow-300 text-sm bg-yellow-900/30 px-2 py-1 rounded'>
                ⚠️ Offline
              </span>
            )}
            <button
              onClick={onClose}
              disabled={isCreating}
              className='text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all'
              type='button'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='p-6 overflow-y-auto max-h-[calc(95vh-180px)] space-y-6'>
          
          {/* Creating Indicator */}
          {isCreating && (
            <div className='bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 rounded-md'>
              <p className='font-semibold flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                Creating card...
              </p>
            </div>
          )}

          {/* Title Input */}
          <div className='flex items-start gap-3'>
             <Circle size={32} className='text-gray-300 mt-2' />
             <div className='flex-1'>
               <input
                 type='text'
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 disabled={isCreating}
                 className='text-2xl font-bold text-gray-800 border-2 border-gray-200 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 w-full placeholder-gray-400'
                 placeholder='Card title...'
                 autoFocus
               />
             </div>
          </div>

          {/* Grid: Members & Risk */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            
            {/* Members Section */}
            <div>
              <h3 className='text-gray-800 font-semibold mb-3 flex items-center gap-2'>
                <User size={20} className='text-gray-600' />
                Members
              </h3>
              <div className='flex items-center gap-2 flex-wrap'>
                {selectedMembers.map(member => (
                  <button
                    key={member.studentId}
                    onClick={() => toggleMember(member)}
                    className='relative group'
                    type='button'
                    title='Click to remove'
                  >
                    <img
                      src={getAvatarUrl(member)}
                      alt={member.studentName}
                      className='w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-red-400 transition-all object-cover'
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <X size={14} className="text-white" />
                    </div>
                  </button>
                ))}
                
                {/* Add Member Button */}
                <div className='relative'>
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    disabled={isCreating}
                    className='w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all disabled:opacity-50'
                    type='button'
                  >
                    <Plus size={20} className='text-gray-600' />
                  </button>

                  {/* Dropdown - Matching CardModal Style */}
                  {showMemberDropdown && (
                    <>
                      <div className='fixed inset-0 z-[60]' onClick={() => setShowMemberDropdown(false)} />
                      <div
                        ref={memberMenuRef}
                        className='fixed z-[70] w-80 bg-white rounded-xl shadow-2xl p-3 border border-gray-200'
                        style={getMemberMenuPosition()}
                      >
                         <h4 className='text-gray-800 font-semibold mb-3 px-2 flex items-center gap-2'>
                          <User size={16} /> Select Members
                        </h4>
                        <div className='space-y-1 max-h-[300px] overflow-y-auto'>
                          {members?.map(member => {
                            const isSelected = selectedMembers.some(m => m.studentId === member.studentId);
                            return (
                              <button
                                key={member.studentId}
                                onClick={() => toggleMember(member)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                                type='button'
                              >
                                <img
                                  src={getAvatarUrl(member)}
                                  alt={member.studentName}
                                  className='w-9 h-9 rounded-full object-cover'
                                />
                                <div className='flex-1 text-left'>
                                  <span className='text-gray-800 font-medium text-sm'>
                                    {member.studentName}
                                  </span>
                                </div>
                                {isSelected && <CheckCircle2 size={18} className='text-blue-600' />}
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
            <div>
              <h3 className='text-gray-800 font-semibold mb-3 flex items-center gap-2'>
                <Flag size={20} className='text-gray-600' />
                Risk Level
              </h3>
              <div className='flex flex-wrap gap-2'>
                {riskOptions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRisk(r.id)}
                    disabled={isCreating}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${r.color} ${
                      risk === r.id
                        ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                        : 'opacity-50 hover:opacity-100 text-white'
                    }`}
                    type='button'
                  >
                    {r.label}
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
              <div className='w-full bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2'>
                  <input
                    type='date'
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    disabled={isCreating}
                    className='flex-1 bg-transparent outline-none cursor-pointer'
                  />
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
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isCreating}
              placeholder='Add a more detailed description...'
              className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all'
              rows={4}
            />
          </div>

          {/* Tasks - UI Updated to Match CardModal (Dark Mode Cards) */}
          <div className='mt-4 space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-gray-800 font-semibold flex items-center gap-2'>
                <ListChecks size={20} className='text-gray-600' />
                Tasks
              </h3>
              <button
                onClick={() =>
                  setTasks([
                    ...tasks,
                    {
                      id: Date.now(),
                      title: '',
                      subtasks: [{ id: Date.now() + 1, title: '', done: false }],
                    },
                  ])
                }
                disabled={isCreating}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 transition-colors'
                type='button'
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            <div className='space-y-4'>
              {tasks.map((taskGroup, idx) => (
                <div key={taskGroup.id} className='bg-gray-800 text-white p-4 rounded-xl shadow'>
                  
                  {/* Task Header */}
                  <div className='flex items-center justify-between mb-3'>
                    <input
                        className='bg-transparent text-lg font-semibold text-white placeholder-gray-500 outline-none w-full mr-2'
                        placeholder={`Task Title ${idx + 1}...`}
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
                     <button
                        onClick={() => setTasks(tasks.filter(t => t.id !== taskGroup.id))}
                        className='text-gray-400 hover:text-red-400 p-1 transition-colors'
                        title='Remove Task'
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className='w-full h-px bg-gray-700 mb-3' />

                  {/* Subtasks */}
                  <div className='space-y-2'>
                    {taskGroup.subtasks.map(sub => (
                         <div key={sub.id} className='flex items-center justify-between pl-2 group'>
                            <div className='flex items-center gap-3 flex-1'>
                                <div className='w-4 h-4 border-2 border-gray-500 rounded-sm' />
                                <input 
                                    className='bg-transparent outline-none text-gray-200 placeholder-gray-500 w-full'
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
                                className='text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all px-2'
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
                        className='mt-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm text-gray-200 transition-colors flex items-center gap-1'
                    >
                        <Plus size={14} /> Add item
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={isCreating}
            className='px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-all'
            type='button'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isCreating || !isConnected || !title.trim()}
            className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            type='button'
          >
             {isCreating ? 'Creating...' : 'Create Card'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateCardModal;