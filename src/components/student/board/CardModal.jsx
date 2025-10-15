import React, { useState, useRef, useEffect } from 'react';
import { X, Clock, User, AlignLeft, CheckCircle2, Circle, Calendar, Trash2, Upload, FileText, Image as ImageIcon, Download, Paperclip, Plus, Archive } from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';
import ProjectMemberPopover from '../../student/ProjectMemberPopover';

const CardModal = ({ card, listId, listTitle, onClose, onUpdate, onDelete, onArchive, members }) => {
  const [editedCard, setEditedCard] = useState({ 
    ...card,
    assignedMembers: card.assignedMembers || [],
    attachments: card.attachments || [],
    riskLevel: card.riskLevel || 'low',
    labels: card.labels || []
  });
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const fileInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const plusButtonRef = useRef(null);
  const memberMenuRef = useRef(null);

  const panelRef = useRef(null);
  useClickOutside(panelRef, onClose);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      id: `attachment-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      file: file
    }));

    setEditedCard({
      ...editedCard,
      attachments: [...(editedCard.attachments || []), ...newAttachments]
    });

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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  const isOverdue = editedCard.dueDate && new Date(editedCard.dueDate) < new Date() && !editedCard.isCompleted;

  const riskLevels = [
    { name: 'Low', value: 'low', bg: 'bg-green-500', hoverBg: 'hover:bg-green-600' },
    { name: 'Medium', value: 'medium', bg: 'bg-yellow-500', hoverBg: 'hover:bg-yellow-600' },
    { name: 'High', value: 'high', bg: 'bg-red-500', hoverBg: 'hover:bg-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div ref={panelRef} className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold text-2xl md:text-3xl">{listTitle}</h2>
            <div className="flex items-center gap-2">
              {/* Move Archive/Delete to header */}
              <button
                onClick={handleArchive}
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                type="button"
                title="Archive Card"
              >
                <Archive size={18} />
                Archive
              </button>
              <button
                onClick={handleDelete}
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                type="button"
                title="Delete Card"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button 
                onClick={onClose} 
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                type="button"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)] space-y-6">
          {/* Checkbox + Title */}
          <div className="flex items-start gap-3">
            <button
              onClick={toggleComplete}
              className="mt-1 transition-all duration-200 hover:scale-110"
              type="button"
            >
              {editedCard.isCompleted ? (
                <CheckCircle2 size={32} className="text-green-600" />
              ) : (
                <Circle size={32} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={editedCard.title}
                onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                className={`text-2xl font-bold text-gray-800 border-2 border-gray-200 focus:border-blue-500 focus:outline-none rounded-lg px-3 py-2 w-full ${
                  editedCard.isCompleted ? 'line-through opacity-70' : ''
                }`}
                placeholder="Card title..."
              />
            </div>
          </div>

          {/* Members and Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Members */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <User size={20} className="text-gray-600" />
                Members
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {editedCard.assignedMembers?.map((member) => (
                  <button
                    key={member.id}
                    onClick={(e) => handleMemberClick(member, e)}
                    className="relative group"
                    type="button"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-blue-400 transition-all object-cover"
                    />
                  </button>
                ))}
                <div className="relative">
                  <button
                    ref={plusButtonRef}
                    onClick={() => setShowMemberMenu(!showMemberMenu)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                    type="button"
                  >
                    <Plus size={20} className="text-gray-600" />
                  </button>

                  {/* Member Menu - anchored to plus icon */}
                  {showMemberMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-[60]"
                        onClick={() => setShowMemberMenu(false)}
                      />
                      <div 
                        ref={memberMenuRef}
                        className="fixed z-[70] w-80 bg-white rounded-xl shadow-2xl p-3 border border-gray-200"
                        style={getMemberMenuPosition()}
                      >
                        <h4 className="text-gray-800 font-semibold mb-3 px-2 flex items-center gap-2">
                          <User size={16} />
                          Select Members
                        </h4>
                        <div className="space-y-1">
                          {members.map((member) => {
                            const isAssigned = editedCard.assignedMembers?.some(m => m.id === member.id);
                            return (
                              <button
                                key={member.id}
                                onClick={() => toggleMember(member)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isAssigned 
                                    ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-200' 
                                    : 'hover:bg-gray-50'
                                }`}
                                type="button"
                              >
                                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full ring-2 ring-white shadow object-cover" />
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-800 font-medium text-sm">{member.name}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                      member.role === 'Leader' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {member.role}
                                    </span>
                                  </div>
                                </div>
                                {isAssigned && <CheckCircle2 size={18} className="text-blue-600" />}
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
              <h3 className="text-gray-800 font-semibold mb-3">Risk Level</h3>
              <div className="flex flex-wrap gap-2">
                {riskLevels.map((risk) => (
                  <button
                    key={risk.value}
                    onClick={() => setEditedCard({ ...editedCard, riskLevel: risk.value })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${risk.bg} ${
                      editedCard.riskLevel === risk.value
                        ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                        : 'opacity-50 hover:opacity-100 text-white'
                    }`}
                    type="button"
                  >
                    {risk.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details: Due Date (left) + Attachments (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <Clock size={20} className="text-gray-600" />
                Due Date
              </h3>
              <div className="space-y-2">
                <div className="w-full bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={editedCard.dueDate || ''}
                    onChange={(e) => setEditedCard({ ...editedCard, dueDate: e.target.value || null })}
                    className="flex-1 bg-transparent outline-none"
                  /> 
                </div>
                <div className="text-sm text-gray-600">
                  {editedCard.dueDate ? (
                    <span>
                      {new Date(editedCard.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span>No due date set</span>
                  )}
                  {editedCard.dueDate && !editedCard.isCompleted && isOverdue && (
                    <span className="ml-2 text-xs font-semibold bg-red-600 text-white px-2 py-0.5 rounded-full">
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <Paperclip size={20} className="text-gray-600" />
                Attachments
              </h3>

              {/* Upload button moved below the title */}
              <div className="mb-3">
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
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
                  type="button"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>

              {editedCard.attachments?.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
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
                          type="button"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Remove"
                          type="button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
              <AlignLeft size={20} className="text-gray-600" />
              Description
            </h3>
            <textarea
              value={editedCard.description || ''}
              onChange={(e) => setEditedCard({ ...editedCard, description: e.target.value })}
              placeholder="Add a more detailed description..."
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={6}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-all"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              type="button"
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
    </div>
  );
};

export default CardModal;