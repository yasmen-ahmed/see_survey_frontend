import { useState ,useEffect} from "react";

// components/Header.js
const Header=()=> {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

    return (
      <div className="bg-white shadow p-0 flex justify-between items-center">
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
           Welcome, {username}
{/*             
            {role && (
              <div> {role}</div>
            )} */}
          </p>
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