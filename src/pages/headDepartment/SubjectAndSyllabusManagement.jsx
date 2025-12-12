import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateMultipleSubjectForm from '../../features/head-department/components/CreateMultipleSubjectForm';
import CreateSubjectForm from '../../features/head-department/components/CreateSubjectForm';
import { getAllSubject } from '../../services/userService';

// Import sub-components
import {
  SubjectHeader,
  SubjectStats,
  SubjectFilters,
  SubjectGridView,
  SubjectListView,
  EmptyState,
  Pagination,
} from '../../features/head-department/components';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

const ITEMS_PER_PAGE = 6;

/**
 * SubjectManagement Component
 * Main component for managing subjects - matching Staff/Admin UI style
 */
export default function SubjectManagement() {
  // ==================== STATE MANAGEMENT ====================

  // Data state
  const [subjects, setSubjects] = useState([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);

  const navigate = useNavigate();

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getAllSubject();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  // ==================== FILTERING ====================

  const filteredSubjects = subjects.filter(sub => {
    // Search filter
    const matchesSearch =
      sub.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && sub.isActive) ||
      (statusFilter === 'inactive' && !sub.isActive);

    return matchesSearch && matchesStatus;
  });

  // ==================== PAGINATION ====================

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubjects = filteredSubjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ==================== STATISTICS ====================

  const stats = {
    total: subjects.length,
    active: subjects.filter(s => s.isActive).length,
    inactive: subjects.filter(s => !s.isActive).length,
    categories: new Set(subjects.map(s => s.subjectCode?.substring(0, 3))).size,
  };

  // ==================== EVENT HANDLERS ====================

  const handleViewSubject = subject => {
    navigate(`/head-department/subject-management/${subject.subjectId}`);
  };

  const handleDeleteSubject = subject => {
    // TODO: Implement delete logic with confirmation
    console.log('Delete subject:', subject);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    // Scroll to top of the table/grid container instead of window
    document
      .getElementById('subjects-container')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsCreateModalOpen(false);
    setIsCreateSubjectModalOpen(false);
    if (shouldRefresh) {
      fetchSubjects();
    }
  };

  // ==================== RENDER ====================

  return (
    <HeadDashboardLayout>
      <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
        <div className='mx-auto space-y-6'>
          
          {/* Header Section - Matching Staff/Admin style */}
          <SubjectHeader 
            onAddClick={() => setIsCreateModalOpen(true)} 
            onCreateClick={() => setIsCreateSubjectModalOpen(true)}
            stats={stats}
          />

          {/* User Table - Matching Staff/Admin style */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            {/* Table Header with Filters */}
            <div className='p-2 border-b border-slate-100'>
              <SubjectFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentCount={currentSubjects.length}
                totalCount={filteredSubjects.length}
              />
            </div>

            {/* Content Area */}
            <div className='p-2'>
              {currentSubjects.length === 0 ? (
                <EmptyState searchQuery={searchQuery} />
              ) : viewMode === 'grid' ? (
                <SubjectGridView
                  subjects={currentSubjects}
                  onView={handleViewSubject}
                  onDelete={handleDeleteSubject}
                />
              ) : (
                <SubjectListView
                  subjects={currentSubjects}
                  onView={handleViewSubject}
                  onDelete={handleDeleteSubject}
                />
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className=' '>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ModalWrapper
          isOpen={isCreateModalOpen}
          onClose={() => handleModalClose(false)}
          title="Create Multiple Subjects"
        >
          <CreateMultipleSubjectForm
            onClose={shouldRefresh => handleModalClose(shouldRefresh)}
          />
        </ModalWrapper>
        <ModalWrapper
          isOpen={isCreateSubjectModalOpen}
          onClose={() => handleModalClose(false)}
          title="Create New Subject"
          >
          <CreateSubjectForm
            onClose={shouldRefresh => handleModalClose(shouldRefresh)}
          />
          </ModalWrapper>
      </div>
    </HeadDashboardLayout>
  );
}