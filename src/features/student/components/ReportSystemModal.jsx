import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Paperclip, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { postSystemReport } from '../../../services/userService';

const MAX_TITLE_LENGTH = 120;

const ReportSystemModal = ({ isOpen, onClose, userId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const trimmedContent = useMemo(() => content.trim(), [content]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      toast.error('Missing user context. Please sign in again.');
      return;
    }

    if (!trimmedTitle) {
      toast.error('Please add a title for your report.');
      return;
    }

    if (!trimmedContent) {
      toast.error('Please describe the issue you are facing.');
      return;
    }
    console.log('Submission: ',{ userId, title: trimmedTitle, content: trimmedContent, attachments });
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('Title', trimmedTitle);
    formData.append('Content', trimmedContent);
    attachments.forEach((file) => {
      if (file) {
        formData.append('Attachments', file);
      }
    });

    setIsSubmitting(true);
    try {
      await postSystemReport(formData);
      toast.success('Your report has been submitted. Thank you!');
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to submit system report.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Report a System Issue</h2>
            <p className="text-sm text-gray-500">Let us know what went wrong so we can fix it quickly.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close report modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => {
                const next = event.target.value;
                if (next.length <= MAX_TITLE_LENGTH) {
                  setTitle(next);
                }
              }}
              placeholder="Brief summary of the issue"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orangeFpt-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">{title.length}/{MAX_TITLE_LENGTH} characters</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Describe the problem, steps to reproduce, and any expected behavior."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-orangeFpt-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Upload size={16} />
                Add files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {attachments.length > 0 ? (
              <ul className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
                {attachments.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={16} className="text-gray-500" />
                      <span className="truncate" title={file.name}>{file.name}</span>
                      <span className="text-xs text-gray-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Optional: upload screenshots, logs, or other supporting files.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-orangeFpt-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportSystemModal;
