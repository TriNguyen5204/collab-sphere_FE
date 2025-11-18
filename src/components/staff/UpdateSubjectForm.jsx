import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  updateSubject,
  getSyllabusBySubjectId,
} from '../../services/userService';
import { toast } from 'sonner';

const UpdateSubjectForm = ({ subject, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    isActive: subject.isActive,
    subjectSyllabus: null,
  });

  const [loading, setLoading] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await getSyllabusBySubjectId(subject.subjectId);
        if (data?.subjectSyllabus) {
          setForm(prev => ({
            ...prev,
            subjectSyllabus: data.subjectSyllabus,
          }));
        }
      } catch (error) {
        toast.error('Failed to fetch syllabus', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // ✅ Handle main subject fields
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ✅ Handle syllabus fields
  const handleSyllabusChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        [name]: value,
      },
    }));
  };

  // ✅ Learning outcomes
  const handleOutcomeChange = (index, value) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated[index].outcomeDetail = value;
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  const addOutcome = () => {
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectOutcomes: [
          ...(prev.subjectSyllabus.subjectOutcomes || []),
          { subjectOutcomeId: 0, outcomeDetail: '' },
        ],
      },
    }));
  };

  const removeOutcome = index => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated.splice(index, 1);
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  // ✅ Grade components
  const handleGradeChange = (index, field, value) => {
    const updated = [...form.subjectSyllabus.subjectGradeComponents];
    updated[index][field] = value;
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: updated,
      },
    }));
  };

  const addGradeComponent = () => {
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: [
          ...(prev.subjectSyllabus.subjectGradeComponents || []),
          {
            subjectGradeComponentId: 0,
            componentName: '',
            referencePercentage: 0,
          },
        ],
      },
    }));
  };

  const removeGradeComponent = index => {
    const updated = [...form.subjectSyllabus.subjectGradeComponents];
    updated.splice(index, 1);
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectGradeComponents: updated,
      },
    }));
  };

  // ✅ Submit update
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await updateSubject({
        subjectId: subject.subjectId,
        ...form,
      });
      if (response.isSuccess === true) {
        toast.success('Subject and syllabus updated successfully');
        onSuccess?.();
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
            <div className='flex items-center gap-3 text-white'>
              <BookOpen className='w-8 h-8' />
              <div>
                <h2 className='text-2xl font-bold'>Update Subject</h2>
                <p className='text-blue-100 text-sm mt-1'>
                  Modify subject information and syllabus details
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='p-8 space-y-6'>
            {/* Subject Basic Info Card */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                  <BookOpen className='w-5 h-5 text-white' />
                </div>
                Basic Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Subject Name
                  </label>
                  <input
                    name='subjectName'
                    value={form.subjectName}
                    onChange={handleChange}
                    className='w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                    placeholder='Enter subject name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Subject Code
                  </label>
                  <input
                    name='subjectCode'
                    value={form.subjectCode}
                    onChange={handleChange}
                    className='w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                    placeholder='Enter subject code'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='flex items-center gap-3 cursor-pointer group'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      name='isActive'
                      checked={form.isActive}
                      onChange={handleChange}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all'></div>
                    <div className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5'></div>
                  </div>
                  <span className='font-semibold text-gray-700 group-hover:text-blue-600 transition-colors'>
                    Active Status
                  </span>
                  {form.isActive && (
                    <CheckCircle2 className='w-5 h-5 text-green-500' />
                  )}
                </label>
              </div>
            </div>

            {/* Syllabus Toggle Button */}
            <button
              type='button'
              onClick={() => setShowSyllabus(!showSyllabus)}
              className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-4 rounded-xl text-white font-bold flex justify-between items-center px-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]'
            >
              <div className='flex items-center gap-3'>
                <Award className='w-6 h-6' />
                <span className='text-lg'>Syllabus Details</span>
              </div>
              <div className='bg-white bg-opacity-20 rounded-lg p-1'>
                {showSyllabus ? (
                  <ChevronUp className='w-5 h-5' />
                ) : (
                  <ChevronDown className='w-5 h-5' />
                )}
              </div>
            </button>

            {/* Syllabus Content */}
            {showSyllabus && form.subjectSyllabus && (
              <div className='space-y-6 animate-in fade-in duration-300'>
                {/* Syllabus Info Card */}
                <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100'>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg'>
                    <div className='w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center'>
                      <Award className='w-5 h-5 text-white' />
                    </div>
                    Syllabus Information
                  </h4>

                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Syllabus Name
                      </label>
                      <input
                        name='syllabusName'
                        value={form.subjectSyllabus.syllabusName || ''}
                        onChange={handleSyllabusChange}
                        className='w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white'
                        placeholder='Enter syllabus name'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Description
                      </label>
                      <textarea
                        name='description'
                        value={form.subjectSyllabus.description || ''}
                        onChange={handleSyllabusChange}
                        className='w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white min-h-[100px] resize-none'
                        placeholder='Enter description'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Credits
                      </label>
                      <input
                        name='noCredit'
                        type='number'
                        value={form.subjectSyllabus.noCredit || 0}
                        onChange={handleSyllabusChange}
                        className='w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white'
                        placeholder='Number of credits'
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes Card */}
                <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100'>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg'>
                    <div className='w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center'>
                      <Target className='w-5 h-5 text-white' />
                    </div>
                    Learning Outcomes
                  </h4>

                  <div className='space-y-3'>
                    {form.subjectSyllabus.subjectOutcomes?.map((o, idx) => (
                      <div key={idx} className='flex gap-3 items-center group'>
                        <div className='flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                          {idx + 1}
                        </div>
                        <input
                          value={o.outcomeDetail}
                          onChange={e =>
                            handleOutcomeChange(idx, e.target.value)
                          }
                          className='flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white'
                          placeholder='Enter learning outcome'
                        />
                        <button
                          type='button'
                          onClick={() => removeOutcome(idx)}
                          className='flex-shrink-0 w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100'
                        >
                          <Trash2 className='text-red-600 w-5 h-5' />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type='button'
                    onClick={addOutcome}
                    className='mt-4 w-full bg-white hover:bg-green-50 border-2 border-dashed border-green-300 text-green-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:border-green-400'
                  >
                    <Plus className='w-5 h-5' />
                    Add Learning Outcome
                  </button>
                </div>

                {/* Grade Components Card */}
                <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100'>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                      <BarChart3 className='w-5 h-5 text-white' />
                    </div>
                    Grade Components
                  </h4>

                  <div className='space-y-3'>
                    {form.subjectSyllabus.subjectGradeComponents?.map(
                      (c, idx) => (
                        <div
                          key={idx}
                          className='flex gap-3 items-center group bg-white rounded-lg p-3 border-2 border-gray-100'
                        >
                          <div className='flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                            {idx + 1}
                          </div>
                          <input
                            value={c.componentName}
                            onChange={e =>
                              handleGradeChange(
                                idx,
                                'componentName',
                                e.target.value
                              )
                            }
                            className='flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                            placeholder='Component name'
                          />
                          <div className='flex items-center gap-2'>
                            <input
                              type='number'
                              value={c.referencePercentage}
                              onChange={e =>
                                handleGradeChange(
                                  idx,
                                  'referencePercentage',
                                  e.target.value
                                )
                              }
                              className='w-20 border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                              placeholder='%'
                            />
                            <span className='text-gray-500 font-semibold'>
                              %
                            </span>
                          </div>
                          <button
                            type='button'
                            onClick={() => removeGradeComponent(idx)}
                            className='flex-shrink-0 w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100'
                          >
                            <Trash2 className='text-red-600 w-5 h-5' />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type='button'
                    onClick={addGradeComponent}
                    className='mt-4 w-full bg-white hover:bg-blue-50 border-2 border-dashed border-blue-300 text-blue-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:border-blue-400'
                  >
                    <Plus className='w-5 h-5' />
                    Add Grade Component
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex justify-end gap-4 pt-6 border-t-2 border-gray-100'>
              <button
                type='button'
                onClick={onCancel}
                className='px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin'></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='w-5 h-5' />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* errorList */}
      {apiErrors.length > 0 && (
        <div className='mt-4 p-4 bg-red-50 border border-red-300 rounded-md'>
          <h3 className='text-red-600 font-semibold mb-2'>Danh sách lỗi:</h3>
          <ul className='list-disc list-inside text-red-700'>
            {apiErrors.map((err, index) => (
              <li key={index}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UpdateSubjectForm;
