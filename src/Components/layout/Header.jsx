import { useState ,useEffect} from "react";
import { ChevronDown  } from "lucide-react";

// components/Header.js
const Header=()=> {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };
  useEffect(() => {
    const storedfirst = localStorage.getItem("name");
    if (storedfirst) {
      setName(storedfirst);
    }
   
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

    return (
      <div className="bg-white shadow p-0 fixed top-0 left-0 w-full h-20 z-30 grid grid-cols-3">
        <div  className="px-6">
          <img
            src="/Noki.png"
            alt="Nokia Logo"
            className="h-20 w-30 object-contain "
          />
        </div>
        <div className="flex justify-center items-center gap-2"> 
        <h1 className="text-xl font-extrabold">SEE Survey</h1>
        {/* <div className="flex items-center justify-center">
          <span className=" font-bold text-black-500">Alfa v2</span>
        </div> */}
        </div>
        <div className="flex justify-center items-center gap-3">
          <p className="font-semibold grid grid-cols-1 capitalize">
           Welcome, {name}
          </p>
          <div className="relative">
      <ChevronDown className="cursor-pointer" onClick={toggleDropdown} />
      
      {isOpen && (
        <div className="absolute top-9 right-0 bg-gray-100 shadow-xl rounded-md p-2">
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
        
          <img
            src="https://globalfundccm.org.ug/wp-content/uploads/2024/02/blank-profile-picture-973460_1280-modified.png"
            alt="Profile of Amgad Salem"
            className="h-10 w-10 rounded-full object-cover"
          />
         
        
        </div>
      </div>
    );
  }
  export default Header;