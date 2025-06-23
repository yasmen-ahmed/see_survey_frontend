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
      // Build radio_units array for API
      const radioUnits = radioUnitsForms.slice(0, radioUnitsCount).map((radioUnit, index) => {
        // Parse angular dimensions back to separate L1 and L2 values
        let angularL1 = '';
        let angularL2 = '';
        
        if (radioUnit.angularDimensions && radioUnit.angularDimensions.trim()) {
          if (radioUnit.angularDimensions.includes(' x ')) {
            const dimensions = radioUnit.angularDimensions.split(' x ');
            angularL1 = dimensions[0] ? dimensions[0].trim() : '';
            angularL2 = dimensions[1] ? dimensions[1].trim() : '';
          } else {
            // If it doesn't contain ' x ', maybe it's a single value or different format
            console.warn('Angular dimensions format unexpected:', radioUnit.angularDimensions);
          }
        }
        
        const radioUnitData = {
          radio_unit_index: index + 1,
          radio_unit_number: (200 + index + 1).toString(), // Convert to string like "201", "202"
          new_radio_unit_sector: radioUnit.sector || '',
          connected_to_antenna: radioUnit.antennaConnection || '',
          connected_antenna_technology: radioUnit.technologies || [],
          new_radio_unit_model: radioUnit.model || '',
          radio_unit_location: radioUnit.location || '',
          feeder_length_to_antenna: radioUnit.feederLength || '',
          tower_leg_section: radioUnit.towerLegSection || '',
          angular_l1_dimension: angularL1 || '',
          angular_l2_dimension: angularL2 || '',
          tubular_cross_section: radioUnit.tubularSection || '',
          side_arm_type: radioUnit.sideArmOption || '',
          side_arm_length: radioUnit.sideArmLength || '',
          side_arm_cross_section: radioUnit.sideArmCrossSection || '',
          side_arm_offset: radioUnit.sideArmOffset || '',
          dc_power_source: radioUnit.dcPowerSource || '',
          dc_power_cable_length: radioUnit.dcCableLength || '',
          fiber_cable_length: radioUnit.fiberLength || '',
          jumper_length: radioUnit.jumperLength || '',
          earth_bus_bar_exists: radioUnit.earthBusExists || '',
          earth_cable_length: radioUnit.earthCableLength || '',
        };
        
        console.log(`Radio Unit ${index + 1} data:`, radioUnitData);
        return radioUnitData;
      });

      const submitData = {
        radio_units: radioUnits
      };

      console.log("Submitting new radio units data:", submitData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`,
        submitData
      );

      showSuccess(`Processed ${radioUnitsCount} radio units successfully!`);
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
