import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateMultipleSubjectForm from '../../features/staff/components/CreateMultipleSubjectForm';
import UpdateSubjectForm from '../../features/staff/components/UpdateSubjectForm';
import { getAllSubject } from '../../services/userService';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';

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

const ITEMS_PER_PAGE = 9;

/**
 * SubjectManagement Component
 * Main component for managing subjects with pagination, filtering, and multiple views
 */
export default function SubjectManagement() {
  // ==================== STATE MANAGEMENT ====================
  
  // Data state
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
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
  
  const filteredSubjects = subjects.filter((sub) => {
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
    active: subjects.filter((s) => s.isActive).length,
    inactive: subjects.filter((s) => !s.isActive).length,
    categories: new Set(subjects.map((s) => s.subjectCode?.substring(0, 3)))
      .size,
  };

  // ==================== EVENT HANDLERS ====================
  
  const handleViewSubject = (subject) => {
    navigate(`/head-department/subject-management/${subject.subjectId}`);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteSubject = (subject) => {
    // TODO: Implement delete logic with confirmation
    console.log('Delete subject:', subject);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsCreateModalOpen(false);
    setIsUpdateModalOpen(false);
    if (shouldRefresh) {
      fetchSubjects();
    }
  };

  // ==================== RENDER ====================
  
  return (
    <div className='min-h-screen flex bg-gray-50'>
      <HeadDepartmentSidebar />

      <div className='flex-1 flex flex-col'>
        <div className='p-6 space-y-6'>
          <div className='max-w-7xl mx-auto w-full space-y-6'>
            
            {/* Header */}
            <SubjectHeader onAddClick={() => setIsCreateModalOpen(true)} />

            {/* Statistics */}
            <SubjectStats
              total={stats.total}
              active={stats.active}
              inactive={stats.inactive}
              categories={stats.categories}
            />

            {/* Filters */}
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

            {/* Subject List */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              {currentSubjects.length === 0 ? (
                <EmptyState searchQuery={searchQuery} />
              ) : viewMode === 'grid' ? (
                <SubjectGridView
                  subjects={currentSubjects}
                  onView={handleViewSubject}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              ) : (
                <SubjectListView
                  subjects={currentSubjects}
                  onView={handleViewSubject}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalWrapper
        isOpen={isCreateModalOpen}
        onClose={() => handleModalClose(false)}
        title='Add Multiple Subjects'
      >
        <CreateMultipleSubjectForm
          onClose={(shouldRefresh) => handleModalClose(shouldRefresh)}
        />
      </ModalWrapper>

      <ModalWrapper
        isOpen={isUpdateModalOpen}
        onClose={() => handleModalClose(false)}
        title='Update Subject'
      >
        <UpdateSubjectForm
          subject={selectedSubject}
          onClose={() => handleModalClose(true)}
        />
      </ModalWrapper>
    </div>
  );
}