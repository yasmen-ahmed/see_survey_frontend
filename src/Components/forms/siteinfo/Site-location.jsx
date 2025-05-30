import { useState } from 'react';

const SiteInfoForm = () => {
 
  const [formData, setFormData] = useState({
    siteId: '',
    siteName: '',
    region: '',
    city: '',
    latitude: '',
    longitude: '',
    siteElevation: '',
    address: '',
  });

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (setImageFunction, e) => {
    const file = e.target.files[0];
    if (!file) return;

    }


  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      image1,
      image2,
      image3
    };
    console.log('Form submitted:', submissionData);
    alert('Site information saved successfully!');
  };

  const ImageUploadField = ({ image, setImage, label }) => (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-40 flex items-center justify-center">
        {image ? (
          <div className="relative w-full h-full">
            <img 
              src={image} 
              alt="Preview" 
              className="max-h-full mx-auto rounded object-contain"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              
            </button>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <label className="relative cursor-pointer text-blue-600 hover:text-blue-800">
                <span>Tap or click to add a picture</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(setImage, e)}
                />
              </label>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Site Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="siteId">
                Site ID
              </label>
              <input
                type="text"
                id="siteId"
                name="siteId"
                value={formData.siteId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="siteName">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="region">
                Region
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="city">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

        
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="latitude">
                Latitude
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="longitude">
                Longitude
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="siteElevation">
                Site Elevation (from sea level in meters)
              </label>
              <input
                type="number"
                id="siteElevation"
                name="siteElevation"
                value={formData.siteElevation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUploadField 
            image={image1} 
            setImage={setImage1} 
            label="Site info photo 1: Site entrance" 
          />
          <ImageUploadField 
            image={image2} 
            setImage={setImage2} 
            label="Site info photo 2: Building Stairs / Lift" 
          />
          <ImageUploadField 
            image={image3} 
            setImage={setImage3} 
            label="Site info photo 3: Roof entrance" 
          />
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Site Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteInfoForm;