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
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
                images: {
                  new_fpfh_proposed_location: fpfhData.images?.filter(img => img.category === 'new_fpfh_proposed_location')?.map(img => ({
                    id: img.id,
                    file_url: img.file_url
                  })) || [],
                  new_fpfh_proposed_location_optional_photo: fpfhData.images?.filter(img => img.category === 'new_fpfh_proposed_location_optional_photo')?.map(img => ({
                    id: img.id,
                    file_url: img.file_url
                  })) || []
                }
              };
            }
            return { ...initialFpfhForm };
          });
          
          setFpfhForms(newFpfhForms);

          // Set up initial images state from response
          const initialImages = {};
          responseData.fpfhs?.forEach((fpfh, index) => {
            if (fpfh.images) {
              fpfh.images.forEach(img => {
                const fpfhNumber = index + 1;
                const imageKey = img.category === `new_fpfh_${fpfhNumber}_proposed_location`
                  ? `new_fpfh_${fpfhNumber}_proposed_location`
                  : `new_fpfh_${fpfhNumber}_proposed_location_optional_photo`;
                
                initialImages[imageKey] = initialImages[imageKey] || [];
                initialImages[imageKey].push({
                  id: img.id,
                  file_url: img.file_url
                });
              });
            }
          });
          setUploadedImages(initialImages);
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
    setFpfhCount(newCount);

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

    setFpfhForms(newFpfhForms);
    setHasUnsavedChanges(true);

    // Clean up images for removed FPFHs
    setUploadedImages(prev => {
      const newImages = { ...prev };
      Object.keys(newImages).forEach(key => {
        const fpfhNumber = parseInt(key.match(/\d+/)[0]);
        if (fpfhNumber > newCount) {
          delete newImages[key];
        }
      });
      return newImages;
    });
  };

  const handleChange = (fpfhIndex, field, value, isManual = false) => {
    setFpfhForms(prev => {
      const updated = [...prev];
      const fpfh = { ...updated[fpfhIndex] }; // Clone the specific FPFH object

      // Handle image changes differently
      if (field.startsWith('images.')) {
        const imageCategory = field.split('.')[1];
        fpfh.images = {
          ...fpfh.images,
          [imageCategory]: value
        };
      } else {
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
      }
      if (isManual) {
        fpfh[`${field}Manual`] = true;
        fpfh[`${field}AutoFilled`] = false; // Remove auto-filled flag when manually changed
      } else {
        fpfh[`${field}Manual`] = fpfh[`${field}Manual`] || false;
      }

      updated[fpfhIndex] = fpfh; // Replace with updated FPFH object
 // Auto-fill logic: If change is in first antenna (index 0), propagate to other antennas
 if (fpfhIndex === 0 && isManual) {
  // Auto-fill the same value to other antennas (index 1 and beyond)
  for (let i = 1; i < fpfhCount; i++) {
    const otherAntenna = { ...updated[i] };
    
    // Only auto-fill if this field hasn't been manually changed in the other antenna
    if (!otherAntenna[`${field}Manual`]) {
      otherAntenna[field] = value;
      otherAntenna[`${field}AutoFilled`] = true; // Mark as auto-filled
      updated[i] = otherAntenna;
    }
  }
}
      return updated;
    });

    setHasUnsavedChanges(true);

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
        newErrors[`${index}.earthBusExists`] = 'Please select if earth bus exists';
      }

      // Conditional validations
      if (fpfh.proposedLocation === 'On tower') {
        if (!fpfh.baseHeight) {
          newErrors[`${index}.baseHeight`] = 'Please enter base height';
        }
        if (!fpfh.towerLeg) {
          newErrors[`${index}.towerLeg`] = 'Please select tower leg';
        }
      }

      if (fpfh.dcPowerSource === 'from the existing rectifier cabinet' && !fpfh.dcDistribution) {
        newErrors[`${index}.dcDistribution`] = 'Please select DC distribution';
      }

      if (fpfh.earthBusExists === 'Yes' && !fpfh.earthCableLength) {
        newErrors[`${index}.earthCableLength`] = 'Please enter earth cable length';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Prepare FPFH data
      const fpfhData = fpfhForms.slice(0, fpfhCount).map((fpfh, index) => ({
        fpfh_index: index + 1,
        fpfh_installation_type: fpfh.installationType,
        fpfh_location: fpfh.proposedLocation,
        fpfh_base_height: fpfh.baseHeight,
        fpfh_tower_leg: fpfh.towerLeg,
        fpfh_dc_power_source: fpfh.dcPowerSource,
        dc_distribution_source: fpfh.dcDistribution,
        ethernet_cable_length: fpfh.ethernetLength,
        dc_power_cable_length: fpfh.dcCableLength,
        earth_bus_bar_exists: fpfh.earthBusExists,
        earth_cable_length: fpfh.earthCableLength,
      }));

      const dataToSend = {
        new_fpfh_installed: fpfhCount,
        fpfhs: fpfhData
      };

      console.log('Sending FPFH data:', dataToSend);
      console.log('Current fpfhForms state:', fpfhForms.slice(0, fpfhCount));

      formData.append('data', JSON.stringify(dataToSend));

      // Append images
      Object.entries(uploadedImages).forEach(([category, files]) => {
        files.forEach(file => {
          if (file instanceof File) {
            formData.append(category, file);
          }
        });
      });

      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-fpfh/${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('New FPFHs data saved successfully');
    } catch (err) {
      console.error('Error saving new FPFHs data:', err);
      showError('Error saving new FPFHs data');
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetManualFlag = (field) => {
    setFpfhForms(prev => {
      const updated = [...prev];
      for (let i = 1; i < fpfhCount; i++) {
        if (updated[i]) {
          updated[i] = { ...updated[i] };
          delete updated[i][`${field}Manual`];
          delete updated[i][`${field}AutoFilled`];
        }
      }
      return updated;
    });
    setHasUnsavedChanges(true);
  };
  return {
    fpfhCount,
    fpfhForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleFpfhCountChange,
    handleChange,
    handleSubmit,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    resetManualFlag
  };
}; 