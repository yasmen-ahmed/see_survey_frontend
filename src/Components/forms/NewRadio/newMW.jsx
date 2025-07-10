import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ImageUploader from '../../GalleryComponent';
import DynamicFormTable from '../../common/DynamicFormTable';
import useMwForm from '../../../hooks/useMwForm';
import { mwQuestions } from '../../../config/mwQuestions';

const getMwImages = (index) => {
  return [
    {
      id: `mw_${index}_front`,
      label: `MW ${index} Front View`,
      category: 'new_mw',
      required: true
    },
    {
      id: `mw_${index}_side`,
      label: `MW ${index} Side View`,
      category: 'new_mw',
      required: false
    }
  ];
};

const NewMWForm = () => {
  const { sessionId } = useParams();
  const {
    mwCount,
    mwForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleMwCountChange,
    handleChange,
    handleSubmit,
    hasUnsavedChanges
  } = useMwForm(sessionId);

  const allImages = useMemo(() => {
    if (!mwCount) return [];
    const count = parseInt(mwCount);
    let images = [];
    for (let i = 1; i <= count; i++) {
      images = [...images, ...getMwImages(i)];
    }
    return images;
  }, [mwCount]);

  const handleImageUpload = (newImages) => {
    setUploadedImages(prev => ({
      ...prev,
      ...newImages
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex w-full p-4 gap-4">
        {/* Main form container - 80% width */}
        <div className="w-4/5 bg-white rounded-xl shadow-md p-4">
          {/* Column selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of MW Configurations
            </label>
            <select
              value={mwCount}
              onChange={(e) => handleMwCountChange(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Column' : 'Columns'}
                </option>
              ))}
            </select>
          </div>

          <DynamicFormTable
            title="MW Configuration"
            entityName="MW"
            entityCount={mwCount}
            entities={mwForms}
            questions={mwQuestions}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onEntityCountChange={handleMwCountChange}
            isSubmitting={isSubmitting}
            maxHeight="calc(100vh - 250px)"
            submitButtonText="Save MW Configuration"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        {/* Right side - Image uploader (20%) */}
        <div className="w-1/5">
          <ImageUploader
            images={allImages}
            onImageUpload={handleImageUpload}
            uploadedImages={uploadedImages}
          />
        </div>
      </div>
    </div>
  );
};

export default NewMWForm;
