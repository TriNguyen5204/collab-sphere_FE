import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  Sparkles,
  BrainCircuit,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { createProject } from '../../services/projectApi';
import { getAllSubject } from '../../services/userService';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

const AI_API_BASE_URL = 'https://u8ls7dz738.execute-api.ap-southeast-1.amazonaws.com/dev';

const PrioritySelector = ({ priority, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'High', label: 'High Priority', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    { value: 'Medium', label: 'Medium Priority', color: 'bg-orangeFpt-50 text-orangeFpt-700 border-orangeFpt-200', dot: 'bg-orangeFpt-500' },
    { value: 'Low', label: 'Low Priority', color: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500' }
  ];

  const currentOption = options.find(o => o.value === priority) || options[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border ${currentOption.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentOption.dot}`} />
        {currentOption.label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20"
          >
            <div className="p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-all
                    ${priority === opt.value ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateProjectAI = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Version Control State
  const [versions, setVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const { userId } = useSelector((state) => state.user);
  const lecturerId = userId;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const result = await getAllSubject();
        console.log("Loaded subjects:", result);
        const list = Array.isArray(result) ? result : (result.data || []);
        setSubjects(list);
      } catch (error) {
        toast.error("Failed to load subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      handleUploadAndAnalyze(droppedFile);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const onFileSelect = (e) => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      handleUploadAndAnalyze(selectedFile);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const handleUploadAndAnalyze = async (file) => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }
    try {
      setPhase(2);
      setAnalyzing(true);
      setProgressLogs([{ message: 'Initializing secure upload session...', timestamp: new Date() }]);

      const urlResponse = await axios.get(`${AI_API_BASE_URL}/upload-url`, {
        params: {
          fileName: file.name,
          fileType: file.type,
        },
      });

      const { uploadUrl, fileKey } = urlResponse.data;

      // 2. Upload to S3
      setProgressLogs(prev => [...prev, { message: 'Uploading document to secure storage...', timestamp: new Date() }]);
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      setProgressLogs(prev => [...prev, { message: 'Upload complete. Initiating AI analysis...', timestamp: new Date() }]);

      // 3. Analyze
      const analyzeResponse = await axios.post(`${AI_API_BASE_URL}/analyze`, {
        file_key: fileKey,
        bucket_name: 'collabsphere-uploads',
        lecturer_id: lecturerId,
        subject_id: parseInt(selectedSubjectId, 10),
      });

      if (analyzeResponse.data && analyzeResponse.data.jobId) {
        setJobId(analyzeResponse.data.jobId);
        setProgressLogs(prev => [...prev, { message: 'AI Architect is analyzing document structure...', timestamp: new Date() }]);
        startPolling(analyzeResponse.data.jobId);
      } else {
        throw new Error('No job ID received');
      }

    } catch (error) {
      console.error('Upload or Analysis failed:', error);
      toast.error('An error occurred. Please try again.');
      setPhase(1);
      setAnalyzing(false);
    }
  };

  const startPolling = (id) => {
    const startTime = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const interval = setInterval(async () => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        clearInterval(interval);
        toast.error('AI Analysis timed out. Please try uploading the file again.');
        setPhase(1);
        setAnalyzing(false);
        return;
      }

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
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const loadVersion = (versionData) => {
    setProjectName(versionData.projectName || '');
    setDescription(versionData.description || '');
    setObjectives(versionData.objectives || []);
  };

  const handleAnalysisComplete = (result) => {
    setProjectName(result.projectName || '');
    setDescription(result.description || '');
    setObjectives(result.objectives || []);
    console.log("AI Analysis Result:", result);
    
    const objectivesWithDates = (result.objectives || []).map(obj => {
      const milestonesWithDates = (obj.milestones || []).map(ms => {
        return {
          ...ms,
          startDate: ms.startDate || '',
          endDate: ms.endDate || '',
          matchedOutcomes: ms.matchedOutcomes || [],
          warnings: ms.warnings || null
        };
      });
      
      return {
        ...obj,
        milestones: milestonesWithDates
      };
    });

    const newVersion = {
        id: Date.now(),
        timestamp: new Date(),
        data: {
            ...result,
            objectives: objectivesWithDates
        },
        feedback: refineFeedback || 'Initial Analysis'
    };

    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionIndex(prev => versions.length); // Point to the new version (index = length of old array)
    
    setAiResult(result);
    loadVersion(newVersion.data);
    
    setPhase(3);
    setAnalyzing(false);
    toast.success('Analysis Complete!');
  };

  const handleRefine = async () => {
    if (!refineFeedback.trim()) {
        toast.error("Please enter feedback");
        return;
    }

    setIsRefining(true);

    try {
        const triggerResponse = await axios.post(`${AI_API_BASE_URL}/refine`, {
            jobId: jobId,
            feedback: refineFeedback
        });

        if (triggerResponse.status === 202) {
            toast.info("AI is thinking... This may take a minute.");
            setIsRefineModalOpen(false); 
            
            const startTime = Date.now();
            const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

            const pollInterval = setInterval(async () => {
                if (Date.now() - startTime > TIMEOUT_MS) {
                    clearInterval(pollInterval);
                    setIsRefining(false);
                    toast.error("AI Refinement timed out. Please try again.");
                    return;
                }

                try {
                    const statusRes = await axios.get(`${AI_API_BASE_URL}/jobs/${jobId}`);
                    const { status, result } = statusRes.data;

                    if (status === 'COMPLETED') {
                        clearInterval(pollInterval);
                        
                        handleAnalysisComplete(result);
                        
                        setRefineFeedback('');
                        setIsRefining(false);
                        toast.success("Refinement Complete!");
                    } 
                    else if (status === 'FAILED') {
                        clearInterval(pollInterval);
                        setIsRefining(false);
                        toast.error("AI Refinement Failed. Please try again.");
                    }
                    
                } catch (pollErr) {
                    console.error("Polling error:", pollErr);
                }
            }, 3000);
        }

    } catch (error) {
        console.error("Refine Request Error:", error);
        toast.error("Could not send refine request.");
        setIsRefining(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const subjectIdInt = parseInt(selectedSubjectId, 10);
      const lecturerIdInt = parseInt(lecturerId, 10);

      if (!selectedSubjectId || isNaN(subjectIdInt)) return toast.error("Invalid Subject ID.");
      if (!lecturerId || isNaN(lecturerIdInt)) return toast.error("Invalid Lecturer ID.");

      for (const obj of objectives) {
        for (const ms of obj.milestones) {
          if (!ms.startDate || !ms.endDate) return toast.error(`Set dates for milestone: "${ms.title}"`);

          const start = new Date(ms.startDate);
          const end = new Date(ms.endDate);
          const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

          if (diffDays < 2) return toast.error(`Milestone "${ms.title}" must be at least 2 days.`);
        }
      }

      const formattedObjectives = objectives.map(obj => ({
        description: obj.description,
        priority: obj.priority,
        objectiveMilestones: (obj.milestones || []).map(ms => ({
          title: ms.title,
          description: ms.description || ms.title,
          startDate: ms.startDate && ms.startDate.includes('T') ? ms.startDate.split('T')[0] : ms.startDate,
          endDate: ms.endDate && ms.endDate.includes('T') ? ms.endDate.split('T')[0] : ms.endDate
        }))
      }));

      const payload = {
        project: {
          projectName,
          description,
          lecturerId: lecturerIdInt,
          subjectId: subjectIdInt,
          objectives: formattedObjectives
        }
      };
      
      console.log("Creating Project Payload:", JSON.stringify(payload, null, 2));
      
      await createProject(payload);
      toast.success('Project created successfully!');
      navigate('/lecturer/projects');
    } catch (error) {
      toast.error('Failed to create project.');
    }
  };

  // --- Render Sections ---

  const renderUploadZone = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Subject Selector */}
      <div className="w-full max-w-md mb-8 relative z-10">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          Step 1: Select Subject
        </label>
        <div className="relative">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-3 pr-10 shadow-sm focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 outline-none transition-all cursor-pointer"
          >
            <option value="">-- Choose a Subject --</option>
            {subjects.map((sub) => (
              <option key={sub.id || sub.subjectId} value={sub.id || sub.subjectId}>
                {sub.subjectCode} - {sub.subjectName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={`relative w-full p-10 rounded-[32px] border-2 border-dashed transition-all duration-300 flex flex-col items-center text-center group
          ${!selectedSubjectId
            ? 'border-slate-200 bg-slate-50/50 opacity-50 cursor-not-allowed'
            : 'border-orangeFpt-200 bg-white hover:border-orangeFpt-400 hover:bg-orangeFpt-50/30 cursor-pointer hover:shadow-xl hover:shadow-orangeFpt-500/5'
          }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={!selectedSubjectId ? (e) => e.preventDefault() : onDrop}
        onClick={() => selectedSubjectId && document.getElementById('fileInput').click()}
      >
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg
          ${!selectedSubjectId ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-orangeFpt-100 to-amber-50 text-orangeFpt-600 shadow-orangeFpt-100'}`}>
          <UploadCloud size={40} strokeWidth={1.5} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Project Brief</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          {selectedSubjectId
            ? "Drag & drop your PDF syllabus or requirements document here. Our AI will extract milestones automatically."
            : "Please select a subject above to unlock the upload area."
          }
        </p>

        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept="application/pdf"
          onChange={onFileSelect}
          disabled={!selectedSubjectId}
        />

        <button
          disabled={!selectedSubjectId}
          className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg
          ${!selectedSubjectId
              ? 'bg-slate-100 text-slate-400 shadow-none'
              : 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white shadow-orangeFpt-200 hover:shadow-orangeFpt-300 hover:-translate-y-0.5'}`}
        >
          Select PDF File
        </button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto">
      <div className="relative mb-10">
        {/* Outer pulsing rings */}
        <div className="absolute inset-0 rounded-full border-4 border-orangeFpt-100 animate-[ping_3s_linear_infinite]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-orangeFpt-200 animate-[ping_3s_linear_infinite_0.5s]"></div>

        {/* Central Spinner */}
        <div className="relative w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
          <Loader2 size={40} className="text-orangeFpt-500 animate-spin" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Architect is Working</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Analyzing your document structure to generate optimal project milestones.
      </p>

      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-1">
        <div className="max-h-[200px] overflow-y-auto space-y-1 p-4 custom-scrollbar">
          {progressLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm animate-in slide-in-from-bottom-2 duration-300">
              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 
                   ${idx === progressLogs.length - 1 ? 'bg-orangeFpt-100 text-orangeFpt-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {idx === progressLogs.length - 1 ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
              </div>
              <span className={idx === progressLogs.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArchitectView = () => (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Sticky Header */}
      <div className="sticky top-4 z-20 mb-8 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="text-orangeFpt-500" size={24} />
            Project Blueprint
          </h1>
          <p className="text-xs text-slate-500">Review AI-generated structure</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsRefineModalOpen(true)}
            disabled={isRefining}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {isRefining ? 'Refining...' : 'Refine with AI'}
          </button>
          <button
            onClick={() => setPhase(1)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProject}
            className="px-6 py-2 bg-orangeFpt-500 text-white rounded-xl text-sm font-semibold hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-200 flex items-center gap-2"
          >
            <CheckCircle size={16} /> Confirm & Create
          </button>
        </div>
      </div>

      {/* Recommendation / Warning Block */}
      {aiResult && aiResult.recommendation && (
        <div className={`mb-8 p-6 rounded-2xl border ${
          aiResult.recommendation.toLowerCase().includes('violation') 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        } shadow-sm`}>
          <div className="flex items-start gap-3">
            {aiResult.recommendation.toLowerCase().includes('violation') ? (
              <AlertCircle className="mt-1 shrink-0" size={20} />
            ) : (
              <Sparkles className="mt-1 shrink-0" size={20} />
            )}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">
                {aiResult.recommendation.toLowerCase().includes('violation') 
                  ? 'Syllabus Compliance Warning' 
                  : 'AI Architect Recommendation'}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {aiResult.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version Control Bar */}
      {versions.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {versions.map((v, idx) => (
                <button
                    key={v.id}
                    onClick={() => {
                        setCurrentVersionIndex(idx);
                        loadVersion(v.data);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${currentVersionIndex === idx 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    <span>Version {idx + 1}</span>
                    {idx === 0 && <span className="opacity-60 font-normal">(Initial)</span>}
                    {idx === versions.length - 1 && versions.length > 1 && <span className="opacity-60 font-normal">(Latest)</span>}
                </button>
            ))}
            {isRefining && (
                <div className="px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100 flex items-center gap-2 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Generating Version {versions.length + 1}...
                </div>
            )}
        </div>
      )}

      <div className="grid gap-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FileText size={18} className="text-orangeFpt-500" /> Project Details
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject</label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium">
                  {subjects.find(s => String(s.id || s.subjectId) === String(selectedSubjectId))?.subjectCode || 'Unknown'}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 outline-none transition-all text-sm leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu size={20} className="text-orangeFpt-500" /> Objectives & Milestones
            </h3>
            <button
              onClick={() => setObjectives([...objectives, { description: 'New Objective', priority: 'Medium', milestones: [] }])}
              className="text-xs font-bold text-orangeFpt-600 hover:text-orangeFpt-700 flex items-center gap-1 bg-orangeFpt-50 px-3 py-1.5 rounded-lg hover:bg-orangeFpt-100 transition-colors"
            >
              <Plus size={14} /> Add Objective
            </button>
          </div>

          {objectives.map((obj, objIndex) => (
            <div key={objIndex} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              {/* Objective Header */}
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm shrink-0">
                  {objIndex + 1}
                </div>
                <div className="flex-1 grid gap-3">
                  <input
                    type="text"
                    value={obj.description}
                    onChange={(e) => {
                      const newObjs = [...objectives];
                      newObjs[objIndex].description = e.target.value;
                      setObjectives(newObjs);
                    }}
                    className="w-full text-base font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder-slate-300"
                    placeholder="Enter objective description..."
                  />
                  <div className="flex items-center gap-3">
                    <PrioritySelector
                      priority={obj.priority}
                      onChange={(value) => {
                        const newObjs = [...objectives];
                        newObjs[objIndex].priority = value;
                        setObjectives(newObjs);
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setObjectives(objectives.filter((_, i) => i !== objIndex))}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Milestones */}
              <div className="space-y-3 pl-4 md:pl-12">
                {obj.milestones.map((ms, msIndex) => {
                  const startDate = ms.startDate?.split('T')[0] || '';
                  const endDate = ms.endDate?.split('T')[0] || '';

                  // Date Validation Visuals
                  let dateError = null;
                  if (startDate && endDate) {
                    if (new Date(endDate) <= new Date(startDate)) dateError = "End date must be after start date";
                  }

                  return (
                    <div key={msIndex} className={`group flex flex-col gap-3 p-4 rounded-2xl border transition-all ${dateError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100 hover:border-orangeFpt-200 hover:bg-white'}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={ms.title}
                            onChange={(e) => {
                              const newObjs = [...objectives];
                              newObjs[objIndex].milestones[msIndex].title = e.target.value;
                              setObjectives(newObjs);
                            }}
                            className="w-full bg-transparent font-semibold text-sm text-slate-700 focus:outline-none placeholder-slate-400"
                            placeholder="Milestone Title"
                          />
                          <input
                            type="text"
                            value={ms.description || ''}
                            onChange={(e) => {
                              const newObjs = [...objectives];
                              newObjs[objIndex].milestones[msIndex].description = e.target.value;
                              setObjectives(newObjs);
                            }}
                            className="w-full bg-transparent text-xs text-slate-500 focus:outline-none placeholder-slate-300"
                            placeholder="Optional description..."
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 ml-1">Start</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => {
                                const newObjs = [...objectives];
                                newObjs[objIndex].milestones[msIndex].startDate = e.target.value;
                                setObjectives(newObjs);
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:border-orangeFpt-400 outline-none"
                            />
                          </div>
                          <div className="h-px w-2 bg-slate-300 mt-4"></div>
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 ml-1">End</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => {
                                const newObjs = [...objectives];
                                newObjs[objIndex].milestones[msIndex].endDate = e.target.value;
                                setObjectives(newObjs);
                              }}
                              className={`bg-white border rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none ${dateError ? 'border-red-300 text-red-600' : 'border-slate-200 focus:border-orangeFpt-400'}`}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newObjs = [...objectives];
                              newObjs[objIndex].milestones = newObjs[objIndex].milestones.filter((_, i) => i !== msIndex);
                              setObjectives(newObjs);
                            }}
                            className="ml-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-4"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {dateError && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12} /> {dateError}</p>}

                      {/* Display AI Warnings for specific milestone */}
                      {ms.warnings && ms.warnings !== "None" && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                          <AlertCircle size={12} />
                          <span className="font-medium">Compliance Alert: {ms.warnings}</span>
                        </div>
                      )}
                      
                      {/* Display Matched Outcomes */}
                      {ms.matchedOutcomes && ms.matchedOutcomes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ms.matchedOutcomes.map((outcome, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                              {outcome}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    const newObjs = [...objectives];
                    newObjs[objIndex].milestones.push({
                      title: 'New Milestone',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });
                    setObjectives(newObjs);
                  }}
                  className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-400 hover:text-orangeFpt-500 hover:border-orangeFpt-200 hover:bg-orangeFpt-50 transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
          {isRefineModalOpen && (
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)]"
                  >
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Refine Project Structure</h3>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                          Provide specific instructions to the AI Architect to adjust the timeline, objectives, or scope.
                      </p>
                      
                      <textarea
                          className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none min-h-[140px] resize-none transition-all text-sm"
                          placeholder="e.g., 'Add a QA phase before deployment', 'Extend the timeline by 2 weeks', 'Focus more on backend security'..."
                          value={refineFeedback}
                          onChange={(e) => setRefineFeedback(e.target.value)}
                          autoFocus
                      />
                      
                      <div className="flex justify-end gap-3 mt-8">
                          <button 
                              onClick={() => setIsRefineModalOpen(false)}
                              className="px-6 py-2.5 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleRefine}
                              disabled={isRefining}
                              className="px-8 py-2.5 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                          >
                              {isRefining ? 'Refining...' : 'Regenerate'}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );

  const breadcrumbItems = useMemo(() => [
    { label: "Project Library", href: "/lecturer/projects" },
    { label: "Create project with AI" },
  ], []);

  return (
    <DashboardLayout>
      <div className=" bg-slate-50/50 space-y-8 min-h-screen">

        {/* --- HERO HEADER --- */}
        {phase === 1 && (
          <div>
            <LecturerBreadcrumbs items={breadcrumbItems} />
            <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> AI Powered
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">AI Project Architect</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Upload a syllabus or brief, and let our AI structure a complete project plan with objectives and timelines in seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div key="upload" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {renderUploadZone()}
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="analyzing" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
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
    </DashboardLayout>
  );
};

export default CreateProjectAI;