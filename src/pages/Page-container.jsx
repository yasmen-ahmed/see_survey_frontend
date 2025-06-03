import { useParams, useNavigate } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { tabsConfig } from "../Components/Tabs/Alltabs.jsx";

const PageContainer = () => {
  const { sessionId, siteId, pageName, tabKey } = useParams();  // Getting route params
  const navigate = useNavigate();
  const tabs = tabsConfig[pageName] || [];  // Get tabs for the current page (e.g. site-info)
  const ct = localStorage.getItem('ct');
  const project = localStorage.getItem('project');
  const site_id = localStorage.getItem('site_id');
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
    <div className="pt-32 pb-4">
      {/* Tab Navigation */}
      <div
        className="flex gap-2 fixed z-20 top-20 left-60 w-[calc(100vw-15rem)] bg-gray-50 py-2 px-4 border-b"
        style={{ minWidth: 0 }}
      >
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
        <div className="m-auto text-xl text-gray-500 font-semibold ">
          {ct} , {project} , {site_id}
        </div>
        
      </div>

      {/* Dynamic Form Rendering */}
      <div className="border p-4 rounded bg-white shadow w-full overflow-auto">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab ? <activeTab.component /> : <div>No form available</div>}
        </Suspense>
      </div>
    </div>
  );
};

export default PageContainer;
