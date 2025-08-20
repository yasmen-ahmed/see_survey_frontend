import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';
import DynamicTable from '../../DynamicTable';

const DCPowerSystemForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false)
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
      existing_site_temperature: '',
      blvd_in_dc_power_rack: '',
      llvd_in_dc_power_rack: '',
      pdu_in_dc_power_rack: '',
      free_cbs_blvd: '',
      free_cbs_llvd: '',
      free_cbs_pdu: '',
      free_slots_rectifier_modules: '',
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
      new_battery_qty: '',
    },
    cb_fuse_data_blvd: [],
    cb_fuse_data_llvd: [],
    cb_fuse_data_pdu: []
  });
  // Handle BLVD table data changes
  const handleBLVDTableDataChange = useCallback((newTableData) => {
    if (!newTableData) {
      const currentData = formData.cb_fuse_data_blvd || [];
      if (currentData.length > 0) {
        setHasUnsavedChanges(true);
      }
      setFormData(prev => ({
        ...prev,
        cb_fuse_data_blvd: []
      }));
      return;
    }

    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: parseFloat(item.rating) || 0,
        connected_module: item.connected_module?.trim() || ""
      }));

    // Compare with current data to detect actual changes
    const currentData = formData.cb_fuse_data_blvd || [];
    const hasChanged = JSON.stringify(processedData) !== JSON.stringify(currentData);

    if (hasChanged) {
      setHasUnsavedChanges(true);
    }

    setFormData(prev => ({
      ...prev,
      cb_fuse_data_blvd: processedData
    }));
  }, [formData.cb_fuse_data_blvd, setHasUnsavedChanges]);

  // Handle LLVD table data changes
  const handleLLVDTableDataChange = useCallback((newTableData) => {
    if (!newTableData) {
      const currentData = formData.cb_fuse_data_llvd || [];
      if (currentData.length > 0) {
        setHasUnsavedChanges(true);
      }
      setFormData(prev => ({
        ...prev,
        cb_fuse_data_llvd: []
      }));
      return;
    }

    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: parseFloat(item.rating) || 0,
        connected_module: item.connected_module?.trim() || ""
      }));

    // Compare with current data to detect actual changes
    const currentData = formData.cb_fuse_data_llvd || [];
    const hasChanged = JSON.stringify(processedData) !== JSON.stringify(currentData);

    if (hasChanged) {
      setHasUnsavedChanges(true);
    }

    setFormData(prev => ({
      ...prev,
      cb_fuse_data_llvd: processedData
    }));
  }, [formData.cb_fuse_data_llvd, setHasUnsavedChanges]);

  // Handle PDU table data changes
  const handlePDUTableDataChange = useCallback((newTableData) => {
    if (!newTableData) {
      const currentData = formData.cb_fuse_data_pdu || [];
      if (currentData.length > 0) {
        setHasUnsavedChanges(true);
      }
      setFormData(prev => ({
        ...prev,
        cb_fuse_data_pdu: []
      }));
      return;
    }

    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: parseFloat(item.rating) || 0,
        connected_module: item.connected_module?.trim() || ""
      }));

    // Compare with current data to detect actual changes
    const currentData = formData.cb_fuse_data_pdu || [];
    const hasChanged = JSON.stringify(processedData) !== JSON.stringify(currentData);

    if (hasChanged) {
      setHasUnsavedChanges(true);
    }

    setFormData(prev => ({
      ...prev,
      cb_fuse_data_pdu: processedData
    }));
  }, [formData.cb_fuse_data_pdu, setHasUnsavedChanges]);

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
      submitFormData.append('cb_fuse_data_blvd', JSON.stringify(formData.cb_fuse_data_blvd || []));
      submitFormData.append('cb_fuse_data_llvd', JSON.stringify(formData.cb_fuse_data_llvd || []));
      submitFormData.append('cb_fuse_data_pdu', JSON.stringify(formData.cb_fuse_data_pdu || []));

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
        `${import.meta.env.VITE_API_URL}/api/room-dc-power-system/${sessionId}`,
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
      { label: 'PDU free CB', name: 'pdu_free_cb' },
    );

    // Now add conditional ones separately
    if (formData.dc_rectifiers.blvd_in_dc_power_rack === 'Yes') {
      fields.push({ label: 'BLVD in the DC power rack', name: 'blvd_in_dc_power_rack' });
    }

    if (formData.dc_rectifiers.llvd_in_dc_power_rack === 'Yes') {
      fields.push({ label: 'LLVD in the DC power rack', name: 'llvd_in_dc_power_rack' });
    }

    if (formData.dc_rectifiers.pdu_in_dc_power_rack === 'Yes') {
      fields.push({ label: 'PDU in the DC power rack', name: 'pdu_in_dc_power_rack' });
    }

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
    axios.get(`${import.meta.env.VITE_API_URL}/api/room-dc-power-system/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched DC Power data:", data);

        if (data) {
          // Set number of cabinets from API response (for dynamic cabinet options)
          setNumberOfCabinets(data.numberOfCabinets || 0);

          // Handle both nested (roomDCPowerData) and direct response structures
          const roomDCPowerData = data.roomDCPowerData || data;

          console.log("Room DC Power data:", roomDCPowerData);

          setFormData({
            dc_rectifiers: {
              existing_dc_rectifiers_location: roomDCPowerData.dc_rectifiers?.existing_dc_rectifiers_location || '',
              existing_dc_rectifiers_vendor: roomDCPowerData.dc_rectifiers?.existing_dc_rectifiers_vendor || '',
              existing_dc_rectifiers_model: roomDCPowerData.dc_rectifiers?.existing_dc_rectifiers_model || '',
              how_many_existing_dc_rectifier_modules: roomDCPowerData.dc_rectifiers?.how_many_existing_dc_rectifier_modules || '',
              rectifier_module_capacity: roomDCPowerData.dc_rectifiers?.rectifier_module_capacity || '',
              total_capacity_existing_dc_power_system: roomDCPowerData.dc_rectifiers?.total_capacity_existing_dc_power_system || '',
              how_many_free_slot_available_rectifier: roomDCPowerData.dc_rectifiers?.how_many_free_slot_available_rectifier || '',
              dc_rectifier_condition: roomDCPowerData.dc_rectifiers?.dc_rectifier_condition || '',
              rect_load_current_reading: roomDCPowerData.dc_rectifiers?.rect_load_current_reading || '',
              existing_site_temperature: roomDCPowerData.dc_rectifiers?.existing_site_temperature || '',
              blvd_in_dc_power_rack: roomDCPowerData.dc_rectifiers?.blvd_in_dc_power_rack || '',
              llvd_in_dc_power_rack: roomDCPowerData.dc_rectifiers?.llvd_in_dc_power_rack || '',
              pdu_in_dc_power_rack: roomDCPowerData.dc_rectifiers?.pdu_in_dc_power_rack || '',
              free_cbs_blvd: roomDCPowerData.dc_rectifiers?.free_cbs_blvd || '',
              free_cbs_llvd: roomDCPowerData.dc_rectifiers?.free_cbs_llvd || '',
              free_cbs_pdu: roomDCPowerData.dc_rectifiers?.free_cbs_pdu || '',
              free_slots_rectifier_modules: roomDCPowerData.dc_rectifiers?.free_slots_rectifier_modules || ''
            },
            batteries: {
              existing_batteries_strings_location: roomDCPowerData.batteries?.existing_batteries_strings_location || [],
              existing_batteries_vendor: roomDCPowerData.batteries?.existing_batteries_vendor || '',
              existing_batteries_type: roomDCPowerData.batteries?.existing_batteries_type || '',
              how_many_existing_battery_string: roomDCPowerData.batteries?.how_many_existing_battery_string || '',
              total_battery_capacity: roomDCPowerData.batteries?.total_battery_capacity || '',
              how_many_free_slot_available_battery: roomDCPowerData.batteries?.how_many_free_slot_available_battery || '',
              new_battery_string_installation_location: roomDCPowerData.batteries?.new_battery_string_installation_location || [],
              batteries_condition: roomDCPowerData.batteries?.batteries_condition || '',
              new_battery_type: roomDCPowerData.batteries?.new_battery_type || '',
              new_battery_capacity: roomDCPowerData.batteries?.new_battery_capacity || '',
              new_battery_qty: roomDCPowerData.batteries?.new_battery_qty || ''
            },
            cb_fuse_data_blvd: roomDCPowerData.cb_fuse_data_blvd || [],
            cb_fuse_data_llvd: roomDCPowerData.cb_fuse_data_llvd || [],
            cb_fuse_data_pdu: roomDCPowerData.cb_fuse_data_pdu || []
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
  // Configuration for the dynamic table rows
  const tableRows = [
    {
      key: 'rating',
      label: 'CB/fuse rating (Amp)',
      type: 'number',
      placeholder: 'Add rating...'
    },
    {
      key: 'connected_module',
      label: 'Name of connected module',
      type: 'textarea',
      placeholder: 'Module name'
    }
  ];

  // Transform cb_fuse_data_blvd to table format
  const getBLVDTableData = useCallback(() => {
    if (!Array.isArray(formData.cb_fuse_data_blvd)) {
      return [];
    }
    return formData.cb_fuse_data_blvd.map((item, index) => ({
      id: index + 1,
      rating: item.rating?.toString() || "",
      connected_module: item.connected_module || ""
    }));
  }, [formData.cb_fuse_data_blvd]);

  // Transform cb_fuse_data_llvd to table format
  const getLLVDTableData = useCallback(() => {
    if (!Array.isArray(formData.cb_fuse_data_llvd)) {
      return [];
    }
    return formData.cb_fuse_data_llvd.map((item, index) => ({
      id: index + 1,
      rating: item.rating?.toString() || "",
      connected_module: item.connected_module || ""
    }));
  }, [formData.cb_fuse_data_llvd]);

  // Transform cb_fuse_data_pdu to table format
  const getPDUTableData = useCallback(() => {
    if (!Array.isArray(formData.cb_fuse_data_pdu)) {
      return [];
    }
    return formData.cb_fuse_data_pdu.map((item, index) => ({
      id: index + 1,
      rating: item.rating?.toString() || "",
      connected_module: item.connected_module || ""
    }));
  }, [formData.cb_fuse_data_pdu]);

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
                <label className='block font-semibold '>Existing DC rectifiers are located in?</label>
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
                <label className='block font-semibold '>Existing DC rectifiers vendor</label>
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
                <label className='block font-semibold '>Existing DC rectifiers model</label>
                <input
                  type='text'
                  className='form-input'
                  value={formData.dc_rectifiers.existing_dc_rectifiers_model}
                  onChange={(e) => handleChange('dc_rectifiers', 'existing_dc_rectifiers_model', e.target.value)}
                  placeholder='Model'
                />
              </div>
              <div>
                <label className='block font-semibold '>How many existing DC rectifier modules?</label>
                <select
                  className='form-input'
                  value={formData.dc_rectifiers.how_many_existing_dc_rectifier_modules}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange('dc_rectifiers', 'how_many_existing_dc_rectifier_modules', value);

                    // auto calculate total
                    const total =
                      (parseFloat(value) || 0) *
                      (parseFloat(formData.dc_rectifiers.rectifier_module_capacity) || 0);
                    handleChange('dc_rectifiers', 'total_capacity_existing_dc_power_system', total.toFixed(1));
                  }}
                >
                  <option value=''>Select</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block font-semibold '>Rectifier module capacity (per module in KW)</label>
                <input
                  type='number'
                  step='0.1'
                  className='form-input'
                  value={formData.dc_rectifiers.rectifier_module_capacity}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange('dc_rectifiers', 'rectifier_module_capacity', value);

                    // auto calculate total
                    const total =
                      (parseFloat(formData.dc_rectifiers.how_many_existing_dc_rectifier_modules) || 0) *
                      (parseFloat(value) || 0);
                    handleChange('dc_rectifiers', 'total_capacity_existing_dc_power_system', total.toFixed(1));
                  }}
                  placeholder='2.5'
                />
              </div>

              <div>
                <label className='block font-semibold '>Total capacity of existing DC power system (KW)</label>
                <input
                  type='number'
                  step='0.1'
                  className='form-input'
                  value={formData.dc_rectifiers.how_many_existing_dc_rectifier_modules * formData.dc_rectifiers.rectifier_module_capacity}
                  readOnly // make it auto-filled
                />
              </div>


              <div>
                <label className='block font-semibold '>RECT Load current reading (A)</label>
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
                <label className='block font-semibold '>Existing site temperature (C)</label>
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
                <label className='block font-semibold '>How many free slot available for new rectifier modules?</label>
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
                <label className='block font-semibold '>DC rectifier condition</label>
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
              <div>
                <label className='block font-semibold '>Is there BLVD in the DC power rack?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input type="radio" name="blvd_in_dc_power_rack" value={option} checked={formData.dc_rectifiers.blvd_in_dc_power_rack === option} onChange={(e) => handleChange('dc_rectifiers', 'blvd_in_dc_power_rack', e.target.value)} />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {
                formData.dc_rectifiers.blvd_in_dc_power_rack === 'Yes' && (

                  <div>
                    <label className='block font-semibold '>Does the BLVD has free CBs?</label>
                    <div className="flex gap-4 ">
                      {['Yes', 'No'].map((option) => (
                        <label key={option} className="flex items-center mr-2">
                          <input type="radio" name="free_cbs_blvd" value={option} checked={formData.dc_rectifiers.free_cbs_blvd === option} onChange={(e) => handleChange('dc_rectifiers', 'free_cbs_blvd', e.target.value)} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              {
                formData.dc_rectifiers.blvd_in_dc_power_rack === 'Yes' && (
                  <DynamicTable
                    title="Existing BLVD CBs ratings & connected loads"
                    rows={tableRows}
                    initialData={getBLVDTableData()}
                    onChange={handleBLVDTableDataChange}
                    minColumns={1}
                    autoExpand={true}
                    enableDragDrop={true}
                    enableDelete={true}
                    className="col-span-2"
                    tableClassName="w-full border border-gray-300"
                    headerClassName="bg-gray-200"
                    cellClassName="border px-2 py-2"
                    labelClassName="border px-4 py-2 font-semibold bg-gray-50"
                  />


                )
              }

              <div>
                <label className='block font-semibold '>Is there LLVD in the DC power rack?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input type="radio" name="llvd_in_dc_power_rack" value={option} checked={formData.dc_rectifiers.llvd_in_dc_power_rack === option} onChange={(e) => handleChange('dc_rectifiers', 'llvd_in_dc_power_rack', e.target.value)} />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {
                formData.dc_rectifiers.llvd_in_dc_power_rack === 'Yes' && (
                  <div>
                    <label className='block font-semibold '>Does the LLVD has free CBs?</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((option) => (
                        <label key={option} className="flex items-center mr-2">
                          <input type="radio" name="free_cbs_llvd" value={option} checked={formData.dc_rectifiers.free_cbs_llvd === option} onChange={(e) => handleChange('dc_rectifiers', 'free_cbs_llvd', e.target.value)} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              {
                formData.dc_rectifiers.llvd_in_dc_power_rack === 'Yes' && (
                  <DynamicTable
                    title="Existing LLVD CBs ratings & connected loads"
                    rows={tableRows}
                    initialData={getLLVDTableData()}
                    onChange={handleLLVDTableDataChange}
                    minColumns={1}
                    autoExpand={true}
                    enableDragDrop={true}
                    enableDelete={true}
                    className="col-span-2"
                    tableClassName="w-full border border-gray-300"
                    headerClassName="bg-gray-200"
                    cellClassName="border px-2 py-2"
                    labelClassName="border px-4 py-2 font-semibold bg-gray-50"
                  />
                )}
              <div>
                <label className='block font-semibold '>Is there PDU in the cabinet?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input type="radio" name="pdu_in_dc_power_rack" value={option} checked={formData.dc_rectifiers.pdu_in_dc_power_rack === option} onChange={(e) => handleChange('dc_rectifiers', 'pdu_in_dc_power_rack', e.target.value)} />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {
                formData.dc_rectifiers.pdu_in_dc_power_rack === 'Yes' && (
                  <div>
                    <label className='block font-semibold '>Does the PDU has free CBs?</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input type="radio" name="free_cbs_pdu" value={option} checked={formData.dc_rectifiers.free_cbs_pdu === option} onChange={(e) => handleChange('dc_rectifiers', 'free_cbs_pdu', e.target.value)} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              {
                formData.dc_rectifiers.pdu_in_dc_power_rack === 'Yes' && (
                  <DynamicTable
                    title="Existing PDU CBs ratings & connected loads"
                    rows={tableRows}
                    initialData={getPDUTableData()}
                    onChange={handlePDUTableDataChange}
                    minColumns={1}
                    autoExpand={true}
                    enableDragDrop={true}
                    enableDelete={true}
                    className="col-span-2"
                    tableClassName="w-full border border-gray-300"
                    headerClassName="bg-gray-200"
                    cellClassName="border px-2 py-2"
                    labelClassName="border px-4 py-2 font-semibold bg-gray-50"
                  />
                )}

            </div>

            <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Batteries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg">

              <div>
                <label className='block font-semibold '>Existing batteries strings are located in?</label>
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
                <label className='block font-semibold '>Existing batteries vendor</label>
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
                <label className='block font-semibold '>Existing batteries type</label>
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
                <label className='block font-semibold '>How many existing battery string?</label>
                <select
                  className='form-input'
                  value={formData.batteries.how_many_existing_battery_string}
                  onChange={(e) => handleChange('batteries', 'how_many_existing_battery_string', e.target.value)}
                >
                  <option value=''>Select</option>
                  {[...Array(6)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block font-semibold '>Total battery Capacity (Ah)</label>
                <input
                  type='number'
                  className='form-input'
                  value={formData.batteries.total_battery_capacity}
                  onChange={(e) => handleChange('batteries', 'total_battery_capacity', e.target.value)}
                  placeholder='200'
                />
              </div>

              <div>
                <label className='block font-semibold '>How many free slot available for new battery string?</label>
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
                <label className='block font-semibold '>If new battery string is required, where to be installed? Choose all applicable</label>
                <div className='grid grid-cols-3 gap-2'>
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
                <label className='block font-semibold '>Batteries condition</label>
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
                <label className='block font-semibold '>New battery type</label>
                <input
                  type='text'
                  className='form-input'
                  value={formData.batteries.new_battery_type}
                  onChange={(e) => handleChange('batteries', 'new_battery_type', e.target.value)}
                  placeholder='Enter battery type'
                />
              </div>

              <div>
                <label className='block font-semibold '>New battery capacity (AH)</label>
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
                <label className='block font-semibold '>New battery QTY (string)</label>
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
              {loadingApi ? "loading..." : "Save"}
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

export default DCPowerSystemForm;
