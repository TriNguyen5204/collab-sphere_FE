import { useState } from 'react';
import { Plus, Users, BookOpen, Calendar, Search, Filter, Grid3X3, List, Eye, Edit3, Trash2, MoreVertical, Clock, Award, TrendingUp } from 'lucide-react';
import CreateClassForm from '../../components/ui/CreateClassForm';
import ModalWrapper from '../../components/layout/ModalWrapper';

export default function ImprovedClassList() {
  const [classes, setClasses] = useState([
    { 
      id: 1, 
      name: "Advanced Programming", 
      student: 30, 
      subject: "PRN222",
      instructor: "Dr. Sarah Johnson",
      schedule: "Mon, Wed 8:00 AM",
      status: "active",
      progress: 75,
      color: "from-blue-500 to-indigo-600"
    },
    { 
      id: 2, 
      name: "Database Systems", 
      student: 25, 
      subject: "DBI202",
      instructor: "Prof. Michael Chen",
      schedule: "Tue, Thu 10:00 AM",
      status: "active",
      progress: 60,
      color: "from-green-500 to-emerald-600"
    },
    { 
      id: 3, 
      name: "Programming Fundamentals", 
      student: 40, 
      subject: "PRN211",
      instructor: "Dr. Emily Rodriguez",
      schedule: "Mon, Wed, Fri 2:00 PM",
      status: "active",
      progress: 85,
      color: "from-purple-500 to-violet-600"
    },
    { 
      id: 4, 
      name: "Operating Systems", 
      student: 35, 
      subject: "OSG202",
      instructor: "Prof. David Kim",
      schedule: "Tue, Thu 1:00 PM",
      status: "completed",
      progress: 100,
      color: "from-orange-500 to-red-600"
    },
    { 
      id: 5, 
      name: "Mobile App Development", 
      student: 20, 
      subject: "MAD101",
      instructor: "Dr. Lisa Wang",
      schedule: "Wed, Fri 3:00 PM",
      status: "pending",
      progress: 0,
      color: "from-pink-500 to-rose-600"
    },
    { 
      id: 6, 
      name: "Computer Architecture", 
      student: 28, 
      subject: "CEA201",
      instructor: "Prof. James Wilson",
      schedule: "Mon, Wed 11:00 AM",
      status: "active",
      progress: 45,
      color: "from-cyan-500 to-blue-600"
    },
  ]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
    };
    const config = statusConfig[status];
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStudents = classes.reduce((sum, cls) => sum + cls.student, 0);
  const activeClasses = classes.filter(cls => cls.status === 'active').length;
  const avgProgress = Math.round(classes.reduce((sum, cls) => sum + cls.progress, 0) / classes.length);

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setClasses(classes.filter(cls => cls.id !== classToDelete.id));
      setIsDeleting(false);
      setShowDeleteModal(false);
      setClassToDelete(null);
    }, 1500);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Management</h1>
              <p className="text-gray-600">Manage your classes and monitor student progress</p>
            </div>
            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Class
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{activeClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Classes Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                {/* Card Header */}
                <div className={`h-2 bg-gradient-to-r ${cls.color}`}></div>
                
                <div className="p-6">
                  {/* Top Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-500">{cls.subject}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(cls.status)}
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(cls);
                              }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{cls.student} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{cls.schedule}</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {cls.instructor}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{cls.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${cls.color} transition-all duration-300`}
                        style={{ width: `${cls.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{cls.name}</div>
                          <div className="text-sm text-gray-600">{cls.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{cls.student}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.instructor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cls.schedule}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${cls.color}`}
                              style={{ width: `${cls.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[35px]">
                            {cls.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(cls.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  onClick={() => handleDeleteClick(cls)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Create your first class
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Class</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${classToDelete.color} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{classToDelete.name}</h4>
                  <p className="text-gray-600 mb-4">Subject: {classToDelete.subject}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 font-bold text-sm">!</span>
                    </div>
                    <div className="text-left">
                      <h5 className="font-semibold text-red-900 mb-1">Warning</h5>
                      <p className="text-red-700 text-sm leading-relaxed">
                        Deleting this class will permanently remove:
                      </p>
                      <ul className="text-red-700 text-sm mt-2 space-y-1">
                        <li>• All class data and settings</li>
                        <li>• Student enrollment records ({classToDelete.student} students)</li>
                        <li>• Assignment and grade history</li>
                        <li>• Class progress and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">
                  Are you absolutely sure you want to delete <strong>"{classToDelete.name}"</strong>?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isDeleting
                      ? 'bg-red-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Class
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Create New Class'
      >
        <CreateClassForm onClose={() => setIsOpen(false)} />
      </ModalWrapper>
    </div>
  );
}