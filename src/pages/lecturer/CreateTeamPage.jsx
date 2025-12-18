import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  IdentificationIcon,
  LinkIcon,
  CheckCircleIcon,
  PlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { getClassDetail } from '../../services/userService';
import { createTeam } from '../../services/teamApi';
import { getClassProjects } from '../../services/projectApi';
import { getSemester } from '../../services/userService';
import { useAvatar } from '../../hooks/useAvatar'; // Import the hook

// --- Sub-Component for Individual Student Item ---
const StudentListItem = ({ student, isSelected, onToggle }) => {
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(student.fullname, student.avatarImg);

  return (
    <div
      onClick={() => onToggle(student)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected
          ? 'bg-orangeFpt-50 border-orangeFpt-200 shadow-sm'
          : 'bg-white border-transparent hover:bg-slate-50'
        }`}
    >
      {/* Avatar Section */}
      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden border ${shouldShowImage ? 'border-slate-200' : `${colorClass} border-transparent`
        }`}>
        {shouldShowImage ? (
          <img
            src={student.avatarImg}
            alt={student.fullname}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={isSelected ? 'text-orangeFpt-700' : ''}>{initials}</span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orangeFpt-900' : 'text-slate-700'}`}>
          {student.fullname}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          {student.studentCode}
        </p>
      </div>

      {/* Selection Icon */}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-orangeFpt-500 border-orangeFpt-500' : 'border-slate-300 bg-white'
        }`}>
        {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
      </div>
    </div>
  );
};


const CreateTeamPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterEndDate, setSemesterEndDate] = useState(null);
  const [semesterStartDate, setSemesterStartDate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    teamName: '',
    description: '',
    projectAssignmentId: '',
    leaderId: '',
    endDate: '',
  });

  const [selectedMembers, setSelectedMembers] = useState([]);

  // Validation State
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState([]);

  // Load Data Effect (Same as before)
  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [detail, projectsData] = await Promise.all([
          getClassDetail(classId),
          getClassProjects(classId).catch(err => {
            console.error('Failed to fetch projects', err);
            return [];
          })
        ]);
        console.log('Class detail loaded:', detail);
        console.log('Projects loaded:', projectsData);
        setClassInfo(detail);
        const semesterList = await getSemester();
        const currentSemester = semesterList.find(sem => sem.semesterName === detail.semesterName);
        setSemesterEndDate(currentSemester ? new Date(currentSemester.endDate) : null);
        setSemesterStartDate(currentSemester ? new Date(currentSemester.startDate) : null);
        console.log('Current semester:', currentSemester);

        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else if (detail.projectAssignments) {
          setProjects(detail.projectAssignments);
        }

        if (detail.classMembers) {
          const freeStudents = detail.classMembers.filter(s => {
            return !s.isGrouped && (!s.teamId || s.teamId === 0);
          });
          setAvailableStudents(freeStudents);
        }

        if (detail.endDate) {
          const d = new Date(detail.endDate);
          if (!Number.isNaN(d.getTime())) {
            setFormData(prev => ({ ...prev, endDate: d.toISOString().split('T')[0] }));
          }
        } else {
          const semesterEndDate = currentSemester?.endDate;
          setFormData(prev => ({ ...prev, endDate: semesterEndDate ? new Date(semesterEndDate).toISOString().split('T')[0] : '' }));
        }

        const semesterStartDate = currentSemester?.startDate;
        if (semesterStartDate) {
          setFormData(prev => ({ ...prev, startDate: new Date(semesterStartDate).toISOString().split('T')[0] }));
        }
      } catch (error) {
        console.error('Failed to load class context', error);
        toast.error('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return availableStudents;
    const lower = searchTerm.toLowerCase();
    return availableStudents.filter(s =>
      (s.fullname || '').toLowerCase().includes(lower) ||
      (s.studentCode || '').toLowerCase().includes(lower)
    );
  }, [availableStudents, searchTerm]);

  const handleMemberToggle = (student) => {
    if (selectedMembers.find(m => m.studentId === student.studentId)) {
      setSelectedMembers(prev => prev.filter(m => m.studentId !== student.studentId));
      if (String(formData.leaderId) === String(student.studentId)) {
        setFormData(prev => ({ ...prev, leaderId: '' }));
      }
    } else {
      setSelectedMembers(prev => [...prev, student]);
      // Clear member error if adding
      if (errors.members) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.members;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToShake = [];

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team Name is required';
      fieldsToShake.push('teamName');
    } else if (formData.teamName.trim().length < 3 || formData.teamName.trim().length > 100) {
      newErrors.teamName = 'Team Name must be between 3 and 100 characters';
      fieldsToShake.push('teamName');
    }

    if (!formData.projectAssignmentId) {
      newErrors.projectAssignmentId = 'Please select a project assignment';
      fieldsToShake.push('projectAssignmentId');
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End Date is required';
      fieldsToShake.push('endDate');
    } else {
      const selectedEndDate = new Date(formData.endDate);
      selectedEndDate.setHours(0, 0, 0, 0);
      if (selectedEndDate > semesterEndDate) {
        newErrors.endDate = 'End Date must be later than' + ` semester end date (${semesterEndDate.toISOString().split('T')[0]})`;
        fieldsToShake.push('endDate');
      } else {
        if (selectedEndDate < semesterStartDate) {
          newErrors.endDate = 'End Date must be later than' + ` semester start date (${semesterStartDate.toISOString().split('T')[0]})`;
          fieldsToShake.push('endDate');
        }
      }
    }

    if (selectedMembers.length === 0) {
      newErrors.members = 'Please select at least one member';
      fieldsToShake.push('members');
    }

    setErrors(newErrors);
    setShakeFields(fieldsToShake);

    // Reset shake after animation
    if (fieldsToShake.length > 0) {
      setTimeout(() => setShakeFields([]), 600);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let finalLeaderId = formData.leaderId;
    if (!finalLeaderId && selectedMembers.length > 0) {
      finalLeaderId = selectedMembers[0].studentId;
    }

    setSubmitting(true);
    try {
      const formatDateForApi = (dateVal) => {
        if (!dateVal) return null;
        const d = new Date(dateVal);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      };

      const payload = {
        teamName: formData.teamName,
        description: formData.description,
        classId: Number(classId),
        projectAssignmentId: formData.projectAssignmentId ? Number(formData.projectAssignmentId) : 0,
        lecturerId: classInfo?.lecturerId ? Number(classInfo.lecturerId) : 0,
        leaderId: Number(finalLeaderId),
        studentList: selectedMembers
          .filter(m => Number(m.studentId) !== Number(finalLeaderId))
          .map(m => ({
            studentId: Number(m.studentId),
            classId: Number(classId)
          })),
        createdDate: formatDateForApi(formData.startDate),
        endDate: formatDateForApi(formData.endDate)
      };
      console.log('Submitting create team with payload:', payload);
      const response = await createTeam(payload);
      if (response && response.isSuccess === false) {
        const errorMsg = response.message || 'Failed to create team';
        if (response.errorList && Array.isArray(response.errorList)) {
          const messages = response.errorList.map(e => `${e.field}: ${e.message}`).join('\n');
          throw new Error(messages);
        }
        throw new Error(errorMsg);
      }

      toast.success('Team created successfully');
      navigate(`/lecturer/classes/${classId}`);
    } catch (error) {
      console.error('Create team error', error);
      const resData = error?.response?.data;

      if (error.message && !error.response) {
        toast.error(error.message);
        return;
      }

      if (resData?.errorList && Array.isArray(resData.errorList)) {
        const messages = resData.errorList.map(e => `${e.field}: ${e.message}`).join('\n');
        toast.error(messages);
      } else if (resData?.errors && typeof resData.errors === 'object') {
        const messages = Object.entries(resData.errors)
          .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        toast.error(messages);
      } else {
        toast.error(resData?.message || 'Failed to create team');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: classInfo?.className || 'Class', href: `/lecturer/classes/${classId}` },
    { label: 'Create Team' }
  ], [classId, classInfo]);

  // Helper to check if field should shake
  const getFieldClass = (fieldName) => {
    const baseClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all";
    const errorClass = "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";
    const normalClass = "border-slate-200 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10";
    const shakeClass = shakeFields.includes(fieldName) ? "animate-shake" : "";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass} ${shakeClass}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Add custom keyframe for shake animation if not already in your global CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      <div className=" space-y-8 bg-slate-50/50">

        {/* --- HEADER --- */}
        <div className="mx-auto">
          <LecturerBreadcrumbs items={breadcrumbItems} />

          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orangeFpt-600 transition-colors"
                  >
                    <ArrowLeftIcon className="h-4 w-4" /> Back
                  </button>
                  <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                    Team Management
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900"></h1>
                  <p className="mt-2 text-lg text-slate-600">
                    Form a new student group for <strong>{classInfo?.className}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FORM CONTENT --- */}
        <form onSubmit={handleSubmit} className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* LEFT: TEAM DETAILS */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                  <IdentificationIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Team Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Team Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Alpha Squad"
                    className={getFieldClass('teamName')}
                    value={formData.teamName}
                    onChange={e => {
                      setFormData({ ...formData, teamName: e.target.value });
                      if (errors.teamName) setErrors({ ...errors, teamName: null });
                    }}
                  />
                  {errors.teamName && <p className="text-xs text-red-500 animate-pulse">{errors.teamName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">End Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={getFieldClass('endDate')}
                    value={formData.endDate}
                    onChange={e => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (errors.endDate) setErrors({ ...errors, endDate: null });
                    }}
                  />
                  {errors.endDate && <p className="text-xs text-red-500 animate-pulse">{errors.endDate}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Project Assignment <span className="text-red-500">*</span></label>
                  <select
                    className={`${getFieldClass('projectAssignmentId')} bg-white`}
                    value={formData.projectAssignmentId}
                    onChange={e => {
                      setFormData({ ...formData, projectAssignmentId: e.target.value });
                      if (errors.projectAssignmentId) setErrors({ ...errors, projectAssignmentId: null });
                    }}
                  >
                    <option value="">-- Select a Project --</option>
                    {projects.map(p => (
                      <option key={p.projectAssignmentId || p.id} value={p.projectAssignmentId || p.id}>
                        {p.projectName || p.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectAssignmentId && <p className="text-xs text-red-500 animate-pulse">{errors.projectAssignmentId}</p>}
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3 text-orangeFpt-500" />
                    Assigning a project now will link the team immediately.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-4 focus:ring-orangeFpt-500/10 transition-all resize-none"
                    placeholder="Brief description of the team's goals..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: MEMBERS */}
          <div className="space-y-6">
            <div className={`rounded-2xl border bg-white p-6 shadow-sm flex flex-col h-full max-h-[500px] transition-colors ${errors.members ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <UserGroupIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${errors.members ? 'text-red-600' : 'text-slate-800'}`}>Members <span className="text-red-500">*</span></h2>
                    <p className="text-xs text-slate-500">{selectedMembers.length} Selected</p>
                  </div>
                </div>
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* List using StudentListItem component */}
                <div className={`flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar ${shakeFields.includes('members') ? 'animate-shake' : ''}`}>
                  {filteredStudents.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      {searchTerm ? 'No matching students found.' : 'No available students.'}
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = selectedMembers.some(m => m.studentId === student.studentId);
                      return (
                        <StudentListItem
                          key={student.studentId}
                          student={student}
                          isSelected={isSelected}
                          onToggle={handleMemberToggle}
                        />
                      );
                    })
                  )}
                </div>
                {errors.members && (
                  <p className="text-xs text-red-500 font-medium text-center animate-pulse">
                    {errors.members}
                  </p>
                )}
              </div>

              {/* Leader Select (Fixed at bottom) */}
              {selectedMembers.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Team Leader</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none bg-white"
                    value={formData.leaderId}
                    onChange={e => setFormData({ ...formData, leaderId: e.target.value })}
                  >
                    <option value="">-- Auto Assign First Member --</option>
                    {selectedMembers.map(m => (
                      <option key={m.studentId} value={m.studentId}>{m.fullname}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="lg:col-span-3 flex justify-end gap-4 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-orangeFpt-500 text-white font-semibold text-sm shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Creating...' : (
                <>
                  <PlusIcon className="h-5 w-5" /> Create Team
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateTeamPage;
