import React, { useState , useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from "../../GalleryComponent";
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const AntennaStructureForm = () => {
  const { sessionId } = useParams();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    hasSketch: "No",
    towerType: [],
    gfHeight: "",
    rtStructureCount: "",
    rtHeights: [],
    buildingHeight: "",
    lightningSystem: "No",
    earthingBusBar: "No",
    freeHoles: "",
    emptyMounts: 0, // Default to 0
    tower_manufacturer: "", // Default to empty string
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      const formPayload = new FormData();

      // Append all form fields
      formPayload.append('has_sketch_with_measurements', formData.hasSketch);
      formPayload.append('tower_type', JSON.stringify(formData.towerType));
      formPayload.append('gf_antenna_structure_height', formData.gfHeight);
      formPayload.append('rt_how_many_structures_onsite', formData.rtStructureCount);
      formPayload.append('rt_existing_heights', JSON.stringify(formData.rtHeights));
      formPayload.append('rt_building_height', formData.buildingHeight);
      formPayload.append('lightening_system_installed', formData.lightningSystem);
      formPayload.append('earthing_bus_bars_exist', formData.earthingBusBar);
      formPayload.append('how_many_free_holes_bus_bars', formData.freeHoles);
      formPayload.append('empty_mounts', formData.emptyMounts); // Append the new field
      formPayload.append('tower_manufacturer', formData.tower_manufacturer); // Append the new field

      // Append any newly selected File objects under their category keys
      Object.entries(uploadedImages).forEach(([category, files]) => {
        files.forEach(item => {
          if (item instanceof File) {
            formPayload.append(category, item);
          }
        });
      });

      // Send everything in a single multipart request
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/antenna-structure/${sessionId}`,
        formPayload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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

  // State for managing uploaded images
  const [uploadedImages, setUploadedImages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const images = [
    { label: 'Structure general photo', name: 'structure_general_photo' },
    { label: 'Structure Legs Photo 1', name: 'structure_legs_photo_1' },
    { label: 'Structure Legs Photo 2', name: 'structure_legs_photo_2' },
    { label: 'Structure Legs Photo 3', name: 'structure_legs_photo_3' },
    { label: 'Structure Legs Photo 4', name: 'structure_legs_photo_4' },
    { label: 'Building Photo', name: 'building_photo' },
    { label: 'North Direction View', name: 'north_direction_view' },
    { label: 'Tower Ladder and Cables/Feeders1', name: 'tower_ladder_and_cables_feeders_1' },
    { label: 'Tower Ladder and Cables/Feeders2', name: 'tower_ladder_and_cables_feeders_2' },
    { label: 'Cable Tray showing all Cables, #1 Starting from tower side', name: 'cable_tray_showing_all_cables_1' },
    { label: 'Cable Tray showing all Cables, #2 Starting from tower side', name: 'cable_tray_showing_all_cables_2' },
    { label: 'Cable Tray showing all Cables, #3 Starting from tower side', name: 'cable_tray_showing_all_cables_3' },
    { label: 'Cable Tray showing all Cables, #4 Starting from tower side', name: 'cable_tray_showing_all_cables_4' },
    { label: 'Complete Tower Picture from different angles 1', name: 'complete_tower_picture_from_different_angles_1' },
    { label: 'Complete Tower Picture from different angles 2', name: 'complete_tower_picture_from_different_angles_2' },
    { label: 'Complete Tower Picture from different angles 3', name: 'complete_tower_picture_from_different_angles_3' },
    { label: 'Tower Pic (Top of tower) shows measure tool with reading', name: 'tower_pic_top_of_tower_shows_measure_tool_with_reading' },
    { label: 'Tower Pic (Bottom of tower) shows measure tool with reading', name: 'tower_pic_bottom_of_tower_shows_measure_tool_with_reading' },
    { label: 'Tower Additional Picture 1', name: 'tower_additional_picture_1' },
    { label: 'Tower Additional Picture 2', name: 'tower_additional_picture_2' },
    { label: 'Tower Additional Picture 3', name: 'tower_additional_picture_3' },
    { label: 'Tower Additional Picture 4', name: 'tower_additional_picture_4' },
    { label: 'Tower manufactory/specification Picture', name: 'tower_manufactory_specification_picture' },
    { label: 'Top of Building shows measure tool with reading Picture', name: 'top_of_building_shows_measure_tool_with_reading_picture' },
    { label: 'Building Parapet Picture with measure tool & length Reading', name: 'building_parapet_picture_with_measure_tool_and_length_reading' },
    { label: 'RF Panorama Photos (0 deg )', name: 'rf_panorama_photos_0_deg' },
    { label: 'RF Panorama Photos (30 deg )', name: 'rf_panorama_photos_30_deg' },
    { label: 'RF Panorama Photos (60 deg )', name: 'rf_panorama_photos_60_deg' },
    { label: 'RF Panorama Photos (90 deg )', name: 'rf_panorama_photos_90_deg' },
    { label: 'RF Panorama Photos (120 deg )', name: 'rf_panorama_photos_120_deg' },
    { label: 'RF Panorama Photos (150 deg )', name: 'rf_panorama_photos_150_deg' },
    { label: 'RF Panorama Photos (180 deg )', name: 'rf_panorama_photos_180_deg' },
    { label: 'RF Panorama Photos (210 deg )', name: 'rf_panorama_photos_210_deg' },
    { label: 'RF Panorama Photos (240 deg )', name: 'rf_panorama_photos_240_deg' },
    { label: 'RF Panorama Photos (270 deg )', name: 'rf_panorama_photos_270_deg' },
    { label: 'RF Panorama Photos (300 deg )', name: 'rf_panorama_photos_300_deg' },
    { label: 'RF Panorama Photos (330 deg )', name: 'rf_panorama_photos_330_deg' },
    { label: 'Night beacon picture', name: 'night_beacon_picture' },
    { label: 'Lightening Rode', name: 'lightening_rods' }
  ];

  // Generate dynamic empty mounts photo fields based on emptyMounts value
  const generateEmptyMountsPhotos = () => {
    const emptyMountsCount = parseInt(formData.emptyMounts) || 0;
    const dynamicPhotos = [];
    
    for (let i = 1; i <= emptyMountsCount; i++) {
      dynamicPhotos.push({
        label: `Empty Mount (Side Arm) ${i} Photo`,
        name: `empty_mount_side_arm_${i}_photo`
      });
    }
    
    return dynamicPhotos;
  };

  // Combine static images with dynamic empty mounts photos
  const allImages = [...images, ...generateEmptyMountsPhotos()];

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

  useEffect(() => {
    setIsInitialLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/antenna-structure/${sessionId}`)
      .then(res => {
        const payload = res.data.data;
        console.log("Fetched payload:", payload);

        // Populate form fields
        const data = payload.antennaStructureData || {};
        setFormData({
          hasSketch: data.has_sketch_with_measurements || "",
          towerType: data.tower_type || [],
          gfHeight: data.gf_antenna_structure_height || "",
          rtStructureCount: data.rt_how_many_structures_onsite || "",
          rtHeights: data.rt_existing_heights || [],
          buildingHeight: data.rt_building_height || "",
          lightningSystem: data.lightening_system_installed || "",
          earthingBusBar: data.earthing_bus_bars_exist || "",
          freeHoles: data.how_many_free_holes_bus_bars || "",
          emptyMounts: data.empty_mounts || 0, // Populate the new field
          tower_manufacturer: data.tower_manufacturer || "", // Populate the new field
        });

        // Populate existing images by category
        const imagesPayload = payload.images;
        if (imagesPayload?.images_by_category) {
          setUploadedImages(imagesPayload.images_by_category);
        } else if (imagesPayload?.all_images) {
          const grouped = imagesPayload.all_images.reduce((acc, img) => {
            const cat = img.image_category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(img);
            return acc;
          }, {});
          setUploadedImages(grouped);
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading antenna structure data:", err);
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
    
    const { name, value, type, checked } = e.target;
    setHasUnsavedChanges(true);
  
    if (name === "towerType") {
      let updatedTowerTypes = [...formData.towerType];
      if (checked) {
        updatedTowerTypes.push(value);
      } else {
        updatedTowerTypes = updatedTowerTypes.filter((t) => t !== value);
      }
  
      setFormData((prev) => ({
        ...prev,
        towerType: updatedTowerTypes,
        // Clear gfHeight if no GF selected
        gfHeight: updatedTowerTypes.some((t) => t.includes("GF")) ? prev.gfHeight : "",
        rtHeights: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.rtHeights : [],
        buildingHeight: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.buildingHeight : "",
        rtStructureCount: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.rtStructureCount : "",
      }));
    } else if (name === "rtHeights") {
      let updatedRtHeights = [...(formData.rtHeights || [])];
      if (checked) {
        updatedRtHeights.push(value);
      } else {
        updatedRtHeights = updatedRtHeights.filter((h) => h !== value);
      }
  
      setFormData((prev) => ({
        ...prev,
        rtHeights: updatedRtHeights,
      }));
    } else if (name === "emptyMounts") {
      setFormData((prev) => ({
        ...prev,
        emptyMounts: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setHasUnsavedChanges(true);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Unified form submission with form fields + image files
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Antenna structure data and images submitted successfully!');
      }
    } catch (err) {
      console.error('Submission error:', err);
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

          {/* Sketch Availability */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Do you have a sketch with measurements for the site layout?</label>
            <div className="space-x-4">
              <label><input type="radio" name="hasSketch" value="Yes" onChange={handleChange} checked={formData.hasSketch === "Yes"} /> Yes</label>
              <label><input type="radio" name="hasSketch" value="No" onChange={handleChange} checked={formData.hasSketch === "No"} /> No</label>
            </div>
            <hr className='mt-10' />     
          </div>

          {/* Tower Type */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tower Type</label>
            <div className="grid grid-cols-4 gap-2">
              {["GF tower", "GF Monopole", "GF Palm tree", "RT tower", "RT poles", "Wall mounted", "Other"].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    name="towerType"
                    value={type}
                    checked={formData.towerType.includes(type)}
                    onChange={handleChange}
                  />{" "}
                  {type}
                </label>
              ))}
            </div>
            <hr className='mt-2' />     
          </div>

          {/* GF Height */}
          {formData.towerType.some(type => type.includes("GF")) && (
            <div className="flex flex-col">
              <label className="font-semibold mb-1">What is the antenna structure height? (meters)</label>
              <input
              type="number"
              name="gfHeight"
              value={formData.gfHeight}
              onChange={handleChange}
              className="form-input"
              placeholder="000"
            />
              <hr className='mt-2' /> 
              </div>    
                
            )}

          {/* RT Structure Count */}
          {formData.towerType.some(type => type.includes("RT")) && (
            <>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many structures onsite?</label>
            <select
              name="rtStructureCount"
              value={formData.rtStructureCount}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">-- Select --</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <hr className='mt-2' /> 
          </div>

       
          <div className="flex flex-col">
            <label className="font-semibold mb-1">What are the existing heights?</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {["3m", "6m", "9m", "12m", "15m", "Other"].map((height) => (
                <label key={height}>
                  <input
                    type="checkbox"
                    name="rtHeights"
                    value={height}
                    checked={formData.rtHeights.includes(height)}
                    onChange={handleChange}
                    className="mr-1"
                  /> 
                  {height}
                </label>
              ))}
            </div>
            <hr className='mt-2' /> 
          </div>

        
          <div className="flex flex-col">
            <label className="font-semibold mb-1">What is the building height? (meters)</label>
            <input
              type="number"
              name="buildingHeight"
              value={formData.buildingHeight}
              onChange={handleChange}
              className="form-input"
              placeholder="000"
            />
            <hr className='mt-2' /> 
          </div>
          </>
          )}

          {/* Lightning System */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Lightning system installed on existing towers?</label>
            <div className="space-x-4">
              <label><input type="radio" name="lightningSystem" value="Yes" onChange={handleChange} checked={formData.lightningSystem === "Yes"} /> Yes</label>
              <label><input type="radio" name="lightningSystem" value="No" onChange={handleChange} checked={formData.lightningSystem === "No"} /> No</label>
            </div>
            <hr className='mt-9' /> 
          </div>

          {/* Earthing Bus Bars */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many earthing bus bars exist on towers?</label>
            <div className="space-x-4">
              {/* <label><input type="radio" name="earthingBusBar" value="Yes" onChange={handleChange} checked={formData.earthingBusBar === "Yes"} /> Yes</label>
              <label><input type="radio" name="earthingBusBar" value="No" onChange={handleChange} checked={formData.earthingBusBar === "No"} /> No</label> */}
            
            <input
              type="number"
              name="earthingBusBar" 
              value={formData.earthingBusBar}
              onChange={handleChange}
              className="form-input"
              placeholder="000"
            />
            </div>
            <hr className='mt-8' /> 
          </div>

          {/* Free Holes */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many free holes in existing bus bars?</label>
            <select
              name="freeHoles"
              value={formData.freeHoles}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">-- Select --</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
              <option value="more than 10">More than 10</option>
            </select>
            <hr className='mt-2' /> 
              </div>

          {/* Empty Mounts */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many empty mounts (Side Arms)?</label>
            <input
              type="number"
              name="emptyMounts"
              value={formData.emptyMounts || 0} // Default to 0
              onChange={handleChange}
              className="form-input"
              placeholder="Enter number of empty mounts"
            />
            <hr className='mt-2' /> 
          </div>

          {/* Tower Manufacturer */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tower Manufacturer</label>
            <input
              type="text"
              name="tower_manufacturer"
              value={formData.tower_manufacturer || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter tower manufacturer"
            />
            <hr className='mt-2' /> 
          </div>
</div>
</div>
          {/* Submit Button */}
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
        images={allImages} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default AntennaStructureForm;
