import React, { useEffect, useState } from 'react';
import {
  getMeeting,
  deleteMeeting,
  updateMeeting,
} from '../../services/meetingApi';
import Sidebar from './Sidebar';
import { toast } from 'sonner';
import {
  Calendar,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [filters, setFilters] = useState({
    teamId: 2,
    title: '',
    scheduleTime: '',
    status: '',
    isDesc: true,
    pageNum: 1,
    pageSize: 6,
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

  // 🧭 UTC conversion
  const convertToUTC = localDateStr => {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  };

  // 🧠 Fetch meetings
  const fetchMeetings = async () => {
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

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setFilters(prev => ({ ...prev, pageNum: newPage }));
    }
  };

  // 🗑️ Delete
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
      const backendError = err.response.data;
      console.log(backendError);
      if (backendError?.errorList) {
        const message = backendError.errorList.map(e => e.message).join(', ');
        toast.error(`⚠️ ${message}`);
      } else {
        toast.error('Server error while deleting meeting.');
      }
    }
  };

  // ✏️ Open edit modal
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

  // 💾 Submit update
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
        toast.success('✅ Meeting updated');
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

  return (
    <div className='flex'>
      <Sidebar />
      <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pd-14 sm:px-14'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            <Calendar className='w-7 h-7 text-blue-600' />
            Meeting Management
          </h1>
        </div>

        {/* Filters */}
        <div className='bg-white p-5 rounded-xl shadow-md border border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Title</label>
              <input
                type='text'
                name='title'
                value={filters.title}
                onChange={handleFilterChange}
                placeholder='Search by title'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Schedule Time
              </label>
              <input
                type='datetime-local'
                name='scheduleTime'
                value={filters.scheduleTime}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Status
              </label>
              <input
                type='number'
                name='status'
                value={filters.status}
                onChange={handleFilterChange}
                placeholder='0 / 1 / 2'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>
                Is Desc
              </label>
              <select
                name='isDesc'
                value={filters.isDesc}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className='mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all'
          >
            <Filter className='w-4 h-4' /> Apply Filters
          </button>
        </div>

        {/* Table */}
        <div className='bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 sticky top-0 text-gray-700 font-semibold'>
              <tr>
                <th className='px-4 py-3'>#</th>
                <th className='px-4 py-3'>Title</th>
                <th className='px-4 py-3'>Description</th>
                <th className='px-4 py-3'>Schedule Time</th>
                <th className='px-4 py-3'>Creator</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan='7' className='text-center py-6 text-gray-500'>
                    No meetings found.
                  </td>
                </tr>
              ) : (
                meetings.map((m, idx) => (
                  <tr
                    key={m.meetingId}
                    className='border-t hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-2'>{idx + 1}</td>
                    <td className='px-4 py-2 font-medium text-gray-800'>
                      {m.title}
                    </td>
                    <td className='px-4 py-2 text-gray-700 truncate max-w-[200px]'>
                      {m.description || '—'}
                    </td>
                    <td className='px-4 py-2'>
                      {new Date(m.scheduleTime).toLocaleString()}
                    </td>
                    <td className='px-4 py-2'>{m.creatorName}</td>
                    <td className='px-4 py-2 text-right flex justify-end gap-2'>
                      <button
                        onClick={() => openEditModal(m)}
                        className='p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.meetingId)}
                        className='p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className='flex justify-between items-center mt-4 text-sm'>
            <span className='text-gray-600'>
              Showing page {filters.pageNum} of {pagination.pageCount}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(filters.pageNum - 1)}
                disabled={filters.pageNum <= 1}
                className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40'
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(pagination.pageCount)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    filters.pageNum === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(filters.pageNum + 1)}
                disabled={filters.pageNum >= pagination.pageCount}
                className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40'
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {editingMeeting && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'
            onClick={() => setEditingMeeting(null)}
          >
            <div
              className='bg-white rounded-2xl shadow-2xl w-[95%] max-w-md animate-slideUp'
              onClick={e => e.stopPropagation()}
            >
              <div className='p-6 border-b flex justify-between items-center'>
                <h2 className='text-xl font-bold'>✏️ Update Meeting</h2>
                <button
                  onClick={() => setEditingMeeting(null)}
                  className='text-2xl leading-none text-gray-500 hover:text-gray-800'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Meeting ID
                  </label>
                  <input
                    type='text'
                    value={editForm.meetingId}
                    disabled
                    className='w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Title *
                  </label>
                  <input
                    type='text'
                    value={editForm.Title}
                    onChange={e =>
                      setEditForm({ ...editForm, Title: e.target.value })
                    }
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Description
                  </label>
                  <textarea
                    value={editForm.Description}
                    onChange={e =>
                      setEditForm({ ...editForm, Description: e.target.value })
                    }
                    rows='3'
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Schedule Time
                  </label>
                  <input
                    type='datetime-local'
                    value={editForm.ScheduleTime}
                    onChange={e =>
                      setEditForm({ ...editForm, ScheduleTime: e.target.value })
                    }
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Status
                  </label>
                  <input
                    type='number'
                    value={editForm.Status}
                    onChange={e =>
                      setEditForm({ ...editForm, Status: e.target.value })
                    }
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t'>
                  <button
                    type='button'
                    onClick={() => setEditingMeeting(null)}
                    className='px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MeetingManagement;
