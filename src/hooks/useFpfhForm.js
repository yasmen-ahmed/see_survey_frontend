import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';

const initialFpfhForm = {
  installationType: '',
  proposedLocation: '',
  baseHeight: '',
  towerLeg: '',
  dcPowerSource: '',
  dcDistribution: '',
  ethernetLength: '',
  dcCableLength: '',
  earthBusExists: '',
  earthCableLength: '',
};

export const useFpfhForm = (sessionId) => {
  const [fpfhCount, setFpfhCount] = useState(1);
  const [fpfhForms, setFpfhForms] = useState(Array(6).fill().map(() => ({ ...initialFpfhForm })));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-fpfh/${sessionId}`);
        const responseData = response.data;
        
        console.log("Fetched new FPFHs data:", responseData);
        
        if (responseData) {
          // Get count from new_fpfh_installed
          const count = responseData.new_fpfh_installed || 1;
          setFpfhCount(count);
          
          // Map API data to form structure - now handling array
          const newFpfhForms = Array(6).fill().map((_, index) => {
            if (index < responseData.fpfhs?.length) {
              // Map each FPFH from the array
              const fpfhData = responseData.fpfhs[index];
              return {
                installationType: fpfhData.fpfh_installation_type || '',
                proposedLocation: fpfhData.fpfh_location || '',
                baseHeight: fpfhData.fpfh_base_height || '',
                towerLeg: fpfhData.fpfh_tower_leg || '',
                dcPowerSource: fpfhData.fpfh_dc_power_source || '',
                dcDistribution: fpfhData.dc_distribution_source || '',
                ethernetLength: fpfhData.ethernet_cable_length || '',
                dcCableLength: fpfhData.dc_power_cable_length || '',
                earthBusExists: fpfhData.earth_bus_bar_exists || '',
                earthCableLength: fpfhData.earth_cable_length || '',
              };
            }
            return { ...initialFpfhForm };
          });
          
          setFpfhForms(newFpfhForms);
        }
      } catch (err) {
        console.error("Error loading new FPFHs data:", err);
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

  const handleFpfhCountChange = (count) => {
    const newCount = parseInt(count, 10);

    // Create new array preserving existing data
    const newFpfhForms = Array(6).fill(null).map((_, index) => {
      if (index < newCount) {
        // Keep existing data for FPFHs within the new count
        return fpfhForms[index] || { ...initialFpfhForm };
      } else {
        // Clear data for FPFHs beyond the new count
        return { ...initialFpfhForm };
      }
    });

    setFpfhCount(newCount);
    setFpfhForms(newFpfhForms);
  };

  const handleChange = (fpfhIndex, field, value) => {
    setFpfhForms(prev => {
      const updated = [...prev];
      const fpfh = { ...updated[fpfhIndex] }; // Clone the specific FPFH object

      fpfh[field] = value;

      // Clear dependent fields when changing certain values
      if (field === 'proposedLocation' && value !== 'On tower') {
        fpfh.baseHeight = '';
        fpfh.towerLeg = '';
      }
      
      if (field === 'dcPowerSource' && value !== 'from the existing rectifier cabinet') {
        fpfh.dcDistribution = '';
      }

      if (field === 'earthBusExists' && value !== 'Yes') {
        fpfh.earthCableLength = '';
      }

      updated[fpfhIndex] = fpfh; // Replace with updated FPFH object

      return updated;
    });

    // Clear error for this field
    const errorKey = `${fpfhIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fpfhForms.slice(0, fpfhCount).forEach((fpfh, index) => {
      if (!fpfh.installationType) {
        newErrors[`${index}.installationType`] = 'Please select installation type';
      }
      if (!fpfh.proposedLocation) {
        newErrors[`${index}.proposedLocation`] = 'Please select proposed location';
      }
      if (!fpfh.dcPowerSource) {
        newErrors[`${index}.dcPowerSource`] = 'Please select DC power source';
      }
      if (!fpfh.ethernetLength) {
        newErrors[`${index}.ethernetLength`] = 'Please enter ethernet cable length';
      }
      if (!fpfh.dcCableLength) {
        newErrors[`${index}.dcCableLength`] = 'Please enter DC cable length';
      }
      if (!fpfh.earthBusExists) {
        newErrors[`${index}.earthBusExists`] = 'Please select earth bus bar option';
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

    setIsSubmitting(true);

    try {
      const submitData = {
        new_fpfh_installed: fpfhCount,
        fpfhs: fpfhForms.slice(0, fpfhCount).map((fpfh, index) => ({
          fpfh_index: index + 1,
          fpfh_number: '',
          fpfh_installation_type: fpfh.installationType || '',
          fpfh_location: fpfh.proposedLocation || '',
          fpfh_base_height: fpfh.baseHeight ? parseFloat(fpfh.baseHeight) : null,
          fpfh_tower_leg: fpfh.towerLeg || null,
          fpfh_dc_power_source: fpfh.dcPowerSource || '',
          dc_distribution_source: fpfh.dcDistribution || '',
          ethernet_cable_length: fpfh.ethernetLength ? parseFloat(fpfh.ethernetLength) : null,
          dc_power_cable_length: fpfh.dcCableLength ? parseFloat(fpfh.dcCableLength) : null,
          earth_bus_bar_exists: fpfh.earthBusExists || '',
          earth_cable_length: fpfh.earthCableLength ? parseFloat(fpfh.earthCableLength) : null,
        }))
      };

      console.log("Submitting new FPFHs data:", submitData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-fpfh/${sessionId}`,
        submitData
      );

      showSuccess('New FPFHs data submitted successfully!');
      console.log("Response:", response.data);
      setErrors({});
    } catch (err) {
      console.error("Error submitting new FPFHs data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fpfhCount,
    fpfhForms,
    errors,
    isLoading,
    isSubmitting,
    handleFpfhCountChange,
    handleChange,
    handleSubmit,
  };
}; 