import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../services/userService';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';
import {
  BookOpen,
  User,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Users,
  Shield,
  FileText,
  AlertCircle,
  Pencil,
  Code,
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

  // Helper function to parse description sections
  const parseDescription = (description) => {
    if (!description) return { summary: '', actorFeatures: [] };
    
    const sections = description.split('\n\n');
    const summary = sections[0] || '';
    const actorFeatures = [];

    sections.forEach(section => {
      if (section.includes('STUDENT FEATURES:')) {
        const features = section.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        actorFeatures.push({ actor: 'Student', features });
      } else if (section.includes('LECTURER FEATURES:')) {
        const features = section.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        actorFeatures.push({ actor: 'Lecturer', features });
      } else if (section.includes('ADMINISTRATOR FEATURES:')) {
        const features = section.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        actorFeatures.push({ actor: 'Administrator', features });
      }
    });

    return { summary, actorFeatures };
  };

  // Helper function to parse business rules
  const parseBusinessRules = (rules) => {
    if (!rules) return [];
    return rules.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  };

  // Helper function to parse actors
  const parseActors = (actors) => {
    if (!actors) return [];
    return actors.split(',').map(actor => actor.trim());
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'APPROVED': 'bg-green-100 text-green-700 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'REJECTED': 'bg-red-100 text-red-700 border-red-200',
      'DRAFT': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.DRAFT;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  };

  if (loading) {
    return (
      <HeadDashboardLayout>
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center'>
          <div className='bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100'>
            <Loader2 className='w-16 h-16 animate-spin text-orange-600 mx-auto mb-4' />
            <p className='text-lg text-gray-600 font-semibold'>
              Loading project details...
            </p>
          </div>
        </div>
      </HeadDashboardLayout>
    );
  }

  if (!project) {
    return (
      <HeadDashboardLayout>
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-6'>
          <div className='bg-white rounded-3xl shadow-xl p-12 text-center max-w-md border border-gray-100'>
            <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='w-10 h-10 text-red-500' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Project Not Found
            </h2>
            <p className='text-gray-600 mb-6'>
              The project you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className='px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold'
            >
              Go Back
            </button>
          </div>
        </div>
      </HeadDashboardLayout>
    );
  }

  const { summary, actorFeatures } = parseDescription(project.description);
  const businessRules = parseBusinessRules(project.businessRules);
  const actors = parseActors(project.actors);

  return (
    <HeadDashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
        {/* Hero Header */}
        <div className='relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur'>
          <div className=' px-6 py-8'>
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors group'
            >
              <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
              <span className='font-medium'>Back to Projects</span>
            </button>

            {/* Project Header */}
            <div className='flex items-start justify-between gap-6 flex-wrap'>
              <div className='flex-1 min-w-0'>
                {/* Status & IDs */}
                <div className='flex items-center gap-3 mb-4 flex-wrap'>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getStatusColor(project.statusString)}`}>
                    ✓ {project.statusString}
                  </span>
                  <span className='px-3 py-1 rounded-full text-xs font-mono bg-orangeFpt-100/30 text-gray-700 border border-orangeFpt-200'>
                    ID: {project.projectId}
                  </span>
                  <span className='px-3 py-1 rounded-full text-xs font-mono bg-orangeFpt-100/30 text-gray-700 border border-orangeFpt-200'>
                    {project.subjectCode}
                  </span>
                </div>

                {/* Project Name */}
                <h1 className='text-4xl font-black text-gray-900 mb-3 leading-tight'>
                  {project.projectName}
                </h1>

                {/* Meta Info */}
                <div className='flex items-center gap-6 text-gray-700 flex-wrap'>
                  <div className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-orangeFpt-500' />
                    <span className='text-sm font-medium'>{project.lecturerName}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <BookOpen className='w-4 h-4 text-orangeFpt-500' />
                    <span className='text-sm font-medium'>{project.subjectName}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-orangeFpt-500' />
                    <span className='text-sm font-medium'>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=' px-6 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Column */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Summary */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-white rounded-lg shadow-sm'>
                      <FileText className='w-5 h-5 text-orange-600' />
                    </div>
                    <h2 className='text-lg font-bold text-gray-900'>Project Overview</h2>
                  </div>
                </div>
                <div className='p-6'>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                    {summary}
                  </p>
                </div>
              </div>

              {/* Actor Features */}
              {actorFeatures.length > 0 && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-white rounded-lg shadow-sm'>
                        <Users className='w-5 h-5 text-blue-600' />
                      </div>
                      <h2 className='text-lg font-bold text-gray-900'>Actor Features</h2>
                    </div>
                  </div>
                  <div className='p-6 space-y-6'>
                    {actorFeatures.map((section, idx) => (
                      <div key={idx} className='group'>
                        {/* Actor Header */}
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'>
                            <span className='text-lg font-bold'>{section.actor[0]}</span>
                          </div>
                          <h3 className='text-xl font-bold text-gray-900'>{section.actor}</h3>
                        </div>

                        {/* Features List */}
                        <div className='space-y-2 ml-13'>
                          {section.features.map((feature, fIdx) => (
                            <div key={fIdx} className='flex items-start gap-3 group/item'>
                              <div className='flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5'>
                                <CheckCircle2 className='w-3.5 h-3.5 text-orange-600' />
                              </div>
                              <p className='text-gray-700 leading-relaxed flex-1 group-hover/item:text-gray-900 transition-colors'>
                                {feature}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Rules */}
              {businessRules.length > 0 && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-white rounded-lg shadow-sm'>
                        <Shield className='w-5 h-5 text-purple-600' />
                      </div>
                      <h2 className='text-lg font-bold text-gray-900'>Business Rules</h2>
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='space-y-3'>
                      {businessRules.map((rule, idx) => (
                        <div key={idx} className='flex items-start gap-3 group'>
                          <div className='flex-shrink-0 w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center'>
                            <span className='text-sm font-bold text-purple-700'>{idx + 1}</span>
                          </div>
                          <p className='text-gray-700 leading-relaxed flex-1 pt-0.5 group-hover:text-gray-900 transition-colors'>
                            {rule}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Project Info Card */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden top-6'>
                <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-bold text-gray-900'>Project Details</h3>
                </div>
                
                <div className='p-6 space-y-4'>
                  {/* Lecturer */}
                  <div className='pb-4 border-b border-gray-100'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-orange-50 rounded-lg'>
                        <User className='w-5 h-5 text-orange-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 font-semibold mb-1'>Lecturer</p>
                        <p className='font-bold text-gray-900'>{project.lecturerName}</p>
                        <p className='text-xs text-gray-500 font-mono mt-1'>{project.lecturerCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className='pb-4 border-b border-gray-100'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-blue-50 rounded-lg'>
                        <BookOpen className='w-5 h-5 text-blue-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 font-semibold mb-1'>Subject</p>
                        <p className='font-bold text-gray-900'>{project.subjectName}</p>
                        <span className='inline-block mt-2 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-mono font-bold'>
                          {project.subjectCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className='pb-4 border-b border-gray-100'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-green-50 rounded-lg'>
                        <CheckCircle2 className='w-5 h-5 text-green-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-gray-500 font-semibold mb-1'>Status</p>
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusColor(project.statusString)}`}>
                          {project.statusString}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actors */}
                  {actors.length > 0 && (
                    <div className='pb-4 border-b border-gray-100'>
                      <div className='flex items-start gap-3'>
                        <div className='p-2 bg-purple-50 rounded-lg'>
                          <Users className='w-5 h-5 text-purple-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-gray-500 font-semibold mb-2'>Actors</p>
                          <div className='flex flex-wrap gap-2'>
                            {actors.map((actor, idx) => (
                              <span key={idx} className='px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold'>
                                {actor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3 text-xs'>
                      <Clock className='w-4 h-4 text-gray-400' />
                      <div>
                        <p className='text-gray-500'>Created</p>
                        <p className='text-gray-900 font-semibold'>{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 text-xs'>
                      <Pencil className='w-4 h-4 text-gray-400' />
                      <div>
                        <p className='text-gray-500'>Last Updated</p>
                        <p className='text-gray-900 font-semibold'>{formatDate(project.updatedAt)}</p>
                      </div>
                    </div>
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