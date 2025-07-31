import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useImageManager from "../../../hooks/useImageManager";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";
import { useReadOnly } from "../../../hooks/useReadOnly";

const SiteLocationForm = ({ readOnly = false }) => {
  const { sessionId, siteId } = useParams();
  const { uploadedImages, initialImages, handleImageUpload, saveImages, loading, resetUnsavedChanges } = useImageManager(sessionId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const { isReadOnly, disableAllFormElements } = useReadOnly();
  const formRef = useRef(null);
  
  // Use the readOnly prop or the context readOnly state
  const isFormReadOnly = readOnly || isReadOnly;
  

  const [formData, setFormData] = useState({
    siteId: siteId || "",
    latitude: "",
    longitude: "",
    sitename: "",
    region: "",
    city: "",
    address: "",
    siteelevation: ""
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      const payload = {
        sitename: formData.sitename,
        region: formData.region,
        city: formData.city,
        longitude: formData.longitude,
        latitude: formData.latitude,
        site_elevation: formData.siteelevation,
        address: formData.address,
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/sites/${siteId}`, payload);
      
      // Save images
      const imagesSaved = await saveImages();
      if (!imagesSaved) {
        throw new Error('Failed to save images');
      }
      
      setHasUnsavedChanges(false);
      resetUnsavedChanges(); // Reset the image change detection
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

  // Detect image changes
  useEffect(() => {
    if (Object.keys(uploadedImages).length > 0) {
      // Check if any images have been uploaded (not just loaded from server)
      const hasNewImages = Object.entries(uploadedImages).some(([category, files]) => {
        if (files && files.length > 0) {
          const file = files[0];
          // If it's a File object, it's a newly uploaded file
          return file instanceof File;
        }
        return false;
      });
      
      if (hasNewImages) {
        setHasUnsavedChanges(true);
      }
    }
  }, [uploadedImages]);

  // Fetch survey details for pre-filling when session ID changes
  useEffect(() => {
    setLoadingApi(true)
    axios.get(`${import.meta.env.VITE_API_URL}/api/sites/${siteId}`)
      .then(res => {
        const data = res.data;
        if (data) {
          setFormData({
            siteId: siteId || data.site_id || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            sitename: data.sitename || "",
            region: data.region || "",
            city: data.city || "",
            address: data.address || "",
            siteelevation: data.site_elevation || ""
          });
        } else {
          console.error("No data received from API");
        }
        setLoadingApi(false)
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  // Disable all form elements when in read-only mode
  useEffect(() => {
    if (isFormReadOnly) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        disableAllFormElements(formRef);
      }, 100);
    }
  }, [isFormReadOnly, disableAllFormElements]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Data and images submitted successfully!');
      }
    } catch (err) {
      console.error("Error:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  const images = [
    { label: 'Site entrance', name: 'site_entrance' },
    { label: 'Building Stairs / Lift', name: 'building_stairs_lift' },
    { label: 'Roof entrance', name: 'roof_entrance' },
    { label: 'Base station Shelter / Room', name: 'base_station_shelter' },
    { label: 'Site Name on shelter/room', name: 'site_name_shelter' },    
    { label: 'Crane Access to the Street', name: 'crane_access_street' },
    { label: 'Crane Location', name: 'crane_location' },
    { label: 'Site Environment View', name: 'site_environment' },
    { label: 'Site Map Snapshot', name: 'site_map_snapshot' },
    { label: 'Site ID Picture', name: 'site_id_picture' },
  ];

  // Handle image upload and detect changes
  const handleImageUploadWithChangeDetection = (imageCategory, files) => {
    handleImageUpload(imageCategory, files);
    
    // Set unsaved changes when any image is uploaded
    setHasUnsavedChanges(true);
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    setHasUnsavedChanges(true);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate Google Map URL for embedding
  const getMapUrl = () => {
    const { latitude, longitude } = formData;
    if (!latitude || !longitude) return defaultMap;
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  };

  const defaultMap = "https://maps.google.com/maps?q=33.6844,73.0479&z=15&output=embed";

  if (loading ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex items-start space-x-2 justify-start bg-gray-100 p-" ref={formRef}>
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full overflow-y-auto flex flex-col">
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && !isFormReadOnly && (
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
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Site-Id</label>
                <input
                  type="text"
                  name="siteId"
                  placeholder="Site-Id"
                  value={formData.siteId}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Site Name</label>
                <input
                  type="text"
                  name="sitename"
                  placeholder="Site Name"
                  value={formData.sitename}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Region</label>
                <input
                  type="text"
                  name="region"
                  placeholder="Region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Latitude</label>
                <input
                  type="Number"
                  name="latitude"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="font-semibold mb-1">Site Elevation</label>
                <input
                  type="number"
                  name="siteelevation"
                  placeholder="site elevation"
                  value={formData.siteelevation}
                  onChange={handleInputChange}
                  className="form-input"
                // required
                />
              </div>
            </div>

            {/* Google Map Below Form */}
            <div className="w-full h-48">
              <iframe
                title="Google Map"
                src={getMapUrl()}
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                className="rounded-md shadow-md border"
              ></iframe>
            </div>
          </div>

          {/* Save Button at Bottom */}
          <div className="mt-auto pt-6 flex justify-center">
            <button 
              type="submit" 
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {loadingApi ? "loading...": "Save"}  
            </button>
          </div>
        </form>
      </div>

      <ImageUploader 
        images={images}
        onImageUpload={handleImageUploadWithChangeDetection}
        uploadedImages={uploadedImages}
        readOnly={isFormReadOnly}
      />
    </div>
  );
};

export default SiteLocationForm;
