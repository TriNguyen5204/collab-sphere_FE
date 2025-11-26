import { useContext } from 'react';
import { SignalRContext } from './SignalRContext';

export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  
  if (!context) {
    throw new Error('useSignalRContext must be used within SignalRProvider');
  }
  
  return context;
};