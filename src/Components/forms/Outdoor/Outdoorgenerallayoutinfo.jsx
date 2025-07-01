import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";

const OutdoorForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    sunshade: '',
    freePositions: '',
    cableTrayHeight: '',
    cableTrayWidth: '',
    cableTrayDepth: '',
    spaceForNewCables: '',
    earthBusBars: '',
    freeHolesInBusBars: '',
    hasSketch: Boolean,
  });

  const [uploadedImages, setUploadedImages] = useState({});

  // Generate image fields based on number of free positions
  const getPositionImages = () => {
    if (!formData.freePositions || formData.freePositions === '0') return [];
    const count = parseInt(formData.freePositions);
    let allImages = [];
    allImages.push({
      label: `Site outdoor location general photo`,
      name: `site_outdoor_location_general_photo`
    });
    for (let i = 1; i <= count; i++) {
  
      allImages.push({
        label: `Free Position ${i}`,
        name: `free_position_${i}`
      });
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
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };
  useEffect(() => {
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
                      data.has_site_sketch || "",
          });

          // Process and set images from the response
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const processedImages = processImagesFromResponse(data);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading outdoor general layout data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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

      // Get all possible image fields
      const allImageFields = getPositionImages();
      
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

      console.log("Expected image fields:", allImageFields.map(field => field.name));
      console.log("Uploaded images keys:", Object.keys(uploadedImages));

      console.log("Submitting outdoor general layout data:");
      // Log FormData contents for debugging
      for (let pair of submitFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Server response:", response.data);
      
      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`);
      const latestData = getResponse.data.data || getResponse.data;

      if (latestData) {
        setFormData({
          sunshade: latestData.equipment_area_sunshade || "",
          freePositions: latestData.free_positions_available?.toString() || "",
          cableTrayHeight: latestData.cable_tray_config?.height?.toString() || "",
          cableTrayWidth: latestData.cable_tray_config?.width?.toString() || "",
          cableTrayDepth: latestData.cable_tray_config?.depth?.toString() || "",
          spaceForNewCables: latestData.cable_tray_space_available === true ? "Yes" : 
                            latestData.cable_tray_space_available === false ? "No" : 
                            latestData.cable_tray_space_available || "",
          earthBusBars: latestData.earth_bus_bar_config?.available_bars?.toString() || "",
          freeHolesInBusBars: latestData.earth_bus_bar_config?.free_holes?.toString() || "",
          hasSketch: latestData.has_site_sketch === true ? true : 
                    latestData.has_site_sketch === false ? false : 
                    latestData.has_site_sketch || "",
        });

        // Process and update images
        if (latestData.images && Array.isArray(latestData.images) && latestData.images.length > 0) {
          const processedImages = processImagesFromResponse(latestData);
          console.log("Processed images from response:", processedImages);
          setUploadedImages(processedImages);
        } else {
          console.log("No images found in response, keeping uploaded images");
          // Keep File objects for newly uploaded images
          const newUploadedImages = {};
          Object.entries(uploadedImages).forEach(([key, files]) => {
            if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
              newUploadedImages[key] = files;
            }
          });
          setUploadedImages(newUploadedImages);
        }
      }
      
      showSuccess('Outdoor General Layout data and images submitted successfully!');
    } catch (err) {
      console.error("Error submitting outdoor general layout data:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>



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
            <hr className="my-4" />
          </div>

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
            <hr className="my-4" />
          </div>
          {/* Free Positions Field */}
          <div>
            <label className='block font-semibold mb-2'>How many free positions available for new cabinets installation?</label>
            <select
              name='freePositions'
              value={formData.freePositions}
              onChange={handleChange}
              className='border p-2 rounded w-full'
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

          {/* Cable Tray Fields */}
          {['Height of existing cable tray from site floor level (cm)', 'Width of existing cable tray (cm)', 'Depth of existing cable tray (cm)'].map((label, index) => (
            <div key={index}>
              <label className='block font-semibold mb-2'>{label}</label>
              <input
                type='number'
                name={['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]}
                value={formData[['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]]}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              />
              <hr className="my-4" />
            </div>
          ))}



          {/* Earth Bus Bars Field */}
          <div>
            <label className='block font-semibold mb-2'>How many Earth bus bar available in cabinets location?</label>
            <select
              name='earthBusBars'
              value={formData.earthBusBars}
              onChange={handleChange}
              className='border p-2 rounded w-full'
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
              className='border p-2 rounded w-full'
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
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
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

