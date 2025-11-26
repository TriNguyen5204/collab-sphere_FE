import React, { useEffect, useState } from 'react';
import {
  getMeeting,
  deleteMeeting,
  updateMeeting,
} from '../../services/meetingApi';
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

const MeetingManagement = () => {
  const { teamId } = useParams();
  const teamIdNumber = parseInt(teamId) || 2;
  
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
      0: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
      1: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
      2: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    };
    
    const config = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
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
    if (!window.confirm('Are you sure you want to delete this meeting?'))
      return;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                Meeting Management
              </h1>
              <p className="text-gray-600 mt-2 ml-1">
                Team #{teamIdNumber} • {pagination.itemCount} total meetings
              </p>
            </div>
            
            <button
              onClick={fetchMeetings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={true}>Newest First</option>
                    <option value={false}>Oldest First</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
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
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {meetings.map((meeting, idx) => (
              <div
                key={meeting.meetingId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {meeting.title}
                      </h3>
                      {getStatusBadge(meeting.status)}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(meeting)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                        title="Edit meeting"
                      >
                        <Edit className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.meetingId)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {meeting.description && (
                    <p className="text-gray-600 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}

                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{formatDate(meeting.scheduleTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Created by <span className="font-medium text-gray-900">{meeting.creatorName}</span></span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Meeting #{meeting.meetingId}</span>
                    <span>Team #{teamIdNumber}</span>
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4"
            onClick={() => setEditingMeeting(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 border-b border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Meeting</h2>
                      <p className="text-blue-100 text-sm mt-1">Update meeting details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingMeeting(null)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateSubmit} className="p-8">
                <div className="space-y-6">
                  {/* Meeting ID */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      value={editForm.meetingId}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                    />
                  </div>

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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    type="button"
                    onClick={() => setEditingMeeting(null)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MeetingManagement;