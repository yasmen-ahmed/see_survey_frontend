import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useImageManager from "../../../hooks/useImageManager";

const SiteLocationForm = () => {
  const { sessionId, siteId } = useParams();
  const { uploadedImages, handleImageUpload, saveImages, loading } = useImageManager(sessionId);

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

  // Fetch survey details for pre-filling when session ID changes
  useEffect(() => {
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
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit form data
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
      
      showSuccess('Data and images submitted successfully!');
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
  ];

  // Handle input change for form fields
  const handleInputChange = (e) => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] max-h-[650px] overflow-y-auto ">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 " onSubmit={handleSubmit}>
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

          <div className="md:col-span-2 flex justify-center">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              Save and Continue
            </button>
          </div>
        </form>

        {/* Google Map Below Form */}
        <div className="w-full h-80">
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

      <ImageUploader 
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default SiteLocationForm;
