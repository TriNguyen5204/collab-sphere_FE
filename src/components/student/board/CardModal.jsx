import React, { useState, useRef } from 'react';
import { X, Clock, User, Paperclip, AlignLeft, CheckCircle2, Circle, Calendar, Trash2, Upload, FileText, Image as ImageIcon, Download } from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';

const CardModal = ({ card, listId, onClose, onUpdate, onDelete, members }) => {
  const [editedCard, setEditedCard] = useState({ ...card });
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const fileInputRef = useRef(null);

  const panelRef = useRef(null);
  useClickOutside(panelRef, onClose);

  const memberMenuRef = useRef(null);
  useClickOutside(memberMenuRef, () => setShowMemberMenu(false));

  const handleSave = () => {
    onUpdate(listId, editedCard);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(listId, editedCard.id);
    }
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      id: `attachment-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      file: file // Store the actual file object
    }));

    setEditedCard({
      ...editedCard,
      attachments: [...(editedCard.attachments || []), ...newAttachments]
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setEditedCard({
      ...editedCard,
      attachments: editedCard.attachments.filter(a => a.id !== attachmentId)
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  const isOverdue = editedCard.dueDate && new Date(editedCard.dueDate) < new Date() && !editedCard.isCompleted;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div ref={panelRef} className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <button
                onClick={toggleComplete}
                className="mt-1 transition-all duration-200 hover:scale-110"
              >
                {editedCard.isCompleted ? (
                  <CheckCircle2 size={28} className="text-white" />
                ) : (
                  <Circle size={28} className="text-white/70 hover:text-white" />
                )}
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={editedCard.title}
                  onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                  className={`text-2xl font-bold bg-transparent text-white border-none focus:outline-none focus:bg-white/10 rounded-lg px-3 py-2 w-full placeholder-white/50 ${
                    editedCard.isCompleted ? 'line-through opacity-70' : ''
                  }`}
                  placeholder="Card title..."
                />
                <div className="mt-2 text-white/80 text-sm">
                  in list <span className="font-semibold">To Do</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex gap-6 p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Members Section */}
            {editedCard.assignedMembers && editedCard.assignedMembers.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Team Members ({editedCard.assignedMembers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editedCard.assignedMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full ring-2 ring-white shadow" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 truncate">{member.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                              member.role === 'Leader' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.tags?.map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleMember(member)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex-shrink-0"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <AlignLeft size={20} className="text-gray-600" />
                Description
              </h3>
              <textarea
                value={editedCard.description}
                onChange={(e) => setEditedCard({ ...editedCard, description: e.target.value })}
                placeholder="Add a more detailed description..."
                className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={6}
              />
            </div>

            {/* Due Date Display */}
            {editedCard.dueDate && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                editedCard.isCompleted
                  ? 'bg-green-50 border-green-200'
                  : isOverdue
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <Calendar size={20} className={
                  editedCard.isCompleted
                    ? 'text-green-600'
                    : isOverdue
                    ? 'text-red-600'
                    : 'text-blue-600'
                } />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-600">Due Date</div>
                  <div className={`font-semibold ${
                    editedCard.isCompleted
                      ? 'text-green-700'
                      : isOverdue
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {new Date(editedCard.dueDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                {editedCard.isCompleted && (
                  <CheckCircle2 size={24} className="text-green-600" />
                )}
                {isOverdue && (
                  <div className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-full">
                    OVERDUE
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            {editedCard.attachments?.length > 0 && (
              <div>
                <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                  <Paperclip size={20} className="text-gray-600" />
                  Attachments ({editedCard.attachments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editedCard.attachments.map((attachment) => (
                    <div key={attachment.id} className="bg-gray-50 hover:bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center gap-3 transition-colors border border-gray-200">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            // Handle download
                            if (attachment.file) {
                              const url = URL.createObjectURL(attachment.file);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = attachment.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 space-y-3 flex-shrink-0">
            <div className="text-sm font-semibold text-gray-500 mb-2">ADD TO CARD</div>
            
            {/* Members Button */}
            <div className="relative">
              <button
                onClick={() => setShowMemberMenu(!showMemberMenu)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-all shadow-sm hover:shadow"
              >
                <User size={18} />
                Members
              </button>

              {showMemberMenu && (
                <div ref={memberMenuRef} className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-10 p-3 border border-gray-200 animate-slideDown">
                  <h4 className="text-gray-800 font-semibold mb-3 px-2 flex items-center gap-2">
                    <User size={16} />
                    Select Members
                  </h4>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {members.map((member) => {
                      const isAssigned = editedCard.assignedMembers?.some(m => m.id === member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMember(member)}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isAssigned 
                              ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full ring-2 ring-white shadow" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-gray-800 font-medium text-sm truncate">{member.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                member.role === 'Leader' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {member.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {member.tags?.map((tag, idx) => (
                                <span key={idx} className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isAssigned && <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Due Date
              </label>
              <input
                type="date"
                value={editedCard.dueDate || ''}
                onChange={(e) => setEditedCard({ ...editedCard, dueDate: e.target.value })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Attachment */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-all shadow-sm hover:shadow"
              >
                <Upload size={18} />
                Attachment
              </button>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="text-sm font-semibold text-gray-500 mb-2">ACTIONS</div>
              <button
                onClick={handleDelete}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-all shadow-sm hover:shadow"
              >
                <Trash2 size={18} />
                Delete Card
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> to close
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;