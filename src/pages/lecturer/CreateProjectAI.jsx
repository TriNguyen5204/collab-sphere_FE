import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Plus, Trash2, Calendar as CalendarIcon, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createProject } from '../../services/projectApi';
import { getAllSubject } from '../../services/userService';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

const AI_API_BASE_URL = 'https://u8ls7dz738.execute-api.ap-southeast-1.amazonaws.com/dev';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';


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
    { value: 'High', label: 'High Priority', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', hover: 'hover:bg-rose-100' },
    { value: 'Medium', label: 'Medium Priority', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', hover: 'hover:bg-amber-100' },
    { value: 'Low', label: 'Low Priority', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', hover: 'hover:bg-emerald-100' }
  ];

  const currentOption = options.find(o => o.value === priority) || options[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all border ${currentOption.color} ${currentOption.hover} shadow-sm active:scale-95`}
      >
        <span className={`w-2 h-2 rounded-full ${currentOption.dot} shadow-sm`} />
        {currentOption.label}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden z-20 ring-1 ring-black/5"
          >
            <div className="p-1.5 space-y-0.5">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-3 transition-all
                    ${priority === opt.value ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot} shadow-sm`} />
                  {opt.label}
                  {priority === opt.value && <CheckCircle size={14} className="ml-auto text-slate-400" />}
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

  const { userId } = useSelector((state) => state.user);
  const lecturerId = userId; 
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const result = await getAllSubject();
        console.log("Loaded subjects:", result);
        const list = Array.isArray(result) ? result : (result.data || []);
        setSubjects(list);
      } catch (error) {
        console.error("Failed to load subjects", error);
        toast.error("Failed to load subjects");
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

      setProgressLogs(prev => [...prev, { message: 'Uploading document to secure storage...', timestamp: new Date() }]);
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      setProgressLogs(prev => [...prev, { message: 'Upload complete. Initiating AI analysis...', timestamp: new Date() }]);

      const analyzeResponse = await axios.post(`${AI_API_BASE_URL}/analyze`, {
        file_key: fileKey,
        bucket_name: 'collabsphere-uploads',
        lecturer_id: lecturerId,
        subject_id: selectedSubjectId,
      });

      if (analyzeResponse.data && analyzeResponse.data.jobId) {
        setJobId(analyzeResponse.data.jobId);
        setProgressLogs(prev => [...prev, { message: 'AI Architect is analyzing document structure...', timestamp: new Date() }]);
        startPolling(analyzeResponse.data.jobId);
      } else {
        throw new Error('No job ID received from analysis endpoint');
      }

    } catch (error) {
      console.error('Upload or Analysis failed:', error);
      toast.error('An error occurred. Please try again.');
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
    console.log("AI Analysis Result:", result);
    
    let currentDate = new Date();
    
    const objectivesWithDates = (result.objectives || []).map(obj => {
      const milestonesWithDates = (obj.milestones || []).map(ms => {
        const start = new Date(currentDate);
        const startDateStr = start.toISOString().split('T')[0];
        
        const end = new Date(start);
        end.setDate(end.getDate() + 14);
        const endDateStr = end.toISOString().split('T')[0];
        
        currentDate = new Date(end);
        currentDate.setDate(currentDate.getDate() + 1);
        
        return {
          ...ms,
          startDate: startDateStr,
          endDate: endDateStr
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

      if (!selectedSubjectId || isNaN(subjectIdInt)) {
        toast.error("Invalid Subject ID. Please select a subject.");
        return;
      }
      if (!lecturerId || isNaN(lecturerIdInt)) {
        toast.error("Invalid Lecturer ID. Please login again.");
        return;
      }

      for (const obj of objectives) {
        for (const ms of obj.milestones) {
          if (!ms.startDate || !ms.endDate) {
            toast.error(`Please set Start and End dates for milestone: "${ms.title}"`);
            return;
          }
          
          const start = new Date(ms.startDate);
          const end = new Date(ms.endDate);
          const diffTime = end - start;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 2) {
            toast.error(`Milestone "${ms.title}" duration must be at least 2 days.`);
            return;
          }
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
      console.error('Failed to create project:', error);
      toast.error('Failed to create project.');
    }
  };

  const renderUploadZone = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
    >
      <div className="text-center space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold tracking-wider uppercase">
          <Sparkles size={14} />
          AI-Powered Creation
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Transform your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Project Brief</span> into Actionable Milestones
        </h1>
        <p className="text-lg text-slate-600">
          Upload your PDF course outline or project description. Our AI Architect will analyze the requirements and structure a complete project timeline for you.
        </p>
      </div>

      <div className={`w-full max-w-xl p-8 rounded-[32px] ${glassPanelClass} space-y-8`}>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Select Subject</label>
          <div className="relative">
            <select 
              value={selectedSubjectId}
              onChange={(e) => {
                console.log("Selected Subject ID:", e.target.value);
                setSelectedSubjectId(e.target.value);
              }}
              className="w-full appearance-none p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none transition-all cursor-pointer hover:bg-white/80"
            >
              <option value="">-- Choose a Subject --</option>
              {subjects.map((sub, index) => {
                const subId = sub.id || sub.subjectId;
                return (
                  <option key={subId || index} value={subId}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        <div 
          className={`relative w-full p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer flex flex-col items-center text-center group
            ${!selectedSubjectId 
              ? 'border-slate-200 bg-slate-50/50 opacity-60 pointer-events-none' 
              : 'border-indigo-200 bg-gradient-to-b from-white/50 to-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-lg
            ${!selectedSubjectId ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-sky-100 to-indigo-100 text-indigo-600 shadow-indigo-100'}`}>
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Project Brief</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Drag & drop your PDF here, or click to browse your files.</p>
          
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept="application/pdf"
            onChange={onFileSelect}
          />
          <button className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5
            ${!selectedSubjectId 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-indigo-200'}`}>
            Select PDF File
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-sky-100 rounded-full animate-ping opacity-25"></div>
        <div className="absolute inset-0 border-4 border-t-sky-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={40} className="text-sky-600 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Architect is working...</h2>
      
      <div className="w-full max-w-md flex flex-col items-center">
        <p className="text-slate-600 mb-4 text-center min-h-[24px]">
          {progressLogs.length > 0 ? progressLogs[progressLogs.length - 1].message : 'Initializing...'}
        </p>

        <div className="overflow-hidden w-full">
          <div className="flex flex-col gap-3 text-sm text-slate-500 items-start pl-8 border-l-2 border-slate-100 ml-8 py-2">
            {progressLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 relative">
                <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white
                  ${idx === progressLogs.length - 1 ? 'border-sky-500 text-sky-500' : 'border-emerald-500 text-emerald-500'}`}>
                  {idx === progressLogs.length - 1 ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
                </div>
                <span className={idx === progressLogs.length - 1 ? 'text-sky-700 font-medium' : 'text-slate-500'}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 mt-8 uppercase">Estimated time: 40s</p>
    </div>
  );

  const renderArchitectView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pb-20"
    >
      <div className={`flex items-center justify-between mb-8 p-6 rounded-3xl bg-gradient-to-r from-sky-50 via-white to-indigo-50 border border-indigo-100 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project Blueprint</h1>
          <p className="text-slate-600 mt-1">Review and refine the AI-generated structure.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsRefineModalOpen(true)}
                disabled={isRefining}
                className="px-8 py-3 rounded-full font-medium text-sm transition-all backdrop-blur-md bg-white/40 border border-white/60 text-slate-700 hover:bg-white/60 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRefining ? 'Refining...' : 'Refine with AI'}
            </button>

            {!isRefining && (
                <button 
                    onClick={handleCreateProject}
                    className="px-8 py-3 rounded-full font-medium text-sm text-white transition-all bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    Confirm & Create
                </button>
            )}
        </div>
      </div>

      {/* Version Control Bar */}
      {versions.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            {versions.map((v, idx) => (
                <button
                    key={v.id}
                    onClick={() => {
                        setCurrentVersionIndex(idx);
                        loadVersion(v.data);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                        ${currentVersionIndex === idx 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    Version {idx + 1}
                    {idx === 0 && ' (Initial)'}
                    {idx === versions.length - 1 && versions.length > 1 && ' (Latest)'}
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

      <div className="grid gap-6">
        <div className={`${glassPanelClass} p-6 rounded-2xl`}>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-6 flex items-center gap-2">
            <FileText size={16} className="text-sky-600" /> Basic Information
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <div className="relative">
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-white/70 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none transition-all cursor-pointer hover:bg-white/80"
                >
                  <option value="">-- Choose a Subject --</option>
                  {subjects.map((sub, index) => {
                    const subId = sub.id || sub.subjectId;
                    return (
                      <option key={subId || index} value={subId}>
                        {sub.subjectCode} - {sub.subjectName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white/70 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white/70 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 px-2">Objectives & Milestones</h3>
          {objectives.map((obj, objIndex) => (
            <div key={objIndex} className={`${glassPanelClass} p-6 rounded-2xl group hover:border-sky-100 transition-colors`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 mr-4">
                  <input 
                    type="text" 
                    value={obj.description}
                    onChange={(e) => {
                      const newObjs = [...objectives];
                      newObjs[objIndex].description = e.target.value;
                      setObjectives(newObjs);
                    }}
                    className="w-full text-lg font-semibold bg-transparent border-b-2 border-transparent focus:border-sky-500 focus:bg-sky-50/50 rounded-md px-3 py-1 transition-all outline-none text-slate-900 placeholder-slate-400"
                    placeholder="Objective Description"
                  />
                </div>
                <PrioritySelector 
                  priority={obj.priority}
                  onChange={(value) => {
                    const newObjs = [...objectives];
                    newObjs[objIndex].priority = value;
                    setObjectives(newObjs);
                  }}
                />
                <button 
                  onClick={() => {
                    const newObjs = objectives.filter((_, i) => i !== objIndex);
                    setObjectives(newObjs);
                  }}
                  className="ml-2 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                {obj.milestones.map((ms, msIndex) => {
                  const startDate = ms.startDate ? (ms.startDate.includes('T') ? ms.startDate.split('T')[0] : ms.startDate) : '';
                  const endDate = ms.endDate ? (ms.endDate.includes('T') ? ms.endDate.split('T')[0] : ms.endDate) : '';
                  
                  let dateError = null;
                  if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffTime = end - start;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 2) {
                      dateError = "Milestone's EndDate must be at least 2 days after StartDate.";
                    }
                  }

                  return (
                  <div key={msIndex} className="flex flex-col gap-2 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors border border-transparent hover:border-sky-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={ms.title}
                          onChange={(e) => {
                            const newObjs = [...objectives];
                            newObjs[objIndex].milestones[msIndex].title = e.target.value;
                            setObjectives(newObjs);
                          }}
                          className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-sky-200 rounded-md px-2 py-1 outline-none text-sm font-medium text-slate-700 placeholder-slate-400 transition-all"
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
                          className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-sky-200 rounded-md px-2 py-1 outline-none text-xs text-slate-500 placeholder-slate-300 mt-1 transition-all"
                          placeholder="Milestone Description"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border ${!startDate ? 'border-rose-300 bg-rose-50/30' : 'border-slate-100'}`}>
                          <span className={`text-xs font-medium ${!startDate ? 'text-rose-400' : 'text-slate-400'}`}>Start:</span>
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => {
                              const newObjs = [...objectives];
                              newObjs[objIndex].milestones[msIndex].startDate = e.target.value;
                              setObjectives(newObjs);
                            }}
                            className="bg-transparent outline-none text-xs text-slate-500 w-28"
                          />
                        </div>
                        <span className="text-slate-300">-</span>
                        <div className={`flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border ${dateError || !endDate ? 'border-rose-200 bg-rose-50' : 'border-slate-100'}`}>
                          <span className={`text-xs font-medium ${dateError || !endDate ? 'text-rose-400' : 'text-slate-400'}`}>End:</span>
                          <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => {
                              const newObjs = [...objectives];
                              newObjs[objIndex].milestones[msIndex].endDate = e.target.value;
                              setObjectives(newObjs);
                            }}
                            className={`bg-transparent outline-none text-xs w-28 ${dateError ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const newObjs = [...objectives];
                          newObjs[objIndex].milestones = newObjs[objIndex].milestones.filter((_, i) => i !== msIndex);
                          setObjectives(newObjs);
                        }}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {dateError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-500 pl-1">
                        <AlertCircle size={12} />
                        <span>{dateError}</span>
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
                  className="text-xs font-semibold tracking-wide text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg hover:bg-sky-50 w-fit transition-colors"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setObjectives([...objectives, { description: 'New Objective', priority: 'Medium', milestones: [] }])}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Objective
          </button>
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
                          className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none min-h-[140px] resize-none transition-all text-sm"
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
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-100px)]">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <span className="cursor-pointer hover:text-sky-600 transition-colors" onClick={() => navigate('/lecturer/projects')}>Projects</span>
          <ArrowRight size={14} />
          <span className="font-semibold text-sky-600">Create with AI</span>
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
    </DashboardLayout>
  );
};

export default CreateProjectAI;
