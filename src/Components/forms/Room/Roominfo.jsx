import React, { useState, useEffect } from "react";
import ImageUploader from "../../GalleryComponent";
import { useParams } from "react-router-dom";
import { showSuccess, showError } from "../../../utils/notifications";
import axios from "axios";

const ShelterRTelecomRoomForm = () => {
  const { sessionId } = useParams();

  const options = ["RAN", "Transmission", "DC Rectifier", "Batteries", "No Hardware", "Other"];
  const [selected, setSelected] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [formData, setFormData] = useState({
    height: "",
    width: "",
    depth: "",
    hardware: [],
    sketch_available: ""
  });

  const images = [
    { label: 'Room Outside photo', name: 'room_outside_photo' },
    { label: 'Overview Photos for the shelter floor plan', name: 'overview_photos_for_the_shelter_floor_plan' },
    { label: 'Photos for any Dismantled material inside shelter', name: 'dismantled_material_photos' },
    { label: 'cable tray photos outside the room at cable entry', name: 'cable_tray_photos_outside_the_room_at_cable_entry' },
    { label: 'cable tray photos outside the room at tower base', name: 'cable_tray_photos_outside_the_room_at_tower_base' },
    { label: 'room door photo from outside ', name: 'room_door_photo_from_outside' },
    { label: 'room door photo from inside', name: 'room_door_photo_from_inside' },
    { label: 'inside room panorama 1/6', name: 'inside_room_panorama_1_6' },
    { label: 'inside room panorama 2/6', name: 'inside_room_panorama_2_6' },
    { label: 'inside room panorama 3/6', name: 'inside_room_panorama_3_6' },
    { label: 'inside room panorama 4/6', name: 'inside_room_panorama_4_6' },
    { label: 'inside room panorama 5/6', name: 'inside_room_panorama_5_6' },
    { label: 'inside room panorama 6/6', name: 'inside_room_panorama_6_6' }
  ];

   // Fetch existing data when component loads
   useEffect(() => {
    if (!sessionId) return;
  
    axios.get(`${import.meta.env.VITE_API_URL}/api/room-info/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          const hardwareData = data.hardware || [];
          setFormData({
            height: data.height || "",
            width: data.width || "",
            depth: data.depth || "",
            hardware: hardwareData,
            sketch_available: data.sketch_available || ""
          });

          // Update selected state to match hardware data
          setSelected(hardwareData);

          // Process existing images from the response
          if (res.data.images && Object.keys(res.data.images).length > 0) {
            console.log("Processed images:", res.data.images);
            console.log("API response structure:", res.data);
            
            // Process the images to ensure they have the correct structure
            const processedImages = {};
            Object.keys(res.data.images).forEach(category => {
              const images = res.data.images[category];
              if (Array.isArray(images) && images.length > 0) {
                processedImages[category] = images.map(img => ({
                  ...img,
                  url: img.url || img.file_url, // Ensure url property exists
                  file_url: img.file_url || img.url // Ensure file_url property exists
                }));
              }
            });
            
            console.log("Processed images for state:", processedImages);
            setUploadedImages(processedImages);
          }

          // Reset unsaved changes flag after loading data
          setHasUnsavedChanges(false);
        }
      })
      .catch(err => {
        console.error("Error loading room info data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
      });
  }, [sessionId]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHasUnsavedChanges(true);

    if (type === "checkbox") {
      const updatedHardware = checked
        ? [...new Set([...formData.hardware, value])] // ensure uniqueness
        : formData.hardware.filter((item) => item !== value);
    
      setFormData((prev) => ({
        ...prev,
        hardware: updatedHardware,
      }));
      setSelected(updatedHardware); // sync selected
    }
     else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingApi(true);
    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add JSON data
      const dataToSubmit = {
        height: formData.height ? parseFloat(formData.height) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        depth: formData.depth ? parseFloat(formData.depth) : null,
        hardware: formData.hardware,
        sketch_available: formData.sketch_available || null
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

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/room-info/${sessionId}`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update uploaded images with the response data
      if (response.data.images && Object.keys(response.data.images).length > 0) {
        console.log("Updated images from response:", response.data.images);
        console.log("Full response data:", response.data);
        
        // Process the images to ensure they have the correct structure
        const processedImages = {};
        Object.keys(response.data.images).forEach(category => {
          const images = response.data.images[category];
          if (Array.isArray(images) && images.length > 0) {
            processedImages[category] = images.map(img => ({
              ...img,
              url: img.url || img.file_url, // Ensure url property exists
              file_url: img.file_url || img.url // Ensure file_url property exists
            }));
          }
        });
        
        console.log("Processed images for state:", processedImages);
        setUploadedImages(processedImages);
      } else {
        console.log("No images in response:", response.data);
      }
      
      setHasUnsavedChanges(false);
      showSuccess('Room information saved successfully');
    } catch (err) {
      console.error(err);
      showError('Failed to save room information');
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <div className="h-full flex items-start space-x-2 justify-start bg-gray-100 p-4">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full overflow-y-auto flex flex-col">
        {hasUnsavedChanges && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="text-sm font-medium">⚠️ You have unsaved changes</p>
            <p className="text-sm">Don't forget to save your changes before leaving this page.</p>
          </div>
        )}
        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block font-medium mb-1">Room Height (m)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="form-input" required />
            <hr className='mt-2' />
            </div>

            <div>
              <label className="block font-medium mb-1">Room Width (m)</label>
              <input type="number" name="width" value={formData.width} onChange={handleChange} className="form-input" required />
            <hr className='mt-2' />
            </div>

            <div>
              <label className="block font-medium mb-1">Room Depth (m)</label>
              <input type="number" name="depth" value={formData.depth} onChange={handleChange} className="form-input" required />
              <hr className='mt-2' />
            </div>

            <div className="form-section">
              <label className="font-semibold mb-1 block">Type of existing telecom hardware installed in the room</label>
              <div className=" grid grid-cols-3 ">
                {options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selected.includes(option)}
                      onChange={(e) => handleChange({ target: { name: 'hardware', value: option, type: 'checkbox', checked: e.target.checked } })}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <hr className='mt-2' />
            </div>

            <div className="">
              <label className="block font-medium ">Do you have sketch measurement for the room?</label>
              <div className="flex gap-6">
                <label>
                  <input type="radio" name="sketch_available" value="Yes" checked={formData.sketch_available === "Yes"} onChange={handleChange} /> Yes
                </label>
                <label>
                  <input type="radio" name="sketch_available" value="No" checked={formData.sketch_available === "No"} onChange={handleChange} /> No
                </label>
              </div>
              <hr className='mt-2' />
            </div>
            </div>

          <div className="mt-auto pt-6 flex justify-center">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "Loading..." : "Save"}
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

export default ShelterRTelecomRoomForm;
