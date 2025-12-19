import React, { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getStatusColor, getDaysRemaining } from '../../../../utils/checkpointHelpers';
import CheckpointCardModal from './CheckpointCardModel';
import { getDetailOfCheckpointByCheckpointId } from '../../../../services/studentApi';

const CheckpointCard = ({
  checkpoint,
  readOnly = false,
  onEdit,
  onDelete,
  onUploadFiles,
  onMarkComplete,
  onDeleteSubmission,
  onAssign,
  milestoneStartDate,
  milestoneEndDate
}) => {
  const resolveUiStatus = (value) => {
    if (typeof value === 'string') return value.toLowerCase();
    if (value === 1) return 'completed';
    return 'processing';
  };

  const uiStatus = resolveUiStatus(checkpoint.uiStatus ?? checkpoint.statusString ?? checkpoint.status);
  const daysRemaining = getDaysRemaining(checkpoint.dueDate);
  const isOverdue = daysRemaining < 0 && uiStatus !== 'completed';
  const [localFiles, setLocalFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [checkpointDetail, setCheckpointDetail] = useState(null);

  const canEdit = uiStatus !== 'completed' && !readOnly;
  const canUpload = uiStatus !== 'completed' && !readOnly;
  const canAssign = uiStatus !== 'completed' && !readOnly;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    let isCancelled = false;
    const fetchDetail = async () => {
      setIsDetailLoading(true);
      setDetailError(null);
      setCheckpointDetail(null);

      try {
        const detail = await getDetailOfCheckpointByCheckpointId(checkpoint.id);
        console.log('Fetched checkpoint detail:', detail);
        if (!isCancelled) {
          setCheckpointDetail(detail);
        }
      } catch (error) {
        if (!isCancelled) {
          setDetailError('Unable to load checkpoint details. Please try again.');
        }
        console.error(`Error loading checkpoint detail ${checkpoint.id}:`, error);
      } finally {
        if (!isCancelled) {
          setIsDetailLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isCancelled = true;
    };
  }, [isModalOpen, checkpoint.id]);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
  const synchronizeDetailResult = (maybeDetail) => {
    if (maybeDetail && typeof maybeDetail === 'object') {
      setCheckpointDetail(maybeDetail);
    }
    return maybeDetail;
  };

  const handleUpload = async () => {
    if (submitDisabled || typeof onUploadFiles !== 'function') return;
    try {
      const detail = await onUploadFiles(checkpoint.id, localFiles);
      synchronizeDetailResult(detail);
    } catch (error) {
      console.error('Failed to upload checkpoint files', error);
    } finally {
      setLocalFiles([]);
    }
  };

  const handleAssignMembers = async (id, memberIds) => {
    if (typeof onAssign !== 'function') return null;
    const detail = await onAssign(id, memberIds);
    return synchronizeDetailResult(detail);
  };

  const handleUpdateCheckpoint = async (id, payload) => {
    if (typeof onEdit !== 'function') return null;
    const detail = await onEdit(id, payload);
    return synchronizeDetailResult(detail);
  };

  const handleMarkCompleteInternal = async (id) => {
    if (typeof onMarkComplete !== 'function') return null;
    const detail = await onMarkComplete(id);
    return synchronizeDetailResult(detail);
  };

  const handleDeleteSubmissionInternal = async (cpId, submissionId) => {
    if (typeof onDeleteSubmission !== 'function') return null;
    const detail = await onDeleteSubmission(cpId, submissionId);
    return synchronizeDetailResult(detail);
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition hover:shadow-lg"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for checkpoint ${checkpoint.title}`}
      >
        {/* Checkpoint Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{checkpoint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(isOverdue ? 'overdue' : uiStatus)}`}>
                  {isOverdue ? 'OVERDUE' : uiStatus.replace('-', ' ').toUpperCase()}
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${checkpoint.complexity === 'HIGH' ? 'border-red-300 text-red-700 bg-red-50' :
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
          </div>
        </div>
      </div>
      <CheckpointCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        detail={checkpointDetail}
        isLoading={isDetailLoading}
        error={detailError}
        fallbackTitle={checkpoint.title}
        fallbackCheckpoint={checkpoint}
        canUpload={canUpload}
        readOnly={readOnly}
        canEdit={canEdit}
        uiStatus={uiStatus}
        localFiles={localFiles}
        onSelectLocalFiles={handleFileSelect}
        onRemoveLocalFile={handleRemoveFile}
        onUploadLocalFiles={handleUpload}
        uploadDisabled={submitDisabled}
        onMarkComplete={handleMarkCompleteInternal}
        onDeleteSubmission={handleDeleteSubmissionInternal}
        canAssign={canAssign}
        onAssignMembers={handleAssignMembers}
        onUpdateCheckpoint={handleUpdateCheckpoint}
        canDelete={canEdit && typeof onDelete === 'function'}
        onDeleteCheckpoint={(id) => onDelete?.(id ?? checkpoint.id)}
        milestoneEndDate={milestoneEndDate}
        milestoneStartDate={milestoneStartDate}
      />
    </>
  );
};

export default CheckpointCard;
