import React from 'react';
import { X, Upload, FileText, Image as ImageIcon, Video, Archive, File } from 'lucide-react';
import { getFileIcon } from '../../../utils/checkpointHelpers';

const iconMap = {
  FileText: FileText,
  Image: ImageIcon,
  Video: Video,
  Archive: Archive,
  File: File
};

const FileUploadModal = ({ 
  isOpen, 
  selectedFiles, 
  onFileSelect, 
  onRemoveFile, 
  onUpload, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upload Submissions</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <input
              type="file"
              multiple
              onChange={onFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
            >
              Choose files to upload
            </label>
            <p className="text-sm text-gray-500 mt-2">or drag and drop files here</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Files:</h4>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const iconInfo = getFileIcon(file.name.split('.').pop());
                  const IconComponent = iconMap[iconInfo.name];
                  
                  return (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className={iconInfo.color} size={24} />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={selectedFiles.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;