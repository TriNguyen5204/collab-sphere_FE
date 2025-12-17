import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus,
  Minus,
  ChevronDown,
  Sparkles,
  BrainCircuit,
  Cpu,
  Briefcase,
  Users,
  Activity,
  Layers,
  Check,
  Globe,
  Link,
  Clock,
  X,
  Code2,
  Settings2,
  BookOpen,
  Target,
  BarChart3,
  CreditCard,
  GraduationCap,
  PanelRightClose
} from 'lucide-react';
import { toast } from 'sonner';
import { createProject } from '../../services/projectApi';
import { getAllSubject, getSyllabusBySubjectId } from '../../services/userService';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

import {
  AI_API_BASE_URL,
  STORAGE_KEYS,
  TOPIC_DOMAIN_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  useAIProjectForm,
  InfoTooltip,
  ComplexitySlider,
  TeamSizeSelector,
  TechStackSelector,
  AnalyzingScreen,
  IdeaSelectionScreen,
} from '../../features/lecturer/components/create-project-ai';

const CreateProjectAI = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  
  // Anti-spam: Lock button while generating
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Version Control State
  const [versions, setVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

  // Phase 2: AI Ideas State - Multi-select support
  const [aiIdeas, setAiIdeas] = useState([]);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState([]); // Changed to array for multi-select
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isCreatingProjects, setIsCreatingProjects] = useState(false);
  const [creatingIndex, setCreatingIndex] = useState(0);
  const [completedProjectIds, setCompletedProjectIds] = useState([]);

  // Project output state (Phase 3)
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Syllabus Panel State
  const [isSyllabusPanelOpen, setIsSyllabusPanelOpen] = useState(false);
  const [syllabusData, setSyllabusData] = useState(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  // Use custom hook for form state with localStorage persistence
  const {
    topicDomain,
    setTopicDomain,
    customTopicDomain,
    setCustomTopicDomain,
    industryContext,
    setIndustryContext,
    projectType,
    setProjectType,
    customProjectType,
    setCustomProjectType,
    complexity,
    setComplexity,
    teamSize,
    setTeamSize,
    durationWeeks,
    setDurationWeeks,
    referenceUrls,
    setReferenceUrls,
    requiredTechStack,
    setRequiredTechStack,
    optionalTechStack,
    setOptionalTechStack,
    selectedSubjectId,
    setSelectedSubjectId,
    actualTopicDomain,
    actualProjectType,
    mandatoryValidation,
    isConfigReady,
    addReferenceUrl,
    updateReferenceUrl,
    removeReferenceUrl,
    clearFormData,
    buildRequestPayload,
  } = useAIProjectForm();

  const { userId } = useSelector((state) => state.user);
  const lecturerId = userId;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const result = await getAllSubject();
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

  // Fetch syllabus when subject changes
  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!selectedSubjectId) {
        setSyllabusData(null);
        return;
      }
      
      try {
        setLoadingSyllabus(true);
        const result = await getSyllabusBySubjectId(selectedSubjectId);
        setSyllabusData(result);
      } catch (error) {
        console.error('Failed to load syllabus:', error);
        setSyllabusData(null);
      } finally {
        setLoadingSyllabus(false);
      }
    };
    
    fetchSyllabus();
  }, [selectedSubjectId]);

  // Load saved ideas from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem(STORAGE_KEYS.IDEAS);
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const savedPhase = localStorage.getItem(STORAGE_KEYS.PHASE);
    const savedSelectedIds = localStorage.getItem(STORAGE_KEYS.SELECTED_IDS);
    
    if (savedIdeas && savedPhase) {
      try {
        const parsedIdeas = JSON.parse(savedIdeas);
        const parsedPhase = parseInt(savedPhase, 10);
        
        if (parsedIdeas.length > 0 && parsedPhase === 2) {
          setAiIdeas(parsedIdeas);
          setPhase(2);
          
          // Restore selected IDs if available
          if (savedSelectedIds) {
            const parsedSelectedIds = JSON.parse(savedSelectedIds);
            setSelectedIdeaIds(parsedSelectedIds.filter(id => 
              parsedIdeas.some(idea => idea.id === id)
            ));
          }
          
          toast.info('Restored your previous AI-generated ideas');
        }
      } catch (e) {
        console.error('Failed to parse saved ideas:', e);
        localStorage.removeItem(STORAGE_KEYS.IDEAS);
        localStorage.removeItem(STORAGE_KEYS.CONFIG);
        localStorage.removeItem(STORAGE_KEYS.PHASE);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_IDS);
      }
    }
  }, []);

  // Save ideas and selected IDs to localStorage whenever they change
  useEffect(() => {
    if (aiIdeas.length > 0 && phase === 2) {
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(aiIdeas));
      localStorage.setItem(STORAGE_KEYS.PHASE, '2');
      localStorage.setItem(STORAGE_KEYS.SELECTED_IDS, JSON.stringify(selectedIdeaIds));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
        topicDomain: actualTopicDomain,
        teamSize,
        complexity,
        selectedSubjectId
      }));
    }
  }, [aiIdeas, phase, actualTopicDomain, teamSize, complexity, selectedSubjectId, selectedIdeaIds]);

  // Clear localStorage when moving to Phase 3 or back to Phase 1
  const clearSavedIdeas = () => {
    localStorage.removeItem(STORAGE_KEYS.IDEAS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.PHASE);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_IDS);
  };

  // Clear job persistence from localStorage
  const clearJobPersistence = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_JOB_ID);
    localStorage.removeItem(STORAGE_KEYS.JOB_STATUS);
    localStorage.removeItem(STORAGE_KEYS.JOB_START_TIME);
    setIsGenerating(false);
  };

  // Save job to localStorage for persistence (resume after refresh)
  const saveJobPersistence = (newJobId) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_JOB_ID, newJobId);
    localStorage.setItem(STORAGE_KEYS.JOB_STATUS, 'PROCESSING');
    localStorage.setItem(STORAGE_KEYS.JOB_START_TIME, Date.now().toString());
  };

  // Resume polling for existing job on page load/refresh
  // Use a ref to track if resume has already been attempted to prevent double execution
  const resumeAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Prevent double execution (React 18 strict mode or re-renders)
    if (resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;
    
    const savedJobId = localStorage.getItem(STORAGE_KEYS.CURRENT_JOB_ID);
    const savedJobStatus = localStorage.getItem(STORAGE_KEYS.JOB_STATUS);
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.JOB_START_TIME);
    
    if (savedJobId && savedJobStatus === 'PROCESSING') {
      const startTime = parseInt(savedStartTime, 10) || Date.now();
      const elapsed = Date.now() - startTime;
      const TIMEOUT_MS = 5.5 * 60 * 1000; // 5 minutes 30 seconds (match polling timeout)
      
      // Check if job hasn't timed out
      if (elapsed < TIMEOUT_MS) {
        toast.info('Resuming AI generation from previous session...');
        setJobId(savedJobId);
        setPhase(2);
        setAnalyzing(true);
        setIsGenerating(true);
        startPolling(savedJobId, startTime); // Pass original start time
      } else {
        // Job timed out while page was closed
        clearJobPersistence();
        toast.warning('Previous generation session expired. Please try again.');
      }
    }
  }, []);

  // Handle AI Project Generation (replaces file upload)
  const handleGenerateProject = async () => {
    // Anti-spam: Block if already generating
    if (isGenerating || analyzing) {
      toast.warning('Please wait, generation is in progress...');
      return;
    }
    
    if (!isConfigReady) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Clear any existing polling interval before starting new generation
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Clear any previous job persistence to prevent duplicate jobs
    clearJobPersistence();

    try {
      setIsGenerating(true); // Lock button
      setPhase(2);
      setAnalyzing(true);
      setProgressLogs([{ message: 'Initializing AI project generation...', timestamp: new Date() }]);
      const requestPayload = buildRequestPayload(lecturerId);

      setProgressLogs(prev => [...prev, { message: 'Sending configuration to AI Architect...', timestamp: new Date() }]);

      const analyzeResponse = await axios.post(`${AI_API_BASE_URL}/analyze`, requestPayload);

      if (analyzeResponse.data && analyzeResponse.data.jobId) {
        const newJobId = analyzeResponse.data.jobId;
        setJobId(newJobId);
        
        // Persist job for resume after refresh
        saveJobPersistence(newJobId);
        
        setProgressLogs(prev => [...prev, { message: 'AI Architect is designing your project...', timestamp: new Date() }]);
        startPolling(newJobId);
      } else {
        throw new Error('No job ID received');
      }

    } catch (error) {
      console.error('AI Generation failed:', error);
      // Show exact error from API response if available
      const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
      toast.error(errorMessage);
      setPhase(1);
      setAnalyzing(false);
      setIsGenerating(false); // Unlock button on error
      clearJobPersistence();
    }
  };

  const startPolling = (id, resumeStartTime = null) => {
    // Clear any existing polling interval before starting new one
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const startTime = resumeStartTime || Date.now();
    const TIMEOUT_MS = 5.5 * 60 * 1000; // 5 minutes 30 seconds (330 seconds)
    let pollErrorCount = 0;
    const MAX_POLL_ERRORS = 5;

    const interval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      
      // Extended timeout: 5m30s - if job still processing/null, redirect to form
      if (elapsed > TIMEOUT_MS) {
        clearInterval(interval);
        clearJobPersistence();
        setIsGenerating(false);
        setIsGeneratingMore(false);
        setAnalyzing(false);
        setPhase(1); // Return to project creation form
        toast.error('Generation timed out after 5m30s. Please try again.', {
          duration: 6000,
          description: 'The AI service took too long to respond.'
        });
        return;
      }

      try {
        const response = await axios.get(`${AI_API_BASE_URL}/jobs/${id}`);
        const { status, result } = response.data;
        pollErrorCount = 0; // Reset error count on success

        if (status === 'COMPLETED') {
          clearInterval(interval);
          clearJobPersistence(); // Clear persisted job
          handleAnalysisComplete(result);
        } else if (status === 'FAILED') {
          clearInterval(interval);
          clearJobPersistence(); // Clear persisted job
          toast.error('AI Analysis failed. Please try again.');
          setPhase(1);
          setAnalyzing(false);
          setIsGenerating(false);
        }
      } catch (error) {
        pollErrorCount++;
        console.error(`Polling error (${pollErrorCount}/${MAX_POLL_ERRORS}):`, error);
        
        // Stop polling after too many consecutive errors
        if (pollErrorCount >= MAX_POLL_ERRORS) {
          clearInterval(interval);
          clearJobPersistence();
          toast.error('Connection error. Please check your network and try again.');
          setPhase(1);
          setAnalyzing(false);
          setIsGenerating(false);
        }
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
  };

  // NEW: Handle AI Ideas Generation Complete (Phase 2)
  const handleIdeasGenerated = (ideas, append = false) => {
    // Ensure we have an array of ideas
    const ideasArray = Array.isArray(ideas) ? ideas : [ideas];
    
    // Check for error responses from AI service
    const hasError = ideasArray.some(idea => 
      idea.projectName === "Error Generating Ideas" || 
      idea.description?.includes("ThrottlingException") ||
      idea.description?.includes("Failed to process request")
    );
    
    if (hasError) {
      const errorIdea = ideasArray.find(idea => idea.projectName === "Error Generating Ideas");
      const errorMessage = errorIdea?.description || "AI service error occurred";
      
      console.error("AI Service Error:", errorMessage);
      toast.error("AI service is busy. Please wait a moment and try again.", {
        duration: 5000,
        description: "The AI model is experiencing high traffic."
      });
      
      setPhase(1);
      setAnalyzing(false);
      setIsGeneratingMore(false);
      setIsGenerating(false); // Unlock button
      return;
    }
    
    // Filter out any invalid ideas (no projectName or empty)
    const validIdeas = ideasArray.filter(idea => 
      idea.projectName && 
      idea.projectName !== "Error Generating Ideas" &&
      idea.description
    );
    
    if (validIdeas.length === 0) {
      toast.error("No valid project ideas were generated. Please try again.");
      setPhase(1);
      setAnalyzing(false);
      setIsGeneratingMore(false);
      setIsGenerating(false); // Unlock button
      return;
    }
    
    // Add unique IDs to each idea for tracking
    const ideasWithIds = validIdeas.map((idea, index) => ({
      ...idea,
      id: Date.now() + index,
    }));
    
    if (append) {
      // Append to existing ideas (Generate More)
      setAiIdeas(prev => [...prev, ...ideasWithIds]);
      toast.success(`AI generated ${ideasWithIds.length} more project concepts!`);
    } else {
      // Replace all ideas
      setAiIdeas(ideasWithIds);
      setSelectedIdeaIds([]);
      toast.success(`AI generated ${ideasWithIds.length} project concepts!`);
    }
    
    setPhase(2); // Go to Phase 2 (Idea Selection)
    setAnalyzing(false);
    setIsGeneratingMore(false);
    setIsGenerating(false); // Unlock button - generation complete
  };

  // Toggle select/deselect a single idea
  const handleToggleSelectIdea = (ideaId) => {
    setSelectedIdeaIds(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  // Select all ideas
  const handleSelectAll = () => {
    setSelectedIdeaIds(aiIdeas.map(idea => idea.id));
  };

  // Deselect all ideas
  const handleDeselectAll = () => {
    setSelectedIdeaIds([]);
  };

  // Delete/remove an idea from the list
  const handleDeleteIdea = (ideaId) => {
    setAiIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    setSelectedIdeaIds(prev => prev.filter(id => id !== ideaId));
    toast.success('Concept removed');
  };

  // Save edited idea
  const handleSaveIdea = (editedIdea) => {
    setAiIdeas(prev => 
      prev.map(idea => idea.id === editedIdea.id ? editedIdea : idea)
    );
    toast.success('Changes saved');
  };

  // Generate more ideas (append to existing)
  const handleGenerateMore = async () => {
    // Validate required fields before generating more
    if (!selectedSubjectId) {
      toast.error('Please select a subject before generating more ideas.');
      return;
    }
    
    setIsGeneratingMore(true);
    let pollForMore = null;
    
    try {
      // Pass existing ideas to avoid duplicates
      const requestPayload = buildRequestPayload(lecturerId, aiIdeas);
      setProgressLogs(prev => [...prev, { message: 'Generating more project concepts...', timestamp: new Date() }]);

      const analyzeResponse = await axios.post(`${AI_API_BASE_URL}/analyze`, requestPayload);

      if (analyzeResponse.data && analyzeResponse.data.jobId) {
        setJobId(analyzeResponse.data.jobId);
        
        const startTime = Date.now();
        const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout
        let pollErrorCount = 0;
        const MAX_POLL_ERRORS = 3;
        
        // Poll for results with timeout and error handling
        pollForMore = setInterval(async () => {
          // Check timeout
          if (Date.now() - startTime > TIMEOUT_MS) {
            clearInterval(pollForMore);
            toast.error('Generation timed out. Please try again later.');
            setIsGeneratingMore(false);
            return;
          }
          
          try {
            const response = await axios.get(`${AI_API_BASE_URL}/jobs/${analyzeResponse.data.jobId}`);
            const { status, result } = response.data;
            pollErrorCount = 0; // Reset error count on success

            if (status === 'COMPLETED') {
              clearInterval(pollForMore);
              handleIdeasGenerated(result, true); // append = true
            } else if (status === 'FAILED') {
              clearInterval(pollForMore);
              toast.error('Failed to generate more ideas');
              setIsGeneratingMore(false);
            }
          } catch (error) {
            pollErrorCount++;
            console.error(`Polling error (${pollErrorCount}/${MAX_POLL_ERRORS}):`, error);
            
            // Stop polling after too many consecutive errors
            if (pollErrorCount >= MAX_POLL_ERRORS) {
              clearInterval(pollForMore);
              toast.error('Connection error. Please check your network and try again.');
              setIsGeneratingMore(false);
            }
          }
        }, 5000);
      } else {
        throw new Error('No job ID received');
      }
    } catch (error) {
      console.error('Generate more failed:', error);
      if (pollForMore) clearInterval(pollForMore);
      // Show exact error from API response if available
      const errorMessage = error.response?.data?.error || 'Failed to generate more ideas. Please try again.';
      toast.error(errorMessage);
      setIsGeneratingMore(false);
    }
  };

  // Create selected projects sequentially
  const handleCreateSelectedProjects = async () => {
    if (selectedIdeaIds.length === 0) {
      toast.error('Please select at least one project concept');
      return;
    }

    const selectedIdeas = aiIdeas.filter(idea => selectedIdeaIds.includes(idea.id));
    
    setIsCreatingProjects(true);
    setCreatingIndex(0);
    setCompletedProjectIds([]);

    const subjectIdInt = parseInt(selectedSubjectId, 10);
    const lecturerIdInt = parseInt(lecturerId, 10);

    if (!selectedSubjectId || isNaN(subjectIdInt)) {
      toast.error("Invalid Subject ID.");
      setIsCreatingProjects(false);
      return;
    }
    if (!lecturerId || isNaN(lecturerIdInt)) {
      toast.error("Invalid Lecturer ID.");
      setIsCreatingProjects(false);
      return;
    }

    // Create projects one by one
    for (let i = 0; i < selectedIdeas.length; i++) {
      setCreatingIndex(i);
      const idea = selectedIdeas[i];
      
      try {
        // Build payload matching API schema: businessRules and actors
        const payload = {
          project: {
            projectName: idea.projectName || 'Untitled Project',
            description: idea.description || '',
            lecturerId: lecturerIdInt,
            subjectId: subjectIdInt,
            businessRules: idea.businessRules || '',
            actors: idea.actors || ''
          }
        };

        await createProject(payload);
        setCompletedProjectIds(prev => [...prev, idea.id]);
        
        // Remove from ideas list after successful creation
        setAiIdeas(prev => prev.filter(p => p.id !== idea.id));
        
      } catch (error) {
        console.error(`Failed to create project: ${idea.projectName}`, error);
        toast.error(`Failed to create: ${idea.projectName}`);
      }
    }

    // Clear selected IDs
    setSelectedIdeaIds([]);
    setIsCreatingProjects(false);
    
    const successCount = completedProjectIds.length + 1; // +1 for the last one
    toast.success(`Successfully created ${selectedIdeas.length} project(s)!`);
    
    // If no ideas left, optionally navigate away or show empty state
    if (aiIdeas.length === 0) {
      clearSavedIdeas();
    }
  };

  // Handle going back to Phase 1
  const handleBackToConfig = () => {
    clearSavedIdeas();
    setAiIdeas([]);
    setSelectedIdeaIds([]);
    setPhase(1);
  };

  // ORIGINAL: Handle Analysis Complete (for legacy flow or single project generation)
  const handleAnalysisComplete = (result) => {
    // Check if result is an array (new Phase 2 flow) or single object (legacy flow)
    if (Array.isArray(result)) {
      handleIdeasGenerated(result);
      return;
    }
    
    // Legacy single project flow
    setProjectName(result.projectName || '');
    setDescription(result.description || '');

    const newVersion = {
        id: Date.now(),
        timestamp: new Date(),
        data: result,
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

      const payload = {
        project: {
          projectName,
          description,
          lecturerId: lecturerIdInt,
          subjectId: subjectIdInt
        }
      };
      
      await createProject(payload);
      toast.success('Project created successfully!');
      navigate('/lecturer/projects');
    } catch (error) {
      toast.error('Failed to create project.');
    }
  };

  // --- Render Sections ---

  // Syllabus Slide Panel Component
  const SyllabusSlidePanel = () => {
    const syllabus = syllabusData?.subjectSyllabus;
    const selectedSubject = subjects.find(s => String(s.id || s.subjectId) === String(selectedSubjectId));
    
    return (
      <>
        {/* Backdrop - Click to close, but still allows seeing the UI */}
        <AnimatePresence>
          {isSyllabusPanelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
              onClick={() => setIsSyllabusPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Slide Panel */}
        <AnimatePresence>
          {isSyllabusPanelOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#fcd8b6]/50 to-[#fb8239]/20">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e75710] to-[#fb8239] flex items-center justify-center shadow-lg shadow-[#e75710]/20">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1F2937]">Subject Syllabus</h2>
                    <p className="text-xs text-[#6B7280] font-medium">{selectedSubject?.subjectCode || 'Select a subject'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSyllabusPanelOpen(false)}
                  className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <PanelRightClose size={20} className="text-[#6B7280]" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingSyllabus ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 size={32} className="text-[#e75710] animate-spin mb-3" />
                    <p className="text-[#6B7280] text-sm font-medium">Loading syllabus...</p>
                  </div>
                ) : !selectedSubjectId ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#fcd8b6] flex items-center justify-center mb-4 border border-[#e75710]/10">
                      <BookOpen size={28} className="text-[#e75710]/60" />
                    </div>
                    <h3 className="font-semibold text-[#1F2937] mb-1">No Subject Selected</h3>
                    <p className="text-sm text-[#6B7280]">Select a subject to view its syllabus</p>
                  </div>
                ) : !syllabus ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50/80 flex items-center justify-center mb-4 border border-amber-200/50">
                      <AlertCircle size={28} className="text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-[#1F2937] mb-1">No Syllabus Available</h3>
                    <p className="text-sm text-[#6B7280]">This subject doesn't have a syllabus yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Subject Info */}
                    <div className="bg-gradient-to-br from-[#fcd8b6]/80 to-white rounded-2xl p-5 border border-[#e75710]/10 shadow-sm">
                      <h3 className="font-bold text-[#1F2937] text-lg mb-1">{selectedSubject?.subjectName}</h3>
                      <p className="text-sm text-[#e75710] font-medium">{syllabus.syllabusName}</p>
                      {syllabus.description && (
                        <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">{syllabus.description}</p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center">
                            <CreditCard size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] font-medium">Credits</p>
                            <p className="font-bold text-[#1F2937]">{syllabus.noCredit || '-'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center">
                            <Target size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280] font-medium">Outcomes</p>
                            <p className="font-bold text-[#1F2937]">{syllabus.subjectOutcomes?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    {syllabus.subjectOutcomes?.length > 0 && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-100/80 bg-gradient-to-r from-[#fcd8b6]/50 to-white/50">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={18} className="text-[#e75710]" />
                            <h4 className="font-bold text-[#1F2937]">Learning Outcomes</h4>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {syllabus.subjectOutcomes.map((outcome, index) => (
                            <div key={outcome.subjectOutcomeId || index} className="flex gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e75710] to-[#fb8239] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                              <p className="text-sm text-[#1F2937] leading-relaxed">{outcome.outcomeDetail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grade Components */}
                    {syllabus.subjectGradeComponents?.length > 0 && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-100/80 bg-gradient-to-r from-purple-50/50 to-white/50">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-purple-600" />
                            <h4 className="font-bold text-[#1F2937]">Assessment Components</h4>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {syllabus.subjectGradeComponents.map((component, index) => (
                            <div key={component.subjectGradeComponentId || index} className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
                                <span className="text-sm font-medium text-[#1F2937]">{component.componentName}</span>
                              </div>
                              <span className="text-sm font-bold text-purple-600">{component.referencePercentage}%</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200/60">
                            <span className="text-sm font-bold text-[#6B7280]">Total</span>
                            <span className="text-sm font-bold text-[#1F2937]">
                              {syllabus.subjectGradeComponents.reduce((sum, c) => sum + c.referencePercentage, 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-5 border-t border-slate-100/80 bg-gradient-to-r from-white/80 to-[#fcd8b6]/30 backdrop-blur-sm">
                <button
                  onClick={() => setIsSyllabusPanelOpen(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1F2937] to-[#374151] text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  const renderUploadZone = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN - Main Configuration Panel */}
      <div className="lg:col-span-3 space-y-8">
        {/* Frosted Glass Card Container */}
        <div className="bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.05)] rounded-[28px] p-8 xl:p-10">
          
          {/* Subject Selector - Hero Input Style */}
          <div className="mb-10">
            <label className="flex items-center gap-2.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#e75710] to-[#fb8239] flex items-center justify-center">
                <Layers size={12} className="text-white" />
              </div>
              Select Subject
            </label>
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className={`w-full appearance-none bg-white border-2 text-[#1F2937] font-medium rounded-2xl px-6 py-5 pr-14 text-[15px] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 cursor-pointer hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] ${
                    selectedSubjectId 
                      ? 'border-[#e75710]/30 ring-4 ring-[#e75710]/5' 
                      : 'border-slate-200/80 focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10'
                  }`}
                >
                  <option value="">-- Choose a Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id || sub.subjectId} value={sub.id || sub.subjectId}>
                      {sub.subjectCode} - {sub.subjectName}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedSubjectId ? 'text-[#e75710]' : 'text-slate-400'}`} size={20} />
              </div>
              
              {/* View Syllabus Button */}
              <motion.button
                type="button"
                onClick={() => setIsSyllabusPanelOpen(true)}
                disabled={!selectedSubjectId}
                className={`flex items-center gap-2.5 px-6 py-5 rounded-2xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  selectedSubjectId
                    ? 'bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white shadow-[0_8px_24px_-4px_rgba(231,87,16,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(231,87,16,0.5)] hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                whileHover={selectedSubjectId ? { scale: 1.02 } : {}}
                whileTap={selectedSubjectId ? { scale: 0.98 } : {}}
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">View Syllabus</span>
              </motion.button>
            </div>
            
            {/* Quick syllabus hint */}
            {selectedSubjectId && syllabusData?.subjectSyllabus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-xs text-[#6B7280] bg-[#fcd8b6] rounded-xl px-4 py-3"
              >
                <CheckCircle size={14} className="text-emerald-500" />
                <span>
                  Syllabus available: <span className="font-medium text-[#1F2937]">{syllabusData.subjectSyllabus.syllabusName}</span> ({syllabusData.subjectSyllabus.noCredit} credits)
                </span>
                <button
                  onClick={() => setIsSyllabusPanelOpen(true)}
                  className="ml-auto text-[#e75710] hover:text-[#e86a4a] font-semibold hover:underline"
                >
                  View details →
                </button>
              </motion.div>
            )}
          </div>

          {/* AI Guidance Parameters Section */}
          <div className="space-y-8">
            {/* Section Header: Mandatory Fields - Info Badge Style */}
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">Mandatory Parameters</h3>
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                Required
              </span>
            </div>

            {/* Topic Domain - Hero Input Style */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Globe size={12} className="mr-2 text-[#e75710]" />
                Topic Domain <span className="text-[#e75710] ml-1">*</span>
                <InfoTooltip 
                  text="The core theme of your project. AI needs this to understand the business domain and generate relevant features, workflows, and technical requirements."
                  example="Jewelry Retail Business, E-commerce Platform, Healthcare System"
                />
              </label>
              <div className="relative">
                <Globe className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${topicDomain ? 'text-[#e75710]' : 'text-slate-400'}`} size={20} />
                <select
                  value={topicDomain}
                  onChange={(e) => setTopicDomain(e.target.value)}
                  className={`w-full appearance-none bg-white border-2 rounded-2xl pl-14 pr-12 py-4 text-[15px] font-medium text-[#1F2937] outline-none transition-all duration-300 cursor-pointer ${
                    mandatoryValidation.topicDomain 
                      ? 'border-emerald-300 ring-4 ring-emerald-50' 
                      : topicDomain 
                        ? 'border-[#e75710]/30 ring-4 ring-[#e75710]/5' 
                        : 'border-slate-200 focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10'
                  }`}
                >
                  <option value="">-- Select Domain --</option>
                  {TOPIC_DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
              
              {/* Custom Domain Input */}
              <AnimatePresence>
                {topicDomain === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      value={customTopicDomain}
                      onChange={(e) => setCustomTopicDomain(e.target.value)}
                      placeholder="Enter your custom domain..."
                      className="w-full bg-white border-2 border-[#e75710]/30 rounded-2xl px-5 py-4 text-[15px] font-medium text-[#1F2937] placeholder-slate-400 focus:ring-4 focus:ring-[#e75710]/10 focus:border-[#e75710]/50 transition-all outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Team Size and Duration Row - Segmented Controls Style */}
            <div className="grid grid-cols-2 gap-6">
              {/* Team Size Selector */}
              <div>
                <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                  <Users size={12} className="mr-2 text-[#e75710]" />
                  Team Size <span className="text-[#e75710] ml-1">*</span>
                  <InfoTooltip 
                    text="Number of team members. AI uses this to calculate workload distribution, determine project scope, and suggest appropriate task breakdown for the semester."
                    example="5 members for a standard capstone project"
                  />
                </label>
                <TeamSizeSelector value={teamSize} onChange={setTeamSize} />
              </div>

              {/* Duration Weeks */}
              <div>
                <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                  <Clock size={12} className="mr-2 text-[#e75710]" />
                  Duration (Weeks) <span className="text-[#e75710] ml-1">*</span>
                  <InfoTooltip 
                    text="Project duration in weeks. Combined with team size, AI calculates feasible workload distribution across the semester."
                    example="14 weeks for a full semester project"
                  />
                </label>
                <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-2xl p-3 border-2 border-transparent transition-all duration-300 focus-within:border-[#e75710]/30 focus-within:ring-4 focus-within:ring-[#e75710]/5">
                  <button
                    onClick={() => setDurationWeeks(Math.max(8, durationWeeks - 1))}
                    className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#6B7280] hover:bg-[#fcd8b6] hover:border-[#e75710]/30 hover:text-[#e75710] transition-all duration-200"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Math.max(8, Math.min(15, parseInt(e.target.value) || 10)))}
                    className="flex-1 bg-transparent text-center text-xl font-bold text-[#1F2937] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={8}
                    max={15}
                  />
                  <button
                    onClick={() => setDurationWeeks(Math.min(15, durationWeeks + 1))}
                    className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#6B7280] hover:bg-[#fcd8b6] hover:border-[#e75710]/30 hover:text-[#e75710] transition-all duration-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Required Tech Stack */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Settings2 size={12} className="mr-2 text-[#e75710]" />
                Required Tech Stack <span className="text-[#e75710] ml-1">*</span>
                <InfoTooltip 
                  text="Core technologies that must be used. AI needs this to suggest appropriate architecture (Microservices vs Monolith), integration patterns, and technical best practices."
                  example="ASP.NET Core, React, SQL Server"
                />
              </label>
              <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                mandatoryValidation.requiredTech 
                  ? 'border-emerald-200 bg-emerald-50/30' 
                  : 'border-transparent bg-[#F9FAFB]'
              }`}>
                <TechStackSelector selected={requiredTechStack} onChange={setRequiredTechStack} />
              </div>
              {!mandatoryValidation.requiredTech && (
                <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1.5 font-medium">
                  <AlertCircle size={12} />
                  Select at least one required technology
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section Header: Highly Recommended */}
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">Highly Recommended</h3>
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                Improves Quality
              </span>
            </div>

            {/* Industry Context Textarea */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Briefcase size={12} className="mr-2 text-[#e75710]" />
                Industry Context & Scope <span className="text-[#e75710] ml-1">*</span>
                <InfoTooltip 
                  text="Specific business context and scope. Without this, AI generates generic features. With this, AI creates tailored business rules, workflows, and domain-specific functionality."
                  example="A premium diamond jewelry management system for PNJ Vietnam, serving both individual customers and corporate clients with GIA certification tracking"
                />
              </label>
              <textarea
                value={industryContext}
                onChange={(e) => setIndustryContext(e.target.value)}
                placeholder="Describe the specific business context, target users, and unique requirements... (e.g., A premium jewelry management system for high-end retail stores)"
                rows={3}
                className={`w-full bg-white border-2 rounded-2xl px-5 py-4 text-sm font-medium text-[#1F2937] placeholder-slate-400 outline-none transition-all duration-300 resize-none ${
                  mandatoryValidation.industryContext 
                    ? 'border-emerald-300 ring-4 ring-emerald-50' 
                    : 'border-slate-200 focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10'
                }`}
              />
            </div>

            {/* Complexity Slider */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Activity size={12} className="mr-2 text-[#e75710]" />
                Project Complexity <span className="text-[#e75710] ml-1">*</span>
                <InfoTooltip 
                  text="Complexity level affects AI's suggestions. Basic = simple CRUD, Intermediate = standard business logic, Advanced = enterprise patterns with AI/ML integration possibilities."
                  example="Level 3 (Advanced) for a capstone with complex business rules"
                />
              </label>
              <div className="bg-[#F9FAFB] rounded-2xl p-5 border-2 border-transparent">
                <ComplexitySlider value={complexity} onChange={setComplexity} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Section Header: Optional Fields */}
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-[#1F2937]">Optional Enhancements</h3>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                Nice to have
              </span>
            </div>

            {/* Reference URLs */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Link size={12} className="mr-2" />
                Reference URLs
                <span className="text-[#6B7280]/60 font-normal normal-case ml-2">(Optional)</span>
                <InfoTooltip 
                  text="Links to reference websites or documentation. AI already has internal knowledge about common businesses (PNJ, Amazon, etc.), but URLs help focus on specific implementations you want students to replicate."
                  example="https://pnj.com.vn, https://jared.com"
                />
              </label>
              <div className="space-y-3">
                {referenceUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateReferenceUrl(index, e.target.value)}
                        placeholder="https://example.com/reference..."
                        className="w-full bg-[#F9FAFB] border-2 border-transparent rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-[#1F2937] placeholder-slate-400 focus:ring-4 focus:ring-[#e75710]/10 focus:border-[#e75710]/30 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeReferenceUrl(index)}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {referenceUrls.length < 5 && (
                  <button
                    onClick={addReferenceUrl}
                    className="flex items-center gap-2 text-xs font-semibold text-[#e75710] hover:text-[#e86a4a] transition-colors"
                  >
                    <Plus size={14} />
                    Add another URL
                  </button>
                )}
              </div>
            </div>

            {/* Project Type Selector - Selection Cards Style */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Code2 size={12} className="mr-2" />
                Project Type
                <span className="text-[#6B7280]/60 font-normal normal-case ml-2">(Optional)</span>
                <InfoTooltip 
                  text="Usually implied by your tech stack (React + .NET = Web App). Only needed if you specifically want Mobile or Desktop application, otherwise AI will infer from required technologies."
                  example="Web Application (default for most tech stacks)"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProjectType(projectType === opt.value ? '' : opt.value)}
                    className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      projectType === opt.value
                        ? 'bg-white text-[#e75710] border-2 border-[#e75710] shadow-[0_4px_16px_-4px_rgba(231,87,16,0.3)]'
                        : 'bg-[#F3F4F6] text-[#6B7280] border-2 border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Project Type Input */}
              {projectType === 'Custom' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    placeholder="Enter your custom project type..."
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-[#e75710]/20 rounded-2xl text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10 transition-all duration-300"
                    maxLength={50}
                  />
                  <p className="text-[11px] text-[#6B7280] mt-2 pl-1">E.g., IoT System, Blockchain DApp, AR/VR Application, etc.</p>
                </div>
              )}
            </div>

            {/* Optional Tech Stack */}
            <div>
              <label className="flex items-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.1em] mb-3">
                <Cpu size={12} className="mr-2" />
                Optional Tech Stack
                <span className="text-[#6B7280]/60 font-normal normal-case ml-2">(Nice to have)</span>
                <InfoTooltip 
                  text="Additional technologies as bonus points. AI will include these in recommendations but they're not required for project completion. Good for students who want extra challenges."
                  example="Docker, Redis, AWS S3, GraphQL"
                />
              </label>
              <TechStackSelector selected={optionalTechStack} onChange={setOptionalTechStack} />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Summary & Generate */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0.5, scale: 0.98 }}
          animate={{ 
            opacity: selectedSubjectId ? 1 : 0.5, 
            scale: selectedSubjectId ? 1 : 0.98 
          }}
          transition={{ duration: 0.3 }}
          className="sticky top-6"
        >
          {/* Frosted Glass Card */}
          <div className={`bg-white/80 backdrop-blur-[20px] border border-white/40 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 xl:p-10 transition-all duration-500 ${
            !selectedSubjectId ? 'grayscale' : ''
          }`}>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#fcd8b6] via-white to-[#fcd8b6] flex items-center justify-center mb-5 shadow-lg border border-[#e75710]/10">
                <BrainCircuit size={36} className="text-[#e75710]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">AI Project Generator</h3>
              <p className="text-sm text-[#6B7280]">Configure parameters and generate</p>
            </div>

            {/* Configuration Summary */}
            <div className="bg-[#F9FAFB] rounded-2xl p-5 mb-8 space-y-4">
              <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.15em] mb-3">Configuration Summary</h4>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Domain:</span>
                <span className="font-semibold text-[#1F2937] truncate max-w-[150px]">{actualTopicDomain || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Project Type:</span>
                <span className="font-semibold text-[#1F2937] truncate max-w-[150px]">{actualProjectType || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Complexity:</span>
                <span className="font-semibold text-[#1F2937]">Level {complexity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Team Size:</span>
                <span className="font-semibold text-[#1F2937]">{teamSize} members</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Duration:</span>
                <span className="font-semibold text-[#1F2937]">{durationWeeks} weeks</span>
              </div>
              {requiredTechStack.length > 0 && (
                <div className="text-sm pt-2 border-t border-slate-200">
                  <span className="text-[#6B7280]">Required Tech:</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {requiredTechStack.slice(0, 3).map(tech => (
                      <span key={tech} className="px-2.5 py-1 bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white rounded-full text-[11px] font-semibold">{tech}</span>
                    ))}
                    {requiredTechStack.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-200 text-[#6B7280] rounded-full text-[11px] font-semibold">+{requiredTechStack.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button - Large Full-Width Action with Anti-Spam */}
            <motion.button
              disabled={!isConfigReady || isGenerating}
              onClick={handleGenerateProject}
              className={`relative w-full py-5 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                isGenerating
                  ? 'bg-gradient-to-r from-[#e75710]/80 to-[#fb8239]/80 text-white/90 cursor-wait'
                  : isConfigReady
                    ? 'bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white shadow-[0_8px_32px_-4px_rgba(231,87,16,0.5)] hover:shadow-[0_12px_40px_-4px_rgba(231,87,16,0.6)] hover:-translate-y-0.5'
                    : 'bg-slate-100/80 backdrop-blur-sm text-slate-400 cursor-not-allowed border border-slate-200/50'
              }`}
              whileHover={isConfigReady && !isGenerating ? { y: -2 } : {}}
              whileTap={isConfigReady && !isGenerating ? { scale: 0.98 } : {}}
            >
              {/* Glassmorphism shine effect */}
              {isConfigReady && !isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              )}
              
              {/* Loading spinner when generating */}
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating...</span>
                  <span className="text-white/60 text-sm font-normal">(Please wait)</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Project Ideas
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
            
            {/* Generation status hint */}
            {isGenerating && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-[#e75710] font-medium mt-2"
              >
                ⏳ AI is analyzing your requirements... This may take up to 2 minutes.
              </motion.p>
            )}

            {/* Validation Status */}
            <div className="mt-8 space-y-2.5">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.15em] mb-4">Mandatory Fields</p>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.subject ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.subject ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.subject ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Subject Selected
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.topicDomain ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.topicDomain ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.topicDomain ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Topic Domain
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.teamSize ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.teamSize ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.teamSize ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Team Size (3-8)
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.duration ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.duration ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.duration ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Duration (8-15 weeks)
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.requiredTech ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.requiredTech ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.requiredTech ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Required Tech Stack
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.industryContext ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.industryContext ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.industryContext ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Industry Context
              </div>
              
              <div className={`flex items-center gap-3 text-[13px] font-medium transition-colors ${mandatoryValidation.complexity ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${mandatoryValidation.complexity ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {mandatoryValidation.complexity ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Complexity Level
              </div>
              
              {/* Progress indicator */}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#6B7280] font-medium">Completion</span>
                  <span className={`font-bold ${isConfigReady ? 'text-emerald-600' : 'text-[#e75710]'}`}>
                    {Object.values(mandatoryValidation).filter(Boolean).length}/{Object.keys(mandatoryValidation).length}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${isConfigReady ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#e75710] to-[#fb8239]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(mandatoryValidation).filter(Boolean).length / Object.keys(mandatoryValidation).length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
                          Provide specific instructions to the AI Architect to adjust the project details.
                      </p>
                      
                      <textarea
                          className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-[#fcd8b6] focus:border-[#fb8239] outline-none min-h-[140px] resize-none transition-all text-sm"
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
      {/* Syllabus Slide Panel - Always mounted for smooth transitions */}
      <SyllabusSlidePanel />
      
      {/* Full page background wrapper - extends to edges with negative margins */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#fcd8b6]/60 via-white/50 to-[#FFF9F8]/40 -z-10 -mx-4 -my-6 md:-mx-6 lg:-mx-8" 
           style={{ marginLeft: '-2rem', marginRight: '-2rem', marginTop: '-1.5rem', marginBottom: '-1.5rem' }} />
      
      {/* Content Wrapper */}
      <div className="relative min-h-screen">
        <div className="space-y-8">

          {/* --- HERO HEADER --- */}
          {phase === 1 && (
            <div>
              <LecturerBreadcrumbs items={breadcrumbItems} />
              <div className="mt-6 relative overflow-hidden rounded-[28px] bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 xl:p-10">
                {/* Soft Orange Blobs */}
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e75710]/10 blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-[#fb8239]/10 blur-3xl"></div>
                <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-[#e75710]/5 blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#e75710]/20">
                      <Sparkles size={12} /> AI Powered
                    </span>
                  </div>
                  <h1 className="text-3xl xl:text-4xl font-bold text-[#1F2937] mb-3">AI Project Architect</h1>
                  <p className="text-[#6B7280] max-w-2xl leading-relaxed text-base">
                    Configure your project parameters, upload a syllabus or brief, and let our AI generate complete project concepts with business rules in seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumbs for Phase 2 (Idea Selection) */}
          {phase === 2 && !analyzing && aiIdeas.length > 0 && (
            <div>
              <LecturerBreadcrumbs items={[
                ...breadcrumbItems.slice(0, -1),
                { label: "Create project with AI", href: "#", onClick: handleBackToConfig },
                { label: "Select Concept" }
              ]} />
            </div>
          )}

          {/* --- MAIN CONTENT AREA --- */}
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.div key="upload" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                {renderUploadZone()}
              </motion.div>
            )}
            {phase === 2 && analyzing && (
              <motion.div key="analyzing" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                <AnalyzingScreen progressLogs={progressLogs} />
              </motion.div>
            )}
            {phase === 2 && !analyzing && (
              <motion.div key="idea-selection" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <IdeaSelectionScreen
                  ideas={aiIdeas}
                  selectedIdeaIds={selectedIdeaIds}
                  topicDomain={actualTopicDomain}
                  teamSize={teamSize}
                  complexity={complexity}
                  isGeneratingMore={isGeneratingMore}
                  isCreatingProjects={isCreatingProjects}
                  creatingIndex={creatingIndex}
                  completedProjectIds={completedProjectIds}
                  onToggleSelectIdea={handleToggleSelectIdea}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onSaveIdea={handleSaveIdea}
                  onDeleteIdea={handleDeleteIdea}
                  onCreateSelectedProjects={handleCreateSelectedProjects}
                  onGenerateMore={handleGenerateMore}
                  onBackToConfig={handleBackToConfig}
                />
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
    </DashboardLayout>
  );
};

export default CreateProjectAI;