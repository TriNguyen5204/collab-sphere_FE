import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Calendar, Search, AlertTriangle } from 'lucide-react';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';
import ModalWrapper from '../../components/layout/ModalWrapper';
import { getSemester, deleteSemester } from '../../services/userService';

// Components
import SemesterList from '../../features/head-department/components/SemesterList';
import SemesterForm from '../../features/head-department/components/SemesterForm';
import Pagination from '../../features/head-department/components/Pagination'; // Imported Pagination

const ITEMS_PER_PAGE = 5;

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const data = await getSemester();
      setSemesters(Array.isArray(data) ? data : data.list || []);
    } catch (error) {
      toast.error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSemester(null);
    setIsModalOpen(true);
  };

  const handleEdit = (semester) => {
    setSelectedSemester(semester);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (semester) => {
    setSemesterToDelete(semester);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!semesterToDelete) return;
    try {
      const response = await deleteSemester(semesterToDelete.semesterId);
      if (response.isSuccess) {
        toast.success('Semester deleted successfully');
        fetchSemesters();
      } else {
        const msg = response.errorList?.[0]?.message || response.message || 'Cannot delete semester';
        toast.error(msg);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete semester');
    } finally {
      setIsDeleteModalOpen(false);
      setSemesterToDelete(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Logic
  const filteredSemesters = semesters.filter(sem => 
    sem.semesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sem.semesterCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSemesters.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSemesters = filteredSemesters.slice(startIndex, endIndex);

  return (
    <HeadDashboardLayout>
      <div className='bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='space-y-'>
          
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
            <div className="relative z-10 px-6 py-8 lg:px-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                    Head Department
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Semester <span className="text-orangeFpt-500 font-bold">Management</span>
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Create and manage academic semesters and timelines
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={handleCreate}
                      className='flex items-center gap-2 px-5 py-2.5 bg-orangeFpt-500 text-white rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium'
                    >
                      <Plus className='w-4 h-4' />
                      Create Semester
                    </button>
                  </div>
                </div>
                
                {/* Stats Card */}
                <div className="w-full max-w-sm">
                  <div className="rounded-2xl border border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500 px-5 py-4 shadow-sm backdrop-blur">
                    <div className="flex justify-between items-start">
                      <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                        Total Semesters
                      </p>
                      <Calendar className='w-5 h-5 text-orangeFpt-600' />
                    </div>
                    <p className="text-3xl font-bold text-orangeFpt-600 mt-2">
                      {semesters.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-auto max-w-[95%] mt-6'>
            {/* Filters */}
            <div className='p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4'>
              <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                Semester List
                <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                  {currentSemesters.length} of {filteredSemesters.length}
                </span>
              </h2>
              <div className='relative'>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search semester...'
                  className='w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm'
                />
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
              </div>
            </div>

            {/* List View */}
            <div className='min-h-[400px]'>
              {loading ? (
                <div className='flex justify-center items-center h-64'>
                  <div className='animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-orangeFpt-600'></div>
                </div>
              ) : (
                <SemesterList 
                  semesters={currentSemesters} 
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        {/* Create/Update Modal */}
        <ModalWrapper
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedSemester ? "Update Semester" : "Create New Semester"}
        >
          <SemesterForm
            initialData={selectedSemester}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchSemesters();
            }}
          />
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className='fixed inset-0 flex items-center justify-center bg-slate-900/30 z-50 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-xl p-6 w-96 border border-slate-100'>
              <div className='flex items-center gap-4 mb-5'>
                <div className='p-3 bg-red-50 rounded-full border border-red-100'>
                  <AlertTriangle className='w-6 h-6 text-red-600' />
                </div>
                <h2 className='text-lg font-bold text-slate-800'>Delete Semester?</h2>
              </div>
              <p className='text-slate-500 mb-6 text-sm leading-relaxed'>
                Are you sure you want to delete <strong>{semesterToDelete?.semesterName}</strong>? This action cannot be undone.
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className='px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium text-sm'
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className='px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm shadow-md shadow-red-100'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeadDashboardLayout>
  );
}