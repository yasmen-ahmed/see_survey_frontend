import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

const TransmissionInformationForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    type_of_transmission: '',
    existing_transmission_base_band_location: '',
    existing_transmission_equipment_vendor: '',
    existing_odf_location: '',
    cable_length_odf_to_baseband: '',
    odf_fiber_cable_type: '',
    how_many_free_ports_odf: '',
    how_many_mw_link_exist: '',
    mw_links: []
  });
  const bgColorFillAuto = "bg-[#c6efce]"
  const colorFillAuto = 'text-[#006100]'
  
  const isFieldAutoFilled = (linkIndex, fieldName) => {
    if (linkIndex === 0) return false; // First row is never auto-filled
    return formData.mw_links[linkIndex]?.[`${fieldName}AutoFilled`] || false;
  };

  // Generate MW equipment-based image categories
  const generateMWImages = () => {
    const baseImages = [
      { label: 'ODF photo', name: 'odf_photo' },
      { label: 'ODF free port photo', name: 'odf_free_port' }
    ];
    
    const mwCount = parseInt(formData.how_many_mw_link_exist) || 0;
    
    // Add MW-specific images for each link
    for (let i = 1; i <= mwCount; i++) {
      baseImages.push(
        { label: `MW IDU photo ${i}`, name: `mw_idu_photo_${i}` },
        { label: `MW IDU cards photo ${i}`, name: `mw_idu_cards_photo_${i}` }
      );
    }
    
    return baseImages;
  };

  // Process images from API response
  const processImagesFromResponse = (data) => {
    const imagesByCategory = {};
    
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
        const category = img.category || img.image_category;
        
        if (!category || category.trim() === "") {
          console.warn("Skipping image with empty category:", img);
          return;
        }
        
        imagesByCategory[category] = [{
          id: img.id,
          file_url: img.url || img.file_url,
          name: img.original_filename || (img.url || img.file_url)?.split('/').pop() || `image_${img.id}`
        }];
      });
    }
    
    return imagesByCategory;
  };

  // Handle image uploads
  const handleImageUpload = (imageCategory, files) => {
    setHasUnsavedChanges(true); // Add this line at the start of the function
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/transmission-mw/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched MW data:", data);

        if (data) {
          // Set number of cabinets from API response
          setNumberOfCabinets(data.numberOfCabinets || 0);

          // Get the transmission data from the nested structure
          const transmissionData = data.transmissionData || data;
          console.log("Transmission data:", transmissionData);

          setFormData({
            type_of_transmission: transmissionData.type_of_transmission || '',
            existing_transmission_base_band_location: transmissionData.existing_transmission_base_band_location || '',
            existing_transmission_equipment_vendor: transmissionData.existing_transmission_equipment_vendor || '',
            existing_odf_location: transmissionData.existing_odf_location || '',
            cable_length_odf_to_baseband: transmissionData.cable_length_odf_to_baseband || '',
            odf_fiber_cable_type: transmissionData.odf_fiber_cable_type || '',
            how_many_free_ports_odf: transmissionData.how_many_free_ports_odf || '',
            how_many_mw_link_exist: transmissionData.how_many_mw_link_exist || '',
            mw_links: transmissionData.mw_links || []
          });

          // Process and set images from the response
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const processedImages = processImagesFromResponse(data);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading MW transmission data:", err);
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

  const handleChange = (name, value) => {
    setHasUnsavedChanges(true);
    console.log(`Changing ${name} to:`, value);
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // When MW links count changes, update the mw_links array
      if (name === 'how_many_mw_link_exist') {
        const count = parseInt(value) || 0;
        const currentLinks = prev.mw_links || [];
        console.log(`Updating MW links count from ${currentLinks.length} to ${count}`);

        if (count > currentLinks.length) {
          // Add new empty links
          const newLinks = [...currentLinks];
          for (let i = currentLinks.length; i < count; i++) {
            newLinks.push({
              link_id: i + 1,
              located_in: '',
              mw_equipment_vendor: '',
              idu_type: '',
              card_type_model: '',
              destination_site_id: '',
              mw_backhauling_type: '',
              ethernet_ports_used: '',
              ethernet_ports_free: ''
            });
          }
          newFormData.mw_links = newLinks;
          console.log('New MW links array:', newLinks);
        } else if (count < currentLinks.length) {
          // Remove excess links
          newFormData.mw_links = currentLinks.slice(0, count);
          console.log('Trimmed MW links array:', newFormData.mw_links);
        }
      }

      return newFormData;
    });
  };

  const handleMWLinkChange = (linkIndex, fieldName, value) => {
    setHasUnsavedChanges(true); // Add this line at the start of the function
    setFormData(prev => {
      const newFormData = { ...prev };
      const numLinks = parseInt(prev.how_many_mw_link_exist) || 1;
      
      // Always update the current link first
      if (!newFormData.mw_links[linkIndex]) {
        newFormData.mw_links[linkIndex] = {};
      }
      
      // For checkbox fields (located_in), ensure we're working with arrays properly
      if (fieldName === 'located_in') {
        const currentValues = (newFormData.mw_links[linkIndex][fieldName] || '').split(',').map(v => v.trim()).filter(Boolean);
        const newValues = value.split(',').map(v => v.trim()).filter(Boolean);
        
        newFormData.mw_links[linkIndex] = {
          ...newFormData.mw_links[linkIndex],
          [fieldName]: newValues.join(', '),
          [`${fieldName}AutoFilled`]: false
        };
      } else {
        newFormData.mw_links[linkIndex] = {
          ...newFormData.mw_links[linkIndex],
          [fieldName]: value,
          [`${fieldName}AutoFilled`]: false
        };
      }
      
      // If this is the first link (index 0), auto-fill other empty fields
      if (linkIndex === 0 && value) {
        for (let i = 1; i < numLinks; i++) {
          if (!newFormData.mw_links[i]) {
            newFormData.mw_links[i] = {};
          }
          
          const currentField = newFormData.mw_links[i][fieldName];
          const wasAutoFilled = newFormData.mw_links[i][`${fieldName}AutoFilled`];
          
          // Only auto-fill if the field is empty or was previously auto-filled
          if (!currentField || wasAutoFilled) {
            newFormData.mw_links[i] = {
              ...newFormData.mw_links[i],
              [fieldName]: value,
              [`${fieldName}AutoFilled`]: true
            };
          }
        }
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData for multipart submission
      const formDataToSend = new FormData();

      // Add form data
      const submitData = {
        type_of_transmission: formData.type_of_transmission,
        existing_transmission_base_band_location: formData.existing_transmission_base_band_location,
        existing_transmission_equipment_vendor: formData.existing_transmission_equipment_vendor,
        existing_odf_location: formData.existing_odf_location,
        cable_length_odf_to_baseband: parseFloat(formData.cable_length_odf_to_baseband) || 0,
        odf_fiber_cable_type: formData.odf_fiber_cable_type,
        how_many_free_ports_odf: parseInt(formData.how_many_free_ports_odf) || 0,
        how_many_mw_link_exist: parseInt(formData.how_many_mw_link_exist) || 0,
        mw_links: formData.mw_links.map((link, index) => ({
          link_id: link.link_id || (index + 1),
          located_in: link.located_in || '',
          mw_equipment_vendor: link.mw_equipment_vendor || '',
          idu_type: link.idu_type || '',
          card_type_model: link.card_type_model || '',
          destination_site_id: link.destination_site_id || '',
          mw_backhauling_type: link.mw_backhauling_type || '',
          ethernet_ports_used: parseInt(link.ethernet_ports_used) || 0,
          ethernet_ports_free: parseInt(link.ethernet_ports_free) || 0
        }))
      };

      // Add the JSON data
      formDataToSend.append('data', JSON.stringify(submitData));

      // Get all possible image fields
      const allImageFields = generateMWImages();
      
      console.log("All image fields:", allImageFields);
      console.log("Uploaded images state:", uploadedImages);
      
      // Handle all image fields
      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        console.log(`Processing image field: ${imageField.name}`, imageFiles);
        
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            console.log(`Adding file for ${imageField.name}:`, file.name);
            formDataToSend.append(imageField.name, file);
          } else {
            console.log(`Skipping non-File object for ${imageField.name}:`, file);
          }
        } else {
          console.log(`Adding empty string for ${imageField.name}`);
          formDataToSend.append(imageField.name, '');
        }
      });

      // Log FormData contents for debugging
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/transmission-mw/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Server response:", response.data);
      
      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/transmission-mw/${sessionId}`);
      const latestData = getResponse.data.data || getResponse.data;

      // Remove auto-filled flags from all links
      if (latestData.mw_links) {
        setFormData(prev => ({
          ...prev,
          mw_links: prev.mw_links.map(link => {
            const cleanedLink = { ...link };
            // Remove all auto-filled flags
            Object.keys(cleanedLink).forEach(key => {
              if (key.endsWith('AutoFilled')) {
                delete cleanedLink[key];
              }
            });
            return cleanedLink;
          })
        }));
      }
      setHasUnsavedChanges(false);
      showSuccess('MW transmission data and images submitted successfully!');
    } catch (err) {
      console.error("Error submitting data:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const cabinetOptions = generateCabinetOptions();
  const mwVendors = ['Nokia', 'Ericsson', 'Huawei', 'ZTE', 'NEC', 'Other'];
  const backhaulingTypes = ['Ethernet', 'Fiber'];
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
  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] max-h-[650px] overflow-y-auto">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='overflow-auto max-h-[850px]'>


            {/* Basic Transmission Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Type of transmission</label>
                <div className='space-x-4'>
                  {['Fiber', 'MW'].map((type) => (
                    <label key={type} className='inline-flex items-center'>
                      <input
                        type='radio'
                        name='type_of_transmission'
                        value={type}
                        checked={formData.type_of_transmission === type}
                        onChange={(e) => handleChange('type_of_transmission', e.target.value)}
                      />
                      <span className='ml-2'>{type}</span>
                    </label>
                  ))}
                </div>
                <hr className='mt-6' />
              </div>

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Existing Transmission base band located in?</label>
                <select
                  className='form-input' 
                  value={formData.existing_transmission_base_band_location}
                  onChange={(e) => handleChange('existing_transmission_base_band_location', e.target.value)}
                >
                  <option value=''>Select Location</option>
                  {cabinetOptions.map((cabinet) => (
                    <option key={cabinet} value={cabinet}>{cabinet}</option>
                  ))}
                  <option value='Other'>Other</option>
                </select>
                <hr className='mt-2' />
              </div>

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Existing Transmission equipment vendor</label>
                <select
                  className='form-input' 
                  value={formData.existing_transmission_equipment_vendor}
                  onChange={(e) => handleChange('existing_transmission_equipment_vendor', e.target.value)}
                >
                  <option value=''>Select Vendor</option>
                  {mwVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
                <hr className='mt-2' />
              </div>

              {/* ODF Questions - Only show when Fiber is selected */}
              {formData.type_of_transmission === 'Fiber' && (
                <>
                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>Existing ODF located in?</label>
                    <select
                      className='form-input' 
                      value={formData.existing_odf_location}
                      onChange={(e) => handleChange('existing_odf_location', e.target.value)}
                    >
                      <option value=''>Select Location</option>
                      {cabinetOptions.map((cabinet) => (
                        <option key={cabinet} value={cabinet}>{cabinet}</option>
                      ))}
                      <option value='Other'>Other</option>
                    </select>
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>Cable length from ODF to Baseband (cm)</label>
                    <input
                      type='number'
                      step='0.1'
                      className='form-input' 
                      value={formData.cable_length_odf_to_baseband}
                      onChange={(e) => handleChange('cable_length_odf_to_baseband', e.target.value)}
                      placeholder='25.5'
                    />
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>ODF fiber cable type</label>
                    <div className='space-x-4'>
                      {['LC', 'SC', 'FC'].map((type) => (
                        <label key={type} className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='odf_fiber_cable_type'
                            value={type}
                            checked={formData.odf_fiber_cable_type === type}
                            onChange={(e) => handleChange('odf_fiber_cable_type', e.target.value)}
                          />
                          <span className='ml-2'>{type}</span>
                        </label>
                      ))}
                    </div>
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>How many free ports on ODF?</label>
                    <select
                      className='form-input' 
                      value={formData.how_many_free_ports_odf}
                      onChange={(e) => handleChange('how_many_free_ports_odf', e.target.value)}
                    >
                      <option value=''>Select</option>
                      {[...Array(15)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <hr className='mt-2' />
                  </div>
                </>
              )}

              {/* MW Questions - Only show when MW is selected */}
              {formData.type_of_transmission === 'MW' && (
                <div className='mb-4'>
                  <label className='block font-semibold mb-2'>How many MW link exist on site?</label>
                  <select
                    className='form-input' 
                    value={formData.how_many_mw_link_exist}
                    onChange={(e) => {
                      console.log("Changing number of MW links to:", e.target.value);
                      handleChange('how_many_mw_link_exist', e.target.value);
                    }}
                  >
                    <option value=''>Select</option>
                    {[...Array(20)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <hr className='mt-2' />
                </div>
              )}
            </div>

            {/* Dynamic MW Equipment Table - Only show when MW is selected and links exist */}
            {formData.type_of_transmission === 'MW' && formData.how_many_mw_link_exist && parseInt(formData.how_many_mw_link_exist) > 0 && (
              <div className="">

                <div className="">
                  <table className="table-auto w-full border-collapse">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th
                          className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-10"
                          style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                        >
                          Field Description
                        </th>
                        {Array.from({ length: parseInt(formData.how_many_mw_link_exist) }, (_, i) => (
                          <th
                            key={i}
                            className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-10"
                          >
                            MW Link #{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* Located in? */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Located in?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'located_in') ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {[...cabinetOptions, 'Other'].map(option => (
                                <label key={option} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={(link.located_in || '').split(',').map(v => v.trim()).filter(Boolean).includes(option)}
                                    onChange={(e) => {
                                      // Get current values as an array, ensuring we handle empty strings properly
                                      const currentValues = (link.located_in || '').split(',')
                                        .map(v => v.trim())
                                        .filter(Boolean);
                                      
                                      // Create new array based on checkbox state
                                      const newValues = e.target.checked
                                        ? [...new Set([...currentValues, option])] // Add value if checked, ensuring no duplicates
                                        : currentValues.filter(v => v !== option); // Remove value if unchecked
                                      
                                      // Update the field with the new comma-separated string
                                      handleMWLinkChange(linkIndex, 'located_in', newValues.join(', '));
                                    }}
                                    className={`w-4 h-4 ${isFieldAutoFilled(linkIndex, 'located_in') ? colorFillAuto : ''}`}
                                  />
                                  <span className={isFieldAutoFilled(linkIndex, 'located_in') ? colorFillAuto : ''}>{option}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* MW equipment vendor */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          MW equipment vendor
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'mw_equipment_vendor') ? bgColorFillAuto : ''}`}>
                            <div className="grid grid-cols-3 gap-1">
                              {mwVendors.map(vendor => (
                                <label key={vendor} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="radio"
                                    name={`vendor-${linkIndex}`}
                                    value={vendor}
                                    checked={link.mw_equipment_vendor === vendor}
                                    onChange={(e) => handleMWLinkChange(linkIndex, 'mw_equipment_vendor', e.target.value)}
                                    className={`w-4 h-4 ${isFieldAutoFilled(linkIndex, 'mw_equipment_vendor') ? colorFillAuto : ''}`}
                                  />
                                  <span className={isFieldAutoFilled(linkIndex, 'mw_equipment_vendor') ? colorFillAuto : ''}>{vendor}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* IDU type */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          IDU type
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'idu_type') ? bgColorFillAuto : ''}`}>
                            <input
                              type="text"
                              value={link.idu_type}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'idu_type', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(linkIndex, 'idu_type') ? colorFillAuto : ''}`}
                              placeholder="Enter IDU type..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Card type/model */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Card type/model
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <input
                              type="text"
                              value={link.card_type_model}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'card_type_model', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(linkIndex, 'card_type_model') ? colorFillAuto : ''}`}
                              placeholder="Enter card type/model..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Destination site ID */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Destination site ID
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <input
                              type="text"
                              value={link.destination_site_id}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'destination_site_id', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(linkIndex, 'destination_site_id') ? colorFillAuto : ''}`}
                              placeholder="Enter destination site ID..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* MW backhauling type */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          MW backhauling type
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'mw_backhauling_type') ? bgColorFillAuto : ''}`}>
                            <div className="flex gap-4">
                              {backhaulingTypes.map(type => (
                                <label key={type} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="radio"
                                    name={`backhaulingType-${linkIndex}`}
                                    value={type}
                                    checked={link.mw_backhauling_type === type}
                                    onChange={(e) => handleMWLinkChange(linkIndex, 'mw_backhauling_type', e.target.value)}
                                    className={`w-4 h-4 ${isFieldAutoFilled(linkIndex, 'mw_backhauling_type') ? colorFillAuto : ''}`}
                                  />
                                  <span className={isFieldAutoFilled(linkIndex, 'mw_backhauling_type') ? colorFillAuto : ''}>{type}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* How many ethernet port used? */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          How many ethernet port used?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'ethernet_ports_used') ? bgColorFillAuto : ''}`}>
                            <select
                              value={link.ethernet_ports_used}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'ethernet_ports_used', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(linkIndex, 'ethernet_ports_used') ? colorFillAuto : ''}`}
                            >
                              <option value="">Select</option>
                              {[...Array(15)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>

                      {/* How many ethernet port free? */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          How many ethernet port free?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className={`border px-2 py-2 ${isFieldAutoFilled(linkIndex, 'ethernet_ports_free') ? bgColorFillAuto : ''}`}>
                            <select
                              value={link.ethernet_ports_free}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'ethernet_ports_free', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(linkIndex, 'ethernet_ports_free') ? colorFillAuto : ''}`}
                            >
                              <option value="">Select</option>
                              {[...Array(15)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 font-semibold"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
      
      {/* Image Uploader */}
      <ImageUploader 
        images={generateMWImages()} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default TransmissionInformationForm;
