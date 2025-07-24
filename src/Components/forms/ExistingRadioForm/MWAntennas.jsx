import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

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
  const [loadingApi, setLoadingApi] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [operatorOptions, setOperatorOptions] = useState(['Operator A', 'Operator B', 'Operator C']);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;

    try {
      setLoadingApi(true);
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
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][oduLocation]`, antenna.oduLocation || '');
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][operator]`, antenna.operator || '');
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][farEndSiteId]`, antenna.farEndSiteId || '');
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][hopDistance]`, parseFloat(antenna.hopDistance) || 0);
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][linkCapacity]`, parseFloat(antenna.linkCapacity) || 0);
        submitFormData.append(`mwAntennasData[mw_antennas][${index}][actionPlanned]`, antenna.actionPlanned || '');
      });

      // Get all possible image fields
      const allImageFields = getAllImages();

      // Handle all image fields - including removed ones
      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];

        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            submitFormData.append(imageField.name, file);
          }
        } else {
          // If image was removed or doesn't exist, send empty string
          submitFormData.append(imageField.name, '');
        }
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`,
        submitFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('Data saved successfully!');
      return true;
    } catch (err) {
      console.error("Error saving data:", err);
      showError('Error saving data. Please try again.');
      return false;
    } finally {
      setLoadingApi(false);
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

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
    setIsInitialLoading(true);
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
            oduLocation: antenna.oduLocation || "",
            operator: antenna.operator || "",
            farEndSiteId: antenna.farEndSiteId || "",
            hopDistance: antenna.hopDistance || "",
            linkCapacity: antenna.linkCapacity || "",
            actionPlanned: antenna.actionPlanned || ""
          }));

          setFormData({
            antennaCount: antennaCount.toString(),
            antennas: processedAntennas
          });

          // Set operator options from API response
          if (data.operatorOptions && Array.isArray(data.operatorOptions)) {
            setOperatorOptions(data.operatorOptions);
          }

          // Process and set images from the response
          if (antennas.some(ant => ant.images?.length > 0)) {
            const processedImages = processImagesFromResponse(antennas);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading MW antennas data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      });
  }, [sessionId]);

  const handleAntennaCountChange = (e) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

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
        oduLocation: "",
        operator: "",
        farEndSiteId: "",
        hopDistance: "",
        linkCapacity: "",
        actionPlanned: ""
      };
    });

    setFormData({ antennaCount: e.target.value, antennas });
    setHasUnsavedChanges(true);
  };

  const handleAntennaChange = (changedIndex, field, value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    const updated = [...formData.antennas];

    // Update the changed antenna first
    updated[changedIndex] = {
      ...updated[changedIndex],
      [field]: value,
      [`${field}AutoFilled`]: false // The changed field is not auto-filled
    };

    // Auto-fill empty fields in other antennas
    const numAntennas = parseInt(formData.antennaCount) || 1;
    for (let i = 0; i < numAntennas; i++) {
      if (i !== changedIndex) { // Skip the antenna that was manually changed
        // Only auto-fill if the field is empty or was previously auto-filled
        if (!updated[i][field] || updated[i][`${field}AutoFilled`]) {
          updated[i] = {
            ...updated[i],
            [field]: value,
            [`${field}AutoFilled`]: true
          };
        }
      }
    }

    setFormData({ ...formData, antennas: updated });
    setHasUnsavedChanges(true);
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('MW antennas data and images submitted successfully!');
      }
    } catch (err) {
      console.error("Error submitting MW antennas data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  const bgColorFillAuto = "bg-[#c6efce]"
  const colorFillAuto = 'text-[#006100]'
  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
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

<form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
         


            {/* MW Antenna Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
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
              
                        <div className="flex-1 overflow-y-auto">
                  <table className="table-auto w-full border-collapse">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th
                           className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-20"
                          style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                        >
                          Field Description
                        </th>
                        {Array.from({ length: parseInt(formData.antennaCount) }, (_, i) => (
                          <th
                            key={i}
                           className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-10"
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
                              className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.heightAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
                                }`}
                              placeholder="Enter height..."
                              required
                            />
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                          Existing MW ODU located at...
                        </td>
                        {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                          <td key={antennaIndex} className={`border px-2 py-2 ${antenna.oduLocationAutoFilled ? bgColorFillAuto : ''}`}>
                                <div className="grid grid-cols-2 gap-1">  
                              {['Tower leg A', 'Tower leg B', 'Tower leg C', 'Tower leg D', 'On the ground'].map((option) => (
                                <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`oduLocation-${antennaIndex}-${antennaIndex}`} 
                                    value={option}
                                    checked={antenna.oduLocation === option}
                                    onChange={(e) => handleAntennaChange(antennaIndex, 'oduLocation', e.target.value)}
                                    className={`w-4 h-4 ${antenna.oduLocationAutoFilled ? colorFillAuto : ''}`}
                                  />
                                  <span className={antenna.oduLocationAutoFilled ? colorFillAuto : ''}>
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                              className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.diameterAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
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
                              className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.azimuthAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
                                }`}
                              placeholder="Enter azimuth..."
                              required
                            />
                          </td>
                        ))}
                      </tr>

                     
                      <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      If shared site, MW Antenna belongs to which operator?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className={`border px-2 py-2 ${antenna.operatorAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className="grid grid-cols-2 gap-4">
                            {operatorOptions.map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name={`operator-${antennaIndex}`}
                                  value={option}
                                  checked={antenna.operator === option}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'operator', e.target.value)}
                                  className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${antenna.operatorAutoFilled ? colorFillAuto : ''}`}
                                />
                                <span className={antenna.operatorAutoFilled ? colorFillAuto : ''}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Far End Site ID
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className={`border px-2 py-2 ${antenna.farEndSiteIdAutoFilled ? bgColorFillAuto : ''}`}>
                       
                                <input
                                  type="text"
                                  name={`farEndSiteId-${antennaIndex}`}
                                  value={antenna.farEndSiteId}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'farEndSiteId', e.target.value)}
                                  className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.farEndSiteIdAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
                                }`}
                                />
                              
                             
                          
                         
                        </td>
                      ))}
                    </tr>

                   
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Hop Distance (km)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className={`border px-2 py-2 ${antenna.hopDistanceAutoFilled ? bgColorFillAuto : ''}`}>
                       
                                <input
                                  type="number" 
                                  name={`hopDistance-${antennaIndex}`}
                                  value={antenna.hopDistance}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'hopDistance', e.target.value)}
                                  className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.hopDistanceAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
                                }`}
                                />
                              
                             
                          
                         
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Link Capacity 
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className={`border px-2 py-2 ${antenna.linkCapacityAutoFilled ? bgColorFillAuto : ''}`}>
                       
                                <input
                                  type="number" 
                                  name={`linkCapacity-${antennaIndex}`}
                                  value={antenna.linkCapacity}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'linkCapacity', e.target.value)}
                                  className={`w-full p-2 border rounded text-sm transition-colors duration-200 ${antenna.linkCapacityAutoFilled
                                  ? `${bgColorFillAuto} ${colorFillAuto}`
                                  : 'border-gray-300 focus:border-blue-500'
                                }`}
                                />
                              
                             
                          
                         
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Is any action planned for MW unit ?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className={`border px-2 py-2 ${antenna.actionPlannedAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className="grid grid-cols-2 gap-4">
                        
                            {['Swap', 'Dismantle', 'No action'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name={`actionPlanned-${antennaIndex}`}
                                  value={option}
                                  checked={antenna.actionPlanned === option}
                                  onChange={(e) => handleAntennaChange(antennaIndex, 'actionPlanned', e.target.value)}
                                  className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${antenna.actionPlannedAutoFilled ? colorFillAuto : ''}`} 
                                />
                                <span className={antenna.actionPlannedAutoFilled ? colorFillAuto : ''}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    </tbody>
                  </table>
                </div>
            
            )}

            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}
              </div>
            )}
        
             {/* Save Button at Bottom - Fixed */}
             <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading...": "Save"}     
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
