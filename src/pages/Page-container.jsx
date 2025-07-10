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

  const ActiveComponent = activeTab?.component;

  return (
    <div className="page-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tabs-wrapper">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(`/sites/${sessionId}/${siteId}/${pageName}/${tab.key}`)}
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
            padding-top: var(--header-height);
            padding-bottom: var(--spacing-md);
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
          }

          .tabs-wrapper {
            display: flex;
            gap: var(--spacing-sm);
          }

          .tab-button {
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            font-weight: 600;
            background-color: var(--background-primary);
            transition: all 0.2s ease;
          }

          .tab-button.active {
            background-color: var(--primary-color);
            color: white;
          }

          .tab-button:hover:not(.active) {
            background-color: var(--background-secondary);
          }

          .site-info {
            margin-left: auto;
            font-size: 1.25rem;
            color: var(--text-secondary);
            font-weight: 600;
            display: flex;
            gap: var(--spacing-lg);
            padding: 0 20px;
          }

          .form-container {
            border: 1px solid var(--border-color);
            padding: var(--spacing-md);
            border-radius: var(--border-radius-md);
            background-color: var(--background-primary);
            box-shadow: var(--shadow-sm);
            width: 100%;
            overflow: auto;
            margin-top: calc(var(--header-height));
          }
        `}
      </style>
    </div>
  );
};

export default PageContainer;
