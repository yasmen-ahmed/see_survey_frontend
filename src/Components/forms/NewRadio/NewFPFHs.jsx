import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useFpfhForm } from '../../../hooks/useFpfhForm';
import { fpfhQuestions } from '../../../config/fpfhQuestions';
import ImageUploader from '../../GalleryComponent';
import { showSuccess, showError } from '../../../utils/notifications';

const NewFPFHForm = () => {
  const { sessionId } = useParams();
  const {
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
    setHasUnsavedChanges
  } = useFpfhForm(sessionId);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      // Validate form first
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

      if (Object.keys(newErrors).length > 0) {
        console.log('Form validation failed');
        return false;
      }

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

      // Send data as JSON instead of FormData for auto-save
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-fpfhs/${sessionId}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('New FPFHs data saved successfully');
      return true;
    } catch (err) {
      console.error("Error saving FPFH data:", err);
      showError('Error saving FPFH data');
      return false;
    }
  };

  // Generate image fields for each FPFH - memoized to prevent infinite loop
  const getFpfhImages = useMemo(() => (fpfhNumber) => {
    return [
      {
        label: `New FPFH ${fpfhNumber} Proposed Location`,
        name: `new_fpfh_${fpfhNumber}_proposed_location`,
        required: true
      },
      {
        label: `New FPFH ${fpfhNumber} Proposed Location (Optional)`,
        name: `new_fpfh_${fpfhNumber}_proposed_location_optional_photo`,
      }
    ];
  }, []);

  // Generate all image fields based on FPFH count - memoized to prevent infinite loop
  const allImages = useMemo(() => {
    if (!fpfhCount) return [];
    const count = parseInt(fpfhCount);
    let images = [];
    for (let i = 1; i <= count; i++) {
      images = [...images, ...getFpfhImages(i)];
    }
    return images;
  }, [fpfhCount, getFpfhImages]);

  const handleImageUpload = (imageName, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      {/* Main form container - 80% width */}
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
        <DynamicFormTable
          title=""
          entityName="FPFH"
          entityCount={fpfhCount}
          entities={fpfhForms}
          questions={fpfhQuestions}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleFormSubmit}
          onEntityCountChange={handleFpfhCountChange}
          isSubmitting={isSubmitting}
          maxHeight="calc(100vh - 200px)"
          submitButtonText="Save"
          hasUnsavedChanges={hasUnsavedChanges}
          saveDataToAPI={saveDataToAPI}
        />
      </div>

      {/* Right side - Image uploader (20%) */}
      <ImageUploader
        images={allImages}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default NewFPFHForm;
