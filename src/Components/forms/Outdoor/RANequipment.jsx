import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '../../../utils/notifications';
import { useParams } from 'react-router-dom';
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';
import ImageUploader from '../../GalleryComponent';

const RANBaseBandForm = () => {
  const { sessionId } = useParams();
  const bgColorFillAuto = "bg-[#c6efce]"
  const colorFillAuto = 'text-[#006100]'
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState({});
  const [cabinetCountUpdated, setCabinetCountUpdated] = useState(false);
  const [technologyOptions, setTechnologyOptions] = useState(['2G', '3G', '4G', '5G', 'Other']); // Default fallback
  const [formData, setFormData] = useState({
    // Existing fields
    existing_location: '',
    existing_vendor: '',
    existing_type_model: [],
    new_installation_location: [],
    length_of_transmission_cable: '',
    // New BTS table fields
    how_many_base_band_onsite: '',
    bts_table: [] // Array to store BTS data for each BTS
  });



  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges || isInitialLoading) return true;
    
    try {
      setLoadingApi(true);
      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add form data
      const payload = {
        // Existing fields
        existing_location: formData.existing_location,
        existing_vendor: formData.existing_vendor,
        existing_type_model: formData.existing_type_model || [],
        new_installation_location: formData.new_installation_location || [],
        length_of_transmission_cable: parseFloat(formData.length_of_transmission_cable) || 0,
        // New BTS table fields
        how_many_base_band_onsite: parseInt(formData.how_many_base_band_onsite) || 0,
        bts_table: formData.bts_table || []
      };

      submitFormData.append('data', JSON.stringify(payload));

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

      await axios.put(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setHasUnsavedChanges(false);
      showSuccess('Data saved successfully!');
      
      // Refresh cabinet count after successful save
      await refreshCabinetCount();
      
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

  // Define image fields based on the number of BTS
  const getImageFields = () => {
    const fields = [];
    const btsCount = parseInt(formData.how_many_base_band_onsite) || 0;

    // Add dynamic BTS photo fields based on count
    for (let i = 1; i <= btsCount; i++) {
      fields.push(
        { label: `BTS ${i} photos Front`, name: `bts_${i}_photos_front` },
        { label: `BTS ${i} photos Back`, name: `bts_${i}_photos_back` },
        { label: `BTS ${i} photos left side`, name: `bts_${i}_photos_left_side` },
        { label: `BTS ${i} photos Right side`, name: `bts_${i}_photos_right_side` }
      );
    }

    return fields;
  };

  // Update the imageFields whenever the BTS count changes
  useEffect(() => {
    const newFields = getImageFields();
    console.log("Updated image fields:", newFields);
  }, [formData.how_many_base_band_onsite]);

  // Process images from API response
  const processImagesFromResponse = (data) => {
    const imagesByCategory = {};

    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
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

  useEffect(() => {
    setIsInitialLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched RAN equipment data:", data);

        if (data) {
          setNumberOfCabinets(data.numberOfCabinets || 0);
          const ranData = data.ranEquipment || data;
          console.log(ranData);
          setFormData({
            // Existing fields
            existing_location: ranData.existing_location || "",
            existing_vendor: ranData.existing_vendor || "",
            existing_type_model: ranData.existing_type_model || [],
            new_installation_location: ranData.new_installation_location || [],
            length_of_transmission_cable: ranData.length_of_transmission_cable || "",
            // New BTS table fields
            how_many_base_band_onsite: ranData.how_many_base_band_onsite || '',
            bts_table: ranData.bts_table || []
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
        
        // Fetch technology options and refresh cabinet count
        fetchTechnologyOptions();
        setTimeout(() => refreshCabinetCount(), 500);
      })
      .catch(err => {
        console.error("Error loading RAN equipment data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
        
        // Still try to fetch technology options and refresh cabinet count even on error
        fetchTechnologyOptions();
        setTimeout(() => refreshCabinetCount(), 500);
      });
  }, [sessionId]);

  // Generate cabinet options based on numberOfCabinets
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    console.log(`Generated ${options.length} cabinet options for ${numberOfCabinets} cabinets:`, options);
    return options;
  };

  // Memoize cabinet options to prevent unnecessary re-renders
  const cabinetOptions = React.useMemo(() => generateCabinetOptions(), [numberOfCabinets]);

  // Debug cabinet count changes
  useEffect(() => {
    console.log(`Cabinet count changed to: ${numberOfCabinets}`);
  }, [numberOfCabinets]);

  // Function to fetch technology options from Site Information
  const fetchTechnologyOptions = async () => {
    try {
      console.log('Fetching technology options from Site Information...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}/technology-options`);
      const data = response.data.data || response.data;
      
      console.log('Technology options API response:', data);
      
      if (data && data.technology_options) {
        const selectedTechnologies = data.technology_options;
        console.log('Setting technology options to:', selectedTechnologies);
        setTechnologyOptions(selectedTechnologies);
      } else {
        console.log('No technology options found in Site Information, using defaults');
        setTechnologyOptions(['2G', '3G', '4G', '5G', 'Other']);
      }
    } catch (error) {
      console.warn('Could not fetch technology options from Site Information:', error);
      setTechnologyOptions(['2G', '3G', '4G', '5G', 'Other']); // Fallback to defaults
    }
  };

  // Debug technology options changes
  useEffect(() => {
    console.log('Technology options changed to:', technologyOptions);
  }, [technologyOptions]);

  // Function to refresh cabinet count from outdoor cabinets (now only for manual refresh)
  const refreshCabinetCount = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ran-equipment/${sessionId}`);
      const data = response.data.data || response.data;
      const newCabinetCount = data.numberOfCabinets || 0;
      
      console.log(`Current cabinet count: ${numberOfCabinets}, New cabinet count: ${newCabinetCount}`);
      
      if (data && newCabinetCount !== numberOfCabinets) {
        console.log(`Cabinet count updated from ${numberOfCabinets} to ${newCabinetCount}`);
        setNumberOfCabinets(newCabinetCount);
        setCabinetCountUpdated(true); // Set indicator to true
        setTimeout(() => setCabinetCountUpdated(false), 3000); // Reset indicator after 3 seconds
      }
    } catch (error) {
      console.warn('Could not refresh cabinet count:', error);
    }
  };

  // Remove periodic refresh since backend now always provides latest count
  // useEffect(() => {
  //   // Initial refresh
  //   refreshCabinetCount();
  //   
  //   // Set up periodic refresh
  //   const interval = setInterval(refreshCabinetCount, 1000); // Check every 1 second
  //   
  //   return () => clearInterval(interval);
  // }, [sessionId]); // Remove numberOfCabinets from dependency to avoid infinite loops

  // Initialize BTS table data when count changes
  useEffect(() => {
    const btsCount = parseInt(formData.how_many_base_band_onsite) || 0;
    const currentBtsTable = formData.bts_table || [];

    if (btsCount > currentBtsTable.length) {
      // Add new BTS entries
      const newBtsTable = [...currentBtsTable];
      for (let i = currentBtsTable.length; i < btsCount; i++) {
        newBtsTable.push({
          base_band_technology: [],
          existing_base_band_located_in_cabinet: '',
          base_band_vendor: '',
          base_band_model: '',
          base_band_status: '',
          transmission_cable_type: '',
          length_of_transmission_cable: '',
          backhauling_destination: '',
          // AutoFilled flags
          base_band_technologyAutoFilled: false,
          existing_base_band_located_in_cabinetAutoFilled: false,
          base_band_vendorAutoFilled: false,
          base_band_modelAutoFilled: false,
          base_band_statusAutoFilled: false,
          transmission_cable_typeAutoFilled: false,
          length_of_transmission_cableAutoFilled: false,
          backhauling_destinationAutoFilled: false
        });
      }
      setFormData(prev => ({ ...prev, bts_table: newBtsTable }));
    } else if (btsCount < currentBtsTable.length) {
      // Remove excess BTS entries
      setFormData(prev => ({
        ...prev,
        bts_table: currentBtsTable.slice(0, btsCount)
      }));
    }
  }, [formData.how_many_base_band_onsite]);



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

  const handleBTSChange = (btsIndex, field, value) => {
    if (isInitialLoading) return;

    setHasUnsavedChanges(true);

    setFormData(prevData => {
      const newBtsTable = [...prevData.bts_table];
      newBtsTable[btsIndex] = {
        ...newBtsTable[btsIndex],
        [field]: value,
        [`${field}AutoFilled`]: false // Reset auto-fill flag when manually changed
      };

      // If this is the first BTS and the field has a value, auto-fill other BTS
      if (btsIndex === 0 && value) {
        for (let i = 1; i < parseInt(prevData.how_many_base_band_onsite || 0); i++) {
          if (!newBtsTable[i][field] || newBtsTable[i][`${field}AutoFilled`]) { // Only auto-fill if field is empty or was previously auto-filled
            newBtsTable[i] = {
              ...newBtsTable[i],
              [field]: value,
              [`${field}AutoFilled`]: true // Mark as auto-filled
            };
          }
        }
      }

      return {
        ...prevData,
        bts_table: newBtsTable
      };
    });
  };

  const handleBTSCheckboxChange = (btsIndex, field, value) => {
    if (isInitialLoading) return;

    setHasUnsavedChanges(true);

    setFormData(prevData => {
      const newBtsTable = [...prevData.bts_table];
      const currentValues = new Set((newBtsTable[btsIndex][field] || []).map(String));

      if (currentValues.has(String(value))) {
        currentValues.delete(String(value));
      } else {
        currentValues.add(String(value));
      }

      newBtsTable[btsIndex] = {
        ...newBtsTable[btsIndex],
        [field]: Array.from(currentValues),
        [`${field}AutoFilled`]: false // Reset auto-fill flag when manually changed
      };

      // If this is the first BTS, auto-fill other BTS
      if (btsIndex === 0) {
        for (let i = 1; i < parseInt(prevData.how_many_base_band_onsite || 0); i++) {
          if (!newBtsTable[i][field]?.length || newBtsTable[i][`${field}AutoFilled`]) { // Only auto-fill if field is empty or was previously auto-filled
            newBtsTable[i] = {
              ...newBtsTable[i],
              [field]: Array.from(currentValues),
              [`${field}AutoFilled`]: true // Mark as auto-filled
            };
          }
        }
      }

      return {
        ...prevData,
        bts_table: newBtsTable
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

  const imageFields = getImageFields();

  const vendorOptions = ['Nokia', 'Huawei', 'Ericsson', 'ZTE', 'Other'];
  const statusOptions = ['Good', 'Satisfying', 'Bad', 'Not working'];
  const transmissionCableOptions = ['Optical', 'Electrical'];
  const backhaulingOptions = ['IDU','ODF'];

  // Generate backhauling options based on BTS count
  const generateBackhaulingOptions = (currentBTSIndex) => {
    const btsCount = parseInt(formData.how_many_base_band_onsite) || 0;
    const options = [...backhaulingOptions];
    for (let i = 1; i <= btsCount; i++) {
      // if (i !== currentBTSIndex + 1) { // Exclude current BTS
        options.push(`co-siting with BTS ${i}`);
      // }
    }
    return options;
  };

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

          
            {/* BTS Table Section */}

            <div className="mb-8  p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className='block font-semibold mb-2'>How many Base Band onsite (BTS)</label>
                </div>
                <select
                  className='form-input'
                  value={formData.how_many_base_band_onsite}
                  onChange={(e) => handleChange('how_many_base_band_onsite', e.target.value)}
                >
                  <option value=''>Select</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              
              </div>

              {parseInt(formData.how_many_base_band_onsite) > 0 && (
                <div className="flex-1 overflow-y-auto">
                  <table className="table-auto w-full border-collapse">
                    <thead className="bg-blue-500 text-white">
                      <tr >
                        <th
                          className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-20"
                          style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                        >
                          Field Description
                        </th>
                        {[...Array(parseInt(formData.how_many_base_band_onsite))].map((_, index) => (
                          <th key={index} className="border px-4 py-3 text-center font-semibold min-w-[340px] sticky top-0 bg-blue-500 z-10">
                            BTS #{index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Base band technology */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Base band technology</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.base_band_technologyAutoFilled ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
                              {technologyOptions.map((tech) => (
                                <label key={tech}className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={(bts.base_band_technology || []).includes(tech)}
                                    onChange={(e) => handleBTSCheckboxChange(index, 'base_band_technology', tech)}
                                    className={`mr-1 ${bts.base_band_technologyAutoFilled ? colorFillAuto : ''}`}
                                  />
                                  <span className={bts.base_band_technologyAutoFilled ? colorFillAuto : ''}>
                                    {tech}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                   {/* Existing Base Band located in cabinet */}
<tr className="bg-gray-50">
  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
    Existing Base Band located in cabinet
  </td>
  {formData.bts_table.map((bts, index) => (
    <td key={index} className={`border px-4 py-2 ${bts.existing_base_band_located_in_cabinetAutoFilled ? bgColorFillAuto : ''}`}>
      <div className="flex flex-col gap-2 relative">
        {/* Dropdown */}
        <select
          className={`w-full text-sm p-2 border rounded ${bts.existing_base_band_located_in_cabinetAutoFilled ? colorFillAuto : ''}`}
          value={bts.existing_base_band_located_in_cabinet}
          onChange={(e) => handleBTSChange(index, 'existing_base_band_located_in_cabinet', e.target.value)}
        >
          <option value="">Select</option>
          {cabinetOptions.map((cabinet) => (
            <option key={cabinet} value={cabinet}>{cabinet}</option>
          ))}
          <option value="Other">Other</option>
        </select>

        {/* Green dot indicator */}
        {cabinetCountUpdated && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}

        {/* Show input when 'Other' is selected */}
        {bts.existing_base_band_located_in_cabinet === 'Other' && (
          <input
            type="text"
            placeholder="Enter cabinet name"
            value={bts.existing_base_band_located_in_cabinet_other || ''}
            onChange={(e) => handleBTSChange(index, 'existing_base_band_located_in_cabinet_other', e.target.value)}
            className={`border rounded px-2 py-1 text-sm ${bts.existing_base_band_located_in_cabinetAutoFilled ? colorFillAuto : ''}`}
          />
        )}
      </div>
    </td>
  ))}
</tr>


                    {/* Base band vendor */}
<tr>
  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
    Base band vendor
  </td>
  {formData.bts_table.map((bts, index) => (
    <td key={index} className={`border px-4 py-2 ${bts.base_band_vendorAutoFilled ? bgColorFillAuto : ''}`}>
      <div className="flex flex-col gap-2">
        {/* Dropdown */}
        <select
          value={bts.base_band_vendor}
          onChange={(e) => handleBTSChange(index, 'base_band_vendor', e.target.value)}
          className={`border rounded px-2 py-1 ${bts.base_band_vendorAutoFilled ? colorFillAuto : ''}`}
        >
          {vendorOptions.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {/* Text input shown when "Other" is selected */}
        {bts.base_band_vendor === 'Other' && (
          <input
            type="text"
            placeholder="Enter other vendor"
            value={bts.base_band_vendor_other || ''}
            onChange={(e) => handleBTSChange(index, 'base_band_vendor_other', e.target.value)}
            className={`border rounded px-2 py-1 ${bts.base_band_vendorAutoFilled ? colorFillAuto : ''}`}
          />
        )}
      </div>
    </td>
  ))}
</tr>


                      {/* Base band model */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Base band model</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.base_band_modelAutoFilled ? bgColorFillAuto : ''}`}>
                            <input
                              type="text"
                              className={`border rounded px-2 py-1 ${bts.base_band_modelAutoFilled ? colorFillAuto : ''}`}
                              value={bts.base_band_model}
                              onChange={(e) => handleBTSChange(index, 'base_band_model', e.target.value)}
                              placeholder="Enter model"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Base band status */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Base band status</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.base_band_statusAutoFilled ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {statusOptions.map((status) => (
                                <label key={status} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`base_band_status_${index}`}
                                    value={status}
                                    checked={bts.base_band_status === status}
                                    onChange={(e) => handleBTSChange(index, 'base_band_status', e.target.value)}
                                    className={`mr-1 ${bts.base_band_statusAutoFilled ? colorFillAuto : ''}`}
                                  />
                                  <span className={bts.base_band_statusAutoFilled ? colorFillAuto : ''}>
                                    {status}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Transmission cable type */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Transmission cable (backhauling) type</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.transmission_cable_typeAutoFilled ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {transmissionCableOptions.map((type) => (
                                <label key={type} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`transmission_cable_type_${index}`}
                                    value={type}
                                    checked={bts.transmission_cable_type === type}
                                    onChange={(e) => handleBTSChange(index, 'transmission_cable_type', e.target.value)}
                                    className={`mr-1 ${bts.transmission_cable_typeAutoFilled ? colorFillAuto : ''}`}
                                  />
                                  <span className={bts.transmission_cable_typeAutoFilled ? colorFillAuto : ''}>
                                    {type}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Length of Transmission cable */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Length of Transmission cable</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.length_of_transmission_cableAutoFilled ? bgColorFillAuto : ''}`}>
                            <input
                              type="number"
                              step="0.1"
                              className={`border rounded px-2 py-1 ${bts.length_of_transmission_cableAutoFilled ? colorFillAuto : ''}`}
                              value={bts.length_of_transmission_cable}
                              onChange={(e) => handleBTSChange(index, 'length_of_transmission_cable', e.target.value)}
                              placeholder="0.0"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Backhauling destination */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">Backhauling destination</td>
                        {formData.bts_table.map((bts, index) => (
                          <td key={index} className={`border px-4 py-2 ${bts.backhauling_destinationAutoFilled ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {generateBackhaulingOptions(index).map((option) => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`backhauling_destination_${index}`}
                                    value={option}
                                    checked={bts.backhauling_destination === option}
                                    onChange={(e) => handleBTSChange(index, 'backhauling_destination', e.target.value)}
                                    className={`mr-1 ${bts.backhauling_destinationAutoFilled ? colorFillAuto : ''}`}
                                  />
                                  <span className={bts.backhauling_destinationAutoFilled ? colorFillAuto : ''}>
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
          </div>
              )}

         

                {/* Existing RAN Equipment Section */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg mt-10">
             
             {/* <div>
               <label className='block font-semibold mb-2'>Existing RAN base band located in?</label>
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
         </div>

             <div>
               <label className='block font-semibold mb-2'>Existing RAN base band vendor</label>
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
         </div>

             <div>
               <label className='block font-semibold mb-2'>Existing RAN base band type/model</label>
               <div className='grid grid-cols-3 gap-2'>
             {['Nokia Air Scale', 'Nokia Felix', 'Other'].map((type) => (
                   <label key={type} className="flex items-center gap-2">
                 <input
                       type="checkbox"
                   value={type}
                   checked={formData.existing_type_model.includes(type)}
                   onChange={(e) => handleCheckboxChange('existing_type_model', e.target.value)}
                       className="w-4 h-4"
                 />
                     {type}
                   </label>
                 ))}
               </div>
             </div> */}

             <div>
               <label className='block font-semibold mb-2'>Where new Nokia base band can be installed? Choose all applicable</label>
               <div className='grid grid-cols-3 gap-2'>
             {[
               ...cabinetOptions,
               'New Nokia cabinet',
               'Other',
             ].map((location) => (
                   <label key={location} className="flex items-center gap-2">
                 <input
                       type="checkbox"
                   value={location}
                   checked={formData.new_installation_location.includes(location)}
                   onChange={(e) => handleCheckboxChange('new_installation_location', e.target.value)}
                       className="w-4 h-4"
                 />
                     {location}
                   </label>
                 ))}
               </div>
         </div>

             <div>
               <label className='block font-semibold mb-2'>Length of Transmission cable (Optical / Electrical) from new Nokia base band to MW IDU/ODF (meter)</label>
           <input
             type='number'
             className='form-input' 
             value={formData.length_of_transmission_cable}
             onChange={(e) => handleChange('length_of_transmission_cable', e.target.value)}
             placeholder='000'
           />
             </div>
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

export default RANBaseBandForm;

