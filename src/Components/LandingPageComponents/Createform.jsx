import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const countries = ['Pakistan', 'United States', 'Germany', 'India'];
const ctsMap = {
  Pakistan: ['Karachi', 'Lahore'],
  'United States': ['New York', 'Los Angeles'],
  Germany: ['Berlin', 'Munich'],
  India: ['Mumbai', 'Delhi'],
};
const projectsMap = {
  Karachi: ['Project Kar1', 'Project Kar2'],
  Lahore: ['Project Lah1'],
  'New York': ['Project NY1'],
  'Los Angeles': ['Project LA1'],
  Berlin: ['Project Ber1'],
  Munich: ['Project Mun1'],
  Mumbai: ['Project Mum1'],
  Delhi: ['Project Del1'],
};
const companiesMap = {
  'Project Kar1': ['Company A', 'Company B'],
  'Project Kar2': ['Company C'],
  'Project Lah1': ['Company D'],
  'Project NY1': ['Company E'],
  'Project LA1': ['Company F'],
  'Project Ber1': ['Company G'],
  'Project Mun1': ['Company H'],
  'Project Mum1': ['Company I'],
  'Project Del1': ['Company J'],
};

function Createform() {
  const navigate = useNavigate();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [projects, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [companies, setCompaniesList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSiteID, setSelectedSiteID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3000/api/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setCities(ctsMap[selectedCountry] || []);
    } else {
      setCities([]);
    }
    setSelectedCity('');
    setProjectsList([]);
    setSelectedProject('');
    setCompaniesList([]);
    setSelectedCompany('');
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity) {
      setProjectsList(projectsMap[selectedCity] || []);
    } else {
      setProjectsList([]);
    }
    setSelectedProject('');
    setCompaniesList([]);
    setSelectedCompany('');
  }, [selectedCity]);

  useEffect(() => {
    if (selectedProject) {
      setCompaniesList(companiesMap[selectedProject] || []);
    } else {
      setCompaniesList([]);
    }
    setSelectedCompany('');
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = {
      site_id: selectedSiteID,
      country: selectedCountry,
      user_id: parseInt(selectedUser),
      ct: selectedCity,
      project: selectedProject,
      company: selectedCompany,
    };

    try {
      // Read JWT token from localStorage
      const token = localStorage.getItem('token');
      // Include token in Authorization header
      const response = await axios.post(
        'http://localhost:3000/api/surveys',
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
      setError('Failed to create survey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create A New Survey</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {loading && <div className="text-blue-500 mb-4">Submitting... Please wait.</div>}

        {/* Country */}
        <div className="mb-4">
          <label htmlFor="country" className="block text-gray-700 mb-2">Country:</label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          >
            <option value="">-- Select Country --</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* CT */}
        <div className="mb-4">
          <label htmlFor="city" className="block text-gray-700 mb-2">CT:</label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          >
            <option value="">-- Select CT --</option>
            {cities.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
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
          >
            <option value="">-- Select Project --</option>
            {projects.map((proj) => (
              <option key={proj} value={proj}>{proj}</option>
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
          >
            <option value="">-- Select Company --</option>
            {companies.map((comp) => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </div>

        {/* User */}
        <div className="mb-4">
          <label htmlFor="user" className="block text-gray-700 mb-2">User:</label>
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
