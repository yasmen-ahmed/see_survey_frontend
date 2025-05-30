import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SurveyCardList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/surveys`)
      .then((res) => setSurveys(res.data))
      .catch((err) => {
        console.error('Error fetching surveys:', err);
        setError('Failed to fetch surveys.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading surveys...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-700 text-sm uppercase">
            <th className="px-6 py-3">Session ID</th>
            <th className="px-6 py-3">Site ID</th>
            <th className="px-6 py-3">Created By</th>
            <th className="px-6 py-3">Assigned To</th>
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr key={survey.session_id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">{survey.session_id}</td>
              <td className="px-6 py-4">{survey.site_id}</td>
              <td className="px-6 py-4">{survey.createdBy?.username}</td>
              <td className="px-6 py-4">{survey.user?.username}</td>
              <td className="px-6 py-4">{survey.project}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => navigate(
                    `/sites/${survey.session_id}/${survey.site_id}/site-info/site-location`
                  )}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Continue
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SurveyCardList;
