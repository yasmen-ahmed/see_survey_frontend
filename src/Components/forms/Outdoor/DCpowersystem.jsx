import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

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
      { label: 'Rectifier Free CB Photo', name: 'rectifier_free_cb_photo' }
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

          // Process and set images from the response
          if (data.images && Array.isArray(data.images)) {
            const processedImages = processImagesFromResponse(data);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading DC Power data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
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

    try {
      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add form data
      submitFormData.append('dc_rectifiers', JSON.stringify(formData.dc_rectifiers));
      submitFormData.append('batteries', JSON.stringify(formData.batteries));

      // Add images
      Object.entries(uploadedImages).forEach(([category, files]) => {
        if (files && files.length > 0) {
          // Handle both regular and indexed categories
          files.forEach((file, index) => {
            if (file instanceof File) {
              submitFormData.append(category, file);
            }
          });
        }
      });

      console.log("Submitting DC Power System data:");
      // Log FormData contents for debugging
      for (let pair of submitFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/dc-power-system/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Server response:", response.data);
      
      // After successful submission, update the form with the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/dc-power-system/${sessionId}`);
      const latestData = getResponse.data.data || getResponse.data;

      if (latestData) {
        // Update form data
        const dcPowerData = latestData.dcPowerData || latestData;
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

        // Process and update images
        if (latestData.images && Array.isArray(latestData.images)) {
          const processedImages = processImagesFromResponse(latestData);
          console.log("Processed images from response:", processedImages);
          setUploadedImages(processedImages);
        }
      }
      
      showSuccess('DC Power System data and images submitted successfully!');
    } catch (err) {
      console.error("Error submitting DC Power System data:", err);
      console.error("Error response:", err.response?.data);
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
