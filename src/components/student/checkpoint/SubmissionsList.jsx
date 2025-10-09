import React from 'react';
import { Upload, Download, Eye, Trash2, FileText, Image as ImageIcon, Video, Archive, File } from 'lucide-react';
import { getFileIcon } from '../../../utils/checkpointHelpers';

const iconMap = {
  FileText: FileText,
  Image: ImageIcon,
  Video: Video,
  Archive: Archive,
  File: File
};

const SubmissionsList = ({ submissions, checkpointId, isCompleted, onDeleteSubmission }) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-gray-600">No submissions yet</p>
        <p className="text-sm text-gray-500 mt-1">Upload files to track your progress</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {submissions.map((submission) => {
        const iconInfo = getFileIcon(submission.fileType);
        const IconComponent = iconMap[iconInfo.name];
        
        return (
          <div key={submission.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <IconComponent className={iconInfo.color} size={24} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{submission.fileName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <span>{submission.fileSize}</span>
                <span className="text-gray-400">•</span>
                <span>{submission.uploadedBy}</span>
                <span className="text-gray-400">•</span>
                <span>{new Date(submission.uploadedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                title="Download"
              >
                <Download size={16} />
              </button>
              <button
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                title="Preview"
              >
                <Eye size={16} />
              </button>
              {!isCompleted && (
                <button
                  onClick={() => onDeleteSubmission(checkpointId, submission.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionsList;