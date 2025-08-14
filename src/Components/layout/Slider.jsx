// SidebarTabs.jsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  Power,
  Calendar,
  TentTree,
  RadioTower,
  CircleHelp,
  BookImage,
} from "lucide-react";
import { useParams } from "react-router-dom";

const SidebarTabs = () => {  
  const { sessionId, siteId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { 
      label: "Site Info", 
      icon: <House size={20} />, 
      path: `/sites/${sessionId}/${siteId}/site-info/site-location`,
      section: "site-info"
    },
    { 
      label: "AC Power", 
      icon: <Power size={20} />, 
      path: `/sites/${sessionId}/${siteId}/ac-power/ac-info`,
      section: "ac-power"
    },
    // { 
    //   label: "Room", 
    //   icon: <Calendar size={20} />, 
    //   path: `/sites/${sessionId}/${siteId}/room/room-info`,
    //   section: "room"
    // },
    { 
      label: "Outdoor", 
      icon: <TentTree size={20} />, 
      path: `/sites/${sessionId}/${siteId}/outdoor/general-lyout`,
      section: "outdoor"
    },
    { 
      label: "Existing Radio", 
      icon: <RadioTower size={20} />, 
      path: `/sites/${sessionId}/${siteId}/existing-radio/antennas-strut`,
      section: "existing-radio"
    },
    { 
      label: "New Radio", 
      icon: <RadioTower size={20} />, 
      path: `/sites/${sessionId}/${siteId}/new-radio/radio-installation`,
      section: "new-radio"
    },
    { 
      label: "H&S", 
      icon: <CircleHelp size={20} />, 
      path: `/sites/${sessionId}/${siteId}/H&S/h&s`,
      section: "H&S"
    },
    { 
      label: "Gallery", 
      icon:  <BookImage size={20} />, 
      path: `/sites/${sessionId}/${siteId}/gallery/gallery`,
      section: "gallery"
    }
  ];

  // Function to check if current path includes the section
  const isSectionActive = (section) => {
    return location.pathname.includes(`/${section}/`);
  };

  // Handle navigation with unsaved changes check
  const handleNavigation = async (e, path) => {
    e.preventDefault();
    
    // Use safeNavigate if available (for unsaved changes handling)
    if (window.safeNavigate) {
      await window.safeNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="w-60 bg-white border-r p-4 fixed top-20 left-0 h-[calc(100vh-5rem)] z-30 overflow-y-auto">
      <nav className="space-y-3">
        {navItems.map(({ label, icon, path, section }) => (
          <a
            href={path}
            key={label}
            onClick={(e) => handleNavigation(e, path)}
            className={`flex items-center gap-2 px-3 py-2 rounded font-bold cursor-pointer ${
              isSectionActive(section) ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
          >
            {icon}
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarTabs;
