import { useState, useEffect } from 'react';
import axios from 'axios';

const useImageManager = (sessionId) => {
  const [uploadedImages, setUploadedImages] = useState({});
  const [initialImages, setInitialImages] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/site-images/${sessionId}`);
        const images = response.data.data;
        
        // Process images and ensure proper URL formatting
        const processedImages = images.reduce((acc, img) => {
          if (img.file_url) {
            // Handle different URL formats
            let fullUrl = img.file_url;
            
            // If URL doesn't start with http or /, add /
            if (!fullUrl.startsWith('http') && !fullUrl.startsWith('/')) {
              fullUrl = `/${fullUrl}`;
            }
            
            // If URL is relative, prepend API base URL
            if (!fullUrl.startsWith('http')) {
              fullUrl = `${import.meta.env.VITE_API_URL}${fullUrl}`;
            }

            // Store the image data
            acc[img.image_category] = [{
              id: img.id,
              file_url: fullUrl,
              url: fullUrl, // Add url property for compatibility
              name: img.original_filename,
              image_category: img.image_category
            }];
          }
          return acc;
        }, {});

        console.log('Processed images:', processedImages); // Debug log
        setUploadedImages(processedImages);
        setInitialImages(processedImages); // Store initial state
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchImages();
    }
  }, [sessionId]);

  // Handle image upload - matches existing component's format
  const handleImageUpload = (imageCategory, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Save images to the server
  const saveImages = async () => {
    try {
      const formData = new FormData();
      
      // Append each image file to the FormData
      Object.entries(uploadedImages).forEach(([category, files]) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file instanceof File) {
            formData.append(category, file);
          }
        }
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/site-images/${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update initial images after successful save
      setInitialImages(uploadedImages);

      return true;
    } catch (error) {
      console.error('Error saving images:', error);
      return false;
    }
  };

  return {
    uploadedImages,
    initialImages,
    handleImageUpload,
    saveImages,
    loading,
    resetUnsavedChanges: () => setInitialImages(uploadedImages)
  };
};

export default useImageManager; 