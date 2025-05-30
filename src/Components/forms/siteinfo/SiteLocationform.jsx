import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios"; // Make sure to import axios

const SiteLocationForm = () => {
  const { sessionId, siteId } = useParams(); // sessionId and siteId from URL
  const location = useLocation();

  // Fetch survey details for pre-filling when session ID changes
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/sites/${siteId}`)
      .then(res => {
        const data = res.data;
        setFormData({
          siteId: siteId || data.site_id || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          sitename: data.sitename|| "",
          region: data.region || "",
          city: data.city || "",
          address: data.address || "",
          frontImage: data.frontImage || null,
          sideImage: data.sideImage || null,
          topImage: data.topImage || null,
          siteelevation: data.site_elevation || ""
        });
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  const [formData, setFormData] = useState({
    siteId: siteId || "",
    latitude: "",
    longitude: "",
    sitename: "",
    region: "",
    city: "",
    address: "",
    frontImage: null,
    sideImage: null,
    topImage: null,
    siteelevation: ""
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload excluding images for now
    const { frontImage, sideImage, topImage, ...dataWithoutImages } = formData;

    const payload = {
      site_name: dataWithoutImages.sitename,
      region: dataWithoutImages.region,
      city: dataWithoutImages.city,
      longitude: dataWithoutImages.longitude,
      latitude: dataWithoutImages.latitude,
      site_elevation:dataWithoutImages.siteelevation,
      address: dataWithoutImages.address,
     
    };

    

    try {
      const response=await axios.put(`${import.meta.env.VITE_API_URL}/api/sites/${siteId}`,payload);
      alert("Data submitted successfully!");
      console.log(response)
    } catch (err) {
      console.error("Error:", err);
      alert("Error submitting data. Please try again.");
    }
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], // Save file in state (not sent to backend yet)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Generate Google Map URL for embedding
  const getMapUrl = () => {
    const { latitude, longitude } = formData;
    if (!latitude || !longitude) return defaultMap;
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  };

  const defaultMap =
    "https://maps.google.com/maps?q=33.6844,73.0479&z=15&output=embed"; // Default Islamabad

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-full ">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          {/* Text Fields */}
          <div>
          <label className="font-semibold mb-1">Site-Id</label>
          <input
            type="text"
            name="siteId"
            placeholder="Site-Id"
            value={formData.siteId}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Site Name</label>
          <input
            type="text"
            name="siteName"
            placeholder="Site Name"
            value={formData.sitename}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Region</label>
          <input
            type="text"
            name="region"
            placeholder="Region"
            value={formData.region}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">City</label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Latitude</label>
          <input
            type="Number"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Longitude</label>
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          </div>
          <div>
          <label className="font-semibold mb-1">Site Elevation</label>
          <input
            type="number"
            name="siteelevation"
            placeholder="site elevation"
            value={formData.siteelevation}
            onChange={handleInputChange}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            // required
          />
          </div>

          {/* Image Uploads */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Front View Image</label>
            <input
              type="file"
              name="frontImage"
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Side View Image</label>
            <input
              type="file"
              name="sideImage"
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Top View Image</label>
            <input
              type="file"
              name="topImage"
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded-md"
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
    </div>
  );
};

export default SiteLocationForm;
