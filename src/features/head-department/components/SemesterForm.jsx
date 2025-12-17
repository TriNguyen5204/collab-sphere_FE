import React, { useState, useEffect } from 'react';
import { Save, Calendar as CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { createSemester, updateSemester } from '../../../services/userService';

export default function SemesterForm({ initialData, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    semesterName: '',
    semesterCode: '',
    startDate: '',
    endDate: ''
  });

  const isUpdate = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        semesterName: initialData.semesterName || '',
        semesterCode: initialData.semesterCode || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.semesterName.trim()) return "Semester name is required";
    if (!formData.semesterCode.trim()) return "Semester code is required";
    if (!formData.startDate) return "Start date is required";
    if (!formData.endDate) return "End date is required";
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return "End date must be after start date";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isUpdate) {
        response = await updateSemester(initialData.semesterId, formData);
        toast.success('Semester updated successfully');
      } else {
        response = await createSemester(formData);
        toast.success('Semester created successfully');
      }
      onSuccess(response);
      onClose();
    } catch (err) {
      if(err?.response?.data?.errorList?.length) {
        err.response.data.errorList.forEach(e => toast.error(e.message));
      } else if(err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Info Section */}
        <div className='p-6 space-y-4'>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                Semester Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='semesterName'
                value={formData.semesterName}
                onChange={handleChange}
                placeholder='e.g., Summer 2026'
                maxLength={50}
                className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 outline-none transition-all'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                Semester Code <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='semesterCode'
                value={formData.semesterCode}
                onChange={handleChange}
                placeholder='e.g., SU26'
                maxLength={20}
                className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 outline-none transition-all'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                Start Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='startDate'
                value={formData.startDate}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 outline-none transition-all'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                End Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='endDate'
                value={formData.endDate}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 outline-none transition-all'
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100'>
          <button
            type='button'
            onClick={onClose}
            className='px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all'
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='flex items-center gap-2 px-8 py-2.5 bg-orangeFpt-500 text-white rounded-xl font-semibold hover:bg-orangeFpt-600 shadow-lg shadow-orangeFpt-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className='w-4 h-4' />
                {isUpdate ? 'Update Semester' : 'Create Semester'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}