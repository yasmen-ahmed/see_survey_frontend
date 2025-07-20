import Header from "../Components/layout/Header.jsx";
import Slider from "../Components/layout/Slider.jsx";
import React from 'react';
import { Outlet } from "react-router-dom";
function MainLayout() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      
      {/* Header at top */}
      <Header />

      {/* Sidebar and Content below header */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar on the left */}
        <div className="w-60 border-r bg-white shadow flex-shrink-0">
          <Slider />
        </div>

        {/* Main Content on the right */}
        <div className="flex-1 overflow-hidden">
          <Outlet /> {/* Render child routes here */}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
  
