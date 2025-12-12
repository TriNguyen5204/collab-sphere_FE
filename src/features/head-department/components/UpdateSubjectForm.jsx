import React, { useEffect, useState } from 'react';
import {
  Target,
  BarChart3,
  Plus,
  Trash2,
  BookOpen,
  X,
  Calendar,
  Clock,
  FileText,
  Save,
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
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const data = await getSyllabusBySubjectId(subject.subjectId);
        if (data?.subjectSyllabus) {
          // Map syllabusMilestones vào outcomes dựa trên subjectOutcomeId
          const syllabus = { ...data.subjectSyllabus };
          
          if (syllabus.subjectOutcomes && syllabus.syllabusMilestones) {
            syllabus.subjectOutcomes = syllabus.subjectOutcomes.map(outcome => ({
              ...outcome,
              syllabusMilestones: syllabus.syllabusMilestones.filter(
                m => m.subjectOutcomeId === outcome.subjectOutcomeId
              ),
            }));
          }
          
          setForm(prev => ({
            ...prev,
            subjectSyllabus: syllabus,
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

  // Handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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

  // Milestone handlers - NESTED trong outcomes
  const handleMilestoneChange = (outcomeIndex, milestoneIndex, field, value) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    if (!updated[outcomeIndex].syllabusMilestones) {
      updated[outcomeIndex].syllabusMilestones = [];
    }
    updated[outcomeIndex].syllabusMilestones[milestoneIndex][field] =
      field === 'startWeek' || field === 'duration' ? Number(value) : value;
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  const addMilestone = outcomeIndex => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    if (!updated[outcomeIndex].syllabusMilestones) {
      updated[outcomeIndex].syllabusMilestones = [];
    }
    updated[outcomeIndex].syllabusMilestones.push({
      title: '',
      description: '',
      startWeek: 1,
      duration: 1,
    });
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

  const removeMilestone = (outcomeIndex, milestoneIndex) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated[outcomeIndex].syllabusMilestones.splice(milestoneIndex, 1);
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
  };

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

    try {
      // Format data theo API requirements
      const payload = {
        subjectName: form.subjectName,
        subjectCode: form.subjectCode,
        isActive: form.isActive,
        subjectSyllabus: {
          syllabusName: form.subjectSyllabus.syllabusName,
          description: form.subjectSyllabus.description,
          noCredit: form.subjectSyllabus.noCredit,
          isActive: form.subjectSyllabus.isActive,
          subjectGradeComponents: form.subjectSyllabus.subjectGradeComponents.map(comp => ({
            componentName: comp.componentName,
            referencePercentage: parseFloat(comp.referencePercentage),
          })),
          subjectOutcomes: form.subjectSyllabus.subjectOutcomes.map(outcome => ({
            outcomeDetail: outcome.outcomeDetail,
            syllabusMilestones: (outcome.syllabusMilestones || []).map(milestone => ({
              title: milestone.title,
              description: milestone.description,
              startWeek: parseInt(milestone.startWeek),
              duration: parseInt(milestone.duration),
            })),
          })),
        },
      };

      const response = await updateSubject(subject.subjectId, payload);
      if (response.isSuccess === true) {
        toast.success(response.message || 'Subject and syllabus updated successfully');
        onSuccess?.();
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      const errorsObj = error?.response?.data?.errors;
      if (errorsObj && Object.keys(errorsObj).length > 0) {
        Object.entries(errorsObj).forEach(([field, errors]) =>
          errors.forEach(msg => toast.error(`${field}: ${msg}`))
        );
      } else {
        toast.error(error?.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage =
    form.subjectSyllabus?.subjectGradeComponents?.reduce(
      (sum, c) => sum + (parseFloat(c.referencePercentage) || 0),
      0
    ) || 0;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'outcomes', label: 'Outcomes', icon: Target },
    { id: 'milestones', label: 'Milestones', icon: Calendar },
    { id: 'grading', label: 'Grading', icon: BarChart3 },
  ];

  if (!form.subjectSyllabus) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='animate-spin w-8 h-8 border-4 border-orangeFpt-500 border-t-transparent rounded-full' />
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl shadow-soft-lg w-full max-w-5xl mx-auto overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-400 px-6 py-5 flex items-center justify-between flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
            <BookOpen className='w-6 h-6 text-white' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-white'>Update Subject</h2>
            <p className='text-orangeFpt-50 text-sm'>
              {subject.subjectName}
            </p>
          </div>
        </div>
        <button
          type='button'
          onClick={onCancel}
          className='text-white hover:bg-white/20 p-2 rounded-xl transition-colors'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      {/* Tabs */}
      <div className='bg-slate-50 border-b border-slate-200 flex-shrink-0 overflow-x-auto'>
        <div className='flex'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-orangeFpt-600 border-b-2 border-orangeFpt-500 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className='w-4 h-4' />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto'>
        <div className='p-6'>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Subject Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='subjectName'
                    value={form.subjectName}
                    onChange={handleChange}
                    className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Subject Code <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='subjectCode'
                    value={form.subjectCode}
                    onChange={handleChange}
                    className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none'
                    required
                  />
                </div>
              </div>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  name='isActive'
                  checked={form.isActive}
                  onChange={handleChange}
                  className='w-5 h-5 text-orangeFpt-500 rounded-lg'
                />
                <span className='text-sm font-medium'>Subject is Active</span>
              </label>
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Syllabus Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='syllabusName'
                    value={form.subjectSyllabus.syllabusName}
                    onChange={handleSyllabusChange}
                    className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Credits <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='noCredit'
                    value={form.subjectSyllabus.noCredit}
                    onChange={handleSyllabusChange}
                    min='1'
                    max='10'
                    className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none'
                    required
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Description <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='description'
                  value={form.subjectSyllabus.description}
                  onChange={handleSyllabusChange}
                  rows={4}
                  className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none resize-none'
                  required
                />
              </div>
            </div>
          )}

          {/* Outcomes Tab */}
          {activeTab === 'outcomes' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='font-bold text-lg'>Learning Outcomes</h3>
                <button
                  type='button'
                  onClick={addOutcome}
                  className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600'
                >
                  <Plus className='w-4 h-4' />
                  Add Outcome
                </button>
              </div>
              <div className='space-y-3'>
                {form.subjectSyllabus.subjectOutcomes?.map((outcome, i) => (
                  <div key={i} className='flex gap-3'>
                    <span className='w-8 h-8 bg-orangeFpt-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>
                      {i + 1}
                    </span>
                    <input
                      value={outcome.outcomeDetail}
                      onChange={e => handleOutcomeChange(i, e.target.value)}
                      className='flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                    />
                    <button
                      type='button'
                      onClick={() => removeOutcome(i)}
                      className='p-2 hover:bg-red-50 rounded-xl text-red-600'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className='space-y-6'>
              <div className='bg-orangeFpt-50 border border-orangeFpt-200 rounded-xl p-4'>
                <p className='text-sm text-orangeFpt-700 font-medium'>
                  💡 <strong>Note:</strong> Milestones are grouped under each Learning Outcome. 
                  Add outcomes first, then add milestones to each outcome.
                </p>
              </div>

              {form.subjectSyllabus.subjectOutcomes?.map((outcome, outcomeIndex) => (
                <div key={outcomeIndex} className='bg-slate-50 rounded-xl p-5 border-2 border-slate-200'>
                  {/* Outcome Header */}
                  <div className='mb-4 pb-3 border-b-2 border-slate-300'>
                    <div className='flex items-start gap-3'>
                      <span className='w-8 h-8 bg-orangeFpt-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>
                        {outcomeIndex + 1}
                      </span>
                      <div className='flex-1'>
                        <p className='font-semibold text-slate-900 mb-1'>Outcome:</p>
                        <p className='text-sm text-slate-700'>{outcome.outcomeDetail || 'No description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Milestones for this Outcome */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-semibold text-slate-900 text-sm flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-orangeFpt-600' />
                        Milestones ({outcome.syllabusMilestones?.length || 0})
                      </h4>
                      <button
                        type='button'
                        onClick={() => addMilestone(outcomeIndex)}
                        className='flex items-center gap-1 bg-orangeFpt-500 text-white px-3 py-1.5 rounded-lg hover:bg-orangeFpt-600 text-xs font-semibold'
                      >
                        <Plus className='w-3 h-3' />
                        Add
                      </button>
                    </div>

                    {outcome.syllabusMilestones?.map((m, milestoneIndex) => (
                      <div key={milestoneIndex} className='bg-white rounded-lg p-3 border border-slate-200'>
                        <div className='space-y-3'>
                          {/* Title and Week Info Row */}
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                                Name <span className='text-red-500'>*</span>
                              </label>
                              <input
                                placeholder='Milestone name'
                                value={m.title}
                                onChange={e => handleMilestoneChange(outcomeIndex, milestoneIndex, 'title', e.target.value)}
                                className='w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm'
                                required
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                              <div>
                                <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                                  Start Week <span className='text-red-500'>*</span>
                                </label>
                                <input
                                  type='number'
                                  placeholder='1-10'
                                  value={m.startWeek}
                                  onChange={e => handleMilestoneChange(outcomeIndex, milestoneIndex, 'startWeek', e.target.value)}
                                  min='1'
                                  max='10'
                                  className='w-full px-2 py-2 border border-slate-200 rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm'
                                  required
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                                  Duration <span className='text-red-500'>*</span>
                                </label>
                                <input
                                  type='number'
                                  placeholder='Weeks'
                                  value={m.duration}
                                  onChange={e => handleMilestoneChange(outcomeIndex, milestoneIndex, 'duration', e.target.value)}
                                  min='1'
                                  max='10'
                                  className='w-full px-2 py-2 border border-slate-200 rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm'
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                              Description <span className='text-red-500'>*</span>
                            </label>
                            <textarea
                              placeholder='Milestone description'
                              value={m.description}
                              onChange={e => handleMilestoneChange(outcomeIndex, milestoneIndex, 'description', e.target.value)}
                              rows={2}
                              className='w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none resize-none text-sm'
                              required
                            />
                          </div>

                          {/* Week Range Indicator and Remove Button */}
                          <div className='flex justify-between items-center'>
                            <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                              (m.startWeek + m.duration - 1) <= 10 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              Week {m.startWeek} → {m.startWeek + m.duration - 1}
                            </div>
                            <button
                              type='button'
                              onClick={() => removeMilestone(outcomeIndex, milestoneIndex)}
                              className='text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg text-xs font-semibold'
                            >
                              <Trash2 className='w-3 h-3 inline mr-1' />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!outcome.syllabusMilestones || outcome.syllabusMilestones.length === 0) && (
                      <div className='text-center py-4 text-slate-500 text-sm'>
                        No milestones yet. Click "Add" to create one.
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(!form.subjectSyllabus.subjectOutcomes || form.subjectSyllabus.subjectOutcomes.length === 0) && (
                <div className='text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300'>
                  <Target className='w-12 h-12 text-slate-400 mx-auto mb-3' />
                  <p className='text-slate-600 font-medium'>No outcomes available</p>
                  <p className='text-slate-500 text-sm mt-1'>Go to "Outcomes" tab to add learning outcomes first</p>
                </div>
              )}
            </div>
          )}

          {/* Grading Tab */}
          {activeTab === 'grading' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className='font-bold text-lg'>Grade Components</h3>
                  <p className='text-sm text-slate-600'>
                    Total: {totalPercentage}%
                    {totalPercentage === 100 ? (
                      <span className='text-green-600 ml-2'>✓</span>
                    ) : (
                      <span className='text-red-600 ml-2'>(Must = 100%)</span>
                    )}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={addComponent}
                  className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600'
                >
                  <Plus className='w-4 h-4' />
                  Add Component
                </button>
              </div>
              <div className='space-y-3'>
                {form.subjectSyllabus.subjectGradeComponents?.map((c, i) => (
                  <div key={i} className='flex gap-3'>
                    <span className='w-8 h-8 bg-orangeFpt-100 rounded-lg flex items-center justify-center text-orangeFpt-700 font-bold text-sm'>
                      {i + 1}
                    </span>
                    <input
                      placeholder='Component name'
                      value={c.componentName}
                      onChange={e => handleComponentChange(i, 'componentName', e.target.value)}
                      className='flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                    />
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        value={c.referencePercentage}
                        onChange={e => handleComponentChange(i, 'referencePercentage', e.target.value)}
                        className='w-24 border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-bold focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-100'
                      />
                      <span className='font-medium'>%</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeComponent(i)}
                      className='p-2 hover:bg-red-50 rounded-xl text-red-600'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Footer */}
      <div className='border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-between flex-shrink-0'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold'
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || totalPercentage !== 100}
          className='flex items-center gap-2 bg-orangeFpt-500 text-white px-8 py-2.5 rounded-xl hover:bg-orangeFpt-600 font-semibold disabled:opacity-50'
        >
          {loading ? 'Updating...' : (
            <>
              <Save className='w-5 h-5' />
              Update Subject
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpdateSubjectForm;