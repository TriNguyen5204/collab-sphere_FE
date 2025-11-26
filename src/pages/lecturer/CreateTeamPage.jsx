import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  IdentificationIcon, 
  LinkIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { getClassDetail } from '../../services/userService';
import { createTeam } from '../../services/teamApi';
import { getClassProjects } from '../../services/projectApi';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const CreateTeamPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    teamName: '',
    enrolKey: '',
    gitLink: '',
    description: '',
    projectAssignmentId: '',
    leaderId: '',
    endDate: '',
  });
  
  const [selectedMembers, setSelectedMembers] = useState([]);

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

        setClassInfo(detail);
        
        // Extract Projects
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else if (detail.projectAssignments) {
          setProjects(detail.projectAssignments);
        }

        // Extract & Filter Students (Only those without a team)
        if (detail.classMembers) {
          // Filter students who don't have a teamId, or have explicit "no team" markers
          const freeStudents = detail.classMembers.filter(s => 
            !s.teamId || s.teamName === 'Unassigned' || s.teamName === 'NOT FOUND'
          );
          setAvailableStudents(freeStudents);
        }

        // Initialize endDate if available
        if (detail.endDate) {
          const d = new Date(detail.endDate);
          if (!Number.isNaN(d.getTime())) {
            setFormData(prev => ({ ...prev, endDate: d.toISOString().split('T')[0] }));
          }
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

  const handleMemberToggle = (student) => {
    if (selectedMembers.find(m => m.studentId === student.studentId)) {
      setSelectedMembers(prev => prev.filter(m => m.studentId !== student.studentId));
      // If leader was removed, clear leader selection
      if (formData.leaderId === student.studentId) {
        setFormData(prev => ({ ...prev, leaderId: '' }));
      }
    } else {
      setSelectedMembers(prev => [...prev, student]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim()) return toast.error('Team Name is required');
    if (formData.teamName.trim().length < 3 || formData.teamName.trim().length > 100) {
      return toast.error('Team Name must be between 3 and 100 characters');
    }
    if (!formData.enrolKey.trim()) return toast.error('Enrollment Key is required');
    if (selectedMembers.length === 0) return toast.error('Please select at least one member');
    
    // Validate End Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!formData.endDate) return toast.error('End Date is required');
    const selectedEndDate = new Date(formData.endDate);
    selectedEndDate.setHours(0, 0, 0, 0);

    if (selectedEndDate <= today) {
      return toast.error('End Date must be later than today (Create Date)');
    }

    // If no leader selected, default to first member or ask user? 
    // For now, let's require leader if members > 0, or auto-assign first.
    // The API might require leaderId.
    let finalLeaderId = formData.leaderId;
    if (!finalLeaderId && selectedMembers.length > 0) {
      finalLeaderId = selectedMembers[0].studentId;
    }

    setSubmitting(true);
    try {
      // Format date to YYYY-MM-DD
      const formatDateForApi = (dateVal) => {
        if (!dateVal) return null;
        const d = new Date(dateVal);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      };

      const payload = {
        teamName: formData.teamName,
        enrolKey: formData.enrolKey,
        description: formData.description,
        gitLink: formData.gitLink,
        classId: Number(classId),
        projectAssignmentId: formData.projectAssignmentId ? Number(formData.projectAssignmentId) : 0,
        lecturerId: classInfo?.lecturerId ? Number(classInfo.lecturerId) : 0,
        leaderId: Number(finalLeaderId),
        studentList: selectedMembers.map(m => ({
          studentId: Number(m.studentId),
          classId: Number(classId)
        })),
        createdDate: formatDateForApi(new Date()),
        endDate: formatDateForApi(formData.endDate)
      };

      console.log('Selected Members:', selectedMembers);
      console.log('Create Team Payload:', payload);
      const response = await createTeam(payload);
      
      if (response && response.isSuccess === false) {
        // If API returns 200 OK but with isSuccess: false
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
      
      // Handle manual throws
      if (error.message && !error.response) {
        toast.error(error.message);
        return;
      }

      if (resData?.errorList && Array.isArray(resData.errorList)) {
        const messages = resData.errorList.map(e => `${e.field}: ${e.message}`).join('\n');
        toast.error(messages);
      } else if (resData?.errors && typeof resData.errors === 'object') {
        // Handle ASP.NET Core standard validation errors
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex justify-center text-slate-500">Loading context...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="mb-6">
          <LecturerBreadcrumbs items={breadcrumbItems} />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Team</h1>
              <p className="text-slate-500 mt-1">Form a new team for {classInfo?.className}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Team Details */}
            <div className={`lg:col-span-2 space-y-6 p-6 rounded-3xl ${glassPanelClass}`}>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <IdentificationIcon className="w-5 h-5 text-indigo-600" />
                Team Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Team Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g. Alpha Squad"
                    value={formData.teamName}
                    onChange={e => setFormData({...formData, teamName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Enrollment Key <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="Secret key for joining"
                    value={formData.enrolKey}
                    onChange={e => setFormData({...formData, enrolKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Project Assignment</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  value={formData.projectAssignmentId}
                  onChange={e => setFormData({...formData, projectAssignmentId: e.target.value})}
                >
                  <option value="">-- Select a Project (Optional) --</option>
                  {projects.map(p => (
                    <option key={p.projectAssignmentId || p.id} value={p.projectAssignmentId || p.id}>
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Assigning a project now will link the team immediately.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  value={formData.endDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
                <p className="text-xs text-slate-500">Must be later than today.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Git Repository</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="https://github.com/..."
                    value={formData.gitLink}
                    onChange={e => setFormData({...formData, gitLink: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                  placeholder="Brief description of the team..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: Members */}
            <div className={`space-y-6 p-6 rounded-3xl ${glassPanelClass}`}>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                Members ({selectedMembers.length})
              </h2>

              {/* Member Selection List */}
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {availableStudents.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No available students found.</p>
                  ) : (
                    availableStudents.map(student => {
                      const isSelected = selectedMembers.some(m => m.studentId === student.studentId);
                      return (
                        <div 
                          key={student.studentId}
                          onClick={() => handleMemberToggle(student)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-200' 
                              : 'bg-white border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {student.fullname}
                            </p>
                            <p className="text-xs text-slate-500">{student.studentCode}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Leader Selection (if members selected) */}
              {selectedMembers.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Select Team Leader</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
                    value={formData.leaderId}
                    onChange={e => setFormData({...formData, leaderId: e.target.value})}
                  >
                    <option value="">-- Auto-assign --</option>
                    {selectedMembers.map(m => (
                      <option key={m.studentId} value={m.studentId}>{m.fullname}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="lg:col-span-3 flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? 'Creating...' : 'Create Team'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTeamPage;
