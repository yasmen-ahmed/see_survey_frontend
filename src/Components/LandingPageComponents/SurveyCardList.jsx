import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSurveyContext } from '../../context/SurveyContext';
import SurveyDashboard from './SurveyDashboard';
import SurveyFilters from './SurveyFilters';

const SurveyCardList = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [statusHistory, setStatusHistory] = useState({});
  const [showHistory, setShowHistory] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();
  const { updateSurveyData } = useSurveyContext();

  // Filter surveys based on active filters
  const applyFilters = (surveysToFilter, filters) => {
    return surveysToFilter.filter(survey => {
      // Project filter
      if (filters.project && (survey.project || survey.projectData?.name) !== filters.project) {
        return false;
      }
      
      // Site name filter
      if (filters.siteName && survey.site_id !== filters.siteName) {
        return false;
      }
      
      // Status filter
      if (filters.status && survey.TSSR_Status !== filters.status) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          survey.session_id?.toString(),
          survey.site_id?.toString(),
          survey.project,
          survey.projectData?.name,
          survey.createdBy?.username,
          survey.user?.username,
          survey.TSSR_Status
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Update filtered surveys when surveys or filters change
  useEffect(() => {
    const filtered = applyFilters(surveys, activeFilters);
    setFilteredSurveys(filtered);
  }, [surveys, activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Get user role from localStorage and listen for role changes
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    setUserRole(role);
    console.log('Current user role:', role);
    console.log('Current token exists:', !!token);
    
    // Test the token by making a simple request
    if (token) {
      console.log('Testing token with test endpoint...');
      axios.get(`${import.meta.env.VITE_API_URL}/api/surveys/test`)
        .then(response => {
          console.log('Test endpoint response:', response.data);
        })
        .catch(error => {
          console.error('Test endpoint error:', error);
        });
    }

    // Listen for role changes from the header
    const handleRoleChange = (event) => {
      const newRole = event.detail.role;
      console.log('Role changed to:', newRole);
      setUserRole(newRole);
      
      // Optionally refetch surveys with new role permissions
      // This will be handled by the existing useEffect that depends on userRole
    };

    window.addEventListener('roleChanged', handleRoleChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  // Function to get available status options based on user role
  const getAvailableStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'created', label: 'Created' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'review', label: 'Under revision' },
      { value: 'rework', label: 'Rework' },
      { value: 'done', label: 'Approved' }
    ];

    // If no role, show all statuses
    if (!userRole) {
      return allStatuses;
    }

    // Role-based status visibility
    switch (userRole) {
      case 'admin':
        // Admin can see and change to all statuses
        return allStatuses;
        
      case 'coordinator':
        // Coordinator can only see Created and Submitted
        return allStatuses;
        
      case 'survey_engineer':
        // Survey Engineer can see all statuses but only change to submitted
        return allStatuses;
        
      case 'approver':
        // Approver can see all statuses but some are disabled
        return allStatuses;
        
      default:
        // Default: show all statuses
        return allStatuses;
    }
  };

  // Function to check if a specific status option should be disabled
  const isStatusDisabled = (statusValue, currentStatus) => {
    if (!userRole) return false;

    switch (userRole) {
      case 'admin':
        // Admin can change to any status
        return false;
        
      case 'coordinator':
        // Coordinator dropdown is completely disabled
        return true;
        
      case 'survey_engineer':
        // Survey Engineer can only change to 'submitted'
        return statusValue !== 'submitted';
        
      case 'approver':
        // Approver cannot change 'created' and 'submitted' statuses, but can change to 'under review'
        return ['created', 'submitted'].includes(statusValue);
        
      default:
        return false;
    }
  };

  // Function to check if the entire dropdown should be disabled
  const isDropdownDisabled = () => {
    if (!userRole) return false;
    
    // Coordinator dropdown is completely disabled
    return userRole === 'coordinator';
  };

  // Function to check if user can change to a specific status
  const canChangeToStatus = (currentStatus, newStatus) => {
    if (!userRole) return true;

    switch (userRole) {
      case 'admin':
        // Admin can change to any status
        return true;
        
      case 'coordinator':
        // Coordinator cannot change any status
        return false;
        
      case 'survey_engineer':
        // Survey Engineer can only change to 'submitted'
        return newStatus === 'submitted';
        
      case 'approver':
        // Approver cannot change 'created' and 'submitted' statuses, but can change to 'under review'
        return !['created', 'submitted'].includes(newStatus);
        
      default:
        return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    console.log('Token from localStorage:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Current userRole for fetching surveys:', userRole);
    console.log('Token payload:', token ? JSON.parse(atob(token.split('.')[1])) : 'No token');
    
    if (!token) {
      setError('Authentication token not found. Please login again.');
      setLoading(false);
      return;
    }

    console.log('Making API request with token:', `Bearer ${token}`);

    // The backend handles role-based filtering through the JWT token
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/surveys`;
    console.log('API URL:', apiUrl);

    axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        let fetchedSurveys = [];
  
        if (Array.isArray(res.data)) {
          fetchedSurveys = res.data;
        } else if (res.data && Array.isArray(res.data.surveys)) {
          fetchedSurveys = res.data.surveys;
        }
  
        // Sort by session_id here
        fetchedSurveys.sort((a, b) => {
          const aId = a.session_id?.toString().toLowerCase() ?? '';
          const bId = b.session_id?.toString().toLowerCase() ?? '';
          return aId.localeCompare(bId);
        });
  
        setSurveys(fetchedSurveys);
        console.log(`Fetched ${fetchedSurveys.length} surveys for role: ${userRole}`);
      })
      .catch((err) => {
        console.error('Error fetching surveys:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError('Failed to fetch surveys.');
        }
      })
      .finally(() => setLoading(false));
  }, [userRole]); // Add userRole as dependency
  

  const handleStatusChange = async (surveyId, newStatus) => {
    try {
      // Check if user can change to this status
      const currentSurvey = surveys.find(s => s.session_id === surveyId);
      if (!canChangeToStatus(currentSurvey?.TSSR_Status, newStatus)) {
        alert(`You don't have permission to change status to "${newStatus}"`);
        return;
      }

      // Optional: Prompt for notes when changing status
      let notes = '';
      // if (newStatus === 'review' || newStatus === 'rework') {
      //   notes = prompt(`Please provide a reason for changing status to "${newStatus}":`) || '';
      // }

      await updateSurveyStatus(surveyId, newStatus, notes);
      setSurveys(prevSurveys =>
        prevSurveys.map(survey =>
          survey.session_id === surveyId
            ? { ...survey, TSSR_Status: newStatus }
            : survey
        )
      );
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  function generateReport(sessionId) {
    window.open(`http://10.129.10.227:3000/api/export/site/${sessionId}`, '_blank');
    console.log('Generating report for session:', sessionId);
  };

  const fetchStatusHistory = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/surveys/${sessionId}/status-history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setStatusHistory(prev => ({
        ...prev,
        [sessionId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching status history:', error);
      alert('Failed to fetch status history');
    }
  };

  const toggleHistory = (sessionId) => {
    if (!statusHistory[sessionId]) {
      fetchStatusHistory(sessionId);
    }
    setShowHistory(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const updateSurveyStatus = async (surveyId, newStatus, notes = '') => {
    const token = localStorage.getItem('token');

    console.log('Updating survey status:', { surveyId, newStatus });

    console.log('Updating survey status:', { surveyId, newStatus, notes });

    const apiUrl = `${import.meta.env.VITE_API_URL}/api/surveys/${surveyId}/status`;
    console.log('API URL:', apiUrl);

    const requestBody = { 
      TSSR_Status: newStatus,
      notes: notes
    };
    console.log('Request body:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`Failed to update status: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json().catch(() => ({}));
    console.log('Success response:', responseData);
    return responseData;
  };

  const handleContinue = (survey) => {
    // Determine if user should be in read-only mode (admin or coordinator)
    const isReadOnly = userRole === 'admin' || userRole === 'coordinator' || (userRole === 'survey_engineer' && ( survey.TSSR_Status == 'submitted' || survey.TSSR_Status == 'review')) || (userRole === 'approver' && survey.TSSR_Status == 'done' ) ;
    
    // Update the context with the survey data
    updateSurveyData({
      sessionId: survey.session_id,
      siteId: survey.site_id,
      createdBy: survey.createdBy?.username,
      assignedTo: survey.user?.username,
      project: survey.project,
      status: survey.TSSR_Status,
      role: userRole,
      readOnly: isReadOnly
    });

    // Navigate to the site page
    navigate(`/sites/${survey.session_id}/${survey.site_id}/site-info/site-location`);
  };

  if (loading) {
    return <div className="p-6">Loading surveys...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 overflow-x-auto">
        {/* Survey Dashboard */}
        <SurveyDashboard surveys={filteredSurveys} userRole={userRole} />
      {/* Survey Filters */}
      <SurveyFilters surveys={surveys} onFilterChange={handleFilterChange} />
      
    

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredSurveys.length} of {surveys.length} surveys
          {Object.values(activeFilters).some(filter => filter) && (
            <span className="ml-2 text-blue-600">
              (filtered)
            </span>
          )}
        </div>
      </div>

      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-700 text-sm uppercase">
            <th className="px-6 py-3">Session ID</th>
            <th className="px-6 py-3">Site ID</th>
            <th className="px-6 py-3">Created By</th>
            <th className="px-6 py-3">Assigned To</th>
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3">TSSR Status</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Report</th>
          </tr>
        </thead>
        <tbody>
          {filteredSurveys.map((survey) => {
            const availableStatuses = getAvailableStatusOptions(survey.TSSR_Status);
            
            return (
              <tr key={survey.session_id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{survey.session_id}</td>
                <td className="px-6 py-4">{survey.site_id}</td>
                <td className="px-6 py-4">{survey.createdBy?.username}</td>
                <td className="px-6 py-4">{survey.user?.username}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{survey.projectData?.name || survey.project}</div>
                  {/* {survey.projectData?.code && (
                    <div className="text-xs text-gray-500">Code: {survey.projectData.code}</div>
                  )} */}
                </td>
              
              
                <td className="px-6 py-4">
                  <select
                    value={survey.TSSR_Status}
                    onChange={(e) => handleStatusChange(survey.session_id, e.target.value)}
                    className="border rounded p-1"
                    disabled={isDropdownDisabled()}
                  >
                    {availableStatuses.map((status) => (
                      <option 
                        key={status.value} 
                        value={status.value}
                        disabled={isStatusDisabled(status.value, survey.TSSR_Status)}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                {!(
  userRole === 'approver' && survey.TSSR_Status === 'submitted'
) && (
  <td className="px-6 py-4">
    <button
      onClick={() => handleContinue(survey)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Continue
    </button>
  </td>
)}

              
                {survey.TSSR_Status === 'done' && userRole != 'survey_engineer' && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => generateReport(survey.session_id)}
                      className="bg-green-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Generate
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SurveyCardList;
