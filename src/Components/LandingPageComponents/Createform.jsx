import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Createform() {
  const navigate = useNavigate();

  // State for hierarchical data
  const [mus, setMus] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cts, setCts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);

  // State for selected values
  const [selectedMU, setSelectedMU] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCT, setSelectedCT] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSiteID, setSelectedSiteID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load MUs on component mount
  useEffect(() => {
    const fetchMUs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/hierarchical-data/mus`);
        setMus(response.data);
      } catch (error) {
        console.error('Error fetching MUs:', error);
        setError('Failed to fetch MUs.');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users.');
      }
    };

    fetchMUs();
    fetchUsers();
  }, []);

  // Fetch countries when MU changes
  useEffect(() => {
    if (selectedMU) {
      const fetchCountries = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/hierarchical-data/countries/${selectedMU}`);
          setCountries(response.data);
        } catch (error) {
          console.error('Error fetching countries:', error);
          setError('Failed to fetch countries.');
        }
      };
      fetchCountries();
    } else {
      setCountries([]);
    }
    // Reset dependent fields
    setSelectedCountry('');
    setSelectedCT('');
    setSelectedProject('');
    setSelectedCompany('');
    setCts([]);
    setProjects([]);
    setCompanies([]);
  }, [selectedMU]);

  // Fetch CTs when country changes
  useEffect(() => {
    if (selectedCountry) {
      const fetchCTs = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/hierarchical-data/cts/${selectedCountry}`);
          setCts(response.data);
        } catch (error) {
          console.error('Error fetching CTs:', error);
          setError('Failed to fetch CTs.');
        }
      };
      fetchCTs();
    } else {
      setCts([]);
    }
    // Reset dependent fields
    setSelectedCT('');
    setSelectedProject('');
    setSelectedCompany('');
    setProjects([]);
    setCompanies([]);
  }, [selectedCountry]);

  // Fetch projects when CT changes
  useEffect(() => {
    if (selectedCT) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/hierarchical-data/projects/${selectedCT}`);
          setProjects(response.data);
        } catch (error) {
          console.error('Error fetching projects:', error);
          setError('Failed to fetch projects.');
        }
      };
      fetchProjects();
    } else {
      setProjects([]);
    }
    // Reset dependent fields
    setSelectedProject('');
    setSelectedCompany('');
    setCompanies([]);
  }, [selectedCT]);

  // Fetch companies when project changes
  useEffect(() => {
    if (selectedProject) {
      const fetchCompanies = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/hierarchical-data/companies/${selectedProject}`);
          setCompanies(response.data);
        } catch (error) {
          console.error('Error fetching companies:', error);
          setError('Failed to fetch companies.');
        }
      };
      fetchCompanies();
    } else {
      setCompanies([]);
    }
    // Reset dependent field
    setSelectedCompany('');
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = {
      site_id: selectedSiteID,
      mu_id: parseInt(selectedMU),
      country_id: parseInt(selectedCountry),
      ct_id: parseInt(selectedCT),
      project_id: parseInt(selectedProject),
      company_id: parseInt(selectedCompany),
      user_id: parseInt(selectedUser),
    };

    try {
      // Read JWT token from localStorage
      const token = localStorage.getItem('token');
      
      // Debug: Check if token exists
      console.log('Token exists:', !!token);
      console.log('Token value:', token);
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      // Include token in Authorization header
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/surveys`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess('Survey created successfully!');
        navigate('/landingpage');
      } else {
        setError('Unexpected response status.');
      }
    } catch (err) {
      console.error('Error posting form data:', err);
      
      if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to create surveys or your session has expired. Please login again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(`Failed to create survey: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full  p-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full mx-auto max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create A New Survey</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {loading && <div className="text-blue-500 mb-4">Submitting... Please wait.</div>}

        {/* MU */}
        <div className="mb-4">
          <label htmlFor="mu" className="block text-gray-700 mb-2">Market Unit (MU):</label>
          <select
            id="mu"
            value={selectedMU}
            onChange={(e) => setSelectedMU(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          >
            <option value="">-- Select MU --</option>
            {mus.map((mu) => (
              <option key={mu.id} value={mu.id}>{mu.name} ({mu.code})</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="mb-4">
          <label htmlFor="country" className="block text-gray-700 mb-2">Country:</label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={!selectedMU}
          >
            <option value="">-- Select Country --</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>{country.name} ({country.code})</option>
            ))}
          </select>
        </div>

        {/* CT */}
        <div className="mb-4">
          <label htmlFor="ct" className="block text-gray-700 mb-2">CT (City/Territory):</label>
          <select
            id="ct"
            value={selectedCT}
            onChange={(e) => setSelectedCT(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={!selectedCountry}
          >
            <option value="">-- Select CT --</option>
            {cts.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.name} ({ct.code})</option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div className="mb-4">
          <label htmlFor="project" className="block text-gray-700 mb-2">Project:</label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={!selectedCT}
          >
            <option value="">-- Select Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name} ({project.code})</option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div className="mb-4">
          <label htmlFor="company" className="block text-gray-700 mb-2">Company:</label>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
            disabled={!selectedProject}
          >
            <option value="">-- Select Company --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name} ({company.code})</option>
            ))}
          </select>
        </div>

        {/* User */}
        <div className="mb-4">
          <label htmlFor="user" className="block text-gray-700 mb-2">Assign To:</label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>

        {/* Site ID */}
        <div className="mb-4">
          <label htmlFor="siteId" className="block text-gray-700 mb-2">Site ID:</label>
          <input
            type="text"
            id="siteId"
            value={selectedSiteID}
            onChange={(e) => setSelectedSiteID(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Create Survey'}
        </button>
      
      </form>
    </div>
  );
}

export default Createform;
