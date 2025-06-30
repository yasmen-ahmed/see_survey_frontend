import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ImageUploader = ({ images, onImageChange }) => {
  const [imagePreviews, setImagePreviews] = useState({});

  // Update previews when images prop changes
  useEffect(() => {
    const newPreviews = {};
    images.forEach(image => {
      if (image.value) {
        newPreviews[image.name] = image.value;
      }
    });
    setImagePreviews(newPreviews);
  }, [images]);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Notify parent component
      if (onImageChange) {
        onImageChange(name, file);
      }
    }
  };

  const handleRemoveImage = (fieldName) => {
    setImagePreviews(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });

    // Notify parent component about removal
    if (onImageChange) {
      onImageChange(fieldName, null);
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
