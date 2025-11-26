import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createFullProject } from '../../services/projectApi';
import axios from 'axios';

// AWS Configuration - In a real app, use Pre-signed URLs!
// For this task, we assume we have credentials or a way to upload.
// Since we don't have the SDK installed, we'll use a placeholder for the actual S3 upload
// or assume the user will provide a way.
// Ideally: import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AI_API_BASE_URL = 'https://u8ls7dz738.execute-api.ap-southeast-1.amazonaws.com/dev';

const CreateProjectAI = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1); // 1: Upload, 2: Analyzing, 3: Review
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // Form State
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState([]);

  // Mock Auth & Subject (Replace with actual context)
  const lecturerId = 5; 
  const subjectId = 10;

  const onDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      handleUploadAndAnalyze(droppedFile);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const onFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      handleUploadAndAnalyze(selectedFile);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const uploadToS3 = async (file) => {
    // TODO: Implement actual S3 upload here.
    // Since we don't have the SDK or credentials in this context, 
    // we will simulate a successful upload for the UI flow.
    // In production: Use @aws-sdk/client-s3 or a pre-signed URL from backend.
    
    console.log('Uploading to S3...', file.name);
    return new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleUploadAndAnalyze = async (file) => {
    try {
      setPhase(2);
      setAnalyzing(true);

      // 1. Upload to S3
      await uploadToS3(file);
      
      // 2. Call Analyze API
      const fileKey = `uploads/${lecturerId}/${file.name}`;
      const response = await axios.post(`${AI_API_BASE_URL}/analyze`, {
        file_key: fileKey,
        bucket_name: 'collabsphere-uploads',
        lecturer_id: lecturerId,
        subject_id: subjectId
      });

      if (response.data && response.data.jobId) {
        setJobId(response.data.jobId);
        startPolling(response.data.jobId);
      } else {
        throw new Error('No job ID received');
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to start analysis. Please try again.');
      setPhase(1);
      setAnalyzing(false);
    }
  };

  const startPolling = (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${AI_API_BASE_URL}/jobs/${id}`);
        const { status, result } = response.data;

        if (status === 'COMPLETED') {
          clearInterval(interval);
          handleAnalysisComplete(result);
        } else if (status === 'FAILED') {
          clearInterval(interval);
          toast.error('AI Analysis failed. Please try another file.');
          setPhase(1);
          setAnalyzing(false);
        }
        // If PENDING or PROCESSING, continue polling
      } catch (error) {
        console.error('Polling error:', error);
        // Don't stop polling immediately on network error, maybe retry?
        // For now, we'll let it continue or user can cancel.
      }
    }, 5000);
    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const handleAnalysisComplete = (result) => {
    setAiResult(result);
    setProjectName(result.projectName || '');
    setDescription(result.description || '');
    setObjectives(result.objectives || []);
    setPhase(3);
    setAnalyzing(false);
    toast.success('Analysis Complete!');
  };

  const handleCreateProject = async () => {
    try {
      const payload = {
        projectName,
        description,
        objectives,
        lecturerId,
        subjectId
      };
      
      // Call existing backend API
      await createFullProject(payload);
      
      toast.success('Project created successfully!');
      navigate('/lecturer/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project.');
    }
  };

  // --- Render Helpers ---

  const renderUploadZone = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-[60vh]"
    >
      <div 
        className="w-full max-w-2xl p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-white/30 backdrop-blur-md hover:bg-white/40 transition-all cursor-pointer flex flex-col items-center text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
          <Upload size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Project Brief</h2>
        <p className="text-gray-600 mb-8">Drop your PDF here or click to browse. We'll generate the milestones for you.</p>
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          accept="application/pdf"
          onChange={onFileSelect}
        />
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Select File
        </button>
      </div>
    </motion.div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping opacity-25"></div>
        <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={40} className="text-blue-600 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Architect is working...</h2>
      <p className="text-gray-600">Analyzing your document structure and extracting milestones.</p>
      <p className="text-sm text-gray-400 mt-4">This usually takes about 40 seconds.</p>
    </div>
  );

  const renderArchitectView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-20"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Project Blueprint</h1>
          <p className="text-gray-600">Review and refine the AI-generated structure.</p>
        </div>
        <button 
          onClick={handleCreateProject}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-200"
        >
          Confirm & Create <CheckCircle size={20} />
        </button>
      </div>

      <div className="grid gap-6">
        {/* Basic Info Card */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white/50"
              />
            </div>
          </div>
        </div>

        {/* Objectives & Milestones */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Objectives & Milestones</h3>
          {objectives.map((obj, objIndex) => (
            <div key={objIndex} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-4">
                  <input 
                    type="text" 
                    value={obj.description}
                    onChange={(e) => {
                      const newObjs = [...objectives];
                      newObjs[objIndex].description = e.target.value;
                      setObjectives(newObjs);
                    }}
                    className="w-full text-lg font-semibold bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Objective Description"
                  />
                </div>
                <select 
                  value={obj.priority}
                  onChange={(e) => {
                    const newObjs = [...objectives];
                    newObjs[objIndex].priority = e.target.value;
                    setObjectives(newObjs);
                  }}
                  className={`text-sm font-medium px-3 py-1 rounded-full border-none outline-none cursor-pointer
                    ${obj.priority === 'High' ? 'bg-red-100 text-red-700' : 
                      obj.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <button 
                  onClick={() => {
                    const newObjs = objectives.filter((_, i) => i !== objIndex);
                    setObjectives(newObjs);
                  }}
                  className="ml-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Milestones List */}
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                {obj.milestones.map((ms, msIndex) => (
                  <div key={msIndex} className="flex items-center gap-4 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={ms.title}
                        onChange={(e) => {
                          const newObjs = [...objectives];
                          newObjs[objIndex].milestones[msIndex].title = e.target.value;
                          setObjectives(newObjs);
                        }}
                        className="w-full bg-transparent outline-none text-sm font-medium text-gray-700"
                        placeholder="Milestone Title"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-gray-400" />
                      <input 
                        type="date" 
                        value={ms.endDate ? ms.endDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const newObjs = [...objectives];
                          newObjs[objIndex].milestones[msIndex].endDate = e.target.value;
                          setObjectives(newObjs);
                        }}
                        className="bg-transparent outline-none text-xs text-gray-500 w-32"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const newObjs = [...objectives];
                        newObjs[objIndex].milestones = newObjs[objIndex].milestones.filter((_, i) => i !== msIndex);
                        setObjectives(newObjs);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newObjs = [...objectives];
                    newObjs[objIndex].milestones.push({ title: 'New Milestone', endDate: new Date().toISOString().split('T')[0] });
                    setObjectives(newObjs);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setObjectives([...objectives, { description: 'New Objective', priority: 'Medium', milestones: [] }])}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Objective
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/lecturer/projects')}>Projects</span>
          <ArrowRight size={14} />
          <span className="font-semibold text-blue-600">Create with AI</span>
        </div>

        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div key="upload" exit={{ opacity: 0, y: -20 }}>
              {renderUploadZone()}
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="analyzing" exit={{ opacity: 0, scale: 0.95 }}>
              {renderAnalyzing()}
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div key="architect">
              {renderArchitectView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateProjectAI;
