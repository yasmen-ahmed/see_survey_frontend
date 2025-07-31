import { useSurveyContext } from '../context/SurveyContext';

export const useReadOnly = () => {
  const { surveyData } = useSurveyContext();
  
  const isReadOnly = surveyData?.readOnly || false;
  
  // Helper function to disable form elements
  const disableIfReadOnly = (element) => {
    if (isReadOnly) {
      element.disabled = true;
      element.readOnly = true;
    }
    return element;
  };
  
  // Helper function to get input props
  const getInputProps = (props = {}) => {
    if (isReadOnly) {
      return {
        ...props,
        disabled: true,
        readOnly: true,
        className: `${props.className || ''} opacity-50 cursor-not-allowed`.trim()
      };
    }
    return props;
  };
  
  // Helper function to get button props
  const getButtonProps = (props = {}) => {
    if (isReadOnly) {
      return {
        ...props,
        disabled: true,
        className: `${props.className || ''} opacity-50 cursor-not-allowed`.trim()
      };
    }
    return props;
  };
  
  // Global disable function for any element
  const disableElement = (element) => {
    if (isReadOnly && element) {
      element.disabled = true;
      element.readOnly = true;
      element.style.pointerEvents = 'none';
      element.style.opacity = '0.6';
      element.style.cursor = 'not-allowed';
    }
    return element;
  };

  // Function to disable all form elements in a container
  const disableAllFormElements = (containerRef) => {
    if (!isReadOnly || !containerRef?.current) return;
    
    const container = containerRef.current;
    const interactiveElements = container.querySelectorAll('input, textarea, select, button, a[href]');
    
    interactiveElements.forEach(element => {
      if (element.classList.contains('read-only-badge')) return; // Skip the read-only badge
      
      // For checkboxes and radio buttons, preserve the checked state
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.disabled = true;
        element.style.pointerEvents = 'none';
        element.style.opacity = '0.6';
        element.style.cursor = 'not-allowed';
        // Don't change background color for checkboxes/radio buttons to preserve visibility
      } else {
        element.disabled = true;
        element.readOnly = true;
        element.style.pointerEvents = 'none';
        element.style.opacity = '0.6';
        element.style.cursor = 'not-allowed';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
          element.style.backgroundColor = '#f5f5f5';
          element.style.borderColor = '#d1d5db';
        }
        
        if (element.tagName === 'BUTTON') {
          element.style.backgroundColor = '#9ca3af';
          element.style.borderColor = '#9ca3af';
        }
      }
    });
  };

  return {
    isReadOnly,
    disableIfReadOnly,
    getInputProps,
    getButtonProps,
    disableElement,
    disableAllFormElements
  };
}; 