import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlignLeft,
  ListChecks,
  CalendarDays,
  Users,
  Flag,
} from 'lucide-react';
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
}) => {
  const { connection, isConnected } = useSignalRContext();
  const [isCreating, setIsCreating] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

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
      // Prepare assignmentList
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

        // Check if date is valid
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

      // Prepare tasksOfCard
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
              isDone: false, // ✅ Luôn là false khi tạo mới
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

      // Call SignalR to create card
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

      // Reset form and close modal
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

  return (
    <div className='fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-2 py-8 overflow-auto'>
      <div className='w-full max-w-2xl bg-white p-6 rounded-xl shadow-xl relative'>
        {/* Close */}
        <button
          className='absolute top-4 right-4 hover:bg-gray-100 p-2 rounded-lg transition-colors'
          onClick={onClose}
          disabled={isCreating}
        >
          <X size={20} />
        </button>

        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Create New Card</h2>

        {/* Connection Status Warning */}
        {!isConnected && (
          <div className='mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md'>
            <p className='font-semibold'>⚠️ Not connected to server</p>
            <p className='text-sm'>Please wait for connection to restore.</p>
          </div>
        )}

        {/* Creating Indicator */}
        {isCreating && (
          <div className='mb-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 rounded-md'>
            <p className='font-semibold flex items-center gap-2'>
              <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
              Creating card...
            </p>
          </div>
        )}

        {/* Title */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Card Title <span className='text-red-500'>*</span>
          </label>
          <input
            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
            placeholder='Enter card title...'
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isCreating}
          />
        </div>

        {/* Description */}
        <div className='mb-6'>
          <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
            <AlignLeft size={18} />
            Description
          </label>
          <textarea
            className='w-full rounded-lg p-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[90px] transition-all'
            placeholder='Add a more detailed description...'
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Members */}
          <div>
            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <Users size={18} />
              Members
            </label>
            <div className='flex items-center gap-3 flex-wrap'>
              {selectedMembers.map(m => (
                <div key={m.studentId} className='relative group'>
                  <img
                    src={m.avatarImg}
                    alt={m.studentName}
                    className='w-10 h-10 rounded-full border-2 border-gray-200 shadow cursor-pointer hover:border-blue-400 transition-all object-cover'
                    title={m.studentName}
                    onClick={() => toggleMember(m)}
                  />
                  <button
                    onClick={() => toggleMember(m)}
                    className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add member button */}
              <div className='relative'>
                <button
                  onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                  disabled={isCreating}
                  className='w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all disabled:opacity-50'
                >
                  <Plus size={20} className='text-gray-600' />
                </button>

                {showMemberDropdown && (
                  <>
                    <div
                      className='fixed inset-0 z-40'
                      onClick={() => setShowMemberDropdown(false)}
                    />
                    <div className='absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 min-w-[280px] max-h-[300px] overflow-y-auto'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-2 px-2'>
                        Select Members
                      </h4>
                      {members?.map(m => (
                        <div
                          key={m.studentId}
                          className={`flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
                            selectedMembers.some(sm => sm.studentId === m.studentId)
                              ? 'bg-blue-50'
                              : ''
                          }`}
                          onClick={() => toggleMember(m)}
                        >
                          <img
                            src={m.avatarImg}
                            alt={m.studentName}
                            className='w-8 h-8 rounded-full object-cover'
                          />
                          <span className='text-sm flex-1'>{m.studentName}</span>
                          {selectedMembers.some(sm => sm.studentId === m.studentId) && (
                            <CheckCircle2 size={18} className='text-blue-600' />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <CalendarDays size={18} />
              Due Date
            </label>
            <input
              type='date'
              className='w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className='mb-6'>
          <label className=' text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
            <Flag size={18} />
            Risk Level
          </label>
          <div className='flex gap-3'>
            {riskOptions.map(r => (
              <button
                key={r.id}
                onClick={() => setRisk(r.id)}
                disabled={isCreating}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all
                  ${r.color} 
                  ${risk === r.id ? 'opacity-100 ring-2 ring-offset-2 ring-gray-400 scale-105' : 'opacity-60 hover:opacity-80'}
                  disabled:cursor-not-allowed
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
              <ListChecks size={18} />
              Tasks
            </label>
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
              className='px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 transition-colors'
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2'>
            {tasks.map(taskGroup => (
              <div
                key={taskGroup.id}
                className='bg-gray-50 p-4 rounded-lg border border-gray-200'
              >
                {/* Task Title + Remove Task */}
                <div className='flex items-center justify-between mb-3'>
                  <input
                    className='font-medium text-gray-800 outline-none bg-white border border-gray-300 rounded-lg px-3 py-2 w-full mr-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Task title...'
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
                    disabled={isCreating}
                  />

                  <button
                    onClick={() =>
                      setTasks(tasks.filter(t => t.id !== taskGroup.id))
                    }
                    disabled={isCreating}
                    className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50'
                    title='Remove task'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {taskGroup.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      className='flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200'
                    >
                      {/* ✅ Icon hiển thị nhưng KHÔNG cho phép toggle */}
                      <Circle className='text-gray-400' size={20} />

                      <input
                        className='flex-1 outline-none bg-transparent'
                        placeholder='Subtask...'
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
                        disabled={isCreating}
                      />

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
                        disabled={isCreating}
                        className='hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors disabled:opacity-50'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask */}
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
                  disabled={isCreating}
                  className='mt-3 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm flex items-center gap-1 transition-colors disabled:opacity-50'
                >
                  <Plus size={14} /> Add subtask
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200'>
          <button
            className='px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors'
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>

          <button
            className='px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'
            onClick={handleSave}
            disabled={isCreating || !isConnected || !title.trim()}
          >
            {isCreating ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Creating...
              </>
            ) : (
              'Create Card'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;