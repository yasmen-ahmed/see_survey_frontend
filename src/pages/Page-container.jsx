import { useParams, useNavigate } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { tabsConfig } from "../Components/Tabs/Alltabs.jsx";

const PageContainer = () => {
  const { sessionId, siteId, pageName, tabKey } = useParams();  // Getting route params
  const navigate = useNavigate();
  const tabs = tabsConfig[pageName] || [];  // Get tabs for the current page (e.g. site-info)

  // Normalize tabKey and find the active tab
  const normalizedTabKey = tabKey?.toLowerCase();
  const activeTab = tabs.find(tab => tab.key === normalizedTabKey);

  useEffect(() => {
    // If no active tab, navigate to the first tab
    if (!activeTab && tabs.length > 0) {
      navigate(`/sites/${siteId}/${pageName}/${tabs[0].key}`, { replace: true });
    }
  }, [activeTab, tabs, siteId, pageName, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/sites/${sessionId}/${siteId}/${pageName}/${tab.key}`)}
            className={`px-4 py-2 border rounded font-semibold ${
              tab.key === normalizedTabKey ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Form Rendering */}
      <div className="border p-4 rounded bg-white shadow">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab ? <activeTab.component /> : <div>No form available</div>}
        </Suspense>
      </div>
    </div>
  );
};

export default PageContainer;
