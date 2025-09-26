import { useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  MoreVertical,
  Eye,
} from 'lucide-react';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateLecturerForm from './CreateLecturerForm';

export default function ImprovedAccountsTable() {
  const [selectedAccounts, setSelectedAccounts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const lecturers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: 'Professor',
      department: 'Computer Science',
      status: 'active',
      avatar: 'https://i.pravatar.cc/40?img=2',
      date: '2024-01-15',
      lastLogin: '2 hours ago',
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      email: 'm.chen@university.edu',
      role: 'Associate Professor',
      department: 'Mathematics',
      status: 'inactive',
      avatar: 'https://i.pravatar.cc/40?img=3',
      date: '2024-01-12',
      lastLogin: '3 days ago',
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      email: 'e.rodriguez@university.edu',
      role: 'Assistant Professor',
      department: 'Physics',
      status: 'active',
      avatar: 'https://i.pravatar.cc/40?img=4',
      date: '2024-01-10',
      lastLogin: '1 hour ago',
    },
    {
      id: 4,
      name: 'Prof. David Kim',
      email: 'd.kim@university.edu',
      role: 'Professor',
      department: 'Engineering',
      status: 'pending',
      avatar: 'https://i.pravatar.cc/40?img=5',
      date: '2024-01-08',
      lastLogin: 'Never',
    },
  ];

  const handleSelectAll = () => {
    if (selectedAccounts.size === lecturers.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(lecturers.map(lec => lec.id)));
    }
  };

  const handleSelectAccount = id => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAccounts(newSelected);
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        dot: 'bg-green-500',
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        dot: 'bg-gray-500',
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
      },
    };
    const config = statusConfig[status];

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const filteredLecturers = lecturers.filter(
    lecturer =>
      lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Account Management
          </h1>
          <p className='text-gray-600'>Manage user accounts and permissions</p>
        </div>

        {/* Controls Bar */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            {/* Left side - Search and Filters */}
            <div className='flex items-center gap-4 flex-1'>
              <div className='relative flex-1 max-w-md'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search accounts...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Filter className='w-4 h-4' />
                Filters
              </button>
            </div>

            {/* Right side - Actions */}
            <div className='flex items-center gap-3'>
              {selectedAccounts.size > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>
                    {selectedAccounts.size} selected
                  </span>
                  <button className='px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors'>
                    Delete Selected
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsOpen(true)}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-all hover:shadow-md'
              >
                <Plus className='w-4 h-4' />
                Create Account
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'>
                  <option>All Departments</option>
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Engineering</option>
                </select>
                <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'>
                  <option>All Roles</option>
                  <option>Professor</option>
                  <option>Associate Professor</option>
                  <option>Assistant Professor</option>
                </select>
                <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'>
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
                <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left'>
                    <input
                      type='checkbox'
                      checked={selectedAccounts.size === lecturers.length}
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Account
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Role & Department
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Last Login
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredLecturers.map(lecturer => (
                  <tr
                    key={lecturer.id}
                    className='hover:bg-gray-50 transition-colors group'
                  >
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedAccounts.has(lecturer.id)}
                        onChange={() => handleSelectAccount(lecturer.id)}
                        className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                      />
                    </td>

                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <div className='relative'>
                          <img
                            src={lecturer.avatar}
                            alt={lecturer.name}
                            className='w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm'
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              lecturer.status === 'active'
                                ? 'bg-green-500'
                                : lecturer.status === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                            }`}
                          ></div>
                        </div>
                        <div>
                          <div className='font-semibold text-gray-900'>
                            {lecturer.name}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {lecturer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      <div className='text-sm'>
                        <div className='font-medium text-gray-900'>
                          {lecturer.role}
                        </div>
                        <div className='text-gray-600'>
                          {lecturer.department}
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      {getStatusBadge(lecturer.status)}
                    </td>

                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {lecturer.lastLogin}
                    </td>

                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-600'>
                        <div>{lecturer.date}</div>
                      </div>
                    </td>

                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'>
                          <Eye className='w-4 h-4' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all'>
                          <Edit3 className='w-4 h-4' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all'>
                          <MoreVertical className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Showing {filteredLecturers.length} of {lecturers.length}{' '}
                accounts
              </div>
              <div className='flex items-center gap-2'>
                <button className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors'>
                  Previous
                </button>
                <button className='px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                  1
                </button>
                <button className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors'>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Create New Lecturer'
      >
        <CreateLecturerForm onClose={() => setIsOpen(false)} />
      </ModalWrapper>
    </div>
  );
}
