import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Edit2, Trash2, Upload, CheckCircle, X, Users } from 'lucide-react';
import { getStatusColor, getDaysRemaining } from '../../../utils/checkpointHelpers';

const CheckpointCard = ({ 
  checkpoint, 
  readOnly = false,
  onEdit, 
  onDelete, 
  onUploadFiles, 
  onMarkComplete,
  onDeleteSubmission,
  onAssign
}) => {
  const uiStatus = checkpoint.uiStatus || checkpoint.status;
  const daysRemaining = getDaysRemaining(checkpoint.dueDate);
  const isOverdue = daysRemaining < 0 && uiStatus !== 'completed';
  const [localFiles, setLocalFiles] = useState([]);

  const canEdit = uiStatus !== 'completed' && !readOnly;
  const canUpload = uiStatus !== 'completed' && !readOnly;
  const canAssign = uiStatus !== 'completed' && !readOnly;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitDisabled = localFiles.length === 0;

  const handleUpload = () => {
    if (submitDisabled) return;
    onUploadFiles?.(checkpoint.id, localFiles);
    setLocalFiles([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Checkpoint Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{checkpoint.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(isOverdue ? 'overdue' : uiStatus)}`}>
                {isOverdue ? 'OVERDUE' : (uiStatus || '').replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{checkpoint.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Due: {new Date(checkpoint.dueDate).toLocaleDateString()}</span>
              </div>
              {uiStatus !== 'completed' && (
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span className={isOverdue ? "text-red-600 font-semibold" : daysRemaining <= 3 ? "text-orange-600" : ""}>
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  checkpoint.complexity === 'HIGH' ? 'border-red-300 text-red-700 bg-red-50' :
                  checkpoint.complexity === 'MEDIUM' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                  'border-green-300 text-green-700 bg-green-50'
                }`}>
                  {checkpoint.complexity || 'LOW'}
                </span>
              </div>
            </div>

            {/* Assignees */}
            {Array.isArray(checkpoint.assignments) && checkpoint.assignments.length > 0 && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Assignees:</span>{' '}
                <span>{checkpoint.assignments.map(a => a.fullname).filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Edit */}
            <button
              onClick={() => canEdit && onEdit(checkpoint)}
              disabled={!canEdit}
              title={
                readOnly ? 'Milestone is completed or evaluated' : (uiStatus === 'completed' ? 'Checkpoint is completed' : 'Edit checkpoint')
              }
              className={`p-2 rounded-lg transition ${canEdit ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              <Edit2 size={18} />
            </button>
            {/* Delete */}
            <button
              onClick={() => canEdit && onDelete(checkpoint.id)}
              disabled={!canEdit}
              title={
                readOnly ? 'Milestone is completed or evaluated' : (uiStatus === 'completed' ? 'Checkpoint is completed' : 'Delete checkpoint')
              }
              className={`p-2 rounded-lg transition ${canEdit ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              <Trash2 size={18} />
            </button>
            {/* Assign */}
            <button
              onClick={() => canAssign && onAssign?.(checkpoint)}
              disabled={!canAssign}
              title={
                readOnly ? 'Milestone is completed or evaluated' : (uiStatus === 'completed' ? 'Checkpoint is completed' : 'Assign members')
              }
              className={`p-2 rounded-lg transition ${canAssign ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              <Users size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Upload size={20} />
            Submissions ({checkpoint.submissions.length})
          </h4>
        </div>

        {/* Submit file section */}
        {canUpload && (
          <div className="mt-4 border-t pt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <input type="file" multiple onChange={handleFileSelect} id={`cp-file-input-${checkpoint.id}`} className="hidden" />
              <label htmlFor={`cp-file-input-${checkpoint.id}`} className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                Choose files to upload
              </label>
              <p className="text-xs text-gray-500 mt-1">or drag and drop files here</p>
            </div>

            {localFiles.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Files selected ({localFiles.length}):</h5>
                <ul className="space-y-2">
                  {localFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-600 hover:text-red-700 p-1"
                        aria-label="remove file"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={submitDisabled}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Upload ({localFiles.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mark Complete Button */}
        {uiStatus !== 'completed' && !readOnly && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => checkpoint.submissions.length > 0 && onMarkComplete(checkpoint.id)}
              disabled={checkpoint.submissions.length === 0}
              title={checkpoint.submissions.length === 0 ? 'Upload at least one file to mark complete' : 'Mark as Complete'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <CheckCircle size={20} />
              Mark as Complete
            </button>
          </div>
        )}

        {/* Comments Section */}
        {checkpoint.comments && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Note:</span> {checkpoint.comments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointCard;
