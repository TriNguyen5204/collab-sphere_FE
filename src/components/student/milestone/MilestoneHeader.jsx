import React, { useMemo, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Upload, Award, Download, FileText, ChevronDown, ChevronRight, X, ChevronUp } from 'lucide-react';
import { getStatusColor } from '../../../utils/milestoneHelpers';
import MilestoneFilesModal from './MilestoneFilesModal';
import MilestoneQuestions from './MilestoneQuestions';

const MilestoneHeader = ({
  milestone,
  onComplete,
  readOnly = false,
  answers = {},
  onAnswerChange = () => { },
  onSaveAnswer = () => { },
  onUploadMilestoneFiles = () => { }
}) => {
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);

  const questionCount = useMemo(() => Array.isArray(milestone?.questions) ? milestone.questions.length : 0, [milestone]);
  const canToggleQuestions = questionCount > 0;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (localFiles.length === 0) return;
    onUploadMilestoneFiles(localFiles);
    setLocalFiles([]);
  };

  const hasEvaluation = !!milestone?.evaluation;
  const hasMilestoneSubmission = Array.isArray(milestone?.returns) && milestone.returns.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{milestone.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(milestone.status)}`}>
              {milestone.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">{milestone.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600 mb-1">Start Date</p>
          <p className="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            {milestone.startDate ? new Date(milestone.startDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Due Date</p>
          <p className="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            {new Date(milestone.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Questions Completed</p>
          <p className="font-semibold flex items-center gap-2">
            <MessageSquare size={16} />
            {milestone.completedAnswers} / {milestone.requiredAnswers}
          </p>
        </div>
        <div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Files</p>

          </div>
          <button
            type="button"
            onClick={() => setShowFilesModal(true)}
            className="font-semibold flex items-center gap-2"
          >
            <FileText size={16} />
            {Array.isArray(milestone.lecturerFiles) ? milestone.lecturerFiles.length : 0} - <span className='underline'>View</span>
          </button>
        </div>
        {milestone.status === 'completed' && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Date</p>
              <p className="font-semibold text-green-600">
                {new Date(milestone.completedDate).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress Overview */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold">{milestone.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${milestone.progress < 30 ? 'bg-red-500' :
                milestone.progress < 70 ? 'bg-yellow-500' :
                  'bg-green-500'
              }`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t space-y-4">
        <MilestoneFilesModal
          isOpen={showFilesModal}
          files={milestone.lecturerFiles || []}
          onClose={() => setShowFilesModal(false)}
        />

        {/* Returns */}
        <section>
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Submissions ({Array.isArray(milestone.returns) ? milestone.returns.length : 0})
          </h4>
          {Array.isArray(milestone.returns) && milestone.returns.length > 0 ? (
            <div className="space-y-2">
              {milestone.returns.map((r) => (
                <div key={r.id} className="flex items-center justify-between border rounded-md p-2">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">{r.path?.split('/').pop() || 'Submission'}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.type}
                      {r.student?.name ? ` • ${r.student.name}` : ''}
                      {r.submittedAt ? ` • ${new Date(r.submittedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  {r.path && (
                    <a href={r.path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-50">
                      <Download size={14} /> View
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">None</p>
          )}

          {/* Submit file section */}
          {!readOnly && !hasEvaluation && (
            <div className="mt-3 border-t pt-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <input type="file" multiple onChange={handleFileSelect} id="mile-file-input" className="hidden" />
                <label htmlFor="mile-file-input" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Choose files to upload
                </label>
                <p className="text-xs text-gray-500 mt-1">or drag and drop files here</p>
              </div>

              {/* Files which have been selected */}
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
                      disabled={localFiles.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Upload ({localFiles.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Evaluation */}
        {milestone.evaluation && (
          <section className='mt-6 pt-6 border-t'>
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Award size={16} />
              Evaluation
            </h4>
            <div className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600">Score</p>
                  <p className="text-sm font-bold text-green-700">{milestone.evaluation.score}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Lecturer</p>
                  <p className="text-sm font-semibold">{milestone.evaluation.lecturer?.name} {milestone.evaluation.lecturer?.code ? `(${milestone.evaluation.lecturer.code})` : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="text-sm">{milestone.evaluation.createdDate ? new Date(milestone.evaluation.createdDate).toLocaleString() : ''}</p>
                </div>
              </div>
              {milestone.evaluation.comment && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">Comment</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{milestone.evaluation.comment}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>


      {/* Complete Milestone Button */}
      {!hasEvaluation && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onComplete}
            disabled={(milestone.completedAnswers < milestone.requiredAnswers) || !hasMilestoneSubmission}
            title={
              milestone.completedAnswers < milestone.requiredAnswers
                ? 'Answer all questions before completing this milestone'
                : (!hasMilestoneSubmission ? 'Upload at least one file to the milestone before marking as complete' : undefined)
            }
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            <CheckCircle size={20} />
            Mark Milestone as Complete
          </button>
          {(milestone.completedAnswers < milestone.requiredAnswers) && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Answer all questions before completing this milestone
            </p>
          )}
          {!(milestone.completedAnswers < milestone.requiredAnswers) && !hasMilestoneSubmission && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Upload at least one file to the milestone before marking as complete
            </p>
          )}
        </div>
      )}

      {/* Questions */}
        <section className="mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => canToggleQuestions && setShowQuestions((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded ${canToggleQuestions ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
          >
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} />
              Milestone Questions ({questionCount})
            </span>
            {canToggleQuestions && (showQuestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
          </button>
          {showQuestions && canToggleQuestions && (
            <div className="mt-3">
              <MilestoneQuestions
                milestone={milestone}
                answers={answers}
                onAnswerChange={onAnswerChange}
                onSaveAnswer={onSaveAnswer}
              />
            </div>
          )}
        </section>
    </div>
  );
};

export default MilestoneHeader;