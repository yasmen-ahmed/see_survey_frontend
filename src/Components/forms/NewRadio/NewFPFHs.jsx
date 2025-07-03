import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useFpfhForm } from '../../../hooks/useFpfhForm';
import { fpfhQuestions } from '../../../config/fpfhQuestions';
import ImageUploader from '../../GalleryComponent';

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
  } = useFpfhForm(sessionId);

  // Generate image fields for each FPFH - memoized to prevent infinite loop
  const getFpfhImages = useMemo(() => (fpfhNumber) => {
    return [
      {
        label: `New FPFH ${fpfhNumber} Proposed Location`,
        name: `new_fpfh_${fpfhNumber}_proposed_location`,
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
    e.preventDefault(); // Prevent default form submission
    await handleSubmit(e);
  };

  return (
    <>
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
        maxHeight="600px"
        submitButtonText="Save and Continue"
      />
      <ImageUploader
        images={allImages}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </>
  );
};

export default NewFPFHForm;
