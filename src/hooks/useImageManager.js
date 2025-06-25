import { useState, useEffect } from 'react';
import axios from 'axios';

const useImageManager = (sessionId) => {
  const [uploadedImages, setUploadedImages] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/site-images/${sessionId}`);
        const images = response.data.data;
        
        // Always provide a full file_url (prepend API base if needed)
        const processedImages = images.reduce((acc, img) => {
          if (img.file_url) {
            const fullUrl = img.file_url.startsWith('http')
              ? img.file_url
              : `${import.meta.env.VITE_API_URL}${img.file_url}`;
            acc[img.image_category] = [{
              id: img.id,
              file_url: fullUrl,
              name: img.original_filename,
              image_category: img.image_category
            }];
          }
          return acc;
        }, {});

        setUploadedImages(processedImages);
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

      return true;
    } catch (error) {
      console.error('Error saving images:', error);
      return false;
    }
  };

  return {
    uploadedImages,
    handleImageUpload,
    saveImages,
    loading
  };
};

export default useImageManager; 