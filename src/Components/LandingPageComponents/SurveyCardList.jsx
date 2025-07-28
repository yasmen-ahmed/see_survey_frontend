import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSurveyContext } from '../../context/SurveyContext';

const SurveyCardList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { updateSurveyData } = useSurveyContext();

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    console.log('Current user role:', role);
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
        return allStatuses.filter(status => 
          ['created', 'submitted'].includes(status.value)
        );
        
      case 'survey_engineer':
        // Survey Engineer can see Submitted and Under revision
        return allStatuses.filter(status => 
          ['submitted', 'review'].includes(status.value)
        );
        
      case 'approver':
        // Approver can see Under revision, Rework, and Approved
        return allStatuses.filter(status => 
          ['review', 'rework', 'done'].includes(status.value)
        );
        
      default:
        // Default: show all statuses
        return allStatuses;
    }
  };

  // Function to check if user can change to a specific status
  const canChangeToStatus = (currentStatus, newStatus) => {
    if (!userRole) return true;

    switch (userRole) {
      case 'admin':
        // Admin can change to any status
        return true;
        
      case 'coordinator':
        // Coordinator can only change to Created and Submitted
        return ['created', 'submitted'].includes(newStatus);
        
      case 'survey_engineer':
        // Survey Engineer can change to Submitted and Under revision
        return ['submitted', 'review'].includes(newStatus);
        
      case 'approver':
        // Approver can change to Under revision, Rework, and Approved
        return ['review', 'rework', 'done'].includes(newStatus);
        
      default:
        return true;
    }
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/surveys`)
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
      })
      .catch((err) => {
        console.error('Error fetching surveys:', err);
        setError('Failed to fetch surveys.');
      })
      .finally(() => setLoading(false));
  }, []);
  

  const handleStatusChange = async (surveyId, newStatus) => {
    try {
      // Check if user can change to this status
      const currentSurvey = surveys.find(s => s.session_id === surveyId);
      if (!canChangeToStatus(currentSurvey?.TSSR_Status, newStatus)) {
        alert(`You don't have permission to change status to "${newStatus}"`);
        return;
      }

      await updateSurveyStatus(surveyId, newStatus);
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

  const updateSurveyStatus = async (surveyId, newStatus) => {
    const token = localStorage.getItem('token');

    console.log('Updating survey status:', { surveyId, newStatus });

    // Try different API endpoint format - might need just session_id
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/surveys/${surveyId}/status`;
    console.log('API URL:', apiUrl);
    console.log('Token exists:', !!token);

    const requestBody = { TSSR_Status: newStatus };
    console.log('Request body:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
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
    // Update the context with the survey data
    updateSurveyData({
      sessionId: survey.session_id,
      siteId: survey.site_id,
      createdBy: survey.createdBy?.username,
      assignedTo: survey.user?.username,
      project: survey.project,
      status: survey.TSSR_Status
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
      {/* Role Information Display */}
      {userRole && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Current Role:</strong> {userRole.replace('_', ' ').toUpperCase()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            You can only see and change to statuses allowed for your role.
          </p>
        </div>
      )}

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
          {surveys.map((survey) => {
            const availableStatuses = getAvailableStatusOptions(survey.TSSR_Status);
            
            return (
              <tr key={survey.session_id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{survey.session_id}</td>
                <td className="px-6 py-4">{survey.site_id}</td>
                <td className="px-6 py-4">{survey.createdBy?.username}</td>
                <td className="px-6 py-4">{survey.user?.username}</td>
                <td className="px-6 py-4">{survey.project}</td>
                <td className="px-6 py-4">
                  <select
                    value={survey.TSSR_Status}
                    onChange={(e) => handleStatusChange(survey.session_id, e.target.value)}
                    className="border rounded p-1"
                    disabled={!userRole} // Disable if no role is set
                  >
                    {availableStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleContinue(survey)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue
                  </button>
                </td>
                {survey.TSSR_Status === 'submitted' && (
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
