import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import CheckpointSummaryCards from '../../../components/student/checkpoint/CheckpointSummaryCards';
import CheckpointCard from '../../../components/student/checkpoint/CheckpointCard';
import CheckpointFormModal from '../../../components/student/checkpoint/CheckpointFormModal';
import FileUploadModal from '../../../components/student/checkpoint/FileUploadModal';
import { Plus, CheckSquare } from 'lucide-react';

const CheckpointPage = () => {
  const { id, projectName } = useParams();
  
  const [checkpoints, setCheckpoints] = useState([
    {
      id: 1,
      title: "Initial Planning Document",
      description: "Submit project charter, WBS, and initial timeline",
      dueDate: "2025-09-20",
      status: "completed",
      createdBy: "Alice Johnson",
      createdAt: "2025-09-01",
      submissions: [
        {
          id: 1,
          fileName: "project-charter.pdf",
          fileSize: "2.5 MB",
          fileType: "pdf",
          uploadedBy: "Alice Johnson",
          uploadedAt: "2025-09-18T10:30:00",
        },
        {
          id: 2,
          fileName: "timeline.xlsx",
          fileSize: "1.2 MB",
          fileType: "xlsx",
          uploadedBy: "Bob Smith",
          uploadedAt: "2025-09-19T14:20:00",
        }
      ],
      comments: "All documents submitted on time. Great work!"
    },
    {
      id: 2,
      title: "Database Schema Design",
      description: "Complete ER diagram and database schema documentation",
      dueDate: "2025-10-05",
      status: "in-progress",
      createdBy: "Alice Johnson",
      createdAt: "2025-09-15",
      submissions: [
        {
          id: 3,
          fileName: "er-diagram.png",
          fileSize: "850 KB",
          fileType: "png",
          uploadedBy: "Charlie Brown",
          uploadedAt: "2025-10-01T09:15:00",
        }
      ],
      comments: ""
    },
    {
      id: 3,
      title: "API Documentation",
      description: "Document all REST API endpoints with request/response examples",
      dueDate: "2025-10-12",
      status: "pending",
      createdBy: "Alice Johnson",
      createdAt: "2025-09-25",
      submissions: [],
      comments: ""
    }
  ]);

  const [isLeader, setIsLeader] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [newCheckpoint, setNewCheckpoint] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleCreateCheckpoint = () => {
    if (!newCheckpoint.title || !newCheckpoint.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const checkpoint = {
      id: checkpoints.length + 1,
      ...newCheckpoint,
      status: "pending",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      submissions: [],
      comments: ""
    };

    setCheckpoints([...checkpoints, checkpoint]);
    setNewCheckpoint({ title: "", description: "", dueDate: "" });
    setShowCreateModal(false);
  };

  const handleUpdateCheckpoint = () => {
    const updatedCheckpoints = checkpoints.map(cp => 
      cp.id === selectedCheckpoint.id ? { ...cp, ...newCheckpoint } : cp
    );
    setCheckpoints(updatedCheckpoints);
    setShowEditModal(false);
    setSelectedCheckpoint(null);
    setNewCheckpoint({ title: "", description: "", dueDate: "" });
  };

  const handleDeleteCheckpoint = (checkpointId) => {
    if (window.confirm("Are you sure you want to delete this checkpoint?")) {
      setCheckpoints(checkpoints.filter(cp => cp.id !== checkpointId));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUploadSubmission = () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    const newSubmissions = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.name.split('.').pop().toLowerCase(),
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString()
    }));

    const updatedCheckpoints = checkpoints.map(cp => {
      if (cp.id === selectedCheckpoint.id) {
        const updatedSubmissions = [...cp.submissions, ...newSubmissions];
        return {
          ...cp,
          submissions: updatedSubmissions,
          status: cp.status === 'pending' ? 'in-progress' : cp.status
        };
      }
      return cp;
    });

    setCheckpoints(updatedCheckpoints);
    setSelectedFiles([]);
    setShowUploadModal(false);
    setSelectedCheckpoint(null);
  };

  const handleDeleteSubmission = (checkpointId, submissionId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const updatedCheckpoints = checkpoints.map(cp => {
        if (cp.id === checkpointId) {
          return {
            ...cp,
            submissions: cp.submissions.filter(s => s.id !== submissionId)
          };
        }
        return cp;
      });
      setCheckpoints(updatedCheckpoints);
    }
  };

  const handleMarkComplete = (checkpointId) => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (checkpoint.submissions.length === 0) {
      alert("Please upload at least one file before marking as complete");
      return;
    }

    const updatedCheckpoints = checkpoints.map(cp =>
      cp.id === checkpointId ? { ...cp, status: "completed" } : cp
    );
    setCheckpoints(updatedCheckpoints);
  };

  const openEditModal = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setNewCheckpoint({
      title: checkpoint.title,
      description: checkpoint.description,
      dueDate: checkpoint.dueDate
    });
    setShowEditModal(true);
  };

  const openUploadModal = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowUploadModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowUploadModal(false);
    setSelectedCheckpoint(null);
    setNewCheckpoint({ title: "", description: "", dueDate: "" });
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkpoints</h1>
            <p className="text-gray-600 mt-1">Manage team checkpoints and submissions</p>
          </div>
          {isLeader && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Create Checkpoint
            </button>
          )}
        </div>

        <CheckpointSummaryCards checkpoints={checkpoints} />

        {/* Checkpoints List */}
        <div className="space-y-4">
          {checkpoints.map((checkpoint) => (
            <CheckpointCard
              key={checkpoint.id}
              checkpoint={checkpoint}
              isLeader={isLeader}
              onEdit={openEditModal}
              onDelete={handleDeleteCheckpoint}
              onUpload={openUploadModal}
              onMarkComplete={handleMarkComplete}
              onDeleteSubmission={handleDeleteSubmission}
            />
          ))}

          {checkpoints.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CheckSquare className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Checkpoints Yet</h3>
              <p className="text-gray-600 mb-4">Create your first checkpoint to start tracking progress</p>
              {isLeader && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Checkpoint
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CheckpointFormModal
        isOpen={showCreateModal}
        title="Create Checkpoint"
        checkpoint={newCheckpoint}
        onChange={setNewCheckpoint}
        onSubmit={handleCreateCheckpoint}
        onClose={closeModals}
      />

      <CheckpointFormModal
        isOpen={showEditModal}
        title="Edit Checkpoint"
        checkpoint={newCheckpoint}
        onChange={setNewCheckpoint}
        onSubmit={handleUpdateCheckpoint}
        onClose={closeModals}
      />

      <FileUploadModal
        isOpen={showUploadModal}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUploadSubmission}
        onClose={closeModals}
      />
    </div>
  );
};

export default CheckpointPage;