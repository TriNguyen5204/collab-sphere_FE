export const useProjectContext = () => {
  console.warn('useProjectContext is deprecated. Please migrate to TeamContext.');

  return {
    projectContext: null,
    updateProjectContext: () => {},
    clearProjectContext: () => {},
  };
};