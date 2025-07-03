import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

const GPSAntennaTab = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    location: '',         // On tower / On building
    height: '',           // in meters
    cableLength: '',      // in meters
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});

  // Define image fields
  const imageFields = [
    {
      label: 'New GPS Antenna Proposed Location',
      name: 'new_gps_1_proposed_location',
      required: true
    },
    {
      label: 'New GPS Antenna Proposed Location (Optional)',
      name: 'new_gps_1_proposed_location_optional_photo',
      required: false
    }
  ];

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-gps/${sessionId}`);
        const responseData = response.data;
        
        console.log("Fetched GPS antenna data:", responseData);
        
        if (responseData && responseData.data) {
          const gpsData = responseData.data;
          setFormData({
            location: gpsData.gps_antenna_location || '',
            height: gpsData.gps_antenna_height || '',
            cableLength: gpsData.gps_cable_length || '',
          });

          // Set up initial images state from response
          const initialImages = {};
          if (gpsData.images) {
            gpsData.images.forEach(img => {
              initialImages[img.category] = [{
                id: img.id,
                file_url: img.file_url
              }];
            });
          }
          setUploadedImages(initialImages);
        }
      } catch (err) {
        console.error("Error loading GPS antenna data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (imageName, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add the form data
      const submitData = {
        gps_antenna_location: formData.location || '',
        gps_antenna_height: formData.height ? parseFloat(formData.height) : null,
        gps_cable_length: formData.cableLength ? parseFloat(formData.cableLength) : null,
      };

      console.log('Form data prepared:', submitData);
      formDataToSend.append('data', JSON.stringify(submitData));

      // Append all images
      Object.entries(uploadedImages).forEach(([key, files]) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file instanceof File) {
            console.log('Appending file:', key, file.name);
            formDataToSend.append(key, file);
          }
        }
      });

      console.log('Making API request...');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-gps/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('API response received:', response.data);

      if (response.data.data) {
        // Update form data
        const gpsData = response.data.data;
        setFormData({
          location: gpsData.gps_antenna_location || '',
          height: gpsData.gps_antenna_height || '',
          cableLength: gpsData.gps_cable_length || '',
        });

        // Update images state
        const newImages = {};
        if (gpsData.images) {
          gpsData.images.forEach(img => {
            newImages[img.category] = [{
              id: img.id,
              file_url: img.file_url
            }];
          });
        }
        setUploadedImages(newImages);
      }

      showSuccess('GPS antenna data saved successfully');
    } catch (err) {
      console.error('Error saving GPS antenna data:', err);
      showError('Error saving GPS antenna data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
        <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Loading GPS antenna data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Location Radio Buttons */}
          <div>
            <label className="block font-semibold mb-2">
              New GPS antenna proposed location
            </label>
            <div className="flex gap-4">
              {['On tower', 'On building'].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="location"
                    value={option}
                    checked={formData.location === option}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-4 h-4"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
            <hr className="my-2 w-1/2" />
          </div>
         
          <div className='grid grid-cols-2 gap-4'>
            {/* 2. Antenna Height Input */}
            <div>
              <label className="block font-semibold mb-2">
                New GPS antenna height from tower base level (meters)
              </label>
              <input
                type="number"
                min="0"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Enter height in meters"
                required
              />
            </div>

            {/* 3. Cable Length Input */}
            <div>
              <label className="block font-semibold mb-2">
                Cable length from the new GPS antenna location to the base band (meters)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cableLength}
                onChange={(e) => handleChange('cableLength', e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Enter cable length in meters"
                required
              />
            </div>
          </div>
          <hr className="my-2" />

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded font-semibold ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Uploader */}
      <ImageUploader
        images={imageFields}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default GPSAntennaTab;
