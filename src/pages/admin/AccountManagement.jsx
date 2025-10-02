import React, { useState } from 'react';
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

export default function AccountManagement() {
  const [selectedRole, setSelectedRole] = useState('HeadDepartment');
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: '',
    email: '',
    role: 'HeadDepartment',
  });

  // Mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      fullname: 'Nguyễn Văn A',
      email: 'nguyenvana@edu.vn',
      role: 'HeadDepartment',
      active: true,
      joinDate: '15/01/2024',
    },
    {
      id: 2,
      fullname: 'Trần Thị B',
      email: 'tranthib@edu.vn',
      role: 'HeadDepartment',
      active: true,
      joinDate: '20/02/2024',
    },
    {
      id: 3,
      fullname: 'Lê Văn C',
      email: 'levanc@edu.vn',
      role: 'Staff',
      active: false,
      joinDate: '10/03/2024',
    },
    {
      id: 4,
      fullname: 'Phạm Thị D',
      email: 'phamthid@edu.vn',
      role: 'Staff',
      active: true,
      joinDate: '05/04/2024',
    },
    {
      id: 5,
      fullname: 'Hoàng Văn E',
      email: 'hoangvane@edu.vn',
      role: 'Lecturer',
      active: true,
      joinDate: '12/05/2024',
    },
    {
      id: 6,
      fullname: 'Võ Thị F',
      email: 'vothif@edu.vn',
      role: 'Student',
      active: true,
      joinDate: '18/06/2024',
    },
  ]);

  const filteredUsers = users.filter(
    u =>
      u.role === selectedRole &&
      (u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleActive = id => {
    setUsers(users.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handleBulkDeactivate = () => {
    setUsers(
      users.map(u => (selectedIds.includes(u.id) ? { ...u, active: false } : u))
    );
    setSelectedIds([]);
  };

  const handleCreateUser = () => {
    if (newUser.fullname && newUser.email) {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      setUsers([
        ...users,
        {
          id: newId,
          ...newUser,
          active: true,
          joinDate: new Date().toLocaleDateString('vi-VN'),
        },
      ]);
      setNewUser({ fullname: '', email: '', role: 'HeadDepartment' });
      setShowCreateForm(false);
    }
  };

  const roleStats = {
    HeadDepartment: users.filter(u => u.role === 'HeadDepartment').length,
    Staff: users.filter(u => u.role === 'Staff').length,
    Lecturer: users.filter(u => u.role === 'Lecturer').length,
    Student: users.filter(u => u.role === 'Student').length,
  };

  return (
    <>
      <div className='min-h-screen flex'>
        <AdminSidebar />
        <div className='flex flex-col flex-1'>
          <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <Users className='w-8 h-8 text-blue-600' />
                    Account Management
                  </h1>
                  <p className='text-gray-500 mt-1'>
                    Manage user accounts and permissions
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'>
                    <Download className='w-4 h-4' />
                    Export
                  </button>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'>
                    <Upload className='w-4 h-4' />
                    Import
                  </button>
                  <button
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md'
                    onClick={() => setShowCreateForm(!showCreateForm)}
                  >
                    <Plus className='w-4 h-4' />
                    Create Account
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {['HeadDepartment', 'Staff', 'Lecturer', 'Student'].map(
                  role => (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`bg-white rounded-lg p-4 cursor-pointer transition-all shadow-md hover:shadow-lg ${
                        selectedRole === role
                          ? 'ring-2 ring-blue-600 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='text-sm font-medium text-gray-600'>
                          {role}
                        </h3>
                        <Users
                          className={`w-5 h-5 ${selectedRole === role ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                      </div>
                      <p className='text-2xl font-bold text-gray-800'>
                        {roleStats[role]}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {users.filter(u => u.role === role && u.active).length}{' '}
                        active
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Create User Form - Collapsible */}
              {showCreateForm && (
                <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                      <Plus className='w-5 h-5 text-blue-600' />
                      Create New Account
                    </h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      <XCircle className='w-5 h-5' />
                    </button>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Full Name
                      </label>
                      <input
                        type='text'
                        placeholder='Enter full name'
                        className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={newUser.fullname}
                        onChange={e =>
                          setNewUser({ ...newUser, fullname: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        placeholder='Enter email address'
                        className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={newUser.email}
                        onChange={e =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Role
                      </label>
                      <select
                        className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={newUser.role}
                        onChange={e =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                      >
                        <option value='HeadDepartment'>Head Department</option>
                        <option value='Staff'>Staff</option>
                        <option value='Lecturer'>Lecturer</option>
                        <option value='Student'>Student</option>
                      </select>
                    </div>
                  </div>
                  <div className='flex justify-end gap-3 mt-4'>
                    <button
                      className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                      onClick={handleCreateUser}
                    >
                      <CheckCircle className='w-4 h-4' />
                      Create Account
                    </button>
                  </div>
                </div>
              )}

              {/* User Table */}
              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                {/* Table Header */}
                <div className='p-4 bg-gradient-to-r from-blue-50 to-white border-b'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800'>
                      {selectedRole} Accounts
                      <span className='ml-2 text-sm font-normal text-gray-500'>
                        ({filteredUsers.length} users)
                      </span>
                    </h2>
                    {selectedIds.length > 0 && (
                      <button
                        className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md'
                        onClick={handleBulkDeactivate}
                      >
                        <UserMinus className='w-4 h-4' />
                        Deactivate Selected ({selectedIds.length})
                      </button>
                    )}
                  </div>

                  {/* Search and Filter */}
                  <div className='flex gap-3'>
                    <div className='flex-1 relative'>
                      <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search by name or email...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                      <Filter className='w-4 h-4' />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50 border-b-2 border-gray-200'>
                      <tr>
                        <th className='px-6 py-3 text-left'>
                          <input
                            type='checkbox'
                            className='w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500'
                            checked={
                              selectedIds.length === filteredUsers.length &&
                              filteredUsers.length > 0
                            }
                            onChange={e =>
                              setSelectedIds(
                                e.target.checked
                                  ? filteredUsers.map(u => u.id)
                                  : []
                              )
                            }
                          />
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          User Info
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          Email
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          Join Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {filteredUsers.map(u => (
                        <tr
                          key={u.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4'>
                            <input
                              type='checkbox'
                              className='w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500'
                              checked={selectedIds.includes(u.id)}
                              onChange={e =>
                                setSelectedIds(prev =>
                                  e.target.checked
                                    ? [...prev, u.id]
                                    : prev.filter(id => id !== u.id)
                                )
                              }
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold'>
                                {u.fullname.charAt(0)}
                              </div>
                              <div>
                                <p className='font-medium text-gray-800'>
                                  {u.fullname}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  {u.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2 text-gray-600'>
                              <Mail className='w-4 h-4 text-gray-400' />
                              {u.email}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2 text-gray-600'>
                              <Calendar className='w-4 h-4 text-gray-400' />
                              {u.joinDate}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            {u.active ? (
                              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'>
                                <CheckCircle className='w-3 h-3' />
                                Active
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800'>
                                <XCircle className='w-3 h-3' />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex gap-2'>
                              <button
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  u.active
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                                onClick={() => handleToggleActive(u.id)}
                              >
                                {u.active ? (
                                  <>
                                    <Trash2 className='w-4 h-4' />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className='w-4 h-4' />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button className='flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors'>
                                <Edit3 className='w-4 h-4' />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                  <div className='text-center py-12'>
                    <Users className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-600 mb-2'>
                      No users found
                    </h3>
                    <p className='text-gray-500'>
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className='px-6 py-4 bg-gray-50 border-t flex items-center justify-between'>
                    <div className='text-sm text-gray-600'>
                      Showing <span className='font-medium'>1</span> to{' '}
                      <span className='font-medium'>
                        {filteredUsers.length}
                      </span>{' '}
                      of{' '}
                      <span className='font-medium'>
                        {filteredUsers.length}
                      </span>{' '}
                      results
                    </div>
                    <div className='flex gap-2'>
                      <button className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                        Previous
                      </button>
                      <button className='px-3 py-1 bg-blue-600 text-white rounded-lg'>
                        1
                      </button>
                      <button className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                        2
                      </button>
                      <button className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                        3
                      </button>
                      <button className='px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
