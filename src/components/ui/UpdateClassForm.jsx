import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  updateClass,
  getAllSubject,
  getAllLecturer,
} from '../../services/userService';
// 👉 thay đường dẫn import cho phù hợp với project của bạn

const UpdateClassForm = ({ classData, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    className: '',
    subjectId: 0,
    lecturerId: 0,
    enrolKey: '',
    isActive: true,
  });

  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⏳ Lấy dữ liệu ban đầu
  useEffect(() => {
    if (classData) {
      setFormData({
        className: classData.className || '',
        subjectId: classData.subjectId || 0,
        lecturerId: classData.lecturerId || 0,
        enrolKey: classData.enrolKey || '',
        isActive: classData.isActive ?? true,
      });
    }

    // Gọi API lấy danh sách môn và giảng viên
    const fetchData = async () => {
      try {
        const subjectRes = await getAllSubject();
        const lecturerRes = await getAllLecturer();
        setSubjects(subjectRes || []);
        setLecturers(lecturerRes.list || []);
      } catch (err) {
        toast.error('Failed to load subject or lecturer data');
      }
    };
    fetchData();
  }, [classData]);

  // 📩 Xử lý thay đổi input
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🚀 Xử lý cập nhật
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateClass(classData.classId, formData);
      if (response) {
        toast.success('Class updated successfully!');
        onUpdated?.(); // callback reload danh sách
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Class Name */}
      <div>
        <label className='block text-sm font-medium mb-1'>Class Name</label>
        <input
          type='text'
          name='className'
          value={formData.className}
          onChange={handleChange}
          className='w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none'
          placeholder='Enter class name'
          required
        />
      </div>

      {/* Subject */}
      <div>
        <label className='block text-sm font-medium mb-1'>Subject</label>
        <select
          name='subjectId'
          value={formData.subjectId}
          onChange={handleChange}
          className='w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none'
        >
          <option value={0}>-- Select Subject --</option>
          {subjects.map(s => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName}
            </option>
          ))}
        </select>
      </div>

      {/* Lecturer */}
      <div>
        <label className='block text-sm font-medium mb-1'>Lecturer</label>
        <select
          name='lecturerId'
          value={formData.lecturerId}
          onChange={handleChange}
          className='w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none'
        >
          <option value={0}>-- Select Lecturer --</option>
          {lecturers.map(l => (
            <option key={l.uId} value={l.uId}>
              {l.fullname}
            </option>
          ))}
        </select>
      </div>

      {/* Enrol Key */}
      <div>
        <label className='block text-sm font-medium mb-1'>Enroll Key</label>
        <input
          type='text'
          name='enrolKey'
          value={formData.enrolKey}
          onChange={handleChange}
          className='w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none'
          placeholder='Enter enrol key'
        />
      </div>

      {/* Active Checkbox */}
      <div className='flex items-center gap-2'>
        <input
          type='checkbox'
          name='isActive'
          checked={formData.isActive}
          onChange={handleChange}
          className='w-5 h-5 text-blue-500 border-gray-300 rounded'
        />
        <label className='text-sm font-medium'>Active</label>
      </div>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Updating...' : 'Update Class'}
        </button>
      </div>
    </form>
  );
};

export default UpdateClassForm;
