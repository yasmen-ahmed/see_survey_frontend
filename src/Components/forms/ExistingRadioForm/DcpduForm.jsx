import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import DynamicTable from "../../DynamicTable";

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
  const [autoFilledFields, setAutoFilledFields] = useState({});
  
  // Add state to track form changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);

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
    if (initialFormState) {
      const currentState = getCurrentFormState();
      const changed = hasFormChanged(currentState, initialFormState);
      setHasUnsavedChanges(changed);
    }
  }, [dcPduExist, pduCount, pdus, uploadedImages, initialFormState, getCurrentFormState, hasFormChanged]);

  // Set initial form state when data is loaded
  useEffect(() => {
    if (dcPduExist !== null && !initialFormState) {
      setInitialFormState(getCurrentFormState());
    }
  }, [dcPduExist, initialFormState, getCurrentFormState]);

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
  const isFieldAutoFilled = useCallback((pduIndex, fieldName) => {
    const isAutoFilled = autoFilledFields[pduIndex]?.[fieldName] === true;
    console.log(`Checking auto-fill for PDU ${pduIndex}, field ${fieldName}:`, isAutoFilled);
    return isAutoFilled;
  }, [autoFilledFields]);

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
    const newAutoFilledFields = { ...autoFilledFields };
    
    // If this is the first PDU (index 0), check other PDUs
    if (index === 0) {
      const numPdus = parseInt(pduCount) || 1;
      for (let i = 1; i < numPdus; i++) {
        // Only auto-fill if the current value is empty
        const currentValue = updated[i][field];
        const isEmpty = currentValue === "" || currentValue === null || currentValue === undefined;
        
        // Skip if the field already has a value
        if (!isEmpty) continue;
        
        // Update the value since it's empty
        updated[i] = {
          ...updated[i],
          [field]: value
        };
        
        // Mark as auto-filled only for empty fields that we're filling
        if (!newAutoFilledFields[i]) {
          newAutoFilledFields[i] = {};
        }
        newAutoFilledFields[i][field] = true;
      }
    } else {
      // If user is manually changing a field, remove auto-fill status
      if (newAutoFilledFields[index] && newAutoFilledFields[index][field]) {
        delete newAutoFilledFields[index][field];
        if (Object.keys(newAutoFilledFields[index]).length === 0) {
          delete newAutoFilledFields[index];
        }
      }
    }
    
    // Always update the current PDU
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    // Clear CB selection and fetch new options when cabinet or distribution changes
    if (field === 'feedCabinet' || field === 'feedDistribution') {
      updated[index].cbFuse = ""; // Clear current CB selection
      
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
    setAutoFilledFields(newAutoFilledFields);
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
    const newAutoFilledFields = { ...autoFilledFields };
    
    // If this is the first PDU, auto-fill empty table data to other PDUs
    if (pduIndex === 0) {
      const numPdus = parseInt(pduCount) || 1;
      for (let i = 1; i < numPdus; i++) {
        // Only auto-fill if the current PDU has no table data
        const currentDetails = updated[i].cbDetails || [];
        const isEmpty = currentDetails.length === 0 || currentDetails.every(detail => 
          isEmptyValue(detail.rating) && isEmptyValue(detail.connected_module)
        );
        
        if (isEmpty) {
          updated[i] = {
            ...updated[i],
            cbDetails: [...processedData]
          };
          
          // Mark as auto-filled only if we actually filled it
          if (!newAutoFilledFields[i]) {
            newAutoFilledFields[i] = {};
          }
          newAutoFilledFields[i].cbDetails = true;
        }
      }
    } else {
      // If user is manually changing table data, remove auto-fill status
      if (newAutoFilledFields[pduIndex] && newAutoFilledFields[pduIndex].cbDetails) {
        delete newAutoFilledFields[pduIndex].cbDetails;
        if (Object.keys(newAutoFilledFields[pduIndex]).length === 0) {
          delete newAutoFilledFields[pduIndex];
        }
      }
    }
    
    // Always update the current PDU
    updated[pduIndex].cbDetails = processedData;
    setPdus(updated);
    setAutoFilledFields(newAutoFilledFields);
  }, [pdus, pduCount, autoFilledFields, isEmptyValue]);

  // Add a useEffect to log autoFilledFields changes
  useEffect(() => {
    console.log('Auto-filled fields updated:', autoFilledFields);
  }, [autoFilledFields]);

  // Generate image fields for a single PDU
  const getPduImages = (pduNumber) => [
    { label: `PDU #${pduNumber} photo`, name: `pdu_${pduNumber}_photo` },
    { label: `PDU #${pduNumber} fuses photo`, name: `pdu_${pduNumber}_fuses` },
    { label: `PDU #${pduNumber} existing PDU Power cables photo`, name: `pdu_${pduNumber}_existing_pdu_power_cables_photo` },
    { label: `PDU #${pduNumber} Cables route photo from tower top 1/2`, name: `pdu_${pduNumber}_cables_route_photo_from_tower_top_1` },
    { label: `PDU #${pduNumber} Cables route photo from tower top 2/2`, name: `pdu_${pduNumber}_cables_route_photo_from_tower_top_2` },
  ];

  // Generate all image fields based on PDU count
  const getAllImages = () => {
    if (!pduCount) return [];
    const count = parseInt(pduCount);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getPduImages(i)];
    }
    return allImages;
  };

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
              cbFuse: pdu.feeding_dc_cbs || "",
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
      // Basic validation
      if (!dcPduExist) {
        setError("Please select if there is a separate DC PDU.");
        return;
      }

      if (dcPduExist === "Yes" && !pduCount) {
        setError("Please select the number of PDUs.");
        return;
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
            feeding_dc_cbs: pdu.cbFuse || null,
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
      const allImageFields = getAllImages();
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

        console.log("Submitting External DC Distribution data with images:", submitData);
        console.log("Original form distribution values:", pdus.map(pdu => pdu.feedDistribution));
        
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
        
        // Submit as multipart/form-data
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`,
          submitFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Submit as JSON when no images
        console.log("Submitting External DC Distribution data as JSON:", submitData);
        console.log("Original form distribution values:", pdus.map(pdu => pdu.feedDistribution));
        
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`,
          submitData,
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Process and update images from the server response
      const updatedExternalDC = response.data.data.externalDCData;
      const updatedPdus = Array.isArray(updatedExternalDC.dc_pdus) ? updatedExternalDC.dc_pdus : [];
      if (updatedPdus.some(pdu => pdu.images?.length > 0)) {
        const processedImages = processImagesFromResponse(updatedPdus);
        console.log("Processed images from response:", processedImages);
        setUploadedImages(processedImages);
      } else {
        console.log("No images found in response, keeping existing uploaded images");
        // Preserve any newly uploaded File objects
        const newUploadedImages = {};
        Object.entries(uploadedImages).forEach(([key, files]) => {
          if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
            newUploadedImages[key] = files;
          }
        });
        setUploadedImages(newUploadedImages);
      }
     
      showSuccess('External DC Distribution data submitted successfully!');
      console.log("Response:", response.data);
      setError(""); // Clear any previous errors
      setAutoFilledFields({}); // Clear auto-filled status after successful save
      
      // Reset unsaved changes flag and update initial form state
      setHasUnsavedChanges(false);
      setInitialFormState(getCurrentFormState());
    } catch (err) {
      console.error("Error submitting External DC Distribution data:", err);
      console.error("Full error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.error || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          
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
            <div className="flex flex-col">
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
            <div className="">
              <div className="overflow-auto max-h-[700px]">
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th
                        className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-10"
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'shared') ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${isFieldAutoFilled(pduIndex, 'shared') ? colorFillAuto : ''}`}>
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'model') ? bgColorFillAuto : ''}`}>
                          <div className={`grid grid-cols-2 gap-1 ${isFieldAutoFilled(pduIndex, 'model') ? colorFillAuto : ''}`}>
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'location') ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${isFieldAutoFilled(pduIndex, 'location') ? colorFillAuto : ''}`}>
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'towerBaseHeight') ? bgColorFillAuto : ''}`}>
                          {pdu.location === "On tower" ? (
                            <input
                              type="number"
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(pduIndex, 'towerBaseHeight') ? colorFillAuto : ''}`}
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'feedCabinet') ? bgColorFillAuto : ''}`}>
                          <select
                            value={pdu.feedCabinet}
                            onChange={(e) => updatePdu(pduIndex, "feedCabinet", e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(pduIndex, 'feedCabinet') ? colorFillAuto : ''}`}
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'feedDistribution') ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${isFieldAutoFilled(pduIndex, 'feedDistribution') ? colorFillAuto : ''}`}>
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
                        
                        return (
                          <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'cbFuse') ? bgColorFillAuto : ''}`}>
                            <select
                              value={pdu.cbFuse}
                              onChange={(e) => updatePdu(pduIndex, "cbFuse", e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(pduIndex, 'cbFuse') ? colorFillAuto : ''}`}
                              disabled={isLoading || !canShowOptions}
                            >
                              <option value="" >
                              {pdu.cbFuse || "-- Select --"}
                              </option>
                              
                              {hasOptions && cbOptionsForPdu.map((option) => (
                                <option 
                                  key={option.id} 
                                  value={option.value}
                                  className={option.recommended ? "font-semibold" : ""}
                                >
                                  {option.display_text}
                                </option>
                              ))}
                              
                              {!hasOptions && canShowOptions && !isLoading && (
                                <option value="custom">No options available</option>
                              )}
                            </select>
                            
                            
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'dc_cable_length') ? bgColorFillAuto : ''}`}>
                          <input
                            type="number"
                            className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(pduIndex, 'dc_cable_length') ? colorFillAuto : ''}`}
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'cableCrossSection') ? bgColorFillAuto : ''}`}>
                          <input
                            type="number"
                            className={`w-full p-2 border rounded text-sm ${isFieldAutoFilled(pduIndex, 'cableCrossSection') ? colorFillAuto : ''}`}
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'hasFreeCbs') ? bgColorFillAuto : ''}`}>
                          <div className={`flex gap-4 mt-1 ${isFieldAutoFilled(pduIndex, 'hasFreeCbs') ? colorFillAuto : ''}`}>
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
                        <td key={pduIndex} className={`border px-2 py-2 ${isFieldAutoFilled(pduIndex, 'cbDetails') ? bgColorFillAuto : ''}`}>
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
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 font-semibold"
            >
              Save and Continue
            </button>
          </div>
   
        </form>
      </div>
      <ImageUploader 
        images={getAllImages()} 
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default DcDistributionForm;
