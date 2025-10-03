import React, { useMemo, useState } from 'react';
import KanbanBoard from '../features/module/components/KanbanBoard';

const TestKanbanBoard = () => {
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
      skillsRequired: [
        { name: 'WCAG 2.2', level: 'intermediate' }
      ],
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
      skillsRequired: [
        { name: 'Database Normalization', level: 'advanced' }
      ],
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
      skillsRequired: [
        { name: 'Test Automation', level: 'intermediate' }
      ],
      learningOutcomes: 'Craft reliable end-to-end tests powered by shared fixtures.',
      progress: 15,
      peerReviews: { completed: 0, required: 1 },
      skillsAcquired: ['Visual Regression Testing'],
      dependencies: [],
      blockedBy: [],
      dueDate: '2025-10-20'
    }
  ]);

  const [draggedCard, setDraggedCard] = useState(null);

  const kanbanColumns = useMemo(() => ({
    BACKLOG: { title: 'Backlog', color: '#6b7280' },
    TODO: { title: 'To Do', color: '#8b5cf6' },
    IN_PROGRESS: { title: 'In Progress', color: '#f59e0b' },
    REVIEW: { title: 'Review', color: '#06b6d4' },
    DONE: { title: 'Done', color: '#22c55e' }
  }), []);

  return (
    <div
      style={{
        padding: '24px',
        background: 'linear-gradient(145deg, #f8fafc 0%, #eef2ff 100%)',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      <header style={{ maxWidth: '1120px', margin: '0 auto 24px', color: '#0f172a' }}>
        <p style={{ fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '8px' }}>
          Feature Lab • Module Collaboration
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Kanban Board Playground</h1>
        <p style={{ marginTop: '12px', lineHeight: 1.6, maxWidth: '720px', color: '#475569' }}>
          Use this sandbox route to stress-test drag-and-drop interactions, column customization, and the rich task cards
          in the module workspace experience. Open your browser console to monitor diagnostics logged by the component.
        </p>
      </header>

      <main style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <KanbanBoard
          kanbanTasks={kanbanTasks}
          setKanbanTasks={setKanbanTasks}
        />
      </main>

      <aside
        style={{
          marginTop: '32px',
          maxWidth: '1120px',
          marginLeft: 'auto',
          marginRight: 'auto',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
          padding: '20px 24px'
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>Debug Snapshot</h2>
        <p style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
          Inspect the live task state below after dragging cards to verify that transitions persist as expected.
        </p>
        <pre
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '12px',
            maxHeight: '360px',
            overflow: 'auto'
          }}
        >
{JSON.stringify(kanbanTasks, null, 2)}
        </pre>
      </aside>
    </div>
  );
};

export default TestKanbanBoard;
