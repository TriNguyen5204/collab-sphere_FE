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
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      {/* Subject Basic Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-semibold text-slate-700 mb-1.5'>
            Subject Name
          </label>
          <input
            name='subjectName'
            value={form.subjectName}
            onChange={handleChange}
            className='w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none text-slate-800'
            placeholder='Enter subject name'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-slate-700 mb-1.5'>
            Subject Code
          </label>
          <input
            name='subjectCode'
            value={form.subjectCode}
            onChange={handleChange}
            className='w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none text-slate-800'
            placeholder='Enter subject code'
          />
        </div>
      </div>

      <div>
        <label className='flex items-center gap-3 cursor-pointer'>
          <div className='relative'>
            <input
              type='checkbox'
              name='isActive'
              checked={form.isActive}
              onChange={handleChange}
              className='sr-only peer'
            />
            <div className='w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-orangeFpt-500 transition-all'></div>
            <div className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5'></div>
          </div>
          <span className='font-medium text-slate-700'>
            Active Status
          </span>
          {form.isActive && (
            <CheckCircle2 className='w-5 h-5 text-green-500' />
          )}
        </label>
      </div>

      {/* Syllabus Toggle Button */}
      <button
        type='button'
        onClick={() => setShowSyllabus(!showSyllabus)}
        className='w-full bg-orangeFpt-50 hover:bg-orangeFpt-100 py-3 rounded-xl border border-orangeFpt-200 font-semibold flex justify-between items-center px-4 transition-all'
      >
        <div className='flex items-center gap-2 text-slate-900'>
          <Award className='w-4 h-4 text-orangeFpt-600' />
          <span className='text-sm'>Syllabus Details</span>
        </div>
        <div className='bg-white rounded-lg p-1 border border-orangeFpt-200'>
          {showSyllabus ? (
            <ChevronUp className='w-4 h-4 text-orangeFpt-600' />
          ) : (
            <ChevronDown className='w-4 h-4 text-orangeFpt-600' />
          )}
        </div>
      </button>

      {/* Syllabus Content - Compact */}
      {showSyllabus && form.subjectSyllabus && (
        <div className='space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50'>
          {/* Syllabus Info */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-slate-700 mb-1'>
                Syllabus Name
              </label>
              <input
                name='syllabusName'
                value={form.subjectSyllabus.syllabusName}
                onChange={handleSyllabusChange}
                className='w-full border-2 border-slate-200 rounded-xl px-3 py-2 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none text-sm'
                placeholder='Enter syllabus name'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-1'>
                Credits
              </label>
              <input
                type='number'
                name='noCredit'
                value={form.subjectSyllabus.noCredit}
                onChange={handleSyllabusChange}
                className='w-full border-2 border-slate-200 rounded-xl px-3 py-2 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none text-sm'
                placeholder='Credits'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-1'>
              Description
            </label>
            <textarea
              name='description'
              value={form.subjectSyllabus.description}
              onChange={handleSyllabusChange}
              rows={2}
              className='w-full border-2 border-slate-200 rounded-xl px-3 py-2 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none resize-none text-sm'
              placeholder='Enter description'
            />
          </div>

          {/* Learning Outcomes - Compact */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='font-semibold text-slate-900 flex items-center gap-2 text-sm'>
                <Target className='w-4 h-4 text-orangeFpt-600' />
                Learning Outcomes
              </h4>
              <button
                type='button'
                onClick={addOutcome}
                className='flex items-center gap-1 bg-orangeFpt-500 text-white px-3 py-1.5 rounded-lg hover:bg-orangeFpt-600 transition-colors text-xs font-medium'
              >
                <Plus className='w-3 h-3' />
                Add
              </button>
            </div>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {form.subjectSyllabus.subjectOutcomes?.map((outcome, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  <span className='w-6 h-6 bg-orangeFpt-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs'>
                    {index + 1}
                  </span>
                  <input
                    value={outcome.outcomeDetail}
                    onChange={e => handleOutcomeChange(index, e.target.value)}
                    className='flex-1 border border-slate-200 rounded-lg px-3 py-1.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-sm'
                    placeholder='Enter outcome detail'
                  />
                  <button
                    type='button'
                    onClick={() => removeOutcome(index)}
                    className='p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Components - Compact */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='font-semibold text-slate-900 flex items-center gap-2 text-sm'>
                <BarChart3 className='w-4 h-4 text-orangeFpt-600' />
                Grade Components
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  totalPercentage === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {totalPercentage}%
                </span>
              </h4>
              <button
                type='button'
                onClick={addComponent}
                className='flex items-center gap-1 bg-orangeFpt-500 text-white px-3 py-1.5 rounded-lg hover:bg-orangeFpt-600 transition-colors text-xs font-medium'
              >
                <Plus className='w-3 h-3' />
                Add
              </button>
            </div>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {form.subjectSyllabus.subjectGradeComponents?.map((comp, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  <span className='w-6 h-6 bg-orangeFpt-50 rounded-lg flex items-center justify-center flex-shrink-0 text-orangeFpt-700 font-bold text-xs'>
                    {index + 1}
                  </span>
                  <input
                    value={comp.componentName}
                    onChange={e => handleComponentChange(index, 'componentName', e.target.value)}
                    className='flex-1 border border-slate-200 rounded-lg px-3 py-1.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-sm'
                    placeholder='Component name'
                  />
                  <div className='flex items-center gap-1'>
                    <input
                      type='number'
                      value={comp.referencePercentage}
                      onChange={e => handleComponentChange(index, 'referencePercentage', e.target.value)}
                      className='w-16 border border-slate-200 rounded-lg px-2 py-1.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-center font-semibold text-sm'
                      placeholder='%'
                    />
                    <span className='text-slate-500 text-sm'>%</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeComponent(index)}
                    className='p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {apiErrors.length > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-3'>
          <h4 className='font-semibold text-red-900 mb-1 text-sm'>Validation Errors:</h4>
          <ul className='space-y-0.5'>
            {apiErrors.map((err, idx) => (
              <li key={idx} className='text-xs text-red-700'>
                • <strong>{err.field}:</strong> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-2'>
        <button
          type='submit'
          disabled={loading}
          className='flex-1 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 hover:from-orangeFpt-600 hover:to-orangeFpt-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orangeFpt-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Updating...' : 'Update Subject'}
        </button>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='px-6 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors border-2 border-slate-200 hover:border-slate-300'
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default UpdateSubjectForm;