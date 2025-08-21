import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import DynamicTable from "../../DynamicTable";
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const DcDistributionForm = () => {
  const { sessionId } = useParams();
  const [dcPduExist, setDcPduExist] = useState(null);
  const [pduCount, setPduCount] = useState("");
  const [pdus, setPdus] = useState([]);
  const [error, setError] = useState("");
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [uploadedImages, setUploadedImages] = useState({});
  // Add state for CB options for each PDU
  const [cbOptions, setCbOptions] = useState({});
  const [loadingCbOptions, setLoadingCbOptions] = useState({});
  // Add state to track auto-filled fields

  
  // Add state to track form changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);
  const [loadingApi,setLoadingApi] =useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      // Basic validation
      if (!dcPduExist) {
        setError("Please select if there is a separate DC PDU.");
        return false;
      }

      if (dcPduExist === "Yes" && !pduCount) {
        setError("Please select the number of PDUs.");
        return false;
      }

      // Prepare data wrapped in externalDCData for API
      const submitData = {
        externalDCData: {
          has_separate_dc_pdu: dcPduExist,
          how_many_dc_pdus: dcPduExist === "Yes" ? parseInt(pduCount) : 0,
          dc_pdus: dcPduExist === "Yes" ? pdus.map((pdu, index) => ({
            pdu_number: index + 1,
            is_shared_panel: pdu.shared || null,
            dc_distribution_model: pdu.model || null,
            dc_distribution_location: pdu.location || null,
            pdu_height_from_base: pdu.location === "On ground level" ? null : (parseFloat(pdu.towerBaseHeight) || null),
            dc_feed_cabinet: pdu.feedCabinet || null,
            dc_feed_distribution_type: pdu.feedDistribution ? pdu.feedDistribution.toLowerCase() : null,
            feeding_dc_cbs: pdu.model === "Nokia FPFH" ? (Array.isArray(pdu.cbFuse) ? pdu.cbFuse : [pdu.cbFuse].filter(Boolean)) : (pdu.cbFuse || null),
            dc_feed_cabinet_source: pdu.dcFeedCabinet || null,
            dc_cable_length: parseFloat(pdu.dc_cable_length) || null,
            dc_cable_cross_section: parseFloat(pdu.cableCrossSection) || null,
            has_free_cbs_fuses: pdu.hasFreeCbs || null,
            cb_fuse_ratings: pdu.cbDetails ? pdu.cbDetails.filter(r => r.rating && r.connected_module).map(r => ({
              rating: parseFloat(r.rating) || 0,
              connected_load: r.connected_module
            })) : []
          })) : []
        }
      };

      // Check if we have any images to upload
      const allImageFields = getAllImages;
      const hasImages = allImageFields.some(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        return Array.isArray(imageFiles) && imageFiles.length > 0 && imageFiles[0] instanceof File;
      });

      let response;
      
      if (hasImages) {
        // Create FormData for multipart submission when images are present
        const submitFormData = new FormData();
        
        // Append the main data as individual FormData fields
        Object.keys(submitData.externalDCData).forEach(key => {
          const value = submitData.externalDCData[key];
          if (typeof value === 'object' && value !== null) {
            submitFormData.append(key, JSON.stringify(value));
          } else {
            submitFormData.append(key, value);
          }
        });

        // Handle all image fields - including removed ones
        allImageFields.forEach(imageField => {
          const imageFiles = uploadedImages[imageField.name];
          
          if (Array.isArray(imageFiles) && imageFiles.length > 0) {
            const file = imageFiles[0];
            if (file instanceof File) {
              submitFormData.append(imageField.name, file);
            }
          } else {
            // If image was removed or doesn't exist, send empty string
            submitFormData.append(imageField.name, '');
          }
        });
        
        // Submit as multipart/form-data
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`,
          submitFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Submit as JSON when no images
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`,
          submitData,
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      
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
         
  // Function to get current form state
  const getCurrentFormState = useCallback(() => {
    return {
      dcPduExist,
      pduCount,
      pdus,
      uploadedImages
    };
  }, [dcPduExist, pduCount, pdus, uploadedImages]);

  // Function to compare form states
  const hasFormChanged = useCallback((current, initial) => {
    if (!initial) return false;
    return JSON.stringify(current) !== JSON.stringify(initial);
  }, []);

  const bgColorFillAuto="bg-[#c6efce]"
  const colorFillAuto='text-[#006100]'
  // Track form changes
  useEffect(() => {
    if (initialFormState && !isInitialLoading) {
      const currentState = getCurrentFormState();
      const changed = hasFormChanged(currentState, initialFormState);
      setHasUnsavedChanges(changed);
    }
  }, [dcPduExist, pduCount, pdus, uploadedImages, initialFormState, getCurrentFormState, hasFormChanged, isInitialLoading]);

  // Set initial form state when data is loaded
  useEffect(() => {
    if (dcPduExist !== null && !initialFormState && !isInitialLoading) {
      setInitialFormState(getCurrentFormState());
    }
  }, [dcPduExist, initialFormState, getCurrentFormState, isInitialLoading]);

  // Add warning for page navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    // Add event listener for browser navigation
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Add event listener for React Router navigation
    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        const userConfirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave this page? All unsaved data will be lost.'
        );
        if (!userConfirmed) {
          // Push current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Function to fetch CB options for a specific PDU
  const fetchCbOptions = useCallback(async (pduIndex, feedCabinet, feedDistribution) => {
    if (!feedCabinet || !feedDistribution) {
      // Clear options if no valid selections
      setCbOptions(prev => ({
        ...prev,
        [pduIndex]: []
      }));
      return;
    }

    // Extract cabinet number from selection like "Existing cabinet #1"
    const cabinetMatch = feedCabinet.match(/Existing cabinet #(\d+)/);
    const cabinetNumber = cabinetMatch ? cabinetMatch[1] : null;
    
    if (!cabinetNumber) {
      // Clear options if no valid cabinet number
      setCbOptions(prev => ({
        ...prev,
        [pduIndex]: []
      }));
      return;
    }

    const optionsKey = `${pduIndex}`;
    setLoadingCbOptions(prev => ({ ...prev, [optionsKey]: true }));

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/external-dc-distribution/cabinet-data/${sessionId}/${cabinetNumber}/${feedDistribution}`
      );
      
      const data = response.data;
      const cabinetData = data.data || [];
      
      // Transform cabinet data to options format
      const transformedOptions = cabinetData.map(item => ({
        id: `field_${item.field_number}`,
        field_number: item.field_number,
        cb_rating_amp: item.cb_rating_amp,
        connected_load: item.connected_load,
        value: `CB${item.field_number}`,
        display_text: `CB${item.field_number} - ${item.cb_rating_amp}A - ${item.connected_load}`,
        recommended: false // You can add logic here if needed
      }));

      setCbOptions(prev => ({
        ...prev,
        [pduIndex]: transformedOptions
      }));
    } catch (err) {
      console.error("Error fetching CB options:", err);
      // Set empty options on error
      setCbOptions(prev => ({
        ...prev,
        [pduIndex]: []
      }));
    } finally {
      setLoadingCbOptions(prev => ({ ...prev, [optionsKey]: false }));
    }
  }, [sessionId]);

  // Function to get CB options for a specific PDU
  const getCbOptionsForPdu = useCallback((pduIndex) => {
    return cbOptions[pduIndex] || [];
  }, [cbOptions]);

  // Function to check if CB options are loading for a PDU
  const isCbOptionsLoading = useCallback((pduIndex) => {
    return loadingCbOptions[pduIndex] || false;
  }, [loadingCbOptions]);

  // Function to check if a field is auto-filled


  const handlePduCountChange = (count) => {
    const countValue = count.toString();
    setPduCount(countValue);
    
    // Create new PDUs array preserving existing data
    const newPdus = Array.from({ length: count }, (_, index) => {
      // If PDU already exists at this index, keep its data
      if (pdus[index]) {
        return { ...pdus[index] };  // Create a new object to avoid reference issues
      }
      // Otherwise create new empty PDU
      return {
        shared: "",
        model: "",
        location: "",
        towerBaseHeight: "",
        feedCabinet: "",
        feedDistribution: "",
        cbFuse: "",
        dc_cable_length: "",
        cableCrossSection: "",
        hasFreeCbs: "",
        cbDetails: Array.from({ length: 3 }, () => ({ rating: "", connected_module: "" })),
      };
    });
    
    setPdus(newPdus);
    
    // Update uploadedImages state to match new PDU count
    const newUploadedImages = { ...uploadedImages };
    // Remove image entries for PDUs that no longer exist
    Object.keys(newUploadedImages).forEach(key => {
      const pduNumberMatch = key.match(/pdu_(\d+)_/);
      if (pduNumberMatch) {
        const pduNumber = parseInt(pduNumberMatch[1]);
        if (pduNumber > count) {
          delete newUploadedImages[key];
        }
      }
    });
    setUploadedImages(newUploadedImages);
    
    // Clear CB options for PDUs that are being removed (beyond the new count)
    if (count < pdus.length) {
      const newCbOptions = { ...cbOptions };
      const newLoadingCbOptions = { ...loadingCbOptions };
      
      for (let i = count; i < pdus.length; i++) {
        delete newCbOptions[i];
        delete newLoadingCbOptions[i];
      }
      
      setCbOptions(newCbOptions);
      setLoadingCbOptions(newLoadingCbOptions);
    }
  };

  // Helper function to check if a value is empty
  const isEmptyValue = useCallback((value) => {
    return value === "" || value === null || value === undefined;
  }, []);

  const updatePdu = (index, field, value) => {
    const updated = [...pdus];
    
    // Update the changed PDU first
    updated[index] = {
      ...updated[index],
      [field]: value,
      [`${field}AutoFilled`]: false // The changed field is not auto-filled
    };
    
    // Auto-fill logic for all PDUs (skip cbFuse and dcFeedCabinet)
    if (field !== 'cbFuse' && field !== 'dcFeedCabinet') {
      const numPdus = parseInt(pduCount) || 1;
      
      // Auto-fill empty fields in other PDUs
      for (let i = 0; i < numPdus; i++) {
        if (i !== index) { // Skip the PDU that was manually changed
          // Only auto-fill if the field is empty or was previously auto-filled
          if (!updated[i][field] || updated[i][`${field}AutoFilled`]) {
            updated[i] = {
              ...updated[i],
              [field]: value,
              [`${field}AutoFilled`]: true
            };
          }
        }
      }
    }
    
    // Clear cbFuse if model is not Nokia FPFH
    if (field === 'model' && value !== "Nokia FPFH") {
      updated[index].cbFuse = [];
    }
    
    // Clear CB selection and fetch new options when cabinet or distribution changes
    if (field === 'feedCabinet' || field === 'feedDistribution') {
      updated[index].cbFuse = []; // Clear current CB selection (now an array)
      
      const cabinet = field === 'feedCabinet' ? value : updated[index].feedCabinet;
      const distribution = field === 'feedDistribution' ? value : updated[index].feedDistribution;
      
      if (cabinet && distribution) {
        setTimeout(() => {
          fetchCbOptions(index, cabinet, distribution);
        }, 100);
      } else {
        setCbOptions(prev => ({
          ...prev,
          [index]: []
        }));
      }
    }
    
    setPdus(updated);
    setHasUnsavedChanges(true);
  };

  const updatePduCheckbox = (index, field, value, checked) => {
    setHasUnsavedChanges(true);
    setPdus(prevPdus => {
      const newPdus = [...prevPdus];
      const currentValues = newPdus[index][field] || [];
      
      if (checked) {
        // Add value if not already present
        if (!currentValues.includes(value)) {
          newPdus[index] = { 
            ...newPdus[index], 
            [field]: [...currentValues, value] 
          };
        }
      } else {
        // Remove value if present
        newPdus[index] = { 
          ...newPdus[index], 
          [field]: currentValues.filter(v => v !== value) 
        };
      }
      
      return newPdus;
    });
  };

  // Update handleTableDataChange to follow the same pattern
  const handleTableDataChange = useCallback((pduIndex, newData) => {
    if (!newData || newData.length === 0) {
      return;
    }

    const processedData = newData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: item.rating || "",
        connected_module: item.connected_module || ""
      }));

    const updated = [...pdus];
    
    // Update the current PDU first
    updated[pduIndex] = {
      ...updated[pduIndex],
      cbDetails: processedData,
      cbDetailsAutoFilled: false // The changed field is not auto-filled
    };
    
    // Auto-fill empty table data to other PDUs
    const numPdus = parseInt(pduCount) || 1;
    for (let i = 0; i < numPdus; i++) {
      if (i !== pduIndex) { // Skip the PDU that was manually changed
        // Only auto-fill if the field is empty or was previously auto-filled
        const currentDetails = updated[i].cbDetails || [];
        const isEmpty = currentDetails.length === 0 || currentDetails.every(detail => 
          isEmptyValue(detail.rating) && isEmptyValue(detail.connected_module)
        );
        
        if (isEmpty || updated[i].cbDetailsAutoFilled) {
          updated[i] = {
            ...updated[i],
            cbDetails: [...processedData],
            cbDetailsAutoFilled: true
          };
        }
      }
    }
    
    setPdus(updated);
    setHasUnsavedChanges(true);
  }, [pdus, pduCount, isEmptyValue]);

  // Generate image fields for a single PDU
  const getPduImages = (pduNumber) => {
    const pduIndex = pduNumber - 1; // Convert to 0-based index
    const pdu = pdus[pduIndex];
    
    const baseImages = [
      { label: `PDU #${pduNumber} photo`, name: `pdu_${pduNumber}_photo` },
      { label: `PDU #${pduNumber} fuses photo`, name: `pdu_${pduNumber}_fuses` },
      { label: `PDU #${pduNumber} existing PDU Power cables photo`, name: `pdu_${pduNumber}_existing_pdu_power_cables_photo` },
    ];

    // Only include tower-related images if location is "On tower"
    if (pdu && pdu.location === "On tower") {
      baseImages.push(
        { label: `PDU #${pduNumber} Cables route photo from tower top 1/2`, name: `pdu_${pduNumber}_cables_route_photo_from_tower_top_1` },
        { label: `PDU #${pduNumber} Cables route photo from tower top 2/2`, name: `pdu_${pduNumber}_cables_route_photo_from_tower_top_2` }
      );
    }

    return baseImages;
  };

  // Generate all image fields based on PDU count
  const getAllImages = useMemo(() => {
    if (!pduCount) return [];
    const count = parseInt(pduCount);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getPduImages(i)];
    }
    return allImages;
  }, [pduCount, pdus]); // Depend on pdus to react to location changes

  // Process images from API response
  const processImagesFromResponse = (pdus) => {
    const imagesByCategory = {};
    
    pdus.forEach(pdu => {
      if (pdu.images && Array.isArray(pdu.images)) {
        pdu.images.forEach(img => {
          // Each image should be an object with the required properties
          imagesByCategory[img.image_category] = [{
            id: img.id,
            file_url: img.file_url,  // The full URL path will be handled by ImageUploader
            name: img.original_filename
          }];
        });
      }
    });
    
    return imagesByCategory;
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`)
      .then(res => {
        const apiResponse = res.data.data || res.data;
        console.log("Fetched External DC Distribution data:", apiResponse);

        if (apiResponse && apiResponse.externalDCData) {
          const ext = apiResponse.externalDCData;
          const apiPduCount = ext.how_many_dc_pdus || 0;
          const dcPdus = ext.dc_pdus || [];
          // Determine if PDUs exist (treat any saved PDUs as Yes)
          const hasPdus = apiPduCount > 0 && dcPdus.length > 0;

          // Set main form fields
          setNumberOfCabinets(apiResponse.numberOfCabinets || 0);
          setDcPduExist(hasPdus ? "Yes" : (ext.has_separate_dc_pdu || "No"));

          if (hasPdus) {
            // Set PDU count first
            setPduCount(apiPduCount.toString());
            // Map API PDUs to component state
            const processedPdus = dcPdus.map((pdu) => ({
              shared: pdu.is_shared_panel || "",
              model: pdu.dc_distribution_model || "",
              location: pdu.dc_distribution_location || "",
              towerBaseHeight: pdu.pdu_height_from_base?.toString() || "",
              feedCabinet: pdu.dc_feed_cabinet || "",
              feedDistribution: pdu.dc_feed_distribution_type 
                ? mapDistributionTypeFromApi(pdu.dc_feed_distribution_type) 
                : "",
              cbFuse: pdu.dc_distribution_model === "Nokia FPFH" 
                ? (Array.isArray(pdu.feeding_dc_cbs) ? pdu.feeding_dc_cbs : (pdu.feeding_dc_cbs ? [pdu.feeding_dc_cbs] : []))
                : (pdu.feeding_dc_cbs || ""),
              dcFeedCabinet: pdu.dc_feed_cabinet_source || "",
              dc_cable_length: pdu.dc_cable_length?.toString() || "",
              cableCrossSection: pdu.dc_cable_cross_section || "",
              hasFreeCbs: pdu.has_free_cbs_fuses || "",
              cbDetails: Array.isArray(pdu.cb_fuse_ratings)
                ? pdu.cb_fuse_ratings.map(rating => ({
                    rating: rating.rating?.toString() || "",
                    connected_module: rating.connected_load || ""
                  }))
                : []
            }));
            console.log("Processed PDUs:", processedPdus);
            setPdus(processedPdus);

            // Process and set images from the response
            if (dcPdus.some(pdu => pdu.images?.length > 0)) {
              const processedImages = processImagesFromResponse(dcPdus);
              console.log("Processed images:", processedImages);
              setUploadedImages(processedImages);
            }
          }
        }
      })
      .catch(err => {
        console.error("Error loading External DC Distribution data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, [sessionId, fetchCbOptions]);


  const tableRows = [
    {
      key: 'rating',
      label: 'rating (Amp)',
      type: 'number',
      placeholder: 'Add rating...'
    },
    {
      key: 'connected_module',
      label: 'module',
      type: 'textarea',
      placeholder: 'Module name'
    }
  ];

  const getTableData = useCallback((pduIndex) => {
    if (pdus[pduIndex] && pdus[pduIndex].cbDetails && pdus[pduIndex].cbDetails.length > 0) {
      return pdus[pduIndex].cbDetails.map((item, index) => ({
        id: index + 1,
        rating: item.rating?.toString() || "",
        connected_module: item.connected_module || ""
      }));
    }
    return [];
  }, [pdus]);

  const images = [
    { label: 'DC Distribution Overview Photo', name: 'dc_distribution_overview_photo' },
    { label: 'DC PDU Detail Photo', name: 'dc_pdu_detail_photo' },
    { label: 'DC Cable Installation Photo', name: 'dc_cable_installation_photo' },
  ];
  
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    console.log(`Generated ${options.length} cabinet options:`, options);
    return options;
  };
  const cabinetOptions = generateCabinetOptions();

  // Function to map form distribution types to API values
  const mapDistributionTypeToApi = (formValue) => {
    const distributionTypeMapping = {
      'BLVD': 'BLVD-48V',           // Try with voltage specification
      'LLVD': 'LLVD-48V',           // Try with voltage specification
      'PDU': 'DC_PDU'               // Try with underscore
    };
    return distributionTypeMapping[formValue] || formValue;
  };

  // Function to map API distribution types back to form values
  const mapDistributionTypeFromApi = (apiValue) => {
    const distributionTypeMapping = {
      'BLVD-48V': 'BLVD',
      'LLVD-48V': 'LLVD',
      'DC_PDU': 'PDU',
      'blvd': 'BLVD',               // Keep backward compatibility
      'llvd': 'LLVD',
      'pdu': 'PDU'
    };
    return distributionTypeMapping[apiValue] || apiValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('External DC Distribution data submitted successfully!');
        setError(""); // Clear any previous errors

        
        // Update initial form state
        setInitialFormState(getCurrentFormState());
      }
    } catch (err) {
      console.error("Error submitting External DC Distribution data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
        <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
   
       

          
          {/* Unsaved Changes Indicator */}
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Radio: Is there a separate PDU? */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Is there separate DC PDU feeding the radio units, baseband & other equipment?
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dcPduExist"
                    value={option}
                    checked={dcPduExist === option}
                    onChange={() => {
                      setDcPduExist(option);
                      if (option === "No") {
                        setPduCount("");
                        setPdus([]);
                      }
                      setError(""); // Clear error when user makes selection
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>


          {/* Drop-down: How many */}
          {dcPduExist === "Yes" && (
            <div className="flex flex-col mb-5">
              <label className="font-semibold mb-1">How many?</label>
              <select
                value={pduCount}
                onChange={(e) => {
                  const value = e.target.value;
                  handlePduCountChange(value ? parseInt(value) : 0);
                  setError(""); // Clear error when user makes selection
                }}
                className="form-input"
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PDU Details */}
          {/* Dynamic DC PDU Table */}
         
          {pduCount && parseInt(pduCount) > 0 && pdus.length > 0 && (
            <div className="flex-1 overflow-y-auto">
            
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th
                        className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-20"
                        style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                      >
                        Field Description
                      </th>
                      {Array.from({ length: parseInt(pduCount) }, (_, i) => (
                        <th
                          key={i}
                          className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-10"
                        >
                          DC PDU #{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Shared panel */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Is this a shared panel with other operator?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.sharedAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${pdu.sharedAutoFilled ? colorFillAuto : ''}`}>
                            {["Yes", "No"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.shared === opt}
                                  onChange={() => updatePdu(pduIndex, "shared", opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Model */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        What is the model of this DC distribution module?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.modelAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className={`grid grid-cols-2 gap-1 ${pdu.modelAutoFilled ? colorFillAuto : ''}`}>
                            {["Nokia FPFH", "Nokia FPFD", "DC panel", "Other"].map((model) => (
                              <label key={model} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.model === model}
                                  onChange={() => updatePdu(pduIndex, "model", model)}
                                />
                                {model}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Location */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Where is this DC module located?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.locationAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${pdu.locationAutoFilled ? colorFillAuto : ''}`}>
                            {["On ground level", "On tower"].map((loc) => (
                              <label key={loc} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.location === loc}
                                  onChange={() => updatePdu(pduIndex, "location", loc)}
                                />
                                {loc}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Tower base height */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC PDU base height from tower base level (meter)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.towerBaseHeightAutoFilled ? bgColorFillAuto : ''}`}>
                          {pdu.location === "On tower" ? (
                            <input
                              type="number" 
min={0}
                              className={`w-full p-2 border rounded text-sm ${pdu.towerBaseHeightAutoFilled ? colorFillAuto : ''}`}
                              value={pdu.towerBaseHeight}
                              onChange={(e) => updatePdu(pduIndex, "towerBaseHeight", e.target.value)}
                              placeholder="Enter height..."
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">N/A (On ground level)</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Cabinet source */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC feed is coming from which cabinet?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.feedCabinetAutoFilled ? bgColorFillAuto : ''}`}>
                          <select
                            value={pdu.feedCabinet}
                            onChange={(e) => updatePdu(pduIndex, "feedCabinet", e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${pdu.feedCabinetAutoFilled ? colorFillAuto : ''}`}
                          >
                            <option value="">-- Select --</option>
                            {cabinetOptions.map((cabinet) => (
                              <option key={cabinet} value={cabinet}>{cabinet}</option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* DC distribution source */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC feed is coming from which DC distribution inside the cabinet?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.feedDistributionAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${pdu.feedDistributionAutoFilled ? colorFillAuto : ''}`}>
                            {["BLVD", "LLVD", "PDU"].map((dist) => (
                              <label key={dist} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.feedDistribution === dist}
                                  onChange={() => updatePdu(pduIndex, "feedDistribution", dist)}
                                />
                                {dist}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* CB/Fuse feeding PDU */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Which DC CB/fuse is feeding the PDU?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => {
                        const cbOptionsForPdu = getCbOptionsForPdu(pduIndex);
                        const isLoading = isCbOptionsLoading(pduIndex);
                        const hasOptions = cbOptionsForPdu.length > 0;
                        const canShowOptions = pdu.feedCabinet && pdu.feedDistribution;
                        const isNokiaFpfh = pdu.model === "Nokia FPFH";
                        
                        return (
                          <td key={pduIndex} className="border px-2 py-2">
                            {isNokiaFpfh ? (
                              <div className="space-y-2">
                                {hasOptions && cbOptionsForPdu.map((option) => (
                                  <label key={option.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={Array.isArray(pdu.cbFuse) && pdu.cbFuse.includes(option.value)}
                                      onChange={(e) => updatePduCheckbox(pduIndex, "cbFuse", option.value, e.target.checked)}
                                      disabled={isLoading || !canShowOptions}
                                    />
                                    <span className={`${option.recommended ? "font-semibold" : ""}`}>
                                      {option.display_text}
                                    </span>
                                  </label>
                                ))}
                                
                                {!hasOptions && canShowOptions && !isLoading && (
                                  <div className="text-gray-500 text-sm">No options available</div>
                                )}
                                
                                {!canShowOptions && (
                                  <div className="text-gray-400 text-sm">Select cabinet and distribution first</div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {hasOptions && cbOptionsForPdu.map((option) => (
                                  <label key={option.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="radio"
                                      name={`cbFuse-${pduIndex}`}
                                      checked={pdu.cbFuse === option.value}
                                      onChange={() => updatePdu(pduIndex, "cbFuse", option.value)}
                                      disabled={isLoading || !canShowOptions}
                                    />
                                    <span className={`${option.recommended ? "font-semibold" : ""}`}>
                                      {option.display_text}
                                    </span>
                                  </label>
                                ))}
                                
                                {!hasOptions && canShowOptions && !isLoading && (
                                  <div className="text-gray-500 text-sm">No options available</div>
                                )}
                                
                                {!canShowOptions && (
                                  <div className="text-gray-400 text-sm">Select cabinet and distribution first</div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Cable length */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Length of DC power cable (m)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.dc_cable_lengthAutoFilled ? bgColorFillAuto : ''}`}>
                          <input
                            type="number" 
min={0}
                            className={`w-full p-2 border rounded text-sm ${pdu.dc_cable_lengthAutoFilled ? colorFillAuto : ''}`}
                            value={pdu.dc_cable_length}
                            onChange={(e) => updatePdu(pduIndex, "dc_cable_length", e.target.value)}
                            placeholder="Enter length..."
                          />
                        </td>
                      ))}
                    </tr>

                    {/* Cable cross-section */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Cross section of DC cable (mm²)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.cableCrossSectionAutoFilled ? bgColorFillAuto : ''}`}>
                          <input
                            type="number" 
min={0}
                            className={`w-full p-2 border rounded text-sm ${pdu.cableCrossSectionAutoFilled ? colorFillAuto : ''}`}
                            value={pdu.cableCrossSection}
                            onChange={(e) => updatePdu(pduIndex, "cableCrossSection", e.target.value)}
                            placeholder="Enter cross section..."
                          />
                        </td>
                      ))}
                    </tr>

                    {/* Free CBs */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Does the DC PDU have free CBs/Fuses?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.hasFreeCbsAutoFilled ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${pdu.hasFreeCbsAutoFilled ? colorFillAuto : ''}`}>
                            {["Yes", "No"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.hasFreeCbs === opt}
                                  onChange={() => updatePdu(pduIndex, "hasFreeCbs", opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* CB/Fuse Details Table */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Ratings of DC CBs/Fuses in the PDU
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className={`border px-2 py-2 ${pdu.cbDetailsAutoFilled ? bgColorFillAuto : ''}`}>
                          <DynamicTable
                            title=""
                            rows={tableRows}
                            initialData={getTableData(pduIndex)}
                            onChange={(newData) => handleTableDataChange(pduIndex, newData)}
                            minColumns={1}
                            autoExpand={true}
                            enableDragDrop={true}
                            enableDelete={true}
                            className=""
                            tableClassName="w-full border border-gray-300"
                            headerClassName="bg-gray-200"
                            cellClassName="border px-2 py-2"
                            labelClassName="border px-4 py-2 font-semibold bg-gray-50"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
           
          )}
           
        
          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading...": "Save"}     
            </button>
          </div>
   
        </form>
      </div>
      <ImageUploader 
        images={getAllImages} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default DcDistributionForm;
