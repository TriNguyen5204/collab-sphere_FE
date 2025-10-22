import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  BookMarked,
  Eye,
  Package,
  TrendingUp,
  Filter
} from 'lucide-react';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateMultipleSubjectForm from '../../components/ui/CreateMultipleSubjectForm';
import UpdateSubjectForm from '../../components/ui/UpdateSubjectForm';
import {
  getAllSubject
} from '../../services/userService';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubject();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);
  
  const handleSelectSubject = subject => {
    navigate(`/head-department/subject-management/${subject.subjectId}`)
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch =
      sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <div className='min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
        <HeadDepartmentSidebar />
        <div className='flex flex-col flex-1'>
          <div className='p-4 md:p-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
              {/* Header Section */}
              <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
                <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white'>
                  <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                        <BookOpen className='w-8 h-8 text-white' />
                      </div>
                      <div>
                        <h1 className='text-3xl md:text-4xl font-bold mb-2'>
                          Subject Management
                        </h1>
                        <p className='text-blue-100 text-sm md:text-base'>
                          Manage course catalog, syllabus, and learning outcomes
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className='flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105'
                    >
                      <Plus className='w-5 h-5' />
                      Add Subject
                    </button>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className='p-8'>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                          <BookOpen className='w-6 h-6 text-white' />
                        </div>
                        <TrendingUp className='w-5 h-5 text-white/60' />
                      </div>
                      <p className='text-blue-100 text-sm font-medium mb-1'>
                        Total Subjects
                      </p>
                      <p className='text-4xl font-bold'>
                        {subjects.length}
                      </p>
                    </div>

                    <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                          <Package className='w-6 h-6 text-white' />
                        </div>
                        <TrendingUp className='w-5 h-5 text-white/60' />
                      </div>
                      <p className='text-purple-100 text-sm font-medium mb-1'>
                        Active Courses
                      </p>
                      <p className='text-4xl font-bold'>
                        {subjects.filter(s => s.isActive).length}
                      </p>
                    </div>

                    <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                          <BookMarked className='w-6 h-6 text-white' />
                        </div>
                        <TrendingUp className='w-5 h-5 text-white/60' />
                      </div>
                      <p className='text-green-100 text-sm font-medium mb-1'>
                        Categories
                      </p>
                      <p className='text-4xl font-bold'>
                        {new Set(subjects.map(s => s.subjectCode.substring(0, 3))).size}
                      </p>
                    </div>

                    <div className='bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                          <Filter className='w-6 h-6 text-white' />
                        </div>
                        <TrendingUp className='w-5 h-5 text-white/60' />
                      </div>
                      <p className='text-orange-100 text-sm font-medium mb-1'>
                        Filtered Results
                      </p>
                      <p className='text-4xl font-bold'>
                        {filteredSubjects.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Catalog */}
              <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
                <div className='bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'>
                      <BookMarked className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold'>
                        Subject Catalog
                      </h2>
                      <p className='text-indigo-100 text-sm'>
                        {filteredSubjects.length} subjects available
                      </p>
                    </div>
                  </div>
                  
                  <div className='relative'>
                    <Search className='w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60' />
                    <input
                      type='text'
                      placeholder='Search by subject name or code...'
                      className='w-full pl-12 pr-4 py-4 text-white placeholder-white/60 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className='p-8'>
                  {filteredSubjects.length === 0 ? (
                    <div className='text-center py-16'>
                      <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Search className='w-10 h-10 text-gray-400' />
                      </div>
                      <h3 className='text-xl font-bold text-gray-800 mb-2'>No subjects found</h3>
                      <p className='text-gray-500'>Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                      {filteredSubjects.map(sub => (
                        <div
                          key={sub.id}
                          className={`group relative bg-gradient-to-br from-white to-gray-50 border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-2xl ${
                            selectedSubject?.subjectId === sub.subjectId
                              ? 'border-blue-500 shadow-xl scale-105'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {/* Decorative corner */}
                          <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-[3rem] rounded-tr-2xl'></div>
                          
                          <div className='relative'>
                            <div className='flex items-start gap-3 mb-4'>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                selectedSubject?.subjectId === sub.subjectId
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                  : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                              }`}>
                                <BookOpen className={`w-6 h-6 ${
                                  selectedSubject?.subjectId === sub.subjectId
                                    ? 'text-white'
                                    : 'text-blue-600'
                                }`} />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <h3 className='font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight'>
                                  {sub.subjectName}
                                </h3>
                                <span className='inline-block px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-mono text-sm font-bold shadow-md'>
                                  {sub.subjectCode}
                                </span>
                              </div>
                            </div>

                            {/* Status indicator */}
                            <div className='mb-4'>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                sub.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  sub.isActive ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                                {sub.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {/* Action buttons */}
                            <div className='flex gap-2 pt-4 border-t border-gray-200'>
                              <button 
                                onClick={() => handleSelectSubject(sub)}
                                className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105'
                              >
                                <Eye className='w-4 h-4' />
                                View
                              </button>
                              <button 
                                className='flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <ModalWrapper
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title='Add Multiple Subjects'
            >
              <CreateMultipleSubjectForm
                onClose={() => setIsModalOpen(false)}
              />
            </ModalWrapper>
            <ModalWrapper
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
            >
              <UpdateSubjectForm
                subject={selectedSubject}
                onClose={() => setIsUpdateModalOpen(false)}
              />
            </ModalWrapper>
          </div>
        </div>
      </div>
    </>
  );
}