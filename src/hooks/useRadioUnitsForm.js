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

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`);
        const responseData = response.data;
        
        console.log("Fetched new radio units data:", responseData);
        
        if (responseData) {
          // Get count from new_radio_units_planned
          const count = responseData.new_radio_units_planned || 1;
          setRadioUnitsCount(count);
          
          // Map API data to form structure - now handling single data object
          const newRadioUnitsForms = Array(6).fill().map((_, index) => {
            if (index === 0 && responseData.data) {
              // Map the single data object to the first form
              const radioUnit = responseData.data;
              return {
                sector: radioUnit.new_radio_unit_sector || '',
                antennaConnection: radioUnit.connected_to_antenna || '',
                technologies: radioUnit.connected_antenna_technology || [],
                model: radioUnit.new_radio_unit_model || '',
                location: radioUnit.radio_unit_location || '',
                feederLength: radioUnit.feeder_length_to_antenna || '',
                towerLegSection: radioUnit.tower_leg_section || '',
                angularDimensions: radioUnit.angular_l1_dimension && radioUnit.angular_l2_dimension 
                  ? `${radioUnit.angular_l1_dimension} x ${radioUnit.angular_l2_dimension}` 
                  : '',
                tubularSection: radioUnit.tubular_cross_section || '',
                sideArmOption: radioUnit.side_arm_type || '',
                sideArmLength: radioUnit.side_arm_length || '',
                sideArmCrossSection: radioUnit.side_arm_cross_section || '',
                sideArmOffset: radioUnit.side_arm_offset || '',
                dcPowerSource: radioUnit.dc_power_source || '',
                dcCableLength: radioUnit.dc_power_cable_length || '',
                fiberLength: radioUnit.fiber_cable_length || '',
                jumperLength: radioUnit.jumper_length || '',
                earthBusExists: radioUnit.earth_bus_bar_exists || '',
                earthCableLength: radioUnit.earth_cable_length || '',
              };
            }
            return { ...initialRadioForm };
          });
          
          setRadioUnitsForms(newRadioUnitsForms);
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
  };

  const handleChange = (radioUnitIndex, field, value) => {
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
      }

      if (field === 'earthBusExists' && value !== 'Yes') {
        radioUnit.earthCableLength = '';
      }

      updated[radioUnitIndex] = radioUnit; // Replace with updated radio unit object

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
      // Based on the API structure, it seems to store only one record
      // but uses new_radio_units_planned to indicate the count
      const firstRadioUnit = radioUnitsForms[0];
      
      // Parse angular dimensions back to separate L1 and L2 values
      let angularL1 = null;
      let angularL2 = null;
      if (firstRadioUnit.angularDimensions && firstRadioUnit.angularDimensions.includes(' x ')) {
        const dimensions = firstRadioUnit.angularDimensions.split(' x ');
        angularL1 = dimensions[0] ? parseFloat(dimensions[0]).toFixed(2) : null;
        angularL2 = dimensions[1] ? parseFloat(dimensions[1]).toFixed(2) : null;
      }
      
      const submitData = {
        new_radio_units_planned: radioUnitsCount,
        existing_radio_units_swapped: 0, // You may need to adjust this based on your requirements
        radio_unit_index: 1,
        radio_unit_number: 1,
        new_radio_unit_sector: firstRadioUnit.sector || '',
        connected_to_antenna: firstRadioUnit.antennaConnection || '',
        connected_antenna_technology: firstRadioUnit.technologies || [],
        new_radio_unit_model: firstRadioUnit.model || '',
        radio_unit_location: firstRadioUnit.location || '',
        feeder_length_to_antenna: firstRadioUnit.feederLength ? parseFloat(firstRadioUnit.feederLength).toFixed(2) : null,
        tower_leg_section: firstRadioUnit.towerLegSection || '',
        angular_l1_dimension: angularL1,
        angular_l2_dimension: angularL2,
        tubular_cross_section: firstRadioUnit.tubularSection ? parseFloat(firstRadioUnit.tubularSection).toFixed(2) : null,
        side_arm_type: firstRadioUnit.sideArmOption || '',
        side_arm_length: firstRadioUnit.sideArmLength ? parseFloat(firstRadioUnit.sideArmLength).toFixed(2) : null,
        side_arm_cross_section: firstRadioUnit.sideArmCrossSection ? parseFloat(firstRadioUnit.sideArmCrossSection).toFixed(2) : null,
        side_arm_offset: firstRadioUnit.sideArmOffset ? parseFloat(firstRadioUnit.sideArmOffset).toFixed(2) : null,
        dc_power_source: firstRadioUnit.dcPowerSource || '',
        dc_power_cable_length: firstRadioUnit.dcCableLength ? parseFloat(firstRadioUnit.dcCableLength).toFixed(2) : null,
        fiber_cable_length: firstRadioUnit.fiberLength ? parseFloat(firstRadioUnit.fiberLength).toFixed(2) : null,
        jumper_length: firstRadioUnit.jumperLength ? parseFloat(firstRadioUnit.jumperLength).toFixed(2) : null,
        earth_bus_bar_exists: firstRadioUnit.earthBusExists || '',
        earth_cable_length: firstRadioUnit.earthCableLength ? parseFloat(firstRadioUnit.earthCableLength).toFixed(2) : null,
      };

      console.log("Submitting new radio units data:", submitData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`,
        submitData
      );

      showSuccess('New radio units data submitted successfully!');
      console.log("Response:", response.data);
      setErrors({});
    } catch (err) {
      console.error("Error submitting new radio units data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
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
    handleRadioUnitsCountChange,
    handleChange,
    handleSubmit,
  };
}; 