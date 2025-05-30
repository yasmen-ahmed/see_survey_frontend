import Header from "../Components/layout/Header.jsx";
import Slider from "../Components/layout/Slider.jsx";
import React from 'react';
import { Outlet } from "react-router-dom";
function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header at top */}
      <Header />

      {/* Sidebar and Content below header */}
      <div className="flex flex-1">
        
        {/* Sidebar on the left */}
        <div className="w-60 border-r bg-white shadow">
          <Slider />
        </div>

        {/* Main Content on the right */}
        <div className="flex-1 p-3 overflow-y-auto">
        <Outlet /> {/* Render child routes here */}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
  
