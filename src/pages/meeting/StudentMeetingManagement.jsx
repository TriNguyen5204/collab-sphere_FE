import React, { useEffect, useState } from 'react';
import {
  getMeeting,
  deleteMeeting,
  updateMeeting,
} from '../../features/meeting/services/meetingApi';
import { toast } from 'sonner';
import {
  Calendar,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  User,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import useToastConfirmation from '../../hooks/useToastConfirmation';

const MeetingManagement = () => {
  const { teamId } = useParams();
  const teamIdNumber = parseInt(teamId) || 2;
  const confirmWithToast = useToastConfirmation();
  
  const [meetings, setMeetings] = useState([]);
  const [filters, setFilters] = useState({
    teamId: teamIdNumber,
    title: '',
    scheduleTime: '',
    status: '',
    isDesc: true,
    pageNum: 1,
    pageSize: 8,
  });
  const [pagination, setPagination] = useState({ pageCount: 1, itemCount: 0 });
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editForm, setEditForm] = useState({
    meetingId: '',
    Title: '',
    Description: '',
    ScheduleTime: '',
    Status: '',
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
      1: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Check },
      2: { label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    };
    
    const config = statusConfig[status] || { label: 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: AlertCircle };
    // const Icon = config.icon; // Icon removed to match ProjectLibrary style more closely or keep it minimal
    
    return (
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // UTC conversion
  const convertToUTC = localDateStr => {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  };

  // Fetch meetings
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const payload = {
        ...filters,
        scheduleTime: convertToUTC(filters.scheduleTime),
      };
      
      const res = await getMeeting(payload);
      
      if (res?.isSuccess && res.paginatedMeeting?.list) {
        setMeetings(res.paginatedMeeting.list);
        setPagination({
          pageCount: res.paginatedMeeting.pageCount,
          itemCount: res.paginatedMeeting.itemCount,
        });
      } else {
        setMeetings([]);
        toast.warning('No meetings found');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [filters.pageNum, filters.pageSize]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, pageNum: 1 }));
    fetchMeetings();
  };

  const handleReset = () => {
    setFilters({
      teamId: teamIdNumber,
      title: '',
      scheduleTime: '',
      status: '',
      isDesc: true,
      pageNum: 1,
      pageSize: 8,
    });
    fetchMeetings();
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setFilters(prev => ({ ...prev, pageNum: newPage }));
    }
  };

  // Delete
  const handleDelete = async id => {
    const confirmed = await confirmWithToast({
      message: 'Are you sure you want to delete this meeting?',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      const res = await deleteMeeting(id);
      if (res) {
        toast.success(res.message);
        fetchMeetings();
      } else toast.error('Failed to delete meeting');
    } catch (err) {
      const backendError = err.response?.data;
      if (backendError?.errorList) {
        const message = backendError.errorList.map(e => e.message).join(', ');
        toast.error(`⚠️ ${message}`);
      } else {
        toast.error('Server error while deleting meeting.');
      }
    }
  };

  // Open edit modal
  const openEditModal = m => {
    setEditingMeeting(m);
    setEditForm({
      meetingId: m.meetingId,
      Title: m.title,
      Description: m.description || '',
      ScheduleTime: m.scheduleTime
        ? new Date(m.scheduleTime).toISOString().slice(0, 16)
        : '',
      Status: m.status ?? '',
    });
  };

  // Submit update
  const handleUpdateSubmit = async e => {
    e.preventDefault();
    const title = editForm.Title.trim() || editingMeeting.title;
    if (!title) return toast.error('Title is required');

    const payload = {
      meetingId: editForm.meetingId,
      Title: title,
      Description: editForm.Description,
      ScheduleTime: convertToUTC(editForm.ScheduleTime),
      Status: parseInt(editForm.Status) || editingMeeting.status,
    };

    try {
      const res = await updateMeeting(payload);
      if (res?.isSuccess) {
        toast.success('✅ Meeting updated successfully');
        setEditingMeeting(null);
        fetchMeetings();
      } else toast.error('Failed to update meeting');
    } catch (err) {
      const backendError = err.response?.data;
      if (backendError?.errorList?.length) {
        const message = backendError.errorList.map(e => e.message).join(', ');
        toast.error(`⚠️ ${message}`);
      } else {
        toast.error('Server error while updating meeting.');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-slate-50/50">
        
        {/* --- HERO SECTION --- */}
        <header className="relative rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Meeting Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage your meetings, track schedules, and organize team collaborations.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               <button
                 onClick={fetchMeetings}
                 disabled={loading}
                 className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-orangeFpt-600 active:scale-95 disabled:opacity-50"
               >
                 <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                 <span>Refresh</span>
               </button>
            </div>
          </div>
        </header>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <span className="text-sm text-gray-500">
                {showFilters ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>

          {showFilters && (
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Title
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      value={filters.title}
                      onChange={handleFilterChange}
                      placeholder="Search meetings..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduleTime"
                    value={filters.scheduleTime}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Status</option>
                    <option value="0">Cancelled</option>
                    <option value="1">Completed</option>
                    <option value="2">Upcoming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <select
                    name="isDesc"
                    value={filters.isDesc}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                  >
                    <option value={true}>Newest First</option>
                    <option value={false}>Oldest First</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white px-6 py-2.5 rounded-xl hover:from-orangeFpt-600 hover:to-orangeFpt-700 transition-all shadow-md hover:shadow-lg shadow-orangeFpt-500/20"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meetings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orangeFpt-200 border-t-orangeFpt-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading meetings...</p>
            </div>
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new meeting</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.meetingId}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-orangeFpt-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {new Date(meeting.scheduleTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500" title={`Created by ${meeting.creatorName}`}>
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{meeting.creatorName}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-orangeFpt-600 transition-colors" title={meeting.title}>
                      {meeting.title}
                    </h3>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>

                <p className="mb-4 text-xs text-slate-500 line-clamp-2 flex-1">
                  {meeting.description || "No description provided."}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                   <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(meeting.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(meeting)}
                        className="p-1.5 hover:bg-orangeFpt-50 rounded-lg transition-colors group/btn text-slate-400 hover:text-orangeFpt-600"
                        title="Edit meeting"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.meetingId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group/btn text-slate-400 hover:text-red-600"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing page <span className="font-semibold">{filters.pageNum}</span> of{' '}
              <span className="font-semibold">{pagination.pageCount}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.pageNum - 1)}
                disabled={filters.pageNum <= 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {[...Array(pagination.pageCount)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                      filters.pageNum === i + 1
                        ? 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white shadow-md shadow-orangeFpt-500/20'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(filters.pageNum + 1)}
                disabled={filters.pageNum >= pagination.pageCount}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingMeeting && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn p-4"
            onClick={() => setEditingMeeting(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp ring-1 ring-slate-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orangeFpt-50 rounded-xl text-orangeFpt-600">
                      <Edit className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Edit Meeting</h2>
                      <p className="text-slate-500 text-sm mt-1">Update meeting details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingMeeting(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateSubmit} className="p-8">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.Title}
                      onChange={e =>
                        setEditForm({ ...editForm, Title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                      placeholder="Enter meeting title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.Description}
                      onChange={e =>
                        setEditForm({ ...editForm, Description: e.target.value })
                      }
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent resize-none transition-all"
                      placeholder="Add meeting description..."
                    />
                  </div>

                  {/* Schedule Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Schedule Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.ScheduleTime}
                      onChange={e =>
                        setEditForm({ ...editForm, ScheduleTime: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editForm.Status}
                      onChange={e =>
                        setEditForm({ ...editForm, Status: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all"
                    >
                      <option value="0">Cancelled</option>
                      <option value="1">Completed</option>
                      <option value="2">Upcoming</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white rounded-xl hover:from-orangeFpt-600 hover:to-orangeFpt-700 font-semibold transition-all shadow-md hover:shadow-lg shadow-orangeFpt-500/20"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMeeting(null)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Styles for Modal Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </StudentLayout>
  );
};

export default MeetingManagement;
