import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const AcInformationForm = () => {
  const { sessionId, siteId } = useParams();
  const [powerSources, setPowerSources] = useState([]);
  const [dieselCount, setDieselCount] = useState(0);
  const [dieselGenerators, setDieselGenerators] = useState([
    { 
      capacity: '', 
      status: '', 
      cable_size_from_generator_to_ac_panel: '',
      generator_brand: '',
      fuel_tank_capacity: ''
    }, 
    { 
      capacity: '', 
      status: '', 
      cable_size_from_generator_to_ac_panel: '',
      generator_brand: '',
      fuel_tank_capacity: ''
    }
  ]);
  const [solarCapacity, setSolarCapacity] = useState('');
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false)
  const [transformerCapacity, setTransformerCapacity] = useState('');

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
    setLoadingApi(true)
    setHasUnsavedChanges(false);
    const formDataToSend = new FormData();

    // Add the main payload as a JSON string
    const payload = {
      power_sources: powerSources,
      transformer_capacity: transformerCapacity || null,
      ...(powerSources.includes('diesel_generator') && dieselCount > 0 && {
        diesel_config: {
          count: dieselCount,
          generators: dieselGenerators.slice(0, dieselCount).map((gen, index) => ({
            name: `Generator ${index + 1}`,
            status: normalizeStatus(gen.status),
            capacity: parseInt(gen.capacity) || 0,
            cable_size_from_generator_to_ac_panel: gen.cable_size_from_generator_to_ac_panel || '',
            generator_brand: gen.generator_brand || '',
            fuel_tank_capacity: gen.fuel_tank_capacity || ''
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

    // Add all dynamic images
    Object.entries(uploadedImages).forEach(([imageCategory, files]) => {
      if (Array.isArray(files) && files.length > 0) {
        const file = files[0];
        if (file instanceof File) {
          formDataToSend.append(imageCategory, file);
        }
      }
    });

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

      setHasUnsavedChanges(false);
      showSuccess('Data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoadingApi(false)
    }
  };

  const handlePowerSourceChange = (source) => {
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    setDieselCount(count);
    setDieselGenerators(Array.from({ length: count }, () => ({ 
      capacity: '', 
      status: '', 
      cable_size_from_generator_to_ac_panel: '',
      generator_brand: '',
      fuel_tank_capacity: ''
    })));
  };

  const handleGeneratorChange = (index, field, value) => {
    setHasUnsavedChanges(true);
    const newGenerators = [...dieselGenerators];
    newGenerators[index][field] = value;
    setDieselGenerators(newGenerators);
  };

  // Handler for transformer capacity changes
  const handleTransformerCapacityChange = (value) => {
    setHasUnsavedChanges(true);
    setTransformerCapacity(value);
  };

  // Handler for solar capacity changes
  const handleSolarCapacityChange = (value) => {
    setHasUnsavedChanges(true);
    setSolarCapacity(value);
  };


  const [images, setImages] = useState([]);

  // Update images when dieselCount changes
  useEffect(() => {
    const generateImagesArray = () => {
      const baseImages = [
        { label: 'Generator photo', name: 'generator_photo' },
        { label: 'Fuel Tank photo', name: 'fuel_tank_photo' },
        { label: 'Photos of Transformer and Name Plate', name: 'transformer_photo' }
      ];

      // Add generator photos based on dieselCount
      const generatorImages = [];
      for (let i = 1; i <= dieselCount; i++) {
        generatorImages.push({
          label: `Generator #${i} photo 1 `,
          name: `generator_photo_1_${i}`
        },{
          label: `Generator #${i} photo 2 `,
          name: `generator_photo_2_${i}` 
        });
      }

      return [...baseImages, ...generatorImages];
    };

    setImages(generateImagesArray());
  }, [dieselCount]);

  console.log("Current image data:", images);
  console.log("Current dieselCount:", dieselCount);

  // Function to save data via API for auto-save - memoized with useCallback
  const saveDataToAPI = useCallback(async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      
      // Prepare the payload (same as handleSubmit)
      const payload = {
        power_sources: powerSources,
        transformer_capacity: transformerCapacity || null,
        ...(powerSources.includes('diesel_generator') && dieselCount > 0 && {
          diesel_config: {
            count: dieselCount,
            generators: dieselGenerators.slice(0, dieselCount).map((gen, index) => ({
              name: `Generator ${index + 1}`,
              status: normalizeStatus(gen.status),
              capacity: parseInt(gen.capacity) || 0,
              cable_size_from_generator_to_ac_panel: gen.cable_size_from_generator_to_ac_panel || '',
              generator_brand: gen.generator_brand || '',
              fuel_tank_capacity: gen.fuel_tank_capacity || ''
            }))
          }
        }),
        ...(powerSources.includes('solar_cell') && solarCapacity && {
          solar_config: {
            capacity: parseInt(solarCapacity) || 0
          }
        })
      };

      // Send data as JSON for auto-save (no images)
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setHasUnsavedChanges(false);
      showSuccess('AC connection data saved successfully');
      return true;
    } catch (err) {
      console.error("Error saving AC connection data:", err);
      showError('Error saving AC connection data');
      return false;
    } finally {
      setLoadingApi(false);
    }
  }, [hasUnsavedChanges, powerSources, transformerCapacity, dieselCount, dieselGenerators, solarCapacity, sessionId, normalizeStatus]);

  // Use the unsaved changes hook for auto-save
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`)
      .then(res => {
        const data = res.data.data;
        console.log("API Response:", data);

        // Set the power sources based on the response
        setPowerSources(data.power_sources || []);
        
        // Set transformer capacity
        setTransformerCapacity(data.transformer_capacity || '');

        // If diesel generators are present, set the count and details
        if (data.power_sources && data.power_sources.includes('diesel_generator') && data.diesel_config) {
          setDieselCount(data.diesel_config.count);

          // Map the generators and convert status to proper case
          const mappedGenerators = data.diesel_config.generators.map(gen => ({
            capacity: gen.capacity || '',
            status: capitalizeFirstLetter(gen.status || ''),
            cable_size_from_generator_to_ac_panel: gen.cable_size_from_generator_to_ac_panel || '',
            generator_brand: gen.generator_brand || '',
            fuel_tank_capacity: gen.fuel_tank_capacity || ''
          }));

          setDieselGenerators(mappedGenerators);
        } else {
          setDieselCount(0);
          setDieselGenerators([
            { 
              capacity: '', 
              status: '', 
              cable_size_from_generator_to_ac_panel: '',
              generator_brand: '',
              fuel_tank_capacity: ''
            }, 
            { 
              capacity: '', 
              status: '', 
              cable_size_from_generator_to_ac_panel: '',
              generator_brand: '',
              fuel_tank_capacity: ''
            }
          ]);
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

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex-shrink-0">
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
              {/* Power Source Selection */}
              <div className="col-span-2">
                <label className="font-semibold mb-1">Select Power Source</label>
                <div className="grid grid-cols-4 gap-2">
                  <label>
                    <input
                      type="checkbox"
                      checked={powerSources.includes('commercial_power')}
                      onChange={() => handlePowerSourceChange('commercial_power')}
                      className="mr-2"

                    />
                    Commercial power
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={powerSources.includes('diesel_generator')}
                      onChange={() => handlePowerSourceChange('diesel_generator')}
                      className="mr-2"

                    />
                    Diesel generator
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={powerSources.includes('solar_cell')}
                      onChange={() => handlePowerSourceChange('solar_cell')}
                      className="mr-2"

                    />
                    Solar cell
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={powerSources.includes('other')}
                      onChange={() => handlePowerSourceChange('other')}
                      className="mr-2"

                    />
                    Other
                  </label>
                </div>
              </div>

              {
                powerSources.includes('commercial_power') && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold mb-4">Transformer capacity (KVA)</h3>
                    <input
                      type="number"
                      name="transformer_capacity"
                      value={transformerCapacity}
                      onChange={(e) => handleTransformerCapacityChange(e.target.value)}
                      className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />
                  </div>
                )
              }

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

                          <div className="grid grid-cols-1 md:grid-cols-3 col-span-2 mt-2">
                            <div className="flex flex-col ">
                              <label className="font-semibold mb-1">Cable size from generator to AC panel (mm)</label>
                              <input
                                type="number"
                                name={`cable_size_from_generator_to_ac_panel`}
                                value={gen.cable_size_from_generator_to_ac_panel}
                                onChange={(e) => handleGeneratorChange(index, 'cable_size_from_generator_to_ac_panel', e.target.value)}
                                className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex flex-col ">
                              <label className="font-semibold mb-1">Generator Brand</label>
                              <input
                                type="text"
                                name={`generator_brand`}
                                value={gen.generator_brand}
                                onChange={(e) => handleGeneratorChange(index, 'generator_brand', e.target.value)}
                                className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="font-semibold mb-1">Fuel Tank capacity (litter)</label>
                              <input
                                type="text"
                                name={`fuel_tank_capacity`}
                                value={gen.fuel_tank_capacity}
                                onChange={(e) => handleGeneratorChange(index, 'fuel_tank_capacity', e.target.value)}
                                className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
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
                      onChange={(e) => handleSolarCapacityChange(e.target.value)}
                      className="border p-3 form-input focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
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

export default AcInformationForm;
