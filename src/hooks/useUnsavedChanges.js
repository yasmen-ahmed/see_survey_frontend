import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useUnsavedChanges = (hasUnsavedChanges, saveFunction) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);

  // Handle beforeunload event (when user tries to close tab/window)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Create a custom navigate function that checks for unsaved changes
  const safeNavigate = async (to, options) => {
    if (hasUnsavedChanges && !isNavigating.current) {
      isNavigating.current = true;
      
      try {
        const saved = await saveFunction();
        if (saved) {
          navigate(to, options);
        } else {
          // Stay on current page if save failed
          console.log('Navigation cancelled due to save failure');
        }
      } finally {
        isNavigating.current = false;
      }
    } else {
      navigate(to, options);
    }
  };

  // Store the safe navigate function globally so other components can use it
  useEffect(() => {
    window.safeNavigate = safeNavigate;
    
    return () => {
      delete window.safeNavigate;
    };
  }, [hasUnsavedChanges, saveFunction]);

  return { safeNavigate, isNavigating: isNavigating.current };
};

export default useUnsavedChanges; 