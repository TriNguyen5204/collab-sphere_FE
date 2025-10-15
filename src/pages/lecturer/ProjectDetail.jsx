import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { TimelineView, ProjectHeader, WorkBreakdownStructure } from '../../features/project';
import styles from './ProjectDetail.module.css';
import {
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  TagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ListBulletIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const mapProjectToForm = (data) => ({
  title: data.title,
  description: data.description,
  category: data.category,
  difficulty: data.difficulty,
  estimatedDuration: data.estimatedDuration,
  maxTeamSize: data.maxTeamSize,
  minTeamSize: data.minTeamSize,
  tags: data.tags.join(', '),
  skillsRequired: data.skillsRequired.join(', '),
  learningOutcomes: data.learningOutcomes.join('\n'),
  prerequisites: data.prerequisites.join('\n'),
});

const mergeFormIntoProject = (project, form) => ({
  ...project,
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category.trim(),
  difficulty: form.difficulty,
  estimatedDuration: form.estimatedDuration.trim(),
  maxTeamSize: Number(form.maxTeamSize) || project.maxTeamSize,
  minTeamSize: Number(form.minTeamSize) || project.minTeamSize,
  tags: form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
  skillsRequired: form.skillsRequired
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean),
  learningOutcomes: form.learningOutcomes
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean),
  prerequisites: form.prerequisites
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean),
  lastModified: new Date().toISOString().slice(0, 10),
});

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [wbsViewMode, setWbsViewMode] = useState('wbs'); // 'wbs' or 'timeline'
  const [selectedClasses, setSelectedClasses] = useState(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [expandedWbsItems, setExpandedWbsItems] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  // Mock data for the project
  const initialProjectData = useMemo(() => ({
    id: projectId,
    title: 'E-commerce Platform Development',
    description:
      'Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration using modern web technologies.',
    category: 'Web Development',
    difficulty: 'Advanced',
    status: 'published',
    estimatedDuration: '8-10 weeks',
    maxTeamSize: 4,
    minTeamSize: 2,
    totalStudents: 156,
    activeTeams: 23,
    completedTeams: 8,
    averageScore: 87.3,
    lastModified: '2024-12-15',
    createdBy: 'Dr. Sarah Johnson',
    version: '2.1',
    tags: ['React', 'Node.js', 'MongoDB', 'Payment Integration', 'Authentication'],
    skillsRequired: ['JavaScript', 'React', 'Node.js', 'Database Design', 'API Development'],
    learningOutcomes: [
      'Design and implement a full-stack web application',
      'Integrate third-party payment systems',
      'Implement user authentication and authorization',
      'Design and optimize database schemas',
      'Deploy applications to cloud platforms'
    ],
    prerequisites: ['Web Development Fundamentals', 'JavaScript Proficiency', 'Database Basics'],
    resources: [
      { type: 'document', name: 'Project Requirements.pdf', size: '2.4 MB' },
      { type: 'video', name: 'Setup Walkthrough.mp4', duration: '15:30' },
      { type: 'template', name: 'Starter Code Repository', url: 'github.com/...' },
      { type: 'document', name: 'API Documentation.pdf', size: '1.8 MB' }
    ],
    syllabusAlignment: 94,
    hasAIAnalysis: true,
    isFavorite: true
  }), [projectId]);

  const [projectData, setProjectData] = useState(initialProjectData);

  useEffect(() => {
    setProjectData(initialProjectData);
  }, [initialProjectData]);

  // Enhanced Educational Kanban Tasks with Swimlane Features
  const [kanbanTasks, setKanbanTasks] = useState([
    // Frontend Development - Backlog
    {
      id: '4.1',
      title: 'Unit Testing Framework Setup',
      description: 'Set up Jest and React Testing Library for comprehensive component testing',
      type: 'task',
      duration: '3 days',
      status: 'BACKLOG',
      team: 'frontend',
      assignee: 'Alex Johnson',
      priority: 'medium',
      labels: ['testing', 'setup'],
      phase: 'Testing & Deployment',
      estimatedHours: 24,
      timeSpent: 0,
      progress: 0,
      technologies: ['Jest', 'React Testing Library', 'JavaScript'],
      skillsRequired: [
        { name: 'Unit Testing', level: 'intermediate' },
        { name: 'React', level: 'advanced' },
        { name: 'JavaScript', level: 'advanced' }
      ],
      learningOutcomes: 'Master automated testing practices and TDD methodology',
      assessmentCriteria: { points: 15, category: 'Technical Skills' },
      dueDate: '2024-12-15',
      createdDate: '2024-12-10',
      gitIntegration: { branch: 'feature/testing-setup', status: 'pending' },
      milestones: [
        { percentage: 25, name: 'Setup Jest', completed: false },
        { percentage: 50, name: 'Write Sample Tests', completed: false },
        { percentage: 100, name: 'Full Coverage', completed: false }
      ]
    },
    // Frontend Development - Review
    {
      id: '4.2',
      title: 'Responsive Design Implementation',
      description: 'Implement mobile-first responsive design across all components',
      type: 'task',
      duration: '4 days',
      status: 'REVIEW',
      team: 'frontend',
      assignee: 'Maria Rodriguez',
      priority: 'high',
      labels: ['responsive', 'css', 'mobile'],
      phase: 'Development',
      estimatedHours: 32,
      timeSpent: 28,
      progress: 85,
      technologies: ['CSS Grid', 'Flexbox', 'Media Queries', 'SCSS'],
      skillsRequired: [
        { name: 'CSS', level: 'advanced' },
        { name: 'Responsive Design', level: 'advanced' },
        { name: 'Mobile UX', level: 'intermediate' }
      ],
      learningOutcomes: 'Master responsive design principles and mobile-first approach',
      assessmentCriteria: { points: 20, category: 'Frontend Development' },
      dueDate: '2024-12-13',
      createdDate: '2024-12-08',
      gitIntegration: { branch: 'feature/responsive-design', status: 'review' },
      milestones: [
        { percentage: 30, name: 'Mobile Layout', completed: true },
        { percentage: 70, name: 'Tablet Breakpoints', completed: true },
        { percentage: 100, name: 'Desktop Optimization', completed: false }
      ]
    },
    // Frontend Development - Done
    {
      id: '3.4',
      title: 'User Authentication Flow',
      description: 'Complete login/register interface with form validation and security features',
      type: 'task',
      duration: '3 days',
      status: 'DONE',
      team: 'frontend',
      assignee: 'David Kim',
      priority: 'high',
      labels: ['authentication', 'security', 'forms'],
      phase: 'Frontend Development',
      estimatedHours: 24,
      timeSpent: 22,
      progress: 100,
      technologies: ['React Hook Form', 'Yup Validation', 'JWT', 'OAuth'],
      skillsRequired: [
        { name: 'Form Validation', level: 'intermediate' },
        { name: 'Authentication', level: 'advanced' },
        { name: 'Security', level: 'intermediate' }
      ],
      learningOutcomes: 'Understanding authentication flows and security best practices',
      assessmentCriteria: { points: 22, category: 'Frontend Development' },
      dueDate: '2024-12-12',
      createdDate: '2024-12-07',
      gitIntegration: { branch: 'feature/auth-ui', status: 'merged' },
      milestones: [
        { percentage: 40, name: 'Login Form', completed: true },
        { percentage: 70, name: 'Registration Flow', completed: true },
        { percentage: 100, name: 'Password Reset', completed: true }
      ]
    },
    // Backend Development - Todo
    {
      id: '2.4',
      title: 'Database Schema Design',
      description: 'Design and implement normalized database schema with proper relationships',
      type: 'task',
      duration: '3 days',
      status: 'TODO',
      team: 'backend',
      assignee: 'John Smith',
      priority: 'high',
      labels: ['database', 'schema', 'architecture'],
      phase: 'Backend Development',
      estimatedHours: 24,
      timeSpent: 0,
      progress: 0,
      technologies: ['PostgreSQL', 'Prisma', 'Database Design'],
      skillsRequired: [
        { name: 'Database Design', level: 'advanced' },
        { name: 'SQL', level: 'advanced' },
        { name: 'Data Modeling', level: 'intermediate' }
      ],
      learningOutcomes: 'Master database normalization and relationship design',
      assessmentCriteria: { points: 20, category: 'Backend Development' },
      dueDate: '2024-12-16',
      createdDate: '2024-12-05',
      gitIntegration: { branch: 'feature/database-schema', status: 'pending' },
      milestones: [
        { percentage: 33, name: 'Entity Design', completed: false },
        { percentage: 66, name: 'Relationships', completed: false },
        { percentage: 100, name: 'Migration Scripts', completed: false }
      ]
    },
    // Backend Development - In Progress
    {
      id: '2.5',
      title: 'RESTful API Development',
      description: 'Build comprehensive REST API with authentication, validation, and error handling',
      type: 'task',
      duration: '6 days',
      status: 'IN_PROGRESS',
      team: 'backend',
      assignee: 'Lisa Wang',
      priority: 'critical',
      labels: ['api', 'rest', 'authentication'],
      phase: 'Backend Development',
      estimatedHours: 48,
      timeSpent: 18,
      progress: 35,
      technologies: ['Node.js', 'Express', 'JWT', 'Joi Validation'],
      skillsRequired: [
        { name: 'Node.js', level: 'advanced' },
        { name: 'REST API Design', level: 'advanced' },
        { name: 'Authentication', level: 'intermediate' }
      ],
      learningOutcomes: 'Design and implement scalable REST APIs with security best practices',
      assessmentCriteria: { points: 30, category: 'Backend Development' },
      dueDate: '2024-12-18',
      createdDate: '2024-12-05',
      gitIntegration: { branch: 'feature/rest-api', status: 'active' },
      milestones: [
        { percentage: 25, name: 'Base Setup', completed: true },
        { percentage: 50, name: 'Auth Endpoints', completed: false },
        { percentage: 100, name: 'Full CRUD Operations', completed: false }
      ]
    },
    // Backend Development - Review
    {
      id: '2.3',
      title: 'Microservices Architecture',
      description: 'Implement microservices pattern with service discovery and load balancing',
      type: 'task',
      duration: '7 days',
      status: 'REVIEW',
      team: 'backend',
      assignee: 'Michael Brown',
      priority: 'high',
      labels: ['microservices', 'architecture', 'scalability'],
      phase: 'Backend Development',
      estimatedHours: 56,
      timeSpent: 52,
      progress: 90,
      technologies: ['Docker', 'Kubernetes', 'Redis', 'RabbitMQ'],
      skillsRequired: [
        { name: 'Microservices', level: 'advanced' },
        { name: 'Docker', level: 'intermediate' },
        { name: 'System Architecture', level: 'advanced' }
      ],
      learningOutcomes: 'Understanding distributed systems and microservices patterns',
      assessmentCriteria: { points: 35, category: 'Backend Development' },
      dueDate: '2024-12-20',
      createdDate: '2024-12-01',
      gitIntegration: { branch: 'feature/microservices', status: 'review' },
      milestones: [
        { percentage: 30, name: 'Service Separation', completed: true },
        { percentage: 70, name: 'Inter-service Communication', completed: true },
        { percentage: 100, name: 'Load Balancing', completed: false }
      ]
    },
    // Integration Team - Todo
    {
      id: '3.3',
      title: 'API Integration Layer',
      description: 'Implement frontend-backend integration with error handling and caching',
      type: 'task',
      duration: '4 days',
      status: 'TODO',
      team: 'integration',
      assignee: 'Emma Johnson',
      priority: 'high',
      labels: ['integration', 'api', 'caching'],
      phase: 'Integration & Testing',
      estimatedHours: 32,
      timeSpent: 0,
      progress: 0,
      technologies: ['Axios', 'React Query', 'Error Boundaries', 'Redux'],
      skillsRequired: [
        { name: 'API Integration', level: 'advanced' },
        { name: 'Error Handling', level: 'intermediate' },
        { name: 'State Management', level: 'advanced' }
      ],
      learningOutcomes: 'Master frontend-backend integration patterns and error handling strategies',
      assessmentCriteria: { points: 25, category: 'Integration' },
      dueDate: '2024-12-17',
      createdDate: '2024-11-28',
      gitIntegration: { branch: 'feature/api-integration', status: 'pending' },
      milestones: [
        { percentage: 40, name: 'Base Integration', completed: false },
        { percentage: 70, name: 'Error Handling', completed: false },
        { percentage: 100, name: 'Performance Optimization', completed: false }
      ]
    },
    // Integration Team - In Progress
    {
      id: '3.2',
      title: 'End-to-End Testing Suite',
      description: 'Comprehensive E2E testing covering user workflows and integration points',
      type: 'task',
      duration: '5 days',
      status: 'IN_PROGRESS',
      team: 'integration',
      assignee: 'Carlos Martinez',
      priority: 'high',
      labels: ['testing', 'e2e', 'automation'],
      phase: 'Integration & Testing',
      estimatedHours: 40,
      timeSpent: 22,
      progress: 55,
      technologies: ['Cypress', 'Playwright', 'Docker', 'CI/CD'],
      skillsRequired: [
        { name: 'E2E Testing', level: 'advanced' },
        { name: 'Test Automation', level: 'intermediate' },
        { name: 'DevOps', level: 'intermediate' }
      ],
      learningOutcomes: 'Master automated testing strategies for complex applications',
      assessmentCriteria: { points: 28, category: 'Integration' },
      dueDate: '2024-12-19',
      createdDate: '2024-11-25',
      gitIntegration: { branch: 'feature/e2e-testing', status: 'active' },
      milestones: [
        { percentage: 30, name: 'Test Framework Setup', completed: true },
        { percentage: 70, name: 'Core User Flows', completed: false },
        { percentage: 100, name: 'CI/CD Integration', completed: false }
      ]
    },
    // Integration Team - Done
    {
      id: '5.1',
      title: 'CI/CD Pipeline Setup',
      description: 'Automated build, test, and deployment pipeline with staging environment',
      type: 'task',
      duration: '4 days',
      status: 'DONE',
      team: 'integration',
      assignee: 'Rachel Green',
      priority: 'critical',
      labels: ['devops', 'cicd', 'automation'],
      phase: 'Integration & Testing',
      estimatedHours: 32,
      timeSpent: 30,
      progress: 100,
      technologies: ['GitHub Actions', 'Docker', 'AWS', 'Nginx'],
      skillsRequired: [
        { name: 'DevOps', level: 'advanced' },
        { name: 'CI/CD', level: 'advanced' },
        { name: 'Cloud Deployment', level: 'intermediate' }
      ],
      learningOutcomes: 'Understanding modern DevOps practices and automated deployment strategies',
      assessmentCriteria: { points: 30, category: 'Integration' },
      dueDate: '2024-12-11',
      createdDate: '2024-11-20',
      gitIntegration: { branch: 'feature/cicd-pipeline', status: 'merged' },
      milestones: [
        { percentage: 40, name: 'Pipeline Configuration', completed: true },
        { percentage: 70, name: 'Staging Deployment', completed: true },
        { percentage: 100, name: 'Production Setup', completed: true }
      ]
    },
    // Completed Setup Tasks
    {
      id: '1.1',
      title: 'Development Environment Setup',
      description: 'Project initialization with development tools and team collaboration setup',
      type: 'task',
      duration: '2 days',
      status: 'DONE',
      team: 'integration',
      assignee: 'Team Lead - All Teams',
      priority: 'high',
      labels: ['setup', 'environment', 'collaboration'],
      phase: 'Project Setup & Planning',
      estimatedHours: 16,
      timeSpent: 16,
      progress: 100,
      technologies: ['Git', 'VS Code', 'Node.js', 'Docker'],
      skillsRequired: [
        { name: 'Development Tools', level: 'intermediate' },
        { name: 'Git Workflow', level: 'intermediate' },
        { name: 'Project Management', level: 'basic' }
      ],
      learningOutcomes: 'Understanding professional development environment setup and team collaboration tools',
      assessmentCriteria: { points: 10, category: 'Project Management' },
      dueDate: '2024-11-15',
      createdDate: '2024-11-10',
      gitIntegration: { branch: 'main', status: 'merged' },
      milestones: [
        { percentage: 50, name: 'Tool Installation', completed: true },
        { percentage: 80, name: 'Team Setup', completed: true },
        { percentage: 100, name: 'Documentation', completed: true }
      ]
    },
    {
      id: '1.2',
      title: 'Project Structure Creation',
      description: 'Create folder structure, initialize repositories',
      type: 'task',
      duration: '1 day',
      status: 'completed',
      assignee: 'All Members',
      priority: 'medium',
      labels: ['setup', 'architecture'],
      phase: 'Project Setup & Planning',
      estimatedHours: 8,
      progress: 100,
      completedDate: '2024-11-21',
      createdDate: '2024-11-19'
    },
    {
      id: '2.1',
      title: 'Database Design & Setup',
      description: 'Design MongoDB schemas, set up collections',
      type: 'task',
      duration: '3 days',
      status: 'completed',
      assignee: 'Backend Developer',
      priority: 'critical',
      labels: ['backend', 'database', 'schema'],
      phase: 'Backend Development',
      estimatedHours: 24,
      progress: 100,
      completedDate: '2024-11-27',
      createdDate: '2024-11-22'
    }
  ]);

  // Legacy WBS data structure (kept for reference)
  const legacyWbsData = [
    {
      id: '1',
      title: 'Project Setup & Planning',
      description: 'Initial project setup, environment configuration, and team planning',
      type: 'phase',
      duration: '1 week',
      dependencies: [],
      status: 'completed',
      completion: 100,
      children: [
        {
          id: '1.1',
          title: 'Development Environment Setup',
          description: 'Install Node.js, MongoDB, configure IDE',
          type: 'task',
          duration: '2 days',
          status: 'completed',
          assignee: 'Team Lead',
          completion: 100
        },
        {
          id: '1.2',
          title: 'Project Structure Creation',
          description: 'Create folder structure, initialize repositories',
          type: 'task',
          duration: '1 day',
          status: 'completed',
          assignee: 'All Members',
          completion: 100
        },
        {
          id: '1.3',
          title: 'Team Role Assignment',
          description: 'Define roles and responsibilities for each team member',
          type: 'milestone',
          duration: '0.5 days',
          status: 'completed',
          completion: 100
        }
      ]
    },
    {
      id: '2',
      title: 'Backend Development',
      description: 'Server-side implementation including API, authentication, and database',
      type: 'phase',
      duration: '3-4 weeks',
      dependencies: ['1'],
      status: 'in_progress',
      completion: 65,
      children: [
        {
          id: '2.1',
          title: 'Database Design & Setup',
          description: 'Design MongoDB schemas, set up collections',
          type: 'task',
          duration: '3 days',
          status: 'completed',
          assignee: 'Backend Developer',
          completion: 100
        },
        {
          id: '2.2',
          title: 'User Authentication API',
          description: 'Implement JWT-based authentication system',
          type: 'task',
          duration: '5 days',
          status: 'completed',
          assignee: 'Backend Developer',
          completion: 100
        },
        {
          id: '2.3',
          title: 'Product Management API',
          description: 'CRUD operations for product catalog',
          type: 'task',
          duration: '4 days',
          status: 'in_progress',
          assignee: 'Backend Developer',
          completion: 75
        },
        {
          id: '2.4',
          title: 'Shopping Cart API',
          description: 'Cart management and session handling',
          type: 'task',
          duration: '3 days',
          status: 'pending',
          assignee: 'Backend Developer',
          completion: 0
        },
        {
          id: '2.5',
          title: 'Payment Integration',
          description: 'Integrate Stripe/PayPal payment gateway',
          type: 'milestone',
          duration: '5 days',
          status: 'pending',
          assignee: 'Backend Developer',
          completion: 0
        }
      ]
    },
    {
      id: '3',
      title: 'Frontend Development',
      description: 'User interface implementation using React',
      type: 'phase',
      duration: '3-4 weeks',
      dependencies: ['1'],
      status: 'in_progress',
      completion: 45,
      children: [
        {
          id: '3.1',
          title: 'Component Architecture',
          description: 'Design and implement reusable React components',
          type: 'task',
          duration: '4 days',
          status: 'completed',
          assignee: 'Frontend Developer',
          completion: 100
        },
        {
          id: '3.2',
          title: 'User Authentication UI',
          description: 'Login, register, and profile management pages',
          type: 'task',
          duration: '3 days',
          status: 'completed',
          assignee: 'Frontend Developer',
          completion: 100
        },
        {
          id: '3.3',
          title: 'Product Catalog Interface',
          description: 'Product listing, search, and detail pages',
          type: 'task',
          duration: '5 days',
          status: 'in_progress',
          assignee: 'Frontend Developer',
          completion: 60
        },
        {
          id: '3.4',
          title: 'Shopping Cart Interface',
          description: 'Cart management and checkout flow',
          type: 'task',
          duration: '4 days',
          status: 'pending',
          assignee: 'Frontend Developer',
          completion: 0
        }
      ]
    },
    {
      id: '4',
      title: 'Testing & Deployment',
      description: 'Quality assurance and production deployment',
      type: 'phase',
      duration: '1-2 weeks',
      dependencies: ['2', '3'],
      status: 'pending',
      completion: 0,
      children: [
        {
          id: '4.1',
          title: 'Unit Testing',
          description: 'Write and execute unit tests for all components',
          type: 'task',
          duration: '3 days',
          status: 'pending',
          assignee: 'QA/Developer',
          completion: 0
        },
        {
          id: '4.2',
          title: 'Integration Testing',
          description: 'Test API integration and end-to-end flows',
          type: 'task',
          duration: '2 days',
          status: 'pending',
          assignee: 'QA/Developer',
          completion: 0
        },
        {
          id: '4.3',
          title: 'Production Deployment',
          description: 'Deploy to cloud platform and configure CI/CD',
          type: 'milestone',
          duration: '2 days',
          status: 'pending',
          assignee: 'DevOps/Team Lead',
          completion: 0
        }
      ]
    }
  ];

  // Mock classes data for assignment
  const availableClasses = [
    {
      id: 'CS301-2024',
      name: 'Advanced Web Development',
      semester: 'Fall 2024',
      students: 45,
      instructor: 'Dr. Sarah Johnson',
      schedule: 'MWF 10:00-11:00 AM',
      isAssigned: true
    },
    {
      id: 'CS401-2024',
      name: 'Software Engineering',
      semester: 'Fall 2024',
      students: 38,
      instructor: 'Prof. Michael Chen',
      schedule: 'TTh 2:00-3:30 PM',
      isAssigned: false
    },
    {
      id: 'CS302-2024',
      name: 'Full-Stack Development',
      semester: 'Fall 2024',
      students: 42,
      instructor: 'Dr. Emily Rodriguez',
      schedule: 'MWF 1:00-2:00 PM',
      isAssigned: false
    },
    {
      id: 'CS501-2024',
      name: 'Advanced Topics in Web Tech',
      semester: 'Fall 2024',
      students: 31,
      instructor: 'Dr. Sarah Johnson',
      schedule: 'TTh 10:00-11:30 AM',
      isAssigned: true
    }
  ];





  useEffect(() => {
    const editing = location.pathname.endsWith('/edit');
    if (editing) {
      setEditForm(mapProjectToForm(projectData));
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [location.pathname, projectData]);

  const closeEditPanel = () => {
    navigate(`/lecturer/projects/${projectId}`, { replace: true });
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSave = (event) => {
    event.preventDefault();
    if (!editForm || isSavingEdit) return;
    setIsSavingEdit(true);
    setTimeout(() => {
      setProjectData((prev) => mergeFormIntoProject(prev, editForm));
      setIsSavingEdit(false);
      setEditMessage('Project details updated for your latest submission.');
      closeEditPanel();
      setTimeout(() => {
        setEditMessage('');
      }, 3600);
    }, 700);
  };

  const handleAnalyze = () => {
    navigate(`/lecturer/projects/${projectId}/analysis`);
  };

  const handleAssignToClasses = async () => {
    setIsAssigning(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAssigning(false);
    // Show success message or update UI
  };

  const toggleWbsItem = (itemId) => {
    const newExpanded = new Set(expandedWbsItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedWbsItems(newExpanded);
  };

  const toggleClassSelection = (classId) => {
    const newSelection = new Set(selectedClasses);
    if (newSelection.has(classId)) {
      newSelection.delete(classId);
    } else {
      newSelection.add(classId);
    }
    setSelectedClasses(newSelection);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };



  const renderWbsHierarchy = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`${styles.wbsItem} ${styles[`level${level}`]}`}>
        <div className={styles.wbsItemHeader}>
          <div className={styles.wbsItemLeft}>
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => toggleWbsItem(item.id)}
                className={styles.expandButton}
              >
                {expandedWbsItems.has(item.id) ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            )}
            <div className={styles.wbsItemIcon}>
              {getStatusIcon(item.status)}
            </div>
            <div className={styles.wbsItemInfo}>
              <h4 className={styles.wbsItemTitle}>{item.title}</h4>
              <p className={styles.wbsItemDescription}>{item.description}</p>
              <div className={styles.wbsItemMeta}>
                <span className={styles.wbsItemType}>{item.type}</span>
                <span className={styles.wbsItemDuration}>{item.duration}</span>
                {item.assignee && (
                  <span className={styles.wbsItemAssignee}>Assigned to: {item.assignee}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.wbsItemRight}>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${item.completion}%` }}
                />
              </div>
              <span className={styles.progressText}>{item.completion}%</span>
            </div>
          </div>
        </div>
        {item.children && item.children.length > 0 && expandedWbsItems.has(item.id) && (
          <div className={styles.wbsChildren}>
            {renderWbsHierarchy(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'wbs', name: 'Work Breakdown', icon: ListBulletIcon },
    { id: 'assignment', name: 'Class Assignment', icon: AcademicCapIcon },
    { id: 'resources', name: 'Resources', icon: BookOpenIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  return (
    <DashboardLayout>
      {isEditing && editForm && (
        <div className={styles.editOverlay}>
          <div className={styles.editPanel}>
            <header className={styles.editHeader}>
              <div>
                <h2>Edit project blueprint</h2>
                <p>Refresh the project brief before resubmitting for approval.</p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeEditPanel}
                aria-label="Close edit form"
              >
                ×
              </button>
            </header>
            <form className={styles.editForm} onSubmit={handleEditSave}>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  <span>Project title</span>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(event) => handleEditFieldChange('title', event.target.value)}
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Category</span>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(event) => handleEditFieldChange('category', event.target.value)}
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Difficulty</span>
                  <select
                    value={editForm.difficulty}
                    onChange={(event) => handleEditFieldChange('difficulty', event.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
                <label className={styles.formField}>
                  <span>Estimated duration</span>
                  <input
                    type="text"
                    value={editForm.estimatedDuration}
                    onChange={(event) => handleEditFieldChange('estimatedDuration', event.target.value)}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Minimum team size</span>
                  <input
                    type="number"
                    min="1"
                    value={editForm.minTeamSize}
                    onChange={(event) => handleEditFieldChange('minTeamSize', event.target.value)}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Maximum team size</span>
                  <input
                    type="number"
                    min="1"
                    value={editForm.maxTeamSize}
                    onChange={(event) => handleEditFieldChange('maxTeamSize', event.target.value)}
                  />
                </label>
              </div>
              <label className={styles.formField}>
                <span>Executive summary</span>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(event) => handleEditFieldChange('description', event.target.value)}
                />
              </label>
              <div className={styles.dualFieldRow}>
                <label className={styles.formField}>
                  <span>Primary tags</span>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(event) => handleEditFieldChange('tags', event.target.value)}
                    placeholder="React, AI, API"
                  />
                  <small>Separate tags with commas.</small>
                </label>
                <label className={styles.formField}>
                  <span>Required skill set</span>
                  <input
                    type="text"
                    value={editForm.skillsRequired}
                    onChange={(event) => handleEditFieldChange('skillsRequired', event.target.value)}
                    placeholder="JavaScript, UX, Testing"
                  />
                  <small>Separate skills with commas.</small>
                </label>
              </div>
              <div className={styles.dualFieldRow}>
                <label className={styles.formField}>
                  <span>Learning outcomes</span>
                  <textarea
                    rows={4}
                    value={editForm.learningOutcomes}
                    onChange={(event) => handleEditFieldChange('learningOutcomes', event.target.value)}
                    placeholder="One outcome per line"
                  />
                </label>
                <label className={styles.formField}>
                  <span>Pre-requisites</span>
                  <textarea
                    rows={4}
                    value={editForm.prerequisites}
                    onChange={(event) => handleEditFieldChange('prerequisites', event.target.value)}
                    placeholder="One prerequisite per line"
                  />
                </label>
              </div>
              <footer className={styles.editFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={closeEditPanel}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isSavingEdit}>
                  {isSavingEdit ? 'Saving...' : 'Save updates'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
      {editMessage && (
        <div className={styles.updateToast}>{editMessage}</div>
      )}
      <div className={styles.projectDetail}>
        {/* Header */}
        <ProjectHeader projectId={projectId} projectData={projectData} />

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <div className={styles.tabList}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              <div className={styles.overviewGrid}>
                {/* Project Stats */}
                <div className={styles.statsCard}>
                  <h3 className={styles.cardTitle}>Project Statistics</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{projectData.totalStudents}</div>
                      <div className={styles.statLabel}>Total Students</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{projectData.activeTeams}</div>
                      <div className={styles.statLabel}>Active Teams</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{projectData.completedTeams}</div>
                      <div className={styles.statLabel}>Completed</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statValue}>{projectData.averageScore}%</div>
                      <div className={styles.statLabel}>Avg Score</div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className={styles.detailsCard}>
                  <h3 className={styles.cardTitle}>Project Details</h3>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span className={styles.detailValue}>{projectData.estimatedDuration}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Team Size:</span>
                      <span className={styles.detailValue}>{projectData.minTeamSize}-{projectData.maxTeamSize} members</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Created By:</span>
                      <span className={styles.detailValue}>{projectData.createdBy}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Version:</span>
                      <span className={styles.detailValue}>{projectData.version}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Last Modified:</span>
                      <span className={styles.detailValue}>{new Date(projectData.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Syllabus Alignment:</span>
                      <span className={styles.detailValue}>
                        <span className={styles.alignmentScore}>{projectData.syllabusAlignment}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills & Tags */}
                <div className={styles.skillsCard}>
                  <h3 className={styles.cardTitle}>Required Skills</h3>
                  <div className={styles.skillsList}>
                    {projectData.skillsRequired.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                  
                  <h3 className={styles.cardTitle}>Tags</h3>
                  <div className={styles.tagsList}>
                    {projectData.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className={styles.outcomesCard}>
                  <h3 className={styles.cardTitle}>Learning Outcomes</h3>
                  <ul className={styles.outcomesList}>
                    {projectData.learningOutcomes.map((outcome, index) => (
                      <li key={index} className={styles.outcomeItem}>
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prerequisites */}
                <div className={styles.prerequisitesCard}>
                  <h3 className={styles.cardTitle}>Prerequisites</h3>
                  <ul className={styles.prerequisitesList}>
                    {projectData.prerequisites.map((prereq, index) => (
                      <li key={index} className={styles.prerequisiteItem}>
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wbs' && (
            <div className={styles.wbsTab}>
              <div className={styles.wbsHeader}>
                <h3 className={styles.wbsTitle}>Work Breakdown Structure</h3>
                <div className={styles.wbsControls}>
                  <div className={styles.viewModeToggle}>
                    <button
                      onClick={() => setWbsViewMode('wbs')}
                      className={`${styles.viewModeBtn} ${wbsViewMode === 'wbs' ? styles.active : ''}`}
                    >
                      <ChartBarIcon className="w-4 h-4" />
                      WBS
                    </button>
                    <button
                      onClick={() => setWbsViewMode('timeline')}
                      className={`${styles.viewModeBtn} ${wbsViewMode === 'timeline' ? styles.active : ''}`}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Timeline
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.wbsContent}>
                {wbsViewMode === 'wbs' ? (
                  <WorkBreakdownStructure />
                ) : (
                  <TimelineView kanbanTasks={kanbanTasks} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className={styles.assignmentTab}>
              <div className={styles.assignmentHeader}>
                <h3 className={styles.assignmentTitle}>Class Assignment</h3>
                <p className={styles.assignmentDescription}>
                  Assign this project to one or more classes. Students in assigned classes will be able to form teams and work on this project.
                </p>
              </div>

              <div className={styles.assignmentContent}>
                <div className={styles.classSelectionCard}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>Available Classes</h4>
                    <div className={styles.selectionSummary}>
                      {selectedClasses.size > 0 && (
                        <span className={styles.selectedCount}>
                          {selectedClasses.size} class{selectedClasses.size !== 1 ? 'es' : ''} selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.classesList}>
                    {availableClasses.map((classItem) => (
                      <div key={classItem.id} className={styles.classItem}>
                        <div className={styles.classLeft}>
                          <input
                            type="checkbox"
                            checked={selectedClasses.has(classItem.id) || classItem.isAssigned}
                            onChange={() => !classItem.isAssigned && toggleClassSelection(classItem.id)}
                            disabled={classItem.isAssigned}
                            className={styles.classCheckbox}
                          />
                          <div className={styles.classInfo}>
                            <h5 className={styles.className}>{classItem.name}</h5>
                            <p className={styles.classDetails}>
                              {classItem.semester} • {classItem.instructor}
                            </p>
                            <p className={styles.classSchedule}>
                              {classItem.schedule} • {classItem.students} students
                            </p>
                          </div>
                        </div>
                        <div className={styles.classRight}>
                          {classItem.isAssigned ? (
                            <span className={styles.assignedBadge}>
                              <CheckCircleIconSolid className="w-4 h-4" />
                              Assigned
                            </span>
                          ) : (
                            <span className={styles.availableBadge}>Available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedClasses.size > 0 && (
                    <div className={styles.assignmentActions}>
                      <button
                        onClick={handleAssignToClasses}
                        disabled={isAssigning}
                        className={styles.assignButton}
                      >
                        {isAssigning ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-4 h-4" />
                            Assign to Selected Classes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.assignmentSettings}>
                  <h4 className={styles.cardTitle}>Assignment Settings</h4>
                  <div className={styles.settingsList}>
                    <div className={styles.settingItem}>
                      <label className={styles.settingLabel}>
                        <input type="checkbox" defaultChecked className={styles.settingCheckbox} />
                        Allow students to form their own teams
                      </label>
                    </div>
                    <div className={styles.settingItem}>
                      <label className={styles.settingLabel}>
                        <input type="checkbox" defaultChecked className={styles.settingCheckbox} />
                        Enable peer evaluation
                      </label>
                    </div>
                    <div className={styles.settingItem}>
                      <label className={styles.settingLabel}>
                        <input type="checkbox" className={styles.settingCheckbox} />
                        Require instructor approval for team formation
                      </label>
                    </div>
                    <div className={styles.settingItem}>
                      <label className={styles.settingLabel}>
                        <input type="checkbox" defaultChecked className={styles.settingCheckbox} />
                        Send notification to students when assigned
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles.resourcesTab}>
              <div className={styles.resourcesHeader}>
                <h3 className={styles.resourcesTitle}>Project Resources</h3>
                <button className={styles.addResourceButton}>
                  <PlusIcon className="w-4 h-4" />
                  Add Resource
                </button>
              </div>

              <div className={styles.resourcesList}>
                {projectData.resources.map((resource, index) => (
                  <div key={index} className={styles.resourceItem}>
                    <div className={styles.resourceIcon}>
                      {resource.type === 'document' && <BookOpenIcon className="w-5 h-5" />}
                      {resource.type === 'video' && <PlayIcon className="w-5 h-5" />}
                      {resource.type === 'template' && <DocumentDuplicateIcon className="w-5 h-5" />}
                    </div>
                    <div className={styles.resourceInfo}>
                      <h4 className={styles.resourceName}>{resource.name}</h4>
                      <p className={styles.resourceMeta}>
                        {resource.size && <span>{resource.size}</span>}
                        {resource.duration && <span>{resource.duration}</span>}
                        {resource.url && <span>External Link</span>}
                      </p>
                    </div>
                    <div className={styles.resourceActions}>
                      <button className={styles.resourceActionButton}>
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className={styles.resourceActionButton}>
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className={styles.resourceActionButton}>
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className={styles.analyticsTab}>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h3 className={styles.cardTitle}>Performance Overview</h3>
                  <div className={styles.performanceStats}>
                    <div className={styles.performanceStat}>
                      <div className={styles.statValue}>87.3%</div>
                      <div className={styles.statLabel}>Average Score</div>
                    </div>
                    <div className={styles.performanceStat}>
                      <div className={styles.statValue}>94%</div>
                      <div className={styles.statLabel}>Completion Rate</div>
                    </div>
                    <div className={styles.performanceStat}>
                      <div className={styles.statValue}>4.2/5</div>
                      <div className={styles.statLabel}>Student Rating</div>
                    </div>
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h3 className={styles.cardTitle}>Usage Statistics</h3>
                  <div className={styles.usageChart}>
                    <div className={styles.chartPlaceholder}>
                      <ChartBarIcon className="w-12 h-12 text-gray-300" />
                      <p className={styles.chartNote}>Detailed analytics charts would be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;