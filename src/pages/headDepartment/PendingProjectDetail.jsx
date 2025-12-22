import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { handleProject } from '../../services/userService';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Calendar,
  Clock,
  Target,
  Flag,
  ArrowLeft,
  FileText,
  GraduationCap,
  Hash,
  AlertTriangle,
  X,
  Shield,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

// --- Helper Components ---
const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${className}`}>
    {children}
  </span>
);

const PendingProjectDetail = () => {
  const location = useLocation();
  const project = location.state?.project;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // State for Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Helper: Parse business rules
  const parseBusinessRules = (rules) => {
    if (!rules) return [];
    return rules.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  };

  // Helper: Parse actors
  const parseActors = (actors) => {
    if (!actors) return [];
    return actors.split(',').map(actor => actor.trim());
  };

  // Fallback if no project data passed
  if (!project) {
    return (
      <HeadDashboardLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </HeadDashboardLayout>
    );
  }

  const handleApproveProject = async () => {
    setLoading(true);
    try {
      const response = await handleProject(project.projectId, true);
      if (response) {
        toast.success('Project approved successfully');
        setShowApproveModal(false);
        navigate('/head-department/project-approvals');
      } else {
        toast.error('Failed to approve project');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      const response = await handleProject(project.projectId, false, rejectReason);
      if (response) {
        toast.success('Project rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        navigate('/head-department/project-approvals');
      } else {
        toast.error('Failed to reject project');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while rejecting project');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const businessRules = parseBusinessRules(project.businessRules);
  const actors = parseActors(project.actors);

  return (
    <HeadDashboardLayout>
      <div className="mx-auto space-y-6 pb-20">
        
        {/* --- Header Navigation --- */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#F26F21] transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-[#F26F21] transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to List
        </button>

        {/* --- Main Content Card --- */}
        <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Hero / Title Section */}
          <div className="relative bg-gradient-to-br from-slate-50 to-white p-8 border-b border-slate-100">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="h-40 w-40" />
             </div>
             
             <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-amber-100 text-amber-700 ring-1 ring-amber-500/20">
                     <Clock className="w-3.5 h-3.5" /> {project.statusString || 'PENDING'}
                  </Badge>
                  <Badge className="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20">
                     {project.subjectCode}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {project.projectName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">Proposer: {project.lecturerName}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Description Section */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#F26F21]" />
                    Project Overview
                  </h2>
                  <div className="p-6 rounded-xl bg-slate-50/50 border border-slate-100">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Actors Section */}
                {actors.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#F26F21]" />
                      Actors
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {actors.map((actor, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100 shadow-sm"
                        >
                          <User className="w-3.5 h-3.5" />
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Rules Section */}
                {businessRules.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#F26F21]" />
                      Business Rules
                    </h2>
                    <div className="space-y-3">
                      {businessRules.map((rule, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-all"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-white text-sm font-bold shadow-sm">
                            {idx + 1}
                          </div>
                          <p className="flex-1 text-slate-700 leading-relaxed pt-0.5">
                            {rule}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectives Section */}
                {project.objectives && project.objectives.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#F26F21]" />
                      Objectives & Milestones
                    </h2>
                    <div className="space-y-6">
                      {project.objectives.map((obj) => (
                        <div key={obj.objectiveId} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm md:text-base">{obj.description}</h3>
                              <p className="text-xs text-slate-500 mt-1">Priority: <span className={`font-semibold ${obj.priority === 'High' ? 'text-red-600' : 'text-blue-600'}`}>{obj.priority}</span></p>
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200">
                              <Target className="h-4 w-4 text-slate-400" />
                            </div>
                          </div>
                          <div className="p-4 bg-white">
                            {obj.objectiveMilestones && obj.objectiveMilestones.length > 0 ? (
                              <div className="space-y-3">
                                {obj.objectiveMilestones.map((mile) => (
                                  <div key={mile.objectiveMilestoneId} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="mt-1">
                                      <Flag className="h-4 w-4 text-[#F26F21]" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-bold text-slate-700">{mile.title}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">{mile.description}</p>
                                      <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(mile.startDate)} - {formatDate(mile.endDate)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No milestones defined for this objective.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Project Details</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Subject Code */}
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Hash className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Subject Code
                          </p>
                          <p className="font-bold text-slate-900 text-lg">
                            {project.subjectCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subject Name */}
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Subject Name
                          </p>
                          <p className="font-bold text-slate-900 leading-tight">
                            {project.subjectName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lecturer Name */}
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Lecturer Name
                          </p>
                          <p className="font-bold text-slate-900">
                            {project.lecturerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lecturer Code */}
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Flag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Lecturer Code
                          </p>
                          <p className="font-bold text-slate-900 font-mono">
                            {project.lecturerCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Status
                          </p>
                          <Badge className="bg-amber-100 text-amber-700 ring-1 ring-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> 
                            {project.statusString || 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Created
                          </p>
                          <p className="font-semibold text-slate-900 text-sm">
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectModal(true)}
                  className="w-full flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-red-100 bg-white text-red-600 font-bold text-lg hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition-all shadow-sm"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowApproveModal(true)}
                  className="w-full flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#F26F21] to-[#E55A0F] text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300/50 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Project
                </motion.button>
             </div>
             <p className="text-center text-xs text-slate-400 mt-4">
                Please review all project details before taking action.
             </p>
          </div>
        </div>
      </div>

      {/* Modals remain the same... */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
          >
            <motion.div
              className='relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-100'
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                   <X size={20} />
                </button>

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-50 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50 shadow-sm">
                       <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    
                    <h3 className="mb-2 text-2xl font-bold text-slate-800">Reject Project?</h3>
                    <p className="mb-6 text-slate-500 leading-relaxed max-w-[280px]">
                      Are you sure you want to reject <span className="font-bold text-slate-800">"{project.projectName}"</span>? This cannot be undone.
                    </p>

                    <div className="w-full mb-6 text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#F26F21] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm"
                            rows={3}
                        />
                    </div>

                    <div className="grid w-full grid-cols-2 gap-4">
                       <button
                          onClick={() => {
                            setShowRejectModal(false);
                            setRejectReason('');
                          }}
                          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                       >
                          Cancel
                       </button>
                       <button
                          onClick={handleRejectProject}
                          disabled={loading || !rejectReason.trim()}
                          className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Confirm Reject'}
                       </button>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}

        {showApproveModal && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              className='relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-100'
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => setShowApproveModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                   <X size={20} />
                </button>

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-50 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 ring-8 ring-orange-50/50 shadow-sm">
                       <CheckCircle className="h-10 w-10 text-[#F26F21]" />
                    </div>
                    
                    <h3 className="mb-2 text-2xl font-bold text-slate-800">Approve Project</h3>
                    <p className="mb-8 text-slate-500 leading-relaxed">
                      Confirm approval for <span className="font-bold text-slate-800">"{project.projectName}"</span>? <br/>
                      Assigned to: <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-[#F26F21] ml-1">{project.subjectCode}</span>
                    </p>

                    <div className="grid w-full grid-cols-2 gap-4">
                       <button
                          onClick={() => setShowApproveModal(false)}
                          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                       >
                          Cancel
                       </button>
                       <button
                          onClick={handleApproveProject}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F26F21] to-[#E55A0F] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Confirm Approve'}
                       </button>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </HeadDashboardLayout>
  );
};

export default PendingProjectDetail;