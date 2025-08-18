import React, { useState, useMemo, useEffect } from "react";
import ImageUploader from "../../GalleryComponent";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";

const ShelterRoomPreparationForm = () => {
  const { sessionId } = useParams();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});
  const [formData, setFormData] = useState({
    acType: "",
    acCount: "",
    acCapacity: "",
    acStatus: "",
    cableTrayHeight: "",
    cableTrayWidth: "",
    existingCableTraySpace: "",
    availableSpaceInFeederWindow: "",
    feederFreeHoles: "",
    feederWindows: "",
    busBarFreeHoles: "",
    rackFreePositions: ""
  });

  // Load data on component mount
  useEffect(() => {
    if (sessionId) {
      loadRoomPreparation();
    }
  }, [sessionId]);

  const loadRoomPreparation = async () => {
    try {
      setLoadingApi(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/room-preparation/${sessionId}`);
      
      const data = response.data.data || response.data;
      console.log("Fetched room preparation data:", data);

      if (data) {
        setFormData({
          acType: data.ac_type || "",
          acCount: data.ac_count || "",
          acCapacity: data.ac_capacity || "",
          acStatus: data.ac_status || "",
          cableTrayHeight: data.cable_tray_height || "",
          cableTrayWidth: data.cable_tray_width || "",
          existingCableTraySpace: data.existing_cable_tray_space || "",
          availableSpaceInFeederWindow: data.available_space_in_feeder_window || "",
          feederFreeHoles: data.feeder_free_holes || "",
          feederWindows: data.feeder_windows || "",
          busBarFreeHoles: data.bus_bar_free_holes || "",
          rackFreePositions: data.rack_free_positions || ""
        });

        // Process existing images from the response
        if (response.data.images && Array.isArray(response.data.images)) {
          console.log("Raw images from API:", response.data.images);
          console.log("API response structure:", response.data);
          
          // Process the images to group them by category (like RAN room)
          const processedImages = {};
          response.data.images.forEach(img => {
            const category = img.image_category || img.category;
            console.log("Processing image with category:", category, "Image:", img);
            if (category) {
              if (!processedImages[category]) {
                processedImages[category] = [];
              }
              processedImages[category].push({
                id: img.id,
                url: img.file_url || img.url, // Use file_url as primary URL
                file_url: img.file_url || img.url,
                name: img.original_filename || img.name,
                category: category,
                isExisting: true // Mark as existing image from backend
              });
              console.log(`Added image to category ${category}:`, processedImages[category]);
            } else {
              console.log("Image has no category:", img);
            }
          });
          
          console.log("Final processed images for state:", processedImages);
          setUploadedImages(processedImages);
        } else {
          console.log("No images found in API response");
          setUploadedImages({});
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error loading room preparation:', error);
      if (error.response?.status !== 404) {
        showError('Error loading existing data');
      }
      // Reset unsaved changes flag even on error
      setHasUnsavedChanges(false);
    } finally {
      setLoadingApi(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasUnsavedChanges(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingApi(true);
    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add JSON data
      const dataToSubmit = {
        ac_type: formData.acType || null,
        ac_count: formData.acCount || null,
        ac_capacity: formData.acCapacity ? parseFloat(formData.acCapacity) : null,
        ac_status: formData.acStatus || null,
        cable_tray_height: formData.cableTrayHeight ? parseFloat(formData.cableTrayHeight) : null,
        cable_tray_width: formData.cableTrayWidth ? parseFloat(formData.cableTrayWidth) : null,
        existing_cable_tray_space: formData.existingCableTraySpace || null,
        available_space_in_feeder_window: formData.availableSpaceInFeederWindow || null,
        feeder_free_holes: formData.feederFreeHoles ? parseInt(formData.feederFreeHoles) : null,
        feeder_windows: formData.feederWindows ? parseInt(formData.feederWindows) : null,
        bus_bar_free_holes: formData.busBarFreeHoles ? parseInt(formData.busBarFreeHoles) : null,
        rack_free_positions: formData.rackFreePositions ? parseInt(formData.rackFreePositions) : null
      };
      
      formDataToSubmit.append('data', JSON.stringify(dataToSubmit));
      
      // Add images - only new files, not existing ones
      console.log('Uploaded images before submission:', uploadedImages);
      Object.keys(uploadedImages).forEach(category => {
        const files = uploadedImages[category];
        console.log(`Processing category: ${category}, files:`, files);
        if (files && files.length > 0) {
          files.forEach((file, index) => {
            // Only append actual File objects, not existing image objects
            if (file instanceof File) {
              console.log(`Appending file for category ${category}:`, file.name, file.size);
              formDataToSubmit.append(category, file); // Use category name as field name
            } else {
              console.log(`Skipping non-File object for category ${category}:`, file);
            }
          });
        }
      });

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/room-preparation/${sessionId}`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update uploaded images with the response data
      if (response.data.images && Array.isArray(response.data.images)) {
        console.log("Updated images from response:", response.data.images);
        console.log("Full response data:", response.data);
        
        // Process the images to group them by category (like RAN room)
        const processedImages = {};
        response.data.images.forEach(img => {
          const category = img.image_category || img.category;
          if (category) {
            if (!processedImages[category]) {
              processedImages[category] = [];
            }
            processedImages[category].push({
              id: img.id,
              url: img.file_url || img.url, // Use file_url as primary URL
              file_url: img.file_url || img.url,
              name: img.original_filename || img.name,
              category: category,
              isExisting: true // Mark as existing image from backend
            });
          }
        });
        
        console.log("Processed images for state:", processedImages);
        setUploadedImages(processedImages);
      } else {
        console.log("No images in response:", response.data);
      }
      
      setHasUnsavedChanges(false);
      showSuccess('Room preparation saved successfully');
    } catch (error) {
      console.error('Error saving room preparation:', error);
      showError('Failed to save room preparation');
    } finally {
      setLoadingApi(false);
    }
  };

  const handleImageUpload = (imageCategory, files) => {
    setHasUnsavedChanges(true);
    console.log(`Images uploaded for ${imageCategory}:`, files);
    console.log('Files type:', typeof files, 'Is array:', Array.isArray(files));
    
    // Merge new files with existing images for this category
    const existingImages = uploadedImages[imageCategory] || [];
    const newFiles = Array.isArray(files) ? files : [files];
    
    console.log('Existing images:', existingImages);
    console.log('New files:', newFiles);
    
    // Filter out existing images that are not actual files (they have isExisting flag)
    const existingNonFiles = existingImages.filter(img => img.isExisting);
    
    // Combine existing non-file images with new files
    const combinedImages = [...existingNonFiles, ...newFiles];
    
    console.log('Combined images:', combinedImages);
    
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: combinedImages
    }));
  };

  // Generate dynamic images based on feeder windows count
  const images = useMemo(() => {
    const feederWindowsCount = parseInt(formData.feederWindows) || 0;
    
    const baseImages = [
      { label: 'Cable tray inside the shelter 1', name: 'cable_tray_inside_the_shelter_1' },
      { label: 'Cable tray inside the shelter 2', name: 'cable_tray_inside_the_shelter_2' },
      { label: 'Cable tray inside the shelter 3', name: 'cable_tray_inside_the_shelter_3' },
      { label: 'Cable tray inside the shelter 4', name: 'cable_tray_inside_the_shelter_4' },
      { label: 'Grounding bus bar photo', name: 'grounding_bus_bar_photo' }
    ];

    const dynamicImages = [];
   
    for (let i = 1; i <= feederWindowsCount; i++) {
      dynamicImages.push({
        label: `Feeder window ${i} photo`,
        name: `feeder_window_photo_${i}`
      });
      dynamicImages.push({
        label: `Roxtec Picture ${i} (Inside cabinet / Shelter)`,
        name: `roxtec_picture_inside_cabinet_shelter_${i}`
      });
      dynamicImages.push({
        label: `Roxtec Picture ${i} (Outside cabinet / Shelter)`,
        name: `roxtec_picture_outside_cabinet_shelter_${i}`
      });
      dynamicImages.push({
        label: `Roxtec Picture ${i} (Inside cabinet / Shelter) Zoomed`,
        name: `roxtec_picture_inside_cabinet_shelter_zoomed_${i}`
      });
      dynamicImages.push({
        label: `Roxtec Picture ${i} (Outside cabinet / Shelter) Zoomed`,
        name: `roxtec_picture_outside_cabinet_shelter_zoomed_${i}`
      });
    }

    return [...dynamicImages, ...baseImages];
  }, [formData.feederWindows]);

  return (
    <div className="h-full flex items-start space-x-2 justify-start bg-gray-100 p-">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full overflow-y-auto flex flex-col">
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
        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Type of Existing Air Conditioner</label>
              <div className=" grid grid-cols-3 gap-4">
                {[
                  "Split units",
                  "High wall units",
                  "Central Air-cond.",
                  "Not exist",
                  "Other",
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="acType"
                      value={type}
                      checked={formData.acType === type}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {type}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold ">
                How many air conditioners in the room?
              </label>
              <div className=" grid grid-cols-3 ">
                {["1", "2", "Other"].map((count) => (
                  <label key={count} className="flex items-center">
                    <input
                      type="radio"
                      name="acCount"
                      value={count}
                      checked={formData.acCount === count}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {count}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Air Conditioner system capacity (KVA)</label>
              <input
                type="number"
                name="acCapacity"
                value={formData.acCapacity}
                onChange={handleChange}
                className="form-input"
                required
                min={0}
              />
                  <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                Air Conditioner system operational status
              </label>
              <div className=" grid grid-cols-3 gap-4">
                {["Active", "Faulty", "not working"].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="radio"
                      name="acStatus"
                      value={status}
                      checked={formData.acStatus === status}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {status}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Hight under cable tray (clearance to the ground) (m)</label>
              <input
                type="number"
                name="cableTrayHeight"
                value={formData.cableTrayHeight}
                onChange={handleChange}
                className="form-input"
                min={0}
              />
                  <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Cable tray width (m)</label>
              <input
                type="number"
                name="cableTrayWidth"
                value={formData.cableTrayWidth}
                onChange={handleChange}
                className="form-input"
                min={0}
              />
                  <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                Is there available space on existing cable tray for new cables?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="existingCableTraySpace"
                      value={option}
                      checked={formData.existingCableTraySpace === option}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                Is there available space in feeders window for new cables entry?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="availableSpaceInFeederWindow"
                      value={option}
                      checked={formData.availableSpaceInFeederWindow === option}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                How many free holes in the feeders window?
              </label>
              <select
                name="feederFreeHoles"
                value={formData.feederFreeHoles}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(5)].map((_, i) => {
                  const num = i + 1;
                  return (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  );
                })}
              </select>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                How many Feeder Windows in room?
              </label>
              <select
                name="feederWindows"
                value={formData.feederWindows}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => {
                  const num = i + 1;
                  return (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  );
                })}
              </select>
              <hr className='mt-2' />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                How many free holes in existing bus bars?
              </label>
              <select
                name="busBarFreeHoles"
                value={formData.busBarFreeHoles}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => {
                  const num = i + 1;
                  return (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  );
                })}
              </select>
              <hr className='mt-2' />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">
                How many free position available for new racks installation? (60cm x 60cm)
              </label>
              <select
                name="rackFreePositions"
                value={formData.rackFreePositions}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(5)].map((_, i) => {
                  const num = i + 1;
                  return (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  );
                })}
              </select>
              <hr className='mt-2' />
            </div>




          </div>
          {/* Save Button at Bottom */}
          <div className="mt-auto pt-6 flex justify-center">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      <ImageUploader
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />

    </div>
  );
};

export default ShelterRoomPreparationForm;
