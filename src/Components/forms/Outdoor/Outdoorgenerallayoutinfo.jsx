import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const OutdoorForm = () => {
  const { sessionId } = useParams();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    sunshade: '',
    freePositions: '',
    cableTrayHeight: '',
    cableTrayWidth: '',
    cableTrayDepth: '',
    spaceForNewCables: '',
    earthBusBars: '',
    freeHolesInBusBars: '',
    hasSketch: false,
    distanceFromEquipmentToTowerBase: '',
    isEarthBusBarsConnectedToMainEarthSystem: '',
    acElectricalSockets: '',
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;

    try {
      setLoadingApi(true);
      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add form data with proper type conversions
      submitFormData.append('equipment_area_sunshade', formData.sunshade);
      submitFormData.append('free_positions_available', parseInt(formData.freePositions) || 0);
      submitFormData.append('cable_tray_config', JSON.stringify({
        height: parseInt(formData.cableTrayHeight) || 0,
        width: parseInt(formData.cableTrayWidth) || 0,
        depth: parseInt(formData.cableTrayDepth) || 0
      }));

      // Convert Yes/No to boolean
      const spaceAvailable = formData.spaceForNewCables === "Yes" ? true :
        formData.spaceForNewCables === "No" ? false :
          Boolean(formData.spaceForNewCables);
      submitFormData.append('cable_tray_space_available', spaceAvailable);

      submitFormData.append('earth_bus_bar_config', JSON.stringify({
        available_bars: parseInt(formData.earthBusBars) || 0,
        free_holes: parseInt(formData.freeHolesInBusBars) || 0
      }));

      // Handle boolean conversion for hasSketch
      const hasSketch = formData.hasSketch === true || formData.hasSketch === "true";
      submitFormData.append('has_site_sketch', hasSketch);

      // Add new fields
      submitFormData.append('distance_from_equipment_to_tower_base', parseFloat(formData.distanceFromEquipmentToTowerBase) || 0);
      submitFormData.append('is_earth_bus_bars_connected_to_main_earth_system', formData.isEarthBusBarsConnectedToMainEarthSystem === true || formData.isEarthBusBarsConnectedToMainEarthSystem === "true");
      submitFormData.append('ac_electrical_sockets', parseInt(formData.acElectricalSockets) || 0);

      // Get all possible image fields
      const allImageFields = getPositionImages();

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
        `${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

  const [uploadedImages, setUploadedImages] = useState({});

  // Generate image fields based on number of free positions and earth bus bars
  const getPositionImages = () => {
    let allImages = [];
    
    // Static photos (not dependent on any number)
    allImages.push({
      label: `Site outdoor location general photo`,
      name: `site_outdoor_location_general_photo`
    });
    
    // Dynamic Earth bus bar photos based on selected number
    if (formData.earthBusBars && parseInt(formData.earthBusBars) > 0) {
      const busBarCount = parseInt(formData.earthBusBars);
      for (let i = 1; i <= busBarCount; i++) {
        allImages.push({
          label: `Grounding bus bar photo 1 (Bus bar ${i})`,
          name: `grounding_bus_bar_photo_1_${i}`
        });
        allImages.push({
          label: `Grounding bus bar photo 2 (Bus bar ${i})`,
          name: `grounding_bus_bar_photo_2_${i}`
        });
      }
    }
    
    // Additional static photos
    allImages.push({
      label: `Sketch layout Photo`,
      name: `sketch_layout_photo`
    });
    
    allImages.push({
      label: `Surrounding Area Pictures 1`,
      name: `surrounding_area_pictures_1`
    });
    
    allImages.push({
      label: `Surrounding Area Pictures 2`,
      name: `surrounding_area_pictures_2`
    });
    
    allImages.push({
      label: `Surrounding Area Pictures 3`,
      name: `surrounding_area_pictures_3`
    });
    
    allImages.push({
      label: `Surrounding Area Pictures 4`,
      name: `surrounding_area_pictures_4`
    });
    
    // Dynamic free position photos (existing functionality)
    if (formData.freePositions && formData.freePositions !== '0') {
      const count = parseInt(formData.freePositions);
      for (let i = 1; i <= count; i++) {
      allImages.push({
        label: `Free Position ${i}`,
        name: `free_position_${i}`
      });
      }
    }

    return allImages;
  };

  // Process images from API response
  const processImagesFromResponse = (data) => {
    const imagesByCategory = {};

    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
        // Handle the actual API response structure
        const category = img.category || img.image_category;

        // Skip images with invalid or empty categories
        if (!category || category.trim() === "") {
          console.warn("Skipping image with empty category:", img);
          return;
        }

        imagesByCategory[category] = [{
          id: img.id,
          file_url: img.url || img.file_url,
          name: img.original_filename || (img.url || img.file_url)?.split('/').pop() || `image_${img.id}`
        }];
      });
    }

    return imagesByCategory;
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    setHasUnsavedChanges(true);
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  useEffect(() => {
    setIsInitialLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`)
      .then(res => {
        // Handle response structure - data is directly in res.data.data
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          setFormData({
            sunshade: data.equipment_area_sunshade || "",
            freePositions: data.free_positions_available?.toString() || "",
            cableTrayHeight: data.cable_tray_config?.height?.toString() || "",
            cableTrayWidth: data.cable_tray_config?.width?.toString() || "",
            cableTrayDepth: data.cable_tray_config?.depth?.toString() || "",
            spaceForNewCables: data.cable_tray_space_available === true ? "Yes" :
              data.cable_tray_space_available === false ? "No" :
                data.cable_tray_space_available || "",
            earthBusBars: data.earth_bus_bar_config?.available_bars?.toString() || "",
            freeHolesInBusBars: data.earth_bus_bar_config?.free_holes?.toString() || "",
            hasSketch: data.has_site_sketch === true ? true :
              data.has_site_sketch === false ? false :
                data.has_site_sketch || false,
            distanceFromEquipmentToTowerBase: data.distance_from_equipment_to_tower_base?.toString() || "",
            isEarthBusBarsConnectedToMainEarthSystem: data.is_earth_bus_bars_connected_to_main_earth_system || "",
            acElectricalSockets: data.ac_electrical_sockets?.toString() || "",
          });

          // Process and set images from the response
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const processedImages = processImagesFromResponse(data);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading outdoor general layout data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      });
  }, [sessionId]);

  const handleChange = (e) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    const { name, value } = e.target;
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Outdoor general layout data and images submitted successfully!');
      }
    } catch (err) {
      console.error("Error submitting outdoor general layout data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

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
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              {/* Sunshade Field */}
              <div>
                <label className='block font-semibold mb-2'>Equipment area covered with sunshade?</label>
                <div className='flex gap-4'>
                  {['yes', 'no', 'partially'].map((option) => (
                    <label key={option} className='flex items-center'>
                      <input
                        type='radio'
                        name='sunshade'
                        value={option}
                        checked={formData.sunshade === option}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>
                <hr className="mt-9" />
              </div>


              {/* Free Positions Field */}
              <div>
                <label className='block font-semibold mb-2'>How many free positions available for new cabinets installation?</label>
                <select
                  name='freePositions'
                  value={formData.freePositions}
                  onChange={handleChange}
                  className='form-input'
                >
                  <option value=''>Select</option>
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <hr className="my-4" />
              </div>
              <div>
                <label className='block font-semibold mb-2'>Distance from equipment location to tower base (meter)</label>
                <input type="number" name="distanceFromEquipmentToTowerBase" value={formData.distanceFromEquipmentToTowerBase} onChange={handleChange} className='form-input' />
                <hr className="my-4" />

              </div>

              {/* Cable Tray Fields */}
              {['Height of existing cable tray from site floor level (cm)', 'Width of existing cable tray (cm)', 'Depth of existing cable tray (cm)'].map((label, index) => (
                <div key={index}>
                  <label className='block font-semibold mb-2'>{label}</label>
                  <input
                    type='number'
                    name={['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]}
                    value={formData[['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]]}
                    onChange={handleChange}
                    className='form-input'
                  />
                  <hr className="my-4" />
                </div>
              ))}

              {/* Space for New Cables */}
              <div>
                <label className='block font-semibold mb-2'>Is there available space on existing cable tray for new cables?</label>
                <div className='flex gap-4'>
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className='flex items-center'>
                      <input
                        type='radio'
                        name='spaceForNewCables'
                        value={option}
                        checked={formData.spaceForNewCables === option}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      {option}
                    </label>
                  ))}
                </div>
                <hr className="mt-9" />
              </div>

              {/* Earth Bus Bars Field */}
              <div>
                <label className='block font-semibold mb-2'>How many Earth bus bar available in cabinets location?</label>
                <select
                  name='earthBusBars'
                  value={formData.earthBusBars}
                  onChange={handleChange}
                  className='form-input'
                >
                  <option value=''>Select</option>
                  {[1, 2, 3].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <hr className="my-4" />
              </div>

              {/* Free Holes in Existing Bus Bars */}
              <div>
                <label className='block font-semibold mb-2'>How many free holes in existing bus bars?</label>
                <select
                  name='freeHolesInBusBars'
                  value={formData.freeHolesInBusBars}
                  onChange={handleChange}
                  className='form-input'
                >
                  <option value=''>Select</option>
                  {[1, 2, 3].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <hr className="my-4" />
              </div>
              <div>
                <label htmlFor="distanceFromEquipmentToTowerBase" className='block font-semibold mb-2'>Are the earth bus bars connected to the main earth system?</label>
                <div className="flex gap-6">
                  {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                    <label key={label} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="isEarthBusBarsConnectedToMainEarthSystem"
                        value={value}
                        checked={formData.isEarthBusBarsConnectedToMainEarthSystem === value}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "isEarthBusBarsConnectedToMainEarthSystem",
                              value: e.target.value === "true", // convert string to boolean
                            },
                          })
                        }
                        className="mr-2"
                        required
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <hr className="my-4" />

              </div>

              <div>
                <label className='block font-semibold mb-2' htmlFor="acElectricalSockets">How many AC electrical sockets available?</label>
                <input type="number" name="acElectricalSockets" value={formData.acElectricalSockets} onChange={handleChange} className='form-input' />
                <hr className="my-4" />

              </div>
              {/* Sketch with Measurements */}
              <div>
                <label className='block font-semibold mb-2'>Do you have a sketch with measurements for the site including cabinets?</label>

                <div className="flex gap-6">
                  {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                    <label key={label} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasSketch"
                        value={value}
                        checked={formData.hasSketch === value}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "hasSketch",
                              value: e.target.value === "true", // convert string to boolean
                            },
                          })
                        }
                        className="mr-2"
                        required
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <hr className="my-4" />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading..." : "Save"}
            </button>
          </div>

        </form>
      </div>

      {/* Image Uploader */}
      <ImageUploader
        images={getPositionImages()}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default OutdoorForm;

