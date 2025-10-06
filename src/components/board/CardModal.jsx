import React, { useState, useRef } from 'react';
import { X, Clock, User, Paperclip, AlignLeft, CheckSquare } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const CardModal = ({ card, listId, onClose, onUpdate, availableMembers }) => {
  const [editedCard, setEditedCard] = useState({ ...card });
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // Close modal when clicking outside the panel
  const panelRef = useRef(null);
  useClickOutside(panelRef, onClose);

  // Close member menu when clicking outside the menu
  const memberMenuRef = useRef(null);
  useClickOutside(memberMenuRef, () => setShowMemberMenu(false));

  const handleSave = () => {
    onUpdate(listId, editedCard);
    onClose();
  };

  const toggleComplete = () => {
    setEditedCard({ ...editedCard, isCompleted: !editedCard.isCompleted });
  };

  const toggleMember = (member) => {
    const assignedMembers = editedCard.assignedMembers || [];
    const isAssigned = assignedMembers.some(m => m.id === member.id);
    
    if (isAssigned) {
      setEditedCard({
        ...editedCard,
        assignedMembers: assignedMembers.filter(m => m.id !== member.id)
      });
    } else {
      setEditedCard({
        ...editedCard,
        assignedMembers: [...assignedMembers, member]
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={panelRef} className="bg-gray-700 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <CheckSquare className="text-gray-400 mt-1" size={24} />
              <div className="flex-1">
                <input
                  type="text"
                  value={editedCard.title}
                  onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                  className="text-xl font-semibold bg-transparent text-white border-none focus:outline-none focus:bg-gray-600 rounded px-2 py-1 w-full"
                />
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Completion Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editedCard.isCompleted}
                onChange={toggleComplete}
                className="w-5 h-5 rounded"
              />
              <span className="text-white">Mark as complete</span>
            </div>

            {/* Members */}
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <User size={20} />
                Members
              </h3>
              <div className="flex flex-wrap gap-2">
                {editedCard.assignedMembers?.map((member) => (
                  <div key={member.id} className="bg-gray-600 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                      <span className="text-white">{member.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        member.role === 'Leader' ? 'bg-yellow-600' : 'bg-gray-500'
                      } text-white`}>
                        {member.role}
                      </span>
                      <button
                        onClick={() => toggleMember(member)}
                        className="ml-auto text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {/* Display project role tags */}
                    <div className="flex flex-wrap gap-1 ml-8">
                      {member.tags?.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlignLeft size={20} />
                Description
              </h3>
              <textarea
                value={editedCard.description}
                onChange={(e) => setEditedCard({ ...editedCard, description: e.target.value })}
                placeholder="Add a more detailed description..."
                className="w-full px-3 py-2 bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={5}
              />
            </div>

            {/* Attachments */}
            {editedCard.attachments?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Paperclip size={20} />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {editedCard.attachments.map((attachment, idx) => (
                    <div key={idx} className="bg-gray-600 text-white px-3 py-2 rounded">
                      {attachment.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Add to Card */}
          <div className="w-48 space-y-2">
            {/* Members Button */}
            <div className="relative">
              <button
                onClick={() => setShowMemberMenu(!showMemberMenu)}
                className="w-full bg-gray-600 hover:bg-gray-550 text-white px-3 py-2 rounded flex items-center gap-2"
              >
                <User size={16} />
                Members
              </button>

              {showMemberMenu && (
                <div ref={memberMenuRef} className="absolute top-full left-0 mt-1 w-64 bg-gray-600 rounded shadow-lg z-10 p-2">
                  <h4 className="text-white text-sm font-semibold mb-2 px-2">Select Members</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {availableMembers.map((member) => {
                      const isAssigned = editedCard.assignedMembers?.some(m => m.id === member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMember(member)}
                          className={`w-full flex items-start gap-2 px-2 py-2 rounded hover:bg-gray-500 ${
                            isAssigned ? 'bg-gray-500' : ''
                          }`}
                        >
                          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">{member.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                member.role === 'Leader' ? 'bg-yellow-600' : 'bg-gray-700'
                              } text-white`}>
                                {member.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.tags?.map((tag, idx) => (
                                <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isAssigned && <CheckSquare size={16} className="text-green-400 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <button
              className="w-full bg-gray-600 hover:bg-gray-550 text-white px-3 py-2 rounded flex items-center gap-2"
            >
              <Clock size={16} />
              Dates
            </button>

            <div>
              <input
                type="date"
                value={editedCard.dueDate || ''}
                onChange={(e) => setEditedCard({ ...editedCard, dueDate: e.target.value })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attachment */}
            <button
              className="w-full bg-gray-600 hover:bg-gray-550 text-white px-3 py-2 rounded flex items-center gap-2"
            >
              <Paperclip size={16} />
              Attachment
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;