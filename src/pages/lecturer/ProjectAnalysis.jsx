import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ProjectAnalysis.module.css';
import {
  DocumentTextIcon,
  SparklesIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CpuChipIcon,
  BookOpenIcon,
  BoltIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  CloudArrowDownIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BeakerIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const ProjectAnalysis = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisProgress, setAnalysisProgress] = useState(100); // Simulated completed analysis
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'document', 'analysis'

  // Mock data for AI analysis results
  const projectData = {
    id: projectId,
    title: 'E-commerce Platform Development',
    description: 'Build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.',
    originalDocument: {
      name: 'ecommerce-requirements.pdf',
      size: '2.4 MB',
      pages: 15,
      uploadDate: '2024-11-20T10:30:00Z',
      type: 'application/pdf'
    },
    aiAnalysis: {
      status: 'completed',
      processedAt: '2024-11-20T10:45:00Z',
      processingTime: '15 minutes',
      confidence: 94,
      syllabusAlignment: 92,
      curriculumCoverage: 87,
      complexityScore: 8.5,
      estimatedDuration: '10-12 weeks',
      recommendedTeamSize: '4-5 members'
    }
  };

  // Comprehensive syllabus alignment analysis
  const syllabusAlignment = {
    overallScore: 92,
    breakdown: [
      {
        category: 'Learning Objectives',
        score: 95,
        status: 'excellent',
        coverage: [
          { objective: 'Full-stack web development', covered: true, confidence: 98 },
          { objective: 'Database design and management', covered: true, confidence: 94 },
          { objective: 'API development and integration', covered: true, confidence: 96 },
          { objective: 'User interface design', covered: true, confidence: 92 },
          { objective: 'Security implementation', covered: true, confidence: 89 }
        ]
      },
      {
        category: 'Technical Skills',
        score: 94,
        status: 'excellent',
        coverage: [
          { objective: 'React.js development', covered: true, confidence: 97 },
          { objective: 'Node.js backend development', covered: true, confidence: 95 },
          { objective: 'Database management (MongoDB)', covered: true, confidence: 93 },
          { objective: 'RESTful API design', covered: true, confidence: 96 },
          { objective: 'Authentication systems', covered: true, confidence: 91 }
        ]
      },
      {
        category: 'Soft Skills',
        score: 85,
        status: 'good',
        coverage: [
          { objective: 'Team collaboration', covered: true, confidence: 88 },
          { objective: 'Project management', covered: true, confidence: 82 },
          { objective: 'Problem-solving', covered: true, confidence: 90 },
          { objective: 'Communication skills', covered: false, confidence: 0 },
          { objective: 'Time management', covered: true, confidence: 79 }
        ]
      },
      {
        category: 'Assessment Criteria',
        score: 88,
        status: 'good',
        coverage: [
          { objective: 'Code quality and structure', covered: true, confidence: 92 },
          { objective: 'Feature completeness', covered: true, confidence: 95 },
          { objective: 'Testing implementation', covered: true, confidence: 86 },
          { objective: 'Documentation quality', covered: true, confidence: 81 },
          { objective: 'Presentation skills', covered: false, confidence: 0 }
        ]
      }
    ],
    gaps: [
      {
        type: 'missing',
        category: 'Soft Skills',
        item: 'Communication skills',
        impact: 'medium',
        recommendation: 'Add presentation requirements and peer review sessions'
      },
      {
        type: 'missing',
        category: 'Assessment Criteria',
        item: 'Presentation skills',
        impact: 'medium',
        recommendation: 'Include final project presentation component'
      },
      {
        type: 'partial',
        category: 'Technical Skills',
        item: 'Advanced security practices',
        impact: 'low',
        recommendation: 'Consider adding OAuth 2.0 and JWT token management'
      }
    ]
  };

  // Learning outcome coverage analysis
  const learningOutcomes = {
    totalOutcomes: 28,
    coveredOutcomes: 24,
    partialCoverage: 3,
    notCovered: 1,
    coverageScore: 87,
    outcomes: [
      {
        id: 1,
        title: 'Design and implement full-stack web applications',
        status: 'covered',
        confidence: 96,
        evidence: ['Frontend React components', 'Backend API endpoints', 'Database integration'],
        mappedRequirements: ['User authentication system', 'Product catalog management', 'Shopping cart functionality']
      },
      {
        id: 2,
        title: 'Apply software engineering best practices',
        status: 'covered',
        confidence: 91,
        evidence: ['Code structure requirements', 'Testing specifications', 'Documentation standards'],
        mappedRequirements: ['Clean code architecture', 'Unit testing implementation', 'API documentation']
      },
      {
        id: 3,
        title: 'Implement secure authentication and authorization',
        status: 'covered',
        confidence: 89,
        evidence: ['User registration system', 'Login functionality', 'Protected routes'],
        mappedRequirements: ['JWT token management', 'Password encryption', 'Role-based access control']
      },
      {
        id: 4,
        title: 'Design and optimize database systems',
        status: 'covered',
        confidence: 94,
        evidence: ['MongoDB schema design', 'Query optimization', 'Data relationships'],
        mappedRequirements: ['Product database structure', 'User data management', 'Order tracking system']
      },
      {
        id: 5,
        title: 'Integrate third-party APIs and services',
        status: 'partial',
        confidence: 73,
        evidence: ['Payment gateway integration'],
        mappedRequirements: ['Stripe payment processing'],
        gaps: ['Social media APIs', 'Email service integration']
      },
      {
        id: 6,
        title: 'Demonstrate effective teamwork and communication',
        status: 'not_covered',
        confidence: 0,
        evidence: [],
        mappedRequirements: [],
        gaps: ['Team presentation component', 'Peer review process', 'Communication documentation']
      }
    ]
  };

  // Technology stack recommendations
  const technologyStack = {
    score: 91,
    compatibility: 'excellent',
    recommendations: [
      {
        category: 'Frontend',
        required: ['React.js', 'HTML5', 'CSS3', 'JavaScript ES6+'],
        recommended: ['Redux/Context API', 'Material-UI or Bootstrap', 'Axios for API calls'],
        advanced: ['React Router', 'Form validation libraries', 'State management'],
        validation: {
          curriculumAlignment: 95,
          industryRelevance: 97,
          learningCurve: 'moderate'
        }
      },
      {
        category: 'Backend',
        required: ['Node.js', 'Express.js', 'RESTful APIs'],
        recommended: ['MongoDB/Mongoose', 'JWT authentication', 'bcrypt for password hashing'],
        advanced: ['Middleware implementation', 'Error handling', 'API rate limiting'],
        validation: {
          curriculumAlignment: 92,
          industryRelevance: 94,
          learningCurve: 'moderate'
        }
      },
      {
        category: 'Database',
        required: ['MongoDB', 'Database design principles'],
        recommended: ['Mongoose ODM', 'Database indexing', 'Query optimization'],
        advanced: ['Aggregation pipelines', 'Database transactions', 'Backup strategies'],
        validation: {
          curriculumAlignment: 89,
          industryRelevance: 92,
          learningCurve: 'easy'
        }
      },
      {
        category: 'DevOps & Tools',
        required: ['Git version control', 'NPM/Yarn'],
        recommended: ['Docker containerization', 'CI/CD pipelines', 'Testing frameworks'],
        advanced: ['Kubernetes deployment', 'Monitoring tools', 'Performance optimization'],
        validation: {
          curriculumAlignment: 86,
          industryRelevance: 98,
          learningCurve: 'challenging'
        }
      }
    ],
    alternatives: [
      {
        stack: 'MEAN Stack Alternative',
        technologies: ['Angular', 'Node.js', 'Express.js', 'MongoDB'],
        pros: ['Strong TypeScript support', 'Enterprise-grade framework'],
        cons: ['Steeper learning curve', 'More complex setup'],
        alignmentScore: 88
      },
      {
        stack: 'Laravel PHP Alternative',
        technologies: ['Laravel', 'MySQL', 'Vue.js', 'PHP'],
        pros: ['Rapid development', 'Built-in authentication'],
        cons: ['Different programming language', 'Less modern stack'],
        alignmentScore: 76
      }
    ]
  };

  // Enhanced milestone generation with competency progression
  const milestones = [
    {
      id: 1,
      title: 'Project Setup & Architecture',
      duration: '1-2 weeks',
      competencyLevel: 'foundation',
      objectives: [
        'Set up development environment',
        'Initialize project structure',
        'Configure version control',
        'Design system architecture'
      ],
      deliverables: [
        'Project repository setup',
        'Development environment documentation',
        'System architecture diagram',
        'Technology stack selection'
      ],
      assessmentCriteria: [
        'Proper project structure organization',
        'Clear documentation quality',
        'Architecture design decisions',
        'Team collaboration setup'
      ],
      competencyProgression: {
        technical: ['Environment setup', 'Git workflow', 'Project organization'],
        soft: ['Team formation', 'Communication protocols', 'Planning skills']
      },
      prerequisites: [],
      riskFactors: ['Team coordination', 'Technology familiarity'],
      aiRecommendations: [
        'Provide architecture templates',
        'Include setup automation scripts',
        'Create collaboration guidelines'
      ]
    },
    {
      id: 2,
      title: 'Frontend Foundation',
      duration: '2-3 weeks',
      competencyLevel: 'developing',
      objectives: [
        'Implement React component structure',
        'Create responsive UI layouts',
        'Integrate state management',
        'Implement navigation system'
      ],
      deliverables: [
        'React application structure',
        'Responsive UI components',
        'Navigation and routing',
        'Basic state management'
      ],
      assessmentCriteria: [
        'Component reusability and structure',
        'Responsive design implementation',
        'State management effectiveness',
        'Code quality and organization'
      ],
      competencyProgression: {
        technical: ['React development', 'CSS/styling', 'State management', 'Component design'],
        soft: ['Problem-solving', 'Attention to detail', 'Code review participation']
      },
      prerequisites: ['Project Setup & Architecture'],
      riskFactors: ['React learning curve', 'Design complexity'],
      aiRecommendations: [
        'Provide React component templates',
        'Include styling best practices',
        'Create reusable component library'
      ]
    },
    {
      id: 3,
      title: 'Backend API Development',
      duration: '2-3 weeks',
      competencyLevel: 'developing',
      objectives: [
        'Design and implement RESTful APIs',
        'Set up database models and connections',
        'Implement authentication middleware',
        'Create data validation systems'
      ],
      deliverables: [
        'RESTful API endpoints',
        'Database schema and models',
        'Authentication system',
        'API documentation'
      ],
      assessmentCriteria: [
        'API design and RESTful principles',
        'Database schema optimization',
        'Security implementation quality',
        'Documentation completeness'
      ],
      competencyProgression: {
        technical: ['Node.js development', 'API design', 'Database modeling', 'Security practices'],
        soft: ['Systematic thinking', 'Documentation skills', 'Quality assurance']
      },
      prerequisites: ['Project Setup & Architecture'],
      riskFactors: ['Database design complexity', 'Security implementation'],
      aiRecommendations: [
        'Provide API design patterns',
        'Include security checklists',
        'Create database schema templates'
      ]
    },
    {
      id: 4,
      title: 'Frontend-Backend Integration',
      duration: '2 weeks',
      competencyLevel: 'proficient',
      objectives: [
        'Connect frontend to backend APIs',
        'Implement data flow management',
        'Handle error states and loading',
        'Optimize API call efficiency'
      ],
      deliverables: [
        'Integrated frontend-backend communication',
        'Error handling implementation',
        'Loading states and user feedback',
        'API optimization documentation'
      ],
      assessmentCriteria: [
        'Integration quality and reliability',
        'Error handling completeness',
        'User experience during API calls',
        'Performance optimization'
      ],
      competencyProgression: {
        technical: ['API integration', 'Error handling', 'Performance optimization', 'Testing'],
        soft: ['Systems thinking', 'User empathy', 'Debugging skills']
      },
      prerequisites: ['Frontend Foundation', 'Backend API Development'],
      riskFactors: ['Integration complexity', 'Performance issues'],
      aiRecommendations: [
        'Provide integration patterns',
        'Include error handling examples',
        'Create performance testing guidelines'
      ]
    },
    {
      id: 5,
      title: 'Advanced Features & Security',
      duration: '2-3 weeks',
      competencyLevel: 'proficient',
      objectives: [
        'Implement payment processing',
        'Add advanced search and filtering',
        'Enhance security measures',
        'Implement admin functionality'
      ],
      deliverables: [
        'Payment gateway integration',
        'Advanced search functionality',
        'Security enhancements',
        'Admin panel implementation'
      ],
      assessmentCriteria: [
        'Payment system reliability and security',
        'Search functionality effectiveness',
        'Security measure comprehensiveness',
        'Admin interface usability'
      ],
      competencyProgression: {
        technical: ['Third-party integration', 'Advanced algorithms', 'Security protocols', 'Admin systems'],
        soft: ['Complex problem solving', 'Risk assessment', 'Quality assurance']
      },
      prerequisites: ['Frontend-Backend Integration'],
      riskFactors: ['Third-party service integration', 'Security vulnerabilities'],
      aiRecommendations: [
        'Provide security implementation guides',
        'Include payment integration tutorials',
        'Create security testing checklists'
      ]
    },
    {
      id: 6,
      title: 'Testing & Quality Assurance',
      duration: '1-2 weeks',
      competencyLevel: 'advanced',
      objectives: [
        'Implement comprehensive testing suite',
        'Perform security auditing',
        'Optimize application performance',
        'Prepare deployment documentation'
      ],
      deliverables: [
        'Unit and integration tests',
        'Security audit report',
        'Performance optimization report',
        'Deployment documentation'
      ],
      assessmentCriteria: [
        'Test coverage and quality',
        'Security audit thoroughness',
        'Performance improvements achieved',
        'Documentation clarity and completeness'
      ],
      competencyProgression: {
        technical: ['Testing methodologies', 'Security auditing', 'Performance tuning', 'Deployment practices'],
        soft: ['Quality mindset', 'Attention to detail', 'Process improvement']
      },
      prerequisites: ['Advanced Features & Security'],
      riskFactors: ['Testing complexity', 'Performance bottlenecks'],
      aiRecommendations: [
        'Provide testing framework guides',
        'Include performance optimization tips',
        'Create deployment checklists'
      ]
    }
  ];

  // Compliance checklist for academic standards
  const complianceChecklist = {
    overallScore: 89,
    categories: [
      {
        name: 'Learning Standards Compliance',
        score: 92,
        items: [
          { item: 'Aligned with course learning objectives', status: 'compliant', priority: 'high' },
          { item: 'Appropriate difficulty level for students', status: 'compliant', priority: 'high' },
          { item: 'Sufficient learning outcome coverage', status: 'compliant', priority: 'high' },
          { item: 'Progressive skill development', status: 'compliant', priority: 'medium' },
          { item: 'Industry-relevant technology stack', status: 'compliant', priority: 'medium' }
        ]
      },
      {
        name: 'Assessment Standards',
        score: 88,
        items: [
          { item: 'Clear assessment criteria defined', status: 'compliant', priority: 'high' },
          { item: 'Multiple assessment methods included', status: 'compliant', priority: 'high' },
          { item: 'Rubric alignment with objectives', status: 'compliant', priority: 'high' },
          { item: 'Peer evaluation components', status: 'partial', priority: 'medium' },
          { item: 'Self-reflection requirements', status: 'non_compliant', priority: 'low' }
        ]
      },
      {
        name: 'Accessibility & Inclusion',
        score: 85,
        items: [
          { item: 'Accessible to students with disabilities', status: 'compliant', priority: 'high' },
          { item: 'Multiple learning style accommodations', status: 'compliant', priority: 'medium' },
          { item: 'Cultural sensitivity considerations', status: 'compliant', priority: 'medium' },
          { item: 'Flexible timeline options', status: 'partial', priority: 'low' },
          { item: 'Resource accessibility', status: 'compliant', priority: 'medium' }
        ]
      },
      {
        name: 'Academic Integrity',
        score: 91,
        items: [
          { item: 'Plagiarism prevention measures', status: 'compliant', priority: 'high' },
          { item: 'Clear collaboration guidelines', status: 'compliant', priority: 'high' },
          { item: 'Citation requirements specified', status: 'compliant', priority: 'high' },
          { item: 'Code ownership documentation', status: 'compliant', priority: 'medium' },
          { item: 'Academic misconduct prevention', status: 'compliant', priority: 'high' }
        ]
      }
    ],
    recommendations: [
      {
        type: 'improvement',
        priority: 'medium',
        item: 'Add peer evaluation component',
        description: 'Include structured peer review sessions to enhance collaborative learning',
        impact: 'Improves teamwork skills and provides multiple feedback perspectives'
      },
      {
        type: 'addition',
        priority: 'low',
        item: 'Include self-reflection requirements',
        description: 'Add reflective writing components for deeper learning',
        impact: 'Enhances metacognitive skills and personal growth tracking'
      },
      {
        type: 'enhancement',
        priority: 'low',
        item: 'Flexible timeline options',
        description: 'Provide alternative milestone scheduling for diverse student needs',
        impact: 'Improves accessibility for students with varying circumstances'
      }
    ]
  };

  const handleReanalyze = () => {
    setIsProcessing(true);
    setAnalysisProgress(0);
    
    // Simulate AI processing
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleApproveProject = () => {
    navigate(`/lecturer/projects/${projectId}/assign`);
  };

  const handleEditProject = () => {
    navigate(`/lecturer/projects/${projectId}/edit`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'covered':
      case 'compliant':
        return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'not_covered':
      case 'non_compliant':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const renderOverviewTab = () => (
    <div className={styles.overviewContent}>
      {/* Analysis Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${getScoreBackground(projectData.aiAnalysis.syllabusAlignment)}`}>
          <div className={styles.summaryIcon}>
            <AcademicCapIcon className="w-6 h-6" />
          </div>
          <div className={styles.summaryContent}>
            <div className={`${styles.summaryValue} ${getScoreColor(projectData.aiAnalysis.syllabusAlignment)}`}>
              {projectData.aiAnalysis.syllabusAlignment}%
            </div>
            <div className={styles.summaryLabel}>Syllabus Alignment</div>
            <div className={styles.summaryDescription}>
              Excellent alignment with course objectives
            </div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${getScoreBackground(projectData.aiAnalysis.curriculumCoverage)}`}>
          <div className={styles.summaryIcon}>
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div className={styles.summaryContent}>
            <div className={`${styles.summaryValue} ${getScoreColor(projectData.aiAnalysis.curriculumCoverage)}`}>
              {projectData.aiAnalysis.curriculumCoverage}%
            </div>
            <div className={styles.summaryLabel}>Curriculum Coverage</div>
            <div className={styles.summaryDescription}>
              {learningOutcomes.coveredOutcomes}/{learningOutcomes.totalOutcomes} outcomes covered
            </div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${getScoreBackground(Math.round(projectData.aiAnalysis.complexityScore * 10))}`}>
          <div className={styles.summaryIcon}>
            <CpuChipIcon className="w-6 h-6" />
          </div>
          <div className={styles.summaryContent}>
            <div className={`${styles.summaryValue} ${getScoreColor(Math.round(projectData.aiAnalysis.complexityScore * 10))}`}>
              {projectData.aiAnalysis.complexityScore}/10
            </div>
            <div className={styles.summaryLabel}>Complexity Score</div>
            <div className={styles.summaryDescription}>
              {projectData.aiAnalysis.estimatedDuration} estimated
            </div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${getScoreBackground(projectData.aiAnalysis.confidence)}`}>
          <div className={styles.summaryIcon}>
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div className={styles.summaryContent}>
            <div className={`${styles.summaryValue} ${getScoreColor(projectData.aiAnalysis.confidence)}`}>
              {projectData.aiAnalysis.confidence}%
            </div>
            <div className={styles.summaryLabel}>Analysis Confidence</div>
            <div className={styles.summaryDescription}>
              High confidence analysis
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className={styles.insightsSection}>
        <h3 className={styles.sectionTitle}>
          <LightBulbIcon className="w-5 h-5" />
          Key Insights & Recommendations
        </h3>
        
        <div className={styles.insightsList}>
          <div className={styles.insightItem}>
            <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
            <div>
              <strong>Excellent Technical Alignment:</strong> The project perfectly matches course technical requirements with modern full-stack development practices.
            </div>
          </div>
          
          <div className={styles.insightItem}>
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            <div>
              <strong>Communication Skills Gap:</strong> Consider adding presentation components and peer review sessions to address soft skills development.
            </div>
          </div>
          
          <div className={styles.insightItem}>
            <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
            <div>
              <strong>Industry Relevance:</strong> Technology stack choices are highly relevant to current industry standards and job market demands.
            </div>
          </div>
          
          <div className={styles.insightItem}>
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            <div>
              <strong>Complexity Balance:</strong> Project complexity is well-balanced for the intended student level with appropriate progressive difficulty.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSyllabusTab = () => (
    <div className={styles.syllabusContent}>
      <div className={styles.alignmentHeader}>
        <div className={styles.alignmentScore}>
          <div className={`${styles.scoreCircle} ${getScoreBackground(syllabusAlignment.overallScore)}`}>
            <span className={`${styles.scoreValue} ${getScoreColor(syllabusAlignment.overallScore)}`}>
              {syllabusAlignment.overallScore}%
            </span>
          </div>
          <div>
            <h3>Overall Syllabus Alignment</h3>
            <p>Excellent alignment with course requirements</p>
          </div>
        </div>
      </div>

      <div className={styles.alignmentBreakdown}>
        {syllabusAlignment.breakdown.map((category, index) => (
          <div key={index} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>
                <h4>{category.category}</h4>
                <span className={`${styles.categoryScore} ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${category.score}%`,
                    backgroundColor: category.score >= 90 ? '#10b981' : 
                                   category.score >= 80 ? '#3b82f6' : 
                                   category.score >= 70 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
            
            <div className={styles.coverageList}>
              {category.coverage.map((item, idx) => (
                <div key={idx} className={styles.coverageItem}>
                  {getStatusIcon(item.covered ? 'covered' : 'not_covered')}
                  <span className={item.covered ? styles.coveredText : styles.notCoveredText}>
                    {item.objective}
                  </span>
                  <span className={styles.confidenceScore}>
                    {item.confidence}% confidence
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {syllabusAlignment.gaps.length > 0 && (
        <div className={styles.gapsSection}>
          <h3 className={styles.sectionTitle}>
            <ExclamationTriangleIcon className="w-5 h-5" />
            Identified Gaps & Recommendations
          </h3>
          
          <div className={styles.gapsList}>
            {syllabusAlignment.gaps.map((gap, index) => (
              <div key={index} className={styles.gapItem}>
                <div className={styles.gapHeader}>
                  <span className={`${styles.gapType} ${styles[gap.type]}`}>
                    {gap.type.toUpperCase()}
                  </span>
                  <span className={`${styles.gapImpact} ${styles[gap.impact]}`}>
                    {gap.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <div className={styles.gapContent}>
                  <div className={styles.gapTitle}>{gap.category}: {gap.item}</div>
                  <div className={styles.gapRecommendation}>{gap.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderOutcomesTab = () => (
    <div className={styles.outcomesContent}>
      <div className={styles.outcomesSummary}>
        <div className={styles.outcomesStats}>
          <div className={styles.outcomeStat}>
            <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            <div>
              <div className={styles.statValue}>{learningOutcomes.coveredOutcomes}</div>
              <div className={styles.statLabel}>Fully Covered</div>
            </div>
          </div>
          <div className={styles.outcomeStat}>
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            <div>
              <div className={styles.statValue}>{learningOutcomes.partialCoverage}</div>
              <div className={styles.statLabel}>Partial Coverage</div>
            </div>
          </div>
          <div className={styles.outcomeStat}>
            <XCircleIcon className="w-6 h-6 text-red-500" />
            <div>
              <div className={styles.statValue}>{learningOutcomes.notCovered}</div>
              <div className={styles.statLabel}>Not Covered</div>
            </div>
          </div>
          <div className={styles.outcomeStat}>
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            <div>
              <div className={styles.statValue}>{learningOutcomes.coverageScore}%</div>
              <div className={styles.statLabel}>Coverage Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.outcomesList}>
        {learningOutcomes.outcomes.map((outcome) => (
          <div key={outcome.id} className={styles.outcomeCard}>
            <div className={styles.outcomeHeader}>
              {getStatusIcon(outcome.status)}
              <div className={styles.outcomeTitle}>
                <h4>{outcome.title}</h4>
                <span className={`${styles.outcomeStatus} ${styles[outcome.status]}`}>
                  {outcome.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className={styles.confidenceScore}>
                {outcome.confidence}% confidence
              </div>
            </div>
            
            {outcome.evidence.length > 0 && (
              <div className={styles.evidenceSection}>
                <h5>Supporting Evidence:</h5>
                <ul className={styles.evidenceList}>
                  {outcome.evidence.map((evidence, idx) => (
                    <li key={idx}>{evidence}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {outcome.mappedRequirements.length > 0 && (
              <div className={styles.mappingSection}>
                <h5>Mapped Requirements:</h5>
                <div className={styles.requirementsList}>
                  {outcome.mappedRequirements.map((req, idx) => (
                    <span key={idx} className={styles.requirementTag}>{req}</span>
                  ))}
                </div>
              </div>
            )}
            
            {outcome.gaps && outcome.gaps.length > 0 && (
              <div className={styles.gapsSection}>
                <h5>Identified Gaps:</h5>
                <ul className={styles.gapsList}>
                  {outcome.gaps.map((gap, idx) => (
                    <li key={idx} className={styles.gapItem}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTechnologyTab = () => (
    <div className={styles.technologyContent}>
      <div className={styles.techHeader}>
        <div className={styles.techScore}>
          <div className={`${styles.scoreCircle} ${getScoreBackground(technologyStack.score)}`}>
            <span className={`${styles.scoreValue} ${getScoreColor(technologyStack.score)}`}>
              {technologyStack.score}%
            </span>
          </div>
          <div>
            <h3>Technology Stack Compatibility</h3>
            <p className={styles.compatibilityStatus}>
              <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
              {technologyStack.compatibility.charAt(0).toUpperCase() + technologyStack.compatibility.slice(1)} alignment
            </p>
          </div>
        </div>
      </div>

      <div className={styles.techCategories}>
        {technologyStack.recommendations.map((category, index) => (
          <div key={index} className={styles.techCategory}>
            <div className={styles.categoryHeader}>
              <h4>{category.category}</h4>
              <div className={styles.validationScores}>
                <span className={styles.validationItem}>
                  Curriculum: {category.validation.curriculumAlignment}%
                </span>
                <span className={styles.validationItem}>
                  Industry: {category.validation.industryRelevance}%
                </span>
                <span className={`${styles.learningCurve} ${styles[category.validation.learningCurve.replace(' ', '_')]}`}>
                  {category.validation.learningCurve} learning curve
                </span>
              </div>
            </div>
            
            <div className={styles.techLevels}>
              <div className={styles.techLevel}>
                <h5>Required Technologies</h5>
                <div className={styles.techList}>
                  {category.required.map((tech, idx) => (
                    <span key={idx} className={`${styles.techTag} ${styles.required}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.techLevel}>
                <h5>Recommended Technologies</h5>
                <div className={styles.techList}>
                  {category.recommended.map((tech, idx) => (
                    <span key={idx} className={`${styles.techTag} ${styles.recommended}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.techLevel}>
                <h5>Advanced Technologies</h5>
                <div className={styles.techList}>
                  {category.advanced.map((tech, idx) => (
                    <span key={idx} className={`${styles.techTag} ${styles.advanced}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {technologyStack.alternatives.length > 0 && (
        <div className={styles.alternativesSection}>
          <h3 className={styles.sectionTitle}>
            <BeakerIcon className="w-5 h-5" />
            Alternative Technology Stacks
          </h3>
          
          <div className={styles.alternativesList}>
            {technologyStack.alternatives.map((alt, index) => (
              <div key={index} className={styles.alternativeCard}>
                <div className={styles.altHeader}>
                  <h4>{alt.stack}</h4>
                  <span className={`${styles.alignmentScore} ${getScoreColor(alt.alignmentScore)}`}>
                    {alt.alignmentScore}% alignment
                  </span>
                </div>
                
                <div className={styles.altTech}>
                  {alt.technologies.map((tech, idx) => (
                    <span key={idx} className={styles.altTechTag}>{tech}</span>
                  ))}
                </div>
                
                <div className={styles.prosAndCons}>
                  <div className={styles.pros}>
                    <h5>Pros:</h5>
                    <ul>
                      {alt.pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.cons}>
                    <h5>Cons:</h5>
                    <ul>
                      {alt.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMilestonesTab = () => (
    <div className={styles.milestonesContent}>
      <div className={styles.milestonesHeader}>
        <h3>Enhanced Milestone Generation with Competency Progression</h3>
        <p>AI-generated milestones with detailed competency tracking and progressive skill development</p>
      </div>

      <div className={styles.milestonesTimeline}>
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className={styles.milestoneCard}>
            <div className={styles.milestoneHeader}>
              <div className={styles.milestoneNumber}>{milestone.id}</div>
              <div className={styles.milestoneTitle}>
                <h4>{milestone.title}</h4>
                <div className={styles.milestoneMeta}>
                  <span className={styles.duration}>
                    <ClockIcon className="w-4 h-4" />
                    {milestone.duration}
                  </span>
                  <span className={`${styles.competencyLevel} ${styles[milestone.competencyLevel]}`}>
                    {milestone.competencyLevel.charAt(0).toUpperCase() + milestone.competencyLevel.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.milestoneContent}>
              <div className={styles.objectivesSection}>
                <h5>Learning Objectives</h5>
                <ul className={styles.objectivesList}>
                  {milestone.objectives.map((objective, idx) => (
                    <li key={idx}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.deliverablesSection}>
                <h5>Key Deliverables</h5>
                <div className={styles.deliverablesList}>
                  {milestone.deliverables.map((deliverable, idx) => (
                    <span key={idx} className={styles.deliverableTag}>{deliverable}</span>
                  ))}
                </div>
              </div>

              <div className={styles.competencySection}>
                <h5>Competency Progression</h5>
                <div className={styles.competencyGrid}>
                  <div className={styles.competencyCategory}>
                    <h6>Technical Skills</h6>
                    <ul>
                      {milestone.competencyProgression.technical.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.competencyCategory}>
                    <h6>Soft Skills</h6>
                    <ul>
                      {milestone.competencyProgression.soft.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.assessmentSection}>
                <h5>Assessment Criteria</h5>
                <ul className={styles.assessmentList}>
                  {milestone.assessmentCriteria.map((criteria, idx) => (
                    <li key={idx}>{criteria}</li>
                  ))}
                </ul>
              </div>

              {milestone.riskFactors.length > 0 && (
                <div className={styles.riskSection}>
                  <h5>Risk Factors</h5>
                  <div className={styles.riskList}>
                    {milestone.riskFactors.map((risk, idx) => (
                      <span key={idx} className={styles.riskTag}>
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.aiRecommendationsSection}>
                <h5>AI Recommendations</h5>
                <ul className={styles.recommendationsList}>
                  {milestone.aiRecommendations.map((rec, idx) => (
                    <li key={idx}>
                      <SparklesIcon className="w-4 h-4" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {index < milestones.length - 1 && (
              <div className={styles.milestoneConnector}>
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className={styles.complianceContent}>
      <div className={styles.complianceHeader}>
        <div className={styles.complianceScore}>
          <div className={`${styles.scoreCircle} ${getScoreBackground(complianceChecklist.overallScore)}`}>
            <span className={`${styles.scoreValue} ${getScoreColor(complianceChecklist.overallScore)}`}>
              {complianceChecklist.overallScore}%
            </span>
          </div>
          <div>
            <h3>Academic Standards Compliance</h3>
            <p>Overall compliance with institutional academic standards</p>
          </div>
        </div>
      </div>

      <div className={styles.complianceCategories}>
        {complianceChecklist.categories.map((category, index) => (
          <div key={index} className={styles.complianceCategory}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>
                <ShieldCheckIcon className="w-5 h-5" />
                <h4>{category.name}</h4>
              </div>
              <span className={`${styles.categoryScore} ${getScoreColor(category.score)}`}>
                {category.score}%
              </span>
            </div>

            <div className={styles.complianceItems}>
              {category.items.map((item, idx) => (
                <div key={idx} className={styles.complianceItem}>
                  {getStatusIcon(item.status)}
                  <div className={styles.itemContent}>
                    <span className={styles.itemText}>{item.item}</span>
                    <span className={`${styles.priorityBadge} ${styles[item.priority]}`}>
                      {item.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {complianceChecklist.recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h3 className={styles.sectionTitle}>
            <RocketLaunchIcon className="w-5 h-5" />
            Compliance Recommendations
          </h3>
          
          <div className={styles.recommendationsList}>
            {complianceChecklist.recommendations.map((rec, index) => (
              <div key={index} className={styles.recommendationCard}>
                <div className={styles.recHeader}>
                  <span className={`${styles.recType} ${styles[rec.type]}`}>
                    {rec.type.toUpperCase()}
                  </span>
                  <span className={`${styles.recPriority} ${styles[rec.priority]}`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className={styles.recContent}>
                  <h4>{rec.item}</h4>
                  <p>{rec.description}</p>
                  <div className={styles.recImpact}>
                    <strong>Impact:</strong> {rec.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className={styles.projectAnalysis}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerNav}>
            <Link to="/lecturer/projects" className={styles.backButton}>
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Project Library
            </Link>
            <span className="text-gray-300">•</span>
            <span className="font-medium text-gray-600">AI Analysis</span>
          </div>
          
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              <SparklesIcon className="w-8 h-8 text-blue-500" />
              <div>
                <h1>AI Project Analysis Results</h1>
                <p>{projectData.title}</p>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                onClick={handleReanalyze}
                disabled={isProcessing}
                className={styles.reanalyzeBtn}
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Re-analyze
                  </>
                )}
              </button>
              
              <button 
                onClick={handleEditProject}
                className={styles.editBtn}
              >
                <PencilIcon className="w-5 h-5" />
                Edit Project
              </button>
              
              <button 
                onClick={handleApproveProject}
                className={styles.approveBtn}
              >
                <CheckBadgeIcon className="w-5 h-5" />
                Approve & Assign
              </button>
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                Analyzing project content... {analysisProgress}%
              </div>
            </div>
          )}
        </div>

        {/* View Mode Controls */}
        <div className={styles.viewControls}>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('split')}
              className={`${styles.viewBtn} ${viewMode === 'split' ? styles.active : ''}`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`${styles.viewBtn} ${viewMode === 'document' ? styles.active : ''}`}
            >
              Document Only
            </button>
            <button
              onClick={() => setViewMode('analysis')}
              className={`${styles.viewBtn} ${viewMode === 'analysis' ? styles.active : ''}`}
            >
              Analysis Only
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${styles.mainContent} ${styles[viewMode]}`}>
          {/* Document Preview Panel */}
          {(viewMode === 'split' || viewMode === 'document') && (
            <div className={styles.documentPanel}>
              <div className={styles.documentHeader}>
                <div className={styles.documentInfo}>
                  <DocumentTextIcon className="w-6 h-6" />
                  <div>
                    <h3>{projectData.originalDocument.name}</h3>
                    <p>{projectData.originalDocument.size} • {projectData.originalDocument.pages} pages</p>
                  </div>
                </div>
                <div className={styles.documentActions}>
                  <button className={styles.documentBtn}>
                    <EyeIcon className="w-4 h-4" />
                    View Full
                  </button>
                  <button className={styles.documentBtn}>
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className={styles.documentPreview}>
                <div className={styles.documentPlaceholder}>
                  <DocumentTextIcon className="w-16 h-16 text-gray-300" />
                  <p>Document preview would be displayed here</p>
                  <p className="text-sm text-gray-500">
                    PDF viewer integration with highlighting of analyzed sections
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Panel */}
          {(viewMode === 'split' || viewMode === 'analysis') && (
            <div className={styles.analysisPanel}>
              {/* Tabs */}
              <div className={styles.analysisTabs}>
                {[
                  { id: 'overview', label: 'Overview', icon: SparklesIcon },
                  { id: 'syllabus', label: 'Syllabus Alignment', icon: AcademicCapIcon },
                  { id: 'outcomes', label: 'Learning Outcomes', icon: BookOpenIcon },
                  { id: 'technology', label: 'Technology Stack', icon: CpuChipIcon },
                  { id: 'milestones', label: 'Milestones', icon: ClockIcon },
                  { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.analysisTab} ${activeTab === tab.id ? styles.active : ''}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'syllabus' && renderSyllabusTab()}
                {activeTab === 'outcomes' && renderOutcomesTab()}
                {activeTab === 'technology' && renderTechnologyTab()}
                {activeTab === 'milestones' && renderMilestonesTab()}
                {activeTab === 'compliance' && renderComplianceTab()}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectAnalysis;
