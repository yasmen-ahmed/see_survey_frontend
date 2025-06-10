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
  const [formData, setFormData] = useState({
    power_sources: [],
    diesel_count: 0,
    diesel_generators: [],
    solar_capacity: '',
    ac_panel_photo_overview: "",
        ac_panel_photo_closed: "",
        ac_panel_photo_opened: "",
        ac_panel_cbs_photo: "",
        ac_panel_free_cb: "",
        proposed_ac_cb_photo: "",
        ac_cable_route_photo_1: "",
        ac_cable_route_photo_2: "",
        ac_cable_route_photo_3: "",   
        generator_photo: "",
        power_meter_photo_overview: "",
        power_meter_photo_zoomed: "",
        power_meter_cb_photo: "",
        

  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`)
        .then(res => {
            const data = res.data.data; // Access the data property
            console.log(data);

            // Set the power sources based on the response
            setPowerSources(data.power_sources || []);

            // If diesel generators are present, set the count and details
            if (data.power_sources && data.power_sources.includes('diesel_generator') && data.diesel_config) {
                setDieselCount(data.diesel_config.count);
                
                // Map the generators and convert status to proper case
                const mappedGenerators = data.diesel_config.generators.map(gen => ({
                    capacity: gen.capacity,
                    status: capitalizeFirstLetter(gen.status) // Convert "active" to "Active"
                }));
                
                setDieselGenerators(mappedGenerators);
            } else {
                // Reset diesel values if not present
                setDieselCount(0);
                setDieselGenerators([{ capacity: '', status: '' }, { capacity: '', status: '' }]);
            }

            // If solar config is present, set the solar capacity
            if (data.solar_config) {
                setSolarCapacity(data.solar_config.capacity || ''); 
            } else {
                setSolarCapacity(''); 
            }

            // Set form data for images
            setFormData(prev => ({
                ...prev,
                ac_panel_photo_overview: data.ac_panel_photo_overview || "",
                ac_panel_photo_closed: data.ac_panel_photo_closed || "",
                ac_panel_photo_opened: data.ac_panel_photo_opened || "",
                ac_panel_cbs_photo: data.ac_panel_cbs_photo || "",
                ac_panel_free_cb: data.ac_panel_free_cb || "",
                proposed_ac_cb_photo: data.proposed_ac_cb_photo || "",
                ac_cable_route_photo_1: data.ac_cable_route_photo_1 || "",
                ac_cable_route_photo_2: data.ac_cable_route_photo_2 || "",
                ac_cable_route_photo_3: data.ac_cable_route_photo_3 || "",   
                generator_photo: data.generator_photo || "",
                power_meter_photo_overview: data.power_meter_photo_overview || "",
                power_meter_photo_zoomed: data.power_meter_photo_zoomed || "",
                power_meter_cb_photo: data.power_meter_cb_photo || "",
            }));
        })
        .catch(err => console.error("Error loading survey details:", err));
}, [sessionId, siteId]);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    // Handle special cases from API
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
    // Handle special cases
    const statusMap = {
      'Active': 'active',
      'Standby': 'standby', 
      'Faulty': 'faulty',
      'Not working': 'not_working'
    };
    return statusMap[status] || status.toLowerCase().replace(' ', '_');
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log("Power Sources changed:", powerSources);
  }, [powerSources]);

  useEffect(() => {
    console.log("Diesel Count changed:", dieselCount);
    console.log("Diesel Generators changed:", dieselGenerators);
  }, [dieselCount, dieselGenerators]);

  useEffect(() => {
    console.log("Solar Capacity changed:", solarCapacity);
  }, [solarCapacity]);

  const images = [
    { label: 'Generator photo', name: 'generator_photo' },
    { label: 'Power meter photo overview ', name: 'power_meter_photo_overview' },
    { label: 'Power meter photo zoomed', name: 'power_meter_photo_zoomed' },
    { label: 'Power meter CB photo', name: 'power_meter_cb_photo' },
    { label: 'Power meter cable route photo', name: 'power_meter_cable_route_photo' },    
    { label: 'AC Panel photo overview', name: 'ac_panel_photo_overview' },
    { label: 'AC Panel photo closed', name: 'ac_panel_photo_closed' },
    { label: 'AC Panel photo opened', name: 'ac_panel_photo_opened' },
    { label: 'AC Panel CBs photo', name: 'ac_panel_cbs_photo' },
    { label: 'AC panel free CB', name: 'ac_panel_free_cb' },
    { label: 'Proposed AC CB photo', name: 'proposed_ac_cb_photo' },
    { label: 'AC cable Route Photo to cable tray 1/3', name: 'ac_cable_route_photo_1' },
    { label: 'AC cable Route Photo to cable tray 2/3', name: 'ac_cable_route_photo_2' },
    { label: 'AC cable Route Photo to cable tray 3/3', name: 'ac_cable_route_photo_3' },
  ];
  

  useEffect(() => {
    if (formData.hasGenerator === "yes" && formData.generatorCount > 0) {
      const details = Array.from({ length: formData.generatorCount }, () => ({
        operationalStatus: "",
        capacity: "",
        fuelType: "",
      }));
      setFormData((prev) => ({
        ...prev,
        generatorDetails: details,
      }));
    }
  }, [formData.generatorCount, formData.hasGenerator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build the payload to match the expected API structure
    const payload = {
      power_sources: powerSources,
      // Include diesel_config only if diesel_generator is selected
      ...(powerSources.includes('diesel_generator') && dieselCount > 0 && {
        diesel_config: {
          count: dieselCount,
          generators: dieselGenerators.slice(0, dieselCount).map((gen, index) => ({
            name: `Generator ${index + 1}`,
            status: normalizeStatus(gen.status), // Convert "Active" to "active"
            capacity: parseInt(gen.capacity) || 0
          }))
        }
      }),
      // Include solar_config only if solar_cell is selected
      ...(powerSources.includes('solar_cell') && solarCapacity && {
        solar_config: {
          capacity: parseInt(solarCapacity) || 0
        }
      }),
      // Include other form data (images, etc.)
      ...Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => 
          key !== 'power_sources' && key !== 'diesel_count' && 
          key !== 'diesel_generators' && key !== 'solar_capacity'
        )
      )
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/ac-connection-info/${sessionId}`, payload);
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
            // If the source is already selected, remove it
            if (source === 'diesel_generator') {
                // Clear diesel generator values if unchecked
                setDieselCount(0);
                setDieselGenerators([{ capacity: '', status: '' }, { capacity: '', status: '' }]);
            } else if (source === 'solar_cell') {
                // Clear solar capacity if unchecked
                setSolarCapacity('');
            }
            return prev.filter((s) => s !== source);
        } else {
            // If the source is not selected, add it
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

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">  
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          {/* Power Source Selection */}
          <div>
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
                          className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div >
      <ImageUploader images={images} />
    </div >
  );
};

export default AcInformationForm;
