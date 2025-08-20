import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const DCPowerInformationForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    dc_rectifiers: {
      existing_dc_rectifiers_location: '',
      existing_dc_rectifiers_vendor: '',
      existing_dc_rectifiers_model: '',
      how_many_existing_dc_rectifier_modules: '',
      rectifier_module_capacity: '',
      total_capacity_existing_dc_power_system: '',
      how_many_free_slot_available_rectifier: '',
      dc_rectifier_condition: '',
      rect_load_current_reading: '',
      existing_site_temperature: ''
    },
    batteries: {
      existing_batteries_strings_location: [],
      existing_batteries_vendor: '',
      existing_batteries_type: '',
      how_many_existing_battery_string: '',
      total_battery_capacity: '',
      how_many_free_slot_available_battery: '',
      new_battery_string_installation_location: [],
      batteries_condition: '',
      new_battery_type: '',
      new_battery_capacity: '',
      new_battery_qty: ''
    }
  });

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges || isInitialLoading) return true;
    
    try {
      setLoadingApi(true);
      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add form data - ensure all values are properly stringified
      const dc_rectifiers = {
        ...formData.dc_rectifiers,
        rectifier_module_capacity: parseFloat(formData.dc_rectifiers.rectifier_module_capacity) || 0,
        total_capacity_existing_dc_power_system: parseFloat(formData.dc_rectifiers.total_capacity_existing_dc_power_system) || 0,
        how_many_existing_dc_rectifier_modules: parseInt(formData.dc_rectifiers.how_many_existing_dc_rectifier_modules) || 0,
        how_many_free_slot_available_rectifier: parseInt(formData.dc_rectifiers.how_many_free_slot_available_rectifier) || 0,
        rect_load_current_reading: parseFloat(formData.dc_rectifiers.rect_load_current_reading) || 0,
        existing_site_temperature: parseFloat(formData.dc_rectifiers.existing_site_temperature) || 0
      };

      const batteries = {
        ...formData.batteries,
        how_many_existing_battery_string: parseInt(formData.batteries.how_many_existing_battery_string) || 0,
        total_battery_capacity: parseFloat(formData.batteries.total_battery_capacity) || 0,
        how_many_free_slot_available_battery: parseInt(formData.batteries.how_many_free_slot_available_battery) || 0,
        new_battery_string_installation_location: formData.batteries.new_battery_string_installation_location || [],
        new_battery_capacity: parseFloat(formData.batteries.new_battery_capacity) || 0,
        new_battery_qty: parseInt(formData.batteries.new_battery_qty) || 0
      };

      submitFormData.append('dc_rectifiers', JSON.stringify(dc_rectifiers));
      submitFormData.append('batteries', JSON.stringify(batteries));

      // Add images
      Object.entries(uploadedImages).forEach(([category, files]) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file instanceof File) {
            submitFormData.append(category, file);
          }
        } else {
          submitFormData.append(category, '');
        }
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/dc-power-system/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
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

  const [uploadedImages, setUploadedImages] = useState({});

  // Define image fields based on the provided image and dynamic counts
  const getImageFields = () => {
    const fields = [
      { label: 'Overall Rectifier cabinet Photo (open) ', name: 'overall_rectifier_cabinet_photo' }
    ];

    // Add rectifier module photos based on count
    const rectifierCount = parseInt(formData.dc_rectifiers.how_many_existing_dc_rectifier_modules) || 0;
    for (let i = 1; i <= rectifierCount; i++) {
      fields.push({
        label: `Rectifier module photo #${i}`,
        name: `rectifier_module_photo_${i}`
      });
    }

    fields.push(
      { label: 'Free slots for new Rectifier modules', name: 'free_slots_rectifier_modules' },
      { label: 'Rectifier CB photos', name: 'rectifier_cb_photos' },
      { label: 'Rectifier Free CB Photo', name: 'rectifier_free_cb_photo' },
      { label: 'RECT Load current reading', name: 'rect_load_current_reading_photo' },
      { label: 'Existing site temperature (C)', name: 'existing_site_temperature_photo' },
      { label: 'Rectifier Picture', name: 'rectifier_picture' },
      { label: 'Rectifier manufactory/specification Picture (model number)', name: 'rectifier_manufactory_specification_picture' }
    );

    // Add battery string photos based on count
    const batteryCount = parseInt(formData.batteries.how_many_existing_battery_string) || 0;
    for (let i = 1; i <= batteryCount; i++) {
      fields.push({
        label: `Battery string photo #${i}`,
        name: `battery_string_photo_${i}`
      });
    }

    fields.push(
      { label: 'Battery model photo', name: 'battery_model_photo' },
      { label: 'Battery CB photo', name: 'battery_cb_photo' },
      { label: 'Rectifier Main AC CB photo', name: 'rectifier_main_ac_cb_photo' },
      { label: 'PDU photos', name: 'pdu_photos' },
      { label: 'PDU free CB', name: 'pdu_free_cb' }
    );

    return fields;
  };

  // Replace the static imageFields with the dynamic function
  const imageFields = getImageFields();

  // Update the imageFields whenever the counts change
  useEffect(() => {
    // This will trigger a re-render of the ImageUploader with updated fields
    const newFields = getImageFields();
    console.log("Updated image fields:", newFields);
  }, [formData.dc_rectifiers.how_many_existing_dc_rectifier_modules, formData.batteries.how_many_existing_battery_string]);

  // Process images from API response
  const processImagesFromResponse = (data) => {
    const imagesByCategory = {};
    
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
        // Handle both regular and indexed categories
        const category = img.image_category;
        if (!imagesByCategory[category]) {
          imagesByCategory[category] = [];
        }
        imagesByCategory[category].push({
          id: img.id,
          file_url: img.file_url,
          name: img.original_filename
        });
      });
    }
    
    return imagesByCategory;
  };

  // Fetch existing data when component loads
  useEffect(() => {
    setIsInitialLoading(true);
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
              how_many_free_slot_available_rectifier: dcPowerData.dc_rectifiers?.how_many_free_slot_available_rectifier || '',
              dc_rectifier_condition: dcPowerData.dc_rectifiers?.dc_rectifier_condition || '',
              rect_load_current_reading: dcPowerData.dc_rectifiers?.rect_load_current_reading || '',
              existing_site_temperature: dcPowerData.dc_rectifiers?.existing_site_temperature || ''
            },
            batteries: {
              existing_batteries_strings_location: dcPowerData.batteries?.existing_batteries_strings_location || [],
              existing_batteries_vendor: dcPowerData.batteries?.existing_batteries_vendor || '',
              existing_batteries_type: dcPowerData.batteries?.existing_batteries_type || '',
              how_many_existing_battery_string: dcPowerData.batteries?.how_many_existing_battery_string || '',
              total_battery_capacity: dcPowerData.batteries?.total_battery_capacity || '',
              how_many_free_slot_available_battery: dcPowerData.batteries?.how_many_free_slot_available_battery || '',
              new_battery_string_installation_location: dcPowerData.batteries?.new_battery_string_installation_location || [],
              batteries_condition: dcPowerData.batteries?.batteries_condition || '',
              new_battery_type: dcPowerData.batteries?.new_battery_type || '',
              new_battery_capacity: dcPowerData.batteries?.new_battery_capacity || '',
              new_battery_qty: dcPowerData.batteries?.new_battery_qty || ''
            }
          });

          // Process and set images from the response
          if (data.images && Array.isArray(data.images)) {
            const processedImages = processImagesFromResponse(data);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading DC Power data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      });
  }, [sessionId]);

  const handleChange = (section, name, value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
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
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
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

  const handleExistingBatteriesLocationChange = (value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    console.log(`Toggling existing batteries location:`, value);
    setFormData((prev) => {
      const currentLocations = prev.batteries.existing_batteries_strings_location || [];
      const updatedList = currentLocations.includes(value)
        ? currentLocations.filter((item) => item !== value)
        : [...currentLocations, value];

      return {
        ...prev,
        batteries: {
          ...prev.batteries,
          existing_batteries_strings_location: updatedList
        }
      };
    });
  };

  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Generate cabinet options based on numberOfCabinets
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('DC Power System data and images submitted successfully!');
      }
    } catch (err) {
      console.error("Error submitting DC Power System data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  const cabinetOptions = generateCabinetOptions();
  const rectifierVendors = ['Nokia', 'Ericsson', 'Huawei', 'ZTE', 'Other'];
  const batteryVendors = ['Efore', 'Enersys', 'Leoch battery', 'Narada', 'Polarium', 'Shoto', 'Other'];
  const batteryTypes = ['Lead-acid', 'Lithium-ion'];

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
    <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
      {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && !isInitialLoading && (
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
          <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Rectifiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg">

            <div>
              <label className='block font-semibold mb-2'>Existing DC rectifiers are located in?</label>
              <select
                className='form-input'
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
                className='form-input'
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
                className='form-input'
                value={formData.dc_rectifiers.existing_dc_rectifiers_model}
                onChange={(e) => handleChange('dc_rectifiers', 'existing_dc_rectifiers_model', e.target.value)}
                placeholder='Model'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many existing DC rectifier modules?</label>
              <select
                className='form-input'
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
                className='form-input'
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
                className='form-input'
                value={formData.dc_rectifiers.how_many_existing_dc_rectifier_modules * formData.dc_rectifiers.rectifier_module_capacity}
                // onChange={(e) => handleChange('dc_rectifiers', 'total_capacity_existing_dc_power_system', e.target.value)}
                placeholder='12.5'
                readOnly
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>RECT Load current reading (A)</label>
              <input
                type='number'
                step='0.1'
                className='form-input'
                value={formData.dc_rectifiers.rect_load_current_reading}
                onChange={(e) => handleChange('dc_rectifiers', 'rect_load_current_reading', e.target.value)}
                placeholder='0.0'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing site temperature (C)</label>
              <input
                type='number'
                step='0.1'
                className='form-input'
                value={formData.dc_rectifiers.existing_site_temperature}
                onChange={(e) => handleChange('dc_rectifiers', 'existing_site_temperature', e.target.value)}
                placeholder='25.0'
              />
            </div>
            <div>
              <label className='block font-semibold mb-2'>How many free slot available for new rectifier modules?</label>
              <select
                className='form-input'
                value={formData.dc_rectifiers.how_many_free_slot_available_rectifier}
                onChange={(e) => handleChange('dc_rectifiers', 'how_many_free_slot_available_rectifier', e.target.value)}
              >
                <option value=''>Select</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block font-semibold mb-2'>DC rectifier condition</label>
              <div className="flex gap-4">
                {['Good', 'Satisfying', 'Bad', 'Not working'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input 
                      type="radio" 
                      name="dc_rectifier_condition" 
                      value={option} 
                      checked={formData.dc_rectifiers.dc_rectifier_condition === option} 
                      onChange={(e) => handleChange('dc_rectifiers', 'dc_rectifier_condition', e.target.value)} 
                      className="mr-2" 
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>


          </div>

          <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Batteries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg">

            <div>
              <label className='block font-semibold mb-2'>Existing batteries strings are located in?</label>
              <div className='grid grid-cols-2 gap-2'>
                {[...cabinetOptions, 'Other'].map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.batteries.existing_batteries_strings_location || []).includes(option)}
                      onChange={() => handleExistingBatteriesLocationChange(option)}
                      className="w-4 h-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className='block font-semibold mb-2'>Existing batteries vendor</label>
              <select
                className='form-input'
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
                className='form-input' 
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
                className='form-input'
                value={formData.batteries.total_battery_capacity}
                onChange={(e) => handleChange('batteries', 'total_battery_capacity', e.target.value)}
                placeholder='200'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>How many free slot available for new battery string?</label>
              <select
                className='form-input'
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

            <div>
              <label className='block font-semibold mb-2'>Batteries condition</label>
              <div className="flex gap-4">
                {['Good', 'Satisfying', 'Bad', 'Not working'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input 
                      type="radio" 
                      name="batteries_condition" 
                      value={option} 
                      checked={formData.batteries.batteries_condition === option} 
                      onChange={(e) => handleChange('batteries', 'batteries_condition', e.target.value)} 
                      className="mr-2" 
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className='block font-semibold mb-2'>New battery type</label>
              <input
                type='text'
                className='form-input'
                value={formData.batteries.new_battery_type}
                onChange={(e) => handleChange('batteries', 'new_battery_type', e.target.value)}
                placeholder='Enter battery type'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>New battery capacity (AH)</label>
              <input
                type='number'
                step='0.1'
                className='form-input'
                value={formData.batteries.new_battery_capacity}
                onChange={(e) => handleChange('batteries', 'new_battery_capacity', e.target.value)}
                placeholder='100'
              />
            </div>

            <div>
              <label className='block font-semibold mb-2'>New battery QTY (string)</label>
              <input
                type='number'
                className='form-input'
                value={formData.batteries.new_battery_qty}
                onChange={(e) => handleChange('batteries', 'new_battery_qty', e.target.value)}
                placeholder='1'
              />
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
      
      {/* Image Uploader */}
      <ImageUploader 
        images={imageFields} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default DCPowerInformationForm;
