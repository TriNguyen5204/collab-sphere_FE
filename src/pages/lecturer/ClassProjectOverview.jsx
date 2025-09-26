import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './ClassProjectOverview.module.css';

const ClassProjectOverview = () => {
  const { classId } = useParams();

  // Mock data for projects
  const classData = {
    id: classId,
    name: 'Problem-Based Learning in Software Engineering',
    code: 'SE301',
    semester: 'Fall 2024',
    totalStudents: 45,
    totalTeams: 9
  };

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform Development',
      team: 'Team Alpha',
      progress: 75,
      status: 'On Track',
      riskLevel: 'Low',
      dueDate: '2024-12-15',
      members: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'],
      lastUpdate: '2024-11-20'
    },
    {
      id: 2,
      title: 'Mobile Health App',
      team: 'Team Beta',
      progress: 45,
      status: 'At Risk',
      riskLevel: 'Medium',
      dueDate: '2024-12-15',
      members: ['Mike Wilson', 'Sarah Davis', 'Tom Anderson', 'Lisa Garcia'],
      lastUpdate: '2024-11-18'
    },
    {
      id: 3,
      title: 'AI-Powered Learning Assistant',
      team: 'Team Gamma',
      progress: 30,
      status: 'Behind',
      riskLevel: 'High',
      dueDate: '2024-12-15',
      members: ['Chris Lee', 'Emma Martinez', 'David Kim', 'Rachel Taylor'],
      lastUpdate: '2024-11-15'
    },
    {
      id: 4,
      title: 'Smart Campus Navigation',
      team: 'Team Delta',
      progress: 85,
      status: 'Ahead',
      riskLevel: 'Low',
      dueDate: '2024-12-15',
      members: ['Alex Thompson', 'Maya Patel', 'Ryan O\'Connor', 'Sophie Chen'],
      lastUpdate: '2024-11-21'
    },
    {
      id: 5,
      title: 'Virtual Reality Study Environment',
      team: 'Team Epsilon',
      progress: 60,
      status: 'On Track',
      riskLevel: 'Low',
      dueDate: '2024-12-15',
      members: ['Jordan Williams', 'Zoe Mitchell', 'Noah Brown', 'Ava Johnson'],
      lastUpdate: '2024-11-19'
    }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (progress >= 60) return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    if (progress >= 40) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'on track': return 'onTrack';
      case 'ahead': return 'ahead';
      case 'at risk': return 'atRisk';
      case 'behind': return 'behind';
      default: return 'onTrack';
    }
  };

  const getRiskClass = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return 'low';
    }
  };

  const overallStats = {
    averageProgress: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length),
    onTrackProjects: projects.filter(p => p.status === 'On Track' || p.status === 'Ahead').length,
    atRiskProjects: projects.filter(p => p.riskLevel === 'Medium' || p.riskLevel === 'High').length,
    overdue: projects.filter(p => new Date(p.dueDate) < new Date()).length
  };

  return (
    <div>
      {/* Enhanced Header with Gradient */}
      <div className={styles.header}>
        <div className={styles.headerNav}>
          <Link to="/lecturer/classes" className={styles.backButton}>
            ← Back to Classes
          </Link>
          <span>/</span>
          <Link to={`/lecturer/classes/${classId}`} className={styles.backButton}>
            Class Details
          </Link>
        </div>
        
        <h1 className={styles.title}>Project Overview</h1>
        <p className={styles.subtitle}>
          Monitor and manage all team projects for <strong>{classData.code} - {classData.name}</strong>
        </p>
        
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span>📅</span>
            <span>{classData.semester}</span>
          </div>
          <div className={styles.metaItem}>
            <span>👥</span>
            <span>{classData.totalStudents} Students</span>
          </div>
          <div className={styles.metaItem}>
            <span>🏆</span>
            <span>{classData.totalTeams} Teams</span>
          </div>
          <div className={styles.metaItem}>
            <span>📊</span>
            <span>{projects.length} Active Projects</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Enhanced Stats Cards */}
        <div className={styles.statCards}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              📊
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{overallStats.averageProgress}%</div>
              <div className={styles.statLabel}>Average Progress</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              ✅
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{overallStats.onTrackProjects}</div>
              <div className={styles.statLabel}>On Track</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              ⚠️
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{overallStats.atRiskProjects}</div>
              <div className={styles.statLabel}>At Risk</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              🚨
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{overallStats.overdue}</div>
              <div className={styles.statLabel}>Overdue</div>
            </div>
          </div>
        </div>

        {/* Enhanced Project Cards Grid */}
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              {/* Card Header with Title and Risk Alert */}
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.teamName}>{project.team}</p>
                <div className={`${styles.riskAlert} ${styles[getRiskClass(project.riskLevel)]}`}>
                  ⚠️ {project.riskLevel}
                </div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                {/* Project Stats */}
                <div className={styles.projectStats}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{project.progress}%</div>
                    <div className={styles.statLabel}>Progress</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{project.members.length}</div>
                    <div className={styles.statLabel}>Members</div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Development Progress</span>
                    <span className={styles.progressValue}>{project.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${project.progress}%`,
                        background: getProgressColor(project.progress)
                      }}
                    />
                  </div>
                </div>

                {/* Project Meta Information */}
                <div className={styles.projectMeta}>
                  <div className={styles.metaGroup}>
                    <span>📅</span>
                    <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaGroup}>
                    <span>🔄</span>
                    <span>Updated {new Date(project.lastUpdate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className={styles.teamMembers}>
                  <div className={styles.membersLabel}>Team Members</div>
                  <div className={styles.membersList}>
                    {project.members.map((member, index) => (
                      <span key={index} className={styles.memberChip}>
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Section */}
                <div className={styles.statusSection}>
                  <span className={`${styles.statusBadge} ${styles[getStatusClass(project.status)]}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.projectActions}>
                <Link 
                  to={`/lecturer/classes/${classId}/projects/${project.id}`} 
                  className={styles.btnPrimary}
                  style={{ textDecoration: 'none' }}
                >
                  📊 View Details
                </Link>
                <button className={styles.btnSecondary}>
                  💬 Contact Team
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>📝</div>
              <div className={styles.actionLabel}>Create Assignment</div>
            </div>
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <div className={styles.actionLabel}>Generate Report</div>
            </div>
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>💬</div>
              <div className={styles.actionLabel}>Send Announcement</div>
            </div>
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <div className={styles.actionLabel}>Project Settings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassProjectOverview;