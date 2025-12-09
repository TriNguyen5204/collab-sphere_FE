import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubjectById } from '../../services/userService';
import {
  BookOpen,
  Award,
  BarChart3,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  ArrowLeft,
  FileText,
  Target,
} from 'lucide-react';
import ModalWrapper from '../../components/layout/ModalWrapper';
import UpdateSubjectForm from '../../features/head-department/components/UpdateSubjectForm';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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

  const handleCloseUpdateModal = () => setIsUpdateModalOpen(false);

  const handleUpdateSuccess = async () => {
    const updated = await getSubjectById(Number(id));
    setSubject(updated);
    handleCloseUpdateModal();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <div className='bg-white rounded-2xl shadow-sm p-12 text-center'>
          <div className='w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-lg text-gray-600 font-medium'>
            Loading subject details...
          </p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <div className='bg-white rounded-2xl shadow-sm p-12 text-center max-w-md'>
          <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <XCircle className='w-10 h-10 text-red-500' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Subject Not Found
          </h2>
          <p className='text-gray-600'>
            The subject you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const syllabus = subject.subjectSyllabus;

  return (
    <HeadDashboardLayout>
      <div className='min-h-screen flex bg-gray-50'>
        <div className='flex flex-1 flex-col'>
          {/* Simple Header */}
          <div className='bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-6 py-6'>
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
                <span className='font-medium'>Back</span>
              </button>

              {/* Subject Header */}
              <div className='flex items-start justify-between gap-6'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='bg-orange-50 text-orange-700 px-4 py-1.5 rounded-lg font-mono text-sm font-semibold'>
                      {subject.subjectCode}
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        subject.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {subject.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {subject.subjectName}
                  </h1>
                  {syllabus && (
                    <p className='text-gray-600 text-lg max-w-3xl leading-relaxed'>
                      {syllabus.description}
                    </p>
                  )}
                </div>

                {/* Update Button */}
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className='flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm'
                >
                  <Edit className='w-5 h-5' />
                  Edit Subject
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='max-w-7xl mx-auto px-6 py-8 w-full'>
            {/* Quick Stats */}
            {syllabus && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                      <CreditCard className='w-6 h-6 text-orange-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Credits
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>
                        {syllabus.noCredit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                      <Target className='w-6 h-6 text-orange-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Outcomes
                      </p>
                      <p className='text-3xl font-bold text-gray-900'>
                        {syllabus.subjectOutcomes?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                      <Calendar className='w-6 h-6 text-orange-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Created
                      </p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {new Date(syllabus.createdDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Syllabus Warning */}
            {!syllabus && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <AlertCircle className='w-6 h-6 text-yellow-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                      No Syllabus Available
                    </h3>
                    <p className='text-gray-600'>
                      This subject does not have a syllabus assigned yet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Content Column */}
              <div className='lg:col-span-2 space-y-8'>
                {/* Learning Outcomes Section */}
                {syllabus &&
                  syllabus.subjectOutcomes &&
                  syllabus.subjectOutcomes.length > 0 && (
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100'>
                      <div className='px-6 py-4 border-b border-gray-100'>
                        <div className='flex items-center gap-3'>
                          <Award className='w-6 h-6 text-orange-600' />
                          <h2 className='text-xl font-bold text-gray-900'>
                            Learning Outcomes
                          </h2>
                        </div>
                      </div>

                      <div className='p-6'>
                        <p className='text-gray-600 mb-6'>
                          Upon completion of this subject, students will be able
                          to:
                        </p>
                        <div className='space-y-3'>
                          {syllabus.subjectOutcomes.map((outcome, index) => (
                            <div
                              key={outcome.subjectOutcomeId}
                              className='flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'
                            >
                              <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                                <span className='text-white font-bold text-sm'>
                                  {index + 1}
                                </span>
                              </div>
                              <p className='text-gray-800 leading-relaxed flex-1'>
                                {outcome.outcomeDetail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Assessment Section */}
                {syllabus &&
                  syllabus.subjectGradeComponents &&
                  syllabus.subjectGradeComponents.length > 0 && (
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100'>
                      <div className='px-6 py-4 border-b border-gray-100'>
                        <div className='flex items-center gap-3'>
                          <BarChart3 className='w-6 h-6 text-orange-600' />
                          <h2 className='text-xl font-bold text-gray-900'>
                            Assessment Breakdown
                          </h2>
                        </div>
                      </div>

                      <div className='p-6'>
                        <p className='text-gray-600 mb-6'>
                          Your final grade will be calculated based on the
                          following components:
                        </p>

                        <div className='space-y-3'>
                          {syllabus.subjectGradeComponents.map(
                            (component, index) => (
                              <div
                                key={component.subjectGradeComponentId}
                                className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'
                              >
                                <div className='flex items-center gap-4 flex-1'>
                                  <div className='w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center'>
                                    <span className='text-orange-700 font-bold text-sm'>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className='text-gray-800 font-semibold'>
                                    {component.componentName}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='text-2xl font-bold text-orange-600'>
                                    {component.referencePercentage}%
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {/* Total Bar */}
                        <div className='mt-6 bg-orange-500 rounded-xl p-5'>
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
                  <div className='bg-white rounded-2xl shadow-sm border border-gray-100 top-6'>
                    <div className='px-6 py-4 border-b border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <BookOpen className='w-6 h-6 text-orange-600' />
                        <h3 className='text-lg font-bold text-gray-900'>
                          Syllabus Details
                        </h3>
                      </div>
                    </div>

                    <div className='p-6 space-y-4'>
                      <div>
                        <h4 className='text-sm font-semibold text-gray-500 mb-1'>
                          Syllabus Name
                        </h4>
                        <p className='text-gray-900 font-medium'>
                          {syllabus.syllabusName}
                        </p>
                      </div>

                      <div className='pt-4 border-t border-gray-100'>
                        <div className='flex items-center gap-3'>
                          <CreditCard className='w-5 h-5 text-orange-500' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Credit Hours
                            </p>
                            <p className='font-bold text-gray-900 text-lg'>
                              {syllabus.noCredit} Credits
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='pt-4 border-t border-gray-100'>
                        <div className='flex items-center gap-3'>
                          <Calendar className='w-5 h-5 text-orange-500' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Created Date
                            </p>
                            <p className='font-medium text-gray-900'>
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

                      <div className='pt-4 border-t border-gray-100'>
                        <div className='flex items-center gap-3'>
                          <FileText className='w-5 h-5 text-orange-500' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Total Components
                            </p>
                            <p className='font-bold text-gray-900 text-lg'>
                              {syllabus.subjectGradeComponents?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Card */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                  <h3 className='font-bold text-gray-900 mb-4'>
                    Quick Actions
                  </h3>
                  <div className='space-y-3'>
                    <button
                      onClick={() => setIsUpdateModalOpen(true)}
                      className='w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors font-medium'
                    >
                      <Edit className='w-5 h-5' />
                      Edit Subject
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className='w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium'
                    >
                      <ArrowLeft className='w-5 h-5' />
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Update Modal */}
          <ModalWrapper
            isOpen={isUpdateModalOpen}
            onClose={handleCloseUpdateModal}
            title='Update Subject'
          >
            <UpdateSubjectForm
              subject={subject}
              onSuccess={handleUpdateSuccess}
              onCancel={handleCloseUpdateModal}
            />
          </ModalWrapper>
        </div>
      </div>
    </HeadDashboardLayout>
  );
};

export default SubjectDetail;
