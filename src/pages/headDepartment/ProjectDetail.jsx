import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../services/userService';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';
import {
  BookOpen,
  User,
  Calendar,
  Flag,
  Target,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  ArrowLeft,
  Edit,
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProjectById(id);
        setProject(res);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex justify-center items-center'>
        <div className='bg-white rounded-2xl shadow-sm p-12 text-center'>
          <Loader2 className='w-16 h-16 animate-spin text-orange-600 mx-auto mb-4' />
          <p className='text-lg text-gray-600 font-medium'>
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='min-h-screen bg-gray-50 flex justify-center items-center p-6'>
        <div className='bg-white rounded-2xl shadow-sm p-12 text-center max-w-md'>
          <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <XCircle className='w-10 h-10 text-red-500' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Project Not Found
          </h2>
          <p className='text-gray-600'>
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HeadDashboardLayout>
      <div className='min-h-screen flex bg-gray-50'>
        <div className='flex flex-col flex-1'>
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

              {/* Project Header */}
              <div className='flex items-start justify-between gap-6'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='bg-orange-50 text-orange-700 px-4 py-1.5 rounded-lg text-sm font-semibold uppercase'>
                      {project.statusString}
                    </span>
                  </div>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {project.projectName}
                  </h1>
                  <p className='text-gray-600 text-lg max-w-3xl leading-relaxed'>
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='max-w-7xl mx-auto px-6 py-8 w-full'>
            {/* Quick Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <User className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>
                      Lecturer
                    </p>
                    <p className='text-lg font-semibold text-gray-900'>
                      {project.lecturerName}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <BookOpen className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>Subject</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {project.subjectName}
                    </p>
                    <span className='inline-block mt-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-mono font-semibold'>
                      {project.subjectCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <Calendar className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>Created</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <Clock className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>Updated</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {new Date(project.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Content Column */}
              <div className='lg:col-span-2 space-y-8'>
                {/* Objectives Section */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100'>
                  <div className='px-6 py-4 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Target className='w-6 h-6 text-orange-600' />
                        <h2 className='text-xl font-bold text-gray-900'>
                          Project Objectives
                        </h2>
                      </div>
                      <span className='text-sm text-gray-500 font-medium'>
                        {project.objectives.length} objectives
                      </span>
                    </div>
                  </div>

                  <div className='p-6'>
                    <div className='space-y-6'>
                      {project.objectives.map((obj, index) => (
                        <div
                          key={obj.objectiveId}
                          className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all'
                        >
                          {/* Objective Header */}
                          <div className='p-6 bg-white border-b border-gray-100'>
                            <div className='flex justify-between items-start gap-4'>
                              <div className='flex items-start gap-3 flex-1'>
                                <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                                  <span className='text-white font-bold text-sm'>
                                    {index + 1}
                                  </span>
                                </div>
                                <div className='flex-1'>
                                  <h3 className='text-lg font-bold text-gray-900 mb-1'>
                                    {obj.description}
                                  </h3>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                  obj.priority === 'High'
                                    ? 'bg-red-50 text-red-700'
                                    : obj.priority === 'Medium'
                                      ? 'bg-yellow-50 text-yellow-700'
                                      : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {obj.priority} Priority
                              </span>
                            </div>
                          </div>

                          {/* Milestones */}
                          <div className='p-6'>
                            {obj.objectiveMilestones.length > 0 ? (
                              <>
                                <div className='flex items-center gap-2 mb-4'>
                                  <TrendingUp className='w-5 h-5 text-orange-600' />
                                  <h4 className='text-sm font-semibold text-gray-700'>
                                    Milestones ({obj.objectiveMilestones.length}
                                    )
                                  </h4>
                                </div>
                                <div className='space-y-3'>
                                  {obj.objectiveMilestones.map(
                                    (ms, msIndex) => (
                                      <div
                                        key={ms.objectiveMilestoneId}
                                        className='bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors'
                                      >
                                        <div className='flex items-start gap-3'>
                                          <div className='w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                                            <span className='text-orange-700 font-bold text-xs'>
                                              {msIndex + 1}
                                            </span>
                                          </div>
                                          <div className='flex-1'>
                                            <h4 className='font-semibold text-gray-900 mb-1'>
                                              {ms.title}
                                            </h4>
                                            <p className='text-sm text-gray-600 leading-relaxed mb-2'>
                                              {ms.description}
                                            </p>
                                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                                              <Calendar className='w-3.5 h-3.5 text-orange-500' />
                                              <span className='font-medium'>
                                                {ms.startDate}
                                              </span>
                                              <span>→</span>
                                              <span className='font-medium'>
                                                {ms.endDate}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className='text-center py-8'>
                                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                                  <Calendar className='w-6 h-6 text-gray-400' />
                                </div>
                                <p className='text-sm text-gray-500'>
                                  No milestones available
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className='space-y-6'>
                {/* Project Info Card */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 top-6'>
                  <div className='px-6 py-4 border-b border-gray-100'>
                    <div className='flex items-center gap-3'>
                      <Flag className='w-6 h-6 text-orange-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        Project Details
                      </h3>
                    </div>
                  </div>

                  <div className='p-6 space-y-4'>
                    <div>
                      <h4 className='text-sm font-semibold text-gray-500 mb-1'>
                        Project Name
                      </h4>
                      <p className='text-gray-900 font-medium'>
                        {project.projectName}
                      </p>
                    </div>

                    <div className='pt-4 border-t border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <User className='w-5 h-5 text-orange-500' />
                        <div>
                          <p className='text-xs text-gray-500'>Lecturer</p>
                          <p className='font-semibold text-gray-900'>
                            {project.lecturerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='pt-4 border-t border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <BookOpen className='w-5 h-5 text-orange-500' />
                        <div>
                          <p className='text-xs text-gray-500'>Subject</p>
                          <p className='font-semibold text-gray-900'>
                            {project.subjectName}
                          </p>
                          <span className='inline-block mt-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-mono'>
                            {project.subjectCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='pt-4 border-t border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <CheckCircle2 className='w-5 h-5 text-orange-500' />
                        <div>
                          <p className='text-xs text-gray-500'>Status</p>
                          <p className='font-bold text-gray-900 uppercase text-sm'>
                            {project.statusString}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='pt-4 border-t border-gray-100'>
                      <div className='flex items-center gap-3'>
                        <Target className='w-5 h-5 text-orange-500' />
                        <div>
                          <p className='text-xs text-gray-500'>
                            Total Objectives
                          </p>
                          <p className='font-bold text-gray-900 text-lg'>
                            {project.objectives.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                  <h3 className='font-bold text-gray-900 mb-4'>
                    Quick Actions
                  </h3>
                  <div className='space-y-3'>
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
        </div>
      </div>
    </HeadDashboardLayout>
  );
};

export default ProjectDetail;
