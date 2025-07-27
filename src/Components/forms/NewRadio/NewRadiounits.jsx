import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useRadioUnitsForm } from '../../../hooks/useRadioUnitsForm';
import { radioUnitsQuestions } from '../../../config/newRadioUnitsQuestions';
import ImageUploader from '../../GalleryComponent';
import { showSuccess, showError } from '../../../utils/notifications';

const NewRadioUnitsForm = () => {
  const { sessionId } = useParams();
  const {
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
  } = useRadioUnitsForm(sessionId);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      // Validate form first
      const newErrors = {};
      radioUnitsForms.slice(0, radioUnitsCount).forEach((radioUnit, index) => {
        radioUnitsQuestions.forEach(question => {
          if (question.required && !radioUnit[question.key]) {
            newErrors[`${index}.${question.key}`] = `Please fill ${question.label}`;
          }
        });
      });

    

      // Prepare radio units data
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
          earth_cable_length: radioUnit.earth_cable_length ? parseFloat(radioUnit.earth_cable_length) : null,
        };
      });

      const dataToSend = {
        new_radio_units_planned: radioUnitsCount,
        radio_units: radioUnitsData
      };

      console.log('Sending radio units data:', dataToSend);

      // Send data as JSON instead of FormData for auto-save
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-radio-units/${sessionId}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('New radio units data saved successfully');
      return true;
    } catch (err) {
      console.error("Error saving radio units data:", err);
      showError('Error saving radio units data');
      return false;
    }
  };

  // Generate image fields for each radio unit - memoized to prevent infinite loop
  const getRadioUnitImages = useMemo(() => (unitNumber) => {
    return [
      {
        label: `New Radio Unit ${unitNumber} Proposed Location`,
        name: `new_radio_unit_${unitNumber}_proposed_location`,
        required: true
      },
      {
        label: `New Radio Unit ${unitNumber} Proposed Location (Optional)`,
        name: `new_radio_unit_${unitNumber}_proposed_location_optional_photo`
      }
    ];
  }, []);

  // Generate all image fields based on radio unit count - memoized to prevent infinite loop
  const allImages = useMemo(() => {
    if (!radioUnitsCount) return [];
    const count = parseInt(radioUnitsCount);
    let images = [];
    for (let i = 1; i <= count; i++) {
      images = [...images, ...getRadioUnitImages(i)];
    }
    return images;
  }, [radioUnitsCount, getRadioUnitImages]);

  const handleImageUpload = (imageName, files) => {
    // Extract the radio unit index from the image name
    const match = imageName.match(/new_radio_unit_(\d+)_/);
    if (!match) {
      console.error('Invalid image name format:', imageName);
      return;
    }
    const unitIndex = parseInt(match[1]);
    if (unitIndex < 1 || unitIndex > radioUnitsCount) {
      console.error('Invalid radio unit index:', unitIndex);
      return;
    }

    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      {/* Main form container - 80% width */}
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
        <DynamicFormTable
          title=""
          entityName="Radio Unit"
          entityCount={radioUnitsCount || 1}
          entities={radioUnitsForms || []}
          questions={radioUnitsQuestions || []}
          errors={errors || {}}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onEntityCountChange={handleRadioUnitsCountChange}
          isSubmitting={isSubmitting}
          maxHeight="calc(100vh - 200px)"
          submitButtonText="Save"
          hasUnsavedChanges={hasUnsavedChanges}
          saveDataToAPI={saveDataToAPI}
        />
      </div>
      
      <ImageUploader
        images={allImages}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default NewRadioUnitsForm;
