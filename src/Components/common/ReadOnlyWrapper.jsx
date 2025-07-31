import React from 'react';
import { useReadOnly } from '../../hooks/useReadOnly';

const ReadOnlyWrapper = ({ children, readOnly = false, className = '' }) => {
  const { isReadOnly } = useReadOnly();
  
  // Use the readOnly prop or the context readOnly state
  const isFormReadOnly = readOnly || isReadOnly;
  
  return (
    <div 
      className={`${className} ${isFormReadOnly ? 'read-only-mode' : ''}`}
      style={{
        // Inline styles for immediate effect
        ...(isFormReadOnly && {
          '--read-only-opacity': '0.6',
          '--read-only-cursor': 'not-allowed',
          '--read-only-bg': '#f5f5f5',
          '--read-only-border': '#d1d5db'
        })
      }}
    >
      {children}
    </div>
  );
};

export default ReadOnlyWrapper; 