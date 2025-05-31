import React, { useState } from "react";
import SurveyCardList from "../Components/LandingPageComponents/SurveyCardList.jsx";
import Createform from "../Components/LandingPageComponents/Createform.jsx";
import Header from "../Components/layout/Header.jsx";


const LandingPage = () => {
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
  const [activeView, setActiveView] = useState(""); // "single", "multiple", "view"

  const handleCreateClick = () => {
    setShowSurveyOptions(!showSurveyOptions);
    setActiveView(""); // Reset active view when toggling create options
  };

  const handleViewClick = () => {
    setShowSurveyOptions(false); // Hide create options
    setActiveView("view");
  };

  return (
    <div>
     <Header/>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">

        {/* Main Buttons */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            onClick={handleCreateClick}
          >
            Create Survey
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            onClick={handleViewClick}
          >
            View Survey
          </button>
        </div>

        {/* Sub-options for form selection */}
        {showSurveyOptions && (
          <div className="flex justify-center gap-6 mb-8">
            <button
              className={`px-5 py-2 rounded hover:bg-blue-500 ${activeView === "single" ? "bg-blue-500 text-white" : "bg-blue-400 text-white"}`}
              onClick={() => setActiveView("single")}
            >
              Single Survey
            </button>
            <button
              className={`px-5 py-2 rounded hover:bg-blue-500 ${activeView === "bulk" ? "bg-blue-500 text-white" : "bg-blue-400 text-white"}`}
              onClick={() => setActiveView("bulk")}
            >
              Bulk Survey
            </button>
          </div>
        )}

        {/* Conditional Render for single and bulk */}
        <div className="mb-10">
          {activeView === "single" && <Createform />}
          {activeView === "bulk" && (
            <div className="text-center text-gray-600">Bulk survey coming soon...</div>
          )}
        </div>

        {/* Survey List Section */}
        {activeView === "view" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Surveys</h2>
            <SurveyCardList />
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default LandingPage;
