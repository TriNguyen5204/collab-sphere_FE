import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { handleProject } from '../../services/userService';
import {
  CheckCircle,
  XCircle,
  BookOpen,
  Code,
  User,
  Calendar,
  Clock,
  Target,
  Flag,
  AlertTriangle,
  
} from 'lucide-react';

const PendingProjectDetail = () => {
  const location = useLocation();
  const { id } = useParams();
  const project = location.state?.project;
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApproveProject = async () => {
    const response = await handleProject(project.projectId, true);
    if (response) {
      toast.success(response);
      navigate('/head-department/project-approvals');
    } else {
      toast.error(`Failed to approve project: ${response}`);
    }
  };

  const handleRejectProject = async () => {
    const response = await handleProject(project.projectId, false);
    if (response) {
      toast.success(response);
      navigate('/head-department/project-approvals');
    } else {
      toast.error(`Failed to reject project: ${response}`);
    }
  };

  if (!project) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='text-center p-8 bg-white rounded-2xl shadow-xl'>
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Card */}
        <div className='bg-white shadow-2xl rounded-3xl overflow-hidden mb-6'>
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h1 className='text-3xl md:text-4xl font-bold mb-3'>
                  {project.projectName}
                </h1>
                <p className='text-blue-100 text-lg leading-relaxed'>
                  {project.description}
                </p>
              </div>
              <div className='ml-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full'>
                <span className='text-sm font-medium'>
                  {project.statusString}
                </span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              {/* Subject Card */}
              <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center'>
                    <BookOpen className='w-6 h-6 text-white' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-800'>
                    Subject Information
                  </h2>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-500 font-medium min-w-[60px]'>
                      Name:
                    </span>
                    <span className='text-gray-800 font-semibold'>
                      {project.subjectName}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Code className='w-4 h-4 text-blue-500' />
                    <span className='text-gray-500 font-medium'>Code:</span>
                    <span className='text-gray-800 font-mono bg-blue-100 px-3 py-1 rounded-lg'>
                      {project.subjectCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lecturer Card */}
              <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center'>
                    <User className='w-6 h-6 text-white' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-800'>
                    Lecturer Information
                  </h2>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-500 font-medium min-w-[60px]'>
                      Name:
                    </span>
                    <span className='text-gray-800 font-semibold'>
                      {project.lecturerName}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Code className='w-4 h-4 text-purple-500' />
                    <span className='text-gray-500 font-medium'>Code:</span>
                    <span className='text-gray-800 font-mono bg-purple-100 px-3 py-1 rounded-lg'>
                      {project.lecturerCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className='bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 mb-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-indigo-500' />
                  <div>
                    <span className='text-gray-500 text-sm'>Created At</span>
                    <p className='text-gray-800 font-semibold'>
                      {new Date(project.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-indigo-500' />
                  <div>
                    <span className='text-gray-500 text-sm'>Last Updated</span>
                    <p className='text-gray-800 font-semibold'>
                      {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives Section */}
            <div>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center'>
                  <Target className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Project Objectives
                </h2>
              </div>

              <div className='space-y-6'>
                {project.objectives.map((objective, index) => (
                  <div
                    key={objective.objectiveId}
                    className='bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl'
                  >
                    <div className='bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold'>
                            {index + 1}
                          </div>
                          <h3 className='text-xl font-bold'>
                            Objective #{objective.objectiveId}
                          </h3>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Flag className='w-4 h-4' />
                          <span
                            className={`text-sm font-bold px-4 py-2 rounded-full ${
                              objective.priority === 'High'
                                ? 'bg-red-500 text-white'
                                : objective.priority === 'Medium'
                                  ? 'bg-yellow-400 text-gray-800'
                                  : 'bg-green-400 text-gray-800'
                            }`}
                          >
                            {objective.priority} Priority
                          </span>
                        </div>
                      </div>
                      <p className='text-indigo-100 mt-4 leading-relaxed'>
                        {objective.description}
                      </p>
                    </div>

                    {/* Milestones */}
                    <div className='p-6 bg-gradient-to-br from-gray-50 to-slate-50'>
                      <h4 className='text-lg font-bold text-gray-700 mb-4 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                        Milestones
                      </h4>
                      <div className='space-y-4'>
                        {objective.objectiveMilestones.map((m, mIndex) => (
                          <div
                            key={m.objectiveMilestoneId}
                            className='bg-white rounded-xl p-5 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow'
                          >
                            <div className='flex items-start gap-3'>
                              <div className='w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1'>
                                <span className='text-indigo-600 font-bold text-sm'>
                                  {mIndex + 1}
                                </span>
                              </div>
                              <div className='flex-1'>
                                <h4 className='font-bold text-gray-800 text-lg mb-2'>
                                  {m.title}
                                </h4>
                                <p className='text-gray-600 leading-relaxed mb-3'>
                                  {m.description}
                                </p>
                                <div className='flex items-center gap-2 text-sm'>
                                  <Calendar className='w-4 h-4 text-indigo-500' />
                                  <span className='text-gray-500 font-medium'>
                                    {m.startDate}
                                  </span>
                                  <span className='text-gray-400'>→</span>
                                  <span className='text-gray-500 font-medium'>
                                    {m.endDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='bg-white shadow-2xl rounded-3xl p-6'>
          <div className='flex flex-col sm:flex-row justify-end gap-4'>
            <button
              onClick={() => {
                setModalType('reject');
                setModalOpen(true);
              }}
              className='flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl'
            >
              <XCircle className='w-6 h-6' />
              <span className='text-lg'>Deny Project</span>
            </button>

            <button
              onClick={() => {
                setModalType('approve');
                setModalOpen(true);
              }}
              className='flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl'
            >
              <CheckCircle className='w-6 h-6' />
              <span className='text-lg'>Approve Project</span>
            </button>
          </div>
        </div>
        {modalOpen && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative animate-fadeIn'>
              <div className='flex flex-col items-center text-center'>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    modalType === 'approve'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  <AlertTriangle className='w-8 h-8' />
                </div>
                <h2 className='text-2xl font-bold mb-2 text-gray-800'>
                  {modalType === 'approve'
                    ? 'Approve this project?'
                    : 'Reject this project?'}
                </h2>
                <p className='text-gray-600 mb-6'>
                  Are you sure you want to{' '}
                  <span
                    className={`font-semibold ${
                      modalType === 'approve'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {modalType === 'approve' ? 'approve' : 'reject'}
                  </span>{' '}
                  this project? This action cannot be undone.
                </p>

                <div className='flex gap-4 mt-2'>
                  <button
                    onClick={() => setModalOpen(false)}
                    className='px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition'
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      modalType === 'approve'
                        ? handleApproveProject
                        : handleRejectProject
                    }
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl text-white font-medium shadow-lg transition ${
                      modalType === 'approve'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProjectDetail;
