import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
   UploadCloud,
   FileText,
   X,
   Plus,
   Trash2,
   Calendar,
   Flag,
   CheckCircle2,
   Circle,
   AlertCircle,
   ArrowLeft,
   LayoutDashboard,
   Target
} from "lucide-react";

import { createProject } from "../../services/projectApi";
import { getAllSubject } from "../../services/userService";
import LecturerBreadcrumbs from "../../features/lecturer/components/LecturerBreadcrumbs";
// Reuse the dashboard layout to keep sidebar/nav consistent
import DashboardLayout from "../../components/layout/DashboardLayout";

const PRIORITY_OPTIONS = [
   { label: "High impact", value: "HIGH", color: "text-red-600 bg-red-50 border-red-200" },
   { label: "Medium focus", value: "MEDIUM", color: "text-orangeFpt-600 bg-orangeFpt-50 border-orangeFpt-200" },
   { label: "Foundational", value: "LOW", color: "text-slate-600 bg-slate-50 border-slate-200" },
];

const parseDateInput = (value) => {
   if (!value) return null;
   const parts = value.split("-").map(Number);
   if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
   const [year, month, day] = parts;
   const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
   return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const generateId = () => Math.random().toString(36).slice(2, 10);

const createEmptyMilestone = () => ({
   id: generateId(),
   title: "",
   description: "",
   startDate: "",
   endDate: "",
});

const createEmptyObjective = () => ({
   id: generateId(),
   description: "",
   priority: "MEDIUM",
   milestones: [createEmptyMilestone()],
});

const normaliseSubjectList = (payload) => {
   if (!payload) return [];
   if (Array.isArray(payload)) return payload;
   if (Array.isArray(payload?.data)) return payload.data;
   return [];
};

const CreateProject = () => {
   const { classId } = useParams();
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [subjects, setSubjects] = useState([]);
   const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
   const [subjectError, setSubjectError] = useState("");

   const [uploadedFile, setUploadedFile] = useState(null);
   const [isDragOver, setIsDragOver] = useState(false);

   const [formState, setFormState] = useState({
      projectName: "",
      subjectId: "",
      description: "",
      objectives: [createEmptyObjective()],
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

   const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }), []);

   const todayStr = useMemo(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
   }, []);

   // Readiness Logic
   const readinessChecklist = useMemo(() => {
      const projectNameReady = Boolean(formState.projectName.trim());
      const subjectReady = Boolean(formState.subjectId);
      const descriptionReady = Boolean(formState.description.trim());
      const hasDescribedObjective = formState.objectives.some((obj) => Boolean(obj.description.trim()));
      const milestonesValid = formState.objectives.every((obj) =>
         obj.milestones.length > 0 &&
         obj.milestones.every((m) => m.title.trim() && m.startDate && m.endDate && m.startDate <= m.endDate)
      );

      return [
         { id: "projectName", label: "Project name added", complete: projectNameReady },
         { id: "subject", label: "Subject selected", complete: subjectReady },
         { id: "description", label: "Description drafted", complete: descriptionReady },
         { id: "objectives", label: "Objectives defined", complete: hasDescribedObjective },
         { id: "milestones", label: "Milestones scheduled", complete: milestonesValid },
      ];
   }, [formState]);

   const readinessProgress = useMemo(() => {
      const total = readinessChecklist.length;
      if (!total) return 0;
      const completed = readinessChecklist.filter((item) => item.complete).length;
      return Math.round((completed / total) * 100);
   }, [readinessChecklist]);

   const totalMilestones = useMemo(() =>
      formState.objectives.reduce((count, obj) => count + obj.milestones.length, 0),
      [formState.objectives]);

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

   const handleObjectiveChange = (objId, key, value) => {
      setFormState(prev => ({
         ...prev,
         objectives: prev.objectives.map(obj => obj.id === objId ? { ...obj, [key]: value } : obj)
      }));
   };

   const handleMilestoneChange = (objId, mId, key, value) => {
      setFormState(prev => ({
         ...prev,
         objectives: prev.objectives.map(obj =>
            obj.id !== objId ? obj : {
               ...obj,
               milestones: obj.milestones.map(m => m.id === mId ? { ...m, [key]: value } : m)
            }
         )
      }));
   };

   const handleAddObjective = () => setFormState(prev => ({ ...prev, objectives: [...prev.objectives, createEmptyObjective()] }));
   const handleRemoveObjective = (id) => setFormState(prev => ({ ...prev, objectives: prev.objectives.filter(o => o.id !== id) }));

   const handleAddMilestone = (objId) => {
      setFormState(prev => ({
         ...prev,
         objectives: prev.objectives.map(obj =>
            obj.id === objId ? { ...obj, milestones: [...obj.milestones, createEmptyMilestone()] } : obj
         )
      }));
   };

   const handleRemoveMilestone = (objId, mId) => {
      setFormState(prev => ({
         ...prev,
         objectives: prev.objectives.map(obj =>
            obj.id === objId ? { ...obj, milestones: obj.milestones.filter(m => m.id !== mId) } : obj
         )
      }));
   };

   // File Upload Handlers
   const handleFileUpload = (file) => {
      if (!file) return;
      const allowed = file.type === "application/pdf" || file.type.includes("document") || file.type === "text/plain";
      if (!allowed) { alert("Please upload a PDF, Word document, or text file."); return; }
      setUploadedFile(file);
   };

   const validateForm = () => {
      const errors = {};
      if (!formState.projectName.trim()) errors.projectName = "Project name is required.";
      if (!formState.description.trim()) errors.description = "Project description is required.";
      if (!formState.subjectId) errors.subjectId = "Subject is required.";

      const objErrors = {};
      formState.objectives.forEach(obj => {
         const current = {};
         if (!obj.description.trim()) current.description = "Required";
         const mErrors = {};
         obj.milestones.forEach(m => {
            const mIssue = {};
            if (!m.title.trim()) mIssue.title = "Required";
            if (!m.startDate) mIssue.startDate = "Required";
            if (!m.endDate) mIssue.endDate = "Required";
            if (m.startDate && m.startDate < todayStr) mIssue.startDate = "Cannot be in the past";
            if (m.endDate && m.endDate < todayStr) mIssue.endDate = "Cannot be in the past";
            if (m.startDate && m.endDate && m.startDate > m.endDate) mIssue.endDate = "Invalid range";
            if (Object.keys(mIssue).length) mErrors[m.id] = mIssue;
         });
         if (Object.keys(mErrors).length) current.milestones = mErrors;
         if (Object.keys(current).length) objErrors[obj.id] = current;
      });

      if (Object.keys(objErrors).length) errors.objectives = objErrors;
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

      const payload = {
         project: {
            projectName: formState.projectName.trim(),
            description: formState.description.trim(),
            lecturerId: Number(lecturerId),
            subjectId: Number(formState.subjectId),
            objectives: formState.objectives.map((obj) => ({
               description: obj.description.trim(),
               priority: obj.priority,
               objectiveMilestones: obj.milestones.map((m) => ({
                  title: m.title.trim(),
                  description: m.description.trim(),
                  startDate: m.startDate,
                  endDate: m.endDate,
               })),
            })),
         }
      };

      setIsSubmitting(true);
      try {
         await createProject(payload);
         // Optional: Add success toast here
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
                           Design a structured project with clear objectives and milestones to guide student teams through their coursework.
                        </p>
                     </div>

                  </div>

                  <div className="flex gap-4">
                     <div className="flex flex-col items-end rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-[140px]">
                        <span className="text-xs font-bold uppercase text-slate-400">Objectives</span>
                        <span className="text-3xl font-bold text-orangeFpt-600">{formState.objectives.length}</span>
                     </div>
                     <div className="flex flex-col items-end rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-[140px]">
                        <span className="text-xs font-bold uppercase text-slate-400">Milestones</span>
                        <span className="text-3xl font-bold text-blue-600">{totalMilestones}</span>
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

                  {/* 2. Objectives & Milestones */}
                  <section className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">2. Objectives & Milestones</h2>
                        <button
                           type="button"
                           onClick={handleAddObjective}
                           className="flex items-center gap-2 text-sm font-semibold text-orangeFpt-600 hover:text-orangeFpt-700"
                        >
                           <Plus size={16} /> Add Objective
                        </button>
                     </div>

                     {formState.objectives.map((objective, index) => {
                        const objError = formErrors.objectives?.[objective.id] || {};

                        return (
                           <div key={objective.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                              <div className="mb-4 flex items-start justify-between">
                                 <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                       {index + 1}
                                    </span>
                                    <h3 className="font-bold text-slate-800">Learning Objective</h3>
                                 </div>
                                 <button
                                    onClick={() => handleRemoveObjective(objective.id)}
                                    disabled={formState.objectives.length === 1}
                                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                 <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                                    <input
                                       type="text"
                                       className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none"
                                       placeholder="e.g. Design a scalable database schema"
                                       value={objective.description}
                                       onChange={(e) => handleObjectiveChange(objective.id, "description", e.target.value)}
                                    />
                                    {objError.description && <p className="text-xs text-red-500">{objError.description}</p>}
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Priority</label>
                                    <select
                                       className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none"
                                       value={objective.priority}
                                       onChange={(e) => handleObjectiveChange(objective.id, "priority", e.target.value)}
                                    >
                                       {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                 </div>
                              </div>

                              {/* Milestones Area */}
                              <div className="mt-6 space-y-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Milestones Timeline</span>
                                    <button
                                       type="button"
                                       onClick={() => handleAddMilestone(objective.id)}
                                       className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                       + Add Step
                                    </button>
                                 </div>

                                 {objective.milestones.map((milestone, mIdx) => {
                                    const mErr = objError.milestones?.[milestone.id] || {};
                                    return (
                                       <div key={milestone.id} className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
                                          <div className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 mt-2">
                                             {mIdx + 1}
                                          </div>

                                          <div className="flex-1 space-y-3">
                                             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                   <input
                                                      type="text"
                                                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium placeholder:font-normal focus:border-blue-500 focus:outline-none"
                                                      placeholder="Milestone Title"
                                                      value={milestone.title}
                                                      onChange={(e) => handleMilestoneChange(objective.id, milestone.id, "title", e.target.value)}
                                                   />
                                                   {mErr.title && <p className="text-xs text-red-500 mt-1">{mErr.title}</p>}
                                                </div>
                                                <div className="flex gap-2">
                                                   <div className="flex-1">
                                                      <input
                                                         type="date"
                                                         min={todayStr}
                                                         className={`w-full rounded-lg border px-2 py-1.5 text-xs focus:outline-none ${
                                                            mErr.startDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                                                         }`}
                                                         value={milestone.startDate}
                                                         onChange={(e) => handleMilestoneChange(objective.id, milestone.id, "startDate", e.target.value)}
                                                      />
                                                      {mErr.startDate && <p className="text-[10px] text-red-500">{mErr.startDate}</p>}
                                                      {!mErr.startDate && milestone.startDate && milestone.startDate < todayStr && (
                                                         <p className="text-[10px] text-red-500">Cannot be in the past</p>
                                                      )}
                                                   </div>
                                                   <div className="flex-1">
                                                      <input
                                                         type="date"
                                                         min={todayStr}
                                                         className={`w-full rounded-lg border px-2 py-1.5 text-xs focus:outline-none ${
                                                            mErr.endDate || (milestone.startDate && milestone.endDate && milestone.startDate > milestone.endDate)
                                                               ? 'border-red-500 focus:border-red-500'
                                                               : 'border-slate-200 focus:border-blue-500'
                                                         }`}
                                                         value={milestone.endDate}
                                                         onChange={(e) => handleMilestoneChange(objective.id, milestone.id, "endDate", e.target.value)}
                                                      />
                                                      {mErr.endDate && <p className="text-[10px] text-red-500">{mErr.endDate}</p>}
                                                      {!mErr.endDate && milestone.endDate && milestone.endDate < todayStr && (
                                                         <p className="text-[10px] text-red-500">Cannot be in the past</p>
                                                      )}
                                                      {!mErr.endDate && milestone.startDate && milestone.endDate && milestone.startDate > milestone.endDate && (
                                                         <p className="text-[10px] text-red-500">Must be after start date</p>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                             <textarea
                                                rows={2}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                                                placeholder="Deliverables or criteria..."
                                                value={milestone.description}
                                                onChange={(e) => handleMilestoneChange(objective.id, milestone.id, "description", e.target.value)}
                                             />
                                          </div>

                                          <button
                                             onClick={() => handleRemoveMilestone(objective.id, milestone.id)}
                                             className="absolute top-0 right-0 p-1 text-slate-300 hover:text-red-500"
                                          >
                                             <X size={14} />
                                          </button>
                                       </div>
                                    );
                                 })}
                                 {objError.milestones?.general && <p className="text-xs text-red-500 text-center">{objError.milestones.general}</p>}
                              </div>
                           </div>
                        );
                     })}
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
                              <span className="text-slate-500">Total Milestones</span>
                              <span className="font-medium text-slate-800">{totalMilestones}</span>
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
