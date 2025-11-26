import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useSecureFileHandler = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const openSecureFile = useCallback(async (fallbackUrl, apiCallFn, forceRefresh = true) => {
    if (!forceRefresh && fallbackUrl) {
       window.open(fallbackUrl, '_blank');
       return;
    }
    const toastId = toast.loading('Preparing file...');

    try {
      setIsRefreshing(true);
      const result = await apiCallFn();
      const newUrl = typeof result === 'string' ? result : (result?.fileUrl || result?.url || result?.path);

      if (newUrl) {
        const link = document.createElement('a');
        link.href = newUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.dismiss(toastId);
      } else {
        throw new Error('No URL returned');
      }

    } catch (error) {
      console.error('Failed to open secure file:', error);
      
      // Fallback
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
        toast.dismiss(toastId);
      } else {
        toast.error('Unable to refresh document link.', { id: toastId });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { openSecureFile, isRefreshing };
};