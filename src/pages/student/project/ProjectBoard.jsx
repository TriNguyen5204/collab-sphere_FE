import React, { useState, useMemo } from 'react';
import Header from '../../../components/layout/Header';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TrelloBoard from '../../../components/board/TrelloBoard';

const ProjectBoard = () => {
  // Sample tasks from TestKanbanBoard
  const [kanbanTasks, setKanbanTasks] = useState([
    {
      id: 'FE-101',
      title: 'Design Responsive Dashboard Layout',
      description: 'Create adaptive dashboard wireframes and translate them into reusable React components.',
      status: 'TODO',
      team: 'frontend',
      priority: 'high',
      role: 'UI/UX',
      assignee: 'Alice Nguyen',
      technologies: ['React', 'TailwindCSS', 'Storybook'],
      skillsRequired: [
        { name: 'Design Tokens', level: 'intermediate' },
        { name: 'TailwindCSS', level: 'beginner' }
      ],
      learningOutcomes: 'Understand how to break down UI mockups into modular, testable components.',
      progress: 35,
      peerReviews: { completed: 1, required: 2 },
      skillsAcquired: ['Component Composition'],
      dependencies: [],
      blockedBy: [],
      dueDate: '2025-10-14'
    },
    {
      id: 'FE-118',
      title: 'Accessibility Audit for Module Library',
      description: 'Verify color contrast, keyboard navigation, and aria labels for the module library page.',
      status: 'IN_PROGRESS',
      team: 'frontend',
      priority: 'medium',
      role: 'Frontend Engineer',
      assignee: 'Bryan Lee',
      technologies: ['React', 'Testing Library'],
      skillsRequired: [{ name: 'WCAG 2.2', level: 'intermediate' }],
      learningOutcomes: 'Apply accessibility heuristics and automated auditing tools.',
      progress: 55,
      peerReviews: { completed: 2, required: 2 },
      skillsAcquired: ['Semantic HTML'],
      dependencies: ['QA-205'],
      blockedBy: [],
      dueDate: '2025-10-09'
    },
    {
      id: 'BE-203',
      title: 'Class Progress Analytics API',
      description: 'Expose aggregate progress stats for each class to power the monitoring dashboard.',
      status: 'REVIEW',
      team: 'backend',
      priority: 'high',
      role: 'Backend Engineer',
      assignee: 'Chen Wang',
      technologies: ['NestJS', 'PostgreSQL', 'Prisma'],
      skillsRequired: [
        { name: 'REST Design', level: 'advanced' },
        { name: 'SQL Optimization', level: 'intermediate' }
      ],
      learningOutcomes: 'Design resilient data APIs with input validation and pagination.',
      progress: 80,
      peerReviews: { completed: 1, required: 2 },
      skillsAcquired: ['API Contract Testing'],
      dependencies: ['BE-180'],
      blockedBy: [],
      dueDate: '2025-10-05'
    },
    {
      id: 'BE-180',
      title: 'Normalize Project Evaluation Tables',
      description: 'Refactor evaluation schema to avoid duplication and align with analytics queries.',
      status: 'DONE',
      team: 'backend',
      priority: 'medium',
      role: 'Database Engineer',
      assignee: 'Dimas Dewi',
      technologies: ['PostgreSQL', 'dbmate'],
      skillsRequired: [{ name: 'Database Normalization', level: 'advanced' }],
      learningOutcomes: 'Strengthen understanding of migration strategies in collaborative projects.',
      progress: 100,
      peerReviews: { completed: 2, required: 2 },
      skillsAcquired: ['Migration Rollbacks'],
      dependencies: [],
      blockedBy: [],
      dueDate: '2025-09-28'
    },
    {
      id: 'INT-310',
      title: 'Real-time Checkpoint Notification Flow',
      description: 'Connect WebSocket events to frontend toast alerts for checkpoint submissions.',
      status: 'IN_PROGRESS',
      team: 'integration',
      priority: 'critical',
      role: 'Integration Specialist',
      assignee: 'Elena Petrova',
      technologies: ['Socket.IO', 'React Query'],
      skillsRequired: [
        { name: 'WebSockets', level: 'advanced' },
        { name: 'State Synchronization', level: 'intermediate' }
      ],
      learningOutcomes: 'Coordinate realtime events with optimistic UI updates.',
      progress: 45,
      peerReviews: { completed: 0, required: 2 },
      skillsAcquired: [],
      dependencies: ['FE-118', 'BE-203'],
      blockedBy: ['BE-203'],
      dueDate: '2025-10-12'
    },
    {
      id: 'QA-205',
      title: 'Regression Test Suite for Monitoring Dashboard',
      description: 'Automate UI regression tests for the lecturer monitoring screens.',
      status: 'BACKLOG',
      team: 'integration',
      priority: 'low',
      role: 'QA Engineer',
      assignee: 'Fatima Zahra',
      technologies: ['Playwright', 'React'],
      skillsRequired: [{ name: 'Test Automation', level: 'intermediate' }],
      learningOutcomes: 'Craft reliable end-to-end tests powered by shared fixtures.',
      progress: 15,
      peerReviews: { completed: 0, required: 1 },
      skillsAcquired: ['Visual Regression Testing'],
      dependencies: [],
      blockedBy: [],
      dueDate: '2025-10-20'
    }
  ]);

  // Role filter state lifted to the page
  const [selectedRole, setSelectedRole] = useState('all');

  // Compute available roles from tasks
  const roles = useMemo(() => {
    const set = new Set();
    kanbanTasks.forEach(t => t.role && set.add(t.role));
    return ['all', ...Array.from(set)];
  }, [kanbanTasks]);

  return (
    <>
      <Header />
      <ProjectBoardHeader
        roles={roles}
        selectedRole={selectedRole}
        onChangeRole={setSelectedRole}
      />
      <div className="flex flex-col h-screen bg-gray-800">
        <TrelloBoard />
      </div>
    </>
  );
};

export default ProjectBoard;