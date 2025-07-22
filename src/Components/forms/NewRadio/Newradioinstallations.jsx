import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const NewSectorPlanningTab = () => {
  const { sessionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const dropdownOptions = ['1', '2', '3', '4', '5', 'Not applicable'];
  
  const [formData, setFormData] = useState({
    newSectorsPlanned: 0,
    newRadioUnitsPlanned: 0,
    existingRadioUnitsSwapped: 0,
    newAntennasPlanned: 0,
    existingAntennasSwapped: 0,
    newFpfhInstalled: 0
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setIsSubmitting(true);
      const apiData = {
        new_sectors_planned: parseInt(formData.newSectorsPlanned),
        new_radio_units_planned: parseInt(formData.newRadioUnitsPlanned),
        existing_radio_units_swapped: parseInt(formData.existingRadioUnitsSwapped),
        new_antennas_planned: parseInt(formData.newAntennasPlanned),
        existing_antennas_swapped: parseInt(formData.existingAntennasSwapped),
        new_fpfh_installed: parseInt(formData.newFpfhInstalled)
      };
      
      console.log("Submitting new radio installations data:", apiData);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-radio-installations/${sessionId}`,
        apiData
      );
      
      setHasUnsavedChanges(false);
      showSuccess('New radio installations data saved successfully!');
      setErrors({});
      return true;
    } catch (err) {
      console.error("Error submitting new radio installations data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-radio-installations/${sessionId}`);
        const data = response.data.data || response.data;
        
        console.log("Fetched new radio installations data:", data);
        
        if (data) {
          setFormData({
            newSectorsPlanned: data.new_sectors_planned || 0,
            newRadioUnitsPlanned: data.new_radio_units_planned || 0,
            existingRadioUnitsSwapped: data.existing_radio_units_swapped || 0,
            newAntennasPlanned: data.new_antennas_planned || 0,
            existingAntennasSwapped: data.existing_antennas_swapped || 0,
            newFpfhInstalled: data.new_fpfh_installed || 0
          });
        }
      } catch (err) {
        console.error("Error loading new radio installations data:", err);
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

  const questions = [
    { key: 'newSectorsPlanned', label: 'How many new sectors planned?' },
    { key: 'newAntennasPlanned', label: 'How many new antenna planned?' },
    { key: 'newRadioUnitsPlanned', label: 'How many new radio unit planned?' },
    { key: 'existingAntennasSwapped', label: 'How many existing antenna will be swapped?' },
    { key: 'existingRadioUnitsSwapped', label: 'How many existing radio unit will be swapped?' },
    { key: 'newFpfhInstalled', label: 'How many new FPFH will be installed?' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setHasUnsavedChanges(true);

    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    questions.forEach(question => {
      if (!formData[question.key]) {
        newErrors[question.key] = `Please select ${question.label.toLowerCase()}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const saved = await saveDataToAPI();
    if (saved) {
      showSuccess('New radio installations data submitted successfully!');
    }
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
            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.submit}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              {questions.map((question, index) => (
                <div key={question.key} className="bg-white">
                  <div className='mb-2 font-semibold text-gray-700'>{question.label}</div>
                  <select 
                    className={`form-input ${
                      errors[question.key] ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData[question.key]}
                    onChange={(e) => handleChange(question.key, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {dropdownOptions.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {errors[question.key] && (
                    <div className="text-red-500 text-sm mt-1">{errors[question.key]}</div>
                  )}
                  <hr className="my-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded font-semibold ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'loading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSectorPlanningTab;
