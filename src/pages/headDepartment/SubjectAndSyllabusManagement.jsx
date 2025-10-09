import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Award,
  Target,
  PieChart,
  Download,
  Upload,
  BookMarked,
} from 'lucide-react';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateMultipleSubjectForm from '../../components/ui/CreateMultipleSubjectForm';
import UpdateSubjectForm from '../../components/ui/UpdateSubjectForm';
import {
  getAllSubject,
  getSyllabusBySubjectId,
} from '../../services/userService';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [subjects, setSubjects] = useState([]);

  const [syllabus, setSyllabus] = useState([]);

  const [outcomes, setOutcomes] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);

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
    setSelectedSubject(subject);
  };
  const handleUpdateSubject = updatedSubject => {
    setSelectedSubject(updatedSubject);
    setIsUpdateModalOpen(true);
  }


  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!selectedSubject) return;

      try {
        const data = await getSyllabusBySubjectId(selectedSubject.subjectId);
        if (data?.subjectSyllabus) {
          const syllabusData = {
            subjectId: selectedSubject.subjectId,
            description: data.subjectSyllabus.description,
            credits: data.subjectSyllabus.noCredit,
            topics: [data.subjectSyllabus.syllabusName], // bạn có thể tuỳ chỉnh thêm
          };

          const outcomeData = {
            subjectId: selectedSubject.subjectId,
            outcomes: data.subjectSyllabus.subjectOutcomes.map(
              o => o.outcomeDetail
            ),
            gradeComponents: data.subjectSyllabus.subjectGradeComponents.map(
              g => ({
                name: g.componentName,
                weight: g.referencePercentage,
              })
            ),
          };

          setSyllabus(prev => {
            const exists = prev.find(
              s => s.subjectId === selectedSubject.subjectId
            );
            if (exists) {
              return prev.map(s =>
                s.subjectId === selectedSubject.subjectId ? syllabusData : s
              );
            }
            return [...prev, syllabusData];
          });

          setOutcomes(prev => {
            const exists = prev.find(
              o => o.subjectId === selectedSubject.subjectId
            );
            if (exists) {
              return prev.map(o =>
                o.subjectId === selectedSubject.subjectId ? outcomeData : o
              );
            }
            return [...prev, outcomeData];
          });
        }
      } catch (error) {
        console.error('Error fetching syllabus for subject:', error);
      }
    };

    fetchSyllabus();
  }, [selectedSubject]);

  // const handleDeleteSubject = subjectId => {
  //   const confirmed = window.confirm(
  //     'Are you sure you want to delete this subject? This action cannot be undone.'
  //   );
  //   if (confirmed) {
  //     const response = await 
  //     setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));
  //     if (selectedSubject?.subjectId === subjectId) {
  //       setSelectedSubject(null);
  //     }
      
  // }

  const getSyllabus = subjectId =>
    syllabus.find(s => s.subjectId === subjectId);
  const getOutcome = subjectId => outcomes.find(o => o.subjectId === subjectId);

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
                        onClick={() => handleSelectSubject(sub)}
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
                          onClick={() => handleUpdateSubject(sub)}
                          className='flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'>
                            <Edit className='w-3 h-3' />
                            Edit
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

              {/* Subject Details - Only show when subject is selected */}
              {selectedSubject && (
                <div className='grid lg:grid-cols-2 gap-6'>
                  {/* Syllabus Browser */}
                  <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                    <div className='p-6 bg-gradient-to-r from-green-50 to-white border-b'>
                      <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                        <FileText className='w-6 h-6 text-green-600' />
                        Syllabus Browser
                      </h2>
                    </div>
                    <div className='p-6 space-y-6'>
                      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-3'>
                          {getSyllabus(selectedSubject.subjectId)?.topics[0]}
                        </h2>
                        <h3 className='text-xs font-bold text-gray-600 uppercase tracking-wider mb-3'>
                          Description
                        </h3>
                        <p className='text-gray-700 leading-relaxed'>
                          {getSyllabus(selectedSubject.subjectId)?.description}
                        </p>
                      </div>

                      <div className='bg-white rounded-lg p-5 border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-xs font-bold text-gray-600 uppercase tracking-wider'>
                            Course credits
                          </h3>
                          <span className='text-sm bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm'>
                            {getSyllabus(selectedSubject.subjectId)?.credits}{' '}
                            credits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outcomes & Grade Components */}
                  <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                    <div className='p-6 bg-gradient-to-r from-purple-50 to-white border-b'>
                      <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                        <Target className='w-6 h-6 text-purple-600' />
                        Learning Outcomes & Grading
                      </h2>
                    </div>
                    <div className='p-6 space-y-6'>
                      {/* Learning Outcomes */}
                      <div>
                        <h3 className='text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2'>
                          <Award className='w-4 h-4' />
                          Learning Outcomes
                        </h3>
                        <div className='space-y-2'>
                          {getOutcome(selectedSubject.subjectId)?.outcomes.map(
                            (o, i) => (
                              <div
                                key={i}
                                className='flex items-start gap-3 p-3 bg-purple-50 rounded-lg'
                              >
                                <div className='flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold'>
                                  ✓
                                </div>
                                <span className='text-gray-700'>{o}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Grade Components */}
                      <div>
                        <h3 className='text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2'>
                          <PieChart className='w-4 h-4' />
                          Grade Components
                        </h3>
                        <div className='space-y-3'>
                          {getOutcome(
                            selectedSubject.subjectId
                          )?.gradeComponents.map((g, i) => (
                            <div key={i} className='relative'>
                              <div className='flex justify-between items-center mb-2'>
                                <span className='text-sm font-medium text-gray-700'>
                                  {g.name}
                                </span>
                                <span className='text-sm font-bold text-gray-800'>
                                  {g.weight}%
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                                <div
                                  className='bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all'
                                  style={{ width: `${g.weight}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center'>
                            <span className='text-sm font-semibold text-gray-700'>
                              Total Weight
                            </span>
                            <span className='text-lg font-bold text-purple-600'>
                              {getOutcome(
                                selectedSubject.subjectId
                              )?.gradeComponents.reduce(
                                (sum, g) => sum + g.weight,
                                0
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!selectedSubject && (
                <div className='bg-white rounded-lg shadow-md p-12 text-center'>
                  <BookOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-600 mb-2'>
                    No Subject Selected
                  </h3>
                  <p className='text-gray-500'>
                    Select a subject from the catalog to view details
                  </p>
                </div>
              )}
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
