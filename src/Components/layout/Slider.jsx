// SidebarTabs.jsx
import { NavLink, useLocation } from "react-router-dom";
import {
  House,
  Power,
  Calendar,
  TentTree,
  RadioTower,
  CircleHelp,
} from "lucide-react";
import { useParams } from "react-router-dom";

const SidebarTabs = () => {  
  const { sessionId, siteId } = useParams(); 
  const location = useLocation();
  
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
    { 
      label: "Room", 
      icon: <Calendar size={20} />, 
      path: `/sites/${sessionId}/${siteId}/room/room-info`,
      section: "room"
    },
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
    }
  ];

  // Function to check if current path includes the section
  const isSectionActive = (section) => {
    return location.pathname.includes(`/${section}/`);
  };

  return (
    <aside className="w-60 bg-white border-r p-4 fixed top-20 left-0 h-[calc(100vh-5rem)] z-30 overflow-y-auto">
      <nav className="space-y-3">
        {navItems.map(({ label, icon, path, section }) => (
          <NavLink
            to={path}
            key={label}
            className={() =>
              `flex items-center gap-2 px-3 py-2 rounded font-bold cursor-pointer ${
                isSectionActive(section) ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarTabs;
