import React, { useEffect, useState } from 'react';
import {
  getMeeting,
  deleteMeeting,
  updateMeeting,
} from '../../services/meetingApi';
import { toast } from 'sonner';
import { Calendar, Filter, Edit, Trash2 } from 'lucide-react';

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [filters, setFilters] = useState({
    teamId: 2,
    title: '',
    scheduleTime: '',
    status: '',
    isDesc: true,
    viewAll: true,
    pageNum: 1,
    pageSize: 10,
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

  const convertToUTC = localDateStr => {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  };

  // 🧠 Gọi API lấy danh sách
  const fetchMeetings = async () => {
    try {
      const payload = {
        ...filters,
        scheduleTime: convertToUTC(filters.scheduleTime),
      };
      const response = await getMeeting(payload);
      if (response?.isSuccess && response.paginatedMeeting?.list) {
        setMeetings(response.paginatedMeeting.list);
        setPagination({
          pageCount: response.paginatedMeeting.pageCount,
          itemCount: response.paginatedMeeting.itemCount,
        });
      } else {
        toast.warning('No meetings found!');
        setMeetings([]);
      }
    } catch (error) {
      console.error('❌ Fetch meetings failed:', error);
      toast.error('Failed to fetch meetings.');
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
    setFilters({ ...filters, pageNum: 1 });
    fetchMeetings();
  };

  // 🗑️ Xóa meeting
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this meeting?'))
      return;
    try {
      const res = await deleteMeeting(id);
      if (res?.isSuccess) {
        toast.success('🗑️ Meeting deleted successfully!');
        fetchMeetings();
      } else {
        toast.error('Failed to delete meeting.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting meeting.');
    }
  };

  // ✏️ Mở modal update
  const openEditModal = meeting => {
    setEditingMeeting(meeting);
    setEditForm({
      meetingId: meeting.meetingId,
      Title: meeting.title,
      Description: meeting.description || '',
      ScheduleTime: meeting.scheduleTime
        ? new Date(meeting.scheduleTime).toISOString().slice(0, 16)
        : '',
      Status: meeting.status ?? '',
    });
  };

  // 🧠 Gửi update meeting
  const handleUpdateSubmit = async e => {
    e.preventDefault();
    const title = editForm.Title.trim() || editingMeeting.title;
    if (!title) {
      toast.error('Title is required.');
      return;
    }

    const payload = {
      meetingId: editForm.meetingId,
      Title: editForm.Title,
      Description: editForm.Description,
      ScheduleTime: convertToUTC(editForm.ScheduleTime),
      Status: parseInt(editForm.Status) || editingMeeting.status,
      //   recordUrl: editingMeeting.recordUrl, // giữ nguyên
    };
    console.log('data', payload);
    try {
      const res = await updateMeeting(payload);

      if (res) {
        toast.success('✅ Meeting updated successfully!');
        setEditingMeeting(null);
        fetchMeetings();
      } else {
        toast.error('Failed to update meeting.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating meeting.');
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
          <Calendar className='w-7 h-7 text-blue-600' />
          Meeting Management
        </h1>
      </div>

      {/* Filter */}
      <div className='bg-white p-5 rounded-xl shadow border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <div>
            <label className='text-sm font-medium text-gray-700'>Title</label>
            <input
              type='text'
              name='title'
              value={filters.title}
              onChange={handleFilterChange}
              placeholder='Search title...'
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
            <label className='text-sm font-medium text-gray-700'>Status</label>
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
            <label className='text-sm font-medium text-gray-700'>Is Desc</label>
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
          className='mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          <Filter className='w-4 h-4' /> Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className='bg-white shadow rounded-xl border border-gray-100 overflow-hidden'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-gray-100 text-gray-700 font-semibold'>
            <tr>
              <th className='px-4 py-3'>#</th>
              <th className='px-4 py-3'>Title</th>
              <th className='px-4 py-3'>Description</th>
              <th className='px-4 py-3'>Schedule Time</th>
              <th className='px-4 py-3'>Creator</th>
              <th className='px-4 py-3'>Status</th>
              <th className='px-4 py-3 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td colSpan='7' className='text-center py-4 text-gray-500'>
                  No meetings found.
                </td>
              </tr>
            ) : (
              meetings.map((m, idx) => (
                <tr key={m.meetingId} className='border-t hover:bg-gray-50'>
                  <td className='px-4 py-2'>{idx + 1}</td>
                  <td className='px-4 py-2 font-medium text-gray-800'>
                    {m.title}
                  </td>
                  <td className='px-4 py-2'>{m.description}</td>
                  <td className='px-4 py-2'>
                    {new Date(m.scheduleTime).toLocaleString()}
                  </td>
                  <td className='px-4 py-2'>{m.creatorName}</td>
                  <td className='px-4 py-2'>{m.status}</td>
                  <td className='px-4 py-2 text-right flex justify-end gap-2'>
                    <button
                      onClick={() => openEditModal(m)}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.meetingId)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Update */}
      {editingMeeting && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={() => setEditingMeeting(null)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-[95%] max-w-md'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-6 border-b flex justify-between items-center'>
              <h2 className='text-xl font-bold'>✏️ Update Meeting</h2>
              <button
                onClick={() => setEditingMeeting(null)}
                className='text-2xl leading-none'
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
                  className='w-full px-3 py-2 border rounded-lg bg-gray-100'
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
                <label className='block text-sm font-medium mb-1'>Status</label>
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
    </div>
  );
};

export default MeetingManagement;
