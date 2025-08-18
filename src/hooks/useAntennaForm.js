import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';
import { antennaQuestions } from '../config/antennaQuestions';

const initialAntennaForm = {
  operator: '',
  baseHeight: '',
  towerLeg: '',
  sectorNumber: '',
  newOrSwap: '',
  technologies: [],
  azimuth: '',
  angularL1Dimension: '',
  angularL2Dimension: '',
  tubularCrossSection: '',
  towerSection: '',
  sideArmOption: '',
  sideArmLength: '',
  sideArmCrossSection: '',
  sideArmOffset: '',
  earthBusExists: '',
  earthCableLength: '',
  antennaVendor: '',
  antennaVendorOther: '',
  antennaHeight: '',
  antennaWeight: '',
  antennaDiameter: '',
};

export const useAntennaForm = (sessionId) => {
  const [antennaCount, setAntennaCount] = useState(1);
  const [antennaForms, setAntennaForms] = useState(Array(6).fill().map(() => ({ ...initialAntennaForm })));
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`);
        const data = response.data;
        
        console.log("Fetched new antennas data:", data);
        
        if (data && data.antennas) {
          const count = data.new_antennas_planned || data.antennas.length;
          setAntennaCount(count);
          
          // Map API data to form structure
          const newAntennaForms = Array(6).fill().map((_, index) => {
            if (index < data.antennas.length) {
              const antenna = data.antennas[index];
              return {
                operator: antenna.operator || '',
                baseHeight: antenna.base_height_from_tower || '',
                towerLeg: antenna.tower_leg_location || '',
                sectorNumber: antenna.sector_number || '',
                newOrSwap: antenna.new_or_swap || '',
                technologies: antenna.antenna_technology || [],
                azimuth: antenna.azimuth_angle_shift || '',
                angularL1Dimension: antenna.angular_l1_dimension || '',
                angularL2Dimension: antenna.angular_l2_dimension || '',
                tubularCrossSection: antenna.tubular_cross_section || '',
                towerSection: antenna.tower_leg_section || '',
                sideArmOption: antenna.side_arm_type || '',
                sideArmLength: antenna.side_arm_length || '',
                sideArmCrossSection: antenna.side_arm_cross_section || '',
                sideArmOffset: antenna.side_arm_offset || '',
                earthBusExists: antenna.earth_bus_bar_exists || '',
                earthCableLength: antenna.earth_cable_length || '',
                antennaVendor: antenna.antennaVendor || '',
                antennaVendorOther: antenna.antennaVendorOther || '',
                antennaHeight: antenna.antennaHeight || '',
                antennaWeight: antenna.antennaWeight || '',
                antennaDiameter: antenna.antennaDiameter || '',
              };
            }
            return { ...initialAntennaForm };
          });
          
          setAntennaForms(newAntennaForms);

          // Initialize uploaded images from existing data
          const initialImages = {};
          console.log("Processing antennas for images:", data.antennas);
          data.antennas.forEach((antenna, antennaIndex) => {
            console.log(`Antenna ${antennaIndex}:`, antenna);
            if (antenna.images && antenna.images.length > 0) {
              console.log(`Antenna ${antennaIndex} has ${antenna.images.length} images:`, antenna.images);
              antenna.images.forEach(img => {
                console.log(`Processing image:`, img);
                const unitNumber = antenna.antenna_index || antennaIndex + 1;
                let imageKey;
                
                // Determine the correct image key based on category
                if (img.category === 'proposed_location') {
                  imageKey = `new_antenna_${unitNumber}_proposed_location`;
                } else if (img.category === 'proposed_location_optional_photo') {
                  imageKey = `new_antenna_${unitNumber}_proposed_location_optional_photo`;
                } else {
                  // Handle any other categories by using the category name directly
                  imageKey = `new_antenna_${unitNumber}_${img.category}`;
                }
                
                console.log(`Mapped image to key: ${imageKey}`);
                
                // Initialize the array if it doesn't exist
                initialImages[imageKey] = initialImages[imageKey] || [];
                
                // Add the image with the full URL
                initialImages[imageKey].push({
                  id: img.id,
                  url: `${import.meta.env.VITE_API_URL}/${img.path}`,
                  file_url: img.path,
                  preview: `${import.meta.env.VITE_API_URL}/${img.path}`
                });
              });
            }
          });
          console.log("Final initialImages:", initialImages);
          setUploadedImages(initialImages);
        }
      } catch (err) {
        console.error("Error loading new antennas data:", err);
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

  const handleAntennaCountChange = (count) => {
    const newCount = parseInt(count, 10);

    // Create new array preserving existing data
    const newAntennaForms = Array(6).fill(null).map((_, index) => {
      if (index < newCount) {
        // Keep existing data for antennas within the new count
        return antennaForms[index] || { ...initialAntennaForm };
      } else {
        // Clear data for antennas beyond the new count
        return { ...initialAntennaForm };
      }
    });

    setAntennaCount(newCount);
    setAntennaForms(newAntennaForms);
    setHasUnsavedChanges(true);
  };

  const handleChange = (antennaIndex, field, value, isManual = false) => {
    setAntennaForms(prev => {
      const updated = [...prev];
      const antenna = { ...updated[antennaIndex] };
  
      // Save the value
      antenna[field] = value;
  
      // Track if this field was changed manually
      // Once true, it stays true
      if (isManual) {
        antenna[`${field}Manual`] = true;
        antenna[`${field}AutoFilled`] = false; // Remove auto-filled flag when manually changed
      } else {
        antenna[`${field}Manual`] = antenna[`${field}Manual`] || false;
      }
  
      updated[antennaIndex] = antenna;
      
      // Auto-fill logic: If change is in first antenna (index 0), propagate to other antennas
      if (antennaIndex === 0 && isManual) {
        // Auto-fill the same value to other antennas (index 1 and beyond)
        for (let i = 1; i < antennaCount; i++) {
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
  
    // Clear error for this field if exists
    const errorKey = `${antennaIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Get required fields from antennaQuestions configuration
    const requiredFields = antennaQuestions.reduce((acc, question) => {
      if (question.required) {
        acc[question.key] = question.label;
      }
      return acc;
    }, {});

    antennaForms.slice(0, antennaCount).forEach((antenna, index) => {
      // Validate all required fields
      Object.entries(requiredFields).forEach(([field, label]) => {
        const value = antenna[field];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[`${index}.${field}`] = `Please enter ${label.toLowerCase()}`;
        }
      });

      // Additional conditional validations
    
    if (!antenna.towerSection) {
        newErrors[`${index}.towerSection`] = 'Please enter tower section ';
      }
      if (antenna.towerSection === 'Angular') {
        if (!antenna.angularL1Dimension) {
          newErrors[`${index}.angularL1Dimension`] = 'Please enter L1 dimension';
        }
        if (!antenna.angularL2Dimension) {
          newErrors[`${index}.angularL2Dimension`] = 'Please enter L2 dimension';
        }
      }

      if (antenna.towerSection === 'Tubular' && !antenna.tubularCrossSection) {
        newErrors[`${index}.tubularCrossSection`] = 'Please enter cross section';
      }
      if (!antenna.sideArmOption) {
          newErrors[`${index}.sideArmOption`] = 'Please enter earth cable ';
        }

      if (antenna.sideArmOption && antenna.sideArmOption !== 'Use existing empty side arm') {
        if (!antenna.sideArmLength) {
          newErrors[`${index}.sideArmLength`] = 'Please enter side arm length';
        }
        if (!antenna.sideArmCrossSection) {
          newErrors[`${index}.sideArmCrossSection`] = 'Please enter side arm cross section';
        }
        if (!antenna.sideArmOffset) {
          newErrors[`${index}.sideArmOffset`] = 'Please enter side arm offset';
        }
      }

      if (!antenna.earthBusExists ) {
        newErrors[`${index}.earthBusExists`] = 'Please enter earth cable ';
      }
      if (antenna.earthBusExists === 'Yes' && !antenna.earthCableLength) {
        newErrors[`${index}.earthCableLength`] = 'Please enter earth cable length';
      }

      // Validate numeric fields have valid values
      const numericFields = [
        { key: 'azimuth', min: 0, max: 360, label: 'Azimuth' },
        { key: 'baseHeight', min: 0, label: 'Base height' },
        { key: 'angularL1Dimension', min: 0, label: 'L1 dimension' },
        { key: 'angularL2Dimension', min: 0, label: 'L2 dimension' },
        { key: 'tubularCrossSection', min: 0, label: 'Cross section' },
        { key: 'sideArmLength', min: 0, label: 'Side arm length' },
        { key: 'sideArmCrossSection', min: 0, label: 'Side arm cross section' },
        { key: 'sideArmOffset', min: 0, label: 'Side arm offset' },
        { key: 'earthCableLength', min: 0, max: 10, label: 'Earth cable length' }
      ];

      numericFields.forEach(({ key, min, max, label }) => {
        const value = parseFloat(antenna[key]);
        if (antenna[key] && isNaN(value)) {
          newErrors[`${index}.${key}`] = `${label} must be a number`;
        } else if (antenna[key] && value < min) {
          newErrors[`${index}.${key}`] = `${label} must be greater than ${min}`;
        } else if (max && antenna[key] && value > max) {
          newErrors[`${index}.${key}`] = `${label} must be less than ${max}`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
  
    setIsSubmitting(true);
  
    try {
      // Prepare antenna data
      const antennaData = antennaForms.slice(0, antennaCount).map((antenna, index) => ({
        antenna_index: index + 1,
        sector_number: antenna.sectorNumber || '',
        new_or_swap: antenna.newOrSwap || '',
        antenna_technology: antenna.technologies || [],
        antennaVendor: antenna.antennaVendor || '',
        antennaVendorOther: antenna.antennaVendorOther || '',
        antennaHeight: antenna.antennaHeight || '',
        antennaWeight: antenna.antennaWeight || '',
        antennaDiameter: antenna.antennaDiameter || '',
        azimuth_angle_shift: antenna.azimuth || '',
        base_height_from_tower: antenna.baseHeight || '',
        tower_leg_location: antenna.towerLeg || '',
        tower_leg_section: antenna.towerSection || '',
        angular_l1_dimension: antenna.angularL1Dimension || '',
        angular_l2_dimension: antenna.angularL2Dimension || '',
        tubular_cross_section: antenna.tubularCrossSection || '',
        side_arm_type: antenna.sideArmOption || '',
        side_arm_length: antenna.sideArmLength || '',
        side_arm_cross_section: antenna.sideArmCrossSection || '',
        side_arm_offset: antenna.sideArmOffset || '',
        earth_bus_bar_exists: antenna.earthBusExists || '',
        earth_cable_length: antenna.earthCableLength || '',
      }));

      const dataToSend = {
        new_antennas_planned: antennaCount,
        antennas: antennaData
      };

      console.log('Sending antenna data:', dataToSend);

      // Check if there are any images to upload
      const hasImages = Object.values(uploadedImages).some(files => files && files.length > 0);
      
      if (hasImages) {
        // Use FormData when images are present
        const formData = new FormData();
        formData.append('data', JSON.stringify(dataToSend));
      
        // Append images
        Object.entries(uploadedImages).forEach(([category, files]) => {
          files.forEach(file => {
            if (file instanceof File) {
              formData.append(category, file);
            }
          });
        });
      
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Use JSON when no images are present
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`,
          dataToSend,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
  
      setHasUnsavedChanges(false);
      showSuccess('New antennas data saved successfully');
    } catch (err) {
      console.error('Error saving new antennas data:', err);
      showError('Error saving new antennas data');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Function to reset manual flag for a specific field in all antennas (except first)
  const resetManualFlag = (field) => {
    setAntennaForms(prev => {
      const updated = [...prev];
      for (let i = 1; i < antennaCount; i++) {
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
    antennaCount,
    antennaForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleAntennaCountChange,
    handleChange,
    handleSubmit,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    resetManualFlag
  };
}; 