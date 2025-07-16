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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
    console.log(`Changing ${field} to:`, value);
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [field]: value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = (imageName, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the latest form data
      const currentFormData = {
        location: formData.location,
        height: formData.height,
        cableLength: formData.cableLength,
      };
      
      console.log('Current form data before submission:', currentFormData);

      // Validate required fields
      if (!currentFormData.location) {
        showError('Please select a GPS antenna location');
        setIsSubmitting(false);
        return;
      }

      if (!currentFormData.height) {
        showError('Please enter GPS antenna height');
        setIsSubmitting(false);
        return;
      }

      if (!currentFormData.cableLength) {
        showError('Please enter cable length');
        setIsSubmitting(false);
        return;
      }

      // Create FormData instance
      const formDataToSend = new FormData();

      // Prepare the data object with the current form values
      const submitData = {
        gps_antenna_location: currentFormData.location,
        gps_antenna_height: parseFloat(currentFormData.height),
        gps_cable_length: parseFloat(currentFormData.cableLength),
      };

      console.log('Data being submitted:', submitData);
      formDataToSend.append('data', JSON.stringify(submitData));

      // Log FormData contents
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

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

      console.log('PUT response:', response.data);

      if (response.data && response.data.data) {
        const responseData = response.data.data;
        console.log('Response data:', responseData);

        // Verify the response data matches what we sent
        if (responseData.gps_antenna_location !== submitData.gps_antenna_location ||
            responseData.gps_antenna_height !== submitData.gps_antenna_height ||
            responseData.gps_cable_length !== submitData.gps_cable_length) {
          console.warn('Response data differs from submitted data:', {
            submitted: submitData,
            received: responseData
          });
        }

        // Update form with the response data
        setFormData(prevData => ({
          ...prevData,
          location: responseData.gps_antenna_location,
          height: responseData.gps_antenna_height?.toString() || '',
          cableLength: responseData.gps_cable_length?.toString() || '',
        }));

        // Update images
        if (responseData.images && Array.isArray(responseData.images)) {
          const newImages = {};
          responseData.images.forEach(img => {
            newImages[img.category] = [{
              id: img.id,
              file_url: img.file_url
            }];
          });
          setUploadedImages(newImages);
        }

        setHasUnsavedChanges(false);
        showSuccess('GPS antenna data saved successfully');
      } else {
        console.error('Invalid response format:', response.data);
        showError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error saving GPS antenna data:', err);
      const errorMessage = err.response?.data?.message || 'Error saving GPS antenna data';
      showError(errorMessage);
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
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">
                  ⚠️ You have unsaved changes
                </p>
                <p className="text-sm">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          </div>
        )}
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
                className="form-input"
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
                className="form-input"
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
              {isSubmitting ? 'loading...' : 'Save '}
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
