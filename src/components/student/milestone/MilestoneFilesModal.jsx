import React from 'react';
import { FileText, Download, X } from 'lucide-react';

const MilestoneFilesModal = ({ isOpen, files = [], onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} /> Lecturer Files ({files.length})
          </h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {files.length === 0 ? (
            <p className="text-sm text-gray-600">No files available</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between border rounded-md p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-gray-500" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{f.name || (f.path ? f.path.split('/').pop() : 'File')}</p>
                      {f.type && <p className="text-xs text-gray-500 truncate">{f.type}</p>}
                    </div>
                  </div>
                  {f.path && (
                    <a
                      href={f.path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-50"
                    >
                      <Download size={14} /> Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneFilesModal;
