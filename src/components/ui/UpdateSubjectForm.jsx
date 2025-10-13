import React, { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp, BookOpen, Code, Award, Target, BarChart3 } from 'lucide-react';
import {
  updateSubject,
  getSyllabusBySubjectId,
} from '../../services/userService';
import { toast } from 'sonner';

const UpdateSubjectForm = ({ subject, onClose }) => {
  const [form, setForm] = useState({
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    isActive: subject.isActive,
    subjectSyllabus: null,
  });

  const [syllabus, setSyllabus] = useState(null);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch syllabus details
  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await getSyllabusBySubjectId(subject.subjectId);
        if (data && data.subjectSyllabus) {
          setSyllabus(data.subjectSyllabus);
          setForm(prev => ({
            ...prev,
            subjectSyllabus: data.subjectSyllabus,
          }));
        }
      } catch (error) {
        console.error('Error fetching syllabus:', error);
        toast.error('Failed to fetch syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // Handle form change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit update
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const updatedSubject = {
        subjectId: subject.subjectId,
        ...form,
      };
      const response = await updateSubject(updatedSubject);
      if (response.isSuccess === true) {
        toast.success('Subject updated successfully');
        onClose();
      } else {
        toast.error('Failed to update subject');
      }
    } catch (error) {
      toast.error('Error updating subject');
      console.error(error);
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh] flex flex-col'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 relative'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all'
          >
            <X size={18} />
          </button>

          <div className='flex items-center gap-3'>
            <div className='bg-white/20 rounded-xl p-3'>
              <BookOpen className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-white'>Update Subject</h2>
              <p className='text-blue-100 text-sm mt-1'>
                Modify subject information and details
              </p>
            </div>
          </div>
        </div>

        <div className='overflow-y-auto flex-1 px-8 py-6'>
          <div className='space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Subject Name */}
          <div>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
              <BookOpen className="w-4 h-4 text-blue-600" />
              Subject Name
            </label>
            <input
              type='text'
              name='subjectName'
              value={form.subjectName}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
              required
            />
          </div>

          {/* Subject Code */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Code className="w-4 h-4 text-blue-600" />
              Subject Code
            </label>
            <input
              type='text'
              name='subjectCode'
              value={form.subjectCode}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
              required
            />
          </div>

          {/* Active */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Active Status</span>
                  <p className="text-sm text-gray-500">
                    {form.isActive ? "Subject is currently active" : "Subject is inactive"}
                  </p>
                </div>
              </label>
            </div>

          {/* Toggle Syllabus */}
          <div className='mt-6'>
            <button
              type='button'
              onClick={() => setShowSyllabus(!showSyllabus)}
              className='flex items-center justify-between w-full bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-4 rounded-xl text-gray-800 hover:from-indigo-100 hover:to-blue-100 transition-all border-2 border-indigo-200 shadow-sm'
            >
              <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">
                    {showSyllabus ? "Hide Syllabus Details" : "Show Syllabus Details"}
                  </span>
                </div>
                {showSyllabus ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-600" />
                )}
            </button>

            {showSyllabus && (
              <div className='mt-4 border-2 border-indigo-200 rounded-2xl p-6 bg-gradient-to-br from-white to-indigo-50 space-y-5'>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-gray-600">Loading syllabus...</span>
                    </div>
                ) : syllabus ? (
                  <>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          {syllabus.syllabusName}
                        </h3>
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          {syllabus.description}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm">
                          <Award className="w-4 h-4" />
                          {syllabus.noCredit} Credits
                        </div>
                      </div>

                    {/* Outcomes */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" />
                          Learning Outcomes
                        </h4>
                        <ul className="space-y-3">
                          {syllabus.subjectOutcomes?.map((o, idx) => (
                            <li key={o.subjectOutcomeId} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-gray-700 leading-relaxed">
                                {o.outcomeDetail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    {/* Grade Components */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Grade Components
                        </h4>
                        <div className="space-y-3">
                          {syllabus.subjectGradeComponents?.map((c) => (
                            <div
                              key={c.subjectGradeComponentId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                            >
                              <span className="font-medium text-gray-800 text-sm">
                                {c.componentName}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                    style={{ width: `${c.referencePercentage}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-blue-600 text-sm w-12 text-right">
                                  {c.referencePercentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </>
                ) : (
                  <p className='text-gray-500 text-sm'>No syllabus found.</p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
};

export default UpdateSubjectForm;
