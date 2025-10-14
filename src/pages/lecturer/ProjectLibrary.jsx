import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ProjectLibrary.module.css';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  ShareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const PROJECTS_DATA = [
  {
    id: 1,
    title: 'E-commerce Platform Development',
    description:
      'Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
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
      'User authentication and security',
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
    complexity: 'high',
  },
  {
    id: 2,
    title: 'Mobile Health Tracking App',
    description:
      'Develop a mobile application for health and fitness tracking with sensor integration and data visualization.',
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
      'Real-time data processing',
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
    complexity: 'medium',
  },
  {
    id: 3,
    title: 'AI-Powered Chatbot',
    description:
      'Create an intelligent chatbot using natural language processing and machine learning algorithms.',
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
      'Conversational AI design',
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
    complexity: 'high',
  },
  {
    id: 4,
    title: 'IoT Smart Home System',
    description:
      'Design and implement an IoT-based smart home system with sensor networks and mobile control.',
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
      'Real-time monitoring systems',
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
    complexity: 'high',
  },
  {
    id: 5,
    title: 'Social Media Analytics Dashboard',
    description:
      'Build a comprehensive analytics dashboard for social media data with real-time visualization.',
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
      'Statistical analysis and reporting',
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
    complexity: 'medium',
  },
  {
    id: 6,
    title: 'Blockchain Voting System',
    description:
      'Develop a secure voting system using blockchain technology with transparency and immutability.',
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
      'Cryptographic security implementation',
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
    complexity: 'high',
  },
];

const statusLabels = {
  published: 'Published',
  draft: 'Draft',
  review: 'In Review',
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const ProjectLibrary = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [favoriteProjects, setFavoriteProjects] = useState(
    () => new Set(PROJECTS_DATA.filter((module) => module.isFavorite).map((module) => module.id))
  );
  const [isLoading] = useState(false);

  const categories = useMemo(
  () => ['all', ...new Set(PROJECTS_DATA.map((module) => module.category))],
    []
  );

  const difficulties = useMemo(
  () => ['all', ...new Set(PROJECTS_DATA.map((module) => module.difficulty))],
    []
  );

  const statuses = useMemo(
  () => ['all', ...new Set(PROJECTS_DATA.map((module) => module.status))],
    []
  );

  const filteredProjects = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

  return PROJECTS_DATA.filter((module) => {
      const matchesSearch =
        !lowerSearch ||
        module.title.toLowerCase().includes(lowerSearch) ||
        module.description.toLowerCase().includes(lowerSearch) ||
        module.tags.some((tag) => tag.toLowerCase().includes(lowerSearch));

      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'all' || module.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedStatus]);

  const sortedProjects = useMemo(() => {
    const projects = [...filteredProjects];

    switch (sortBy) {
      case 'recent':
        return projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      case 'name':
        return projects.sort((a, b) => a.title.localeCompare(b.title));
      case 'popularity':
        return projects.sort((a, b) => b.totalTeams - a.totalTeams);
      case 'score':
        return projects.sort((a, b) => b.averageScore - a.averageScore);
      default:
        return projects;
    }
  }, [filteredProjects, sortBy]);

  const statistics = useMemo(() => {
  const total = PROJECTS_DATA.length;
  const published = PROJECTS_DATA.filter((module) => module.status === 'published').length;
  const draft = PROJECTS_DATA.filter((module) => module.status === 'draft').length;
  const review = PROJECTS_DATA.filter((module) => module.status === 'review').length;
  const totalTeams = PROJECTS_DATA.reduce((sum, module) => sum + module.totalTeams, 0);
  const activeTeams = PROJECTS_DATA.reduce((sum, module) => sum + module.activeTeams, 0);
  const aiReady = PROJECTS_DATA.filter((module) => module.hasAIAnalysis).length;
  const alignmentCandidates = PROJECTS_DATA.filter((module) => module.syllabusAlignment > 0);
    const averageAlignment = alignmentCandidates.length
      ? Math.round(
          alignmentCandidates.reduce((sum, module) => sum + module.syllabusAlignment, 0) /
            alignmentCandidates.length
        )
      : 0;

    return {
      total,
      published,
      draft,
      review,
      totalTeams,
      activeTeams,
      aiReady,
      averageAlignment,
    };
  }, []);

  const heroMetrics = useMemo(
    () => [
      {
        label: 'Published Projects',
        value: statistics.published,
        delta: statistics.total
          ? `${Math.round((statistics.published / statistics.total) * 100)}% of library`
          : 'No projects yet',
        positive: true,
      },
      {
        label: 'Awaiting Review',
        value: statistics.review,
        delta: statistics.review === 0 ? 'All clear' : 'Action required',
        positive: statistics.review === 0,
      },
      {
        label: 'Average Alignment',
        value: `${statistics.averageAlignment}%`,
        delta: `${statistics.aiReady} projects AI-ready`,
        positive: true,
      },
      {
        label: 'Active Teams',
        value: statistics.activeTeams,
        delta: `${statistics.totalTeams} teams overall`,
        positive: true,
      },
    ],
    [statistics]
  );

  const statusClassMap = {
    published: styles.badgeSuccess,
    draft: styles.badgeMuted,
    review: styles.badgeWarning,
  };

  const difficultyClassMap = {
    Beginner: styles.badgeMuted,
    Intermediate: styles.badgeSuccess,
    Advanced: styles.badgeAccent,
  };

  const toggleFavoriteProject = (projectId) => {
    setFavoriteProjects((prev) => {
      const updated = new Set(prev);
      if (updated.has(projectId)) {
        updated.delete(projectId);
      } else {
        updated.add(projectId);
      }
      return updated;
    });
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects((prev) => {
      const updated = new Set(prev);
      if (updated.has(projectId)) {
        updated.delete(projectId);
      } else {
        updated.add(projectId);
      }
      return updated;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
  setSelectedProjects(new Set(sortedProjects.map((module) => module.id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleCreateProject = () => {
    navigate('/lecturer/projects/create');
  };

  const handleUploadDocument = () => {
    navigate('/lecturer/projects/upload');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/lecturer/projects/${projectId}`);
  };

  const handleAnalyzeProject = (projectId) => {
    navigate(`/lecturer/projects/${projectId}/analysis`);
  };

  const handleDuplicateProject = (projectId) => {
    navigate(`/lecturer/projects/${projectId}/duplicate`);
  };

  const handleShareProject = (projectId) => {
    console.log('Share project', projectId);
  };

  const renderGridView = () => (
    <div className={styles.moduleGrid}>
      {sortedProjects.map((module) => {
        const cardClasses = [styles.moduleCard];
        if (selectedProjects.has(module.id)) {
          cardClasses.push(styles.moduleCardSelected);
        }

    const statusClass = statusClassMap[module.status] || styles.badgeMuted;
    const difficultyClass = difficultyClassMap[module.difficulty] || styles.badgeMuted;
    const isFavorite = favoriteProjects.has(module.id);

        return (
          <article key={module.id} className={cardClasses.join(' ')}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardMeta}>
                <div className={styles.tagRow}>
                  <label className={styles.selectionCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(module.id)}
                      onChange={() => toggleProjectSelection(module.id)}
                    />
                  </label>
                  <span className={`${styles.tag} ${statusClass}`}>
                    {statusLabels[module.status] || module.status}
                  </span>
                  <span className={`${styles.tag} ${difficultyClass}`}>{module.difficulty}</span>
                  <span
                    className={`${styles.tag} ${
                      module.hasAIAnalysis ? styles.badgePrimary : styles.badgeWarning
                    }`}
                  >
                    {module.hasAIAnalysis ? 'AI Insights' : 'AI Pending'}
                  </span>
                </div>

                <h3 className={styles.moduleTitle} onClick={() => handleProjectClick(module.id)}>
                  {module.title}
                </h3>
                <p className={styles.moduleSubtitle}>{module.description}</p>

                <div className={`${styles.tagRow} ${styles.skillTagRow}`}>
                  {module.skillsRequired.slice(0, 3).map((skill) => (
                    <span key={skill} className={`${styles.tag} ${styles.badgeMuted}`}>
                      {skill}
                    </span>
                  ))}
                  {module.skillsRequired.length > 3 && (
                    <span className={`${styles.tag} ${styles.badgeMuted}`}>
                      +{module.skillsRequired.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`}
                onClick={() => toggleFavoriteProject(module.id)}
                aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <StarIconSolid className="w-4 h-4" />
              </button>
            </div>

            <div className={styles.cardLower}>
              <div className={styles.metricsRow}>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabelSmall}>Active Teams</span>
                  <span className={styles.metricValueStrong}>{module.activeTeams}</span>
                  <span className={styles.metricFootnote}>of {module.totalTeams} teams</span>
                </div>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabelSmall}>Alignment</span>
                  <span className={styles.metricValueStrong}>
                    {module.syllabusAlignment ? `${module.syllabusAlignment}%` : '—'}
                  </span>
                  <span className={styles.metricFootnote}>
                    {module.hasAIAnalysis ? 'AI-reviewed' : 'Awaiting AI analysis'}
                  </span>
                </div>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabelSmall}>Duration</span>
                  <span className={styles.metricValueStrong}>{module.estimatedDuration}</span>
                  <span className={styles.metricFootnote}>
                    Max team size {module.maxTeamSize}
                  </span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.footerRow}>
                <div className={styles.footerMeta}>
                  <span>Updated {formatDate(module.lastModified)}</span>
                  <span>
                    {module.assignedClasses.length > 0
                      ? `${module.assignedClasses.length} classes assigned`
                      : 'Not assigned yet'}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleProjectClick(module.id)}
                  >
                    Open project
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleAnalyzeProject(module.id)}
                  >
                    AI insights
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleDuplicateProject(module.id)}
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderRow}>
          <div className={styles.listCell}>
            <label className={styles.selectionCheckbox}>
              <input
                type="checkbox"
                onChange={(event) => handleSelectAll(event.target.checked)}
                checked={sortedProjects.length > 0 && selectedProjects.size === sortedProjects.length}
                aria-label="Select all projects"
              />
            </label>
          </div>
          <div className={styles.listCell}>Project</div>
          <div className={styles.listCell}>Category</div>
          <div className={styles.listCell}>Status</div>
          <div className={styles.listCell}>Difficulty</div>
          <div className={styles.listCell}>Teams</div>
          <div className={styles.listCell}>Alignment</div>
          <div className={styles.listCell}>Modified</div>
          <div className={styles.listCell}>Actions</div>
        </div>
      </div>

      <div className={styles.listBody}>
        {sortedProjects.map((module) => {
          const statusClass = statusClassMap[module.status] || styles.badgeMuted;
          const difficultyClass = difficultyClassMap[module.difficulty] || styles.badgeMuted;
          const isFavorite = favoriteProjects.has(module.id);

          return (
            <div
              key={module.id}
              className={`${styles.listRow} ${
                selectedProjects.has(module.id) ? styles.listRowSelected : ''
              }`}
            >
              <div className={styles.listCell}>
                <label className={styles.selectionCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(module.id)}
                    onChange={() => toggleProjectSelection(module.id)}
                    aria-label={`Select ${module.title}`}
                  />
                </label>
              </div>
              <div className={styles.listCell}>
                <div className={styles.listModuleInfo}>
                  <div className={styles.listModuleTitle}>
                    <Link to={`/lecturer/projects/${module.id}`}>{module.title}</Link>
                    {isFavorite && <StarIconSolid className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className={styles.listModuleDescription}>{module.description}</div>
                  <div className={styles.listModuleTags}>
                    {module.skillsRequired.slice(0, 3).map((skill) => (
                      <span key={skill} className={styles.listSkillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.listCell}>
                <span className={`${styles.tag} ${statusClass}`}>
                  {statusLabels[module.status] || module.status}
                </span>
              </div>
              <div className={styles.listCell}>
                <span className={`${styles.tag} ${difficultyClass}`}>{module.difficulty}</span>
              </div>
              <div className={styles.listCell}>
                <span>{module.totalTeams}</span>
              </div>
              <div className={styles.listCell}>
                <div className={styles.listProgress} aria-hidden>
                  <div
                    className={styles.listProgressFill}
                    style={{ width: `${module.syllabusAlignment}%` }}
                  />
                </div>
              </div>
              <div className={styles.listCell}>
                <span>{formatDate(module.lastModified)}</span>
              </div>
              <div className={styles.listCell}>
                <div className={styles.listActions}>
                  <button
                    type="button"
                    onClick={() => handleProjectClick(module.id)}
                    title="Open project"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnalyzeProject(module.id)}
                    title="Run AI analysis"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareProject(module.id)}
                    title="Share project"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>
              <div className="flex items-center gap-3">
                <BookOpenIcon className="w-9 h-9 text-slate-100" />
                <div>
                  <h1 className={styles.heroTitle}>Project Library</h1>
                  <p className={styles.heroSubtitle}>
                    Curate, launch, and monitor projects with AI insights and streamlined oversight for every class you guide.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryAction} onClick={handleCreateProject}>
                <PlusIcon className="w-5 h-5" />
                Create project
              </button>
              <button type="button" className={styles.secondaryAction} onClick={handleUploadDocument}>
                <DocumentArrowUpIcon className="w-5 h-5" />
                Upload requirements
              </button>
            </div>

            <div className={styles.impactGrid}>
              {heroMetrics.map((metric) => (
                <div key={metric.label} className={styles.impactCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>{metric.label}</span>
                  </div>
                  <div className={styles.metricValueGroup}>
                    <span className={styles.metricValue}>{metric.value}</span>
                  </div>
                  <span
                    className={`${styles.metricDelta} ${
                      metric.positive ? styles.metricDeltaPositive : styles.metricDeltaNegative
                    }`}
                  >
                    {metric.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.filterDock}>
          <div className={styles.queryRow}>
            <div className={styles.searchWrap}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search projects, descriptions, or tags"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={styles.sortSelect}
            >
              <option value="recent">Recently updated</option>
              <option value="name">Name A-Z</option>
              <option value="popularity">Most teams</option>
              <option value="score">Highest score</option>
            </select>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.selectGroup}>
              <select
                value={selectedDifficulty}
                onChange={(event) => setSelectedDifficulty(event.target.value)}
                className={styles.select}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All difficulties' : difficulty}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className={styles.select}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All statuses' : statusLabels[status] || status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modeToggle}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`${styles.modeButton} ${viewMode === 'grid' ? styles.modeButtonActive : ''}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`${styles.modeButton} ${viewMode === 'list' ? styles.modeButtonActive : ''}`}
              >
                <ListBulletIcon className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          <div className={styles.chipRow}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.chip} ${selectedCategory === category ? styles.chipActive : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All categories' : category}
              </button>
            ))}
          </div>

          {selectedProjects.size > 0 && (
            <div className={styles.bulkBar}>
              <span>
                {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
              </span>
              <div className={styles.bulkActions}>
                <button type="button" className={`${styles.bulkButton} ${styles.bulkButtonPrimary}`}>
                  Assign to class
                </button>
                <button type="button" className={`${styles.bulkButton} ${styles.bulkButtonSecondary}`}>
                  Export
                </button>
                <button type="button" className={`${styles.bulkButton} ${styles.bulkButtonSecondary}`}>
                  Archive
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={styles.moduleSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Library overview</h2>
            <span className={styles.sectionCaption}>
              Showing {sortedProjects.length} of {PROJECTS_DATA.length} projects
            </span>
          </div>

          {isLoading ? (
            <div className={styles.loadingState}>
              <ArrowPathIcon className="w-8 h-8 animate-spin" />
              <p>Loading projects…</p>
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>No projects match your query</strong>
              <p>Adjust your filters or create a new project to populate the library.</p>
              <div className={styles.emptyActions}>
                <button type="button" className={styles.primaryAction} onClick={handleCreateProject}>
                  <PlusIcon className="w-5 h-5" />
                  Create project
                </button>
                <button type="button" className={styles.secondaryAction} onClick={handleUploadDocument}>
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Upload requirements
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProjectLibrary;