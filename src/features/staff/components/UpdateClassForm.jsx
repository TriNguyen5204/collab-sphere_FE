import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  updateClass,
  getAllSubject,
  getAllLecturer,
} from '../../../services/userService';
import { User } from 'lucide-react';

const UpdateClassForm = ({ classData, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    className: '',
    subjectId: 0,
    lecturerId: 0,
    isActive: true,
  });

  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classData) {
      setFormData({
        className: classData.className || '',
        subjectId: classData.subjectId || 0,
        lecturerId: classData.lecturerId || 0,
        isActive: classData.isActive ?? true,
      });
    }

    const fetchData = async () => {
      try {
        const subjectRes = await getAllSubject();
        const lecturerRes = await getAllLecturer();
        setSubjects(subjectRes || []);
        setLecturers(lecturerRes.list || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load subject or lecturer data');
      }
    };
    fetchData();
  }, [classData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateClass(classData.classId, formData);
      if (response) {
        toast.success('Class updated successfully!');
        onUpdated?.();
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
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Name */}
        <div className="group">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            Class Name
          </label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 focus:border-orangeFpt-500 outline-none transition-all duration-300 hover:border-orangeFpt-300"
            placeholder="Enter class name"
            required
          />
        </div>

        {/* Subject */}
        <div className="group">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            Subject
          </label>
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 focus:border-orangeFpt-500 outline-none transition-all duration-300 hover:border-orangeFpt-300 bg-white"
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
        <div className="group">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            Lecturer
          </label>
          <select
            name="lecturerId"
            value={formData.lecturerId}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 focus:border-orangeFpt-500 outline-none transition-all duration-300 hover:border-orangeFpt-300 bg-white"
          >
            <option value={0}>-- Select Lecturer --</option>
            {lecturers.map(l => (
              <option key={l.uId} value={l.uId}>
                {l.fullname}
              </option>
            ))}
          </select>
        </div>


        {/* Active Checkbox */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="peer w-6 h-6 text-orangeFpt-500 border-2 border-gray-300 rounded-lg cursor-pointer transition-all duration-300 checked:bg-orangeFpt-500 checked:border-orangeFpt-500"
              />
              <svg className="absolute top-1 left-1 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 block">Active Status</span>
              <span className="text-xs text-gray-500">Enable this class for enrollment</span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 hover:from-orangeFpt-600 hover:to-orangeFpt-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Class
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateClassForm;
