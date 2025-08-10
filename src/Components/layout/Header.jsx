import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// components/Header.js
const Header = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    setIsRoleDropdownOpen(false); // Close role dropdown when main dropdown opens
  };

  const toggleRoleDropdown = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsRoleDropdownOpen(prev => !prev);
    // Keep the main dropdown open when role dropdown opens
  };

  useEffect(() => {
    const storedfirst = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");
    if (storedfirst) {
      setName(storedfirst);
    }
    if (storedRole) {
      setCurrentRole(storedRole);
    }
    fetchUserRoles();

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close if clicking outside the entire dropdown area
        setIsOpen(false);
        setIsRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Try to get roles from localStorage first (faster)
      const storedRoles = localStorage.getItem("userRoles");
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          setUserRoles(parsedRoles);
          setLoading(false);
          return; // Use stored roles if available
        } catch (e) {
          console.error("Error parsing stored roles:", e);
        }
      }

      // If no stored roles, fetch from API
      try {
        // Decode the JWT token to get the user ID
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.userId;
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user-management/users/${userId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setUserRoles(response.data.data);
          // Store the roles for future use
          localStorage.setItem("userRoles", JSON.stringify(response.data.data));
        }
      } catch (apiError) {
        console.error("Error fetching user roles from API:", apiError);
        // If API fails, try to use any available stored roles
        if (storedRoles) {
          try {
            setUserRoles(JSON.parse(storedRoles));
          } catch (e) {
            console.error("Error parsing stored roles:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchUserRoles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token available for role change");
        return;
      }

      // Call the API to refresh the token with the new role
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
        { role: roleName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.token) {
        // Update the token in localStorage
        localStorage.setItem("token", response.data.token);
        setCurrentRole(roleName);
        localStorage.setItem("role", roleName);
        
        setIsRoleDropdownOpen(false);
        setIsOpen(false);
        
        // Show a brief message that role has changed
        const event = new CustomEvent('roleChanged', { detail: { role: roleName } });
        window.dispatchEvent(event);
        
        // Refresh the page after a short delay to apply role changes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change role. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("userRoles");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white shadow p-0 fixed top-0 left-0 w-full h-20 z-30 grid grid-cols-3">
      <div className="px-6">
        <img
          src="/Noki.png"
          alt="Nokia Logo"
          className="h-20 w-30 object-contain "
        />
      </div>
      <div className="flex justify-center items-center gap-2">
        <h1 className="text-xl font-extrabold">SEE Survey v1.10</h1>
       
      </div>
      <div className="flex justify-center items-center gap-3">
        <div className="font-semibold grid grid-cols-1">
          <p className="capitalize">Welcome, {name}</p>
          {currentRole && (
            <p className="text-sm text-gray-600 capitalize">
              Role: {currentRole.replace('_', ' ')}
            </p>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <ChevronDown className="cursor-pointer" onClick={toggleDropdown} />

          {isOpen && (
            <div 
              className="absolute top-9 right-0 bg-white shadow-xl rounded-md p-2 min-w-48 z-50"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="relative">
                <button 
                  onClick={toggleRoleDropdown}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center justify-between ${
                    isRoleDropdownOpen ? 'bg-gray-100' : ''
                  }`}
                >
                  Change Role
                  <ChevronDown className={`w-4 h-4 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isRoleDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 min-w-48 z-50"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    {loading ? (
                      <div className="px-3 py-2 text-gray-500">Loading roles...</div>
                    ) : userRoles.length > 0 ? (
                      userRoles.map((role) => (
                        <button
                          key={role.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleChange(role.name);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded block ${
                            currentRole === role.name ? 'bg-blue-100 text-blue-700 font-medium' : ''
                          }`}
                        >
                          {role.name.replace('_', ' ').toUpperCase()}
                          {currentRole === role.name && ' ✓'}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">No roles available</div>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded block"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <img
          src="https://globalfundccm.org.ug/wp-content/uploads/2024/02/blank-profile-picture-973460_1280-modified.png"
          alt="Profile of Amgad Salem"
          className="h-10 w-10 rounded-full object-cover"
        />
        <Link to={'/landingpage?view=surveys'}> 
          <IoHomeOutline className="text-2xl"/>
        </Link>
      </div>
    </div>
  );
}

export default Header;