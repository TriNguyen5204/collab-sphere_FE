import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import MilestoneTimeline from '../../../components/student/milestone/MilestoneTimeline';
import MilestoneHeader from '../../../components/student/milestone/MilestoneHeader';
import MilestoneQuestions from '../../../components/student/milestone/MilestoneQuestions';
import CheckpointSummaryCards from '../../../components/student/checkpoint/CheckpointSummaryCards';
import CheckpointCard from '../../../components/student/checkpoint/CheckpointCard';
import CheckpointFormModal from '../../../components/student/checkpoint/CheckpointFormModal';
import FileUploadModal from '../../../components/student/checkpoint/FileUploadModal';
import { Plus, CheckSquare, Folder } from 'lucide-react';

const MilestonePage = () => {
  const { id, projectName } = useParams();
  
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: "Project Initialization",
      description: "Set up project repository, team structure, and initial documentation",
      dueDate: "2025-09-15",
      status: "completed",
      completedDate: "2025-09-14",
      completedBy: "Alice Johnson (Leader)",
      questions: [
        {
          id: 1,
          question: "What is your team's Git repository URL?",
          answer: "https://github.com/team-alpha/collab-sphere",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-12",
          type: "text"
        },
        {
          id: 2,
          question: "How many team members are actively participating?",
          answer: "4",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-12",
          type: "number"
        },
        {
          id: 3,
          question: "Have you completed the team roles assignment?",
          answer: "Yes",
          answeredBy: "Alice Johnson",
          answeredAt: "2025-09-13",
          type: "boolean"
        }
      ],
      progress: 100,
      requiredAnswers: 3,
      completedAnswers: 3,
      checkpoints: []
    },
    {
      id: 2,
      title: "Requirements & Design",
      description: "Complete system requirements analysis and design documentation",
      dueDate: "2025-09-30",
      status: "in-progress",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 4,
          question: "Describe your system architecture in detail",
          answer: "We are using a microservices architecture with React frontend, NestJS backend, and PostgreSQL database...",
          answeredBy: "Bob Smith",
          answeredAt: "2025-09-25",
          type: "textarea"
        },
        {
          id: 5,
          question: "What are the main functional requirements?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 6,
          question: "Have you created wireframes for all main screens?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "boolean"
        },
        {
          id: 7,
          question: "What design patterns will you implement?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "text"
        }
      ],
      progress: 25,
      requiredAnswers: 4,
      completedAnswers: 1,
      checkpoints: [
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
      ]
    },
    {
      id: 3,
      title: "Core Development Phase 1",
      description: "Implement basic functionality and database structure",
      dueDate: "2025-10-15",
      status: "pending",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 8,
          question: "What percentage of core features are implemented?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "number"
        },
        {
          id: 9,
          question: "Describe any technical challenges faced",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 10,
          question: "Have you implemented unit tests?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "boolean"
        }
      ],
      progress: 0,
      requiredAnswers: 3,
      completedAnswers: 0,
      checkpoints: []
    },
    {
      id: 4,
      title: "Integration & Testing",
      description: "Complete system integration and comprehensive testing",
      dueDate: "2025-10-30",
      status: "locked",
      completedDate: null,
      completedBy: null,
      questions: [
        {
          id: 11,
          question: "What types of testing have you performed?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "textarea"
        },
        {
          id: 12,
          question: "What is your test coverage percentage?",
          answer: "",
          answeredBy: null,
          answeredAt: null,
          type: "number"
        }
      ],
      progress: 0,
      requiredAnswers: 2,
      completedAnswers: 0,
      checkpoints: []
    }
  ]);

  const [selectedMilestone, setSelectedMilestone] = useState(milestones[1]);
  const [answers, setAnswers] = useState({});
  const [isLeader, setIsLeader] = useState(true);

  // Checkpoint state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [newCheckpoint, setNewCheckpoint] = useState({ title: '', description: '', dueDate: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Active folder tab state
  const [activeTab, setActiveTab] = useState('in-progress');
  const getDefaultTab = (cps = []) => {
    const inProgress = cps.filter(c => (c.status === 'in-progress' || c.status === 'pending')).length;
    const completed = cps.filter(c => c.status === 'completed').length;
    if (inProgress > 0) return 'in-progress';
    if (completed > 0) return 'completed';
    return 'in-progress';
  };
  useEffect(() => {
    // Reset active tab on milestone change
    setActiveTab(getDefaultTab(selectedMilestone?.checkpoints || []));
  }, [selectedMilestone]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSaveAnswer = (questionId) => {
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone.id) {
        const updatedQuestions = milestone.questions.map(q => {
          if (q.id === questionId) {
            const prev = Array.isArray(q.answers) ? q.answers : (q.answer ? [{
              content: q.answer,
              answeredBy: q.answeredBy,
              answeredAt: q.answeredAt
            }] : []);
            const newEntry = {
              content: answers[questionId] || '',
              answeredBy: 'Current User',
              answeredAt: new Date().toISOString()
            };
            return {
              ...q,
              answers: newEntry.content ? [...prev, newEntry] : prev,
              // keep old single-answer fields for backwards compatibility but do not use them going forward
            };
          }
          return q;
        });
        // completedAnswers: count questions with at least one answer entry
        const completedAnswers = updatedQuestions.filter(q => (Array.isArray(q.answers) ? q.answers.length > 0 : (q.answer && q.answer !== ""))).length;
        const progress = Math.round((completedAnswers / milestone.requiredAnswers) * 100);
        
        return {
          ...milestone,
          questions: updatedQuestions,
          completedAnswers,
          progress
        };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
    setAnswers({ ...answers, [questionId]: "" });
  };

  const handleCompleteMilestone = () => {
    if (!isLeader) {
      alert("Only team leader can mark milestones as complete");
      return;
    }
    
    if (selectedMilestone.completedAnswers < selectedMilestone.requiredAnswers) {
      alert("Please answer all questions before completing the milestone");
      return;
    }
    
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone.id) {
        return {
          ...milestone,
          status: "completed",
          completedDate: new Date().toISOString(),
          progress: 100
        };
      }
      return milestone;
    });
    
    setMilestones(updatedMilestones);
    setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
  };

  // Helpers to safely get checkpoints for the selected milestone
  const selectedCheckpoints = useMemo(() => selectedMilestone?.checkpoints || [], [selectedMilestone]);

  const isMilestoneReadOnly = useMemo(() => {
    const st = selectedMilestone?.status;
    return st === 'locked' || st === 'completed';
  }, [selectedMilestone]);

  const checkpointGroups = useMemo(() => {
    const byStatus = { 'in-progress': [], completed: [] };
    const toDate = (d) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);
    (selectedCheckpoints || []).forEach((cp) => {
      const key = cp.status === 'completed' ? 'completed' : 'in-progress';
      byStatus[key].push(cp);
    });
    Object.keys(byStatus).forEach((k) => byStatus[k].sort((a, b) => toDate(a.dueDate) - toDate(b.dueDate)));
    return byStatus;
  }, [selectedCheckpoints]);

  const checkpointProgress = useMemo(() => {
    const total = selectedCheckpoints.length;
    const completed = selectedCheckpoints.filter((c) => c.status === 'completed').length;
    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
  }, [selectedCheckpoints]);

  // Checkpoint handlers
  const handleCreateCheckpoint = () => {
    if (!newCheckpoint.title || !newCheckpoint.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot create new checkpoints.');
      return;
    }

    const checkpoint = {
      id: Date.now(),
      ...newCheckpoint,
      status: 'in-progress',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      submissions: [],
      comments: ''
    };

    const updated = milestones.map(m =>
      m.id === selectedMilestone.id
        ? { ...m, checkpoints: [...(m.checkpoints || []), checkpoint] }
        : m
    );
    setMilestones(updated);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
    setNewCheckpoint({ title: '', description: '', dueDate: '' });
    setShowCreateModal(false);
    setActiveTab('in-progress');
  };

  const handleUpdateCheckpoint = () => {
    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const updatedCps = (m.checkpoints || []).map(cp =>
        cp.id === selectedCheckpoint.id ? { ...cp, ...newCheckpoint } : cp
      );
      return { ...m, checkpoints: updatedCps };
    });
    setMilestones(updated);
    setShowEditModal(false);
    setSelectedCheckpoint(null);
    setNewCheckpoint({ title: '', description: '', dueDate: '' });
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const handleDeleteCheckpoint = (checkpointId) => {
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot delete checkpoints.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this checkpoint?')) {
      const updated = milestones.map(m =>
        m.id === selectedMilestone.id
          ? { ...m, checkpoints: (m.checkpoints || []).filter(cp => cp.id !== checkpointId) }
          : m
      );
      setMilestones(updated);
      setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUploadSubmission = () => {
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot upload submissions.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    const newSubmissions = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.name.split('.').pop().toLowerCase(),
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString()
    }));

    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const cps = (m.checkpoints || []).map(cp => {
        if (cp.id === selectedCheckpoint.id) {
          const updatedSubmissions = [...(cp.submissions || []), ...newSubmissions];
          return {
            ...cp,
            submissions: updatedSubmissions,
            status: cp.status === 'pending' ? 'in-progress' : cp.status
          };
        }
        return cp;
      });
      return { ...m, checkpoints: cps };
    });

    setMilestones(updated);
    setSelectedFiles([]);
    setShowUploadModal(false);
    setSelectedCheckpoint(null);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const handleDeleteSubmission = (checkpointId, submissionId) => {
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot delete submissions.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this file?')) {
      const updated = milestones.map(m => {
        if (m.id !== selectedMilestone.id) return m;
        const cps = (m.checkpoints || []).map(cp => {
          if (cp.id === checkpointId) {
            return { ...cp, submissions: (cp.submissions || []).filter(s => s.id !== submissionId) };
          }
          return cp;
        });
        return { ...m, checkpoints: cps };
      });
      setMilestones(updated);
      setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
    }
  };

  const handleMarkComplete = (checkpointId) => {
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot change checkpoint status.');
      return;
    }

    const cp = selectedCheckpoints.find(c => c.id === checkpointId);
    if (!cp || (cp.submissions || []).length === 0) {
      alert('Please upload at least one file before marking as complete');
      return;
    }

    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const cps = (m.checkpoints || []).map(c =>
        c.id === checkpointId ? { ...c, status: 'completed' } : c
      );
      return { ...m, checkpoints: cps };
    });
    setMilestones(updated);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const openEditModal = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setNewCheckpoint({ title: checkpoint.title, description: checkpoint.description, dueDate: checkpoint.dueDate });
    setShowEditModal(true);
  };

  const openUploadModal = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowUploadModal(true);
  };

  const resetCheckpointUI = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowUploadModal(false);
    setSelectedCheckpoint(null);
    setNewCheckpoint({ title: '', description: '', dueDate: '' });
    setSelectedFiles([]);
  };

  const closeModals = () => {
    resetCheckpointUI();
  };

  const handleSelectMilestone = (m) => {
    resetCheckpointUI();
    setSelectedMilestone(m);
    setActiveTab(getDefaultTab(m?.checkpoints || []));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar - Milestone Timeline */}
          <MilestoneTimeline
            milestones={milestones}
            selectedMilestone={selectedMilestone}
            onSelectMilestone={handleSelectMilestone}
          />

          {/* Main Content - Milestone Details */}
          <div className="lg:col-span-2 space-y-6">
            <MilestoneHeader
              milestone={selectedMilestone}
              isLeader={false}
              onComplete={handleCompleteMilestone}
            />

            

            {/* Checkpoints Section */}
            <section className="space-y-4 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">Checkpoints</h3>
                  <span className="text-sm text-gray-600">{checkpointProgress.completed}/{checkpointProgress.total} completed ({checkpointProgress.percent}%)</span>
                </div>
                {isLeader && !isMilestoneReadOnly && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={18} />
                    Create Checkpoint
                  </button>
                )}
              </div>

              {/* Info banner when milestone is completed/locked */}
              {isMilestoneReadOnly && (
                <div className={`rounded-md border px-4 py-3 ${selectedMilestone?.status === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  {selectedMilestone?.status === 'completed' ? (
                    <div className="text-sm">
                      This milestone has been marked complete by the lecturer. {checkpointGroups['in-progress'].length > 0 ? 'Remaining in-progress checkpoints are locked and kept as-is for record.' : 'All checkpoints are complete.'}
                    </div>
                  ) : (
                    <div className="text-sm">
                      This milestone is currently locked by the lecturer. Checkpoints cannot be created or modified.
                    </div>
                  )}
                </div>
              )}

              <CheckpointSummaryCards checkpoints={selectedCheckpoints.map(cp => cp.status === 'pending' ? { ...cp, status: 'in-progress' } : cp)} />

              <div className="space-y-4">
                {/* Folder Tabs */}
                <div className="flex items-center gap-3 border-b">
                  {[
                    { key: 'in-progress', label: 'In Progress', count: checkpointGroups['in-progress'].length, color: 'text-blue-700', badge: 'bg-blue-50 text-blue-700' },
                    { key: 'completed', label: 'Completed', count: checkpointGroups.completed.length, color: 'text-green-700', badge: 'bg-green-50 text-green-700' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-2 -mb-px border-b-2 ${
                        activeTab === tab.key ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Folder size={18} className={activeTab === tab.key ? 'text-blue-600' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${activeTab === tab.key ? 'text-blue-700' : 'text-gray-700'}`}>{tab.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tab.badge}`}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Active Tab Content */}
                <div className="space-y-3">
                  {(checkpointGroups[activeTab] || []).map((checkpoint) => (
                    <CheckpointCard
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      isLeader={isLeader}
                      readOnly={isMilestoneReadOnly || checkpoint.status === 'completed'}
                      onEdit={(cp) => !isMilestoneReadOnly && checkpoint.status !== 'completed' && openEditModal(cp)}
                      onDelete={(id) => !isMilestoneReadOnly && checkpoint.status !== 'completed' && handleDeleteCheckpoint(id)}
                      onUpload={(cp) => !isMilestoneReadOnly && checkpoint.status !== 'completed' && openUploadModal(cp)}
                      onMarkComplete={(id) => !isMilestoneReadOnly && checkpoint.status !== 'completed' && handleMarkComplete(id)}
                      onDeleteSubmission={(cpId, subId) => !isMilestoneReadOnly && checkpoint.status !== 'completed' && handleDeleteSubmission(cpId, subId)}
                    />
                  ))}
                </div>

                {selectedCheckpoints.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <CheckSquare className="mx-auto text-gray-300 mb-4" size={64} />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Checkpoints Yet</h4>
                    <p className="text-gray-600 mb-4">Create your first checkpoint for this milestone</p>
                    {isLeader && !isMilestoneReadOnly && (
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
            </section>
          </div>
        </div>
      </main>
      {/* Checkpoint Modals */}
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

export default MilestonePage;