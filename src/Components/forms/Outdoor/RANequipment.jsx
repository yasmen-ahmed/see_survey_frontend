import React, { useState, useEffect  } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../../utils/notifications';
import { useParams } from 'react-router-dom';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const RANBaseBandForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    existing_location: '',
    existing_vendor: '',
    existing_type_model: [],
    new_installation_location: [],
    length_of_transmission_cable: ''
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      // Build the payload to match the expected API structure
      const payload = {
        existing_location: formData.existing_location,
        existing_vendor: formData.existing_vendor,
        existing_type_model: formData.existing_type_model,
        new_installation_location: formData.new_installation_location,
        length_of_transmission_cable: formData.length_of_transmission_cable
      }
      console.log("Payload being sent:", payload);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`, payload);
      
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

  // Add useEffect for window beforeunload event
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
    axios.get(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          setNumberOfCabinets(data.numberOfCabinets || 0);
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

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading RAN equipment data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
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
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('RAN equipment data submitted successfully!');
      }
    } catch (err) {
      console.error("Error submitting RAN equipment data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  const cabinetOptions = generateCabinetOptions();

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[100%] h-full flex flex-col">
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
             
          <div className='mb-4'>
            <label className='block font-semibold '>Existing RAN base band located in?</label>
            <select
              className='form-input' 
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
              className='form-input' 
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
            <hr className='mt-11'/>
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
              className='form-input' 
              value={formData.length_of_transmission_cable}
              onChange={(e) => handleChange('length_of_transmission_cable', e.target.value)}
              placeholder='000'
            />
            <hr className='my-5'/>
          </div>
</div>
</div>

        {/* Save Button at Bottom - Fixed */}
        <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading...": "Save"}  
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RANBaseBandForm;

