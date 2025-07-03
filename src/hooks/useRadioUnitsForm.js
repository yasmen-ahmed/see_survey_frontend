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

      updated[radioUnitIndex] = radioUnit; // Replace with updated radio unit object
      
      console.log(`Updated radioUnit[${radioUnitIndex}]:`, radioUnit);
      return updated;
    });

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
      if (!radioUnit.sector) {
        newErrors[`${index}.sector`] = 'Please select sector';
      }
      if (!radioUnit.antennaConnection) {
        newErrors[`${index}.antennaConnection`] = 'Please select antenna connection type';
      }
      if (!radioUnit.technologies || radioUnit.technologies.length === 0) {
        newErrors[`${index}.technologies`] = 'Please select at least one technology';
      }
      if (!radioUnit.model) {
        newErrors[`${index}.model`] = 'Please select model';
      }
      if (!radioUnit.location) {
        newErrors[`${index}.location`] = 'Please select location';
      }
      if (!radioUnit.sideArmOption) {
        newErrors[`${index}.sideArmOption`] = 'Please select side arm option';
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
        newErrors[`${index}.earthBusExists`] = 'Please select earth bus bar option';
      }

      // Validate required images
      const requiredImageKey = `new_radio_unit_${index + 1}_proposed_location`;
      if (!uploadedImages[requiredImageKey]?.length) {
        newErrors[requiredImageKey] = 'Please upload proposed location photo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add the radio units data
      const radioUnitsData = {
        new_radio_units_planned: radioUnitsCount,
        radio_units: radioUnitsForms.slice(0, radioUnitsCount).map((unit, index) => ({
          radio_unit_index: index + 1,
          radio_unit_number: (200 + index + 1).toString(),
          new_radio_unit_sector: unit.sector || '',
          connected_to_antenna: unit.antennaConnection || '',
          connected_antenna_technology: unit.technologies || [],
          new_radio_unit_model: unit.model || '',
          radio_unit_location: unit.location || '',
          feeder_length_to_antenna: unit.feederLength || '',
          tower_leg_section: unit.towerLegSection || '',
          angular_l1_dimension: unit.angularDimensions ? unit.angularDimensions.split(' x ')[0] : '',
          angular_l2_dimension: unit.angularDimensions ? unit.angularDimensions.split(' x ')[1] : '',
          tubular_cross_section: unit.tubularSection || '',
          side_arm_type: unit.sideArmOption || '',
          side_arm_length: unit.sideArmLength || '',
          side_arm_cross_section: unit.sideArmCrossSection || '',
          side_arm_offset: unit.sideArmOffset || '',
          dc_power_source: unit.dcPowerSource || '',
          dc_power_cable_length: unit.dcCableLength || '',
          fiber_cable_length: unit.fiberLength || '',
          jumper_length: unit.jumperLength || '',
          earth_bus_bar_exists: unit.earthBusExists || '',
          earth_cable_length: unit.earthCableLength || ''
        }))
      };

      formData.append('data', JSON.stringify(radioUnitsData));

      // Track if any images were added
      let imagesAdded = false;

      // Add images for each radio unit
      for (let i = 1; i <= radioUnitsCount; i++) {
        // Handle required proposed location image
        const requiredImageKey = `new_radio_unit_${i}_proposed_location`;
        const requiredImages = uploadedImages[requiredImageKey];
        
        if (requiredImages?.length > 0) {
          const image = requiredImages[0];
          if (image instanceof File) {
            formData.append(`new_radio_${i}_proposed_location`, image);
            imagesAdded = true;
          } else if (image.file instanceof File) {
            formData.append(`new_radio_${i}_proposed_location`, image.file);
            imagesAdded = true;
          }
        }

        // Handle optional proposed location image
        const optionalImageKey = `new_radio_unit_${i}_proposed_location_optional_photo`;
        const optionalImages = uploadedImages[optionalImageKey];
        
        if (optionalImages?.length > 0) {
          const image = optionalImages[0];
          if (image instanceof File) {
            formData.append(`new_radio_${i}_proposed_location_optional`, image);
            imagesAdded = true;
          } else if (image.file instanceof File) {
            formData.append(`new_radio_${i}_proposed_location_optional`, image.file);
            imagesAdded = true;
          }
        }
      }

      // Log the request details for debugging
      console.log('Form submission details:', {
        radioUnitsCount,
        radioUnitsData,
        formDataKeys: Array.from(formData.keys()),
        uploadedImages,
        imagesAdded
      });

      if (!imagesAdded) {
        console.warn('No images were added to the form data');
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.message) {
        showSuccess(response.data.message);
      } else {
        showSuccess('Data submitted successfully');
      }

    } catch (err) {
      // Log the full error details
      console.error('Submission error:', {
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        uploadedImages
      });

      // Show the error message from the response if available
      const errorMessage = err.response?.data?.message || err.response?.data || err.message;
      showError(errorMessage);

      // Set form errors if they exist
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
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
  };
};
