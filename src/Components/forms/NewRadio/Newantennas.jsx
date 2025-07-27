import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useAntennaForm } from '../../../hooks/useAntennaForm';
import { antennaQuestions } from '../../../config/antennaQuestions';
import ImageUploader from '../../GalleryComponent';
import { showSuccess, showError } from '../../../utils/notifications';

const NewAntennaForm = () => {
  const { sessionId } = useParams();
  const {
    antennaCount,
    antennaForms,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    uploadedImages,
    setUploadedImages,
    hasUnsavedChanges,
    setHasUnsavedChanges
  } = useAntennaForm(sessionId);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      // Validate form first
      const newErrors = {};
      antennaForms.slice(0, antennaCount).forEach((antenna, index) => {
        antennaQuestions.forEach(question => {
          if (question.required && !antenna[question.key]) {
            newErrors[`${index}.${question.key}`] = `Please fill ${question.label}`;
          }
        });
      });

      if (Object.keys(newErrors).length > 0) {
        console.log('Form validation failed');
        return false;
      }

      // Prepare antenna data
      const antennaData = antennaForms.slice(0, antennaCount).map((antenna, index) => ({
        antenna_index: index + 1,
        base_height_from_tower: antenna.baseHeight,
        tower_leg_location: antenna.towerLeg,
        sector_number: antenna.sectorNumber,
        new_or_swap: antenna.newOrSwap,
        antenna_technology: antenna.technologies,
        azimuth_angle_shift: antenna.azimuth,
        angular_l1_dimension: antenna.angularL1Dimension,
        angular_l2_dimension: antenna.angularL2Dimension,
        tubular_cross_section: antenna.tubularCrossSection,
        tower_leg_section: antenna.towerSection,
        side_arm_type: antenna.sideArmOption,
        side_arm_length: antenna.sideArmLength,
        side_arm_cross_section: antenna.sideArmCrossSection,
        side_arm_offset: antenna.sideArmOffset,
        earth_bus_bar_exists: antenna.earthBusExists,
        earth_cable_length: antenna.earthCableLength,
      }));

      const dataToSend = {
        new_antennas_planned: antennaCount,
        antennas: antennaData
      };

      console.log('Sending antenna data:', dataToSend);

      // Send data as JSON instead of FormData for auto-save
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('New antennas data saved successfully');
      return true;
    } catch (err) {
      console.error("Error saving antenna data:", err);
      showError('Error saving antenna data');
      return false;
    }
  };

  // Generate image fields for each antenna
  const getAntennaImages = (antennaIndex) => {
    return [
      {
        label: `New Antenna ${antennaIndex} Proposed Location`,
        name: `new_antenna_${antennaIndex}_proposed_location`,
        required: true
      },
      {
        label: `New Antenna ${antennaIndex} Proposed Location (Optional)`,
        name: `new_antenna_${antennaIndex}_proposed_location_optional_photo`
      }
    ];
  };

  // Generate all image fields based on antenna count
  const getAllImages = () => {
    if (!antennaCount) return [];
    const count = parseInt(antennaCount);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getAntennaImages(i)];
    }
    return allImages;
  };

  const handleImageUpload = (imageName, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files // files is already an array as expected by GalleryComponent
    }));
  };

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
        {/* Main form container - 80% width */}
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
          <DynamicFormTable
            title=""
            entityName="Antenna"
            entityCount={antennaCount}
            entities={antennaForms}
            questions={antennaQuestions}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          maxHeight="calc(100vh - 200px)"
          submitButtonText="Save"
            hasUnsavedChanges={hasUnsavedChanges}
          saveDataToAPI={saveDataToAPI}
          />
        </div>

          <ImageUploader
            images={getAllImages()}
            onImageUpload={handleImageUpload}
            uploadedImages={uploadedImages}
          />
    </div>
  );
};

export default NewAntennaForm;
