import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ImageUploader = ({ images, onImageUpload, uploadedImages = {} }) => {
  const [imagePreviews, setImagePreviews] = useState({});
  const [dragOver, setDragOver] = useState({});

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
          
          if (file.url) {
            // If the URL is already complete
            imageUrl = file.url;
          } else {
            // For file_url, ensure it has the correct format
            let fileUrl = file.file_url;
            if (!fileUrl.startsWith('http') && !fileUrl.startsWith('/')) {
              fileUrl = `/${fileUrl}`;
            }
            imageUrl = `${API_BASE_URL}${fileUrl}`;
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
      processFile(file, imageName);
    }
  };

  const processFile = (file, imageName) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create a preview immediately for the new file
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => ({
        ...prev,
        [imageName]: reader.result
      }));
    };
    reader.readAsDataURL(file);

    // Create a new FormData object for each file
    const formData = new FormData();
    formData.append(imageName, file);
    
    onImageUpload(imageName, [file], formData);
  };

  const handleDelete = (imageName) => {
    onImageUpload(imageName, []);
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[imageName];
      return newPreviews;
    });
  };

  const handleDragOver = (e, imageName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [imageName]: true }));
  };

  const handleDragLeave = (e, imageName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [imageName]: false }));
  };

  const handleDrop = (e, imageName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [imageName]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0], imageName);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-[20%] h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Images</h2>
      <div className="grid grid-cols-1 gap-4" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
      }}>
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
                    console.log('Failed URL:', e.target.src);
                    e.target.src = 'placeholder.jpg';
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
              <div 
                className="flex items-center justify-center w-full"
                onDragOver={(e) => handleDragOver(e, image.name)}
                onDragLeave={(e) => handleDragLeave(e, image.name)}
                onDrop={(e) => handleDrop(e, image.name)}
              >
                <label 
                  className={`w-full flex flex-col items-center justify-center h-32 border-2 ${
                    dragOver[image.name] 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  } border-dashed rounded-lg cursor-pointer transition-colors duration-200`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className={`w-8 h-8 mb-4 ${dragOver[image.name] ? 'text-blue-500' : 'text-gray-500'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
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
