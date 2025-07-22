import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';

const initialRadioForm = {
  sector: '',
  antennaConnection: '',
  technologies: [],
  model: '',
  location: '',
  feederLength: '',
  towerLegSection: '',
  angularDimensions: '',
  tubularSection: '',
  sideArmOption: '',
  sideArmLength: '',
  sideArmCrossSection: '',
  sideArmOffset: '',
  dcPowerSource: '',
  dcCableLength: '',
  fiberLength: '',
  jumperLength: '',
  earthBusExists: '',
  earthCableLength: '',
};

export const useRadioUnitsForm = (sessionId) => {
  const [radioUnitsCount, setRadioUnitsCount] = useState(1);
  const [radioUnitsForms, setRadioUnitsForms] = useState(Array(6).fill().map(() => ({ ...initialRadioForm })));
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`);
        const responseData = response.data;
        
        console.log("Fetched new radio units data:", responseData);
        
        if (responseData && responseData.radio_units) {
          // Get count from new_radio_units_planned or total_radio_units
          const count = responseData.new_radio_units_planned || responseData.total_radio_units || 1;
          setRadioUnitsCount(count);
          
          // Map API data to form structure - handling multiple radio units
          const newRadioUnitsForms = Array(6).fill().map((_, index) => {
            if (index < responseData.radio_units.length) {
              const radioUnit = responseData.radio_units[index];
              return {
                sector: radioUnit.new_radio_unit_sector || '',
                antennaConnection: radioUnit.connected_to_antenna || '',
                technologies: radioUnit.connected_antenna_technology || [],
                model: radioUnit.new_radio_unit_model || '',
                location: radioUnit.radio_unit_location || '',
                feederLength: radioUnit.feeder_length_to_antenna ? radioUnit.feeder_length_to_antenna.toString() : '',
                towerLegSection: radioUnit.tower_leg_section || '',
                angularDimensions: radioUnit.angular_l1_dimension && radioUnit.angular_l2_dimension 
                  ? `${radioUnit.angular_l1_dimension} x ${radioUnit.angular_l2_dimension}` 
                  : '',
                tubularSection: radioUnit.tubular_cross_section ? radioUnit.tubular_cross_section.toString() : '',
                sideArmOption: radioUnit.side_arm_type || '',
                sideArmLength: radioUnit.side_arm_length ? radioUnit.side_arm_length.toString() : '',
                sideArmCrossSection: radioUnit.side_arm_cross_section ? radioUnit.side_arm_cross_section.toString() : '',
                sideArmOffset: radioUnit.side_arm_offset ? radioUnit.side_arm_offset.toString() : '',
                dcPowerSource: radioUnit.dc_power_source || '',
                dcCableLength: radioUnit.dc_power_cable_length ? radioUnit.dc_power_cable_length.toString() : '',
                fiberLength: radioUnit.fiber_cable_length ? radioUnit.fiber_cable_length.toString() : '',
                jumperLength: radioUnit.jumper_length ? radioUnit.jumper_length.toString() : '',
                earthBusExists: radioUnit.earth_bus_bar_exists || '',
                earthCableLength: radioUnit.earth_cable_length ? radioUnit.earth_cable_length.toString() : '',
              };
            }
            return { ...initialRadioForm };
          });
          
          setRadioUnitsForms(newRadioUnitsForms);

          // Set up initial images state from response
          const initialImages = {};
          responseData.radio_units.forEach((unit, index) => {
            if (unit.images && unit.images.length > 0) {
              unit.images.forEach(img => {
                const unitNumber = unit.radio_unit_index;
                let imageKey;
                
                // Determine the correct image key based on category
                if (img.category === 'proposed_location') {
                  imageKey = `new_radio_unit_${unitNumber}_proposed_location`;
                } else {
                  imageKey = `new_radio_unit_${unitNumber}_proposed_location_optional_photo`;
                }
                
                // Initialize the array if it doesn't exist
                initialImages[imageKey] = initialImages[imageKey] || [];
                
                // Add the image with the full URL
                initialImages[imageKey].push({
                  id: img.id,
                  url: `${import.meta.env.VITE_API_URL}/${img.file_url}`,
                  file_url: img.file_url,
                  preview: `${import.meta.env.VITE_API_URL}/${img.file_url}`
                });
              });
            }
          });
          
          console.log("Initialized images:", initialImages);
          setUploadedImages(initialImages);
        }
      } catch (err) {
        console.error("Error loading new radio units data:", err);
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

  const handleRadioUnitsCountChange = (count) => {
    const newCount = parseInt(count, 10);

    // Create new array preserving existing data
    const newRadioUnitsForms = Array(6).fill(null).map((_, index) => {
      if (index < newCount) {
        // Keep existing data for radio units within the new count
        return radioUnitsForms[index] || { ...initialRadioForm };
      } else {
        // Clear data for radio units beyond the new count
        return { ...initialRadioForm };
      }
    });

    setRadioUnitsCount(newCount);
    setRadioUnitsForms(newRadioUnitsForms);
    setHasUnsavedChanges(true);

    // Clean up images for removed radio units
    setUploadedImages(prev => {
      const newImages = { ...prev };
      Object.keys(newImages).forEach(key => {
        const unitNumber = parseInt(key.match(/\d+/)[0]);
        if (unitNumber > newCount) {
          delete newImages[key];
        }
      });
      return newImages;
    });
  };

  const handleChange = (radioUnitIndex, field, value) => {
    console.log(`HandleChange called: radioUnitIndex=${radioUnitIndex}, field=${field}, value=${value}`);
    
    setRadioUnitsForms(prev => {
      const updated = [...prev];
      const radioUnit = { ...updated[radioUnitIndex] }; // Clone the specific radio unit object

      if (field === 'technologies') {
        const currentTechs = radioUnit.technologies || [];
        radioUnit.technologies = currentTechs.includes(value)
          ? currentTechs.filter(t => t !== value)
          : [...currentTechs, value];
      } else {
        radioUnit[field] = value;
      }

      // Clear dependent fields when changing certain values
      if (field === 'location') {
        if (!value.includes('Tower leg')) {
          radioUnit.towerLegSection = '';
          radioUnit.angularDimensions = '';
          radioUnit.tubularSection = '';
        }
        if (value !== 'On the ground') {
          radioUnit.feederLength = '';
        }
      }
      
      if (field === 'towerLegSection') {
        if (value !== 'Angular') {
          radioUnit.angularDimensions = '';
        }
        if (value !== 'Tubular') {
          radioUnit.tubularSection = '';
        }
        console.log(`Tower leg section changed to: ${value}, angularDimensions cleared: ${radioUnit.angularDimensions}`);
      }

      if (field === 'earthBusExists' && value !== 'Yes') {
        radioUnit.earthCableLength = '';
      }

      updated[radioUnitIndex] = radioUnit;
      return updated;
    });

    setHasUnsavedChanges(true);

    // Clear error for this field
    const errorKey = `${radioUnitIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    radioUnitsForms.slice(0, radioUnitsCount).forEach((radioUnit, index) => {
      // Required fields validation
      if (!radioUnit.sector) {
        newErrors[`${index}.sector`] = 'Please select sector';
      }
      if (!radioUnit.antennaConnection) {
        newErrors[`${index}.antennaConnection`] = 'Please select antenna connection';
      }
      if (!radioUnit.technologies || radioUnit.technologies.length === 0) {
        newErrors[`${index}.technologies`] = 'Please select at least one technology';
      }
      if (!radioUnit.model) {
        newErrors[`${index}.model`] = 'Please enter radio unit model';
      }
      if (!radioUnit.location) {
        newErrors[`${index}.location`] = 'Please select location';
      }
      if (!radioUnit.dcPowerSource) {
        newErrors[`${index}.dcPowerSource`] = 'Please select DC power source';
      }
      if (!radioUnit.dcCableLength) {
        newErrors[`${index}.dcCableLength`] = 'Please enter DC cable length';
      }
      if (!radioUnit.fiberLength) {
        newErrors[`${index}.fiberLength`] = 'Please enter fiber cable length';
      }
      if (!radioUnit.jumperLength) {
        newErrors[`${index}.jumperLength`] = 'Please enter jumper length';
      }
      if (!radioUnit.earthBusExists) {
        newErrors[`${index}.earthBusExists`] = 'Please select if earth bus exists';
      }

      // Conditional validations
      if (radioUnit.location === 'On the ground' && !radioUnit.feederLength) {
        newErrors[`${index}.feederLength`] = 'Please enter feeder length';
      }

      if (radioUnit.location.includes('Tower leg')) {
        if (!radioUnit.towerLegSection) {
          newErrors[`${index}.towerLegSection`] = 'Please select tower leg section';
        }

        if (radioUnit.towerLegSection === 'Angular' && !radioUnit.angularDimensions) {
          newErrors[`${index}.angularDimensions`] = 'Please enter angular dimensions';
        }

        if (radioUnit.towerLegSection === 'Tubular' && !radioUnit.tubularSection) {
          newErrors[`${index}.tubularSection`] = 'Please enter tubular section';
        }
      }

      if (radioUnit.earthBusExists === 'Yes' && !radioUnit.earthCableLength) {
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

      // Prepare radio unit data
      const radioUnitsData = radioUnitsForms.slice(0, radioUnitsCount).map((radioUnit, index) => {
        const [l1, l2] = (radioUnit.angularDimensions || '').split('x').map(d => d.trim());
        
        return {
          radio_unit_index: index + 1,
          new_radio_unit_sector: radioUnit.sector,
          connected_to_antenna: radioUnit.antennaConnection,
          connected_antenna_technology: radioUnit.technologies,
          new_radio_unit_model: radioUnit.model,
          radio_unit_location: radioUnit.location,
          feeder_length_to_antenna: radioUnit.feederLength ? parseFloat(radioUnit.feederLength) : null,
          tower_leg_section: radioUnit.towerLegSection,
          angular_l1_dimension: l1 || null,
          angular_l2_dimension: l2 || null,
          tubular_cross_section: radioUnit.tubularSection ? parseFloat(radioUnit.tubularSection) : null,
          side_arm_type: radioUnit.sideArmOption,
          side_arm_length: radioUnit.sideArmLength ? parseFloat(radioUnit.sideArmLength) : null,
          side_arm_cross_section: radioUnit.sideArmCrossSection ? parseFloat(radioUnit.sideArmCrossSection) : null,
          side_arm_offset: radioUnit.sideArmOffset ? parseFloat(radioUnit.sideArmOffset) : null,
          dc_power_source: radioUnit.dcPowerSource,
          dc_power_cable_length: radioUnit.dcCableLength ? parseFloat(radioUnit.dcCableLength) : null,
          fiber_cable_length: radioUnit.fiberLength ? parseFloat(radioUnit.fiberLength) : null,
          jumper_length: radioUnit.jumperLength ? parseFloat(radioUnit.jumperLength) : null,
          earth_bus_bar_exists: radioUnit.earthBusExists,
          earth_cable_length: radioUnit.earthCableLength ? parseFloat(radioUnit.earthCableLength) : null,
        };
      });

      const dataToSend = {
        new_radio_units_planned: radioUnitsCount,
        radio_units: radioUnitsData
      };

      console.log('Sending radio units data:', dataToSend);
      console.log('Current radioUnitsForms state:', radioUnitsForms.slice(0, radioUnitsCount));

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
        `${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('New radio units data saved successfully');
    } catch (err) {
      console.error('Error saving new radio units data:', err);
      showError('Error saving new radio units data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    radioUnitsCount,
    radioUnitsForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleRadioUnitsCountChange,
    handleChange,
    handleSubmit,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };
};
