import React from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useAntennaForm } from '../../../hooks/useAntennaForm';
import { antennaQuestions } from '../../../config/antennaQuestions';
import ImageUploader from '../../GalleryComponent';

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
    hasUnsavedChanges
  } = useAntennaForm(sessionId);

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
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex w-full p-4 gap-4">
        {/* Main form container - 80% width */}
        <div className="w-4/5 bg-white rounded-xl shadow-md p-4">
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
            maxHeight="800px"
            submitButtonText="Save and Continue"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

          <ImageUploader
            images={getAllImages()}
            onImageUpload={handleImageUpload}
            uploadedImages={uploadedImages}
          />
      
      </div>
    </div>
  );
};

export default NewAntennaForm;
