import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ImageUploader = ({ images, onImageUpload, uploadedImages = {} }) => {
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    const newPreviews = {};
    Object.entries(uploadedImages).forEach(([category, files]) => {
      if (Array.isArray(files) && files.length > 0) {
        const file = files[0];
        if (file instanceof File) {
          // For newly uploaded files
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => ({
              ...prev,
              [category]: reader.result
            }));
          };
          reader.readAsDataURL(file);
        } else if (file.url || file.file_url) {
          // Handle different URL formats
          let imageUrl;
          
          // Check if this is a radio unit, GPS, or FPFH image
          if (category.includes('new_radio_unit_') || 
              category.includes('new_gps_') || 
              category.includes('new_fpfh_')) {
            // For radio units, GPS, and FPFH, use the url property
            imageUrl = file.url || `${API_BASE_URL}/${file.file_url}`;
          } else {
            // For other components, use the existing logic
             imageUrl = file.file_url.startsWith('http') 
            ? file.file_url 
            : `${API_BASE_URL}${file.file_url}`;
          }
          
          // Store the preview URL
          newPreviews[category] = imageUrl;
          
          // Log for debugging
          console.log('Setting preview for category:', category, 'URL:', imageUrl);
        }
      }
    });
    setImagePreviews(prev => ({ ...prev, ...newPreviews }));
  }, [uploadedImages]);

  const handleImageChange = (e, imageName) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview immediately for the new file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({
          ...prev,
          [imageName]: reader.result
        }));
      };
      reader.readAsDataURL(file);
      
      onImageUpload(imageName, [file]);
    }
  };

  const handleDelete = (imageName) => {
    onImageUpload(imageName, []);
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[imageName];
      return newPreviews;
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-[20%] overflow-y-auto max-h-[650px]">
      <h2 className="text-xl font-semibold mb-4">Images</h2>
      <div className="space-y-4">
        {images.map((image) => (
          <div key={image.name} className="border rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {image.label}
              {image.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {imagePreviews[image.name] ? (
              <div className="relative">
                <img
                  src={imagePreviews[image.name]}
                  alt={image.label}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.src = 'placeholder.jpg'; // You can add a placeholder image
                  }}
                />
                <button
                  onClick={() => handleDelete(image.name)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  type="button"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, image.name)}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
