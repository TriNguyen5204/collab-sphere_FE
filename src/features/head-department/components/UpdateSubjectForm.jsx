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
  AlertTriangle,
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
  const [validationErrors, setValidationErrors] = useState({});

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
        } else {
          toast.error('This subject has no syllabus. Cannot update.');
        }
      } catch (error) {
        toast.error('Failed to fetch syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [subject.subjectId]);

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Basic Info validation
    if (!form.subjectName?.trim()) {
      errors.subjectName = 'Subject name is required';
    }
    if (!form.subjectCode?.trim()) {
      errors.subjectCode = 'Subject code is required';
    }

    if (form.subjectSyllabus) {
      // Syllabus validation
      if (!form.subjectSyllabus.syllabusName?.trim()) {
        errors.syllabusName = 'Syllabus name is required';
      }
      if (!form.subjectSyllabus.description?.trim()) {
        errors.description = 'Description is required';
      }
      if (!form.subjectSyllabus.noCredit || form.subjectSyllabus.noCredit <= 0) {
        errors.noCredit = 'Number of credits must be greater than 0';
      }

      // Outcomes validation
      if (!form.subjectSyllabus.subjectOutcomes || form.subjectSyllabus.subjectOutcomes.length === 0) {
        errors.outcomes = 'At least one learning outcome is required';
      } else {
        form.subjectSyllabus.subjectOutcomes.forEach((outcome, index) => {
          if (!outcome.outcomeDetail?.trim()) {
            errors[`outcome_${index}`] = `Outcome ${index + 1} detail is required`;
          }

          // ✅ Mỗi outcome phải có ít nhất 1 milestone
          if (!outcome.syllabusMilestones || outcome.syllabusMilestones.length === 0) {
            errors[`outcome_${index}_no_milestone`] = `Outcome ${index + 1} must have at least one milestone`;
          }

          // Milestone validation for each outcome
          if (outcome.syllabusMilestones) {
            outcome.syllabusMilestones.forEach((milestone, mIndex) => {
              if (!milestone.title?.trim()) {
                errors[`milestone_${index}_${mIndex}_title`] = `Milestone title is required`;
              }
              if (!milestone.description?.trim()) {
                errors[`milestone_${index}_${mIndex}_desc`] = `Milestone description is required`;
              }
              if (!milestone.startWeek || milestone.startWeek < 1 || milestone.startWeek > 11) {
                errors[`milestone_${index}_${mIndex}_start`] = `Start week must be 1-11`;
              }
              if (!milestone.duration || milestone.duration < 1 || milestone.duration > 11) {
                errors[`milestone_${index}_${mIndex}_duration`] = `Duration must be 1-11`;
              }
              if ((milestone.startWeek + milestone.duration - 1) > 11) {
                errors[`milestone_${index}_${mIndex}_range`] = `Week range cannot exceed 11`;
              }
            });
          }
        });
      }

      // Grading components validation
      if (!form.subjectSyllabus.subjectGradeComponents || form.subjectSyllabus.subjectGradeComponents.length === 0) {
        errors.grading = 'At least one grade component is required';
      } else {
        form.subjectSyllabus.subjectGradeComponents.forEach((component, index) => {
          if (!component.componentName?.trim()) {
            errors[`component_${index}_name`] = `Component ${index + 1} name is required`;
          }
          if (!component.referencePercentage || component.referencePercentage <= 0) {
            errors[`component_${index}_percentage`] = `Percentage must be greater than 0`;
          }
        });

        // Total percentage must be 100
        const total = form.subjectSyllabus.subjectGradeComponents.reduce(
          (sum, c) => sum + (parseFloat(c.referencePercentage) || 0),
          0
        );
        if (total !== 100) {
          errors.totalPercentage = `Total must be 100% (currently ${total}%)`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
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
    // Clear validation error
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleOutcomeChange = (index, value) => {
    const updated = [...form.subjectSyllabus.subjectOutcomes];
    updated[index].outcomeDetail = value;
    setForm(prev => ({
      ...prev,
      subjectSyllabus: { ...prev.subjectSyllabus, subjectOutcomes: updated },
    }));
    // Clear validation error
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`outcome_${index}`];
      return newErrors;
    });
  };

  const addOutcome = () => {
    setForm(prev => ({
      ...prev,
      subjectSyllabus: {
        ...prev.subjectSyllabus,
        subjectOutcomes: [
          ...(prev.subjectSyllabus.subjectOutcomes || []),
          { subjectOutcomeId: 0, outcomeDetail: '', syllabusMilestones: [] },
        ],
      },
    }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.outcomes;
      return newErrors;
    });
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
    // ✅ Clear validation error khi thêm milestone
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`outcome_${outcomeIndex}_no_milestone`];
      return newErrors;
    });
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
    // Clear validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`component_${index}_name`];
      delete newErrors[`component_${index}_percentage`];
      delete newErrors.totalPercentage;
      return newErrors;
    });
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
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.grading;
      return newErrors;
    });
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
    
    // ✅ Validate form
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting');
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey.includes('outcome')) setActiveTab('outcomes');
      else if (firstErrorKey.includes('milestone')) setActiveTab('milestones');
      else if (firstErrorKey.includes('component') || firstErrorKey === 'totalPercentage') setActiveTab('grading');
      else if (firstErrorKey.includes('syllabus')) setActiveTab('syllabus');
      else setActiveTab('basic');
      return;
    }

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

      if (response.isSuccess) {
        toast.success('Subject updated successfully!');
        if (onSuccess) onSuccess();
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

  // ✅ Hiển thị loading hoặc error nếu không có syllabus
  if (loading && !form.subjectSyllabus) {
    return (
      <div className='flex flex-col overflow-hidden'>
        {/* Header */}
        {/* <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-400 px-6 py-5 flex items-center justify-between flex-shrink-0'>
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
        </div> */}
        <div className='flex items-center justify-center p-12'>
          <div className='text-center'>
            <div className='animate-spin w-8 h-8 border-4 border-orangeFpt-500 border-t-transparent rounded-full mx-auto mb-4' />
            <p className='text-slate-600'>Loading syllabus data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Nếu không có syllabus sau khi load xong
  if (!loading && !form.subjectSyllabus) {
    return (
      <div className='overflow-hidden'>
        <div className='bg-gradient-to-r from-red-500 to-red-400 px-6 py-5 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
              <AlertTriangle className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>Cannot Update Subject</h2>
              <p className='text-red-50 text-sm'>{subject.subjectName}</p>
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
        <div className='p-12 text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertTriangle className='w-8 h-8 text-red-600' />
          </div>
          <h3 className='text-lg font-bold text-slate-800 mb-2'>No Syllabus Found</h3>
          <p className='text-slate-600 mb-6'>This subject doesn't have a syllabus yet. Please create one first.</p>
          <button
            onClick={onCancel}
            className='px-6 py-2.5 bg-orangeFpt-500 hover:bg-orangeFpt-600 text-white rounded-xl font-semibold transition-colors'
          >
            Go Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col overflow-hidden -m-6'>
      {/* Header */}
      {/* <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-400 px-6 py-5 flex items-center justify-between flex-shrink-0'>
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
      </div> */}

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className='bg-red-50 border-b-2 border-red-200 px-6 py-3'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <p className='font-semibold text-red-800 text-sm'>
                Please fix {Object.keys(validationErrors).length} validation error(s)
              </p>
              <div className='mt-1 space-y-1 max-h-20 overflow-y-auto'>
                {Object.values(validationErrors).slice(0, 3).map((error, idx) => (
                  <p key={idx} className='text-xs text-red-600'>• {error}</p>
                ))}
                {Object.keys(validationErrors).length > 3 && (
                  <p className='text-xs text-red-600'>• ...and {Object.keys(validationErrors).length - 3} more</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='bg-slate-50 border-b border-slate-200 flex-shrink-0 overflow-x-auto'>
        <div className='flex'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            // Count errors per tab
            const tabErrors = Object.keys(validationErrors).filter(key => {
              if (tab.id === 'basic') return ['subjectName', 'subjectCode'].includes(key);
              if (tab.id === 'syllabus') return ['syllabusName', 'description', 'noCredit'].includes(key);
              if (tab.id === 'outcomes') return (key.startsWith('outcome') && !key.includes('milestone')) || key.includes('_no_milestone');
              if (tab.id === 'milestones') return key.includes('milestone') || key.includes('_no_milestone');
              if (tab.id === 'grading') return key.includes('component') || key === 'totalPercentage' || key === 'grading';
              return false;
            }).length;

            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? 'text-orangeFpt-600 border-b-2 border-orangeFpt-500 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className='w-4 h-4' />
                {tab.label}
                {tabErrors > 0 && (
                  <span className='ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                    {tabErrors}
                  </span>
                )}
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
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none ${
                      validationErrors.subjectName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-orangeFpt-500'
                    }`}
                    required
                  />
                  {validationErrors.subjectName && (
                    <p className='text-red-600 text-xs mt-1'>{validationErrors.subjectName}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Subject Code <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='subjectCode'
                    value={form.subjectCode}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none ${
                      validationErrors.subjectCode 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-orangeFpt-500'
                    }`}
                    required
                  />
                  {validationErrors.subjectCode && (
                    <p className='text-red-600 text-xs mt-1'>{validationErrors.subjectCode}</p>
                  )}
                </div>
              </div>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  name='isActive'
                  checked={form.isActive}
                  onChange={handleChange}
                  className='w-5 h-5 text-orangeFpt-500 rounded focus:ring-2 focus:ring-orangeFpt-200'
                />
                <span className='font-medium text-slate-700'>Active Subject</span>
              </label>
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Syllabus Name <span className='text-red-500'>*</span>
                </label>
                <input
                  name='syllabusName'
                  value={form.subjectSyllabus.syllabusName}
                  onChange={handleSyllabusChange}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none ${
                    validationErrors.syllabusName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-orangeFpt-500'
                  }`}
                  required
                />
                {validationErrors.syllabusName && (
                  <p className='text-red-600 text-xs mt-1'>{validationErrors.syllabusName}</p>
                )}
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
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none resize-none ${
                    validationErrors.description 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-orangeFpt-500'
                  }`}
                  required
                />
                {validationErrors.description && (
                  <p className='text-red-600 text-xs mt-1'>{validationErrors.description}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Number of Credits <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='noCredit'
                  value={form.subjectSyllabus.noCredit}
                  onChange={handleSyllabusChange}
                  min='1'
                  max='10'
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none ${
                    validationErrors.noCredit 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-orangeFpt-500'
                  }`}
                  required
                />
                {validationErrors.noCredit && (
                  <p className='text-red-600 text-xs mt-1'>{validationErrors.noCredit}</p>
                )}
              </div>
            </div>
          )}

          {/* Outcomes Tab */}
          {activeTab === 'outcomes' && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className='font-bold text-lg'>Learning Outcomes</h3>
                  {validationErrors.outcomes && (
                    <p className='text-red-600 text-sm mt-1'>{validationErrors.outcomes}</p>
                  )}
                </div>
                <button
                  type='button'
                  onClick={addOutcome}
                  className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600 transition-colors'
                >
                  <Plus className='w-4 h-4' />
                  Add Outcome
                </button>
              </div>
              <div className='space-y-3'>
                {form.subjectSyllabus.subjectOutcomes?.map((outcome, index) => (
                  <div key={index} className='p-4 border-2 border-slate-200 rounded-xl hover:border-orangeFpt-300 transition-colors'>
                    <div className='flex gap-3'>
                      <span className='w-8 h-8 bg-orangeFpt-100 rounded-lg flex items-center justify-center text-orangeFpt-700 font-bold text-sm flex-shrink-0'>
                        {index + 1}
                      </span>
                      <div className='flex-1'>
                        <textarea
                          placeholder='Describe the learning outcome... *'
                          value={outcome.outcomeDetail}
                          onChange={e => handleOutcomeChange(index, e.target.value)}
                          rows={2}
                          className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orangeFpt-100 transition-all outline-none resize-none ${
                            validationErrors[`outcome_${index}`]
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-slate-200 focus:border-orangeFpt-500'
                          }`}
                          required
                        />
                        {validationErrors[`outcome_${index}`] && (
                          <p className='text-red-600 text-xs mt-1'>{validationErrors[`outcome_${index}`]}</p>
                        )}
                        {validationErrors[`outcome_${index}_no_milestone`] && (
                          <p className='text-amber-600 text-xs mt-1 flex items-center gap-1'>
                            <AlertTriangle className='w-3 h-3' />
                            {validationErrors[`outcome_${index}_no_milestone`]}
                          </p>
                        )}
                        <p className='text-xs text-slate-500 mt-1'>
                          Milestones: {outcome.syllabusMilestones?.length || 0} (Go to Milestones tab to add)
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeOutcome(index)}
                        className='p-2 hover:bg-red-50 rounded-xl text-red-600 flex-shrink-0 h-fit'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {(!form.subjectSyllabus.subjectOutcomes || form.subjectSyllabus.subjectOutcomes.length === 0) && (
                <div className='text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300'>
                  <Target className='w-12 h-12 text-slate-400 mx-auto mb-3' />
                  <p className='text-slate-600 font-medium'>No outcomes yet</p>
                  <p className='text-slate-500 text-sm mt-1'>Click "Add Outcome" to create one</p>
                </div>
              )}
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className='space-y-6'>
              <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4'>
                <div className='flex items-start gap-3'>
                  <Clock className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-semibold text-blue-900 mb-1'>About Milestones</p>
                    <p className='text-xs text-blue-700'>Milestones are organized under learning outcomes. Each outcome can have multiple milestones with specific week ranges.</p>
                  </div>
                </div>
              </div>

              {form.subjectSyllabus.subjectOutcomes?.map((outcome, outcomeIndex) => (
                <div key={outcomeIndex} className={`border-2 rounded-xl p-5 space-y-4 ${
                  validationErrors[`outcome_${outcomeIndex}_no_milestone`]
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200'
                }`}>
                  <div className='flex items-start gap-3'>
                    <span className='w-8 h-8 bg-orangeFpt-100 rounded-lg flex items-center justify-center text-orangeFpt-700 font-bold text-sm flex-shrink-0'>
                      {outcomeIndex + 1}
                    </span>
                    <div className='flex-1'>
                      <p className='font-semibold text-slate-800 mb-1'>
                        {outcome.outcomeDetail || `Outcome ${outcomeIndex + 1}`}
                      </p>
                      <p className={`text-xs ${
                        validationErrors[`outcome_${outcomeIndex}_no_milestone`]
                          ? 'text-amber-600 font-semibold'
                          : 'text-slate-500'
                      }`}>
                        {outcome.syllabusMilestones?.length || 0} milestone(s)
                        {validationErrors[`outcome_${outcomeIndex}_no_milestone`] && ' - At least 1 required!'}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-3 pl-11'>
                    <div className='flex justify-between items-center'>
                      <h4 className='text-sm font-semibold text-slate-700'>Milestones</h4>
                      <button
                        type='button'
                        onClick={() => addMilestone(outcomeIndex)}
                        className='text-xs bg-orangeFpt-100 hover:bg-orangeFpt-200 text-orangeFpt-700 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1'
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
                                className={`w-full px-3 py-2 border rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm ${
                                  validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_title`]
                                    ? 'border-red-300' 
                                    : 'border-slate-200'
                                }`}
                                required
                              />
                              {validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_title`] && (
                                <p className='text-red-600 text-xs mt-1'>
                                  {validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_title`]}
                                </p>
                              )}
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                              <div>
                                <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                                  Start Week <span className='text-red-500'>*</span>
                                </label>
                                <input
                                  type='number'
                                  placeholder='1-11'
                                  value={m.startWeek}
                                  onChange={e => handleMilestoneChange(outcomeIndex, milestoneIndex, 'startWeek', e.target.value)}
                                  min='1'
                                  max='11'
                                  className={`w-full px-2 py-2 border rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm ${
                                    validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_start`]
                                      ? 'border-red-300' 
                                      : 'border-slate-200'
                                  }`}
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
                                  max='11'
                                  className={`w-full px-2 py-2 border rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none text-sm ${
                                    validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_duration`]
                                      ? 'border-red-300' 
                                      : 'border-slate-200'
                                  }`}
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
                              className={`w-full px-3 py-2 border rounded-lg focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 outline-none resize-none text-sm ${
                                validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_desc`]
                                  ? 'border-red-300' 
                                  : 'border-slate-200'
                              }`}
                              required
                            />
                            {validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_desc`] && (
                              <p className='text-red-600 text-xs mt-1'>
                                {validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_desc`]}
                              </p>
                            )}
                          </div>

                          {/* Week Range Indicator and Remove Button */}
                          <div className='flex justify-between items-center'>
                            <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                              (m.startWeek + m.duration - 1) <= 11 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              Week {m.startWeek} → {m.startWeek + m.duration - 1}
                              {validationErrors[`milestone_${outcomeIndex}_${milestoneIndex}_range`] && (
                                <span className='ml-2'>⚠️</span>
                              )}
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
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className='font-bold text-lg'>Grade Components</h3>
                  <p className='text-sm text-slate-600'>
                    Total: <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalPercentage}%</span>
                    {totalPercentage === 100 ? (
                      <span className='text-green-600 ml-2'>✓</span>
                    ) : (
                      <span className='text-red-600 ml-2'>(Must = 100%)</span>
                    )}
                  </p>
                  {validationErrors.grading && (
                    <p className='text-red-600 text-sm mt-1'>{validationErrors.grading}</p>
                  )}
                  {validationErrors.totalPercentage && (
                    <p className='text-red-600 text-sm mt-1'>{validationErrors.totalPercentage}</p>
                  )}
                </div>
                <button
                  type='button'
                  onClick={addComponent}
                  className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600 transition-colors'
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
                    <div className='flex-1'>
                      <input
                        placeholder='Component name *'
                        value={c.componentName}
                        onChange={e => handleComponentChange(i, 'componentName', e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orangeFpt-100 outline-none ${
                          validationErrors[`component_${i}_name`]
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-slate-200 focus:border-orangeFpt-500'
                        }`}
                        required
                      />
                      {validationErrors[`component_${i}_name`] && (
                        <p className='text-red-600 text-xs mt-1'>{validationErrors[`component_${i}_name`]}</p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        value={c.referencePercentage}
                        onChange={e => handleComponentChange(i, 'referencePercentage', e.target.value)}
                        className={`w-24 border-2 rounded-xl px-3 py-2 text-center font-bold focus:ring-4 focus:ring-orangeFpt-100 outline-none ${
                          validationErrors[`component_${i}_percentage`]
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-slate-200 focus:border-orangeFpt-500'
                        }`}
                        min='0'
                        max='100'
                        required
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
      <div className='px-6 py-4 flex justify-between flex-shrink-0 rounded-2xl'>
        <button
          type='button'
          onClick={onCancel}
          disabled={loading}
          className={`px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || totalPercentage !== 100}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold transition-all ${
            loading || totalPercentage !== 100
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-orangeFpt-500 text-white hover:bg-orangeFpt-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Updating...
            </>
          ) : (
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