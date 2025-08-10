import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SurveyCardList from "../Components/LandingPageComponents/SurveyCardList.jsx";
import Createform from "../Components/LandingPageComponents/Createform.jsx";
import Header from "../Components/layout/Header.jsx";

const LandingPage = () => {
  const location = useLocation();
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
  const [activeView, setActiveView] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    return viewParam === 'surveys' ? 'view' : 'view'; // default to 'view' for now
  });
  
  const [userRole, setUserRole] = useState("");

  // Handle URL parameters and user role
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    
    const searchParams = new URLSearchParams(location.search);
  const viewParam = searchParams.get('view');
  
  if (viewParam) {
    if (viewParam === 'surveys') {
      setActiveView("view");
      setShowSurveyOptions(false);
    }
  }
    
  }, [location.search, location.pathname]);

  const handleCreateClick = () => {
    setShowSurveyOptions(!showSurveyOptions);
    setActiveView("single");
    // Clear URL parameter when switching to create mode
    window.history.replaceState({}, '', '/landingpage');
  };

  const handleViewClick = () => {
    setShowSurveyOptions(false);
    setActiveView("view");
    // Update URL to reflect the current view
    window.history.replaceState({}, '', '/landingpage?view=surveys');
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 pb-6 pt-30">
        <div className=" mx-auto ">

          {/* Main Buttons */}
          <div className="flex justify-center gap-6 mb-6">
            {(userRole === "admin" || userRole === "coordinator") && (
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={handleCreateClick}
              >
                Create Survey
              </button>
            )}
          
          </div>

          {/* Sub-options */}
          {showSurveyOptions && (
            <div className="flex justify-center gap-6">
              <button
                className={`px-5 py-2 rounded hover:bg-blue-500 ${
                  activeView === "single" ? "bg-blue-500 text-white" : "bg-blue-400 text-white"
                }`}
                onClick={() => setActiveView("single")}
              >
                Single Survey
              </button>
              <button
                className={`px-5 py-2 rounded hover:bg-blue-500 ${
                  activeView === "bulk" ? "bg-blue-500 text-white" : "bg-blue-400 text-white"
                }`}
                onClick={() => setActiveView("bulk")}
              >
                Bulk Survey
              </button>
            </div>
          )}

          {/* Views */}
          <div className="">
            {activeView === "single" && <Createform />}
            {activeView === "bulk" && (
              <div className="text-center text-gray-600">Bulk survey coming soon...</div>
            )}
          </div>

          {activeView === "view" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">All Surveys</h2>
              <SurveyCardList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
