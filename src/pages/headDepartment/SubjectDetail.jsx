import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubjectById } from '../../services/userService';
import {
  BookOpen,
  Award,
  BarChart3,
  Calendar,
  CreditCard,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Target,
  Clock,
} from 'lucide-react';
import UpdateSubjectForm from '../../features/head-department/components/UpdateSubjectForm';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const res = await getSubjectById(Number(id));
        setSubject(res);
      } catch (err) {
        console.error('Error fetching subject:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  if (loading) {
    return (
      <HeadDashboardLayout>
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6'>
          <div className='bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200'>
            <div className='w-16 h-16 border-4 border-orangeFpt-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-lg text-slate-600 font-medium'>
              Loading subject details...
            </p>
          </div>
        </div>
      </HeadDashboardLayout>
    );
  }

  if (!subject) {
    return (
      <HeadDashboardLayout>
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6'>
          <div className='bg-white rounded-2xl shadow-sm p-12 text-center max-w-md border border-slate-200'>
            <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='w-10 h-10 text-red-500' />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 mb-2'>
              Subject Not Found
            </h2>
            <p className='text-slate-600'>
              The subject you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate(-1)}
              className='mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </HeadDashboardLayout>
    );
  }

  const syllabus = subject.subjectSyllabus;

  return (
    <HeadDashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
        <div className='mx-auto space-y-6'>
          <div className='flex gap-10 border-b border-slate-200 px-2'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 flex items-center gap-2 font-semibold transition text-sm ${
                activeTab === 'overview'
                  ? 'text-orangeFpt-600 border-b-2 border-orangeFpt-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className='w-4 h-4 bg-orangeFpt-500 rounded-full'></span>
              Overview
            </button>

            <button
              onClick={() => setActiveTab('update')}
              className={`py-3 flex items-center gap-2 font-semibold transition text-sm ${
                activeTab === 'update'
                  ? 'text-orangeFpt-600 border-b-2 border-orangeFpt-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className='w-4 h-4 bg-slate-600 rounded-full'></span>
              Update Subject
            </button>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Header Section */}
              <div className='relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur'>
                <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl'></div>
                <div className='absolute bottom-0 right-20 h-32 w-32 rounded-full bg-orangeFpt-50/50 blur-2xl'></div>

                <div className='relative z-10 px-6 py-8 lg:px-10'>
                  {/* Back Button */}
                  <button
                    onClick={() => navigate(-1)}
                    className='mb-6 flex items-center gap-2 text-slate-600 hover:text-orangeFpt-600 transition-colors font-medium text-sm'
                  >
                    <ArrowLeft className='w-4 h-4' />
                    Back to Subjects
                  </button>

                  <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='space-y-4 flex-1'>
                      <div className='flex items-center gap-3 flex-wrap'>
                        <span className='bg-orangeFpt-100 text-orangeFpt-700 px-4 py-1.5 rounded-lg font-mono text-sm font-bold border border-orangeFpt-200'>
                          {subject.subjectCode}
                        </span>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            subject.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {subject.isActive ? '● ACTIVE' : '○ INACTIVE'}
                        </span>
                      </div>
                      <h1 className='text-3xl font-bold text-slate-900'>
                        {subject.subjectName}
                      </h1>
                      {syllabus?.description && (
                        <div className='text-slate-600 text-base max-w-3xl leading-relaxed'>
                          {syllabus.description
                            .split('\n')
                            .map((line, index) => (
                              <p key={index} className='mb-2'>
                                {line || '\u00A0'}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {syllabus && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-white rounded-2xl shadow-sm p-5 border border-slate-200 hover:border-orangeFpt-200 transition-colors'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-orangeFpt-50 rounded-xl flex items-center justify-center border border-orangeFpt-100'>
                        <CreditCard className='w-6 h-6 text-orangeFpt-600' />
                      </div>
                      <div>
                        <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                          Credits
                        </p>
                        <p className='text-2xl font-bold text-slate-900'>
                          {syllabus.noCredit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-white rounded-2xl shadow-sm p-5 border border-slate-200 hover:border-orangeFpt-200 transition-colors'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-orangeFpt-50 rounded-xl flex items-center justify-center border border-orangeFpt-100'>
                        <Target className='w-6 h-6 text-orangeFpt-600' />
                      </div>
                      <div>
                        <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                          Outcomes
                        </p>
                        <p className='text-2xl font-bold text-slate-900'>
                          {syllabus.subjectOutcomes?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-white rounded-2xl shadow-sm p-5 border border-slate-200 hover:border-orangeFpt-200 transition-colors'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-orangeFpt-50 rounded-xl flex items-center justify-center border border-orangeFpt-100'>
                        <BarChart3 className='w-6 h-6 text-orangeFpt-600' />
                      </div>
                      <div>
                        <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                          Components
                        </p>
                        <p className='text-2xl font-bold text-slate-900'>
                          {syllabus.subjectGradeComponents?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Syllabus Warning */}
              {!syllabus && (
                <div className='bg-amber-50 border-2 border-amber-200 rounded-2xl p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <AlertCircle className='w-6 h-6 text-amber-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-slate-900 mb-1'>
                        No Syllabus Available
                      </h3>
                      <p className='text-slate-600'>
                        This subject does not have a syllabus assigned yet.
                        Click "Edit Subject" to add syllabus information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Main Content Column */}
                <div className='lg:col-span-2 space-y-6'>
                  {/* Learning Outcomes & Milestones Section */}
                  {syllabus?.subjectOutcomes?.length > 0 && (
                    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
                      <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-orangeFpt-50 rounded-lg'>
                            <Award className='w-5 h-5 text-orangeFpt-600' />
                          </div>
                          <h2 className='text-lg font-bold text-slate-900'>
                            Learning Outcomes & Milestones
                          </h2>
                        </div>
                      </div>

                      <div className='p-6'>
                        <p className='text-slate-500 text-sm mb-5'>
                          Upon completion of this subject, students will be able
                          to:
                        </p>
                        <div className='space-y-6'>
                          {syllabus.subjectOutcomes.map((outcome, index) => {
                            // Filter milestones cho outcome này
                            const outcomeMilestones = syllabus.syllabusMilestones?.filter(
                              m => m.subjectOutcomeId === outcome.subjectOutcomeId
                            ) || [];

                            return (
                              <div
                                key={outcome.subjectOutcomeId}
                                className='border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orangeFpt-200 transition-colors'
                              >
                                {/* Outcome Header */}
                                <div className='bg-orangeFpt-50 p-4 flex gap-4'>
                                  <div className='w-10 h-10 bg-orangeFpt-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm'>
                                    <span className='text-white font-bold text-lg'>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className='flex-1'>
                                    <h3 className='font-bold text-slate-900 mb-1'>
                                      Learning Outcome
                                    </h3>
                                    <p className='text-slate-700 leading-relaxed'>
                                      {outcome.outcomeDetail}
                                    </p>
                                  </div>
                                </div>

                                {/* Milestones for this Outcome */}
                                {outcomeMilestones.length > 0 && (
                                  <div className='p-4 bg-white'>
                                    <div className='flex items-center gap-2 mb-3'>
                                      <Calendar className='w-4 h-4 text-orangeFpt-600' />
                                      <h4 className='font-semibold text-slate-900 text-sm'>
                                        Milestones ({outcomeMilestones.length})
                                      </h4>
                                    </div>
                                    <div className='space-y-2'>
                                      {outcomeMilestones.map((milestone, mIndex) => (
                                        <div
                                          key={milestone.syllabusMilestoneId}
                                          className='bg-slate-50 rounded-xl p-4 hover:bg-orangeFpt-50/50 transition-colors border border-slate-200 hover:border-orangeFpt-200'
                                        >
                                          <div className='grid grid-cols-12 gap-4'>
                                            {/* Number Badge */}
                                            <div className='col-span-1 flex items-center'>
                                              <span className='w-8 h-8 bg-white border-2 border-orangeFpt-500 text-orangeFpt-700 rounded-lg flex items-center justify-center font-bold text-sm'>
                                                {mIndex + 1}
                                              </span>
                                            </div>
                                            
                                            {/* Title */}
                                            <div className='col-span-3 flex items-center'>
                                              <p className='font-bold text-slate-900'>
                                                {milestone.title}
                                              </p>
                                            </div>
                                            
                                            {/* Description */}
                                            <div className='col-span-4 flex items-center'>
                                              <p className='text-slate-600 text-sm leading-relaxed'>
                                                {milestone.description}
                                              </p>
                                            </div>
                                            
                                            {/* Week Info */}
                                            <div className='col-span-2 flex items-center gap-2'>
                                              <div className='p-1.5 bg-blue-50 rounded-lg'>
                                                <Calendar className='w-4 h-4 text-blue-600' />
                                              </div>
                                              <span className='text-slate-700 font-semibold text-sm'>
                                                Week {milestone.startWeek}
                                              </span>
                                            </div>
                                            
                                            {/* Duration */}
                                            <div className='col-span-2 flex items-center gap-2'>
                                              <div className='p-1.5 bg-emerald-50 rounded-lg'>
                                                <Clock className='w-4 h-4 text-emerald-600' />
                                              </div>
                                              <span className='text-slate-700 font-semibold text-sm'>
                                                {milestone.duration} week{milestone.duration !== 1 ? 's' : ''}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* No milestones message */}
                                {outcomeMilestones.length === 0 && (
                                  <div className='p-4 bg-slate-50 text-center'>
                                    <p className='text-slate-500 text-sm'>
                                      No milestones for this outcome yet
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Assessment Section */}
                  {syllabus?.subjectGradeComponents?.length > 0 && (
                    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
                      <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-orangeFpt-50 rounded-lg'>
                            <BarChart3 className='w-5 h-5 text-orangeFpt-600' />
                          </div>
                          <h2 className='text-lg font-bold text-slate-900'>
                            Assessment Breakdown
                          </h2>
                        </div>
                      </div>

                      <div className='p-6'>
                        <p className='text-slate-500 text-sm mb-5'>
                          Final grade calculation based on the following
                          components:
                        </p>

                        <div className='space-y-3'>
                          {syllabus.subjectGradeComponents.map(
                            (component, index) => (
                              <div
                                key={component.subjectGradeComponentId}
                                className='flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-orangeFpt-50/50 transition-colors border border-transparent hover:border-orangeFpt-100'
                              >
                                <div className='flex items-center gap-4 flex-1'>
                                  <div className='w-10 h-10 bg-orangeFpt-100 rounded-lg flex items-center justify-center border border-orangeFpt-200'>
                                    <span className='text-orangeFpt-700 font-bold text-sm'>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className='text-slate-800 font-semibold'>
                                    {component.componentName}
                                  </span>
                                </div>
                                <div className='px-4 py-2 bg-orangeFpt-50 rounded-lg border border-orangeFpt-100'>
                                  <span className='text-xl font-bold text-orangeFpt-600'>
                                    {component.referencePercentage}%
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {/* Total Bar */}
                        <div className='mt-6 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 rounded-xl p-5 shadow-lg shadow-orangeFpt-200'>
                          <div className='flex items-center justify-between text-white'>
                            <span className='text-lg font-semibold'>Total</span>
                            <span className='text-3xl font-bold'>
                              {syllabus.subjectGradeComponents.reduce(
                                (sum, c) => sum + c.referencePercentage,
                                0
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Column */}
                <div className='space-y-6'>
                  {/* Syllabus Info Card */}
                  {syllabus && (
                    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
                      <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-orangeFpt-50 rounded-lg'>
                            <BookOpen className='w-5 h-5 text-orangeFpt-600' />
                          </div>
                          <h3 className='text-lg font-bold text-slate-900'>
                            Syllabus Details
                          </h3>
                        </div>
                      </div>

                      <div className='p-6 space-y-5'>
                        <div>
                          <p className='text-xs font-bold uppercase tracking-wide text-slate-400 mb-1'>
                            Syllabus Name
                          </p>
                          <p className='text-slate-900 font-semibold'>
                            {syllabus.syllabusName}
                          </p>
                        </div>

                        <div className='pt-4 border-t border-slate-100'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-50 rounded-lg'>
                              <CreditCard className='w-4 h-4 text-blue-600' />
                            </div>
                            <div>
                              <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                                Credit Hours
                              </p>
                              <p className='font-bold text-slate-900 text-lg'>
                                {syllabus.noCredit} Credits
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='pt-4 border-t border-slate-100'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-purple-50 rounded-lg'>
                              <Calendar className='w-4 h-4 text-purple-600' />
                            </div>
                            <div>
                              <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                                Created Date
                              </p>
                              <p className='font-medium text-slate-900'>
                                {new Date(
                                  syllabus.createdDate
                                ).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='pt-4 border-t border-slate-100'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-50 rounded-lg'>
                              <FileText className='w-4 h-4 text-emerald-600' />
                            </div>
                            <div>
                              <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                                Grade Components
                              </p>
                              <p className='font-bold text-slate-900 text-lg'>
                                {syllabus.subjectGradeComponents?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {activeTab === 'update' && (
              <UpdateSubjectForm
                subject={subject}
                onSuccess={async () => {
                  // load lại data rồi chuyển tab về overview
                  const updated = await getSubjectById(Number(id));
                  setSubject(updated);
                  setActiveTab('overview');
                }}
                onCancel={() => setActiveTab('overview')}
              />
          )}
        </div>
      </div>
    </HeadDashboardLayout>
  );
};

export default SubjectDetail;