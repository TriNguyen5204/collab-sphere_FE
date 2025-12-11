import React, { useEffect, useState, useMemo } from 'react';
import {
  UserMinus,
  Trash2,
  Plus,
  Edit3,
  Search,
  Filter,
  Download,
  Upload,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getAllAccount, deactivateAccount } from '../../services/userService';
import { toast } from 'sonner';
import useToastConfirmation from '../../hooks/useToastConfirmation';
import CreateAccountForm from '../../features/admin/components/CreateAccountForm';
import ModalWrapper from '../../components/layout/ModalWrapper';
import { useAvatar } from '../../hooks/useAvatar';

export default function AccountManagement() {
  const confirmWithToast = useToastConfirmation();
  const [selectedRole, setSelectedRole] = useState('HeadDepartment');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [data, setData] = useState({
    headDepartmentList: [],
    staffList: [],
    lecturerList: [],
    studentList: [],
  });
  const [roleStats, setRoleStats] = useState({
    HeadDepartment: 0,
    Staff: 0,
    Lecturer: 0,
    Student: 0,
  });

  const fetchUsers = async () => {
    try {
      const response = await getAllAccount();
      setData({
        headDepartmentList: response.headDepartmentList || [],
        staffList: response.staffList || [],
        lecturerList: response.lecturerList || [],
        studentList: response.studentList || [],
      });
      setRoleStats({
        HeadDepartment: response.headDepartmentCount || 0,
        Staff: response.staffCount || 0,
        Lecturer: response.lecturerCount || 0,
        Student: response.studentCount || 0,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let users = [];
    switch (selectedRole) {
      case 'HeadDepartment':
        users = data.headDepartmentList;
        break;
      case 'Staff':
        users = data.staffList;
        break;
      case 'Lecturer':
        users = data.lecturerList;
        break;
      case 'Student':
        users = data.studentList;
        break;
      default:
        users = [];
    }

    if (searchQuery.trim() !== '') {
      users = users.filter(
        u =>
          u.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return users;
  }, [selectedRole, data, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const UserAvatar = ({ user }) => {
    const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(
      user.fullname || user.email,
      user.avatar
    );

    return shouldShowImage ? (
      <img
        src={user.avatar}
        alt={user.fullname || user.email}
        className='w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0 border'
        onError={() => setImageError(true)}
      />
    ) : (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm flex-shrink-0 border ${colorClass}`}>
        {initials}
      </div>
    );
  };

  // const handleToggleActive = email => {
  //   setData(prev => {
  //     const updated = { ...prev };
  //     let listKey = '';
  //     switch (selectedRole) {
  //       case 'HeadDepartment':
  //         listKey = 'headDepartmentList';
  //         break;
  //       case 'Staff':
  //         listKey = 'staffList';
  //         break;
  //       case 'Lecturer':
  //         listKey = 'lecturerList';
  //         break;
  //       case 'Student':
  //         listKey = 'studentList';
  //         break;
  //       default:
  //         return prev;
  //     }

  //     updated[listKey] = updated[listKey].map(u =>
  //       u.email === email ? { ...u, isActive: !u.isActive } : u
  //     );
  //     return updated;
  //   });
  // };

  const getActiveCount = role => {
    let list = [];
    switch (role) {
      case 'HeadDepartment':
        list = data.headDepartmentList;
        break;
      case 'Staff':
        list = data.staffList;
        break;
      case 'Lecturer':
        list = data.lecturerList;
        break;
      case 'Student':
        list = data.studentList;
        break;
      default:
        list = [];
    }
    return list.filter(u => u.isActive).length;
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getRoleDisplayName = roleName => {
    const roleMap = {
      HEAD_DEPARTMENT: 'Head Department',
      STAFF: 'Staff',
      LECTURER: 'Lecturer',
      STUDENT: 'Student',
    };
    return roleMap[roleName] || roleName;
  };

  const handleDeactivate = async user => {
    if (selectedRole === 'HeadDepartment' || selectedRole === 'Staff') {
      toast.error('This role cannot be deactivated.');
      return;
    }

    // Determine corresponding ID type
    let id = null;
    if (selectedRole === 'Lecturer') id = user.lecturerId;
    else if (selectedRole === 'Student') id = user.studentId;

    if (!id) {
      toast.error('Cannot change status: missing user ID.');
      return;
    }

    // If inactive -> ask to activate
    if (user.isActive === false) {
      const confirmed = await confirmWithToast({
        message: 'Do you want to activate this account?',
        confirmLabel: 'Activate',
        variant: 'info',
      });
      if (!confirmed) return;

      deactivateAccount(id)
        .then(() => {
          toast.success('Account activated successfully.');
          setData(prev => {
            const updated = { ...prev };
            const listKey =
              selectedRole === 'Lecturer' ? 'lecturerList' : 'studentList';
            updated[listKey] = updated[listKey].map(u =>
              (selectedRole === 'Lecturer' ? u.lecturerId : u.studentId) === id
                ? { ...u, isActive: true }
                : u
            );
            return updated;
          });
        })
        .catch(error => {
          console.error('Error activating account:', error);
          toast.error('Failed to activate account. Please try again.');
        });

      return;
    }

    // If active -> ask to deactivate
    const confirmed = await confirmWithToast({
      message: 'Are you sure you want to deactivate this account?',
      confirmLabel: 'Deactivate',
      variant: 'danger',
    });
    if (!confirmed) return;

    deactivateAccount(id)
      .then(() => {
        toast.success('Account deactivated successfully.');
        setData(prev => {
          const updated = { ...prev };
          const listKey =
            selectedRole === 'Lecturer' ? 'lecturerList' : 'studentList';
          updated[listKey] = updated[listKey].map(u =>
            (selectedRole === 'Lecturer' ? u.lecturerId : u.studentId) === id
              ? { ...u, isActive: false }
              : u
          );
          return updated;
        });
      })
      .catch(error => {
        console.error('Error deactivating account:', error);
        toast.error('Failed to deactivate account. Please try again.');
      });
  };

  return (
    <>
      <div className=' flex'>
        <aside className='fixed top-0 left-0 h-full overflow-y-auto bg-slate-50 border-r border-slate-200'>
          <AdminSidebar />
        </aside>
        <main className='flex-1 min-h-0 min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-56 custom-scrollbar'>
          <div className=' bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className=' mx-auto space-y-6'>
              
              {/* Header Section */}
              <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
                <div className="relative z-10 px-6 py-8 lg:px-10">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                        Admin Hub
                      </p>
                      <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                        Account <span className="text-orangeFpt-500 font-bold">Management</span>
                      </h1>
                      <p className="mt-1 text-sm text-slate-600">
                        Manage user accounts, permissions, and view statistics.
                      </p>
                      <div className="pt-2">
                        <button
                            className='flex items-center gap-2 px-5 py-2.5 bg-orangeFpt-500 text-white rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium'
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            <Plus className='w-4 h-4' />
                            Create User
                        </button>
                      </div>
                    </div>
                    <div className="w-full max-w-xl">
                      <div className="grid grid-cols-2 gap-3">
                        {['HeadDepartment', 'Staff', 'Lecturer', 'Student'].map(role => (
                           <div
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`rounded-2xl border px-4 py-3 shadow-sm backdrop-blur cursor-pointer transition-all duration-200
                              ${selectedRole === role 
                                ? 'border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500' 
                                : 'border-orangeFpt-100 bg-white/60 hover:border-orangeFpt-300 hover:bg-white'
                              }
                            `}
                          >
                            <div className="flex justify-between items-start">
                                <p className={`text-[11px] uppercase tracking-wide font-semibold ${selectedRole === role ? 'text-orangeFpt-700' : 'text-slate-500'}`}>
                                    {role === 'HeadDepartment' ? 'Head Dept' : role}
                                </p>
                                <Users className={`w-4 h-4 ${selectedRole === role ? 'text-orangeFpt-600' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex justify-between items-end mt-1">
                                <p className="text-xs text-slate-500">
                                    {getActiveCount(role)} active
                                </p>
                                <p className={`text-xl font-bold ${selectedRole === role ? 'text-orangeFpt-600' : 'text-slate-700'}`}>
                                    {roleStats[role]}
                                </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Table */}
              <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
                {/* Table Header */}
                <div className='p-5 bg-white border-b border-slate-100'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                      {selectedRole === 'HeadDepartment'
                        ? 'Head Department'
                        : selectedRole}{' '}
                      <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                        {filteredUsers.length} users
                      </span>
                    </h2>

                    {/* Search */}
                    <div className='relative'>
                      <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
                      <input
                        type='text'
                        placeholder='Search by name or email...'
                        className='w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all text-sm'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className='overflow-x-auto'>
                  <table className='w-full table-fixed'>
                    <colgroup>
                      <col className='w-[30%]' />
                      <col className='w-[28%]' />
                      <col className='w-[15%]' />
                      <col className='w-[12%]' />
                      <col className='w-[15%]' />
                    </colgroup>
                    <thead className='bg-slate-50/50 border-b border-slate-200'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          User Info
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Email
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Join Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {currentUsers.map(u => (
                        <tr
                          key={u.email}
                          className='hover:bg-slate-50/80 transition-colors'
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3 min-w-0'>
                              <UserAvatar user={u} />
                              <div className='min-w-0 flex-1'>
                                <p className='font-medium text-slate-800 truncate'>
                                  {u.fullname || u.email.split('@')[0]}
                                </p>
                                <p className='text-xs text-slate-500 truncate'>
                                  {getRoleDisplayName(u.roleName)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2 text-slate-600 text-sm min-w-0'>
                              <Mail className='w-3.5 h-3.5 text-slate-400 flex-shrink-0' />
                              <span className='truncate'>{u.email}</span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2 text-slate-600 text-sm whitespace-nowrap'>
                              <Calendar className='w-3.5 h-3.5 text-slate-400 flex-shrink-0' />
                              {formatDate(u.createdDate)}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            {u.isActive ? (
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 whitespace-nowrap'>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 whitespace-nowrap'>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4'>
                            {selectedRole !== 'HeadDepartment' &&
                              selectedRole !== 'Staff' && (
                                <button
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    u.isActive
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                                  }`}
                                  onClick={() => handleDeactivate(u)}
                                >
                                  {u.isActive ? (
                                    <>
                                      <Trash2 className='w-3.5 h-3.5' />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className='w-3.5 h-3.5' />
                                      Activate
                                    </>
                                  )}
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                  <div className='text-center py-16'>
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className='w-8 h-8 text-slate-300' />
                    </div>
                    <h3 className='text-lg font-semibold text-slate-700 mb-1'>
                      No users found
                    </h3>
                    <p className='text-slate-500 text-sm'>
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className='px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between'>
                    <div className='text-sm text-slate-500'>
                      Showing <span className='font-medium text-slate-700'>{startIndex + 1}</span> to{' '}
                      <span className='font-medium text-slate-700'>
                        {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                      </span>{' '}
                      of{' '}
                      <span className='font-medium text-slate-700'>
                        {filteredUsers.length}
                      </span>{' '}
                      results
                    </div>
                    <div className='flex gap-2'>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-600'
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-orangeFpt-500 text-white shadow-sm shadow-orangeFpt-200'
                                : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className='px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-600'
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <ModalWrapper
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Account"
          maxWidth='max-w-lg'
        >
          <CreateAccountForm 
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchUsers();
            }}
          />
        </ModalWrapper>
      </div>
    </>
  );
}
