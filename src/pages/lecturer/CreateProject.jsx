import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
   HelpCircle
} from "lucide-react";

import { createProject } from "../../services/projectApi";
import { toast } from 'sonner';
import { getAllSubject } from "../../services/userService";
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

   const [uploadedFile, setUploadedFile] = useState(null);
   const [isDragOver, setIsDragOver] = useState(false);

   // Updated form state to match API schema
   const [formState, setFormState] = useState({
      projectName: "",
      subjectId: "",
      description: "",
      businessRules: "",
      actors: "",
   });

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

   // Count business rules (lines starting with - or numbers)
   const businessRulesCount = useMemo(() => {
      if (!formState.businessRules.trim()) return 0;
      const lines = formState.businessRules.split('\n').filter(line => {
         const trimmed = line.trim();
         return trimmed.startsWith('-') || /^\d+\./.test(trimmed);
      });
      return lines.length;
   }, [formState.businessRules]);

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
      const businessRulesReady = Boolean(formState.businessRules.trim());
      const actorsReady = Boolean(formState.actors.trim());

      return [
         { id: "projectName", label: "Project name added", complete: projectNameReady },
         { id: "subject", label: "Subject selected", complete: subjectReady },
         { id: "description", label: "Description drafted", complete: descriptionReady },
         { id: "businessRules", label: "Business rules defined", complete: businessRulesReady },
         { id: "actors", label: "Actors specified", complete: actorsReady },
      ];
   }, [formState]);

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
      if (!formState.businessRules.trim()) errors.businessRules = "Business rules are required.";
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
            businessRules: formState.businessRules.trim(),
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
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>

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
                     <div className="flex flex-col items-end rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-[140px]">
                        <span className="text-xs font-bold uppercase text-slate-400">Rules</span>
                        <span className="text-3xl font-bold text-orangeFpt-600">{businessRulesCount}</span>
                     </div>
                     <div className="flex flex-col items-end rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-[140px]">
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
                           <label className="text-sm font-semibold text-slate-700">Project Name <span className="text-red-500">*</span></label>
                           <input
                              type="text"
                              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orangeFpt-500/10 ${
                                 formErrors.projectName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orangeFpt-500'
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
                           <label className="text-sm font-semibold text-slate-700">Subject <span className="text-red-500">*</span></label>
                           {isLoadingSubjects ? (
                              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100"></div>
                           ) : (
                              <select
                                 className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orangeFpt-500/10 ${
                                    formErrors.subjectId ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orangeFpt-500'
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
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
                           <textarea
                              rows={5}
                              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orangeFpt-500/10 ${
                                 formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orangeFpt-500'
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
                              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${isDragOver ? 'border-orangeFpt-500 bg-orangeFpt-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
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
                                 <div className="flex items-center gap-4 w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
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
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-500 mb-3">
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
                           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                              <ScrollText size={18} />
                           </div>
                           <h3 className="font-bold text-slate-800">Business Rules</h3>
                           <InfoTooltip text="Define the constraints and logic that govern your project. Use bullet points or numbered lists for clarity." />
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">
                              Rules & Constraints <span className="text-red-500">*</span>
                           </label>
                           <textarea
                              rows={6}
                              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orangeFpt-500/10 ${
                                 formErrors.businessRules ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orangeFpt-500'
                              }`}
                              placeholder="Enter business rules (one per line):&#10;- Users must register before making purchases&#10;- Orders over $100 get free shipping&#10;- Passwords must be at least 8 characters"
                              value={formState.businessRules}
                              onChange={(e) => handleBaseFieldChange("businessRules", e.target.value)}
                              onBlur={(e) => handleFieldBlur("businessRules", e.target.value)}
                           />
                           {formErrors.businessRules && <p className="text-xs text-red-500">{formErrors.businessRules}</p>}
                           <p className="text-xs text-slate-400">
                              Tip: Use "- rule" or "1. rule" format for better readability. {businessRulesCount} rule(s) detected.
                           </p>
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
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
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
                              Selected Actors <span className="text-red-500">*</span>
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
                                 className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-orangeFpt-500"
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
                                 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
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
                              <span className="text-lg font-bold text-orangeFpt-600">{readinessProgress}%</span>
                           </div>
                           <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                 className="h-full bg-orangeFpt-500 transition-all duration-500 ease-out rounded-full"
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
                              className="w-full rounded-xl bg-orangeFpt-500 py-3 text-sm font-bold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </DashboardLayout>
   );
};

export default CreateProject;
