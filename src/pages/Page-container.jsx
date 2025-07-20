import React, { useEffect, Suspense } from "react";
  import { useParams, useNavigate } from "react-router-dom";
import { tabsConfig } from "../Components/Tabs/Alltabs.jsx";
import { useSurveyContext } from "../context/SurveyContext";
import ErrorBoundary from "../Components/common/ErrorBoundary.jsx";

const PageContainer = () => {
  const { sessionId, siteId, pageName, tabKey } = useParams();
  const navigate = useNavigate();
  const { surveyData } = useSurveyContext();
  const tabs = tabsConfig[pageName] || [];

  const normalizedTabKey = tabKey?.toLowerCase();
  const activeTab = tabs.find(tab => tab.key === normalizedTabKey);

  useEffect(() => {
    if (!activeTab && tabs.length > 0) {
      navigate(`/sites/${siteId}/${pageName}/${tabs[0].key}`, { replace: true });
    }
  }, [activeTab, tabs, siteId, pageName, navigate]);

  // Custom navigation function that checks for unsaved changes
  const handleTabNavigation = async (targetTabKey) => {
    const targetPath = `/sites/${sessionId}/${siteId}/${pageName}/${targetTabKey}`;
    
    // Use safeNavigate if available (for unsaved changes handling)
    if (window.safeNavigate) {
      await window.safeNavigate(targetPath);
    } else {
      navigate(targetPath);
    }
  };

  const ActiveComponent = activeTab?.component;

  return (
    <div className="page-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tabs-wrapper">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabNavigation(tab.key)}
              className={`tab-button ${tab.key === normalizedTabKey ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="site-info mx-30">
          <span>{surveyData?.siteId}</span>
          <span>{surveyData?.project && `, ${surveyData.project}`}</span>
        </div>
      </div>

      {/* Dynamic Form Rendering */}
      <div className="form-container">
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            {ActiveComponent ? <ActiveComponent /> : <div>No form available</div>}
          </Suspense>
        </ErrorBoundary>
      </div>

      <style>
        {`
          .page-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding-top: 0;
            padding-bottom: 0;
          }

          .tab-navigation {
            position: fixed;
            z-index: 20;
            top: var(--header-height);
            left: var(--sidebar-width);
            width: calc(100vw - var(--sidebar-width));
            background-color: var(--background-secondary);
            padding: var(--spacing-md) var(--container-padding);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
          }

          .tabs-wrapper {
            display: flex;
            gap: var(--spacing-sm, 0.5rem);
          }

          .tab-button {
            padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: var(--border-radius-md, 0.375rem);
            font-weight: 600;
            background-color: var(--background-primary, #ffffff);
            transition: all 0.2s ease;
          }

          .tab-button.active {
            background-color: var(--primary-color, #007bff);
            color: white;
          }

          .tab-button:hover:not(.active) {
            background-color: var(--background-secondary, #f8f9fa);
          }

          .site-info {
            margin-left: auto;
            font-size: 1.25rem;
            color: var(--text-secondary, #6c757d);
            font-weight: 600;
            display: flex;
            gap: var(--spacing-lg, 1.5rem);
            padding: 0 20px;
          }

          .form-container {
            flex: 1;
            border: 1px solid var(--border-color, #dee2e6);
            padding: var(--spacing-md, 1rem);
            border-radius: var(--border-radius-md, 0.375rem);
            background-color: var(--background-primary, #ffffff);
            box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
            width: 100%;
            overflow: hidden;
            min-height: 0;
            display: flex;
            margin-top: calc(var(--header-height) + 70px); 
            flex-direction: column;
          }

          .form-container > * {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: row;
          }
        `}
      </style>
    </div>
  );
};

export default PageContainer;
