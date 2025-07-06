import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useRadioUnitsForm } from '../../../hooks/useRadioUnitsForm';
import { radioUnitsQuestions } from '../../../config/radioUnitsQuestions';
import ImageUploader from '../../GalleryComponent';

const RadioUnitsForm = () => {
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
  } = useRadioUnitsForm(sessionId);

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
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex w-full p-4 gap-4">
        {/* Main form container - 80% width */}
        <div className="w-4/5 bg-white rounded-xl shadow-md p-4">
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
        maxHeight="600px"
        submitButtonText="Save and Continue"
      />
      </div>
      <ImageUploader
        images={allImages}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
      </div>
    </div>
  );
};

export default RadioUnitsForm;
