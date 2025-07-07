import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';
import DynamicTable from '../../DynamicTable';

const OutdoorCabinetsForm = () => {
  const { sessionId } = useParams();
  const bgColorFillAuto = "bg-[#c6efce]"
  const colorFillAuto = 'text-[#006100]'
  const [formData, setFormData] = useState({
    numberOfCabinets: '',
    cabinets: Array(10).fill(null).map((_, index) => ({
      id: index + 1,
      type: [],
      vendor: '',
      model: '',
      antiTheft: '',
      coolingType: '',
      coolingCapacity: '',
      compartments: '',
      hardware: [],
      acPowerFeed: '',
      cbNumber: '',
      powerCableLength: '',
      powerCableCrossSection: '',
      blvd: '',
      blvdFreeCBs: '',
      blvdCBsRatings: [],
      llvd: '',
      llvdFreeCBs: '',
      llvdCBsRatings: [],
      pdu: '',
      pduFreeCBs: '',
      pduCBsRatings: [],
      internalLayout: '',
      freeU: '',
      images: []
    }))
  });

  const [connectedModules, setConnectedModules] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generate image fields for a single cabinet
  const getCabinetImages = (cabinetNumber) => [
    { label: `Cabinet ${cabinetNumber} general photo`, name: `cabinet_${cabinetNumber}_photo_general_photo` },
    { label: `Cabinet #${cabinetNumber} Photo 1/4`, name: `cabinet_${cabinetNumber}_photo_1_4` },
    { label: `Cabinet #${cabinetNumber} Photo 2/4`, name: `cabinet_${cabinetNumber}_photo_2_4` },
    { label: `Cabinet #${cabinetNumber} Photo 3/4`, name: `cabinet_${cabinetNumber}_photo_3_4` },
    { label: `Cabinet #${cabinetNumber} Photo 4/4`, name: `cabinet_${cabinetNumber}_photo_4_4` },
    { label: `Cabinet #${cabinetNumber} RAN equipment photo`, name: `cabinet_${cabinetNumber}_ran_equipment_photo` },
  ];

  // Generate all image fields based on cabinet count
  const getAllImages = () => {
    if (!formData.numberOfCabinets) return [];
    const count = parseInt(formData.numberOfCabinets);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getCabinetImages(i)];
    }
    return allImages;
  };

  // Process images from API response
  const processImagesFromResponse = (cabinets) => {
    const imagesByCategory = {};
    
    cabinets.forEach(cabinet => {
      if (cabinet.images && Array.isArray(cabinet.images)) {
        cabinet.images.forEach(img => {
          // Handle the actual API response structure
          imagesByCategory[img.category] = [{
            id: img.id,
            file_url: img.url,  // API returns 'url' not 'file_url'
            name: img.url.split('/').pop() || `image_${img.id}`  // Extract filename from URL
          }];
        });
      }
    });
    
    return imagesByCategory;
  };

  // Configuration for CB ratings tables
  const cbRatingsTableRows = [
    {
      key: 'rating',
      label: 'CB Rating (Amp)',
      type: 'number',
      placeholder: 'Enter rating...'
    },
    {
      key: 'connected_load',
      label: 'Connected Load',
      type: 'textarea',
      placeholder: 'Describe connected load...'
    }
  ];

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/outdoor-cabinets/${sessionId}`)
      .then(res => {
        // Handle nested response structure
        const data = res.data.data?.data || res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          // Create a default cabinet template
          const defaultCabinet = {
            type: [],
            vendor: '',
            model: '',
            antiTheft: '',
            coolingType: '',
            coolingCapacity: '',
            compartments: '',
            hardware: [],
            acPowerFeed: '',
            cbNumber: '',
            powerCableLength: '',
            powerCableCrossSection: '',
            blvd: '',
            blvdFreeCBs: '',
            blvdCBsRatings: [],
            llvd: '',
            llvdFreeCBs: '',
            llvdCBsRatings: [],
            pdu: '',
            pduFreeCBs: '',
            pduCBsRatings: [],
            internalLayout: '',
            freeU: '',
          };

          // Merge API data with default structure
          const mergedCabinets = Array(10).fill(null).map((_, index) => {
            const apiCabinet = data.cabinets?.[index] || {};
            return {
              id: index + 1,
              ...defaultCabinet,
              ...apiCabinet,
              // Ensure arrays are properly initialized
              type: Array.isArray(apiCabinet.type) ? apiCabinet.type : [],
              hardware: Array.isArray(apiCabinet.hardware) ? apiCabinet.hardware : [],
              blvdCBsRatings: Array.isArray(apiCabinet.blvdCBsRatings) ? apiCabinet.blvdCBsRatings : [],
              llvdCBsRatings: Array.isArray(apiCabinet.llvdCBsRatings) ? apiCabinet.llvdCBsRatings : [],
              pduCBsRatings: Array.isArray(apiCabinet.pduCBsRatings) ? apiCabinet.pduCBsRatings : [],
            };
          });

          console.log("API cabinets data:", data.cabinets);
          console.log("Merged cabinets data:", mergedCabinets);

          setFormData({
            numberOfCabinets: data.numberOfCabinets || '',
            cabinets: mergedCabinets
          });

          // Process and set images from the response
          if (mergedCabinets.some(cabinet => cabinet.images?.length > 0)) {
            const processedImages = processImagesFromResponse(mergedCabinets);
            console.log("Processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading outdoor cabinets data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ac-panel/${sessionId}/connected-modules`);
        if (response.data.success) {
          setConnectedModules(response.data.data.connected_modules);
        }
      } catch (error) {
        console.error('Failed to fetch connected modules:', error);
      }
    };

    fetchModules();
  }, [sessionId]);

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  const handleChange = (cabinetIndex, fieldName, value) => {
    setHasUnsavedChanges(true);
    
    setFormData(prevData => {
      const newCabinets = [...prevData.cabinets];
      newCabinets[cabinetIndex] = {
        ...newCabinets[cabinetIndex],
        [fieldName]: value,
        [`${fieldName}AutoFilled`]: false // Reset auto-fill flag when manually changed
      };

      // If this is the first cabinet and the field has a value, auto-fill other cabinets
      if (cabinetIndex === 0 && value) {
        for (let i = 1; i < parseInt(prevData.numberOfCabinets || 0); i++) {
          if (!newCabinets[i][fieldName] || newCabinets[i][`${fieldName}AutoFilled`]) { // Only auto-fill if field is empty or was previously auto-filled
            newCabinets[i] = {
              ...newCabinets[i],
              [fieldName]: value,
              [`${fieldName}AutoFilled`]: true // Mark as auto-filled
            };
          }
        }
      }

      return {
        ...prevData,
        cabinets: newCabinets
      };
    });
  };

  const handleCheckboxChange = (cabinetIndex, fieldName, value, checked) => {
    setHasUnsavedChanges(true);
    
    setFormData(prevData => {
      const newCabinets = [...prevData.cabinets];
      const currentValues = new Set((newCabinets[cabinetIndex][fieldName] || []).map(String));
      
      if (checked) {
        currentValues.add(String(value));
      } else {
        currentValues.delete(String(value));
      }

      newCabinets[cabinetIndex] = {
        ...newCabinets[cabinetIndex],
        [fieldName]: Array.from(currentValues),
        [`${fieldName}AutoFilled`]: false // Reset auto-fill flag when manually changed
      };

      // If this is the first cabinet, auto-fill other cabinets
      if (cabinetIndex === 0) {
        for (let i = 1; i < parseInt(prevData.numberOfCabinets || 0); i++) {
          if (!newCabinets[i][fieldName]?.length || newCabinets[i][`${fieldName}AutoFilled`]) { // Only auto-fill if field is empty or was previously auto-filled
            newCabinets[i] = {
              ...newCabinets[i],
              [fieldName]: Array.from(currentValues),
              [`${fieldName}AutoFilled`]: true // Mark as auto-filled
            };
          }
        }
      }

      return {
        ...prevData,
        cabinets: newCabinets
      };
    });
  };

  // Get table data for a specific cabinet and equipment type with proper formatting
  const getCBRatingsTableData = useCallback((cabinetIndex, equipmentType) => {
    const cabinet = formData.cabinets[cabinetIndex];
    const ratings = cabinet?.[`${equipmentType}CBsRatings`] || [];
    
    if (ratings && ratings.length > 0) {
      return ratings.map((item, index) => ({
        id: index + 1,
        rating: item.rating?.toString() || "",
        connected_load: item.connected_load || ""
      }));
    }
    return [];
  }, [formData.cabinets]);

  // Handle CB ratings table data changes with proper data processing
  const handleCBRatingsChange = useCallback((cabinetIndex, equipmentType, newTableData) => {
    console.log(`Updating ${equipmentType} CB ratings for cabinet ${cabinetIndex}:`, newTableData);
    
    if (!newTableData || newTableData.length === 0) {
      // If no data, keep empty array but don't return early
      setFormData(prev => ({
        ...prev,
        cabinets: prev.cabinets.map((cabinet, index) =>
          index === cabinetIndex
            ? { ...cabinet, [`${equipmentType}CBsRatings`]: [] }
            : cabinet
        )
      }));
      return;
    }

    // Process and filter the data
    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const load = item.connected_load?.toString().trim() || '';
        return rating !== '' || load !== '';
      })
      .map(item => ({
        rating: parseFloat(item.rating) || 0,
        connected_load: item.connected_load || ""
      }));
    
    setFormData(prev => ({
      ...prev,
      cabinets: prev.cabinets.map((cabinet, index) =>
        index === cabinetIndex
          ? { ...cabinet, [`${equipmentType}CBsRatings`]: processedData }
          : cabinet
      )
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData for multipart submission
      const submitFormData = new FormData();
      
      // Add cabinet count
      submitFormData.append('numberOfCabinets', parseInt(formData.numberOfCabinets));

      // Add cabinet data as individual form fields
      formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).forEach((cabinet, index) => {
        Object.entries(cabinet).forEach(([key, value]) => {
          if (key !== 'images') {
            if (Array.isArray(value)) {
              submitFormData.append(`cabinets[${index}][${key}]`, JSON.stringify(value));
            } else {
              submitFormData.append(`cabinets[${index}][${key}]`, value || '');
            }
          }
        });
      });

      // Get all possible image fields
      const allImageFields = getAllImages();
      
      console.log("All image fields:", allImageFields);
      console.log("Uploaded images state:", uploadedImages);
      
      // Handle all image fields - including removed ones
      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        console.log(`Processing image field: ${imageField.name}`, imageFiles);
        
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            console.log(`Adding file for ${imageField.name}:`, file.name);
            submitFormData.append(imageField.name, file);
          } else {
            console.log(`Skipping non-File object for ${imageField.name}:`, file);
          }
        } else {
          // If image was removed or doesn't exist, send empty string
          console.log(`Adding empty string for ${imageField.name}`);
          submitFormData.append(imageField.name, '');
        }
      });

      console.log("Submitting outdoor cabinets data:");
      // Log FormData contents for debugging
      for (let pair of submitFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/outdoor-cabinets/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Server response:", response.data);
      
      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/outdoor-cabinets/${sessionId}`);
      const latestData = getResponse.data.data?.data || getResponse.data.data || getResponse.data;

      if (latestData) {
        // Merge API data with default structure
        const mergedCabinets = Array(10).fill(null).map((_, index) => {
          const apiCabinet = latestData.cabinets?.[index] || {};
          return {
            id: index + 1,
            type: Array.isArray(apiCabinet.type) ? apiCabinet.type : [],
            vendor: apiCabinet.vendor || '',
            model: apiCabinet.model || '',
            antiTheft: apiCabinet.antiTheft || '',
            coolingType: apiCabinet.coolingType || '',
            coolingCapacity: apiCabinet.coolingCapacity || '',
            compartments: apiCabinet.compartments || '',
            hardware: Array.isArray(apiCabinet.hardware) ? apiCabinet.hardware : [],
            acPowerFeed: apiCabinet.acPowerFeed || '',
            cbNumber: apiCabinet.cbNumber || '',
            powerCableLength: apiCabinet.powerCableLength || '',
            powerCableCrossSection: apiCabinet.powerCableCrossSection || '',
            blvd: apiCabinet.blvd || '',
            blvdFreeCBs: apiCabinet.blvdFreeCBs || '',
            blvdCBsRatings: Array.isArray(apiCabinet.blvdCBsRatings) ? apiCabinet.blvdCBsRatings : [],
            llvd: apiCabinet.llvd || '',
            llvdFreeCBs: apiCabinet.llvdFreeCBs || '',
            llvdCBsRatings: Array.isArray(apiCabinet.llvdCBsRatings) ? apiCabinet.llvdCBsRatings : [],
            pdu: apiCabinet.pdu || '',
            pduFreeCBs: apiCabinet.pduFreeCBs || '',
            pduCBsRatings: Array.isArray(apiCabinet.pduCBsRatings) ? apiCabinet.pduCBsRatings : [],
            internalLayout: apiCabinet.internalLayout || '',
            freeU: apiCabinet.freeU || ''
          };
        });

        setFormData({
          numberOfCabinets: latestData.numberOfCabinets || formData.numberOfCabinets,
          cabinets: mergedCabinets
        });

        // Process and update images
        if (latestData.cabinets && latestData.cabinets.some(cabinet => cabinet.images?.length > 0)) {
          const processedImages = processImagesFromResponse(latestData.cabinets);
          console.log("Processed images from response:", processedImages);
          setUploadedImages(processedImages);
        } else {
          console.log("No images found in response, clearing uploaded images");
          // Don't clear uploaded images completely, keep File objects for newly uploaded images
          const newUploadedImages = {};
          Object.entries(uploadedImages).forEach(([key, files]) => {
            if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
              newUploadedImages[key] = files;
            }
          });
          setUploadedImages(newUploadedImages);
        }
      }
      
      setHasUnsavedChanges(false); // Reset unsaved changes after successful save
      showSuccess('Outdoor cabinets data and images submitted successfully!');
    } catch (err) {
      console.error("Error submitting outdoor cabinets data:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

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

  const cabinetTypes = ['RAN', 'MW', 'Power', 'All in one', 'Other'];
  const vendors = ['Nokia', 'Ericsson', 'Huawei', 'ZTE', 'Eltek', 'Vertiv'];
  const models = [
    'Nokia AAOB', 'Nokia AAOA', 'Nokia ACOC', 'Huawei MTS', 'Huawei TP cabinet',
    'Huawei APM', 'Huawei TMC', 'Huawei Power Cube', 'Ericsson RBS 6120',
    'Ericsson RBS 6150', 'ZTE ZXDU68 W301', 'ZTE ZXDU68 W201', 'Other'
  ];
  const hardwareOptions = ['RAN', 'Transmission', 'DC rectifiers', 'Batteries', 'ODF', 'Empty cabinet', 'Other'];

  // Helper function to check if any cabinet has AC power feed
  const hasAnyACPowerFeed = () => {
    const activeCabinets = formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1);
    return activeCabinets.some(cabinet => cabinet.acPowerFeed === 'Yes');
  };

  // Helper function to check if any cabinet has BLVD
  const hasAnyBLVD = () => {
    const activeCabinets = formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1);
    return activeCabinets.some(cabinet => cabinet.blvd === 'Yes');
  };

  // Helper function to check if any cabinet has LLVD
  const hasAnyLLVD = () => {
    const activeCabinets = formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1);
    return activeCabinets.some(cabinet => cabinet.llvd === 'Yes');
  };

  // Helper function to check if any cabinet has PDU
  const hasAnyPDU = () => {
    const activeCabinets = formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1);
    return activeCabinets.some(cabinet => cabinet.pdu === 'Yes');
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
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

          {/* Number of Cabinets Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block font-semibold mb-2">How many cabinets existing on site?</label>
            <select
              name="numberOfCabinets"
              value={formData.numberOfCabinets}
              onChange={(e) => {
                console.log("Changing number of cabinets to:", e.target.value);
                console.log("Current formData.cabinets length:", formData.cabinets.length);
                console.log("First cabinet structure:", formData.cabinets[0]);
                setFormData(prev => ({ ...prev, numberOfCabinets: e.target.value }));
              }}
              className="border p-3 rounded-md w-48"
              required
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Table Layout */}
          <div className="overflow-auto max-h-[700px]">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th
                    className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-10"
                    style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                  >
                    Field Description
                  </th>
                  {Array.from({ length: parseInt(formData.numberOfCabinets) || 1 }, (_, i) => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[340px] sticky top-0 bg-blue-500 z-10"
                    >
                      Existing outdoor cabinet #{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Cabinet Type */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cabinet type
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.typeAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {cabinetTypes.map(type => (
                          <label key={type} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={cabinet.type.includes(type)}
                              onChange={(e) => handleCheckboxChange(cabinetIndex, 'type', type, e.target.checked)}
                              className={`w-4 h-4 ${cabinet.typeAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.typeAutoFilled ? colorFillAuto : ''}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cabinet Vendor */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cabinet vendor
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.vendorAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="grid grid-cols-3 gap-1">
                        {vendors.map(vendor => (
                          <label key={vendor} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`vendor-${cabinetIndex}`}
                              value={vendor}
                              checked={cabinet.vendor === vendor}
                              onChange={(e) => handleChange(cabinetIndex, 'vendor', e.target.value)}
                              className={`w-4 h-4 ${cabinet.vendorAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.vendorAutoFilled ? colorFillAuto : ''}>
                              {vendor}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cabinet Model */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cabinet model
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.modelAutoFilled ? bgColorFillAuto : ''}`}>
                      <select
                        value={cabinet.model}
                        onChange={(e) => handleChange(cabinetIndex, 'model', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${cabinet.modelAutoFilled ? colorFillAuto : ''}`}
                      >
                        <option value="">Select</option>
                        {models.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Anti Theft */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cabinet has anti theft?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.antiTheftAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`antiTheft-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.antiTheft === option}
                              onChange={(e) => handleChange(cabinetIndex, 'antiTheft', e.target.value)}
                              className={`w-4 h-4 ${cabinet.antiTheftAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.antiTheftAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cooling Type */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cooling type
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.coolingTypeAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="grid grid-cols-2 gap-1">
                        {['Air-condition', 'Fan-filter'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`coolingType-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.coolingType === option}
                              onChange={(e) => handleChange(cabinetIndex, 'coolingType', e.target.value)}
                              className={`w-4 h-4 ${cabinet.coolingTypeAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.coolingTypeAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cooling Capacity */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cooling capacity (watt)
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.coolingCapacityAutoFilled ? bgColorFillAuto : ''}`}>
                      <input
                        type="number"
                        value={cabinet.coolingCapacity}
                        onChange={(e) => handleChange(cabinetIndex, 'coolingCapacity', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${cabinet.coolingCapacityAutoFilled ? colorFillAuto : ''}`}
                        placeholder="0000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Compartments */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    How many compartment?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.compartmentsAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['1', '2'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`compartments-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.compartments === option}
                              onChange={(e) => handleChange(cabinetIndex, 'compartments', e.target.value)}
                              className={`w-4 h-4 ${cabinet.compartmentsAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.compartmentsAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Existing Hardware */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Existing hardware inside the cabinet
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.hardwareAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="grid grid-cols-2 gap-1">
                        {hardwareOptions.map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cabinet.hardware.includes(option)}
                              onChange={(e) => handleCheckboxChange(cabinetIndex, 'hardware', option, e.target.checked)}
                              className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${cabinet.hardwareAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.hardwareAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* AC Power Feed */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Does the cabinet has AC power feed from the main AC panel?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.acPowerFeedAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`acPowerFeed-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.acPowerFeed === option}
                              onChange={(e) => handleChange(cabinetIndex, 'acPowerFeed', e.target.value)}
                              className={`w-4 h-4 ${cabinet.acPowerFeedAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.acPowerFeedAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* CB Number - Only show if any cabinet has AC power feed */}
                {hasAnyACPowerFeed() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      what is the CB number in the AC panel?
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border px-2 py-2">
                        <select
                          value={cabinet.cbNumber}
                          onChange={(e) => handleChange(cabinetIndex, 'cbNumber', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          disabled={cabinet.acPowerFeed !== 'Yes'}
                        >
                          <option value="">Select</option>
                          {connectedModules.map((module, index) => (
                            <option key={index} value={module}>{module}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                )}

                {/* Power Cable Length - Only show if any cabinet has AC power feed */}
                {hasAnyACPowerFeed() && (
                  <tr >
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Length of power cable from the AC panel to the CB inside the cabinet (meter)
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={cabinet.powerCableLength}
                          onChange={(e) => handleChange(cabinetIndex, 'powerCableLength', e.target.value)}
                          className={`w-full p-2 border rounded text-sm ${cabinet.acPowerFeed !== 'Yes'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : ''
                            }`}
                          placeholder={cabinet.acPowerFeed === 'Yes' ? '000' : 'N/A'}
                          disabled={cabinet.acPowerFeed !== 'Yes'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* Power Cable Cross Section - Only show if any cabinet has AC power feed */}
                {hasAnyACPowerFeed() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Cross section of power cable from the AC panel to the CB inside the cabinet (mm)
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={cabinet.powerCableCrossSection}
                          onChange={(e) => handleChange(cabinetIndex, 'powerCableCrossSection', e.target.value)}
                          className={`w-full p-2 border rounded text-sm ${cabinet.acPowerFeed !== 'Yes'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : ''
                            }`}
                          placeholder={cabinet.acPowerFeed === 'Yes' ? '000' : 'N/A'}
                          disabled={cabinet.acPowerFeed !== 'Yes'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* BLVD */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Is there BLVD in the cabinet?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.blvdAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`blvd-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.blvd === option}
                              onChange={(e) => handleChange(cabinetIndex, 'blvd', e.target.value)}
                              className={`w-4 h-4 ${cabinet.blvdAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.blvdAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* BLVD Free CBs - Only show if any cabinet has BLVD */}
                {hasAnyBLVD() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Does the BLVD has free CBs?
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.blvdFreeCBsAutoFilled ? bgColorFillAuto : ''}`}>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className="flex items-center gap-1 text-sm">
                              <input
                                type="radio"
                                name={`blvdFreeCBs-${cabinetIndex}`}
                                value={option}
                                checked={cabinet.blvdFreeCBs === option}
                                onChange={(e) => handleChange(cabinetIndex, 'blvdFreeCBs', e.target.value)}
                                className={`w-4 h-4 ${cabinet.blvdFreeCBsAutoFilled ? colorFillAuto : ''}`}
                                disabled={cabinet.blvd !== 'Yes'}
                              />
                              <span className={cabinet.blvd !== 'Yes' ? 'text-gray-400' : cabinet.blvdFreeCBsAutoFilled ? colorFillAuto : ''}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* BLVD CBs Ratings - Only show if any cabinet has BLVD */}
                {hasAnyBLVD() && (
                  <tr className="bg-gray-50">
                    <td className="border px-4  font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Existing BLVD CBs ratings & connected loads
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border">
                        {cabinet.blvd === 'Yes' ? (
                          <div className="">
                            <DynamicTable
                              key={`blvd-${cabinetIndex}-${cabinet.blvdCBsRatings?.length || 0}`}
                              title=""
                              rows={cbRatingsTableRows}
                              initialData={getCBRatingsTableData(cabinetIndex, 'blvd')}
                              onChange={(newData) => handleCBRatingsChange(cabinetIndex, 'blvd', newData)}
                              minColumns={1}
                              autoExpand={true}
                              enableDragDrop={true}
                              enableDelete={true}
                              className=""
                              tableClassName="w-full border border-gray-300"
                              headerClassName="bg-gray-200"
                              cellClassName="border px-2 py-2"
                              labelClassName="border px-2 py-2 font-semibold bg-gray-50 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm p-4 text-center">
                            N/A (No BLVD)
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* LLVD */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Is there LLVD in the cabinet?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.llvdAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`llvd-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.llvd === option}
                              onChange={(e) => handleChange(cabinetIndex, 'llvd', e.target.value)}
                              className={`w-4 h-4 ${cabinet.llvdAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.llvdAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* LLVD Free CBs - Only show if any cabinet has LLVD */}
                {hasAnyLLVD() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Does the LLVD has free CBs?
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.llvdFreeCBsAutoFilled ? bgColorFillAuto : ''}`}>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className="flex items-center gap-1 text-sm">
                              <input
                                type="radio"
                                name={`llvdFreeCBs-${cabinetIndex}`}
                                value={option}
                                checked={cabinet.llvdFreeCBs === option}
                                onChange={(e) => handleChange(cabinetIndex, 'llvdFreeCBs', e.target.value)}
                                className={`w-4 h-4 ${cabinet.llvdFreeCBsAutoFilled ? colorFillAuto : ''}`}
                                disabled={cabinet.llvd !== 'Yes'}
                              />
                              <span className={cabinet.llvd !== 'Yes' ? 'text-gray-400' : cabinet.llvdFreeCBsAutoFilled ? colorFillAuto : ''}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* LLVD CBs Ratings - Only show if any cabinet has LLVD */}
                {hasAnyLLVD() && (
                  <tr className="bg-gray-50">
                    <td className="border px-4  font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Existing LLVD CBs ratings & connected loads
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border">
                        {cabinet.llvd === 'Yes' ? (
                          <div className="">
                            <DynamicTable
                              key={`llvd-${cabinetIndex}-${cabinet.llvdCBsRatings?.length || 0}`}
                              title=""
                              rows={cbRatingsTableRows}
                              initialData={getCBRatingsTableData(cabinetIndex, 'llvd')}
                              onChange={(newData) => handleCBRatingsChange(cabinetIndex, 'llvd', newData)}
                              minColumns={1}
                              autoExpand={true}
                              enableDragDrop={true}
                              enableDelete={true}
                              className=""
                              tableClassName="w-full border border-gray-300"
                              headerClassName="bg-gray-200"
                              cellClassName="border px-2 py-2"
                              labelClassName="border px-2 py-2 font-semibold bg-gray-50 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm p-4 text-center">
                            N/A (No LLVD)
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* PDU */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Is there PDU in the cabinet?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.pduAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`pdu-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.pdu === option}
                              onChange={(e) => handleChange(cabinetIndex, 'pdu', e.target.value)}
                              className={`w-4 h-4 ${cabinet.pduAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.pduAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* PDU Free CBs - Only show if any cabinet has PDU */}
                {hasAnyPDU() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Does the PDU has free CBs?
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.pduFreeCBsAutoFilled ? bgColorFillAuto : ''}`}>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className="flex items-center gap-1 text-sm">
                              <input
                                type="radio"
                                name={`pduFreeCBs-${cabinetIndex}`}
                                value={option}
                                checked={cabinet.pduFreeCBs === option}
                                onChange={(e) => handleChange(cabinetIndex, 'pduFreeCBs', e.target.value)}
                                className={`w-4 h-4 ${cabinet.pduFreeCBsAutoFilled ? colorFillAuto : ''}`}
                                disabled={cabinet.pdu !== 'Yes'}
                              />
                              <span className={cabinet.pdu !== 'Yes' ? 'text-gray-400' : cabinet.pduFreeCBsAutoFilled ? colorFillAuto : ''}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}

                {/* PDU CBs Ratings - Only show if any cabinet has PDU */}
                {hasAnyPDU() && (
                  <tr className="bg-gray-50">
                    <td className="border px-4  font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Existing PDU CBs ratings & connected loads
                    </td>
                    {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                      <td key={cabinetIndex} className="border">
                        {cabinet.pdu === 'Yes' ? (
                          <div className="">
                            <DynamicTable
                              key={`pdu-${cabinetIndex}-${cabinet.pduCBsRatings?.length || 0}`}
                              title=""
                              rows={cbRatingsTableRows}
                              initialData={getCBRatingsTableData(cabinetIndex, 'pdu')}
                              onChange={(newData) => handleCBRatingsChange(cabinetIndex, 'pdu', newData)}
                              minColumns={1}
                              autoExpand={true}
                              enableDragDrop={true}
                              enableDelete={true}
                              className=""
                              tableClassName="w-full border border-gray-300"
                              headerClassName="bg-gray-200"
                              cellClassName="border px-2 py-2"
                              labelClassName="border px-2 py-2 font-semibold bg-gray-50 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm p-4 text-center">
                            N/A (No PDU)
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Internal Layout */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Internal cabinet layout suitable for the installation of new Nokia base band? 19'' rack, internal spacing...
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.internalLayoutAutoFilled ? bgColorFillAuto : ''}`}>
                      <div className="grid grid-cols-1 gap-1">
                        {['Yes', 'No', 'Yes, with some modifications'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`internalLayout-${cabinetIndex}`}
                              value={option}
                              checked={cabinet.internalLayout === option}
                              onChange={(e) => handleChange(cabinetIndex, 'internalLayout', e.target.value)}
                              className={`w-4 h-4 ${cabinet.internalLayoutAutoFilled ? colorFillAuto : ''}`}
                            />
                            <span className={cabinet.internalLayoutAutoFilled ? colorFillAuto : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Free U */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    How many free 19'' U available for telecom hardware installation?
                  </td>
                  {formData.cabinets.slice(0, parseInt(formData.numberOfCabinets) || 1).map((cabinet, cabinetIndex) => (
                    <td key={cabinetIndex} className={`border px-2 py-2 ${cabinet.freeUAutoFilled ? bgColorFillAuto : ''}`}>
                      <input
                        type="number"
                        value={cabinet.freeU}
                        onChange={(e) => handleChange(cabinetIndex, 'freeU', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${cabinet.freeUAutoFilled ? colorFillAuto : ''}`}
                        placeholder="00"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
        images={getAllImages()} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default OutdoorCabinetsForm;

