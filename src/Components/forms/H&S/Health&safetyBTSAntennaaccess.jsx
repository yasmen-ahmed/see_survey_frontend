import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';

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
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { ...formData }; // Already in correct format
      console.log("Submitting BTS access data:", payload);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/health-safety-bts-access/${sessionId}`, payload);

      showSuccess('BTS/Antenna access data submitted successfully!');
    } catch (err) {
      console.error("Error submitting BTS access data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
      
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {questions.map(renderField)}
          
          </div>
          <div className="flex justify-center mt-8 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 text-white rounded-lg font-semibold transition-colors ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthAndSafetyTab2;

