import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";

const AcInformationForm = () => {
  const { sessionId, siteId } = useParams();
  const [powerSources, setPowerSources] = useState([]);
  const [dieselCount, setDieselCount] = useState(0);
  const [dieselGenerators, setDieselGenerators] = useState([{ capacity: '', status: '' }, { capacity: '', status: '' }]);
  const [solarCapacity, setSolarCapacity] = useState('');
  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`)
      .then(res => {
        const data = res.data.data;
        console.log("API Response:", data);

        // Set the power sources based on the response
        setPowerSources(data.power_sources || []);

        // If diesel generators are present, set the count and details
        if (data.power_sources && data.power_sources.includes('diesel_generator') && data.diesel_config) {
          setDieselCount(data.diesel_config.count);

          // Map the generators and convert status to proper case
          const mappedGenerators = data.diesel_config.generators.map(gen => ({
            capacity: gen.capacity,
            status: capitalizeFirstLetter(gen.status)
          }));

          setDieselGenerators(mappedGenerators);
        } else {
          setDieselCount(0);
          setDieselGenerators([{ capacity: '', status: '' }, { capacity: '', status: '' }]);
        }

        // If solar config is present, set the solar capacity
        if (data.solar_config) {
          setSolarCapacity(data.solar_config.capacity || '');
        } else {
          setSolarCapacity('');
        }

        // Handle images from the response
        if (data.images && data.images.length > 0) {
          console.log("Found images:", data.images);
          const processedImages = {};
          data.images.forEach(image => {
            processedImages[image.image_category] = [{
              id: image.id,
              file_url: image.file_url,
              name: image.original_filename
            }];
          });
          setUploadedImages(processedImages);
        }
      })
      .catch(err => {
        console.error("Error loading survey details:", err);
        showError("Failed to load survey details");
      });
  }, [sessionId]);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    const statusMap = {
      'active': 'Active',
      'standby': 'Standby',
      'faulty': 'Faulty',
      'not_working': 'Not working'
    };
    return statusMap[string] || string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Helper function to convert status back to lowercase for API
  const normalizeStatus = (status) => {
    if (!status) return '';
    const statusMap = {
      'Active': 'active',
      'Standby': 'standby',
      'Faulty': 'faulty',
      'Not working': 'not_working'
    };
    return statusMap[status] || status.toLowerCase().replace(' ', '_');
  };

  const handleImageUpload = (imageCategory, files) => {
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Add the main payload as a JSON string
    const payload = {
      power_sources: powerSources,
      ...(powerSources.includes('diesel_generator') && dieselCount > 0 && {
        diesel_config: {
          count: dieselCount,
          generators: dieselGenerators.slice(0, dieselCount).map((gen, index) => ({
            name: `Generator ${index + 1}`,
            status: normalizeStatus(gen.status),
            capacity: parseInt(gen.capacity) || 0
          }))
        }
      }),
      ...(powerSources.includes('solar_cell') && solarCapacity && {
        solar_config: {
          capacity: parseInt(solarCapacity) || 0
        }
      })
    };

    formDataToSend.append('data', JSON.stringify(payload));

    // Add images if they exist
    const imageFiles = uploadedImages['generator_photo'];
    if (Array.isArray(imageFiles) && imageFiles.length > 0) {
      const file = imageFiles[0];
      if (file instanceof File) {
        formDataToSend.append('generator_photo', file);
      }
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`);
      const latestData = getResponse.data.data;

      if (latestData && latestData.images) {
        const processedImages = {};
        latestData.images.forEach(image => {
          processedImages[image.image_category] = [{
            id: image.id,
            file_url: image.file_url,
            name: image.original_filename
          }];
        });
        setUploadedImages(processedImages);
      }

      showSuccess('Data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const handlePowerSourceChange = (source) => {
    setPowerSources((prev) => {
      if (prev.includes(source)) {
        if (source === 'diesel_generator') {
          setDieselCount(0);
          setDieselGenerators([{ capacity: '', status: '' }, { capacity: '', status: '' }]);
        } else if (source === 'solar_cell') {
          setSolarCapacity('');
        }
        return prev.filter((s) => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  const handleDieselCountChange = (count) => {
    setDieselCount(count);
    setDieselGenerators(Array.from({ length: count }, () => ({ capacity: '', status: '' })));
  };

  const handleGeneratorChange = (index, field, value) => {
    const newGenerators = [...dieselGenerators];
    newGenerators[index][field] = value;
    setDieselGenerators(newGenerators);
  };

  const images = [
    { label: 'Generator photo', name: 'generator_photo' }
  ];

  console.log("Current image data:", images);

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] ">
        <form className=" mb-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[550px] overflow-y-auto">
    {/* Power Source Selection */}
    <div className="col-span-2">
            <label className="font-semibold mb-1">Select Power Source</label>
            <div className="grid grid-cols-4 gap-2">
              <label>
                <input
                  type="checkbox"
                  checked={powerSources.includes('commercial_power')}
                  onChange={() => handlePowerSourceChange('commercial_power')}

                />
                Commercial power
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={powerSources.includes('diesel_generator')}
                  onChange={() => handlePowerSourceChange('diesel_generator')}
                
                />
                Diesel generator
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={powerSources.includes('solar_cell')}
                  onChange={() => handlePowerSourceChange('solar_cell')}
                 
                />
                Solar cell
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={powerSources.includes('other')}
                  onChange={() => handlePowerSourceChange('other')}
                
                />
                Other
              </label>
            </div>
          </div>


          {/* AC Source Form */}
          {powerSources.includes('diesel_generator') && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4">Diesel Generator Information</h3>

              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-2">How Many Diesel Generators?</label>
                <div className="flex gap-6">
                  {[1, 2].map((num) => (
                    <label key={num} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="dieselCount"
                        value={num}
                        checked={dieselCount === num}
                        onChange={() => handleDieselCountChange(num)}
                        className="mr-2"
                        required
                      />
                      {num}
                    </label>
                  ))}
                </div>
              </div>

              {dieselCount > 0 && (
                <>
                  {dieselGenerators.slice(0, dieselCount).map((gen, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg mb-6 bg-gray-50"
                    >
                      <h4 className="font-semibold mb-2">Diesel generator #{index + 1} capacity (KVA)</h4>

                      <div className="flex flex-col mb-4">
                        <label className="font-semibold mb-1">Capacity (KVA)</label>
                        <input
                          type="number"
                          name={`dieselGenerators[${index}].capacity`}
                          value={gen.capacity}
                          onChange={(e) =>
                            handleGeneratorChange(index, 'capacity', e.target.value)
                          }
                          className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500 "
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Diesel generator #{index + 1} operational status</label>
                        <div className="grid grid-cols-4 gap-2">


                          {['Active', 'Standby', 'Faulty', 'Not working'].map((status) => (
                            <label key={status} className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`dieselGenerators[${index}].status`} // Ensure unique name for each generator
                                value={status} // Set the value to the status
                                checked={gen.status === status} // Check if the current status is selected
                                onChange={(e) =>
                                  handleGeneratorChange(index, 'status', e.target.value)
                                }
                                className="mr-2"
                                required
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}


          {powerSources.includes('solar_cell') && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4">Solar Cell Information</h3>
              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-1">Capacity (KVA)</label>
                <input
                  type="number"
                  name="solarCapacity"
                  value={solarCapacity}
                  onChange={(e) => setSolarCapacity(e.target.value)}
                  className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

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
      <ImageUploader
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default AcInformationForm;
