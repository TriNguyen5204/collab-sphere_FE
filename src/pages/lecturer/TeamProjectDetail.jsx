import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './TeamProjectDetail.module.css';

const TeamProjectDetail = () => {
  const { classId, projectId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the specific team project
  const projectData = {
    id: projectId,
    title: 'E-commerce Platform Development',
    team: 'Team Alpha',
    description: 'Building a full-stack e-commerce platform with modern technologies including React, Node.js, and MongoDB.',
    status: 'On Track',
    progress: 75,
    riskLevel: 'Low',
    startDate: '2024-09-15',
    dueDate: '2024-12-15',
    lastUpdate: '2024-11-20',
    repositoryUrl: 'https://github.com/team-alpha/ecommerce-platform',
    totalCommits: 248,
    totalLines: 15640,
    techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS']
  };

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Team Lead & Full-Stack Developer',
      email: 'john.doe@university.edu',
      avatar: '/api/placeholder/40/40',
      contributions: {
        commits: 89,
        linesAdded: 4520,
        linesRemoved: 890,
        pullRequests: 23,
        issuesResolved: 15,
        codeReviews: 31
      },
      activity: {
        lastCommit: '2024-11-20',
        weeklyCommits: [12, 8, 15, 9, 11, 14, 7],
        participation: 95
      },
      skills: ['React', 'Node.js', 'MongoDB', 'Team Leadership']
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Frontend Developer',
      email: 'jane.smith@university.edu',
      avatar: '/api/placeholder/40/40',
      contributions: {
        commits: 67,
        linesAdded: 3890,
        linesRemoved: 450,
        pullRequests: 18,
        issuesResolved: 12,
        codeReviews: 25
      },
      activity: {
        lastCommit: '2024-11-19',
        weeklyCommits: [9, 6, 12, 8, 10, 11, 5],
        participation: 87
      },
      skills: ['React', 'CSS', 'UI/UX Design', 'Responsive Design']
    },
    {
      id: 3,
      name: 'Bob Johnson',
      role: 'Backend Developer',
      email: 'bob.johnson@university.edu',
      avatar: '/api/placeholder/40/40',
      contributions: {
        commits: 54,
        linesAdded: 2830,
        linesRemoved: 320,
        pullRequests: 14,
        issuesResolved: 9,
        codeReviews: 19
      },
      activity: {
        lastCommit: '2024-11-18',
        weeklyCommits: [7, 5, 9, 6, 8, 10, 4],
        participation: 82
      },
      skills: ['Node.js', 'Express', 'MongoDB', 'API Development']
    },
    {
      id: 4,
      name: 'Alice Brown',
      role: 'QA & Documentation',
      email: 'alice.brown@university.edu',
      avatar: '/api/placeholder/40/40',
      contributions: {
        commits: 38,
        linesAdded: 1400,
        linesRemoved: 180,
        pullRequests: 8,
        issuesResolved: 6,
        codeReviews: 12
      },
      activity: {
        lastCommit: '2024-11-17',
        weeklyCommits: [4, 3, 6, 4, 5, 7, 3],
        participation: 68
      },
      skills: ['Testing', 'Documentation', 'Quality Assurance', 'Bug Tracking']
    }
  ];

  const milestones = [
    {
      id: 1,
      title: 'Project Setup & Planning',
      dueDate: '2024-09-30',
      status: 'Completed',
      progress: 100,
      tasks: ['Repository setup', 'Technology stack selection', 'Project planning', 'Team role assignment']
    },
    {
      id: 2,
      title: 'UI/UX Design & Wireframes',
      dueDate: '2024-10-15',
      status: 'Completed',
      progress: 100,
      tasks: ['User research', 'Wireframe creation', 'Design system', 'Prototype development']
    },
    {
      id: 3,
      title: 'Backend API Development',
      dueDate: '2024-11-15',
      status: 'Completed',
      progress: 100,
      tasks: ['Database design', 'Authentication system', 'Product API', 'Order management API']
    },
    {
      id: 4,
      title: 'Frontend Implementation',
      dueDate: '2024-12-01',
      status: 'In Progress',
      progress: 75,
      tasks: ['Component development', 'State management', 'API integration', 'Responsive design']
    },
    {
      id: 5,
      title: 'Testing & Deployment',
      dueDate: '2024-12-15',
      status: 'Pending',
      progress: 20,
      tasks: ['Unit testing', 'Integration testing', 'Performance optimization', 'Production deployment']
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'commit',
      user: 'John Doe',
      action: 'Implemented shopping cart functionality',
      timestamp: '2024-11-20 14:30',
      details: 'Added cart state management and UI components'
    },
    {
      id: 2,
      type: 'pull_request',
      user: 'Jane Smith',
      action: 'Updated product listing page design',
      timestamp: '2024-11-19 16:45',
      details: 'Enhanced responsive design and improved accessibility'
    },
    {
      id: 3,
      type: 'issue',
      user: 'Alice Brown',
      action: 'Reported authentication bug',
      timestamp: '2024-11-19 11:20',
      details: 'Session timeout not working correctly on mobile devices'
    },
    {
      id: 4,
      type: 'commit',
      user: 'Bob Johnson',
      action: 'Fixed database connection issues',
      timestamp: '2024-11-18 20:15',
      details: 'Improved connection pooling and error handling'
    }
  ];

  const interventionRecommendations = [
    {
      id: 1,
      type: 'warning',
      priority: 'Medium',
      title: 'Code Review Imbalance',
      description: 'Alice Brown has significantly fewer code reviews compared to other team members.',
      recommendation: 'Encourage Alice to participate more in code reviews to improve learning and team collaboration.',
      impact: 'Team Collaboration'
    },
    {
      id: 2,
      type: 'info',
      priority: 'Low',
      title: 'Documentation Gap',
      description: 'API documentation is 30% behind the current implementation.',
      recommendation: 'Allocate dedicated time for documentation updates in the next sprint.',
      impact: 'Project Quality'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#059669';
      case 'in progress': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'on track': return '#059669';
      case 'at risk': return '#d97706';
      case 'behind': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const renderOverviewTab = () => (
    <div className={styles.tabContent}>
      {/* Project Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#3b82f6'}}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{projectData.progress}%</div>
            <div className={styles.statLabel}>Completion</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#059669'}}>💻</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{projectData.totalCommits}</div>
            <div className={styles.statLabel}>Total Commits</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#d97706'}}>📝</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{projectData.totalLines.toLocaleString()}</div>
            <div className={styles.statLabel}>Lines of Code</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#dc2626'}}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{teamMembers.length}</div>
            <div className={styles.statLabel}>Team Members</div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className={styles.sectionHeader}>
        <h3>Team Members</h3>
      </div>
      <div className={styles.membersGrid}>
        {teamMembers.map(member => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <div className={styles.memberAvatar}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={styles.memberInfo}>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
              <div className={styles.participationBadge}>
                {member.activity.participation}%
              </div>
            </div>
            <div className={styles.memberStats}>
              <div className={styles.memberStat}>
                <span className={styles.statNumber}>{member.contributions.commits}</span>
                <span className={styles.statLabel}>Commits</span>
              </div>
              <div className={styles.memberStat}>
                <span className={styles.statNumber}>{member.contributions.pullRequests}</span>
                <span className={styles.statLabel}>PRs</span>
              </div>
              <div className={styles.memberStat}>
                <span className={styles.statNumber}>{member.contributions.issuesResolved}</span>
                <span className={styles.statLabel}>Issues</span>
              </div>
            </div>
            <div className={styles.memberSkills}>
              {member.skills.slice(0, 3).map(skill => (
                <span key={skill} className={styles.skillTag}>{skill}</span>
              ))}
              {member.skills.length > 3 && (
                <span className={styles.skillTag}>+{member.skills.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className={styles.tabContent}>
      {/* Code Contribution Analysis */}
      <div className={styles.sectionHeader}>
        <h3>Code Contribution Analysis</h3>
      </div>
      <div className={styles.contributionGrid}>
        {teamMembers.map(member => (
          <div key={member.id} className={styles.contributionCard}>
            <div className={styles.contributionHeader}>
              <h4>{member.name}</h4>
              <span className={styles.lastActivity}>
                Last active: {new Date(member.activity.lastCommit).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.contributionMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Lines Added</span>
                <span className={styles.metricValue}>{member.contributions.linesAdded.toLocaleString()}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Lines Removed</span>
                <span className={styles.metricValue}>{member.contributions.linesRemoved.toLocaleString()}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Code Reviews</span>
                <span className={styles.metricValue}>{member.contributions.codeReviews}</span>
              </div>
            </div>
            <div className={styles.weeklyActivity}>
              <span className={styles.activityLabel}>Weekly Commits</span>
              <div className={styles.activityChart}>
                {member.activity.weeklyCommits.map((commits, index) => (
                  <div 
                    key={index} 
                    className={styles.activityBar}
                    style={{height: `${(commits / Math.max(...member.activity.weeklyCommits)) * 100}%`}}
                    title={`${commits} commits`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMilestonesTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.milestonesTimeline}>
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className={styles.milestoneItem}>
            <div className={styles.milestoneIndicator}>
              <div 
                className={styles.milestoneStatus}
                style={{background: getStatusColor(milestone.status)}}
              />
              {index < milestones.length - 1 && <div className={styles.milestoneLine} />}
            </div>
            <div className={styles.milestoneContent}>
              <div className={styles.milestoneHeader}>
                <h4>{milestone.title}</h4>
                <div className={styles.milestoneInfo}>
                  <span className={styles.milestoneDate}>
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                  <span 
                    className={styles.milestoneStatusBadge}
                    style={{background: getStatusColor(milestone.status)}}
                  >
                    {milestone.status}
                  </span>
                </div>
              </div>
              <div className={styles.milestoneProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{width: `${milestone.progress}%`, background: getStatusColor(milestone.status)}}
                  />
                </div>
                <span className={styles.progressText}>{milestone.progress}%</span>
              </div>
              <div className={styles.milestoneTasks}>
                {milestone.tasks.map((task, taskIndex) => (
                  <span key={taskIndex} className={styles.taskTag}>{task}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.activityFeed}>
        {recentActivity.map(activity => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {activity.type === 'commit' && '💻'}
              {activity.type === 'pull_request' && '🔄'}
              {activity.type === 'issue' && '🐛'}
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityHeader}>
                <strong>{activity.user}</strong> {activity.action}
              </div>
              <div className={styles.activityDetails}>{activity.details}</div>
              <div className={styles.activityTimestamp}>{activity.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterventionsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.interventionsList}>
        {interventionRecommendations.map(intervention => (
          <div key={intervention.id} className={styles.interventionCard}>
            <div className={styles.interventionHeader}>
              <div className={styles.interventionType}>
                <span 
                  className={styles.priorityIndicator}
                  style={{
                    background: intervention.priority === 'High' ? '#dc2626' :
                               intervention.priority === 'Medium' ? '#d97706' : '#059669'
                  }}
                />
                <span className={styles.interventionTitle}>{intervention.title}</span>
              </div>
              <span className={styles.priorityBadge}>{intervention.priority} Priority</span>
            </div>
            <div className={styles.interventionContent}>
              <p className={styles.interventionDescription}>{intervention.description}</p>
              <p className={styles.interventionRecommendation}>
                <strong>Recommendation:</strong> {intervention.recommendation}
              </p>
              <div className={styles.interventionFooter}>
                <span className={styles.impactLabel}>Impact: {intervention.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to={`/lecturer/classes/${classId}`} className={styles.breadcrumbLink}>
            Class Details
          </Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          <Link to={`/lecturer/classes/${classId}/projects`} className={styles.breadcrumbLink}>
            Projects
          </Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbCurrent}>Team Project Detail</span>
        </div>
        
        <div className={styles.projectHeader}>
          <div className={styles.projectInfo}>
            <h1>{projectData.title}</h1>
            <p className={styles.projectDescription}>{projectData.description}</p>
            <div className={styles.projectMeta}>
              <span className={styles.metaItem}>Team: {projectData.team}</span>
              <span className={styles.metaItem}>Due: {new Date(projectData.dueDate).toLocaleDateString()}</span>
              <span className={styles.metaItem}>
                <a href={projectData.repositoryUrl} target="_blank" rel="noopener noreferrer">
                  📁 Repository
                </a>
              </span>
            </div>
          </div>
          <div className={styles.projectStatus}>
            <div className={styles.statusBadge} style={{background: getStatusColor(projectData.status)}}>
              {projectData.status}
            </div>
            <div className={styles.progressIndicator}>
              <div className={styles.progressCircle}>
                <span className={styles.progressValue}>{projectData.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className={styles.techStack}>
          <span className={styles.techLabel}>Tech Stack:</span>
          {projectData.techStack.map(tech => (
            <span key={tech} className={styles.techTag}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'milestones', label: 'Milestones', icon: '🎯' },
            { id: 'activity', label: 'Activity', icon: '📝' },
            { id: 'interventions', label: 'Interventions', icon: '⚠️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'milestones' && renderMilestonesTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'interventions' && renderInterventionsTab()}
      </div>
    </div>
  );
};

export default TeamProjectDetail;