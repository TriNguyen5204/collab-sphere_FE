import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './LecturerMonitoringDashboard.module.css';
import {
  ChevronDownIcon,
  BellIcon,
  QrCodeIcon,
  DocumentChartBarIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

const LecturerMonitoringDashboard = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [selectedClass, setSelectedClass] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [projectHealthData, setProjectHealthData] = useState({});
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [interventionAlerts, setInterventionAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Mock Data - Replace with actual API calls
  const [classes] = useState([
    {
      id: '201',
      code: 'SE109',
      name: 'SE109 - Software Engineering Fundamentals',
      enrollmentCount: 42,
      qrStatus: 'active',
      projectHealth: 'good', // good, warning, critical
      projects: [
        {
          id: 'proj-1',
          name: 'AI Study Companion',
          teams: 3,
          completion: 75,
          riskLevel: 'low',
          status: 'on-track'
        },
        {
          id: 'proj-2',
          name: 'Code Quality Toolkit',
          teams: 3,
          completion: 45,
          riskLevel: 'medium',
          status: 'at-risk'
        },
        {
          id: 'proj-3',
          name: 'Automated Testing Coach',
          teams: 3,
          completion: 88,
          riskLevel: 'low',
          status: 'ahead'
        }
      ]
    },
    {
      id: '202',
      code: 'SE203',
      name: 'SE203 - Advanced Database Systems',
      enrollmentCount: 36,
      qrStatus: 'active',
      projectHealth: 'warning',
      projects: [
        {
          id: 'proj-4',
          name: 'Intelligent Query Assistant',
          teams: 3,
          completion: 62,
          riskLevel: 'medium',
          status: 'on-track'
        },
        {
          id: 'proj-5',
          name: 'Distributed Caching Dashboard',
          teams: 3,
          completion: 48,
          riskLevel: 'medium',
          status: 'at-risk'
        },
        {
          id: 'proj-6',
          name: 'Database Observability Hub',
          teams: 2,
          completion: 30,
          riskLevel: 'high',
          status: 'behind'
        }
      ]
    },
    {
      id: '203',
      code: 'SE301',
      name: 'SE301 - Software Architecture & Design',
      enrollmentCount: 0,
      qrStatus: 'inactive',
      projectHealth: 'critical',
      projects: [
        {
          id: 'proj-7',
          name: 'Microservices Reference Architecture',
          teams: 0,
          completion: 10,
          riskLevel: 'high',
          status: 'draft'
        }
      ]
    }
  ]);

  const [mockLearningOutcomes] = useState([
    {
      id: 'lo-1',
      title: 'Full-stack Development',
      coverage: 85,
      teamsAchieving: 7,
      totalTeams: 9,
      status: 'on-track'
    },
    {
      id: 'lo-2',
      title: 'Database Design',
      coverage: 92,
      teamsAchieving: 8,
      totalTeams: 9,
      status: 'excellent'
    },
    {
      id: 'lo-3',
      title: 'API Development',
      coverage: 68,
      teamsAchieving: 6,
      totalTeams: 9,
      status: 'needs-attention'
    },
    {
      id: 'lo-4',
      title: 'Testing & Quality Assurance',
      coverage: 55,
      teamsAchieving: 4,
      totalTeams: 9,
      status: 'critical'
    }
  ]);

  const [mockAssessmentData] = useState({
    gradeDistribution: {
      excellent: 23,
      good: 45,
      satisfactory: 25,
      needsImprovement: 7
    },
    peerEvaluations: {
      completed: 78,
      pending: 22,
      averageScore: 4.2
    },
    aiRecommendations: [
      {
        type: 'intervention',
        priority: 'high',
        message: 'Team Alpha requires immediate support with testing practices',
        teamId: 'team-alpha'
      },
      {
        type: 'resource',
        priority: 'medium',
        message: 'Consider additional database design resources for 3 teams',
        count: 3
      }
    ]
  });

  // Initialize selected class
  useEffect(() => {
    if (classId && classes.length > 0) {
      const foundClass = classes.find(c => c.id === classId);
      setSelectedClass(foundClass || classes[0]);
    } else if (classes.length > 0) {
      setSelectedClass(classes[0]);
    }
  }, [classId, classes]);

  // Mock notification data
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        type: 'alert',
        message: 'Team Alpha is 2 days behind schedule',
        priority: 'high',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'success',
        message: 'Team Beta completed milestone ahead of schedule',
        priority: 'low',
        timestamp: new Date()
      }
    ]);
  }, []);

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskLevelColor = (risk) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOutcomeStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'on-track': return '#3b82f6';
      case 'needs-attention': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.lecturerDashboard}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.classSelector}>
            <div className={styles.selectorWrapper}>
              <select 
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const selected = classes.find(c => c.id === e.target.value);
                  setSelectedClass(selected);
                  navigate(`/lecturer/monitoring/${e.target.value}`);
                }}
                className={styles.classDropdown}
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className={styles.dropdownIcon} />
            </div>
            {selectedClass && (
              <div className={styles.classInfo}>
                <span className={styles.enrollmentCount}>
                  {selectedClass.enrollmentCount} students
                </span>
                <div className={styles.qrStatus}>
                  <QrCodeIcon className={styles.qrIcon} />
                  <span className={styles.qrText}>QR Active</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.healthIndicator}>
            <div 
              className={styles.healthLight}
              style={{ backgroundColor: getHealthColor(selectedClass?.projectHealth) }}
            ></div>
            <span className={styles.healthText}>
              Project Health: {selectedClass?.projectHealth?.toUpperCase()}
            </span>
          </div>

          <div className={styles.actionToolbar}>
            <button className={styles.actionButton}>
              <DocumentChartBarIcon className={styles.actionIcon} />
              Generate Reports
            </button>
            <button className={styles.actionButton}>
              <MegaphoneIcon className={styles.actionIcon} />
              Send Announcements
            </button>
            <button className={styles.actionButton}>
              <CalendarDaysIcon className={styles.actionIcon} />
              Schedule Consultations
            </button>
          </div>

          <div className={styles.notificationBell}>
            <button className={styles.bellButton}>
              {notifications.length > 0 ? (
                <BellIconSolid className={styles.bellIcon} />
              ) : (
                <BellIcon className={styles.bellIcon} />
              )}
              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column - Project Overview Cards */}
          <div className={styles.leftColumn}>
            <div className={styles.sectionHeader}>
              <h2>Project Overview</h2>
              <span className={styles.projectCount}>
                {selectedClass?.projects?.length || 0} Projects
              </span>
            </div>

            <div className={styles.projectCards}>
              {selectedClass?.projects?.map(project => (
                <div 
                  key={project.id} 
                  className={styles.projectCard}
                  onClick={() => navigate(`/lecturer/projects/${project.id}`)}
                >
                  <div className={styles.projectHeader}>
                    <h3 className={styles.projectName}>{project.name}</h3>
                    <div 
                      className={styles.riskIndicator}
                      style={{ backgroundColor: getRiskLevelColor(project.riskLevel) }}
                    >
                      {project.riskLevel}
                    </div>
                  </div>
                  
                  <div className={styles.projectMetrics}>
                    <div className={styles.metric}>
                      <UserGroupIcon className={styles.metricIcon} />
                      <span>{project.teams} teams</span>
                    </div>
                    <div className={styles.metric}>
                      <ChartBarIcon className={styles.metricIcon} />
                      <span>{project.completion}% complete</span>
                    </div>
                  </div>

                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${project.completion}%`,
                        backgroundColor: getRiskLevelColor(project.riskLevel)
                      }}
                    ></div>
                  </div>

                  <div className={styles.projectStatus}>
                    Status: <span className={styles.statusText}>{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Academic Analytics Panel */}
          <div className={styles.rightColumn}>
            {/* Learning Outcomes Achievement Tracker */}
            <div className={styles.analyticsPanel}>
              <div className={styles.panelHeader}>
                <h2>Learning Outcomes Achievement</h2>
                <ArrowTrendingUpIcon className={styles.panelIcon} />
              </div>

              <div className={styles.outcomesGrid}>
                {mockLearningOutcomes.map(outcome => (
                  <div key={outcome.id} className={styles.outcomeCard}>
                    <div className={styles.outcomeHeader}>
                      <h4>{outcome.title}</h4>
                      <div 
                        className={styles.outcomeStatus}
                        style={{ backgroundColor: getOutcomeStatusColor(outcome.status) }}
                      >
                        {outcome.coverage}%
                      </div>
                    </div>
                    
                    <div className={styles.outcomeProgress}>
                      <div 
                        className={styles.outcomeProgressBar}
                        style={{ 
                          width: `${outcome.coverage}%`,
                          backgroundColor: getOutcomeStatusColor(outcome.status)
                        }}
                      ></div>
                    </div>

                    <div className={styles.outcomeTeams}>
                      {outcome.teamsAchieving} / {outcome.totalTeams} teams achieving
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.curriculumHeatmap}>
                <h3>Curriculum Coverage Heat Map</h3>
                <div className={styles.heatmapGrid}>
                  {/* Simplified heat map representation */}
                  {Array.from({ length: 20 }, (_, i) => (
                    <div 
                      key={i}
                      className={styles.heatmapCell}
                      style={{ 
                        backgroundColor: `rgba(16, 185, 129, ${Math.random() * 0.8 + 0.2})` 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment Compilation Interface */}
            <div className={styles.assessmentPanel}>
              <div className={styles.panelHeader}>
                <h2>Assessment Overview</h2>
                <AcademicCapIcon className={styles.panelIcon} />
              </div>

              <div className={styles.assessmentGrid}>
                <div className={styles.gradeDistribution}>
                  <h4>Grade Distribution</h4>
                  <div className={styles.distributionBars}>
                    {Object.entries(mockAssessmentData.gradeDistribution).map(([grade, percentage]) => (
                      <div key={grade} className={styles.distributionBar}>
                        <span className={styles.gradeLabel}>{grade}</span>
                        <div className={styles.barContainer}>
                          <div 
                            className={styles.bar}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className={styles.percentage}>{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.peerEvaluations}>
                  <h4>Peer Evaluations</h4>
                  <div className={styles.peerStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {mockAssessmentData.peerEvaluations.completed}%
                      </span>
                      <span className={styles.statLabel}>Completed</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {mockAssessmentData.peerEvaluations.averageScore}
                      </span>
                      <span className={styles.statLabel}>Avg Score</span>
                    </div>
                  </div>
                </div>

                <div className={styles.aiRecommendations}>
                  <h4>AI Recommendations</h4>
                  {mockAssessmentData.aiRecommendations.map((rec, index) => (
                    <div key={index} className={styles.recommendation}>
                      <div className={styles.recIcon}>
                        {rec.priority === 'high' ? (
                          <ExclamationTriangleIcon className={styles.highPriority} />
                        ) : (
                          <CheckCircleIcon className={styles.mediumPriority} />
                        )}
                      </div>
                      <span className={styles.recText}>{rec.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.assessmentActions}>
                <button 
                  className={styles.assessmentButton}
                  onClick={() => navigate('/lecturer/assessment-center')}
                >
                  <AcademicCapIcon className={styles.buttonIcon} />
                  Access Assessment Center
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Supervision & Intervention Panel */}
        <div className={styles.supervisionSection}>
          <div className={styles.interventionPanel}>
            <div className={styles.panelHeader}>
              <h2>AI-Powered Intervention Recommendations</h2>
              <ShieldCheckIcon className={styles.panelIcon} />
            </div>

            <div className={styles.interventionGrid}>
              <div className={styles.urgentAlerts}>
                <h3>Urgent Interventions</h3>
                {mockAssessmentData.aiRecommendations
                  .filter(rec => rec.priority === 'high')
                  .map((rec, index) => (
                    <div key={index} className={styles.urgentAlert}>
                      <ExclamationTriangleIcon className={styles.urgentIcon} />
                      <div className={styles.alertContent}>
                        <span className={styles.alertText}>{rec.message}</span>
                        <button className={styles.actionButton}>
                          Schedule Meeting
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className={styles.performanceInsights}>
                <h3>Performance Insights</h3>
                <div className={styles.insightCards}>
                  <div className={styles.insightCard}>
                    <PresentationChartLineIcon className={styles.insightIcon} />
                    <div className={styles.insightContent}>
                      <span className={styles.insightValue}>23%</span>
                      <span className={styles.insightLabel}>Teams Above Average</span>
                    </div>
                  </div>
                  <div className={styles.insightCard}>
                    <ClipboardDocumentListIcon className={styles.insightIcon} />
                    <div className={styles.insightContent}>
                      <span className={styles.insightValue}>78%</span>
                      <span className={styles.insightLabel}>Milestones On Track</span>
                    </div>
                  </div>
                  <div className={styles.insightCard}>
                    <UserGroupIcon className={styles.insightIcon} />
                    <div className={styles.insightContent}>
                      <span className={styles.insightValue}>4.2/5</span>
                      <span className={styles.insightLabel}>Avg Team Collaboration</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.academicOversight}>
                <h3>Academic Standards Compliance</h3>
                <div className={styles.complianceMetrics}>
                  <div className={styles.complianceItem}>
                    <div className={styles.complianceHeader}>
                      <span>Curriculum Coverage</span>
                      <span className={styles.complianceScore}>94%</span>
                    </div>
                    <div className={styles.complianceBar}>
                      <div 
                        className={styles.complianceFill}
                        style={{ width: '94%', backgroundColor: '#10b981' }}
                      ></div>
                    </div>
                  </div>
                  <div className={styles.complianceItem}>
                    <div className={styles.complianceHeader}>
                      <span>Learning Outcomes Met</span>
                      <span className={styles.complianceScore}>87%</span>
                    </div>
                    <div className={styles.complianceBar}>
                      <div 
                        className={styles.complianceFill}
                        style={{ width: '87%', backgroundColor: '#3b82f6' }}
                      ></div>
                    </div>
                  </div>
                  <div className={styles.complianceItem}>
                    <div className={styles.complianceHeader}>
                      <span>Assessment Quality</span>
                      <span className={styles.complianceScore}>76%</span>
                    </div>
                    <div className={styles.complianceBar}>
                      <div 
                        className={styles.complianceFill}
                        style={{ width: '76%', backgroundColor: '#f59e0b' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.supervisoryActions}>
            <button 
              className={styles.supervisoryButton}
              onClick={() => navigate('/lecturer/class-management')}
            >
              <UserGroupIcon className={styles.supervisoryIcon} />
              Class Management
            </button>
            <button 
              className={styles.supervisoryButton}
              onClick={() => navigate(`/lecturer/classes/${selectedClass?.id}/projects`)}
            >
              <EyeIcon className={styles.supervisoryIcon} />
              Team Analytics
            </button>
            <button 
              className={styles.supervisoryButton}
              onClick={() => navigate('/lecturer/assessment-center')}
            >
              <AcademicCapIcon className={styles.supervisoryIcon} />
              Assessment Center
            </button>
            <button 
              className={styles.supervisoryButton}
              onClick={() => navigate('/lecturer/projects')}
            >
              <BookOpenIcon className={styles.supervisoryIcon} />
              Project Library
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerMonitoringDashboard;