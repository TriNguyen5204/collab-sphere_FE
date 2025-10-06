import React from 'react';
import logo from './assets/logov1.png';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <img src={logo} alt="CollabSphere Logo" className="mx-auto mb-6 w-32 h-32" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CollabSphere</h1>
        <p className="text-lg text-gray-600 mb-8">Project-Based Learning Platform</p>
      </div>
    </div>
  );
}

export default App;
