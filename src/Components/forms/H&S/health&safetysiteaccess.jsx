import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

// QUESTION KEYS UPDATED TO MATCH API FIELDS
const questions = [
  {
    key: 'access_road_safe_condition',
    label: 'Access road in safe condition for all seasons',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'site_access_safe_secure',
    label: 'Site access safe & secure from unauthorized person',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'safe_usage_access_ensured',
    label: 'Safe usage of access (ascent, elevator, stairs, ladder) ensured',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'site_safe_environmental_influence',
    label: 'Site safe from damages by environmental influence',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'permanent_fence_correctly_installed',
    label: 'Permanent fence correctly installed around the site',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'access_egress_equipment_safe',
    label: 'Access and egress to and from the site equipment (tower, shelter etc) are safe and free from hazards',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'designated_walkway_routes_tripping',
    label: 'Designated walkway routes free of tripping and slipping hazards',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'designated_walkway_routes_radiation',
    label: 'Designated walkway routes protected from radiation hazards (antenna, microwave)',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'emergency_exits_clearly_visible',
    label: 'Emergency exits are clearly visible and free of obstacles',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'vehicles_good_condition_nsn_rules',
    label: 'Vehicles used to access the site in good condition and follow the NSN safe driving rules',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'rubbish_unused_material_removed',
    label: 'All rubbish and unused material has been removed/Site clean',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'safe_manual_handling_practices',
    label: 'Are safe manual handling practices in place',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'ladder_length_adequate',
    label: 'All ladder length long enough above exit place or other support aid\'s existing',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'special_permits_required',
    label: 'Special permits (road blocking permits, crane placement permit etc.)',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'ladders_good_condition',
    label: 'Are all ladders used for access in a good condition and free from obvious damage or defects',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  }
];

const HealthAndSafetyTab1 = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setIsSubmitting(true);
      const payload = { ...formData }; // Already in correct format
      console.log("Submitting health & safety data:", payload);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/health-safety-site-access/${sessionId}`, payload);
      setHasUnsavedChanges(false);
      showSuccess('Health & Safety data saved successfully!');
      return true;
    } catch (err) {
      console.error("Error submitting health & safety data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/health-safety-site-access/${sessionId}`);
        const data = response.data;

        console.log("Fetched health & safety data:", data);

        if (data && data.has_data) {
          // Initialize formData with only relevant keys
          const newFormData = {};
          questions.forEach(q => {
            newFormData[q.key] = data[q.key] || '';
          });
          setFormData(newFormData);
        }
      } catch (err) {
        console.error("Error loading health & safety data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      } finally {
        setIsLoading(false);
        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleChange = (field, value) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await saveDataToAPI();
    if (saved) {
      showSuccess('Health & Safety data submitted successfully!');
    }
  };

  const renderField = (question) => {
    const { key, label, options } = question;
    const value = formData[key] || '';

    return (
      <div key={key} className="mb-4">
        <label className="block font-medium mb-3 text-gray-700">{label}</label>
        <div className="flex gap-6">
          {options.map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={key}
                value={option}
                checked={value === option}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
        <hr className='mt-2'/>
      </div>
    );
  };

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">
                  ⚠️ You have unsaved changes
                </p>
                <p className="text-sm">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(renderField)}
            </div>
          </div>

          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button 
              type="submit" 
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {isSubmitting ? "loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthAndSafetyTab1;
