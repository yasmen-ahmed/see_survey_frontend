import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ImageUploader = ({ images, onImageUpload, uploadedImages = {} }) => {
  const [imagePreviews, setImagePreviews] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  // Update previews when uploadedImages prop changes (for loading existing images)
  useEffect(() => {
    if (!uploadedImages) return;
    
    // Iterate each category and set preview for first item
    Object.entries(uploadedImages).forEach(([category, files]) => {
      if (!files || files.length === 0) return;
      
      const first = files[0];
      if (first instanceof File) {
        // File object: read data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => ({ ...prev, [category]: reader.result }));
        };
        reader.readAsDataURL(first);
      } else if (first.file_url) {
        // Server object with file_url
        const previewUrl = first.file_url.startsWith('http') 
          ? first.file_url 
          : `${API_BASE_URL}${first.file_url}`;
        setImagePreviews(prev => ({ ...prev, [category]: previewUrl }));
      }
    });
  }, [uploadedImages]);

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    const name = e.target.name;

    if (files.length > 0) {
      // Store the actual files
      setSelectedFiles(prev => ({
        ...prev,
        [name]: files
      }));

      // Create preview for the first image
      const firstFile = files[0];
      if (firstFile && firstFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => ({
            ...prev,
            [name]: reader.result
          }));
        };
        reader.readAsDataURL(firstFile);
      }

      // Notify parent component about the uploaded files
      if (onImageUpload) {
        onImageUpload(name, files);
      }
    }
  };

  const handleRemoveImage = (fieldName) => {
    setImagePreviews(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });

    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });

    // Notify parent component about removal
    if (onImageUpload) {
      onImageUpload(fieldName, []);
    }
  };

  return (
    <div className="grid grid-cols-1 w-[20%] h-[858px] bg-white rounded-xl shadow-md p-5 overflow-y-auto">
      {images.map((field) => (
        <div key={field.name} className="flex flex-col pb-5">
          <label className="font-semibold mb-1">{field.label}</label>
          <div className="relative">
            {imagePreviews[field.name] ? (
              <div className="relative">
                <img
                  src={imagePreviews[field.name]}
                  alt={`${field.label} Preview`}
                  className="border p-2 rounded-md h-50 w-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(field.name)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <input
                type="file"
                name={field.name}
                accept="image/*"
                onChange={handleInputChange}
                className="border p-2 rounded-md h-50 w-full"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageUploader;
