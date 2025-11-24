import React, { useState } from 'react';
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

const riskOptions = [
  { id: 'low', label: 'Low', color: 'bg-green-500' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { id: 'high', label: 'High', color: 'bg-red-500' },
];

const mockMembers = [
  { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' },
  { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3' },
];

const CardModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([
    {
      id: Date.now(),
      title: '',
      subtasks: [{ id: Date.now() + 1, title: '', done: false }],
    },
  ]);

  const [risk, setRisk] = useState('low');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;
  const toggleMember = member => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSave = () => {
    onSave({
      title,
      tasks,
      risk,
      members: selectedMembers,
      dueDate,
    });
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-2 py-8 overflow-auto'>
      <div className='w-full max-w-2xl bg-[#f4f5f7] p-6 rounded-xl shadow-xl relative'>
        {/* Close */}
        <button
          className='absolute top-4 right-4 hover:bg-gray-300/50 p-1 rounded'
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className='mb-6'>
          <div className='flex items-start gap-3'>
            <AlignLeft className='mt-1 text-gray-700' />
            <div className='flex-1'>
              <input
                className='text-xl font-semibold bg-transparent border-none outline-none w-full'
                placeholder='Card title...'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <p className='text-sm text-gray-600'>In list • Tasks</p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <Users className='text-gray-700' size={18} />
            <h3 className='font-medium'>Members</h3>
          </div>

          <div className='flex items-center gap-3 flex-wrap pl-8'>
            {selectedMembers.map(m => (
              <img
                key={m.id}
                src={m.avatar}
                className='w-8 h-8 rounded-full border-2 border-white shadow cursor-pointer'
                title={m.name}
                onClick={() => toggleMember(m)}
              />
            ))}

            {/* Add member dropdown */}
            <div className='relative group'>
              <button className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400'>
                <Plus size={18} />
              </button>

              <div className='absolute left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:block'>
                {mockMembers.map(m => (
                  <div
                    key={m.id}
                    className='flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded'
                    onClick={() => toggleMember(m)}
                  >
                    <img src={m.avatar} className='w-7 h-7 rounded-full' />
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <CalendarDays className='text-gray-700' size={18} />
            <h3 className='font-medium'>Due Date</h3>
          </div>

          <div className='pl-8'>
            <input
              type='date'
              className='px-3 py-2 rounded-md border border-gray-300 bg-white'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <Flag className='text-gray-700' size={18} />
            <h3 className='font-medium'>Risk Level</h3>
          </div>

          <div className='pl-8 flex gap-3'>
            {riskOptions.map(r => (
              <button
                key={r.id}
                onClick={() => setRisk(r.id)}
                className={`px-3 py-1.5 rounded-md text-white text-sm 
                  ${r.color} 
                  ${risk === r.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <AlignLeft size={18} className='text-gray-700' />
            <h3 className='font-medium'>Description</h3>
          </div>

          <textarea
            className='w-full rounded-md p-3 border border-gray-300 bg-white min-h-[90px]'
            placeholder='Add a more detailed description...'
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Checklist (Multiple Tasks + Subtasks) */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <ListChecks size={18} className='text-gray-700' />
              <h3 className='font-medium'>Tasks</h3>
            </div>

            {/* Add New Task Group */}
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
              className='px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1'
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className='space-y-4'>
            {tasks.map(taskGroup => (
              <div
                key={taskGroup.id}
                className='bg-white p-4 rounded-md border border-gray-300'
              >
                {/* Task Title + Remove Task */}
                <div className='flex items-center justify-between mb-3'>
                  <input
                    className='font-medium text-gray-700 outline-none bg-transparent border-b border-gray-300 pb-1 w-full mr-3'
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
                  />

                  {/* Remove Task Group */}
                  <button
                    onClick={() =>
                      setTasks(tasks.filter(t => t.id !== taskGroup.id))
                    }
                    className='text-red-500 hover:text-red-700'
                    title='Remove task group'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {taskGroup.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      className='flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-300'
                    >
                      {/* Toggle done */}
                      <button
                        onClick={() =>
                          setTasks(
                            tasks.map(t =>
                              t.id === taskGroup.id
                                ? {
                                    ...t,
                                    subtasks: t.subtasks.map(s =>
                                      s.id === sub.id
                                        ? { ...s, done: !s.done }
                                        : s
                                    ),
                                  }
                                : t
                            )
                          )
                        }
                      >
                        {sub.done ? (
                          <CheckCircle2 className='text-green-500' size={20} />
                        ) : (
                          <Circle className='text-gray-500' size={20} />
                        )}
                      </button>

                      {/* Subtask input */}
                      <input
                        className={`flex-1 outline-none bg-transparent ${
                          sub.done ? 'line-through text-gray-400' : ''
                        }`}
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
                      />

                      {/* Delete subtask */}
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
                        className='hover:text-red-500'
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
                  className='mt-3 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1'
                >
                  <Plus size={14} /> Add subtask
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            className='px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-sm'
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm'
            onClick={handleSave}
          >
            Create card
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
