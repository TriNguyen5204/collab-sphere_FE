import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Edit3,
  ArrowLeft,
  Shield,
  Code,
  Building2,
  Globe,
  Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';
import ModalWrapper from '../../components/layout/ModalWrapper';
import EditAccountForm from '../../features/staff/components/EditAccountForm';
import { getUserProfile } from '../../services/userService';

export default function AccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [accountType, setAccountType] = useState('');

  useEffect(() => {
    const fetchAccountDetail = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile(accountId);
        if (response) {
          setAccountData(response.user);
          // Determine account type based on available fields
          setAccountType(response.user.roleName ? 'LECTURER' : 'STUDENT');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };
    fetchAccountDetail();
  }, [accountId]);

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className='flex justify-center items-center h-[70vh]'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto'></div>
            <p className='text-gray-600 font-medium text-lg'>Loading account details...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (error || !accountData) {
    return (
      <StaffDashboardLayout>
        <div className='flex justify-center items-center h-[70vh]'>
          <div className='text-center space-y-4'>
            <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto'>
              <svg className='w-10 h-10 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <p className='text-red-600 font-semibold text-xl'>{error || 'Account not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className='px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40'>
        {/* Header Section */}
        <div className='relative overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5'></div>
          <div className='absolute inset-0 opacity-30' style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`
          }}></div>

          <div className='relative px-6 py-8 sm:px-8'>
            <div className='max-w-6xl mx-auto'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group'
                >
                  <ArrowLeft size={20} className='group-hover:-translate-x-1 transition-transform' />
                  <span className='font-medium'>Back to Accounts</span>
                </button>

                {/* Profile Header */}
                <div className='flex flex-col lg:flex-row items-start gap-8'>
                  {/* Avatar Section */}
                  <div className='flex-shrink-0'>
                    <div className='relative'>
                      <div className='w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl shadow-blue-500/20'>
                        <img
                          src={accountData.avatarImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(accountData.fullname)}&background=4f46e5&color=fff&size=256&bold=true`}
                          alt={accountData.fullname}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(accountData.fullname)}&background=4f46e5&color=fff&size=256&bold=true`;
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className='flex-1 space-y-4'>
                    <div>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          accountType === 'LECTURER' 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}>
                          {accountType === 'LECTURER' ? (
                            <User className='text-white' size={24} />
                          ) : (
                            <GraduationCap className='text-white' size={24} />
                          )}
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            accountType === 'lecturer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {accountType === 'LECTURER' ? 'Lecturer' : 'Student'}
                          </span>
                        </div>
                      </div>
                      <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                        {accountData.fullname}
                      </h1>
                      <div className='flex flex-wrap items-center gap-3'>
                        {accountData.major && (
                          <div className='flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm'>
                            <Building2 size={16} className='text-indigo-600' />
                            <span className='text-sm font-medium text-gray-700'>{accountData.major}</span>
                          </div>
                        )}
                        {accountData.yob && (
                          <div className='flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm'>
                            <Calendar size={16} className='text-purple-600' />
                            <span className='text-sm font-medium text-gray-700'>Born {accountData.yob}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditOpen(true)}
                      className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200'
                    >
                      <Edit3 size={18} />
                      Edit Account
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-6xl mx-auto px-6 sm:px-8 py-8 space-y-6'>
          {/* Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 overflow-hidden'
          >
            <div className='px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                  <Mail size={20} className='text-white' />
                </div>
                <h2 className='text-xl font-bold text-gray-900'>Contact Information</h2>
              </div>
            </div>

            <div className='p-6 grid sm:grid-cols-2 gap-6'>
              {/* Email */}
              <div className='group'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors'>
                    <Mail size={18} className='text-blue-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-500 font-medium mb-1'>Email Address</p>
                    <p className='text-base text-gray-900 font-semibold break-all'>{accountData.email}</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              {accountData.phoneNumber && (
                <div className='group'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors'>
                      <Phone size={18} className='text-emerald-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Phone Number</p>
                      <p className='text-base text-gray-900 font-semibold'>{accountData.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {accountData.address && (
                <div className='group sm:col-span-2'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors'>
                      <MapPin size={18} className='text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Address</p>
                      <p className='text-base text-gray-900 font-semibold'>{accountData.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Website/Link */}
              {accountData.link && (
                <div className='group sm:col-span-2'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'>
                      <Globe size={18} className='text-indigo-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Website / Link</p>
                      <a 
                        href={accountData.link} 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='text-base text-blue-600 font-semibold hover:text-blue-700 hover:underline break-all'
                      >
                        {accountData.link}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Academic Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 overflow-hidden'
          >
            <div className='px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center'>
                  <BookOpen size={20} className='text-white' />
                </div>
                <h2 className='text-xl font-bold text-gray-900'>Academic Information</h2>
              </div>
            </div>

            <div className='p-6 grid sm:grid-cols-2 gap-6'>
              {/* Major */}
              {accountData.major && (
                <div className='group'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors'>
                      <Award size={18} className='text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Major / Department</p>
                      <p className='text-base text-gray-900 font-semibold'>{accountData.major}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Year of Birth */}
              {accountData.yob && (
                <div className='group'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors'>
                      <Calendar size={18} className='text-pink-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Year of Birth</p>
                      <p className='text-base text-gray-900 font-semibold'>{accountData.yob}</p>
                      <p className='text-xs text-gray-500 mt-1'>Age: {new Date().getFullYear() - accountData.yob} years</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role */}
              <div className='group'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors'>
                    <Shield size={18} className='text-blue-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-500 font-medium mb-1'>Account Type</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-base text-gray-900 font-semibold capitalize'>{accountType}</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        accountData.isActive
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {accountData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Metadata Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 overflow-hidden'
          >
            <div className='px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-slate-50/50 to-gray-50/50'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center'>
                  <Clock size={20} className='text-white' />
                </div>
                <h2 className='text-xl font-bold text-gray-900'>Account Metadata</h2>
              </div>
            </div>

            <div className='p-6 grid sm:grid-cols-3 gap-6'>
              {/* Account ID */}
              <div className='group'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors'>
                    <Hash size={18} className='text-slate-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-500 font-medium mb-1'>Account ID</p>
                    <p className='text-sm text-gray-900 font-mono font-semibold break-all'>{accountData.uId}</p>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              {accountData.createdDate && (
                <div className='group'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors'>
                      <Calendar size={18} className='text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Created Date</p>
                      <p className='text-sm text-gray-900 font-semibold'>
                        {new Date(accountData.createdDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {new Date(accountData.createdDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {accountData.updatedDate && (
                <div className='group'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors'>
                      <Clock size={18} className='text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 font-medium mb-1'>Last Updated</p>
                      <p className='text-sm text-gray-900 font-semibold'>
                        {new Date(accountData.updatedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {new Date(accountData.updatedDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Additional Information (if any custom fields exist) */}
          {accountData.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 p-6'
            >
              <h3 className='text-lg font-bold text-gray-900 mb-3 flex items-center gap-2'>
                <BookOpen size={20} className='text-gray-600' />
                Additional Information
              </h3>
              <p className='text-gray-700 leading-relaxed'>{accountData.description}</p>
            </motion.div>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          <ModalWrapper
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            title='Edit Account'
          >
            <EditAccountForm
              id={accountData.uId}
              onClose={() => {
                setIsEditOpen(false);
                // Refresh data after edit
                window.location.reload();
              }}
            />
          </ModalWrapper>
        </AnimatePresence>
      </div>
    </StaffDashboardLayout>
  );
}