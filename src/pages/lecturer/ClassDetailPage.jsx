import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassDetailPage.module.css';
import {
  UserGroupIcon,
  BookOpenIcon,
  FolderIcon,
  ChartBarIcon,
  PlayIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  CloudArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const ClassDetailPage = () => {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, snetTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data with enhanced student info
  const classData = {
    code: 'SE109',
    name: 'Object-Oriented Programming',
    term: 'Fall 2025',
    instructor: 'Dr. Sarah Chen',
    schedule: 'Mon, Wed, Fri 10:00-12:00',
    totalStudents: 42,
    totalTopics: 12,
    totalResources: 28,
    avgScore: 84,
    description: 'Learn fundamental concepts of object-oriented programming including classes, objects, inheritance, and polymorphism.',
    completionRate: 87,
    activeLearningHours: 234,
  };

  // Topics data for LMS-style topic management
  const topicsData = [
    {
      id: 1,
      title: 'Introduction to OOP Concepts',
      description: 'Basic concepts of object-oriented programming',
      status: 'completed',
      studentsCompleted: 38,
      totalStudents: 42,
      dueDate: '2025-09-15',
      resources: 4,
      assignments: 2,
      difficulty: 'beginner',
      estimatedHours: 3
    },
    {
      id: 2,
      title: 'Classes and Objects',
      description: 'Understanding classes, objects, and instantiation',
      status: 'active',
      studentsCompleted: 28,
      totalStudents: 42,
      dueDate: '2025-09-25',
      resources: 6,
      assignments: 3,
      difficulty: 'intermediate',
      estimatedHours: 5
    },
    {
      id: 3,
      title: 'Inheritance and Polymorphism',
      description: 'Advanced OOP concepts and their implementation',
      status: 'upcoming',
      studentsCompleted: 0,
      totalStudents: 42,
      dueDate: '2025-10-05',
      resources: 5,
      assignments: 2,
      difficulty: 'advanced',
      estimatedHours: 6
    },
    {
      id: 4,
      title: 'Design Patterns',
      description: 'Common design patterns in object-oriented programming',
      status: 'draft',
      studentsCompleted: 0,
      totalStudents: 42,
      dueDate: '2025-10-15',
      resources: 3,
      assignments: 1,
      difficulty: 'advanced',
      estimatedHours: 4
    }
  ];

  // Resources data for resource library management
  const resourcesData = [
    {
      id: 1,
      title: 'OOP Fundamentals Textbook',
      type: 'pdf',
      category: 'reading',
      size: '15.2 MB',
      downloads: 156,
      uploadDate: '2025-08-15',
      description: 'Comprehensive guide to object-oriented programming concepts',
      tags: ['fundamentals', 'theory', 'textbook'],
      url: '#'
    },
    {
      id: 2,
      title: 'Java Programming Lecture Series',
      type: 'video',
      category: 'lecture',
      duration: '2h 45m',
      views: 89,
      uploadDate: '2025-08-20',
      description: 'Video lectures covering Java programming basics',
      tags: ['java', 'programming', 'video'],
      url: '#'
    },
    {
      id: 3,
      title: 'Class Diagram Templates',
      type: 'zip',
      category: 'template',
      size: '2.1 MB',
      downloads: 67,
      uploadDate: '2025-09-01',
      description: 'UML class diagram templates for assignments',
      tags: ['uml', 'templates', 'diagrams'],
      url: '#'
    },
    {
      id: 4,
      title: 'Code Examples Repository',
      type: 'link',
      category: 'code',
      link: 'https://github.com/example/oop-examples',
      visits: 234,
      uploadDate: '2025-08-25',
      description: 'GitHub repository with practical code examples',
      tags: ['code', 'examples', 'github'],
      url: '#'
    }
  ];

  const studentsData = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@university.edu',
      team: 'Team Alpha',
      teamColor: '#3b82f6',
      progress: 85,
      status: 'active',
      lastSubmission: '2025-09-20',
      tasksCompleted: 12,
      totalTasks: 15,
      avatar: 'AJ',
      role: 'leader'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@university.edu',
      team: 'Team Beta',
      teamColor: '#10b981',
      progress: 72,
      status: 'active',
      lastSubmission: '2025-09-19',
      tasksCompleted: 9,
      totalTasks: 15,
      avatar: 'BS'
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol.davis@university.edu',
      team: 'Team Gamma',
      teamColor: '#f59e0b',
      progress: 94,
      status: 'active',
      lastSubmission: '2025-09-21',
      tasksCompleted: 14,
      totalTasks: 15,
      avatar: 'CD'
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david.wilson@university.edu',
      team: 'Team Alpha',
      teamColor: '#3b82f6',
      progress: 58,
      status: 'behind',
      lastSubmission: '2025-09-15',
      tasksCompleted: 7,
      totalTasks: 15,
      avatar: 'DW'
    },
    {
      id: 5,
      name: 'Emma Brown',
      email: 'emma.brown@university.edu',
      team: 'Team Beta',
      teamColor: '#10b981',
      progress: 91,
      status: 'active',
      lastSubmission: '2025-09-21',
      tasksCompleted: 13,
      totalTasks: 15,
      avatar: 'EB'
    },
    {
      id: 6,
      name: 'Frank Miller',
      email: 'frank.miller@university.edu',
      team: 'Team Gamma',
      teamColor: '#f59e0b',
      progress: 73,
      status: 'active',
      lastSubmission: '2025-09-20',
      tasksCompleted: 11,
      totalTasks: 15,
      avatar: 'FM'
    },
  ];

  const teamsData = [
    {
      id: 'alpha',
      name: 'Team Alpha',
      color: '#3b82f6',
      members: studentsData.filter(s => s.team === 'Team Alpha'),
      project: 'Mobile App Development',
      deadline: 'Oct 15',
      avgProgress: 71.5
    },
    {
      id: 'beta', 
      name: 'Team Beta',
      color: '#10b981',
      members: studentsData.filter(s => s.team === 'Team Beta'),
      project: 'Web Dashboard',
      deadline: 'Oct 20',
      avgProgress: 81.5
    },
    {
      id: 'gamma',
      name: 'Team Gamma', 
      color: '#f59e0b',
      members: studentsData.filter(s => s.team === 'Team Gamma'),
      project: 'AI Chatbot',
      deadline: 'Oct 25',
      avgProgress: 83.5
    }
  ];

  // Filter students
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || student.team === teamFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#22c55e';
    if (progress >= 75) return '#3b82f6';
    if (progress >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const ProgressRing = ({ progress, size = 56 }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <div className={styles.progressRing} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke={getProgressColor(progress)}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className={styles.ringText}>{progress}%</div>
      </div>
    );
  };

  const renderStudentsTab = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className={styles.studentsHeader}>
        <h3 className="text-lg font-semibold text-gray-900">Class Roster</h3>
        <div className={styles.searchAndFilters}>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, teams, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Teams</option>
            <option value="Team Alpha">Team Alpha</option>
            <option value="Team Beta">Team Beta</option>
            <option value="Team Gamma">Team Gamma</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="behind">Behind</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedStudents.size > 0 && (
        <div className={styles.bulkToolbar}>
          <input
            type="checkbox"
            checked={selectedStudents.size === filteredStudents.length}
            onChange={selectAllStudents}
            className={styles.checkbox}
          />
          <span className="text-sm font-medium">
            {selectedStudents.size} of {filteredStudents.length} selected
          </span>
          <button className={styles.btnSecondary}>Send Message</button>
          <button className={styles.btnSecondary}>Generate Report</button>
          <button className={styles.btnSecondary}>Export Data</button>
        </div>
      )}
      
      {/* Students Table */}
      <div className={styles.studentsTable}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={selectAllStudents}
                    className={styles.checkbox}
                  />
                </th>
                <th>Student</th>
                <th>Team</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className={selectedStudents.has(student.id) ? styles.selected : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className={`${styles.checkbox} ${selectedStudents.has(student.id) ? styles.checked : ''}`}
                    />
                  </td>
                  <td>
                    <div className={styles.studentCell}>
                      <div 
                        className={styles.avatar}
                        style={{ backgroundColor: student.teamColor }}
                      >
                        {student.avatar}
                      </div>
                      <div className={styles.studentInfo}>
                        <h4>{student.name}</h4>
                        <p>{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={styles.teamBadge}
                      style={{ backgroundColor: `${student.teamColor}15`, color: student.teamColor }}
                    >
                      {student.team}
                      {student.role === 'leader' && (
                        <span className={styles.leaderBadge}>LEADER</span>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className={styles.progressCell}>
                      <div className={styles.progressBarContainer}>
                        <div 
                          className={styles.progressBarFill}
                          style={{
                            width: `${student.progress}%`,
                            backgroundColor: getProgressColor(student.progress)
                          }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {student.progress}% ({student.tasksCompleted}/{student.totalTasks})
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <a href="#" className={styles.actionButton}>View Details</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Teams Overview</h3>
        <button className={styles.btnPrimary}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Team
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamsData.map((team) => (
          <div key={team.id} className={styles.teamsPanel}>
            <div className={styles.teamHeader}>
              <div>
                <h4 className={styles.teamName} style={{ color: team.color }}>
                  {team.name}
                </h4>
                <p className={styles.memberCount}>
                  {team.members.length} members
                </p>
              </div>
              <div className="text-right">
                <ProgressRing progress={team.avgProgress} size={48} />
              </div>
            </div>
            
            <div className={styles.teamMembers}>
              {team.members.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div 
                    className={styles.avatar} 
                    style={{ 
                      backgroundColor: member.teamColor,
                      width: '24px',
                      height: '24px',
                      fontSize: '10px'
                    }}
                  >
                    {member.avatar}
                  </div>
                  <span className="flex-1">{member.name}</span>
                  {member.role === 'leader' && (
                    <span className={styles.leaderBadge}>L</span>
                  )}
                  <span className="text-sm text-gray-500">{member.progress}%</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Project:</span>
                  <span className="text-gray-600">{team.project}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Deadline: {team.deadline}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopicsTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Course Topics</h3>
        <button className={styles.btnPrimary}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Topic
        </button>
      </div>
      
      <div className="space-y-4">
        {topicsData.map((topic, index) => (
          <div key={topic.id} className={styles.topicCard}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`${styles.topicIndex} ${styles[`difficulty-${topic.difficulty}`]}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={styles.topicTitle}>{topic.title}</h4>
                    <span className={`${styles.statusBadge} ${styles[`status-${topic.status}`]}`}>
                      {topic.status}
                    </span>
                    <span className={`${styles.difficultyBadge} ${styles[`difficulty-${topic.difficulty}`]}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className={styles.topicDescription}>{topic.description}</p>
                  
                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{topic.studentsCompleted}/{topic.totalStudents} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderIcon className="w-4 h-4" />
                      <span>{topic.resources} resources</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{topic.assignments} assignments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{topic.estimatedHours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Due: {new Date(topic.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-medium text-slate-900">
                        {Math.round((topic.studentsCompleted / topic.totalStudents) * 100)}%
                      </span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBarFill}
                        style={{
                          width: `${(topic.studentsCompleted / topic.totalStudents) * 100}%`,
                          backgroundColor: topic.status === 'completed' ? '#10b981' : 
                                         topic.status === 'active' ? '#3b82f6' : '#94a3b8'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className={styles.iconButton}>
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Resource Library</h3>
        <div className="flex items-center gap-3">
          <select className={styles.filterSelect}>
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="video">Videos</option>
            <option value="link">External Links</option>
            <option value="zip">Archives</option>
          </select>
          <button className={styles.btnPrimary}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Resource
          </button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resourcesData.map((resource) => (
          <div key={resource.id} className={styles.resourceCard}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${styles.resourceIcon} ${styles[`type-${resource.type}`]}`}>
                {resource.type === 'pdf' && <DocumentTextIcon className="w-5 h-5" />}
                {resource.type === 'video' && <VideoCameraIcon className="w-5 h-5" />}
                {resource.type === 'link' && <LinkIcon className="w-5 h-5" />}
                {resource.type === 'zip' && <FolderIcon className="w-5 h-5" />}
              </div>
              <div className="flex items-center gap-1">
                <button className={styles.iconButton}>
                  <CloudArrowDownIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <ShareIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h4 className={styles.resourceTitle}>{resource.title}</h4>
            <p className={styles.resourceDescription}>{resource.description}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              {resource.size && (
                <span>{resource.size}</span>
              )}
              {resource.duration && (
                <span>{resource.duration}</span>
              )}
              {resource.downloads && (
                <span>{resource.downloads} downloads</span>
              )}
              {resource.views && (
                <span>{resource.views} views</span>
              )}
              {resource.visits && (
                <span>{resource.visits} visits</span>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className={styles.resourceTag}>
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 2 && (
                  <span className={styles.resourceTag}>
                    +{resource.tags.length - 2}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {new Date(resource.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Class Performance Analytics</h3>
      
      {/* Enhanced Analytics Cards */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.avgScore}%</div>
          <div className={styles.analyticsLabel}>Average Score</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.completionRate}%</div>
          <div className={styles.analyticsLabel}>Completion Rate</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.totalStudents - 4}</div>
          <div className={styles.analyticsLabel}>Active Students</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.activeLearningHours}</div>
          <div className={styles.analyticsLabel}>Learning Hours</div>
        </div>
      </div>
      
      {/* Activity Heatmap */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Activity Heatmap</h4>
        <div className={styles.heatmap}>
          {Array.from({ length: 98 }, (_, i) => (
            <div
              key={i}
              className={`${styles.heatmapCell} ${styles[`level${Math.floor(Math.random() * 4) + 1}`]}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={styles.heatmapCell}></div>
            <div className={`${styles.heatmapCell} ${styles.level1}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level2}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level3}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level4}`}></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students': return renderStudentsTab();
      case 'topics': return renderTopicsTab();
      case 'resources': return renderResourcesTab();
      case 'teams': return renderTeamsTab();
      case 'analytics': return renderAnalyticsTab();
      default: return renderStudentsTab();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* GitHub-inspired Header */}
        <div className={styles.header}>
          <div className={styles.headerNav}>
            <a href="/lecturer/classes" className={styles.backButton}>
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Classes
            </a>
            <span className="text-gray-300">•</span>
            <span className="font-medium text-gray-600">{classData.code}</span>
          </div>
          
          <div>
            <h1 className={styles.title}>
              {classData.code} - {classData.name}
            </h1>
            <p className={styles.description}>{classData.description}</p>
            
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <UserIcon className="w-4 h-4" />
                {classData.instructor}
              </div>
              <div className={styles.metaItem}>
                <CalendarIcon className="w-4 h-4" />
                {classData.term}
              </div>
              <div className={styles.metaItem}>
                <ClockIcon className="w-4 h-4" />
                {classData.schedule}
              </div>
            </div>
            
            <div className={styles.actions}>
              <button className={styles.btnSecondary}>
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Settings
              </button>
              <Link to={`/lecturer/classes/${classId}/projects`} className={styles.btnSecondary} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Projects
              </Link>
              <button className={styles.btnGradient}>
                <PlayIcon className="w-4 h-4 mr-2" />
                Start Session
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stat Chips */}
        <div className={styles.statChips}>
          <div className={styles.statChip}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{classData.totalStudents}</div>
              <div className={styles.statLabel}>Students</div>
            </div>
          </div>
          <div className={styles.statChip}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' }}>
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{classData.totalTopics}</div>
              <div className={styles.statLabel}>Topics</div>
            </div>
          </div>
          <div className={styles.statChip}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)' }}>
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{classData.totalResources}</div>
              <div className={styles.statLabel}>Resources</div>
            </div>
          </div>
          <div className={styles.statChip}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' }}>
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{classData.avgScore}%</div>
              <div className={styles.statLabel}>Avg Score</div>
            </div>
          </div>
        </div>

        {/* MD3 Tabs */}
        <div className={styles.md3Tabs}>
          {[
            { id: 'students', label: 'Students', icon: UserGroupIcon },
            { id: 'topics', label: 'Topics', icon: BookOpenIcon },
            { id: 'resources', label: 'Resources', icon: FolderIcon },
            { id: 'teams', label: 'Teams', icon: AcademicCapIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.md3Tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetailPage;