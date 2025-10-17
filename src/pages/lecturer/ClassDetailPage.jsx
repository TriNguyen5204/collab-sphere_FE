import React, { useEffect, useMemo, useState } from 'react';
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
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CLASS_PROJECT_POOL = [
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    summary: 'Cross-platform companion app that helps students track campus events and deliverables.',
    status: 'In Progress',
    dueDate: '2025-10-15',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    tags: ['Mobile', 'UX Research'],
  },
  {
    id: 'web-dashboard',
    name: 'Faculty Analytics Dashboard',
    summary: 'Data-driven dashboard with real-time lecturer insights and predictive risk alerts.',
    status: 'Planning',
    dueDate: '2025-10-28',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    tags: ['Data Viz', 'React'],
  },
  {
    id: 'ai-chatbot',
    name: 'AI Academic Assistant',
    summary: 'Conversational agent that answers course FAQs and surfaces checkpoints with reminders.',
    status: 'Review',
    dueDate: '2025-11-05',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f97316 100%)',
    tags: ['AI', 'Node.js'],
  },
  {
    id: 'research-portal',
    name: 'Research Collaboration Portal',
    summary: 'Portal that streamlines proposal approvals and tracks joint publications.',
    status: 'Discovery',
    dueDate: '2025-11-15',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    tags: ['Collaboration', 'Security'],
  },
];

const INITIAL_STUDENTS = [
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
    role: 'leader',
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
    avatar: 'BS',
    role: 'member',
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
    avatar: 'CD',
    role: 'member',
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
    avatar: 'DW',
    role: 'member',
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
    avatar: 'EB',
    role: 'member',
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
    avatar: 'FM',
    role: 'member',
  },
  {
    id: 7,
    name: 'Grace Lee',
    email: 'grace.lee@university.edu',
    team: null,
    teamColor: null,
    progress: 64,
    status: 'active',
    lastSubmission: '2025-09-18',
    tasksCompleted: 8,
    totalTasks: 14,
    avatar: 'GL',
    role: 'member',
  },
  {
    id: 8,
    name: 'Henry Park',
    email: 'henry.park@university.edu',
    team: null,
    teamColor: null,
    progress: 52,
    status: 'behind',
    lastSubmission: '2025-09-12',
    tasksCompleted: 6,
    totalTasks: 14,
    avatar: 'HP',
    role: 'member',
  },
  {
    id: 9,
    name: 'Isabella Moore',
    email: 'isabella.moore@university.edu',
    team: null,
    teamColor: null,
    progress: 0,
    status: 'active',
    lastSubmission: '-',
    tasksCompleted: 0,
    totalTasks: 10,
    avatar: 'IM',
    role: 'member',
  },
];

const INITIAL_TEAM_CONFIG = [
  {
    id: 'alpha',
    name: 'Team Alpha',
    color: '#3b82f6',
    projectId: 'mobile-app',
  },
  {
    id: 'beta',
    name: 'Team Beta',
    color: '#10b981',
    projectId: 'web-dashboard',
  },
  {
    id: 'gamma',
    name: 'Team Gamma',
    color: '#f59e0b',
    projectId: 'ai-chatbot',
  },
];

const TEAM_COLOR_SWATCHES = ['#6366f1', '#0ea5e9', '#fb7185', '#22c55e', '#f97316', '#8b5cf6'];

const buildInitialTeams = (configs, students, projects) =>
  configs.map((config) => {
    const members = students.filter((student) => student.team === config.name);
    const project = projects.find((projectItem) => projectItem.id === config.projectId) || null;
    const memberProgress = members.reduce((total, member) => total + (member.progress || 0), 0);

    return {
      ...config,
      members,
      project,
      avgProgress: members.length ? Math.round(memberProgress / members.length) : 0,
    };
  });

const ClassDetailPage = () => {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState(() => INITIAL_STUDENTS);
  const [classProjects] = useState(CLASS_PROJECT_POOL);
  const [teams, setTeams] = useState(() => buildInitialTeams(INITIAL_TEAM_CONFIG, INITIAL_STUDENTS, CLASS_PROJECT_POOL));
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamFormError, setTeamFormError] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [showTeamToast, setShowTeamToast] = useState(false);
  const [teamForm, setTeamForm] = useState(() => ({
    name: '',
    color: TEAM_COLOR_SWATCHES[0],
    projectId: CLASS_PROJECT_POOL[0]?.id || '',
    memberIds: [],
    leaderId: '',
    description: '',
  }));

  useEffect(() => {
    if (!showTeamToast) {
      return undefined;
    }
    const timeout = setTimeout(() => setShowTeamToast(false), 3200);
    return () => clearTimeout(timeout);
  }, [showTeamToast]);

  // Mock data with enhanced student info
  const classData = {
    code: 'SE109',
    name: 'Object-Oriented Programming',
    term: 'Fall 2025',
    instructor: 'Dr. Sarah Chen',
    schedule: 'Mon, Wed, Fri 10:00-12:00',
    totalStudents: 42,
    totalModules: 12,
    totalResources: 28,
    avgScore: 84,
    description: 'Learn fundamental concepts of object-oriented programming including classes, objects, inheritance, and polymorphism.',
    completionRate: 87,
    activeLearningHours: 234,
  };

  // Modules data for LMS-style module management
  const modulesData = [
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

  const unassignedStudents = useMemo(
    () => students.filter((student) => !student.team),
    [students]
  );

  const sortedModules = [...modulesData].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const totalTeams = teams.length;
  const behindCount = students.filter((student) => student.status === 'behind').length;
  const unassignedCount = unassignedStudents.length;
  const averageTeamProgress = totalTeams
    ? Math.round(
        teams.reduce((total, team) => total + (team.avgProgress || 0), 0) / totalTeams
      )
    : 0;
  const placementMessage = unassignedCount > 0
    ? `${unassignedCount} students need team placement.`
    : 'Every student is already placed into a team.';

  const leadersCount = students.filter((student) => student.role === 'leader').length;
  const activeProjectsCount = classProjects.filter((project) =>
    ['In Progress', 'Planning', 'Review'].includes(project.status)
  ).length;
  const discoveryProjectsCount = classProjects.filter((project) =>
    project.status === 'Discovery'
  ).length;
  const nextProjectDue = classProjects.reduce((soonest, project) => {
    if (!project.dueDate) {
      return soonest;
    }
    const dueDate = new Date(project.dueDate);
    if (!soonest || dueDate < soonest) {
      return dueDate;
    }
    return soonest;
  }, null);
  const nextProjectDueLabel = nextProjectDue
    ? nextProjectDue.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'TBD';
  const recentResourceCount = resourcesData.filter((resource) => {
    const uploaded = new Date(resource.uploadDate);
    const diffDays = (Date.now() - uploaded.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 60;
  }).length;
  const latestResource = resourcesData.reduce((latest, resource) => {
    if (!latest) {
      return resource;
    }
    return new Date(resource.uploadDate) > new Date(latest.uploadDate) ? resource : latest;
  }, null);
  const latestResourceLabel = latestResource ? latestResource.title : 'Upload your first resource';
  const latestResourceDateLabel = latestResource
    ? new Date(latestResource.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
  const averageTaskCompletionRate = students.length
    ? Math.round(
        (students.reduce((total, student) => {
          if (!student.totalTasks) {
            return total;
          }
          return total + student.tasksCompleted / student.totalTasks;
        }, 0) /
          students.length) *
          100
      )
    : 0;
  const teamLeadLabel = leadersCount === 1 ? 'team lead' : 'team leads';
  const flaggedLabel = behindCount === 1 ? 'learner flagged' : 'learners flagged';
  const discoveryLabel = discoveryProjectsCount === 1 ? 'project in discovery' : 'projects in discovery';
  const recentResourceLabel = recentResourceCount === 1 ? 'asset' : 'assets';
  const moduleProgressSparkline = sortedModules.slice(0, 6).map((module) =>
    Math.round((module.studentsCompleted / module.totalStudents) * 100)
  );
  const projectStatusBreakdown = classProjects.reduce((acc, project) => {
    const key = project.status.toLowerCase();
    if (!acc[key]) {
      acc[key] = { label: project.status, count: 0 };
    } else {
      acc[key].label = project.status;
    }
    acc[key].count += 1;
    return acc;
  }, {});
  const projectStatusList = Object.values(projectStatusBreakdown).sort((a, b) => b.count - a.count);
  const mostAccessedResource = resourcesData.reduce((top, resource) => {
    const engagement = resource.downloads ?? resource.views ?? resource.visits ?? 0;
    const currentTop = top ? (top.downloads ?? top.views ?? top.visits ?? 0) : -1;
    return engagement > currentTop ? resource : top;
  }, null);
  const mostAccessedResourceEngagement = mostAccessedResource
    ? mostAccessedResource.downloads ?? mostAccessedResource.views ?? mostAccessedResource.visits ?? 0
    : 0;
  const mostAccessedResourceMetric = mostAccessedResource
    ? `${mostAccessedResourceEngagement} ${
        (mostAccessedResource.downloads && 'downloads') ||
        (mostAccessedResource.views && 'views') ||
        (mostAccessedResource.visits && 'visits')
      }`
    : 'Awaiting engagement';
  const mostAccessedResourceLabel = mostAccessedResource ? mostAccessedResource.title : 'No resource engagement yet';
  const getStatusClassName = (status) => (status || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const activeStudentCount = students.filter((student) => student.status === 'active').length;
  const averageStudentProgress = students.length
    ? Math.round(students.reduce((total, student) => total + (student.progress || 0), 0) / students.length)
    : 0;
  const assignmentCoverage = students.length
    ? Math.round(((students.length - unassignedCount) / students.length) * 100)
    : 0;
  const rosterSignalMessage = behindCount > 0 ? 'Coaching recommended' : 'Momentum sustained';

  // Filter students
  const filteredStudents = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue);
      const matchesTeam =
        teamFilter === 'all' ||
        (teamFilter === 'unassigned' && !student.team) ||
        student.team === teamFilter;
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [students, searchTerm, teamFilter, statusFilter]);

  const filteredMemberOptions = useMemo(() => {
    const searchValue = memberSearchTerm.trim().toLowerCase();
    return unassignedStudents.filter((student) => {
      if (!searchValue) {
        return true;
      }
      return (
        student.name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue)
      );
    });
  }, [memberSearchTerm, unassignedStudents]);

  const filteredProjectOptions = useMemo(() => {
    const searchValue = projectSearchTerm.trim().toLowerCase();
    return classProjects.filter((project) => {
      if (!searchValue) {
        return true;
      }
      return (
        project.name.toLowerCase().includes(searchValue) ||
        project.summary.toLowerCase().includes(searchValue)
      );
    });
  }, [projectSearchTerm, classProjects]);

  const canSubmitTeam = teamForm.name.trim() && teamForm.memberIds.length >= 2 && teamForm.projectId;

  const openCreateTeamPanel = () => {
    setTeamForm({
      name: '',
      color: TEAM_COLOR_SWATCHES[0],
      projectId: classProjects[0]?.id || '',
      memberIds: [],
      leaderId: '',
      description: '',
    });
    setMemberSearchTerm('');
    setProjectSearchTerm('');
    setTeamFormError('');
    setIsCreateTeamOpen(true);
  };

  const closeCreateTeamPanel = () => {
    setIsCreateTeamOpen(false);
    setTeamFormError('');
  };

  const handleTeamInputChange = (field) => (event) => {
    const value = event.target.value;
    setTeamForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorSwatchSelect = (color) => {
    setTeamForm((prev) => ({ ...prev, color }));
  };

  const handleMemberToggle = (studentId) => {
    setTeamForm((prev) => {
      const alreadySelected = prev.memberIds.includes(studentId);
      const memberIds = alreadySelected
        ? prev.memberIds.filter((id) => id !== studentId)
        : [...prev.memberIds, studentId];
      const leaderId = alreadySelected && prev.leaderId === studentId
        ? memberIds[0] || ''
        : prev.leaderId || (!alreadySelected && memberIds.length === 1 ? studentId : prev.leaderId);
      return {
        ...prev,
        memberIds,
        leaderId,
      };
    });
  };

  const handleLeaderSelect = (studentId) => {
    setTeamForm((prev) => ({ ...prev, leaderId: studentId }));
  };

  const handleProjectSelect = (projectId) => {
    setTeamForm((prev) => ({ ...prev, projectId }));
  };

  const handleCreateTeam = () => {
    if (!teamForm.name.trim()) {
      setTeamFormError('Provide a team name to continue.');
      return;
    }
    if (teamForm.memberIds.length < 2) {
      setTeamFormError('Select at least two members for the new team.');
      return;
    }
    if (!teamForm.projectId) {
      setTeamFormError('Choose a project from the class pool.');
      return;
    }

    const selectedProject = classProjects.find((project) => project.id === teamForm.projectId) || null;
    const selectedMembers = students.filter((student) => teamForm.memberIds.includes(student.id));
    const leaderId = teamForm.leaderId || teamForm.memberIds[0];
    const color = teamForm.color || TEAM_COLOR_SWATCHES[0];

    const newTeam = {
      id: `${teamForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: teamForm.name.trim(),
      color,
      project: selectedProject,
      projectId: selectedProject?.id || null,
      members: selectedMembers.map((member) => ({
        ...member,
        team: teamForm.name.trim(),
        teamColor: color,
        role: member.id === leaderId ? 'leader' : 'member',
      })),
      avgProgress: selectedMembers.length
        ? Math.round(
            selectedMembers.reduce((total, member) => total + (member.progress || 0), 0) /
              selectedMembers.length
          )
        : 0,
    };

    setTeams((prev) => [...prev, newTeam]);
    setStudents((prev) => prev.map((student) => {
      if (!teamForm.memberIds.includes(student.id)) {
        return student;
      }
      return {
        ...student,
        team: newTeam.name,
        teamColor: color,
        role: student.id === leaderId ? 'leader' : 'member',
      };
    }));
    setSelectedStudents(new Set());
    setTeamFormError('');
    setIsCreateTeamOpen(false);
    setShowTeamToast(true);
  };

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
    <section className={styles.rosterSection}>
      <header className={styles.rosterHeader}>
        <div className={styles.rosterTitleGroup}>
          <h3>Class Roster</h3>
          <p>{averageStudentProgress}% course momentum • {assignmentCoverage}% assigned • {rosterSignalMessage}</p>
        </div>
        <div className={styles.rosterQuickGlance}>
          <div className={styles.glanceCard}>
            <span className={styles.glanceLabel}>Active</span>
            <span className={styles.glanceValue}>{activeStudentCount}</span>
          </div>
          <div className={`${styles.glanceCard} ${behindCount > 0 ? styles.glanceWarning : ''}`}>
            <span className={styles.glanceLabel}>Behind</span>
            <span className={styles.glanceValue}>{behindCount}</span>
          </div>
          <div className={styles.glanceCard}>
            <span className={styles.glanceLabel}>Unassigned</span>
            <span className={styles.glanceValue}>{unassignedCount}</span>
          </div>
        </div>
      </header>

      <div className={styles.toolbarGrid}>
        <div className={styles.searchPanel}>
          <div className={styles.searchField}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or team"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${teamFilter === 'all' ? styles.filterPillActive : ''}`}
              onClick={() => setTeamFilter('all')}
            >
              All teams
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${teamFilter === 'unassigned' ? styles.filterPillActive : ''}`}
              onClick={() => setTeamFilter('unassigned')}
            >
              Unassigned
            </button>
            {teams.slice(0, 4).map((team) => (
              <button
                key={team.id}
                type="button"
                className={`${styles.filterPill} ${teamFilter === team.name ? styles.filterPillActive : ''}`}
                onClick={() => setTeamFilter(team.name)}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlPanel}>
          <label className={styles.controlSelect}>
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="behind">Behind</option>
            </select>
          </label>
          <label className={styles.controlSelect}>
            <span>Team</span>
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option value="all">Any</option>
              <option value="unassigned">Unassigned</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.primaryToolbarButton} onClick={() => setIsCreateTeamOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Smart team
          </button>
        </div>
      </div>

      {selectedStudents.size > 0 && (
        <div className={styles.bulkToolbar}>
          <input
            type="checkbox"
            checked={selectedStudents.size === filteredStudents.length}
            onChange={selectAllStudents}
            className={styles.checkbox}
          />
          <span className={styles.bulkCount}>
            {selectedStudents.size} of {filteredStudents.length} selected
          </span>
          <button className={styles.bulkAction}>Message</button>
          <button className={styles.bulkAction}>Generate brief</button>
          <button className={styles.bulkAction}>Export CSV</button>
        </div>
      )}

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
                <th>Last submission</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className={`${styles.tableRow} ${selectedStudents.has(student.id) ? styles.selected : ''}`}
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
                    <div className={styles.studentIdentity}>
                      <div 
                        className={styles.avatar}
                        style={{ backgroundColor: student.teamColor || '#94a3b8' }}
                      >
                        {student.avatar}
                      </div>
                      <div className={styles.studentMeta}>
                        <span className={styles.studentName}>{student.name}</span>
                        <span className={styles.studentEmail}>{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {student.team ? (
                      <span 
                        className={styles.teamBadge}
                        style={{ '--team-color': student.teamColor }}
                      >
                        <span className={styles.teamBadgeDot} style={{ backgroundColor: student.teamColor }} />
                        {student.team}
                        {student.role === 'leader' && (
                          <span className={styles.leaderBadge}>Leader</span>
                        )}
                      </span>
                    ) : (
                      <span className={styles.unassignedBadge}>Unassigned</span>
                    )}
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
                        {student.progress}% · {student.tasksCompleted}/{student.totalTasks}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.lastSubmission}>
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{new Date(student.lastSubmission).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status-${student.status}`] || ''}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className={styles.rowActions}>
                    <button type="button" className={styles.rowActionButton}>
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                    <button type="button" className={styles.rowActionButton}>
                      <ShareIcon className="w-4 h-4" />
                      Notify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderTeamsTab = () => (
    <div className={styles.sectionSurface}>
      <div className={styles.sectionHeaderRowLarge}>
        <div>
          <h3 className={styles.sectionTitle}>Teams Overview</h3>
          <p className={styles.sectionSubtitle}>Monitor team readiness, fill open seats, and link projects in a single glance.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreateTeamPanel}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Team
        </button>
      </div>

      <div className={styles.teamOverviewGrid}>
        <div className={`${styles.utilityCard} ${styles.utilityCardTall}`}>
          <div className={styles.utilityHeader}>
            <div>
              <span className={styles.utilityEyebrow}>Roster</span>
              <h4 className={styles.utilityTitle}>Unassigned Students</h4>
            </div>
            <span className={styles.utilityCount}>{unassignedStudents.length}</span>
          </div>
          <p className={styles.utilityDescription}>
            Select students who still need a team and bundle them into a new group.
          </p>
          <div className={styles.unassignedList}>
            {unassignedStudents.length === 0 ? (
              <span className={styles.emptyState}>All students are currently grouped.</span>
            ) : (
              unassignedStudents.slice(0, 5).map((student) => (
                <div key={student.id} className={styles.unassignedItem}>
                  <div className={styles.avatarSmall}>{student.avatar}</div>
                  <div className={styles.unassignedMeta}>
                    <p>{student.name}</p>
                    <span>{student.email}</span>
                  </div>
                  <span className={styles.statusPill}>{student.status}</span>
                </div>
              ))
            )}
          </div>
          <button
            className={styles.utilityAction}
            onClick={openCreateTeamPanel}
            disabled={unassignedStudents.length === 0}
          >
            <PlusIcon className="w-4 h-4" />
            Create from selection
          </button>
        </div>

        <div className={`${styles.utilityCard} ${styles.utilityCardWide}`}>
          <div className={styles.utilityHeader}>
            <div>
              <span className={styles.utilityEyebrow}>Projects</span>
              <h4 className={styles.utilityTitle}>Project Pool</h4>
            </div>
            <span className={styles.utilityCount}>{classProjects.length}</span>
          </div>
          <p className={styles.utilityDescription}>
            Projects already approved for this class. Link one when creating a team.
          </p>
          <div className={styles.projectPoolGrid}>
            {classProjects.map((project) => (
              <div key={project.id} className={styles.projectChip} style={{ background: project.gradient }}>
                <div className={styles.projectChipHeader}>
                  <span className={styles.projectChipName}>{project.name}</span>
                  <span className={styles.projectChipStatus}>{project.status}</span>
                </div>
                <p className={styles.projectChipSummary}>{project.summary}</p>
                <div className={styles.projectChipMeta}>
                  <CalendarIcon className="w-3 h-3" />
                  <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.teamsGrid}>
        {teams.map((team) => (
          <div key={team.id} className={styles.teamCard}>
            <div
              className={styles.teamAccent}
              style={{ background: team.color }}
              aria-hidden="true"
            />
            <div className={styles.teamCardInner}>
              <div className={styles.teamHeader}>
                <div>
                  <span className={styles.teamEyebrow}>Team</span>
                  <h4 className={styles.teamName}>{team.name}</h4>
                  <p className={styles.memberCount}>{team.members.length} members</p>
                </div>
                <div className={styles.teamProgressWrap}>
                  <ProgressRing progress={team.avgProgress} size={52} />
                </div>
              </div>

              <div className={styles.teamMembers}>
                {team.members.map((member) => (
                  <div key={member.id} className={styles.memberItem}>
                    <div
                      className={styles.avatar}
                      style={{
                        backgroundColor: `${member.teamColor || team.color}`,
                        width: '28px',
                        height: '28px',
                        fontSize: '12px',
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div className={styles.memberDetails}>
                      <span className={styles.memberNameText}>{member.name}</span>
                      <span className={styles.memberRoleText}>{member.role === 'leader' ? 'Leader' : 'Member'}</span>
                    </div>
                    <span className={styles.memberProgressValue}>{member.progress}%</span>
                  </div>
                ))}
              </div>

              <div className={styles.teamFooterRow}>
                <div className={styles.teamProjectMeta}>
                  <span className={styles.projectLabel}>Project</span>
                  <span className={styles.projectName}>{team.project?.name || 'Not assigned'}</span>
                </div>
                <div className={styles.teamDeadlineMeta}>
                  <CalendarIcon className={styles.deadlineIcon} />
                  <span>
                    {team.project?.dueDate
                      ? new Date(team.project.dueDate).toLocaleDateString()
                      : 'Set a deadline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModulesTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Course Projects</h3>
        <button className={styles.btnPrimary}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Project
        </button>
      </div>
      
      <div className="space-y-4">
        {modulesData.map((module, index) => (
          <div key={module.id} className={styles.moduleCard}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`${styles.moduleIndex} ${styles[`difficulty-${module.difficulty}`]}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={styles.moduleTitle}>{module.title}</h4>
                    <span className={`${styles.statusBadge} ${styles[`status-${module.status}`]}`}>
                      {module.status}
                    </span>
                    <span className={`${styles.difficultyBadge} ${styles[`difficulty-${module.difficulty}`]}`}>
                      {module.difficulty}
                    </span>
                  </div>
                  <p className={styles.moduleDescription}>{module.description}</p>
                  
                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{module.studentsCompleted}/{module.totalStudents} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderIcon className="w-4 h-4" />
                      <span>{module.resources} resources</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{module.assignments} assignments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{module.estimatedHours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Due: {new Date(module.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-medium text-slate-900">
                        {Math.round((module.studentsCompleted / module.totalStudents) * 100)}%
                      </span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={styles.progressBarFill}
                        style={{
                          width: `${(module.studentsCompleted / module.totalStudents) * 100}%`,
                          backgroundColor: module.status === 'completed' ? '#10b981' : 
                                         module.status === 'active' ? '#3b82f6' : '#94a3b8'
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
      case 'modules': return renderModulesTab();
      case 'resources': return renderResourcesTab();
      case 'teams': return renderTeamsTab();
      case 'analytics': return renderAnalyticsTab();
      default: return renderStudentsTab();
    }
  };

  const renderCreateTeamPanel = () => {
    if (!isCreateTeamOpen) {
      return null;
    }

  const selectedMembersList = students.filter((student) => teamForm.memberIds.includes(student.id));
  const selectedLeader = selectedMembersList.find((student) => student.id === teamForm.leaderId) || null;
  const linkedProject = classProjects.find((project) => project.id === teamForm.projectId) || null;
  const accentHex = teamForm.color ? teamForm.color.toUpperCase() : '--';

    return (
      <div className={styles.teamOverlay}>
        <div
          className={styles.teamOverlayBackdrop}
          onClick={closeCreateTeamPanel}
          aria-hidden="true"
        />
        <div
          className={styles.teamPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
          aria-describedby="create-team-subtitle"
        >
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle} id="create-team-title">Create a Team</h3>
              <p className={styles.panelSubtitle} id="create-team-subtitle">Bundle unassigned students and attach a class project in one flow.</p>
            </div>
            <button className={styles.closeButton} onClick={closeCreateTeamPanel} aria-label="Close">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.panelSection}>
              <label className={styles.sectionLabel} htmlFor="team-name">Team name</label>
              <input
                id="team-name"
                type="text"
                value={teamForm.name}
                onChange={handleTeamInputChange('name')}
                placeholder="e.g. Team Delta"
                className={styles.panelInput}
              />
            </div>

            <div className={styles.panelSection}>
              <label className={styles.sectionLabel} htmlFor="team-description">Team mission (optional)</label>
              <textarea
                id="team-description"
                value={teamForm.description}
                onChange={handleTeamInputChange('description')}
                placeholder="Set the tone for how this team will collaborate."
                className={styles.panelTextarea}
                rows={3}
              />
            </div>

            <div className={styles.panelSection}>
              <span className={styles.sectionLabel}>Accent color</span>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  value={teamForm.color}
                  onChange={handleTeamInputChange('color')}
                  className={styles.colorPicker}
                  aria-label="Pick a custom color"
                />
                <div className={styles.colorSwatches}>
                  {TEAM_COLOR_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSwatchSelect(color)}
                      className={`${styles.colorSwatch} ${teamForm.color === color ? styles.active : ''}`}
                      style={{ background: color }}
                      aria-label={`Use ${color} accent`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.panelSection}>
              <span className={styles.sectionLabel}>Team snapshot</span>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Team name</span>
                  <span className={styles.summaryValue}>{teamForm.name.trim() || 'Not set'}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Project</span>
                  <span className={styles.summaryValue}>
                    {linkedProject ? linkedProject.name : 'Select a project'}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Leader</span>
                  <span className={styles.summaryValue}>
                    {selectedLeader ? selectedLeader.name : 'Assign a leader'}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Members</span>
                  <div className={styles.summaryMembers}>
                    {selectedMembersList.length === 0 ? (
                      <span className={styles.summaryPlaceholder}>No members yet</span>
                    ) : (
                      selectedMembersList.slice(0, 4).map((member) => (
                        <span
                          key={member.id}
                          className={styles.summaryMemberChip}
                          style={{ background: teamForm.color || '#6366f1' }}
                        >
                          {member.avatar}
                        </span>
                      ))
                    )}
                    {selectedMembersList.length > 4 && (
                      <span className={styles.summaryOverflow}>+{selectedMembersList.length - 4}</span>
                    )}
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Accent</span>
                  <div className={styles.summaryAccent}>
                    <span className={styles.summaryColor} style={{ background: teamForm.color || '#6366f1' }} />
                    <span className={styles.summaryValueMono}>{accentHex}</span>
                  </div>
                </div>
                <div className={`${styles.summaryItem} ${styles.summaryItemWide}`}>
                  <span className={styles.summaryLabel}>Mission statement</span>
                  <span className={styles.summaryValueMulti}>
                    {teamForm.description.trim() ? teamForm.description : 'Add a short mission statement to inspire the team.'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`${styles.panelSection} ${styles.panelSectionFull}`}>
              <div className={styles.sectionHeaderRow}>
                <span className={styles.sectionLabel}>Select members</span>
                <span className={styles.sectionHint}>{teamForm.memberIds.length} selected</span>
              </div>
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(event) => setMemberSearchTerm(event.target.value)}
                placeholder="Search unassigned students..."
                className={styles.panelSearch}
              />
              <div className={styles.memberGrid}>
                {filteredMemberOptions.length === 0 ? (
                  <div className={styles.emptyPanelState}>No unassigned students available right now.</div>
                ) : (
                  filteredMemberOptions.map((student) => {
                    const isSelected = teamForm.memberIds.includes(student.id);
                    const isLeader = teamForm.leaderId === student.id;
                    return (
                      <div
                        key={student.id}
                        role="button"
                        tabIndex={0}
                        className={`${styles.memberOption} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleMemberToggle(student.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleMemberToggle(student.id);
                          }
                        }}
                      >
                        <div className={styles.memberAvatar}>{student.avatar}</div>
                        <div className={styles.memberMetaBlock}>
                          <span className={styles.memberName}>{student.name}</span>
                          <span className={styles.memberEmail}>{student.email}</span>
                          <span className={styles.memberProgress}>{student.progress}% course progress</span>
                        </div>
                        {isLeader ? (
                          <span className={styles.leaderChip}>Leader</span>
                        ) : (
                          isSelected && (
                            <span
                              role="button"
                              tabIndex={0}
                              className={styles.assignLeaderBtn}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleLeaderSelect(student.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleLeaderSelect(student.id);
                                }
                              }}
                            >
                              Make leader
                            </span>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`${styles.panelSection} ${styles.panelSectionFull}`}>
              <div className={styles.sectionHeaderRow}>
                <span className={styles.sectionLabel}>Link a project</span>
                <span className={styles.sectionHint}>Required</span>
              </div>
              <input
                type="text"
                value={projectSearchTerm}
                onChange={(event) => setProjectSearchTerm(event.target.value)}
                placeholder="Search class projects..."
                className={styles.panelSearch}
              />
              <div className={styles.projectPickerGrid}>
                {filteredProjectOptions.map((project) => {
                  const isActive = teamForm.projectId === project.id;
                  return (
                    <div
                      key={project.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles.projectOption} ${isActive ? styles.selected : ''}`}
                      onClick={() => handleProjectSelect(project.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleProjectSelect(project.id);
                        }
                      }}
                    >
                      <div className={styles.projectOptionHeader}>
                        <span className={styles.projectOptionName}>{project.name}</span>
                        <span className={styles.projectOptionStatus}>{project.status}</span>
                      </div>
                      <p className={styles.projectOptionSummary}>{project.summary}</p>
                      <div className={styles.projectOptionMeta}>
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.projectOptionTags}>
                        {project.tags.map((tag) => (
                          <span key={tag} className={styles.projectTag}>
                            <TagIcon className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.panelFooter}>
            {teamFormError && <span className={styles.errorText}>{teamFormError}</span>}
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnGhost} onClick={closeCreateTeamPanel}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleCreateTeam}
                disabled={!canSubmitTeam}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

          <div className={styles.headerGrid}>
            <div className={styles.headerPrimary}>
              <div className={styles.headerBadges}>
                <span className={styles.termChip}>
                  <CalendarIcon className="w-4 h-4" />
                  {classData.term}
                </span>
                <span className={styles.termChip}>
                  <ClockIcon className="w-4 h-4" />
                  {classData.schedule}
                </span>
              </div>

              <h1 className={styles.title}>
                {classData.code} · {classData.name}
              </h1>
              <p className={styles.description}>{classData.description}</p>

              <div className={styles.metaCards}>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Instructor</span>
                  <span className={styles.metaValue}>{classData.instructor}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Active teams</span>
                  <span className={styles.metaValue}>{totalTeams}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Learning hours</span>
                  <span className={styles.metaValue}>{classData.activeLearningHours}</span>
                </div>
              </div>

              <div className={styles.tagCluster}>
                <span className={styles.tagChip}>
                  <UserGroupIcon className="w-4 h-4" />
                  {classData.totalStudents} students
                </span>
                <span className={styles.tagChip}>
                  <BookOpenIcon className="w-4 h-4" />
                  {classData.totalModules} modules
                </span>
                <span className={styles.tagChip}>
                  <AcademicCapIcon className="w-4 h-4" />
                  {classProjects.length} active projects
                </span>
                <span className={styles.tagChip}>
                  <ChartBarIcon className="w-4 h-4" />
                  {averageTeamProgress}% avg team progress
                </span>
              </div>

              <div className={styles.headerActions}>
                <button className={styles.btnSecondary}>
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Manage settings
                </button>
                <Link
                  to={`/lecturer/classes/${classId}/projects`}
                  className={styles.btnSecondary}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  <FolderIcon className="w-4 h-4 mr-2" />
                  Project workspace
                </Link>
                <button className={styles.btnGhost}>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share brief
                </button>
                <button className={styles.btnGradient}>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Launch session
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* Overview Metrics */}
        <section className={styles.metricsStage} aria-label="Class analytics overview">
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard} data-tone="indigo">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <UserGroupIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Roster health</span>
                  <p className={styles.metricSubtitle}>{placementMessage}</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{classData.totalStudents}</span>
                  <span className={styles.metricUnit}>students</span>
                </div>
                <div className={styles.metricChips}>
                  <span className={styles.metricChipPositive}>{leadersCount} {teamLeadLabel} active</span>
                  <span className={behindCount > 0 ? styles.metricChipWarning : styles.metricChipNeutral}>
                    {behindCount > 0 ? `${behindCount} ${flaggedLabel}` : 'All on track'}
                  </span>
                </div>
              </div>
              <div className={styles.metricSparkline} aria-hidden="true">
                {moduleProgressSparkline.map((value, index) => (
                  <span
                    key={index}
                    className={styles.sparklineBar}
                    style={{ height: `${Math.max(value, 12)}%` }}
                  />
                ))}
              </div>
              <footer className={styles.metricFooter}>
                <span className={styles.metricFootnote}>Milestone coverage</span>
                <span className={styles.metricFootnoteValue}>{averageTaskCompletionRate}% avg task completion</span>
              </footer>
            </article>

            <article className={styles.metricCard} data-tone="sunset">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Project pipeline</span>
                  <p className={styles.metricSubtitle}>Next review {nextProjectDueLabel}</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{activeProjectsCount}</span>
                  <span className={styles.metricUnit}>active projects</span>
                </div>
                <ul className={styles.metricLegend}>
                  {projectStatusList.map((status) => (
                    <li key={status.label} className={styles.metricLegendItem}>
                      <span
                        className={`${styles.metricLegendDot} ${styles[`statusDot${getStatusClassName(status.label)}`] || ''}`}
                      />
                      <span className={styles.metricLegendLabel}>
                        {status.count} {status.label.toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <footer className={styles.metricFooter}>
                <span className={styles.metricFootnote}>Discovery</span>
                <div className={styles.metricFooterActions}>
                  <span className={styles.metricFootnoteValue}>{discoveryProjectsCount} {discoveryLabel}</span>
                  <Link
                    to={`/lecturer/classes/${classId}/projects`}
                    className={styles.metricFootnoteAction}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Open tracker
                  </Link>
                </div>
              </footer>
            </article>

            <article className={styles.metricCard} data-tone="lagoon">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <FolderIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Resource hub</span>
                  <p className={styles.metricSubtitle}>{recentResourceCount} {recentResourceLabel} added in 60 days</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{classData.totalResources}</span>
                  <span className={styles.metricUnit}>assets</span>
                </div>
                <div className={styles.metricStack}>
                  <div className={styles.metricStackRow}>
                    <span className={styles.metricStackLabel}>Latest upload</span>
                    <span className={styles.metricStackValue}>{latestResourceLabel}</span>
                  </div>
                  <div className={styles.metricStackRow}>
                    <span className={styles.metricStackLabel}>Engagement</span>
                    <span className={styles.metricStackValue}>{mostAccessedResourceMetric}</span>
                  </div>
                </div>
              </div>
              <footer className={styles.metricFooter}>
                <span className={styles.metricFootnote}>Updated</span>
                <span className={styles.metricFootnoteValue}>{latestResourceDateLabel || '—'}</span>
              </footer>
            </article>
          </div>
        </section>

        {/* MD3 Tabs */}
        <div className={styles.md3Tabs}>
          {[
            { id: 'students', label: 'Students', icon: UserGroupIcon },
            { id: 'modules', label: 'Projects', icon: BookOpenIcon },
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
      {renderCreateTeamPanel()}
      {showTeamToast && (
        <div className={styles.teamToast} role="status">
          <CheckIcon className="w-4 h-4" />
          <span>Team created and synced with project pool.</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClassDetailPage;