import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';

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
};

export const useAntennaForm = (sessionId) => {
  const [antennaCount, setAntennaCount] = useState(1);
  const [antennaForms, setAntennaForms] = useState(Array(6).fill().map(() => ({ ...initialAntennaForm })));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              };
            }
            return { ...initialAntennaForm };
          });
          
          setAntennaForms(newAntennaForms);
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
  };

  const handleChange = (antennaIndex, field, value) => {
    setAntennaForms(prev => {
      const updated = [...prev];
      const antenna = { ...updated[antennaIndex] }; // Clone the specific antenna object

      if (field === 'technologies') {
        const currentTechs = antenna.technologies || [];
        antenna.technologies = currentTechs.includes(value)
          ? currentTechs.filter(t => t !== value)
          : [...currentTechs, value];
      } else {
        antenna[field] = value;
      }

      updated[antennaIndex] = antenna; // Replace with updated antenna object

      return updated;
    });

    // Clear error for this field
    const errorKey = `${antennaIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    antennaForms.slice(0, antennaCount).forEach((antenna, index) => {
      if (!antenna.sectorNumber) {
        newErrors[`${index}.sectorNumber`] = 'Please select sector number';
      }
      if (!antenna.newOrSwap) {
        newErrors[`${index}.newOrSwap`] = 'Please select new or swap';
      }
      if (!antenna.technologies || antenna.technologies.length === 0) {
        newErrors[`${index}.technologies`] = 'Please select at least one technology';
      }
      if (!antenna.baseHeight) {
        newErrors[`${index}.baseHeight`] = 'Please enter base height';
      }
      if (!antenna.towerLeg) {
        newErrors[`${index}.towerLeg`] = 'Please select tower leg';
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
        new_antennas_planned: antennaCount,
        antennas: antennaForms.slice(0, antennaCount).map((antenna, index) => ({
          antenna_index: index + 1,
          sector_number: antenna.sectorNumber || null,
          new_or_swap: antenna.newOrSwap || null,
          antenna_technology: antenna.technologies || [],
          azimuth_angle_shift: antenna.azimuth ? parseFloat(antenna.azimuth).toFixed(3) : null,
          base_height_from_tower: antenna.baseHeight ? parseFloat(antenna.baseHeight).toFixed(3) : null,
          tower_leg_location: antenna.towerLeg || null,
          tower_leg_section: antenna.towerSection || null,
          angular_l1_dimension: antenna.angularL1Dimension ? parseFloat(antenna.angularL1Dimension).toFixed(2) : null,
          angular_l2_dimension: antenna.angularL2Dimension ? parseFloat(antenna.angularL2Dimension).toFixed(2) : null,
          tubular_cross_section: antenna.tubularCrossSection ? parseFloat(antenna.tubularCrossSection).toFixed(2) : null,
          side_arm_type: antenna.sideArmOption || null,
          side_arm_length: antenna.sideArmLength ? parseFloat(antenna.sideArmLength).toFixed(3) : null,
          side_arm_cross_section: antenna.sideArmCrossSection ? parseFloat(antenna.sideArmCrossSection).toFixed(2) : null,
          side_arm_offset: antenna.sideArmOffset ? parseFloat(antenna.sideArmOffset).toFixed(2) : null,
          earth_bus_bar_exists: antenna.earthBusExists || null,
          earth_cable_length: antenna.earthCableLength ? parseFloat(antenna.earthCableLength).toFixed(2) : null,
        }))
      };

      console.log("Submitting new antennas data:", submitData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`,
        submitData
      );

      showSuccess('New antennas data submitted successfully!');
      console.log("Response:", response.data);
      setErrors({});
    } catch (err) {
      console.error("Error submitting new antennas data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    antennaCount,
    antennaForms,
    errors,
    isLoading,
    isSubmitting,
    handleAntennaCountChange,
    handleChange,
    handleSubmit,
  };
}; 