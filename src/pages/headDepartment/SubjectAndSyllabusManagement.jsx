import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  BookMarked,
  Eye
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
      <div className='min-h-screen flex'>
        <HeadDepartmentSidebar />
        <div className='flex flex-col flex-1'>
          <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <BookOpen className='w-8 h-8 text-blue-600' />
                    Subject Management
                  </h1>
                  <p className='text-gray-500 mt-1'>
                    Manage course catalog, syllabus, and learning outcomes
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'>
                    <Upload className='w-4 h-4' />
                    Import
                  </button>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'>
                    <Download className='w-4 h-4' />
                    Export
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md'
                  >
                    <Plus className='w-4 h-4' />
                    Add Subject
                  </button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='p-3 rounded-lg bg-blue-100'>
                      <BookOpen className='w-6 h-6 text-blue-600' />
                    </div>
                  </div>
                  <h3 className='text-gray-600 text-sm font-medium mb-1'>
                    Total Subjects
                  </h3>
                  <p className='text-3xl font-bold text-gray-800'>
                    {subjects.length}
                  </p>
                </div>
              </div>

              {/* Subject Catalog */}
              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <div className='p-6 bg-gradient-to-r from-blue-50 to-white border-b'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                      <BookMarked className='w-6 h-6 text-blue-600' />
                      Subject Catalog
                      <span className='ml-2 text-sm font-normal text-gray-500'>
                        ({filteredSubjects.length} subjects)
                      </span>
                    </h2>
                  </div>
                  <div className='flex gap-3'>
                    <div className='flex-1 relative'>
                      <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search by subject name or code...'
                        className='w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className='p-6'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {filteredSubjects.map(sub => (
                      <div
                        key={sub.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedSubject?.subjectId === sub.subjectId
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-gray-800 text-lg mb-1'>
                              {sub.subjectName}
                            </h3>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium'>
                                {sub.subjectCode}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-2 mt-3 pt-3 border-t'>
                          <button 
                          onClick={() => handleSelectSubject(sub)}
                          className='flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'>
                            <Eye className='w-3 h-3' />
                            View
                          </button>
                          <button 
                          
                          className='flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors'>
                            <Trash2 className='w-3 h-3' />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
