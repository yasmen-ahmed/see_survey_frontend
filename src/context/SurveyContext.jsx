import React, { createContext, useContext, useState, useEffect } from 'react';

const SurveyContext = createContext();

export const useSurveyContext = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveyContext must be used within a SurveyProvider');
  }
  return context;
};

export const SurveyProvider = ({ children }) => {
  // Initialize state from localStorage if it exists, otherwise use default values
  const [surveyData, setSurveyData] = useState(() => {
    const savedData = localStorage.getItem('surveyData');
    return savedData ? JSON.parse(savedData) : {
      sessionId: null,
      siteId: null,
      createdBy: null,
      assignedTo: null,
      project: null,
      status: null
    };
  });

  // Save to localStorage whenever surveyData changes
  useEffect(() => {
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
  }, [surveyData]);

  const updateSurveyData = (data) => {
    setSurveyData(data);
  };

  // Add a function to clear the data
  const clearSurveyData = () => {
    setSurveyData({
      sessionId: null,
      siteId: null,
      createdBy: null,
      assignedTo: null,
      project: null,
      status: null
    });
    localStorage.removeItem('surveyData');
  };

  return (
    <SurveyContext.Provider value={{ surveyData, updateSurveyData, clearSurveyData }}>
      {children}
    </SurveyContext.Provider>
  );
}; 