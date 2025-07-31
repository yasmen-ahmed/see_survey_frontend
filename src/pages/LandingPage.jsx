import React, { useState, useEffect } from "react";
import SurveyCardList from "../Components/LandingPageComponents/SurveyCardList.jsx";
import Createform from "../Components/LandingPageComponents/Createform.jsx";
import Header from "../Components/layout/Header.jsx";

const LandingPage = () => {
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
  const [activeView, setActiveView] = useState("view"); // default
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const handleCreateClick = () => {
    setShowSurveyOptions(!showSurveyOptions);
    setActiveView(""); // Reset
  };

  const handleViewClick = () => {
    setShowSurveyOptions(false);
    setActiveView("view");
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
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={handleViewClick}
            >
              View Survey
            </button>
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
