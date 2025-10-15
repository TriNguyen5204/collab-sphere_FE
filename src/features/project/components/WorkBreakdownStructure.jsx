import React, { useState, useEffect } from 'react';
import styles from './WorkBreakdownStructure.module.css';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  StarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  BeakerIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

const WorkBreakdownStructure = ({
  projectData,
  onObjectiveClick,
  onMilestoneClick,
  onCheckpointClick,
  showTeamProgress = true,
  academicMode = true,
}) => {
  // State Management
  const [expandedNodes, setExpandedNodes] = useState(new Set(['project-root']));
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree, timeline, assessment
  const [filterMode, setFilterMode] = useState('all'); // all, at-risk, high-performer
  const [curriculumView, setCurriculumView] = useState(false);

  // Mock academic data - replace with actual API integration
  const mockProjectData = {
    id: 'proj-ecommerce',
    title: 'E-commerce Platform Development',
    curriculumAlignment: 94,
    totalTeams: 9,
    subjectOutcomes: [
      { id: 'so-1', title: 'Full-stack Development', coverage: 95, status: 'excellent' },
      { id: 'so-2', title: 'Database Design', coverage: 88, status: 'good' },
      { id: 'so-3', title: 'API Development', coverage: 92, status: 'excellent' },
      { id: 'so-4', title: 'Testing & QA', coverage: 76, status: 'needs-attention' },
    ],
    objectives: [
      {
        id: 'obj-1',
        title: 'System Architecture & Design',
        description: 'Establish comprehensive system architecture with microservices design patterns',
        curriculumAlignment: 96,
        learningOutcomes: ['LO-1', 'LO-2', 'LO-5'],
        teamsProgress: { completed: 7, inProgress: 2, notStarted: 0 },
        academicStatus: 'excellent',
        milestones: [
          {
            id: 'ms-1-1',
            title: 'Architecture Documentation',
            description: 'Complete system architecture documentation with UML diagrams',
            curriculumAlignment: 94,
            competencyLevel: 'advanced',
            teamsProgress: { completed: 8, inProgress: 1, notStarted: 0 },
            assessmentCriteria: ['Technical Documentation', 'Design Patterns', 'Scalability'],
            checkpoints: [
              {
                id: 'cp-1-1-1',
                title: 'System Design Document',
                description: 'Create comprehensive system design with component diagrams',
                competencyIndicators: ['Analysis & Design', 'Technical Communication'],
                teamsStatus: { completed: 6, inProgress: 2, blocked: 1 },
                assessmentWeight: 0.3,
                learningOutcome: 'LO-1',
              },
              {
                id: 'cp-1-1-2',
                title: 'Database Schema Design',
                description: 'Design normalized database schema with relationships',
                competencyIndicators: ['Database Design', 'Data Modeling'],
                teamsStatus: { completed: 7, inProgress: 2, blocked: 0 },
                assessmentWeight: 0.25,
                learningOutcome: 'LO-2',
              },
            ],
          },
          {
            id: 'ms-1-2',
            title: 'Technology Stack Selection',
            description: 'Research and select appropriate technology stack',
            curriculumAlignment: 88,
            competencyLevel: 'intermediate',
            teamsProgress: { completed: 9, inProgress: 0, notStarted: 0 },
            assessmentCriteria: ['Technology Assessment', 'Justification', 'Industry Standards'],
            checkpoints: [
              {
                id: 'cp-1-2-1',
                title: 'Frontend Framework Selection',
                description: 'Compare and select frontend framework (React/Vue/Angular)',
                competencyIndicators: ['Technology Evaluation', 'Decision Making'],
                teamsStatus: { completed: 9, inProgress: 0, blocked: 0 },
                assessmentWeight: 0.2,
                learningOutcome: 'LO-5',
              },
            ],
          },
        ],
      },
      {
        id: 'obj-2',
        title: 'Frontend Development & UX',
        description: 'Develop responsive user interface with modern UX principles',
        curriculumAlignment: 91,
        learningOutcomes: ['LO-3', 'LO-4', 'LO-6'],
        teamsProgress: { completed: 4, inProgress: 5, notStarted: 0 },
        academicStatus: 'good',
        milestones: [
          {
            id: 'ms-2-1',
            title: 'UI/UX Design Implementation',
            description: 'Implement responsive design with accessibility standards',
            curriculumAlignment: 89,
            competencyLevel: 'intermediate',
            teamsProgress: { completed: 5, inProgress: 4, notStarted: 0 },
            assessmentCriteria: ['Design Principles', 'Accessibility', 'Responsiveness'],
            checkpoints: [
              {
                id: 'cp-2-1-1',
                title: 'Responsive Design Implementation',
                description: 'Create mobile-first responsive design',
                competencyIndicators: ['Frontend Development', 'Responsive Design'],
                teamsStatus: { completed: 4, inProgress: 4, blocked: 1 },
                assessmentWeight: 0.35,
                learningOutcome: 'LO-3',
              },
            ],
          },
        ],
      },
    ],
  };

  const data = projectData || mockProjectData;

  // Node expansion handlers
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node, type) => {
    setSelectedNode({ ...node, type });

    switch (type) {
      case 'objective':
        onObjectiveClick?.(node);
        break;
      case 'milestone':
        onMilestoneClick?.(node);
        break;
      case 'checkpoint':
        onCheckpointClick?.(node);
        break;
      default:
        break;
    }
  };

  // Academic status colors
  const getAcademicStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'needs-attention':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCompetencyIcon = (level) => {
    switch (level) {
      case 'advanced':
        return <StarIconSolid className={styles.competencyIcon} />;
      case 'intermediate':
        return <AcademicCapIcon className={styles.competencyIcon} />;
      case 'beginner':
        return <BookOpenIcon className={styles.competencyIcon} />;
      default:
        return <ClipboardDocumentListIcon className={styles.competencyIcon} />;
    }
  };

  const renderProgressBar = (progress, total, type = 'teams') => {
    const percentage = total > 0 ? (progress / total) * 100 : 0;
    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
        </div>
        <span className={styles.progressText}>
          {progress}/{total} {type}
        </span>
      </div>
    );
  };

  const renderCurriculumAlignment = (alignment) => (
    <div className={styles.curriculumAlignment}>
      <div className={styles.alignmentBar}>
        <div
          className={styles.alignmentFill}
          style={{
            width: `${alignment}%`,
            backgroundColor:
              alignment >= 90 ? '#10b981' : alignment >= 75 ? '#3b82f6' : '#f59e0b',
          }}
        ></div>
      </div>
      <span className={styles.alignmentText}>{alignment}%</span>
    </div>
  );

  const renderTeamStatus = (teamsStatus) => {
    const total =
      teamsStatus.completed +
      teamsStatus.inProgress +
      (teamsStatus.blocked || teamsStatus.notStarted || 0);
    return (
      <div className={styles.teamStatusGrid}>
        <div className={styles.statusItem}>
          <CheckCircleIconSolid className={styles.statusIconComplete} />
          <span>{teamsStatus.completed}</span>
        </div>
        <div className={styles.statusItem}>
          <ClockIcon className={styles.statusIconProgress} />
          <span>{teamsStatus.inProgress}</span>
        </div>
        {teamsStatus.blocked > 0 && (
          <div className={styles.statusItem}>
            <ExclamationTriangleIcon className={styles.statusIconBlocked} />
            <span>{teamsStatus.blocked}</span>
          </div>
        )}
      </div>
    );
  };

  const renderCheckpoint = (checkpoint, level = 4) => {
    const nodeId = `checkpoint-${checkpoint.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedNode?.id === checkpoint.id;

    return (
      <div
        key={checkpoint.id}
        className={styles.treeNode}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div
          className={`${styles.nodeContent} ${isSelected ? styles.selected : ''} ${styles.checkpointNode}`}
          onClick={() => handleNodeClick(checkpoint, 'checkpoint')}
        >
          <div className={styles.nodeHeader}>
            <div className={styles.nodeTitle}>
              <BeakerIcon className={styles.nodeIcon} />
              <span className={styles.titleText}>{checkpoint.title}</span>
              <div className={styles.competencyBadges}>
                {checkpoint.competencyIndicators?.map((indicator, idx) => (
                  <span key={idx} className={styles.competencyBadge}>
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.nodeActions}>
              <span className={styles.assessmentWeight}>
                {Math.round(checkpoint.assessmentWeight * 100)}%
              </span>
              {showTeamProgress && renderTeamStatus(checkpoint.teamsStatus)}
            </div>
          </div>

          <div className={styles.nodeDescription}>{checkpoint.description}</div>

          <div className={styles.academicMetadata}>
            <div className={styles.learningOutcome}>
              <AcademicCapIcon className={styles.metadataIcon} />
              <span>{checkpoint.learningOutcome}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMilestone = (milestone, level = 3) => {
    const nodeId = `milestone-${milestone.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedNode?.id === milestone.id;

    return (
      <div
        key={milestone.id}
        className={styles.treeNode}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div
          className={`${styles.nodeContent} ${isSelected ? styles.selected : ''} ${styles.milestoneNode}`}
          onClick={() => handleNodeClick(milestone, 'milestone')}
        >
          <div className={styles.nodeHeader}>
            <button
              className={styles.expandButton}
              onClick={(event) => {
                event.stopPropagation();
                toggleNode(nodeId);
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className={styles.chevronIcon} />
              ) : (
                <ChevronRightIcon className={styles.chevronIcon} />
              )}
            </button>

            <div className={styles.nodeTitle}>
              <GlobeAltIcon className={styles.nodeIcon} />
              <span className={styles.titleText}>{milestone.title}</span>
              {getCompetencyIcon(milestone.competencyLevel)}
            </div>

            <div className={styles.nodeActions}>
              {renderCurriculumAlignment(milestone.curriculumAlignment)}
              {showTeamProgress && renderTeamStatus(milestone.teamsProgress)}
            </div>
          </div>

          <div className={styles.nodeDescription}>{milestone.description}</div>

          <div className={styles.academicMetadata}>
            <div className={styles.assessmentCriteria}>
              <DocumentTextIcon className={styles.metadataIcon} />
              <span>Assessment: {milestone.assessmentCriteria?.join(', ')}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.childrenContainer}>
            {milestone.checkpoints?.map((checkpoint) =>
              renderCheckpoint(checkpoint, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderObjective = (objective, level = 2) => {
    const nodeId = `objective-${objective.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedNode?.id === objective.id;

    return (
      <div
        key={objective.id}
        className={styles.treeNode}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div
          className={`${styles.nodeContent} ${isSelected ? styles.selected : ''} ${styles.objectiveNode}`}
          onClick={() => handleNodeClick(objective, 'objective')}
        >
          <div className={styles.nodeHeader}>
            <button
              className={styles.expandButton}
              onClick={(event) => {
                event.stopPropagation();
                toggleNode(nodeId);
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className={styles.chevronIcon} />
              ) : (
                <ChevronRightIcon className={styles.chevronIcon} />
              )}
            </button>

            <div className={styles.nodeTitle}>
              <CpuChipIcon className={styles.nodeIcon} />
              <span className={styles.titleText}>{objective.title}</span>
              <div
                className={styles.academicStatusIndicator}
                style={{ backgroundColor: getAcademicStatusColor(objective.academicStatus) }}
              ></div>
            </div>

            <div className={styles.nodeActions}>
              {renderCurriculumAlignment(objective.curriculumAlignment)}
              {showTeamProgress && renderTeamStatus(objective.teamsProgress)}
            </div>
          </div>

          <div className={styles.nodeDescription}>{objective.description}</div>

          <div className={styles.academicMetadata}>
            <div className={styles.learningOutcomes}>
              <AcademicCapIcon className={styles.metadataIcon} />
              <span>Learning Outcomes: {objective.learningOutcomes?.join(', ')}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.childrenContainer}>
            {objective.milestones?.map((milestone) =>
              renderMilestone(milestone, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProjectRoot = () => {
    const nodeId = 'project-root';
    const isExpanded = expandedNodes.has(nodeId);

    return (
      <div className={styles.treeNode}>
        <div className={`${styles.nodeContent} ${styles.projectNode}`}>
          <div className={styles.nodeHeader}>
            <button className={styles.expandButton} onClick={() => toggleNode(nodeId)}>
              {isExpanded ? (
                <ChevronDownIcon className={styles.chevronIcon} />
              ) : (
                <ChevronRightIcon className={styles.chevronIcon} />
              )}
            </button>

            <div className={styles.nodeTitle}>
              <BookOpenIcon className={styles.nodeIcon} />
              <span className={styles.titleText}>{data.title}</span>
            </div>

            <div className={styles.nodeActions}>
              {renderCurriculumAlignment(data.curriculumAlignment)}
              <div className={styles.teamCount}>
                <UserGroupIcon className={styles.teamIcon} />
                <span>{data.totalTeams} teams</span>
              </div>
            </div>
          </div>

          <div className={styles.subjectOutcomes}>
            {data.subjectOutcomes?.map((outcome) => (
              <div key={outcome.id} className={styles.outcomeItem}>
                <span className={styles.outcomeTitle}>{outcome.title}</span>
                <div className={styles.outcomeCoverage}>
                  <div
                    className={styles.coverageBar}
                    style={{
                      width: `${outcome.coverage}%`,
                      backgroundColor: getAcademicStatusColor(outcome.status),
                    }}
                  ></div>
                  <span>{outcome.coverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isExpanded && (
          <div className={styles.childrenContainer}>
            {data.objectives?.map((objective) => renderObjective(objective, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wbsContainer}>
      <div className={styles.wbsHeader}>
        <div className={styles.headerTitle}>
          <PresentationChartLineIcon className={styles.headerIcon} />
          <h3>Academic Work Breakdown Structure</h3>
        </div>

        <div className={styles.headerControls}>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'timeline' ? styles.active : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'assessment' ? styles.active : ''}`}
              onClick={() => setViewMode('assessment')}
            >
              Assessment
            </button>
          </div>

          <button
            className={`${styles.curriculumButton} ${curriculumView ? styles.active : ''}`}
            onClick={() => setCurriculumView(!curriculumView)}
          >
            <ChartBarIcon className={styles.buttonIcon} />
            Curriculum View
          </button>
        </div>
      </div>

      <div className={styles.wbsContent}>
        {viewMode === 'tree' && <div className={styles.treeView}>{renderProjectRoot()}</div>}

        {viewMode === 'timeline' && (
          <div className={styles.timelineView}>
            <div className={styles.timelinePlaceholder}>
              <ArrowTrendingUpIcon className={styles.placeholderIcon} />
              <h4>Academic Timeline View</h4>
              <p>Gantt chart showing academic calendar alignment will be implemented here</p>
            </div>
          </div>
        )}

        {viewMode === 'assessment' && (
          <div className={styles.assessmentView}>
            <div className={styles.assessmentPlaceholder}>
              <ClipboardDocumentListIcon className={styles.placeholderIcon} />
              <h4>Assessment Planning Interface</h4>
              <p>Integrated access to evaluation criteria and grading workflows</p>
            </div>
          </div>
        )}
      </div>

      {curriculumView && (
        <div className={styles.curriculumPanel}>
          <div className={styles.panelHeader}>
            <h4>Curriculum Mapping Analysis</h4>
            <button className={styles.closeButton} onClick={() => setCurriculumView(false)}>
              ×
            </button>
          </div>
          <div className={styles.panelContent}>
            <p>Detailed syllabus alignment analysis and competency tracking will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkBreakdownStructure;
