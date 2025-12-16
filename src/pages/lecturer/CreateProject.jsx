import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
   UploadCloud,
   FileText,
   X,
   Plus,
   CheckCircle2,
   Circle,
   AlertCircle,
   Users,
   ScrollText,
   HelpCircle,
   BookOpen,
   PanelRightClose,
   Loader2,
   CreditCard,
   Target,
   GraduationCap,
   BarChart3
} from "lucide-react";

import { createProject } from "../../services/projectApi";
import { toast } from 'sonner';
import { getAllSubject, getSyllabusBySubjectId } from "../../services/userService";
import LecturerBreadcrumbs from "../../features/lecturer/components/LecturerBreadcrumbs";
import DashboardLayout from "../../components/layout/DashboardLayout";

// Suggested actor options for quick selection
const SUGGESTED_ACTORS = [
   "Admin", "Student", "Lecturer", "Manager", "User", "Customer", 
   "Staff", "Guest", "Moderator", "System Administrator"
];

const normaliseSubjectList = (payload) => {
   if (!payload) return [];
   if (Array.isArray(payload)) return payload;
   if (Array.isArray(payload?.data)) return payload.data;
   return [];
};

// Info Tooltip Component
const InfoTooltip = ({ text }) => (
   <div className="group relative inline-block ml-1.5">
      <HelpCircle size={14} className="text-slate-400 hover:text-slate-600 cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
         {text}
         <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900" />
      </div>
   </div>
);

const CreateProject = () => {
   const { classId } = useParams();
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [subjects, setSubjects] = useState([]);
   const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
   const [subjectError, setSubjectError] = useState("");

   // Syllabus Panel States
   const [isSyllabusPanelOpen, setIsSyllabusPanelOpen] = useState(false);
   const [syllabusData, setSyllabusData] = useState(null);
   const [loadingSyllabus, setLoadingSyllabus] = useState(false);

   const [uploadedFile, setUploadedFile] = useState(null);
   const [isDragOver, setIsDragOver] = useState(false);

   // Updated form state to match API schema
   const [formState, setFormState] = useState({
      projectName: "",
      subjectId: "",
      description: "",
      actors: "",
   });

   // Business rules as array for controlled input
   const [businessRulesArray, setBusinessRulesArray] = useState([]);
   const [newRuleInput, setNewRuleInput] = useState("");

   const [formErrors, setFormErrors] = useState({});
   const [submissionError, setSubmissionError] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   const breadcrumbItems = useMemo(() => {
      return [
         { label: "Project Library", href: "/lecturer/projects" },
         { label: "Create project" },
      ];
   }, []);

   useEffect(() => {
      let isMounted = true;
      const fetchSubjects = async () => {
         setIsLoadingSubjects(true);
         setSubjectError("");
         try {
            const result = await getAllSubject();
            if (!isMounted) return;
            setSubjects(normaliseSubjectList(result));
         } catch (error) {
            if (!isMounted) return;
            setSubjects([]);
            setSubjectError("Unable to load subjects right now.");
         } finally {
            if (isMounted) setIsLoadingSubjects(false);
         }
      };
      fetchSubjects();
      return () => { isMounted = false; };
   }, []);

   // Fetch syllabus when subject changes
   useEffect(() => {
      const fetchSyllabus = async () => {
         if (!formState.subjectId) {
            setSyllabusData(null);
            return;
         }
         try {
            setLoadingSyllabus(true);
            const result = await getSyllabusBySubjectId(formState.subjectId);
            setSyllabusData(result);
         } catch (error) {
            console.error('Failed to fetch syllabus:', error);
            setSyllabusData(null);
         } finally {
            setLoadingSyllabus(false);
         }
      };
      fetchSyllabus();
   }, [formState.subjectId]);

   // Count business rules from array
   const businessRulesCount = businessRulesArray.length;

   // Format business rules for API submission (with dashes)
   const formattedBusinessRules = useMemo(() => {
      return businessRulesArray.map(rule => `- ${rule}`).join('\n');
   }, [businessRulesArray]);

   // Count actors (comma separated)
   const actorsCount = useMemo(() => {
      if (!formState.actors.trim()) return 0;
      return formState.actors.split(',').filter(a => a.trim()).length;
   }, [formState.actors]);

   // Readiness Logic - Updated for new fields
   const readinessChecklist = useMemo(() => {
      const projectNameReady = Boolean(formState.projectName.trim());
      const subjectReady = Boolean(formState.subjectId);
      const descriptionReady = Boolean(formState.description.trim());
      const businessRulesReady = businessRulesArray.length > 0;
      const actorsReady = Boolean(formState.actors.trim());

      return [
         { id: "projectName", label: "Project name added", complete: projectNameReady },
         { id: "subject", label: "Subject selected", complete: subjectReady },
         { id: "description", label: "Description drafted", complete: descriptionReady },
         { id: "businessRules", label: "Business rules defined", complete: businessRulesReady },
         { id: "actors", label: "Actors specified", complete: actorsReady },
      ];
   }, [formState, businessRulesArray]);

   const readinessProgress = useMemo(() => {
      const total = readinessChecklist.length;
      if (!total) return 0;
      const completed = readinessChecklist.filter((item) => item.complete).length;
      return Math.round((completed / total) * 100);
   }, [readinessChecklist]);

   const selectedSubject = useMemo(() =>
      subjects.find((s) => String(s.subjectId) === String(formState.subjectId)) ?? null,
      [subjects, formState.subjectId]);

   const hasMinimumData = readinessProgress === 100;

   // Handlers
   const handleBaseFieldChange = (field, value) => {
      setFormState(prev => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
         setFormErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
         });
      }
   };

   const handleFieldBlur = (field, value) => {
      if (!String(value).trim()) {
         setFormErrors(prev => ({ ...prev, [field]: "This field is required." }));
      }
   };

   // Add actor from suggestions
   const handleAddActor = (actor) => {
      const currentActors = formState.actors.split(',').map(a => a.trim()).filter(Boolean);
      if (!currentActors.includes(actor)) {
         const newActors = [...currentActors, actor].join(', ');
         handleBaseFieldChange('actors', newActors);
      }
   };

   // Remove actor
   const handleRemoveActor = (actorToRemove) => {
      const currentActors = formState.actors.split(',').map(a => a.trim()).filter(Boolean);
      const newActors = currentActors.filter(a => a !== actorToRemove).join(', ');
      handleBaseFieldChange('actors', newActors);
   };

   // Business Rules Handlers
   const handleAddBusinessRule = (rule) => {
      const trimmedRule = rule.trim();
      if (trimmedRule && !businessRulesArray.includes(trimmedRule)) {
         setBusinessRulesArray(prev => [...prev, trimmedRule]);
         setNewRuleInput("");
         // Clear error if exists
         if (formErrors.businessRules) {
            setFormErrors(prev => {
               const next = { ...prev };
               delete next.businessRules;
               return next;
            });
         }
      }
   };

   const handleRemoveBusinessRule = (ruleToRemove) => {
      setBusinessRulesArray(prev => prev.filter(rule => rule !== ruleToRemove));
   };

   // Get current actors as array
   const currentActorsArray = useMemo(() => {
      return formState.actors.split(',').map(a => a.trim()).filter(Boolean);
   }, [formState.actors]);

   // File Upload Handlers
   const handleFileUpload = (file) => {
      if (!file) return;
      const allowed = file.type === "application/pdf" || file.type.includes("document") || file.type === "text/plain";
      if (!allowed) { toast.error("Please upload a PDF, Word document, or text file."); return; }
      setUploadedFile(file);
   };

   const validateForm = () => {
      const errors = {};
      if (!formState.projectName.trim()) errors.projectName = "Project name is required.";
      if (!formState.description.trim()) errors.description = "Project description is required.";
      if (!formState.subjectId) errors.subjectId = "Subject is required.";
      if (businessRulesArray.length === 0) errors.businessRules = "At least one business rule is required.";
      if (!formState.actors.trim()) errors.actors = "At least one actor is required.";
      return errors;
   };

   const handleSubmit = async (event) => {
      event.preventDefault();
      setSubmissionError("");
      const errors = validateForm();
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
         window.scrollTo({ top: 0, behavior: "smooth" });
         return;
      }

      if (!lecturerId) {
         setSubmissionError("Session expired. Please sign in again.");
         return;
      }

      // Payload matching API schema
      const payload = {
         project: {
            projectName: formState.projectName.trim(),
            description: formState.description.trim(),
            lecturerId: Number(lecturerId),
            subjectId: Number(formState.subjectId),
            businessRules: formattedBusinessRules,
            actors: formState.actors.trim(),
         }
      };

      console.log('Creating project with payload:', payload);

      setIsSubmitting(true);
      try {
         await createProject(payload);
         toast.success('Project created successfully!');
         navigate(classId ? `/lecturer/classes/${classId}/projects` : "/lecturer/projects");
      } catch (error) {
         console.error(error);
         setSubmissionError(error?.response?.data?.message ?? "Unable to create project.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen space-y-8 bg-slate-50/50">

            {/* --- HEADER --- */}
            <LecturerBreadcrumbs items={breadcrumbItems} />

            <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#fcd8b6]/50 blur-3xl"></div>

               <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4 max-w-2xl">
                     <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create New Project</h1>
                        <p className="mt-1 text-sm text-slate-600">
                           Define your project with business rules and actors to guide student teams through their coursework.
                        </p>
                     </div>

                  </div>

                  <div className="flex gap-4">
                     <div className="flex flex-col items-end rounded-2xl bg-[#fcd8b6]/30 border border-[#e75710]/10 p-4 min-w-[140px]">
                        <span className="text-xs font-bold uppercase text-slate-400">Rules</span>
                        <span className="text-3xl font-bold text-[#e75710]">{businessRulesCount}</span>
                     </div>
                     <div className="flex flex-col items-end rounded-2xl bg-blue-50 border border-blue-100 p-4 min-w-[140px]">
                        <span className="text-xs font-bold uppercase text-slate-400">Actors</span>
                        <span className="text-3xl font-bold text-blue-600">{actorsCount}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- MAIN FORM CONTENT --- */}
            <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">

               {/* LEFT COLUMN (Form) */}
               <div className="space-y-8 lg:col-span-2">

                  {/* 1. Project Basics */}
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                     <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-lg font-bold text-slate-800">1. Project Details</h2>
                     </div>

                     <div className="space-y-6">
                        {/* Project Name */}
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Project Name <span className="text-[#e75710]">*</span></label>
                           <input
                              type="text"
                              className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#e75710]/10 transition-all ${
                                 formErrors.projectName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#e75710]/50'
                              }`}
                              placeholder="e.g. E-Commerce Microservices Architecture"
                              value={formState.projectName}
                              onChange={(e) => handleBaseFieldChange("projectName", e.target.value)}
                              onBlur={(e) => handleFieldBlur("projectName", e.target.value)}
                           />
                           {formErrors.projectName && <p className="text-xs text-red-500">{formErrors.projectName}</p>}
                        </div>

                        {/* Subject Select */}
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Subject <span className="text-[#e75710]">*</span></label>
                           {isLoadingSubjects ? (
                              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100"></div>
                           ) : (
                              <select
                                 className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#e75710]/10 transition-all ${
                                    formErrors.subjectId ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#e75710]/50'
                                 }`}
                                 value={formState.subjectId}
                                 onChange={(e) => handleBaseFieldChange("subjectId", e.target.value)}
                                 onBlur={(e) => handleFieldBlur("subjectId", e.target.value)}
                              >
                                 <option value="">Select a subject...</option>
                                 {subjects.map((s) => (
                                    <option key={s.subjectId} value={s.subjectId}>{s.subjectName} ({s.subjectCode})</option>
                                 ))}
                              </select>
                           )}
                           {formErrors.subjectId && <p className="text-xs text-red-500">{formErrors.subjectId}</p>}

                           {/* View Syllabus Button */}
                           {formState.subjectId && (
                              <motion.div
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="mt-3"
                              >
                                 <button
                                    type="button"
                                    onClick={() => setIsSyllabusPanelOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white text-sm font-semibold shadow-md shadow-[rgba(231,87,16,0.25)] hover:shadow-lg hover:shadow-[rgba(231,87,16,0.35)] hover:-translate-y-0.5 transition-all duration-200"
                                 >
                                    <BookOpen size={16} />
                                    View Syllabus
                                 </button>
                              </motion.div>
                           )}

                           {/* Quick syllabus hint */}
                           {formState.subjectId && syllabusData?.subjectSyllabus && (
                              <motion.div
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-[#fcd8b6]/50 rounded-xl px-4 py-3"
                              >
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                                 <span>
                                    Syllabus available: <span className="font-medium text-slate-800">{syllabusData.subjectSyllabus.syllabusName}</span>
                                    {syllabusData.subjectSyllabus.noCredit && (
                                       <span className="ml-1">({syllabusData.subjectSyllabus.noCredit} credits)</span>
                                    )}
                                 </span>
                                 <button
                                    type="button"
                                    onClick={() => setIsSyllabusPanelOpen(true)}
                                    className="ml-auto text-[#e75710] hover:text-[#c44d0e] font-semibold hover:underline"
                                 >
                                    View details →
                                 </button>
                              </motion.div>
                           )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Description <span className="text-[#e75710]">*</span></label>
                           <textarea
                              rows={5}
                              className={`w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#e75710]/10 transition-all ${
                                 formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#e75710]/50'
                              }`}
                              placeholder="Describe the project goals, scope, and expected outcomes..."
                              value={formState.description}
                              onChange={(e) => handleBaseFieldChange("description", e.target.value)}
                              onBlur={(e) => handleFieldBlur("description", e.target.value)}
                           />
                           {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                        </div>

                        {/* File Upload (Optional) */}
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Supporting Documents (Optional)</label>
                           <div
                              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${isDragOver ? 'border-[#e75710] bg-[#fcd8b6]/30' : 'border-slate-200 bg-slate-50/50 hover:bg-[#fcd8b6]/20'
                                 }`}
                              onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                 e.preventDefault();
                                 setIsDragOver(false);
                                 handleFileUpload(Array.from(e.dataTransfer.files)[0]);
                              }}
                           >
                              {uploadedFile ? (
                                 <div className="flex items-center gap-4 w-full bg-white p-3 rounded-xl border border-[#e75710]/20 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fcd8b6] text-[#e75710]">
                                       <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="truncate text-sm font-medium text-slate-800">{uploadedFile.name}</p>
                                       <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => setUploadedFile(null)}
                                       className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                       <X size={18} />
                                    </button>
                                 </div>
                              ) : (
                                 <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fcd8b6] text-[#e75710] mb-3">
                                       <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                                    <input
                                       type="file"
                                       className="absolute inset-0 opacity-0 cursor-pointer"
                                       onChange={(e) => handleFileUpload(e.target.files?.[0])}
                                       accept=".pdf,.doc,.docx,.txt"
                                    />
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* 2. Business Rules & Actors */}
                  <section className="space-y-6">
                     <h2 className="text-lg font-bold text-slate-800">2. Business Rules & Actors</h2>

                     {/* Business Rules */}
                     <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#e75710] to-[#fb8239] shadow-sm">
                              <ScrollText size={18} className="text-white" />
                           </div>
                           <h3 className="font-bold text-slate-800">Business Rules</h3>
                           <InfoTooltip text="Define the constraints and logic that govern your project. Add each rule separately for proper formatting." />
                        </div>

                        {/* Add Rule Input */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold uppercase text-slate-500">
                              Add Rule <span className="text-[#e75710]">*</span>
                           </label>
                           <div className="flex gap-2">
                              <div className="flex-1 relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e75710] font-medium">-</span>
                                 <input
                                    type="text"
                                    className="w-full rounded-xl border-2 border-slate-200 pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10 transition-all"
                                    placeholder="Enter a business rule..."
                                    value={newRuleInput}
                                    onChange={(e) => setNewRuleInput(e.target.value)}
                                    onKeyDown={(e) => {
                                       if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddBusinessRule(newRuleInput);
                                       }
                                    }}
                                 />
                              </div>
                              <button
                                 type="button"
                                 onClick={() => handleAddBusinessRule(newRuleInput)}
                                 disabled={!newRuleInput.trim()}
                                 className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#e75710] to-[#fb8239] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[rgba(231,87,16,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                              >
                                 <Plus size={18} />
                              </button>
                           </div>
                           {formErrors.businessRules && <p className="text-xs text-red-500">{formErrors.businessRules}</p>}
                        </div>

                        {/* Rules List */}
                        <div className="mt-4 space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">
                              Added Rules ({businessRulesCount})
                           </label>
                           {businessRulesArray.length > 0 ? (
                              <div className="space-y-2 p-3 rounded-xl bg-[#fcd8b6]/20 border border-[#e75710]/10">
                                 {businessRulesArray.map((rule, index) => (
                                    <div
                                       key={index}
                                       className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm group"
                                    >
                                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fcd8b6] text-[#e75710] text-xs font-bold flex items-center justify-center">
                                          {index + 1}
                                       </span>
                                       <p className="flex-1 text-sm text-slate-700 leading-relaxed">{rule}</p>
                                       <button
                                          type="button"
                                          onClick={() => handleRemoveBusinessRule(rule)}
                                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                       >
                                          <X size={16} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="flex items-center justify-center p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                                 No rules added yet. Enter a rule above and click Add.
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Actors */}
                     <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Users size={18} />
                           </div>
                           <h3 className="font-bold text-slate-800">System Actors</h3>
                           <InfoTooltip text="Actors are users or systems that interact with your project. Examples: Admin, Customer, Payment Gateway." />
                        </div>

                        {/* Quick Add Actors */}
                        <div className="mb-4">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Quick Add</label>
                           <div className="flex flex-wrap gap-2">
                              {SUGGESTED_ACTORS.filter(actor => !currentActorsArray.includes(actor)).map((actor) => (
                                 <button
                                    key={actor}
                                    type="button"
                                    onClick={() => handleAddActor(actor)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-[#fcd8b6] hover:border-[#e75710]/30 hover:text-[#e75710] transition-colors"
                                 >
                                    <Plus size={12} />
                                    {actor}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Selected Actors */}
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">
                              Selected Actors <span className="text-[#e75710]">*</span>
                           </label>
                           
                           {currentActorsArray.length > 0 ? (
                              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[48px]">
                                 {currentActorsArray.map((actor, index) => (
                                    <span
                                       key={index}
                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700"
                                    >
                                       {actor}
                                       <button
                                          type="button"
                                          onClick={() => handleRemoveActor(actor)}
                                          className="hover:text-red-500 transition-colors"
                                       >
                                          <X size={14} />
                                       </button>
                                    </span>
                                 ))}
                              </div>
                           ) : (
                              <div className="flex items-center justify-center p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                                 No actors selected. Click the suggestions above or type below.
                              </div>
                           )}
                           {formErrors.actors && <p className="text-xs text-red-500">{formErrors.actors}</p>}
                        </div>

                        {/* Custom Actor Input */}
                        <div className="mt-4 space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Add Custom Actor</label>
                           <div className="flex gap-2">
                              <input
                                 type="text"
                                 id="customActorInput"
                                 className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-[#e75710]/50 focus:ring-4 focus:ring-[#e75710]/10 transition-all"
                                 placeholder="Type actor name and press Enter..."
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                       e.preventDefault();
                                       const value = e.target.value.trim();
                                       if (value) {
                                          handleAddActor(value);
                                          e.target.value = '';
                                       }
                                    }
                                 }}
                              />
                              <button
                                 type="button"
                                 onClick={() => {
                                    const input = document.getElementById('customActorInput');
                                    const value = input.value.trim();
                                    if (value) {
                                       handleAddActor(value);
                                       input.value = '';
                                    }
                                 }}
                                 className="px-4 py-2 rounded-xl bg-[#fcd8b6] text-[#e75710] text-sm font-medium hover:bg-[#fb8239]/20 transition-colors"
                              >
                                 Add
                              </button>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>

               {/* RIGHT COLUMN (Sidebar) */}
               <div className="lg:col-span-1 space-y-6">
                  {/* Readiness Card */}
                  <div className="sticky top-6 space-y-6">
                     <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Readiness Check</h3>

                        <div className="mb-6">
                           <div className="flex items-end justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-600">Completion</span>
                              <span className="text-lg font-bold text-[#e75710]">{readinessProgress}%</span>
                           </div>
                           <div className="h-2.5 w-full rounded-full bg-[#fcd8b6]/50 overflow-hidden">
                              <div
                                 className="h-full bg-gradient-to-r from-[#e75710] to-[#fb8239] transition-all duration-500 ease-out rounded-full"
                                 style={{ width: `${readinessProgress}%` }}
                              />
                           </div>
                        </div>

                        <ul className="space-y-3">
                           {readinessChecklist.map((item) => (
                              <li key={item.id} className="flex items-center gap-3 text-sm">
                                 {item.complete ? (
                                    <CheckCircle2 className="text-emerald-500 h-5 w-5 shrink-0" />
                                 ) : (
                                    <Circle className="text-slate-300 h-5 w-5 shrink-0" />
                                 )}
                                 <span className={item.complete ? "text-slate-700 font-medium" : "text-slate-400"}>
                                    {item.label}
                                 </span>
                              </li>
                           ))}
                        </ul>

                        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                           {submissionError && (
                              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 flex gap-2">
                                 <AlertCircle size={16} className="shrink-0" />
                                 {submissionError}
                              </div>
                           )}

                           <button
                              onClick={handleSubmit}
                              disabled={!hasMinimumData || isSubmitting}
                              className="w-full rounded-xl bg-gradient-to-r from-[#e75710] to-[#fb8239] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgba(231,87,16,0.3)] transition-all hover:shadow-[rgba(231,87,16,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                           >
                              {isSubmitting ? "Creating..." : "Create Project"}
                           </button>

                           <Link
                              to={classId ? `/lecturer/classes/${classId}` : "/lecturer/projects"}
                              className="block w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
                           >
                              Cancel
                           </Link>
                        </div>
                     </div>

                     {/* Quick Snapshot */}
                     <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Summary</h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Subject</span>
                              <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">
                                 {selectedSubject?.subjectCode || "—"}
                              </span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Business Rules</span>
                              <span className="font-medium text-slate-800">{businessRulesCount}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Actors</span>
                              <span className="font-medium text-slate-800">{actorsCount}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Document</span>
                              <span className="font-medium text-slate-800">
                                 {uploadedFile ? "Attached" : "None"}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>

         {/* Syllabus Slide Panel */}
         <AnimatePresence>
            {isSyllabusPanelOpen && (
               <>
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsSyllabusPanelOpen(false)}
                     className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
                  />

                  {/* Slide Panel */}
                  <motion.div
                     initial={{ x: '100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '100%' }}
                     transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
                  >
                     {/* Panel Header */}
                     <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-[#fcd8b6]/30 to-white">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e75710]/10 text-[#e75710]">
                              <BookOpen size={20} />
                           </div>
                           <div>
                              <h2 className="text-lg font-bold text-slate-800">Subject Syllabus</h2>
                              {selectedSubject && (
                                 <p className="text-xs text-slate-500">{selectedSubject.subjectCode}</p>
                              )}
                           </div>
                        </div>
                        <button
                           onClick={() => setIsSyllabusPanelOpen(false)}
                           className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                           <PanelRightClose size={20} className="text-slate-500" />
                        </button>
                     </div>

                     {/* Panel Content */}
                     <div className="flex-1 overflow-y-auto p-6">
                        {loadingSyllabus ? (
                           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                              <Loader2 className="animate-spin mb-3" size={32} />
                              <p className="text-sm">Loading syllabus...</p>
                           </div>
                        ) : !formState.subjectId ? (
                           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                              <BookOpen size={48} className="mb-3 opacity-50" />
                              <p className="text-sm font-medium">No Subject Selected</p>
                              <p className="text-xs mt-1">Select a subject to view its syllabus</p>
                           </div>
                        ) : !syllabusData?.subjectSyllabus ? (
                           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                              <AlertCircle size={48} className="mb-3 opacity-50" />
                              <p className="text-sm font-medium">No Syllabus Available</p>
                              <p className="text-xs mt-1 text-center px-4">This subject doesn't have a syllabus configured yet</p>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              {/* Subject Info Card */}
                              <div className="rounded-2xl bg-gradient-to-br from-[#fcd8b6]/40 to-orange-50 p-5 border border-[#e75710]/10">
                                 <h3 className="font-bold text-slate-800 mb-1">{syllabusData.subjectSyllabus.syllabusName}</h3>
                                 <p className="text-sm text-slate-600">{selectedSubject?.subjectName}</p>
                                 {syllabusData.subjectSyllabus.description && (
                                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                                       {syllabusData.subjectSyllabus.description}
                                    </p>
                                 )}
                              </div>

                              {/* Quick Stats */}
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                       <CreditCard size={16} />
                                       <span className="text-xs font-semibold uppercase">Credits</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">{syllabusData.subjectSyllabus.noCredit || '—'}</p>
                                 </div>
                                 <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                       <Target size={16} />
                                       <span className="text-xs font-semibold uppercase">Outcomes</span>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-700">{syllabusData.subjectOutcomes?.length || 0}</p>
                                 </div>
                              </div>

                              {/* Learning Outcomes */}
                              {syllabusData.subjectOutcomes?.length > 0 && (
                                 <div>
                                    <div className="flex items-center gap-2 mb-3">
                                       <GraduationCap size={16} className="text-[#e75710]" />
                                       <h4 className="text-sm font-bold text-slate-700">Learning Outcomes</h4>
                                    </div>
                                    <div className="space-y-2">
                                       {syllabusData.subjectOutcomes.map((outcome, idx) => (
                                          <div key={outcome.subjectOutcomeId || idx} className="flex gap-3 text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                                             <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e75710]/10 text-[#e75710] text-xs font-bold">
                                                {idx + 1}
                                             </span>
                                             <span className="text-slate-600 leading-relaxed">{outcome.outcomeDetail}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* Grade Components */}
                              {syllabusData.gradeComponents?.length > 0 && (
                                 <div>
                                    <div className="flex items-center gap-2 mb-3">
                                       <BarChart3 size={16} className="text-[#e75710]" />
                                       <h4 className="text-sm font-bold text-slate-700">Grade Components</h4>
                                    </div>
                                    <div className="space-y-2">
                                       {syllabusData.gradeComponents.map((comp, idx) => (
                                          <div key={comp.subjectGradeComponentId || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                             <span className="text-sm text-slate-700 font-medium">{comp.componentName}</span>
                                             <span className="text-sm font-bold text-[#e75710]">{comp.referencePercentage}%</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>

                     {/* Panel Footer */}
                     <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <button
                           onClick={() => setIsSyllabusPanelOpen(false)}
                           className="w-full py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-300 transition-colors"
                        >
                           Close
                        </button>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </DashboardLayout>
   );
};

export default CreateProject;
