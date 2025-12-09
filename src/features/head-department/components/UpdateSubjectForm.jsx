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
  X,
} from 'lucide-react';
import {
  updateSubject,
  getSyllabusBySubjectId,
} from '../../../services/userService';
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
        toast.error('Failed to fetch syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // Handle main subject fields
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle syllabus fields
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

  // Learning outcomes
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

  // Grade components
  const handleComponentChange = (index, field, value) => {
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

  const addComponent = () => {
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

  const removeComponent = index => {
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setApiErrors([]);

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
      const errorsObj = error?.response?.data?.errors;

      if (errorsObj && Object.keys(errorsObj).length > 0) {
        const formatted = Object.entries(errorsObj).flatMap(([field, errors]) =>
          errors.map(msg => ({ field, message: msg }))
        );
        setApiErrors(formatted);
        formatted.forEach(err => toast.error(`${err.field}: ${err.message}`));
        return;
      }

      const customErrorList = error?.response?.data?.errorList;
      if (Array.isArray(customErrorList)) {
        const formatted = customErrorList.map(e => ({
          field: e.field,
          message: e.message,
        }));
        setApiErrors(formatted);
        formatted.forEach(err => toast.error(`${err.field}: ${err.message}`));
        return;
      }

      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = form.subjectSyllabus?.subjectGradeComponents?.reduce(
    (sum, c) => sum + (parseFloat(c.referencePercentage) || 0),
    0
  ) || 0;

  return (
    <div className='bg-gray-50 py-6 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Header */}
          <div className='px-6 py-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center'>
                  <BookOpen className='w-6 h-6 text-orange-600' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>Update Subject</h2>
                  <p className='text-sm text-gray-600 mt-0.5'>
                    Modify subject information and syllabus details
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Subject Basic Info Card */}
            <div className='bg-white rounded-xl p-6 border border-gray-200'>
              <h3 className='text-base font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-orange-600' />
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
                    className='w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
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
                    className='w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
                    placeholder='Enter subject code'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      name='isActive'
                      checked={form.isActive}
                      onChange={handleChange}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-all'></div>
                    <div className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5'></div>
                  </div>
                  <span className='font-medium text-gray-700'>
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
              className='w-full bg-orange-50 hover:bg-orange-100 py-4 rounded-xl border border-orange-200 font-semibold flex justify-between items-center px-6 transition-all'
            >
              <div className='flex items-center gap-3 text-gray-900'>
                <Award className='w-5 h-5 text-orange-600' />
                <span>Syllabus Details</span>
              </div>
              <div className='bg-white rounded-lg p-1.5 border border-orange-200'>
                {showSyllabus ? (
                  <ChevronUp className='w-4 h-4 text-orange-600' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-orange-600' />
                )}
              </div>
            </button>

            {/* Syllabus Content */}
            {showSyllabus && form.subjectSyllabus && (
              <div className='space-y-6'>
                {/* Syllabus Info Card */}
                <div className='bg-white rounded-xl p-6 border border-gray-200'>
                  <h4 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                    <Award className='w-5 h-5 text-orange-600' />
                    Syllabus Information
                  </h4>

                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Syllabus Name
                      </label>
                      <input
                        name='syllabusName'
                        value={form.subjectSyllabus.syllabusName}
                        onChange={handleSyllabusChange}
                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
                        placeholder='Enter syllabus name'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Description
                      </label>
                      <textarea
                        name='description'
                        value={form.subjectSyllabus.description}
                        onChange={handleSyllabusChange}
                        rows={3}
                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none resize-none'
                        placeholder='Enter description'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Credits
                      </label>
                      <input
                        type='number'
                        name='noCredit'
                        value={form.subjectSyllabus.noCredit}
                        onChange={handleSyllabusChange}
                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
                        placeholder='Enter number of credits'
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className='bg-white rounded-xl p-6 border border-gray-200'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='font-bold text-gray-900 flex items-center gap-2'>
                      <Target className='w-5 h-5 text-orange-600' />
                      Learning Outcomes
                    </h4>
                    <button
                      type='button'
                      onClick={addOutcome}
                      className='flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium'
                    >
                      <Plus className='w-4 h-4' />
                      Add Outcome
                    </button>
                  </div>

                  <div className='space-y-3'>
                    {form.subjectSyllabus.subjectOutcomes?.map((outcome, index) => (
                      <div
                        key={index}
                        className='flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200'
                      >
                        <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-white font-bold text-sm'>
                            {index + 1}
                          </span>
                        </div>
                        <input
                          value={outcome.outcomeDetail}
                          onChange={e => handleOutcomeChange(index, e.target.value)}
                          className='flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
                          placeholder='Enter outcome detail'
                        />
                        <button
                          type='button'
                          onClick={() => removeOutcome(index)}
                          className='p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade Components */}
                <div className='bg-white rounded-xl p-6 border border-gray-200'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='font-bold text-gray-900 flex items-center gap-2'>
                      <BarChart3 className='w-5 h-5 text-orange-600' />
                      Grade Components
                    </h4>
                    <button
                      type='button'
                      onClick={addComponent}
                      className='flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium'
                    >
                      <Plus className='w-4 h-4' />
                      Add Component
                    </button>
                  </div>

                  <div className='space-y-3'>
                    {form.subjectSyllabus.subjectGradeComponents?.map((comp, index) => (
                      <div
                        key={index}
                        className='flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200'
                      >
                        <div className='w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-orange-700 font-bold text-sm'>
                            {index + 1}
                          </span>
                        </div>
                        <input
                          value={comp.componentName}
                          onChange={e =>
                            handleComponentChange(index, 'componentName', e.target.value)
                          }
                          className='flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none'
                          placeholder='Component name'
                        />
                        <div className='flex items-center gap-2'>
                          <input
                            type='number'
                            value={comp.referencePercentage}
                            onChange={e =>
                              handleComponentChange(
                                index,
                                'referencePercentage',
                                e.target.value
                              )
                            }
                            className='w-24 border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none text-center font-semibold'
                            placeholder='%'
                          />
                          <span className='text-gray-600 font-medium'>%</span>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeComponent(index)}
                          className='p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total Percentage */}
                  <div className='mt-4 bg-orange-500 rounded-xl p-4'>
                    <div className='flex justify-between items-center text-white'>
                      <span className='font-semibold'>Total Percentage</span>
                      <span className={`text-2xl font-bold ${
                        totalPercentage === 100 ? '' : 'text-yellow-200'
                      }`}>
                        {totalPercentage}%
                      </span>
                    </div>
                    {totalPercentage !== 100 && (
                      <p className='text-xs text-orange-100 mt-2'>
                        ⚠️ Total should equal 100%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {apiErrors.length > 0 && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                <h4 className='font-semibold text-red-900 mb-2'>Validation Errors:</h4>
                <ul className='space-y-1'>
                  {apiErrors.map((err, idx) => (
                    <li key={idx} className='text-sm text-red-700'>
                      • <strong>{err.field}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4 border-t border-gray-200'>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
              >
                {loading ? 'Updating...' : 'Update Subject'}
              </button>
              {onCancel && (
                <button
                  type='button'
                  onClick={onCancel}
                  className='px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateSubjectForm;