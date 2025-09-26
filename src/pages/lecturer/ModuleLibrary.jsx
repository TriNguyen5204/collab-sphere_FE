import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ModuleLibrary.module.css';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ModuleLibrary = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for modules with comprehensive metadata
  const modulesData = [
    {
      id: 1,
      title: 'E-commerce Platform Development',
      description: 'Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
      category: 'Web Development',
      difficulty: 'Advanced',
      status: 'published',
      estimatedDuration: '8-12 weeks',
      maxTeamSize: 5,
      skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express', 'Payment APIs'],
      learningOutcomes: [
        'Full-stack web development',
        'Database design and management',
        'API integration',
        'User authentication and security'
      ],
      assignedClasses: ['SE301', 'CS401'],
      totalTeams: 12,
      activeTeams: 8,
      completedTeams: 4,
      averageScore: 85.2,
      createdDate: '2024-09-15',
      lastModified: '2024-11-20',
      createdBy: 'Dr. Sarah Chen',
      tags: ['react', 'nodejs', 'ecommerce', 'full-stack'],
      isFavorite: true,
      documentCount: 5,
      resourceCount: 12,
      hasAIAnalysis: true,
      syllabusAlignment: 92,
      complexity: 'high'
    },
    {
      id: 2,
      title: 'Mobile Health Tracking App',
      description: 'Develop a mobile application for health and fitness tracking with sensor integration and data visualization.',
      category: 'Mobile Development',
      difficulty: 'Intermediate',
      status: 'published',
      estimatedDuration: '6-8 weeks',
      maxTeamSize: 4,
      skillsRequired: ['React Native', 'Firebase', 'Charts.js', 'Mobile Sensors'],
      learningOutcomes: [
        'Mobile app development',
        'Sensor integration',
        'Data visualization',
        'Real-time data processing'
      ],
      assignedClasses: ['CS302'],
      totalTeams: 6,
      activeTeams: 6,
      completedTeams: 0,
      averageScore: 0,
      createdDate: '2024-10-01',
      lastModified: '2024-11-18',
      createdBy: 'Dr. Michael Rodriguez',
      tags: ['mobile', 'health', 'react-native', 'sensors'],
      isFavorite: false,
      documentCount: 3,
      resourceCount: 8,
      hasAIAnalysis: true,
      syllabusAlignment: 88,
      complexity: 'medium'
    },
    {
      id: 3,
      title: 'AI-Powered Chatbot',
      description: 'Create an intelligent chatbot using natural language processing and machine learning algorithms.',
      category: 'Artificial Intelligence',
      difficulty: 'Advanced',
      status: 'draft',
      estimatedDuration: '10-14 weeks',
      maxTeamSize: 3,
      skillsRequired: ['Python', 'TensorFlow', 'NLP', 'REST APIs'],
      learningOutcomes: [
        'Machine learning implementation',
        'Natural language processing',
        'AI model training',
        'Conversational AI design'
      ],
      assignedClasses: [],
      totalTeams: 0,
      activeTeams: 0,
      completedTeams: 0,
      averageScore: 0,
      createdDate: '2024-11-10',
      lastModified: '2024-11-19',
      createdBy: 'Dr. Emily Watson',
      tags: ['ai', 'chatbot', 'nlp', 'python'],
      isFavorite: true,
      documentCount: 2,
      resourceCount: 6,
      hasAIAnalysis: false,
      syllabusAlignment: 0,
      complexity: 'high'
    },
    {
      id: 4,
      title: 'IoT Smart Home System',
      description: 'Design and implement an IoT-based smart home system with sensor networks and mobile control.',
      category: 'Internet of Things',
      difficulty: 'Advanced',
      status: 'published',
      estimatedDuration: '12-16 weeks',
      maxTeamSize: 6,
      skillsRequired: ['Arduino', 'Raspberry Pi', 'MQTT', 'React', 'Python'],
      learningOutcomes: [
        'IoT system architecture',
        'Embedded systems programming',
        'Wireless communication protocols',
        'Real-time monitoring systems'
      ],
      assignedClasses: ['EE401', 'CS403'],
      totalTeams: 4,
      activeTeams: 3,
      completedTeams: 1,
      averageScore: 78.5,
      createdDate: '2024-08-20',
      lastModified: '2024-11-15',
      createdBy: 'Prof. James Liu',
      tags: ['iot', 'arduino', 'smart-home', 'embedded'],
      isFavorite: false,
      documentCount: 7,
      resourceCount: 15,
      hasAIAnalysis: true,
      syllabusAlignment: 95,
      complexity: 'high'
    },
    {
      id: 5,
      title: 'Social Media Analytics Dashboard',
      description: 'Build a comprehensive analytics dashboard for social media data with real-time visualization.',
      category: 'Data Science',
      difficulty: 'Intermediate',
      status: 'published',
      estimatedDuration: '6-8 weeks',
      maxTeamSize: 4,
      skillsRequired: ['Python', 'Pandas', 'D3.js', 'APIs', 'PostgreSQL'],
      learningOutcomes: [
        'Data analysis and visualization',
        'API integration and data collection',
        'Dashboard design and development',
        'Statistical analysis and reporting'
      ],
      assignedClasses: ['DS201'],
      totalTeams: 8,
      activeTeams: 5,
      completedTeams: 3,
      averageScore: 82.7,
      createdDate: '2024-09-05',
      lastModified: '2024-11-12',
      createdBy: 'Dr. Anna Kim',
      tags: ['data-science', 'analytics', 'dashboard', 'python'],
      isFavorite: false,
      documentCount: 4,
      resourceCount: 10,
      hasAIAnalysis: true,
      syllabusAlignment: 90,
      complexity: 'medium'
    },
    {
      id: 6,
      title: 'Blockchain Voting System',
      description: 'Develop a secure voting system using blockchain technology with transparency and immutability.',
      category: 'Blockchain',
      difficulty: 'Advanced',
      status: 'review',
      estimatedDuration: '14-18 weeks',
      maxTeamSize: 5,
      skillsRequired: ['Solidity', 'Web3.js', 'Ethereum', 'React', 'Cryptography'],
      learningOutcomes: [
        'Blockchain development',
        'Smart contract programming',
        'Decentralized application (DApp) creation',
        'Cryptographic security implementation'
      ],
      assignedClasses: [],
      totalTeams: 0,
      activeTeams: 0,
      completedTeams: 0,
      averageScore: 0,
      createdDate: '2024-11-01',
      lastModified: '2024-11-20',
      createdBy: 'Dr. Robert Zhang',
      tags: ['blockchain', 'voting', 'solidity', 'web3'],
      isFavorite: true,
      documentCount: 3,
      resourceCount: 8,
      hasAIAnalysis: false,
      syllabusAlignment: 0,
      complexity: 'high'
    }
  ];

  // Filter and search logic
  const filteredModules = modulesData.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'all' || module.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Sort logic
  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastModified) - new Date(a.lastModified);
      case 'name':
        return a.title.localeCompare(b.title);
      case 'popularity':
        return b.totalTeams - a.totalTeams;
      case 'score':
        return b.averageScore - a.averageScore;
      default:
        return 0;
    }
  });

  // Statistics calculations
  const statistics = {
    total: modulesData.length,
    published: modulesData.filter(m => m.status === 'published').length,
    draft: modulesData.filter(m => m.status === 'draft').length,
    review: modulesData.filter(m => m.status === 'review').length,
    totalTeams: modulesData.reduce((sum, m) => sum + m.totalTeams, 0),
    averageAlignment: Math.round(
      modulesData.filter(m => m.syllabusAlignment > 0)
        .reduce((sum, m) => sum + m.syllabusAlignment, 0) / 
      modulesData.filter(m => m.syllabusAlignment > 0).length
    ) || 0
  };

  const categories = [...new Set(modulesData.map(m => m.category))];
  const difficulties = [...new Set(modulesData.map(m => m.difficulty))];
  const statuses = [...new Set(modulesData.map(m => m.status))];

  const handleCreateModule = () => {
    navigate('/lecturer/modules/create');
  };

  const handleUploadDocument = () => {
    navigate('/lecturer/modules/upload');
  };

  const handleModuleClick = (moduleId) => {
    navigate(`/lecturer/modules/${moduleId}`);
  };

  const handleAnalyzeWithAI = (moduleId) => {
    navigate(`/lecturer/modules/${moduleId}/analysis`);
  };

  const toggleFavorite = (moduleId) => {
    // This would typically update the backend
    console.log('Toggle favorite for module:', moduleId);
  };

  const toggleModuleSelection = (moduleId) => {
    const newSelection = new Set(selectedModules);
    if (newSelection.has(moduleId)) {
      newSelection.delete(moduleId);
    } else {
      newSelection.add(moduleId);
    }
    setSelectedModules(newSelection);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { class: 'published', icon: CheckBadgeIcon, text: 'Published' },
      draft: { class: 'draft', icon: PencilIcon, text: 'Draft' },
      review: { class: 'review', icon: ExclamationTriangleIcon, text: 'In Review' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      'Beginner': { class: 'beginner' },
      'Intermediate': { class: 'intermediate' },
      'Advanced': { class: 'advanced' }
    };
    
    return (
      <span className={`${styles.difficultyBadge} ${styles[difficultyConfig[difficulty]?.class || 'beginner']}`}>
        {difficulty}
      </span>
    );
  };

  const renderGridView = () => (
    <div className={styles.gridContainer}>
      {sortedModules.map((module) => (
        <div key={module.id} className={styles.moduleCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <input
                type="checkbox"
                checked={selectedModules.has(module.id)}
                onChange={() => toggleModuleSelection(module.id)}
                className={styles.checkbox}
              />
              <div className={styles.statusContainer}>
                {getStatusBadge(module.status)}
                {getDifficultyBadge(module.difficulty)}
              </div>
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => toggleFavorite(module.id)}
                className={styles.favoriteBtn}
              >
                {module.isFavorite ? (
                  <StarIconSolid className="w-4 h-4 text-yellow-500" />
                ) : (
                  <StarIcon className="w-4 h-4" />
                )}
              </button>
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownBtn}>⋯</button>
                <div className={styles.dropdownContent}>
                  <button onClick={() => handleModuleClick(module.id)}>
                    <EyeIcon className="w-4 h-4" />
                    View Details
                  </button>
                  <button onClick={() => navigate(`/lecturer/modules/${module.id}/edit`)}>
                    <PencilIcon className="w-4 h-4" />
                    Edit Module
                  </button>
                  <button onClick={() => navigate(`/lecturer/modules/${module.id}/duplicate`)}>
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button onClick={() => handleAnalyzeWithAI(module.id)}>
                    <ArrowPathIcon className="w-4 h-4" />
                    Re-analyze with AI
                  </button>
                  <button>
                    <ShareIcon className="w-4 h-4" />
                    Share Module
                  </button>
                  <hr />
                  <button className={styles.deleteBtn}>
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardContent} onClick={() => handleModuleClick(module.id)}>
            <h3 className={styles.moduleTitle}>{module.title}</h3>
            <p className={styles.moduleDescription}>{module.description}</p>
            
            <div className={styles.moduleMeta}>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <TagIcon className="w-4 h-4" />
                  {module.category}
                </span>
                <span className={styles.metaItem}>
                  <ClockIcon className="w-4 h-4" />
                  {module.estimatedDuration}
                </span>
                <span className={styles.metaItem}>
                  <UserGroupIcon className="w-4 h-4" />
                  Max {module.maxTeamSize} members
                </span>
              </div>
              
              {module.hasAIAnalysis && (
                <div className={styles.aiAnalysisIndicator}>
                  <div className={styles.alignmentScore}>
                    <span className={styles.alignmentLabel}>Syllabus Alignment</span>
                    <span className={styles.alignmentValue}>{module.syllabusAlignment}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.skillsTags}>
              {module.skillsRequired.slice(0, 3).map((skill, index) => (
                <span key={index} className={styles.skillTag}>{skill}</span>
              ))}
              {module.skillsRequired.length > 3 && (
                <span className={styles.skillTag}>+{module.skillsRequired.length - 3}</span>
              )}
            </div>
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <ChartBarIcon className="w-4 h-4" />
                <span>{module.totalTeams} teams</span>
              </div>
              <div className={styles.stat}>
                <AcademicCapIcon className="w-4 h-4" />
                <span>{module.assignedClasses.length} classes</span>
              </div>
              {module.averageScore > 0 && (
                <div className={styles.stat}>
                  <StarIcon className="w-4 h-4" />
                  <span>{module.averageScore}% avg</span>
                </div>
              )}
            </div>
            
            <div className={styles.cardTimestamp}>
              Modified {new Date(module.lastModified).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderRow}>
          <div className={styles.listHeaderCell}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedModules(new Set(sortedModules.map(m => m.id)));
                } else {
                  setSelectedModules(new Set());
                }
              }}
              checked={selectedModules.size === sortedModules.length && sortedModules.length > 0}
            />
          </div>
          <div className={styles.listHeaderCell}>Module</div>
          <div className={styles.listHeaderCell}>Category</div>
          <div className={styles.listHeaderCell}>Status</div>
          <div className={styles.listHeaderCell}>Teams</div>
          <div className={styles.listHeaderCell}>Classes</div>
          <div className={styles.listHeaderCell}>Score</div>
          <div className={styles.listHeaderCell}>Modified</div>
          <div className={styles.listHeaderCell}>Actions</div>
        </div>
      </div>
      
      <div className={styles.listBody}>
        {sortedModules.map((module) => (
          <div key={module.id} className={styles.listRow}>
            <div className={styles.listCell}>
              <input
                type="checkbox"
                checked={selectedModules.has(module.id)}
                onChange={() => toggleModuleSelection(module.id)}
              />
            </div>
            <div className={styles.listCell}>
              <div className={styles.listModuleInfo}>
                <div className={styles.listModuleTitle}>
                  <Link to={`/lecturer/modules/${module.id}`}>{module.title}</Link>
                  {module.isFavorite && <StarIconSolid className="w-4 h-4 text-yellow-500 ml-2" />}
                </div>
                <div className={styles.listModuleDescription}>{module.description}</div>
                <div className={styles.listModuleTags}>
                  {module.skillsRequired.slice(0, 3).map((skill, index) => (
                    <span key={index} className={styles.listSkillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.listCell}>
              <span className={styles.categoryBadge}>{module.category}</span>
            </div>
            <div className={styles.listCell}>
              {getStatusBadge(module.status)}
            </div>
            <div className={styles.listCell}>
              <span>{module.totalTeams}</span>
            </div>
            <div className={styles.listCell}>
              <span>{module.assignedClasses.length}</span>
            </div>
            <div className={styles.listCell}>
              <span>{module.averageScore > 0 ? `${module.averageScore}%` : '-'}</span>
            </div>
            <div className={styles.listCell}>
              <span>{new Date(module.lastModified).toLocaleDateString()}</span>
            </div>
            <div className={styles.listCell}>
              <div className={styles.listActions}>
                <button onClick={() => handleModuleClick(module.id)}>
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/lecturer/modules/${module.id}/edit`)}>
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleAnalyzeWithAI(module.id)}>
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={styles.moduleLibrary}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <BookOpenIcon className="w-8 h-8" />
              <div>
                <h1>Module Library</h1>
                <p>Manage and create project modules for your classes</p>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={handleUploadDocument}
                className={styles.uploadBtn}
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                Upload Document
              </button>
              <button 
                onClick={handleCreateModule}
                className={styles.createBtn}
              >
                <PlusIcon className="w-5 h-5" />
                Create Module
              </button>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.total}</div>
                <div className={styles.statLabel}>Total Modules</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckBadgeIcon className="w-6 h-6" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.published}</div>
                <div className={styles.statLabel}>Published</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.totalTeams}</div>
                <div className={styles.statLabel}>Active Teams</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.averageAlignment}%</div>
                <div className={styles.statLabel}>Avg Alignment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={styles.filtersSection}>
          <div className={styles.searchContainer}>
            <MagnifyingGlassIcon className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search modules, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.viewControls}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="recent">Recently Modified</option>
                <option value="name">Name A-Z</option>
                <option value="popularity">Most Popular</option>
                <option value="score">Highest Score</option>
              </select>

              <div className={styles.viewToggle}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {selectedModules.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectionCount}>
                {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
              </span>
              <div className={styles.bulkActionButtons}>
                <button className={styles.bulkBtn}>Assign to Class</button>
                <button className={styles.bulkBtn}>Export</button>
                <button className={styles.bulkBtn}>Archive</button>
                <button className={styles.bulkBtnDanger}>Delete</button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              {sortedModules.length} of {modulesData.length} modules
            </span>
            {searchTerm && (
              <span className={styles.searchIndicator}>
                Filtered by: "{searchTerm}"
              </span>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loadingState}>
              <ArrowPathIcon className="w-8 h-8 animate-spin" />
              <p>Loading modules...</p>
            </div>
          ) : sortedModules.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpenIcon className="w-16 h-16 text-gray-300" />
              <h3>No modules found</h3>
              <p>
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'Get started by creating your first module or uploading a document.'}
              </p>
              <div className={styles.emptyActions}>
                <button onClick={handleCreateModule} className={styles.createBtn}>
                  <PlusIcon className="w-5 h-5" />
                  Create First Module
                </button>
                <button onClick={handleUploadDocument} className={styles.uploadBtn}>
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Upload Document
                </button>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModuleLibrary;