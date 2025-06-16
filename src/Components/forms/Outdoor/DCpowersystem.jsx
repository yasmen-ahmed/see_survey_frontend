import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';

const DCPowerInformationForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [formData, setFormData] = useState({
    dc_rectifiers: {
      existing_dc_rectifiers_location: '',
      existing_dc_rectifiers_vendor: '',
      existing_dc_rectifiers_model: '',
      how_many_existing_dc_rectifier_modules: '',
      rectifier_module_capacity: '',
      total_capacity_existing_dc_power_system: '',
      how_many_free_slot_available_rectifier: ''
    },
    batteries: {
      existing_batteries_strings_location: '',
      existing_batteries_vendor: '',
      existing_batteries_type: '',
      how_many_existing_battery_string: '',
      total_battery_capacity: '',
      how_many_free_slot_available_battery: '',
      new_battery_string_installation_location: []
    }
  });

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/dc-power-system/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched DC Power data:", data);

        if (data) {
          // Set number of cabinets from API response (for dynamic cabinet options)
          setNumberOfCabinets(data.numberOfCabinets || 0);

          // Handle both nested (dcPowerData) and direct response structures
          const dcPowerData = data.dcPowerData || data;

          console.log("DC Power data:", dcPowerData);

          setFormData({
            dc_rectifiers: {
              existing_dc_rectifiers_location: dcPowerData.dc_rectifiers?.existing_dc_rectifiers_location || '',
              existing_dc_rectifiers_vendor: dcPowerData.dc_rectifiers?.existing_dc_rectifiers_vendor || '',
              existing_dc_rectifiers_model: dcPowerData.dc_rectifiers?.existing_dc_rectifiers_model || '',
              how_many_existing_dc_rectifier_modules: dcPowerData.dc_rectifiers?.how_many_existing_dc_rectifier_modules || '',
              rectifier_module_capacity: dcPowerData.dc_rectifiers?.rectifier_module_capacity || '',
              total_capacity_existing_dc_power_system: dcPowerData.dc_rectifiers?.total_capacity_existing_dc_power_system || '',
              how_many_free_slot_available_rectifier: dcPowerData.dc_rectifiers?.how_many_free_slot_available_rectifier || ''
            },
            batteries: {
              existing_batteries_strings_location: dcPowerData.batteries?.existing_batteries_strings_location || '',
              existing_batteries_vendor: dcPowerData.batteries?.existing_batteries_vendor || '',
              existing_batteries_type: dcPowerData.batteries?.existing_batteries_type || '',
              how_many_existing_battery_string: dcPowerData.batteries?.how_many_existing_battery_string || '',
              total_battery_capacity: dcPowerData.batteries?.total_battery_capacity || '',
              how_many_free_slot_available_battery: dcPowerData.batteries?.how_many_free_slot_available_battery || '',
              new_battery_string_installation_location: dcPowerData.batteries?.new_battery_string_installation_location || []
            }
          });
        }
      })
      .catch(err => {
        console.error("Error loading DC Power data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Generate cabinet options based on numberOfCabinets
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    return options;
  };

  const handleChange = (section, name, value) => {
    console.log(`Changing ${section}.${name} to:`, value);
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleCheckboxChange = (value) => {
    console.log(`Toggling battery installation location:`, value);
    setFormData((prev) => {
      const currentLocations = prev.batteries.new_battery_string_installation_location || [];
      const updatedList = currentLocations.includes(value)
        ? currentLocations.filter((item) => item !== value)
        : [...currentLocations, value];

      return {
        ...prev,
        batteries: {
          ...prev.batteries,
          new_battery_string_installation_location: updatedList
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Prepare the data in the format expected by the API
    const submitData = {

      existing_dc_rectifiers_location: formData.dc_rectifiers.existing_dc_rectifiers_location,
      existing_dc_rectifiers_vendor: formData.dc_rectifiers.existing_dc_rectifiers_vendor,
      existing_dc_rectifiers_model: formData.dc_rectifiers.existing_dc_rectifiers_model,
      how_many_existing_dc_rectifier_modules: parseInt(formData.dc_rectifiers.how_many_existing_dc_rectifier_modules) || 0,
      rectifier_module_capacity: parseFloat(formData.dc_rectifiers.rectifier_module_capacity) || 0,
      total_capacity_existing_dc_power_system: parseFloat(formData.dc_rectifiers.total_capacity_existing_dc_power_system) || 0,
      how_many_free_slot_available_rectifier: parseInt(formData.dc_rectifiers.how_many_free_slot_available_rectifier) || 0,
      existing_batteries_strings_location: formData.batteries.existing_batteries_strings_location,
      existing_batteries_vendor: formData.batteries.existing_batteries_vendor,
      existing_batteries_type: formData.batteries.existing_batteries_type,
      how_many_existing_battery_string: parseInt(formData.batteries.how_many_existing_battery_string) || 0,
      total_battery_capacity: parseFloat(formData.batteries.total_battery_capacity) || 0,
      how_many_free_slot_available_battery: parseInt(formData.batteries.how_many_free_slot_available_battery) || 0,
      new_battery_string_installation_location: formData.batteries.new_battery_string_installation_location || []

    };

    console.log("Submitting DC Power data:", submitData);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/dc-power-system/${sessionId}`, submitData);
      showSuccess('DC Power System data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const cabinetOptions = generateCabinetOptions();
  const rectifierVendors = ['Nokia', 'Ericsson', 'Huawei', 'ZTE', 'Other'];
  const batteryVendors = ['Efore', 'Enersys', 'Leoch battery', 'Narada', 'Polarium', 'Shoto', 'Other'];
  const batteryTypes = ['Lead-acid', 'Lithium-ion'];

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form onSubmit={handleSubmit}>
          <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Rectifiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg">

            <div>
              <label className='block font-semibold mb-2'>Existing DC rectifiers are located in?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.existing_dc_rectifiers_location}
                onChange={(e) => handleChange('dc_rectifiers', 'existing_dc_rectifiers_location', e.target.value)}
              >
                <option value=''>Select Location</option>
                {cabinetOptions.map((cabinet) => (
                  <option key={cabinet} value={cabinet}>{cabinet}</option>
                ))}
                <option value='Other'>Other</option>
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing DC rectifiers vendor</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.existing_dc_rectifiers_vendor}
                onChange={(e) => handleChange('dc_rectifiers', 'existing_dc_rectifiers_vendor', e.target.value)}
              >
                <option value=''>Select Vendor</option>
                {rectifierVendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing DC rectifiers model</label>
              <input
                type='text'
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.existing_dc_rectifiers_model}
                onChange={(e) => handleChange('dc_rectifiers', 'existing_dc_rectifiers_model', e.target.value)}
                placeholder='Model'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many existing DC rectifier modules?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.how_many_existing_dc_rectifier_modules}
                onChange={(e) => handleChange('dc_rectifiers', 'how_many_existing_dc_rectifier_modules', e.target.value)}
              >
                <option value=''>Select</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Rectifier module capacity (per module in KW)</label>
              <input
                type='number'
                step='0.1'
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.rectifier_module_capacity}
                onChange={(e) => handleChange('dc_rectifiers', 'rectifier_module_capacity', e.target.value)}
                placeholder='2.5'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>Total capacity of existing DC power system (KW)</label>
              <input
                type='number'
                step='0.1'
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.total_capacity_existing_dc_power_system}
                onChange={(e) => handleChange('dc_rectifiers', 'total_capacity_existing_dc_power_system', e.target.value)}
                placeholder='12.5'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many free slot available for new rectifier modules?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.dc_rectifiers.how_many_free_slot_available_rectifier}
                onChange={(e) => handleChange('dc_rectifiers', 'how_many_free_slot_available_rectifier', e.target.value)}
              >
                <option value=''>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Batteries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg">

            <div>
              <label className='block font-semibold mb-2'>Existing batteries strings are located in?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.batteries.existing_batteries_strings_location}
                onChange={(e) => handleChange('batteries', 'existing_batteries_strings_location', e.target.value)}
              >
                <option value=''>Select Location</option>
                {cabinetOptions.map((cabinet) => (
                  <option key={cabinet} value={cabinet}>{cabinet}</option>
                ))}
                <option value='Other'>Other</option>
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing batteries vendor</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.batteries.existing_batteries_vendor}
                onChange={(e) => handleChange('batteries', 'existing_batteries_vendor', e.target.value)}
              >
                <option value=''>Select Vendor</option>
                {batteryVendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing batteries type</label>
              <div className='flex gap-4'>
                {batteryTypes.map(type => (
                  <label key={type} className='flex items-center'>
                    <input
                      type='radio'
                      name='existing_batteries_type'
                      value={type}
                      checked={formData.batteries.existing_batteries_type === type}
                      onChange={(e) => handleChange('batteries', 'existing_batteries_type', e.target.value)}
                    />
                    <span className='ml-2'>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many existing battery string?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.batteries.how_many_existing_battery_string}
                onChange={(e) => handleChange('batteries', 'how_many_existing_battery_string', e.target.value)}
              >
                <option value=''>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Total battery Capacity (Ah)</label>
              <input
                type='number'
                className='border p-2 rounded w-full'
                value={formData.batteries.total_battery_capacity}
                onChange={(e) => handleChange('batteries', 'total_battery_capacity', e.target.value)}
                placeholder='200'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many free slot available for new battery string?</label>
              <select
                className='border p-2 rounded w-full'
                value={formData.batteries.how_many_free_slot_available_battery}
                onChange={(e) => handleChange('batteries', 'how_many_free_slot_available_battery', e.target.value)}
              >
                <option value=''>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="col-span-full">
              <label className='block font-semibold mb-2'>If new battery string is required, where to be installed? Choose all applicable</label>
              <div className='grid grid-cols-2 gap-2'>
                {[...cabinetOptions, 'New Nokia cabinet', 'Other'].map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.batteries.new_battery_string_installation_location || []).includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                      className="w-4 h-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-700 font-semibold"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DCPowerInformationForm;
