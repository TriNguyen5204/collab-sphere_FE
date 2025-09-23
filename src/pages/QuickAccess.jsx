import React from 'react';
import { Link } from 'react-router-dom';

const QuickAccess = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🚀 Quick Access to Class Project Overview</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Navigation Options:</h3>
        <ul>
          <li>
            <strong>Direct URL:</strong> 
            <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', margin: '0 8px' }}>
              /lecturer/classes/SE301/projects
            </code>
          </li>
          <li>
            <strong>From Class Details:</strong> Click the "View Projects" button in the header
          </li>
        </ul>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link 
          to="/lecturer/classes" 
          style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          📚 Class Management Dashboard
        </Link>
        
        <Link 
          to="/lecturer/classes/SE301" 
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          📋 Class Details (SE301)
        </Link>
        
        <Link 
          to="/lecturer/classes/SE301/projects" 
          style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          🚀 Project Overview (Fixed UI)
        </Link>
      </div>
      
      <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>✨ UI Fixes Applied:</h4>
        <ul style={{ margin: 0, color: '#4b5563' }}>
          <li>✅ Buttons now properly aligned in the same row</li>
          <li>✅ Professional gradient colors (no more default colors)</li>
          <li>✅ Enhanced button styling with consistent height</li>
          <li>✅ Better risk alert colors (solid gradients)</li>
          <li>✅ Improved status badges with white text</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickAccess;