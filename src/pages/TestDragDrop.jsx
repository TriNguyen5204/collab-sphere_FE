import React, { useState } from 'react';
import KanbanBoardSimple from '../features/module/components/KanbanBoardSimple';

const TestDragDrop = () => {
  // Sample test data
  const [testTasks, setTestTasks] = useState([
    {
      id: '1.1',
      title: 'Design User Interface',
      status: 'TODO',
      team: 'frontend',
      priority: 'high'
    },
    {
      id: '1.2',
      title: 'Setup React Router',
      status: 'IN_PROGRESS',
      team: 'frontend',
      priority: 'medium'
    },
    {
      id: '2.1',
      title: 'Create API Endpoints',
      status: 'TODO',
      team: 'backend',
      priority: 'high'
    },
    {
      id: '2.2',
      title: 'Database Schema',
      status: 'DONE',
      team: 'backend',
      priority: 'medium'
    },
    {
      id: '3.1',
      title: 'Integration Testing',
      status: 'BACKLOG',
      team: 'integration',
      priority: 'low'
    },
    {
      id: '3.2',
      title: 'Performance Testing',
      status: 'TODO',
      team: 'integration',
      priority: 'medium'
    }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Drag & Drop Test Page</h1>
      <p>
        <strong>Instructions:</strong> Try dragging cards between columns and teams. 
        Check the browser console for debug logs.
      </p>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>✅ Test Checklist:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Drag cards within the same team (horizontal movement)</li>
          <li>Drag cards between different teams (vertical movement)</li>
          <li>Check console logs for drag events</li>
          <li>Verify visual feedback (opacity, hover states)</li>
          <li>Test in different browsers (Chrome, Firefox, Safari)</li>
        </ul>
      </div>

      <KanbanBoardSimple 
        kanbanTasks={testTasks}
        setKanbanTasks={setTestTasks}
      />

      {/* Debug Info */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h3>📊 Current Task State:</h3>
        <pre>{JSON.stringify(testTasks, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestDragDrop;