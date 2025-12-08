import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { handleProject } from '../../services/userService';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Calendar,
  Clock,
  Target,
  Flag,
  ArrowLeft,
  TrendingUp,
  AlertTriangle, // Import icon cho modal
} from 'lucide-react';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

const PendingProjectDetail = () => {
  const location = useLocation();
  const { id } = useParams();
  const project = location.state?.project;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  // State for Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApproveProject = async () => {
    setLoading(true);
    try {
      const response = await handleProject(project.projectId, true);
      if (response) {
        toast.success('Project approved successfully');
        setShowApproveModal(false);
        navigate('/head-department/project-approvals');
      } else {
        toast.error('Failed to approve project');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProject = async () => {
    setLoading(true);
    try {
      const response = await handleProject(project.projectId, false);
      if (response) {
        toast.success('Project rejected successfully');
        setShowRejectModal(false);
        navigate('/head-department/project-approvals');
      } else {
        toast.error('Failed to reject project');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100'>
          <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
            <XCircle className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-xl text-gray-600 font-medium'>
            No project data found
          </p>
          <p className='text-gray-400 mt-2'>Project ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <HeadDashboardLayout>
      <div className='min-h-screen flex bg-gray-50 relative'>
        <div className='flex-1 flex flex-col'>
          {/* Simple Header */}
          <div className='bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-6 py-6'>
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
                <span className='font-medium'>Back to Approvals</span>
              </button>

              {/* Project Header */}
              <div className='flex items-start justify-between gap-6'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-lg text-sm font-semibold uppercase'>
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
            {/* Info Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              {/* Subject Card */}
              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <BookOpen className='w-6 h-6 text-orange-600' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Subject Information
                  </h2>
                </div>
                <div className='space-y-3'>
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Subject Name
                    </span>
                    <p className='text-gray-900 font-semibold'>
                      {project.subjectName}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Subject Code
                    </span>
                    <p className='text-gray-900 font-mono bg-orange-50 px-3 py-1 rounded-lg inline-block mt-1'>
                      {project.subjectCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lecturer Card */}
              <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center'>
                    <User className='w-6 h-6 text-orange-600' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Lecturer Information
                  </h2>
                </div>
                <div className='space-y-3'>
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Lecturer Name
                    </span>
                    <p className='text-gray-900 font-semibold'>
                      {project.lecturerName}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Lecturer Code
                    </span>
                    <p className='text-gray-900 font-mono bg-orange-50 px-3 py-1 rounded-lg inline-block mt-1'>
                      {project.lecturerCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-orange-500' />
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Created At
                    </span>
                    <p className='text-gray-900 font-semibold'>
                      {new Date(project.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-orange-500' />
                  <div>
                    <span className='text-sm text-gray-500 font-medium'>
                      Last Updated
                    </span>
                    <p className='text-gray-900 font-semibold'>
                      {new Date(project.updatedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                  {project.objectives.map((objective, index) => (
                    <div
                      key={objective.objectiveId}
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
                              <div className='flex items-center gap-2 mb-2'>
                                <h3 className='text-lg font-bold text-gray-900'>
                                  Objective #{objective.objectiveId}
                                </h3>
                              </div>
                              <p className='text-gray-600 leading-relaxed'>
                                {objective.description}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                              objective.priority === 'High'
                                ? 'bg-red-50 text-red-700'
                                : objective.priority === 'Medium'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-green-50 text-green-700'
                            }`}
                          >
                            <Flag className='w-3.5 h-3.5' />
                            {objective.priority}
                          </span>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className='p-6'>
                        {objective.objectiveMilestones.length > 0 ? (
                          <>
                            <div className='flex items-center gap-2 mb-4'>
                              <TrendingUp className='w-5 h-5 text-orange-600' />
                              <h4 className='text-sm font-semibold text-gray-700'>
                                Milestones ({objective.objectiveMilestones.length})
                              </h4>
                            </div>
                            <div className='space-y-3'>
                              {objective.objectiveMilestones.map((m, mIndex) => (
                                <div
                                  key={m.objectiveMilestoneId}
                                  className='bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors'
                                >
                                  <div className='flex items-start gap-3'>
                                    <div className='w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                                      <span className='text-orange-700 font-bold text-xs'>
                                        {mIndex + 1}
                                      </span>
                                    </div>
                                    <div className='flex-1'>
                                      <h4 className='font-semibold text-gray-900 mb-1'>
                                        {m.title}
                                      </h4>
                                      <p className='text-sm text-gray-600 leading-relaxed mb-2'>
                                        {m.description}
                                      </p>
                                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                                        <Calendar className='w-3.5 h-3.5 text-orange-500' />
                                        <span className='font-medium'>
                                          {m.startDate}
                                        </span>
                                        <span>→</span>
                                        <span className='font-medium'>
                                          {m.endDate}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
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

            {/* Bottom Action Buttons - Now trigger modals */}
            <div className='flex gap-4 mt-8 pt-8 border-t border-gray-200'>
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={loading}
                className='flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-sm hover:shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <CheckCircle className='w-5 h-5' />
                Approve Project
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className='flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-sm hover:shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <XCircle className='w-5 h-5' />
                Reject Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-6">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            
            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Approve this project?
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to <span className="font-bold text-green-600">approve</span> this project? 
                <br />This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveProject}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-md shadow-green-100 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            
            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Reject this project?
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to <span className="font-bold text-red-500">reject</span> this project? 
                <br />This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectProject}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-md shadow-red-100 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </HeadDashboardLayout>
  );
};

export default PendingProjectDetail;