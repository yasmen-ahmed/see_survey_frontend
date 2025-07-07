import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

const MwAntennasForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    antennaCount: "",
    antennas: [],
  });
  const [uploadedImages, setUploadedImages] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generate image fields for a single antenna
  const getAntennaImages = (antennaNumber) => [ 
    { label: `MW  #${antennaNumber} photo`, name: `mw_${antennaNumber}_photo` },     
    { label: `MW  #${antennaNumber} Azimuth view photo`, name: `mw_${antennaNumber}_Azimuth_view_photo` },
    { label: `MW #${antennaNumber} Label Photo`, name: `mw_${antennaNumber}_label_photo` }
  ];

  // Generate all image fields based on antenna count
  const getAllImages = () => {
    if (!formData.antennaCount) return [];
    const count = parseInt(formData.antennaCount);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getAntennaImages(i)];
    }
    return allImages;
  };

  // Process images from API response
  const processImagesFromResponse = (antennas) => {
    const imagesByCategory = {};
    
    antennas.forEach(antenna => {
      if (antenna.images && Array.isArray(antenna.images)) {
        antenna.images.forEach(img => {
          // Each image should be an object with the required properties
          imagesByCategory[img.image_category] = [{
            id: img.id,
            file_url: img.file_url,  // The full URL path will be handled by ImageUploader
            name: img.original_filename
          }];
        });
      }
    });
    
    return imagesByCategory;
  };

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched MW data:", data);

        if (data && data.mwAntennasData) {
          const mwData = data.mwAntennasData;
          
          // Set the antenna count and antennas array
          const antennaCount = mwData.how_many_mw_antennas_on_tower || "";
          const antennas = mwData.mw_antennas || [];
          
          // Ensure each antenna has the proper structure with id
          const processedAntennas = antennas.map((antenna) => ({
            id: antenna.antenna_number,
            height: antenna.height || "",
            diameter: antenna.diameter || "",
            azimuth: antenna.azimuth || "",
            includeInPlan: antenna.includeInPlan || "",
          }));

          setFormData({
            antennaCount: antennaCount.toString(),
            antennas: processedAntennas
          });

          // Process and set images from the response
          if (antennas.some(ant => ant.images?.length > 0)) {
            const processedImages = processImagesFromResponse(antennas);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading MW antennas data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  const handleAntennaCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (!count || count < 1) {
      setFormData({ antennaCount: "", antennas: [] });
      setUploadedImages({});
      setHasUnsavedChanges(true);
      return;
    }

    // Create antennas array matching the selected count
    const currentAntennas = formData.antennas || [];
    const antennas = Array.from({ length: count }, (_, index) => {
      if (index < currentAntennas.length) {
        return currentAntennas[index];
      }
      return {
        id: index + 1,
        height: "",
        diameter: "",
        azimuth: "",
      };
    });

    setFormData({ antennaCount: e.target.value, antennas });
    setHasUnsavedChanges(true);
    setError("");
  };

  const handleAntennaChange = (index, field, value) => {
    const updated = [...formData.antennas];
    
    // If this is the first antenna (index 0), auto-fill other antennas
    if (index === 0) {
      const numAntennas = parseInt(formData.antennaCount) || 1;
      for (let i = 1; i < numAntennas; i++) {
        if (!updated[i][field]) {
          updated[i] = {
            ...updated[i],
            [field]: value,
            [`${field}AutoFilled`]: true
          };
        }
      }
    }
    
    updated[index] = {
      ...updated[index],
      [field]: value,
      [`${field}AutoFilled`]: false
    };
    
    setFormData({ ...formData, antennas: updated });
    setHasUnsavedChanges(true);
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const prevFormData = { ...formData };

    try {
      // Validate that all fields are filled
      const isValid = formData.antennas.every(
        (ant) => ant.height && ant.diameter && ant.azimuth && ant.includeInPlan
      );

      if (!isValid) {
        setError("Please fill all fields for each MW antenna.");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add antenna count
      submitFormData.append('how_many_mw_antennas_on_tower', parseInt(formData.antennaCount));

      // Add antenna data as individual form fields with antenna_number
      formData.antennas.forEach((antenna, index) => {
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][antenna_number]`, antenna.id || (index + 1));
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][height]`, parseFloat(antenna.height) || 0);
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][diameter]`, parseFloat(antenna.diameter) || 0);
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][azimuth]`, parseFloat(antenna.azimuth) || 0);
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][includeInPlan]`, antenna.includeInPlan);
      });

      // Get all possible image fields
      const allImageFields = getAllImages();
      
      console.log("All image fields:", allImageFields);
      console.log("Uploaded images state:", uploadedImages);
      
      // Handle all image fields - including removed ones
      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        console.log(`Processing image field: ${imageField.name}`, imageFiles);
        
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            console.log(`Adding file for ${imageField.name}:`, file.name);
            submitFormData.append(imageField.name, file);
          } else {
            console.log(`Skipping non-File object for ${imageField.name}:`, file);
          }
        } else {
          // If image was removed or doesn't exist, send empty string
          console.log(`Adding empty string for ${imageField.name}`);
          submitFormData.append(imageField.name, '');
        }
      });

      console.log("Submitting MW antennas data:");
      // Log FormData contents for debugging
      for (let pair of submitFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`,
        submitFormData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      console.log("Server response:", response.data);
      
      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`);
      const latestData = getResponse.data.data;

      if (latestData?.mwAntennasData) {
        const mwData = latestData.mwAntennasData;
        
        // Update form data with latest values
        const processedAntennas = mwData.mw_antennas.map((antenna) => ({
          id: antenna.antenna_number,
          height: antenna.height || "",
          diameter: antenna.diameter || "",
          azimuth: antenna.azimuth || "",
          includeInPlan: antenna.includeInPlan || "",
        }));

        setFormData({
          antennaCount: mwData.how_many_mw_antennas_on_tower.toString(),
          antennas: processedAntennas
        });

        // Process and update images
        if (mwData.mw_antennas.some(ant => ant.images?.length > 0)) {
          const processedImages = processImagesFromResponse(mwData.mw_antennas);
          console.log("Processed images from response:", processedImages);
          setUploadedImages(processedImages);
        } else {
          console.log("No images found in response, clearing uploaded images");
          // Don't clear uploaded images completely, keep File objects for newly uploaded images
          const newUploadedImages = {};
          Object.entries(uploadedImages).forEach(([key, files]) => {
            if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
              newUploadedImages[key] = files;
            }
          });
          setUploadedImages(newUploadedImages);
        }
      }
      
      setHasUnsavedChanges(false);
      showSuccess('MW antennas data and images submitted successfully!');
    } catch (err) {
      console.error("Error submitting MW antennas data:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
      // Restore previous form data if submission fails
      setFormData(prevFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add useEffect for window beforeunload event
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* MW Antenna Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="font-semibold mb-2">
                How many MW antennas on the tower?
              </label>
              <select
                name="antennaCount"
                value={formData.antennaCount}
                onChange={handleAntennaCountChange}
                className="w-full p-2 border rounded text-sm"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic MW Antenna Table */}
          {formData.antennaCount && parseInt(formData.antennaCount) > 0 && formData.antennas && (
            <div className="">
              <div className="overflow-auto max-h-[400px]">
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th
                        className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                        style={{ width: '300px', minWidth: '300px', maxWidth: '300px' }}
                      >
                        Field Description
                      </th>
                      {Array.from({ length: parseInt(formData.antennaCount) }, (_, i) => (
                        <th
                          key={i}
                          className="border px-4 py-3 text-center font-semibold min-w-[200px] sticky top-0 bg-blue-500 z-20"
                        >
                          MW Antenna #{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* MW antenna height */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna height (meter)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={antenna.height}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'height', e.target.value)}
                            className={`form-input ${
                              antenna.heightAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                            }`}
                            placeholder="Enter height..."
                            required
                          />
                        </td>
                      ))}
                    </tr>

                    {/* MW antenna diameter */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna diameter (cm)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={antenna.diameter}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'diameter', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${
                              antenna.diameterAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                            }`}
                            placeholder="Enter diameter..."
                            required
                          />
                        </td>
                      ))}
                    </tr>

                    {/* MW antenna azimuth */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna azimuth (degree)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="360"
                            value={antenna.azimuth}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'azimuth', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${
                              antenna.azimuthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                            }`}
                            placeholder="Enter azimuth..."
                            required
                          />
                        </td>
                      ))}
                    </tr>

                    {/* MW antenna includeInPlan */}
                    {/* <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Include in Plan
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name={`includeInPlan-${antennaIndex}`}
                                  value={option}
                                  checked={antenna.includeInPlan === option}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'includeInPlan', e.target.value)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className={antenna.includeInPlanAutoFilled ? 'text-[#006100]' : ''}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr> */}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded font-medium ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving Images & Data...
                </div>
              ) : (
                'Save and Continue'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Image Uploader */}
      <ImageUploader 
        images={getAllImages()} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default MwAntennasForm;
