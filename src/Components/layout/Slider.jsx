// SidebarTabs.jsx
import { NavLink } from "react-router-dom";
import {
  House,
  Power,
  Calendar,
  TentTree,
  RadioTower,
  CircleHelp,
} from "lucide-react";

const SidebarTabs = () => {
  const navItems = [
    { label: "Site Info", icon: <House size={20} />, path: "/sites/1/site-info/site-location" },
    { label: "AC Power", icon: <Power size={20} />, path: "/sites/1/ac-power/ac-info" },
    { label: "Room", icon: <Calendar size={20} />, path: "/sites/1/room/room-info" },
    { label: "Outdoor", icon: <TentTree size={20} />, path: "/sites/1/outdoor/general-lyout" },
    { label: "Existing Radio", icon: <RadioTower size={20} />, path: "/sites/1/existing-radio/antennas-strut" },
    { label: "New Radio", icon: <RadioTower size={20} />, path: "/sites/1/new-radio/new-antennas/" },
    { label: "H&S", icon: <CircleHelp size={20} />, path: "/sites/1/H&S/h&s" }
  ];

  return (
    <aside className="w-60 bg-white border-r p-4 min-h-screen">
      <nav className="space-y-3">
        {navItems.map(({ label, icon, path }) => (
          <NavLink
            to={path}
            key={label}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded font-bold cursor-pointer ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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
