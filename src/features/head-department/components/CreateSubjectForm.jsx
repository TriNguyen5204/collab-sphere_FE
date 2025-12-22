import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Target,
  BarChart3,
  Calendar,
  Save,
} from 'lucide-react';
import { createSubject } from '../../../services/userService';
import { toast } from 'sonner';

const CreateSubjectForm = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Subject basic info
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [isSubjectActive, setIsSubjectActive] = useState(true);

  // Syllabus info
  const [syllabusName, setSyllabusName] = useState('');
  const [description, setDescription] = useState('');
  const [noCredit, setNoCredit] = useState(3);
  const [isSyllabusActive, setIsSyllabusActive] = useState(true);

  // Grade Components
  const [gradeComponents, setGradeComponents] = useState([]);

  // Subject Outcomes with Milestones
  const [subjectOutcomes, setSubjectOutcomes] = useState([
    {
      outcomeDetail: '',
      syllabusMilestones: [
        {
          title: '',
          description: '',
          startWeek: 1,
          duration: 1,
        },
      ],
    },
  ]);

  // ==================== GRADE COMPONENTS HANDLERS ====================

  const addGradeComponent = () => {
    setGradeComponents([
      ...gradeComponents,
      { componentName: '', referencePercentage: 0 },
    ]);
  };

  const removeGradeComponent = index => {
    setGradeComponents(gradeComponents.filter((_, i) => i !== index));
  };

  const updateGradeComponent = (index, field, value) => {
    const updated = [...gradeComponents];
    updated[index][field] = field === 'referencePercentage' ? Number(value) : value;
    setGradeComponents(updated);
  };

  // ==================== OUTCOMES HANDLERS ====================

  const addOutcome = () => {
    setSubjectOutcomes([
      ...subjectOutcomes,
      {
        outcomeDetail: '',
        syllabusMilestones: [
          {
            title: '',
            description: '',
            startWeek: 1,
            duration: 1,
          },
        ],
      },
    ]);
  };

  const removeOutcome = index => {
    setSubjectOutcomes(subjectOutcomes.filter((_, i) => i !== index));
  };

  const updateOutcome = (index, value) => {
    const updated = [...subjectOutcomes];
    updated[index].outcomeDetail = value;
    setSubjectOutcomes(updated);
  };

  // ==================== MILESTONES HANDLERS ====================

  const addMilestone = outcomeIndex => {
    const updated = [...subjectOutcomes];
    updated[outcomeIndex].syllabusMilestones.push({
      title: '',
      description: '',
      startWeek: 1,
      duration: 1,
    });
    setSubjectOutcomes(updated);
  };

  const removeMilestone = (outcomeIndex, milestoneIndex) => {
    const updated = [...subjectOutcomes];
    updated[outcomeIndex].syllabusMilestones = updated[
      outcomeIndex
    ].syllabusMilestones.filter((_, i) => i !== milestoneIndex);
    setSubjectOutcomes(updated);
  };

  const updateMilestone = (outcomeIndex, milestoneIndex, field, value) => {
    const updated = [...subjectOutcomes];
    updated[outcomeIndex].syllabusMilestones[milestoneIndex][field] =
      field === 'startWeek' || field === 'duration' ? Number(value) : value;
    setSubjectOutcomes(updated);
  };

  // ==================== VALIDATION ====================

  const validateForm = () => {
    if (!subjectName.trim()) return 'Subject name is required';
    if (!subjectCode.trim()) return 'Subject code is required';
    if (!syllabusName.trim()) return 'Syllabus name is required';
    if (!description.trim()) return 'Description is required';
    
    // Validate description length
    if (description.trim().length < 3) 
      return 'Description must be at least 3 characters';
    if (description.trim().length > 500) 
      return 'Description must not exceed 500 characters';
    
    if (noCredit <= 0) return 'Credits must be greater than 0';

    // Validate grade components
    if (gradeComponents.length === 0)
      return 'At least one grade component is required';
    for (const comp of gradeComponents) {
      if (!comp.componentName.trim())
        return 'All grade components must have a name';
      if (comp.referencePercentage <= 0)
        return 'All grade components must have a percentage > 0';
    }

    // Check total percentage
    const totalPercentage = gradeComponents.reduce(
      (sum, comp) => sum + comp.referencePercentage,
      0
    );
    if (totalPercentage !== 100)
      return `Grade components must total 100% (currently ${totalPercentage}%)`;

    // Validate outcomes
    if (subjectOutcomes.length === 0)
      return 'At least one subject outcome is required';
    for (const outcome of subjectOutcomes) {
      if (!outcome.outcomeDetail.trim())
        return 'All outcomes must have a description';
      if (outcome.syllabusMilestones.length === 0)
        return 'Each outcome must have at least one milestone';
      for (const milestone of outcome.syllabusMilestones) {
        if (!milestone.title.trim()) return 'All milestones must have a title';
        if (!milestone.description.trim())
          return 'All milestones must have a description';
        if (milestone.startWeek <= 0)
          return 'Start week must be greater than 0';
        if (milestone.duration <= 0)
          return 'Duration must be greater than 0';
        
        // Validate: StartWeek + Duration - 1 <= 10
        const endWeek = milestone.startWeek + milestone.duration - 1;
        if (endWeek > 10)
          return `Milestone "${milestone.title}" exceeds week limit (ends at week ${endWeek}, max is week 10). Formula: StartWeek(${milestone.startWeek}) + Duration(${milestone.duration}) - 1 = ${endWeek}`;
      }
    }

    return null;
  };

  // ==================== FORM SUBMISSION ====================

  const handleSubmit = async e => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        isActive: isSubjectActive,
        subjectSyllabus: {
          syllabusName: syllabusName.trim(),
          description: description.trim(),
          noCredit: noCredit,
          isActive: isSyllabusActive,
          subjectGradeComponents: gradeComponents.map(comp => ({
            componentName: comp.componentName.trim(),
            referencePercentage: comp.referencePercentage,
          })),
          subjectOutcomes: subjectOutcomes.map(outcome => ({
            outcomeDetail: outcome.outcomeDetail.trim(),
            syllabusMilestones: outcome.syllabusMilestones.map(milestone => ({
              title: milestone.title.trim(),
              description: milestone.description.trim(),
              startWeek: milestone.startWeek,
              duration: milestone.duration,
            })),
          })),
        },
      };

      const response = await createSubject(data);
      
      // Check success response
      if (response?.isSuccess === true) {
        toast.success(response.message || 'Subject created successfully!');
        onClose(true); // Pass true to indicate success and refresh
      } else {
        toast.error('Failed to create subject. Please try again.');
      }
    } catch (err) {
      console.error('Error creating subject:', err);
      
      // Handle validation errors (400)
      if (err?.response?.status === 400) {
        const errors = err?.response?.data?.errors;
        
        if (errors && typeof errors === 'object') {
          // Display each validation error
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(message => {
                toast.error(message);
              });
            }
          });
          // Set the first error to display in form
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            setError(firstError[0]);
          }
        } else {
          toast.error('Validation error occurred. Please check your input.');
          setError('Validation error occurred. Please check your input.');
        }
      } else {
        // Handle other errors
        const errorMessage = err?.response?.data?.message || err.message || 'Failed to create subject. Please try again.';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  const totalPercentage = gradeComponents.reduce(
    (sum, comp) => sum + comp.referencePercentage,
    0
  );

  return (
    <div className=''>
      {/* Error Message - Soft Minimalism: Gentle colors, rounded corners */}
      {error && (
        <div className='mx-8 mt-6 bg-red-50 border border-red-200 rounded-2xl p-5'>
          <p className='text-red-800 text-sm font-medium leading-relaxed'>{error}</p>
        </div>
      )}

      {/* Form Content - Scrollable */}
      <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto'>
        <div className='space-y-8'>
          {/* ==================== SUBJECT BASIC INFO ==================== */}
          <section className='bg-gray-50 rounded-2xl p-4 border border-gray-100'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='w-12 h-12 bg-orangeFpt-50 rounded-2xl flex items-center justify-center border border-orangeFpt-100'>
                <FileText className='w-6 h-6 text-orangeFpt-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 tracking-tight'>
                Subject Information
              </h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Subject Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className='w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 transition-all duration-200 outline-none'
                  placeholder='e.g., Software Engineering'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Subject Code <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value)}
                  className='w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 transition-all duration-200 outline-none'
                  placeholder='e.g., SWE201c'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label className='flex items-center gap-3 cursor-pointer group'>
                  <input
                    type='checkbox'
                    checked={isSubjectActive}
                    onChange={e => setIsSubjectActive(e.target.checked)}
                    className='w-5 h-5 text-orangeFpt-500 border-gray-300 rounded-xl focus:ring-orangeFpt-500 focus:ring-2 transition-all duration-200'
                  />
                  <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-all duration-200'>
                    Subject is Active
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* ==================== SYLLABUS INFO ==================== */}
          <section className='bg-gray-50 rounded-2xl p-4 border border-gray-100'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100'>
                <BookOpen className='w-6 h-6 text-blue-600' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 tracking-tight'>
                Syllabus Details
              </h3>
            </div>

            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Syllabus Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={syllabusName}
                    onChange={e => setSyllabusName(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all'
                    placeholder='e.g., SWE201c - Software Engineering Syllabus'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Credits <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    value={noCredit}
                    onChange={e => setNoCredit(Number(e.target.value))}
                    min='1'
                    max='10'
                    className='w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all'
                    required
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-sm font-semibold text-gray-700'>
                    Description <span className='text-red-500'>*</span>
                  </label>
                  <span className={`text-xs font-medium ${
                    description.length < 3 
                      ? 'text-red-500' 
                      : description.length > 500 
                        ? 'text-red-500' 
                        : description.length > 450 
                          ? 'text-orangeFpt-600' 
                          : 'text-gray-500'
                  }`}>
                    {description.length} / 500 characters
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows='4'
                  maxLength='500'
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all resize-none ${
                    description.length > 0 && description.length < 3
                      ? 'border-red-300 focus:ring-red-500'
                      : description.length > 500
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-200'
                  }`}
                  placeholder='Provide a detailed description of the syllabus (minimum 3 characters)...'
                  required
                />
                {description.length > 0 && description.length < 3 && (
                  <p className='mt-1.5 text-xs text-red-600 font-medium'>
                    Description must be at least 3 characters
                  </p>
                )}
              </div>

              <div>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={isSyllabusActive}
                    onChange={e => setIsSyllabusActive(e.target.checked)}
                    className='w-5 h-5 text-orangeFpt-500 border-gray-300 rounded focus:ring-orangeFpt-500'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    Syllabus is Active
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* ==================== GRADE COMPONENTS ==================== */}
          <section className='bg-gray-50 rounded-2xl p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-8'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center'>
                  <BarChart3 className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>
                    Grade Components
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Total: {totalPercentage}%{' '}
                    {totalPercentage === 100 ? (
                      <span className='text-green-600 font-semibold'>✓</span>
                    ) : (
                      <span className='text-red-600 font-semibold'>
                        (Must equal 100%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={addGradeComponent}
                className='flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all duration-200'
              >
                <Plus className='w-4 h-4' />
                Add Component
              </button>
            </div>

            <div className='space-y-4'>
              {gradeComponents.map((component, index) => (
                <div
                  key={index}
                  className='bg-white rounded-2xl p-4 border border-gray-200 flex gap-4 items-start'
                >
                  <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-2'>
                        Component Name
                      </label>
                      <input
                        type='text'
                        value={component.componentName}
                        onChange={e =>
                          updateGradeComponent(
                            index,
                            'componentName',
                            e.target.value
                          )
                        }
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent'
                        placeholder='e.g., Assignment'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-2'>
                        Percentage (%)
                      </label>
                      <input
                        type='number'
                        value={component.referencePercentage}
                        onChange={e =>
                          updateGradeComponent(
                            index,
                            'referencePercentage',
                            e.target.value
                          )
                        }
                        min='0'
                        max='100'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent'
                        required
                      />
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeGradeComponent(index)}
                    className='text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 mt-6'
                    disabled={gradeComponents.length === 1}
                  >
                    <Trash2 className='w-5 h-5' />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ==================== SUBJECT OUTCOMES ==================== */}
          <section className='bg-gray-50 rounded-2xl p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <Target className='w-5 h-5 text-purple-600' />
                </div>
                <h3 className='text-xl font-bold text-gray-900'>
                  Subject Outcomes & Milestones
                </h3>
              </div>
              <button
                type='button'
                onClick={addOutcome}
                className='flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all duration-200'
              >
                <Plus className='w-4 h-4' />
                Add Outcome
              </button>
            </div>

            <div className='space-y-6'>
              {subjectOutcomes.map((outcome, outcomeIndex) => (
                <div
                  key={outcomeIndex}
                  className='bg-white rounded-2xl p-5 border border-gray-200'
                >
                  {/* Outcome Header */}
                  <div className='flex items-start gap-4 mb-4'>
                    <div className='flex-1'>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Outcome {outcomeIndex + 1}{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <textarea
                        value={outcome.outcomeDetail}
                        onChange={e =>
                          updateOutcome(outcomeIndex, e.target.value)
                        }
                        rows='2'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent resize-none'
                        placeholder='Describe the learning outcome...'
                        required
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => removeOutcome(outcomeIndex)}
                      className='text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 mt-7'
                      disabled={subjectOutcomes.length === 1}
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>

                  {/* Milestones */}
                  <div className='ml-4 pl-4 border-l-2 border-orangeFpt-200'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-orangeFpt-500' />
                        Milestones
                      </h4>
                      <button
                        type='button'
                        onClick={() => addMilestone(outcomeIndex)}
                        className='text-xs flex items-center gap-1 text-orangeFpt-600 hover:text-orangeFpt-700 font-semibold'
                      >
                        <Plus className='w-3 h-3' />
                        Add Milestone
                      </button>
                    </div>

                    <div className='space-y-3'>
                      {outcome.syllabusMilestones.map(
                        (milestone, milestoneIndex) => (
                          <div
                            key={milestoneIndex}
                            className='bg-gray-50 rounded-xl p-4 border border-gray-200'
                          >
                            <div className='flex items-start gap-3'>
                              <div className='flex-1 space-y-3'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                  <div>
                                    <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                      Title <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                      type='text'
                                      value={milestone.title}
                                      onChange={e =>
                                        updateMilestone(
                                          outcomeIndex,
                                          milestoneIndex,
                                          'title',
                                          e.target.value
                                        )
                                      }
                                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent text-sm'
                                      placeholder='Milestone title'
                                      required
                                    />
                                  </div>
                                  <div className='grid grid-cols-2 gap-2'>
                                    <div>
                                      <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                        Start Week
                                      </label>
                                      <input
                                        type='number'
                                        value={milestone.startWeek}
                                        onChange={e =>
                                          updateMilestone(
                                            outcomeIndex,
                                            milestoneIndex,
                                            'startWeek',
                                            e.target.value
                                          )
                                        }
                                        min='1'
                                        max='11'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent text-sm'
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                        Duration (weeks)
                                      </label>
                                      <input
                                        type='number'
                                        value={milestone.duration}
                                        onChange={e =>
                                          updateMilestone(
                                            outcomeIndex,
                                            milestoneIndex,
                                            'duration',
                                            e.target.value
                                          )
                                        }
                                        min='1'
                                        max='11'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent text-sm'
                                        required
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Week Range Indicator */}
                                  {(() => {
                                    const endWeek = milestone.startWeek + milestone.duration - 1;
                                    const isValid = endWeek <= 11;
                                    return (
                                      <div className={`text-xs font-medium px-4 py-3 rounded-xl ${
                                        isValid 
                                          ? 'bg-green-50 text-green-700 border border-green-200' 
                                          : 'bg-red-50 text-red-700 border border-red-200'
                                      }`}>
                                        <div className='flex items-center justify-between'>
                                          <span>
                                            {isValid ? '✓' : '✗'} Week Range: {milestone.startWeek} → {endWeek}
                                          </span>
                                          <span className='font-mono'>
                                            ({milestone.startWeek} + {milestone.duration} - 1 = {endWeek})
                                          </span>
                                        </div>
                                        {!isValid && (
                                          <div className='mt-1 text-red-600 font-semibold'>
                                            ⚠ Exceeds week 11 limit!
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div>
                                  <label className='block text-xs font-semibold text-gray-600 mb-1'>
                                    Description <span className='text-red-500'>*</span>
                                  </label>
                                  <textarea
                                    value={milestone.description}
                                    onChange={e =>
                                      updateMilestone(
                                        outcomeIndex,
                                        milestoneIndex,
                                        'description',
                                        e.target.value
                                      )
                                    }
                                    rows='2'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent text-sm resize-none'
                                    placeholder='Milestone description'
                                    required
                                  />
                                </div>
                              </div>
                              <button
                                type='button'
                                onClick={() =>
                                  removeMilestone(outcomeIndex, milestoneIndex)
                                }
                                className='text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200'
                                disabled={
                                  outcome.syllabusMilestones.length === 1
                                }
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer - Soft Minimalism: Clean separation, generous spacing */}
        <div className='border-t border-gray-200 mt-6 p-4 pb-0 flex items-center justify-between'>
          <button
            type='button'
            onClick={() => onClose(false)}
            className='px-6 py-3.5 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 font-medium'
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type='submit'
            disabled={loading || totalPercentage !== 100}
            className='flex items-center gap-2.5 bg-orangeFpt-500 text-white px-8 py-3.5 rounded-2xl hover:bg-orangeFpt-600 hover:shadow-soft transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
          >
            {loading ? (
              <>
                <div className='w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Save className='w-5 h-5' />
                Create Subject
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubjectForm;