import React, { useState, useEffect  } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../../utils/notifications';
import { useParams } from 'react-router-dom';

const RANBaseBandForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [formData, setFormData] = useState({
    existing_location: '',
    existing_vendor: '',
    existing_type_model: [],
    new_installation_location: [],
    length_of_transmission_cable: ''
  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          // Set number of cabinets from API response
          setNumberOfCabinets(data.numberOfCabinets || 0);
          
          // Set form data from ranEquipment object
          const ranData = data.ranEquipment || {};
          console.log(ranData);
          setFormData({
            existing_location: ranData.existing_location || "",
            existing_vendor: ranData.existing_vendor || "",
            existing_type_model: ranData.existing_type_model || [],
            new_installation_location: ranData.new_installation_location || [],
            length_of_transmission_cable: ranData.length_of_transmission_cable || ""
          });
        }
      })
      .catch(err => {
        console.error("Error loading RAN equipment data:", err);
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
    console.log(`Generated ${options.length} cabinet options:`, options);
    return options;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload to match the expected API structure
    const payload = {
      existing_location: formData.existing_location,
      existing_vendor: formData.existing_vendor,
      existing_type_model: formData.existing_type_model,
      new_installation_location: formData.new_installation_location,
      length_of_transmission_cable: formData.length_of_transmission_cable
    }
    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`, payload);
      showSuccess('RAN equipment data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const cabinetOptions = generateCabinetOptions();

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        
      

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>

          <div className='mb-4'>
            <label className='block font-semibold '>Existing RAN base band located in?</label>
            <select
              className='border p-2 rounded w-full'
              value={formData.existing_location}
              onChange={(e) => handleChange('existing_location', e.target.value)}
            >
              <option value=''>Select Location</option>
              {cabinetOptions.map((cabinet) => (
                <option key={cabinet} value={cabinet}>{cabinet}</option>
              ))}
              <option value='Other'>Other</option>
            </select>
            <hr className='my-5'/>
          </div>

          <div className=''>
            <label className='block font-semibold '>Existing RAN base band vendor</label>
            <select
              className='border p-2 rounded w-full'
              value={formData.existing_vendor}
              onChange={(e) => handleChange('existing_vendor', e.target.value)}
            >
              <option value=''>Select Vendor</option>
              <option value='Nokia'>Nokia</option>
              <option value='Ericsson'>Ericsson</option>
              <option value='Huawei'>Huawei</option>
              <option value='ZTE'>ZTE</option>
              <option value='Other'>Other</option>
            </select>
            <hr className='my-5'/>
          </div>

          <div className=''>
            <label className='block font-semibold '>Existing RAN base band type/model</label>
            <div className=' grid grid-cols-3'>
              {['Nokia Air Scale', 'Nokia Felix', 'Other'].map((type) => (
                <div key={type}>
                  <input
                    type='checkbox'
                    value={type}
                    checked={formData.existing_type_model.includes(type)}
                    onChange={(e) => handleCheckboxChange('existing_type_model', e.target.value)}
                  />
                  <span className='ml-2'>{type}</span>
                </div>
              ))}
            </div>
            <hr className='my-5'/>
          </div>

          <div className=''>
            <label className='block font-semibold '>Where new Nokia base band can be installed? Choose all applicable</label>
            <div className='grid grid-cols-3'>
              {[
                ...cabinetOptions,
                'New Nokia cabinet',
                'Other',
              ].map((location) => (
                <div key={location}>
                  <input
                    type='checkbox'
                    value={location}
                    checked={formData.new_installation_location.includes(location)}
                    onChange={(e) => handleCheckboxChange('new_installation_location', e.target.value)}
                  />
                  <span className='ml-2'>{location}</span>
                </div>
              ))}
            </div>
            <hr className='my-5'/>
          </div>

          <div className=''>
            <label className='block font-semibold '>Length of Transmission cable (Optical / Electrical) from new Nokia base band to MW IDU/ODF (meter)</label>
            <input
              type='number'
              className='border p-2 rounded w-full'
              value={formData.length_of_transmission_cable}
              onChange={(e) => handleChange('length_of_transmission_cable', e.target.value)}
              placeholder='000'
            />
            <hr className='my-5'/>
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
    </div>
  );
};

export default RANBaseBandForm;

