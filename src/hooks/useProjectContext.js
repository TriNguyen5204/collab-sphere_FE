import { useState, useEffect } from 'react';

export const useProjectContext = () => {
  const [projectContext, setProjectContext] = useState(null);

  useEffect(() => {
    const getContext = () => {
      const contextString = localStorage.getItem('currentProjectContext');
      
      if (contextString) {
        try {
          return JSON.parse(contextString);
        } catch (error) {
          console.error('Error parsing project context:', error);
          return null;
        }
      }
      
      return null;
    };

    setProjectContext(getContext());
  }, []);

  const updateProjectContext = (newContext) => {
    localStorage.setItem('currentProjectContext', JSON.stringify(newContext));
    setProjectContext(newContext);
  };

  const clearProjectContext = () => {
    localStorage.removeItem('currentProjectContext');
    setProjectContext(null);
  };

  return {
    projectContext,
    updateProjectContext,
    clearProjectContext
  };
};