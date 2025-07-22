import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const questions = [
  {
    key: 'safety_climbing_system_correctly_installed',
    label: 'Safety climbing system correctly installed (fixing elements, connection screws, fall arrestors) according to safety specifications',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'walking_path_situated_safety_specifications',
    label: 'Walking path situated according to safety specifications',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'mw_antennas_height_exclusion_zone',
    label: 'Where people can walk in front of MW antennas, antennas height from walkway: exclusion zone should be clearly identified',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'non_authorized_access_antennas_prevented',
    label: 'Non-authorized access to the front of antennas and dishes adequately prevented',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'bts_pole_access_lighting_sufficient',
    label: 'BTS/Pole access lighting working and sufficient',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'safe_access_bts_poles_granted',
    label: 'Safe access to BTS and poles granted',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  },
  {
    key: 'pathway_blocks_walking_grids_installed',
    label: 'Pathway blocks/walking grids correctly installed',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable']
  }
];

const HealthAndSafetyTab2 = () => {
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
      console.log("Submitting BTS access data:", payload);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/health-safety-bts-access/${sessionId}`, payload);
      setHasUnsavedChanges(false);
      showSuccess('BTS/Antenna access data saved successfully!');
      return true;
    } catch (err) {
      console.error("Error submitting BTS access data:", err);
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/health-safety-bts-access/${sessionId}`);
        const data = response.data;

        console.log("Fetched BTS access data:", data);

        if (data && data.has_data) {
          // Initialize formData with only relevant keys
          const newFormData = {};
          questions.forEach(q => {
            newFormData[q.key] = data[q.key] || '';
          });
          setFormData(newFormData);
        }
      } catch (err) {
        console.error("Error loading BTS access data:", err);
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
      showSuccess('BTS/Antenna access data submitted successfully!');
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

export default HealthAndSafetyTab2;

