import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import useUnsavedChanges from '../../../hooks/useUnsavedChanges';

const RadioAntenasForm = () => {
  const { sessionId } = useParams();
  const [loadingApi, setLoadingApi] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    numberOfAntennas: 1,
    antennas: Array(15).fill(null).map((_, index) => ({
      id: index + 1,
      operator: '',
      baseHeight: '',
      towerLeg: '',
      sector: '',
      technology: [],
      azimuth: '',
      mechanicalTiltExist: '',
      mechanicalTilt: '',
      electricalTilt: '',
      retConnectivity: '',
      vendor: '',
      isNokiaActive: '',
      nokiaModuleName: '',
      nokiaFiberCount: '',
      nokiaFiberLength: '',
      otherModelNumber: '',
      otherLength: '',
      otherWidth: '',
      otherDepth: '',
      otherPortType: [],
      otherBands: [],
      otherPortCount: '',
      otherFreePorts: '',
      otherFreeBands: [],
      otherRadioUnits: '',
      sideArmLength: '',
      sideArmDiameter: '',
      sideArmOffset: '',
      earthCableLength: '',
      includeInPlan: '',
      actionPlanned: 'No action',
      ports: Array(15).fill(null).map((_, portIndex) => ({
        portType: [],
        band: [],
        portStatus: 'Free',
        electricalTilt: '',
      })),
    }))
  });
  const [uploadedImages, setUploadedImages] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to map API data to form data
  const mapApiToFormData = (apiData) => {
    const defaultAntenna = {
      operator: '',
      baseHeight: '',
      towerLeg: '',
      sector: '',
      technology: [],
      azimuth: '',
      mechanicalTiltExist: '',
      mechanicalTilt: '',
      electricalTilt: '',
      retConnectivity: '',
      vendor: '',
      isNokiaActive: '',
      nokiaModuleName: '',
      nokiaFiberCount: '',
      nokiaFiberLength: '',
      otherModelNumber: '',
      otherLength: '',
      otherWidth: '',
      otherDepth: '',
      otherPortType: [],
      otherBands: [],
      otherPortCount: '',
      otherFreePorts: '',
      otherFreeBands: [],
      otherRadioUnits: '',
      sideArmLength: '',
      sideArmDiameter: '',
      sideArmOffset: '',
      earthCableLength: '',
      includeInPlan: '',
      actionPlanned: 'No action',
      ports: Array(15).fill(null).map((_, portIndex) => ({
        portType: [],
        band: [],
        portStatus: 'Free',
        electricalTilt: '',
      })),
    };

    const mergedAntennas = Array(15).fill(null).map((_, index) => {
      const apiAntenna = apiData.antennas?.[index];
      if (!apiAntenna) {
        return { id: index + 1, ...defaultAntenna };
      }

      return {
        id: index + 1,
        operator: apiAntenna.operator || '',
        baseHeight: apiAntenna.base_height || '',
        towerLeg: apiAntenna.tower_leg || '',
        sector: apiAntenna.sector || '',
        technology: Array.isArray(apiAntenna.technology) ? apiAntenna.technology : [],
        azimuth: apiAntenna.azimuth_angle || '',
        mechanicalTiltExist: apiAntenna.mechanical_tilt_exist ? 'Yes' : 'No',
        mechanicalTilt: apiAntenna.mechanical_tilt || '',
        electricalTilt: apiAntenna.electrical_tilt || '',
        retConnectivity: apiAntenna.ret_connectivity || '',
        vendor: apiAntenna.vendor || '',
        isNokiaActive: apiAntenna.is_active_antenna ? 'Yes' : 'No',
        nokiaModuleName: apiAntenna.nokia_module_name || '',
        nokiaFiberCount: apiAntenna.nokia_fiber_count?.toString() || '',
        nokiaFiberLength: apiAntenna.nokia_fiber_length || '',
        otherModelNumber: apiAntenna.other_model_number || '',
        otherLength: apiAntenna.other_length || '',
        otherWidth: apiAntenna.other_width || '',
        otherDepth: apiAntenna.other_depth || '',
        otherPortType: Array.isArray(apiAntenna.other_port_types) ? apiAntenna.other_port_types : [],
        otherBands: Array.isArray(apiAntenna.other_bands) ? apiAntenna.other_bands : [],
        otherPortCount: apiAntenna.other_total_ports || '',
        otherFreePorts: apiAntenna.other_free_ports || '',
        otherFreeBands: Array.isArray(apiAntenna.other_free_port_bands) ? apiAntenna.other_free_port_bands : [],
        otherRadioUnits: apiAntenna.other_connected_radio_units?.toString() || '',
        sideArmLength: apiAntenna.side_arm_length || '',
        sideArmDiameter: apiAntenna.side_arm_diameter || '',
        sideArmOffset: apiAntenna.side_arm_offset || '',
        earthCableLength: apiAntenna.earth_cable_length || '',
        includeInPlan: apiAntenna.included_in_upgrade ? 'Yes' : 'No',
        actionPlanned: apiAntenna.action_planned || 'No action',
        ports: Array.isArray(apiAntenna.ports) ? apiAntenna.ports : Array(15).fill(null).map(() => ({
            portType: [],
            band: [],
            portStatus: 'Free',
            electricalTilt: '',
        })),
      };
    });

    return {
      numberOfAntennas: (apiData.antenna_count && apiData.antenna_count > 0) ? apiData.antenna_count.toString() : '1',
      antennas: mergedAntennas
    };
  };

  // Helper function to map form data to API format
  const mapFormToApiData = (formData) => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 0);

    return {
      antenna_count: parseInt(formData.numberOfAntennas) || 1,
      antennas: activeAntennas.map((antenna, index) => {
        const antennaData = {
          antenna_number: index + 1,
          is_shared_site: !!antenna.operator,
          base_height: antenna.baseHeight || "",
          tower_leg: antenna.towerLeg || "",
          sector: antenna.sector ? parseInt(antenna.sector) : null,
          technology: antenna.technology || [],
          azimuth_angle: antenna.azimuth || "",
          mechanical_tilt_exist: antenna.mechanicalTiltExist === "Yes",
          electrical_tilt: antenna.electricalTilt || "",
          ret_connectivity: antenna.retConnectivity || "",
          vendor: antenna.vendor || "",
          side_arm_length: antenna.sideArmLength || "",
          side_arm_diameter: antenna.sideArmDiameter || "",
          side_arm_offset: antenna.sideArmOffset || "",
          earth_cable_length: antenna.earthCableLength || "",
          included_in_upgrade: antenna.includeInPlan === "Yes",
          action_planned: antenna.actionPlanned || "No action"
        };

        // Add operator only if shared site
        if (antenna.operator) {
          antennaData.operator = antenna.operator;
        }

        // Add mechanical tilt only if it exists
        if (antenna.mechanicalTiltExist === "Yes" && antenna.mechanicalTilt) {
          antennaData.mechanical_tilt = antenna.mechanicalTilt;
        }

        // Add Nokia-specific fields if Nokia vendor
        if (antenna.vendor === "Nokia") {
          antennaData.is_active_antenna = antenna.isNokiaActive === "Yes";
          if (antenna.nokiaModuleName) {
            antennaData.nokia_module_name = antenna.nokiaModuleName;
          }
          if (antenna.nokiaFiberCount) {
            antennaData.nokia_fiber_count = parseInt(antenna.nokiaFiberCount);
          }
          if (antenna.nokiaFiberLength) {
            antennaData.nokia_fiber_length = antenna.nokiaFiberLength;
          }
        }

        // Add other vendor fields if not Nokia
        if (antenna.vendor && antenna.vendor !== "Nokia") {
          if (antenna.otherModelNumber) {
            antennaData.other_model_number = antenna.otherModelNumber;
          }
          if (antenna.otherLength) {
            antennaData.other_length = antenna.otherLength;
          }
          if (antenna.otherWidth) {
            antennaData.other_width = antenna.otherWidth;
          }
          if (antenna.otherDepth) {
            antennaData.other_depth = antenna.otherDepth;
          }
          if (antenna.otherPortType && antenna.otherPortType.length > 0) {
            antennaData.other_port_types = antenna.otherPortType;
          }
          if (antenna.otherBands && antenna.otherBands.length > 0) {
            antennaData.other_bands = antenna.otherBands;
          }
          if (antenna.otherPortCount) {
            antennaData.other_total_ports = parseInt(antenna.otherPortCount);
          }
          if (antenna.otherFreePorts) {
            antennaData.other_free_ports = parseInt(antenna.otherFreePorts);
          }
          if (antenna.otherFreeBands && antenna.otherFreeBands.length > 0) {
            antennaData.other_free_port_bands = antenna.otherFreeBands;
          }
          if (antenna.otherRadioUnits) {
            antennaData.other_connected_radio_units = parseInt(antenna.otherRadioUnits);
          }

          // Add port configuration data if ports exist
          if (antenna.ports && Array.isArray(antenna.ports)) {
            antennaData.ports = antenna.ports.filter(port => port && (port.portType || port.band || port.portStatus || port.electricalTilt));
          }
        }

        return antennaData;
      })
    };
  };

  // Process images from API response
  const processImagesFromResponse = (antennas) => {
    const imagesByCategory = {};

    antennas.forEach((antenna, antennaIndex) => {
      const antennaNumber = antenna.antenna_number || (antennaIndex + 1);

      if (antenna.images && Array.isArray(antenna.images)) {
        antenna.images.forEach(img => {
          const category = img.image_category || `antenna_${antennaNumber}_photo`;
          imagesByCategory[category] = [{
            id: img.id,
            file_url: img.file_url,
            name: img.original_filename,
            preview: img.file_url // Add preview URL for existing images
          }];
        });
      }
    });

    console.log('Processed images:', imagesByCategory);
    return imagesByCategory;
  };

  // Handle image uploads from ImageUploader component
  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
    setHasUnsavedChanges(true);
  };

  // Fetch existing data when component loads
  useEffect(() => {
    setIsInitialLoading(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/antenna-configuration/${sessionId}`);
        const apiData = response.data.data || response.data;

        console.log("Fetched antenna configuration data:", apiData);

        if (apiData) {
          const mappedData = mapApiToFormData(apiData);
          setFormData(mappedData);

          // Process and set images from the response
          if (apiData.antennas?.some(ant => ant.images?.length > 0)) {
            const processedImages = processImagesFromResponse(apiData.antennas);
            console.log("Setting processed images:", processedImages);
            setUploadedImages(processedImages);
          }
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      } catch (err) {
        console.error("Error loading antenna configuration data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleChange = (antennaIndex, fieldName, value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    setFormData(prev => {
      const newFormData = { ...prev };

      if (antennaIndex === 0) {
        const numAntennas = parseInt(prev.numberOfAntennas) || 1;
        for (let i = 1; i < numAntennas; i++) {
          if (!newFormData.antennas[i][fieldName]) {
            newFormData.antennas[i] = {
              ...newFormData.antennas[i],
              [fieldName]: value,
              [`${fieldName}AutoFilled`]: true
            };
          }
        }
      }

      newFormData.antennas[antennaIndex] = {
        ...newFormData.antennas[antennaIndex],
        [fieldName]: value,
        [`${fieldName}AutoFilled`]: false
      };

      return newFormData;
    });
    setHasUnsavedChanges(true);
  };

  const handleCheckboxChange = (antennaIndex, fieldName, value, checked) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    setFormData(prev => {
      const newFormData = { ...prev };
      const currentAntenna = { ...newFormData.antennas[antennaIndex] };

      // Handle any array-type field
      let arr = Array.isArray(currentAntenna[fieldName]) ? [...currentAntenna[fieldName]] : [];
      if (checked) {
        if (!arr.includes(value)) arr.push(value);
      } else {
        arr = arr.filter(t => t !== value);
      }
      currentAntenna[fieldName] = arr;
      currentAntenna[`${fieldName}AutoFilled`] = false;

      // Auto-fill for technology only
      if (fieldName === 'technology' && antennaIndex === 0) {
        const numAntennas = parseInt(prev.numberOfAntennas) || 1;
        for (let i = 1; i < numAntennas; i++) {
          newFormData.antennas[i] = {
            ...newFormData.antennas[i],
            technology: arr,
            technologyAutoFilled: true
          };
        }
      }

      newFormData.antennas[antennaIndex] = currentAntenna;
      return newFormData;
    });
    setHasUnsavedChanges(true);
  };

  const handleNumberOfAntennasChange = (e) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    const count = parseInt(e.target.value);
    if (!count || count < 1) {
      setFormData({ numberOfAntennas: "", antennas: [] });
      setHasUnsavedChanges(true);
      return;
    }

    const currentAntennas = formData.antennas || [];
    const antennas = Array.from({ length: count }, (_, index) => {
      if (index < currentAntennas.length) {
        return currentAntennas[index];
      }
      return {
        id: index + 1,
        operator: '',
        baseHeight: '',
        towerLeg: '',
        sector: '',
        technology: [],
        azimuth: '',
        mechanicalTiltExist: '',
        mechanicalTilt: '',
        electricalTilt: '',
        retConnectivity: '',
        vendor: '',
        isNokiaActive: '',
        nokiaModuleName: '',
        nokiaFiberCount: '',
        nokiaFiberLength: '',
        otherModelNumber: '',
        otherLength: '',
        otherWidth: '',
        otherDepth: '',
        otherPortType: [],
        otherBands: [],
        otherPortCount: '',
        otherFreePorts: '',
        otherFreeBands: [],
        otherRadioUnits: '',
        sideArmLength: '',
        sideArmDiameter: '',
        sideArmOffset: '',
        earthCableLength: '',
        includeInPlan: '',
        actionPlanned: 'No action',
        ports: Array(15).fill(null).map((_, portIndex) => ({
          portType: [],
          band: [],
          portStatus: 'Free',
          electricalTilt: '',
        })),
      };
    });

    setFormData({ numberOfAntennas: e.target.value, antennas });
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Antenna configuration data submitted successfully!');
        setError(""); // Clear any previous errors
      }
    } catch (err) {
      console.error("Error submitting antenna configuration data:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;

    try {
      setLoadingApi(true);
      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Map form data to API format
      const apiData = mapFormToApiData(formData);

      // Add antenna count
      submitFormData.append('antenna_count', apiData.antenna_count);

      // Add antenna data as individual form fields
      apiData.antennas.forEach((antenna, index) => {
        Object.keys(antenna).forEach(key => {
          const value = antenna[key];
          if (Array.isArray(value)) {
            submitFormData.append(`antennas[${index}][${key}]`, JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            submitFormData.append(`antennas[${index}][${key}]`, value.toString());
          } else if (value !== null && value !== undefined) {
            submitFormData.append(`antennas[${index}][${key}]`, value.toString());
          }
        });
      });

      // Get all possible image fields
      const allImageFields = getAllImages();

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

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/antenna-configuration/${sessionId}`,
        submitFormData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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

  // Helper functions to check conditions
  const hasNokiaVendor = () => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1);
    return activeAntennas.some(antenna => antenna.vendor === 'Nokia');
  };

  const hasNokiaActiveAntenna = () => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1);
    return activeAntennas.some(antenna => antenna.vendor === 'Nokia' && antenna.isNokiaActive === 'Yes');
  };

  const hasOtherVendor = () => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1);
    return activeAntennas.some(antenna => antenna.vendor && antenna.vendor !== 'Nokia');
  };

  const hasMechanicalTilt = () => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1);
    return activeAntennas.some(antenna => antenna.mechanicalTiltExist === 'Yes');
  };

  // Generate image fields for a single antenna
  const getAntennaImages = (antennaNumber) => [
    { label: `Antenna #${antennaNumber} photo`, name: `antenna_${antennaNumber}_photo` },
    { label: `Antenna #${antennaNumber} Azimuth view photo`, name: `antenna_${antennaNumber}_azimuth_view_photo` },
    { label: `Antenna #${antennaNumber} Mechanical tilt photo`, name: `antenna_${antennaNumber}_mechanical_tilt_photo` },
    { label: `Antenna #${antennaNumber} RET Photo`, name: `antenna_${antennaNumber}_ret_photo` },
    { label: `Antenna #${antennaNumber} Label Photo`, name: `antenna_${antennaNumber}_label_photo` },
    { label: `Antenna #${antennaNumber} Ports Photo`, name: `antenna_${antennaNumber}_ports_photo` },
    { label: `Antenna #${antennaNumber} Free ports Photo`, name: `antenna_${antennaNumber}_free_ports_photo` },
    { label: `Blocking View #${antennaNumber} if found ( Azimuth and Snap from Antenna Top ) `, name: `antenna_${antennaNumber}_blocking_view_photo` }
  ];

  // Generate all image fields based on antenna count
  const getAllImages = () => {
    if (!formData.numberOfAntennas) return [];
    const count = parseInt(formData.numberOfAntennas);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getAntennaImages(i)];
    }
    return allImages;
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

  const handlePortChange = (antennaIndex, portIndex, fieldName, value, event = null) => {
    if (isInitialLoading) return;
  
    setFormData(prev => {
      const newFormData = { ...prev };
  
      // Ensure antenna exists
      const currentAntenna = { ...newFormData.antennas[antennaIndex] };
  
      // Initialize ports if missing
      if (!Array.isArray(currentAntenna.ports)) {
        currentAntenna.ports = [];
      }
  
      // Clone existing ports or initialize with default
      const currentPorts = [...currentAntenna.ports];
      if (!currentPorts[portIndex]) {
        currentPorts[portIndex] = {
          portType: [],
          band: [],
          portStatus: '',
          electricalTilt: ''
        };
      }
  
      // Multi-select case (from select element)
      if ((fieldName === 'portType' || fieldName === 'band') && event && event.target && event.target.selectedOptions) {
        const selectElement = event.target;
        const selectedOptions = Array.from(selectElement.selectedOptions).map(opt => opt.value);
        currentPorts[portIndex] = {
          ...currentPorts[portIndex],
          [fieldName]: selectedOptions,
          [`${fieldName}AutoFilled`]: false
        };
      } else {
        // Normal update
        currentPorts[portIndex] = {
          ...currentPorts[portIndex],
          [fieldName]: value,
          [`${fieldName}AutoFilled`]: false
        };
      }
  
      // === Auto-fill logic for Antenna 0 ===
      if (antennaIndex === 0) {
        const numAntennas = parseInt(prev.numberOfAntennas) || 1;
        for (let i = 1; i < numAntennas; i++) {
          // Ensure ports exist
          if (!Array.isArray(newFormData.antennas[i].ports)) {
            newFormData.antennas[i].ports = [];
          }
          if (!newFormData.antennas[i].ports[portIndex]) {
            newFormData.antennas[i].ports[portIndex] = {
              portType: [],
              band: [],
              portStatus: '',
              electricalTilt: ''
            };
          }
  
          if (fieldName === 'portType') {
            newFormData.antennas[i].ports[portIndex] = {
              ...newFormData.antennas[i].ports[portIndex],
              portType: currentPorts[portIndex].portType,
              portTypeAutoFilled: true
            };
          }
  
          if (fieldName === 'band') {
            newFormData.antennas[i].ports[portIndex] = {
              ...newFormData.antennas[i].ports[portIndex],
              band: currentPorts[portIndex].band,
              bandAutoFilled: true
            };
          }
  
          if (fieldName === 'portStatus') {
            newFormData.antennas[i].ports[portIndex] = {
              ...newFormData.antennas[i].ports[portIndex],
              portStatus: value,
              portStatusAutoFilled: true
            };
          }
  
          if (fieldName === 'electricalTilt') {
            newFormData.antennas[i].ports[portIndex] = {
              ...newFormData.antennas[i].ports[portIndex],
              electricalTilt: value,
              electricalTiltAutoFilled: true
            };
          }
        }
      }
  
      currentAntenna.ports = currentPorts;
      newFormData.antennas[antennaIndex] = currentAntenna;
      return newFormData;
    });
  
    setHasUnsavedChanges(true);
  };
  

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
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



          {/* Number of Antennas Selection */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-semibold mb-2">How many antennas on site?</label>
            <select
              name="numberOfAntennas"
              value={formData.numberOfAntennas}
              onChange={handleNumberOfAntennasChange}
              className="form-input"
              required
            >

              {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Table Layout */}
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
                  {Array.from({ length: parseInt(formData.numberOfAntennas) || 1 }, (_, i) => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[500px] sticky top-0 bg-blue-500 z-10"
                    >
                      Antenna #{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Operator */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    If shared site, antenna belongs to which operator?
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <select
                        value={antenna.operator}
                        onChange={(e) => handleChange(antennaIndex, 'operator', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.operatorAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                      >
                        <option value="">-- Select --</option>
                        <option value="Operator 1">Operator 1</option>
                        <option value="Operator 2">Operator 2</option>
                        <option value="Operator 3">Operator 3</option>
                        <option value="Operator 4">Operator 4</option>
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Base Height */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna's base height from tower base level (meter)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.baseHeight}
                        onChange={(e) => handleChange(antennaIndex, 'baseHeight', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.baseHeightAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="Enter height..."
                        required
                      />
                    </td>
                  ))}
                </tr>

                {/* Tower Leg */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna located at tower leg
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D'].map(leg => (
                          <label key={leg} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`towerLeg-${antennaIndex}`}
                              value={leg}
                              checked={antenna.towerLeg === leg}
                              onChange={(e) => handleChange(antennaIndex, 'towerLeg', e.target.value)}
                              className="w-4 h-4"
                            />
                            {leg}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Sector */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna's sector
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <select
                        value={antenna.sector}
                        onChange={(e) => handleChange(antennaIndex, 'sector', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.sectorAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                      >
                        <option value="">-- Select --</option>
                        {[1, 2, 3, 4, 5].map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Technology */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna's technology
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className={`grid grid-cols-2 gap-1 ${antenna.technologyAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                        }`}>
                        {['2G', '3G', '4G', '5G'].map(tech => (
                          <label key={tech} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(antenna.technology || []).includes(tech)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'technology', tech, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className={antenna.technologyAutoFilled ? 'text-[#006100]' : ''}>
                              {tech}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Azimuth */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Azimuth, angle shift from zero north direction (degree)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.azimuth}
                        onChange={(e) => handleChange(antennaIndex, 'azimuth', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.azimuthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="0000"
                        min="0"
                        max="360"
                      />
                    </td>
                  ))}
                </tr>

                {/* Mechanical Tilt Exist */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Mechanical tilt exist?
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`mechanicalTiltExist-${antennaIndex}`}
                              value={option}
                              checked={antenna.mechanicalTiltExist === option}
                              onChange={(e) => handleChange(antennaIndex, 'mechanicalTiltExist', e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={antenna.mechanicalTiltExistAutoFilled ? 'text-[#006100]' : ''}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Mechanical Tilt - Only show if mechanical tilt exists */}
                {hasMechanicalTilt() && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      Mechanical tilt (degree)
                    </td>
                    {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.mechanicalTilt}
                          onChange={(e) => handleChange(antennaIndex, 'mechanicalTilt', e.target.value)}
                          className={`w-full p-2 border rounded text-sm ${antenna.mechanicalTiltAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                            }`}
                          placeholder={antenna.mechanicalTiltExist === 'Yes' ? '0000' : 'N/A'}
                          disabled={antenna.mechanicalTiltExist !== 'Yes'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* Electrical Tilt */}
                {/* <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Electrical tilt (degree)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.electricalTilt}
                        onChange={(e) => handleChange(antennaIndex, 'electricalTilt', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${
                          antenna.electricalTiltAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                        }`}
                        placeholder="0000"
                      />
                    </td>
                  ))}
                </tr> */}

                {/* RET Connectivity */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    RET connectivity
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <select
                        value={antenna.retConnectivity}
                        onChange={(e) => handleChange(antennaIndex, 'retConnectivity', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.retConnectivityAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                      >
                        <option value="">-- Select --</option>
                        <option value="Chaining">Chaining</option>
                        <option value="Direct">Direct</option>
                        <option value="Not applicable">Not applicable</option>
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Antenna Vendor */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna vendor
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="grid grid-cols-2 gap-1">
                        {['Nokia', 'Ericsson', 'RADIOSCOPE', 'Kathrine', 'Huawei', 'Andrew', 'Other'].map(vendor => (
                          <label key={vendor} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`vendor-${antennaIndex}`}
                              value={vendor}
                              checked={antenna.vendor === vendor}
                              onChange={(e) => handleChange(antennaIndex, 'vendor', e.target.value)}
                              className="w-4 h-4"
                            />
                            {vendor}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Nokia Active Antenna - Only show if Nokia is selected */}
                {hasNokiaVendor() && (
                  <>
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia, is it active antenna?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  name={`isNokiaActive-${antennaIndex}`}
                                  value={antenna.vendor !== 'Nokia' ? ' ' : option}
                                  checked={antenna.isNokiaActive === option}
                                  onChange={(e) => handleChange(antennaIndex, 'isNokiaActive', e.target.value)}
                                  className="w-4 h-4"
                                  disabled={antenna.vendor !== 'Nokia'}
                                />

                                {option}

                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia active antenna, what is the module name?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <div className="flex gap-4">
                            <select
                              value={antenna.nokiaModuleName}
                              onChange={(e) => handleChange(antennaIndex, 'nokiaModuleName', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${antenna.vendor !== 'Nokia' ? 'bg-[#e5e7eb] ' : ''} ${antenna.nokiaModuleNameAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                                }`}
                              disabled={antenna.vendor !== 'Nokia'}
                            >
                              <option value=""> {antenna.vendor !== 'Nokia' ? 'N/A' : '-- Select --'}</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia active antenna, how many fiber connected to base band?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <div className="flex gap-4">
                            {['1', '2', '3', '4'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  name={`nokiaFiberCount-${antennaIndex}`}
                                  value={option}
                                  checked={antenna.nokiaFiberCount === option}
                                  onChange={(e) => handleChange(antennaIndex, 'nokiaFiberCount', e.target.value)}
                                  className="w-4 h-4"
                                  disabled={antenna.vendor !== 'Nokia'}
                                />

                                {option}

                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia active antenna, length of fiber to base band? (meter)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            value={antenna.nokiaFiberLength}
                            onChange={(e) => handleChange(antennaIndex, 'nokiaFiberLength', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.nokiaFiberLengthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor !== 'Nokia' ? 'N/A' : '0000'}
                            disabled={antenna.vendor !== 'Nokia'}
                          />
                        </td>
                      ))}
                    </tr>
                  </>
                )}




                {/* Other Vendor Model - Only show if other vendor */}
                {hasOtherVendor() && (
                  <>
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, antenna model Number
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="text"
                            value={antenna.otherModelNumber}
                            onChange={(e) => handleChange(antennaIndex, 'otherModelNumber', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.otherModelNumberAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor !== 'Nokia' && antenna.vendor ? 'Xxxx' : 'N/A'}
                            disabled={antenna.vendor === 'Nokia' || !antenna.vendor}
                          />
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, antenna dimensions, length (cm)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            value={antenna.otherLength}
                            onChange={(e) => handleChange(antennaIndex, 'otherLength', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.otherLengthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor !== 'Nokia' && antenna.vendor ? '0000' : 'N/A'}
                            disabled={antenna.vendor === 'Nokia' || !antenna.vendor}
                          />
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, antenna dimensions, width (cm)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            value={antenna.otherWidth}
                            onChange={(e) => handleChange(antennaIndex, 'otherWidth', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.otherWidthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor !== 'Nokia' && antenna.vendor ? '0000' : 'N/A'}
                            disabled={antenna.vendor === 'Nokia' || !antenna.vendor}
                          />
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, antenna dimensions, depth (cm)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            value={antenna.otherDepth}
                            onChange={(e) => handleChange(antennaIndex, 'otherDepth', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.otherDepthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor !== 'Nokia' && antenna.vendor ? '0000' : 'N/A'}
                            disabled={antenna.vendor === 'Nokia' || !antenna.vendor}
                          />
                        </td>
                      ))}
                    </tr>




                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, antenna free ports
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            value={antenna.otherFreePorts}
                            onChange={(e) => handleChange(antennaIndex, 'otherFreePorts', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${antenna.otherFreePortsAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                              }`}
                            placeholder={antenna.vendor == 'Nokia' && antenna.vendor ? 'N/A' : '0000'}
                            disabled={antenna.vendor == 'Nokia' && antenna.vendor}
                          />
                        </td>
                      ))}
                    </tr>
                    {/* <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If other vendor, Antenna port type 
                    </td>
                    {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="grid grid-cols-2 gap-1">
                        {['7/16', '4.3-10', 'MQ4', 'MQ5'].map(port => (
                          <label key={port} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={(antenna.otherPortType || []).includes(port)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherPortType', port, e.target.checked)}
                              className="w-4 h-4"
                              disabled={antenna.vendor == 'Nokia' && antenna.vendor}
                            />
                            {port}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr> */}

                    {/* <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If other vendor, antenna bands
                    </td>
                    {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="grid grid-cols-2 gap-1">
                        {['700', '800', '900', '1800', '2100', '2600'].map(band => (
                          <label key={band} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={(antenna.otherBands || []).includes(band)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherBands', band, e.target.checked)}
                              className="w-4 h-4"
                              disabled={antenna.vendor == 'Nokia' && antenna.vendor}
                            />
                            {band}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr> */}
                    {/* <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If other vendor, bands supported by free ports
                    </td>
                    {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="grid grid-cols-2 gap-1">
                          {['700', '800', '900', '1800', '2100', '2600'].map(freeBand => (
                            <label key={freeBand} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={(antenna.otherFreeBands || []).includes(freeBand)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherFreeBands', freeBand, e.target.checked)}
                              className="w-4 h-4"
                              disabled={antenna.vendor == 'Nokia' && antenna.vendor}
                            />
                            {freeBand}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr> */}

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, how many radio units connected with this antenna?
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <div className="flex gap-4">
                            {['1', '2', '3', '4', '5', '6'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  name={`otherRadioUnits-${antennaIndex}`}
                                  value={option}
                                  checked={antenna.otherRadioUnits === option}
                                  onChange={(e) => handleChange(antennaIndex, 'otherRadioUnits', e.target.value)}
                                  className="w-4 h-4"
                                  disabled={antenna.vendor == 'Nokia' && antenna.vendor}

                                />

                                {option}

                              </label>
                            ))}
                          </div>
                        </td>
                      ))}

                    </tr>

                  </>
                )}


                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Total number of antenna ports
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.otherPortCount}
                        onChange={(e) => handleChange(antennaIndex, 'otherPortCount', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.otherPortCountAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder={antenna.vendor == 'Nokia' && antenna.vendor ? 'N/A' : '0000'}
                        disabled={antenna.vendor == 'Nokia' && antenna.vendor}
                      />


                    </td>
                  ))}
                </tr>

                {/* Port Config Header Row */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Port Configuration
                  </td>

                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2 align-top">
                      {antenna.otherPortCount && parseInt(antenna.otherPortCount) > 0 && (
                        <div className="mt-3 border rounded-lg overflow-hidden">

                          <div className="overflow-x-auto max-h-60">
                            <table className="w-full border-collapse text-xs table-fixed">
                              <thead className="bg-blue-500 text-white sticky top-0">
                                <tr>
                                  <th className="border px-1 py-1 text-center text-xs w-16">Port #</th>
                                  <th className="border px-1 py-1 text-center text-xs w-20">Port Type</th>
                                  <th className="border px-1 py-1 text-center text-xs w-20">Band</th>
                                  <th className="border px-1 py-1 text-center text-xs w-16">Status</th>
                                  <th className="border px-1 py-1 text-center text-xs w-16">Tilt</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.from({ length: parseInt(antenna.otherPortCount) }, (_, portIndex) => (
                                  <tr key={portIndex} className="hover:bg-gray-50">
                                    <td className="border px-1 py-1 text-center font-semibold text-xs bg-gray-100">
                                      Port #{portIndex + 1}
                                    </td>

                                    {/* Port Type */}
                                    <td className="border px-1 py-1 align-top">
                                      <div className="grid grid-cols-2 text-xs gap-1">
                                        {["7/16", "4.310", "MQ4", "MQ5", "Other"].map((type) => (
                                          <label key={type} className="flex items-center gap-1">
                                            <input
                                              type="checkbox"
                                              checked={Array.isArray(antenna.ports) && antenna.ports[portIndex]?.portType?.includes(type) || false}
                                              onChange={(e) => {
                                                const checked = e.target.checked;
                                                const current = Array.isArray(antenna.ports) && antenna.ports[portIndex]?.portType || [];
                                                const updated = checked
                                                  ? [...current, type]
                                                  : current.filter((val) => val !== type);
                                                handlePortChange(antennaIndex, portIndex, "portType", updated);
                                              }}
                                            />
                                            {type}
                                          </label>
                                        ))}
                                      </div>
                                    </td>

                                    {/* Band */}
                                    <td className="border px-1 py-1 align-top">
                                      <div className="grid grid-cols-2 text-xs gap-1">
                                        {["700", "800", "900", "1800", "2100", "2600"].map((band) => (
                                          <label key={band} className="flex items-center gap-1">
                                            <input
                                              type="checkbox"
                                              checked={Array.isArray(antenna.ports) && antenna.ports[portIndex]?.band?.includes(band) || false}
                                              onChange={(e) => {
                                                const checked = e.target.checked;
                                                const current = Array.isArray(antenna.ports) && antenna.ports[portIndex]?.band || [];
                                                const updated = checked
                                                  ? [...current, band]
                                                  : current.filter((val) => val !== band);
                                                handlePortChange(antennaIndex, portIndex, "band", updated);
                                              }}
                                            />
                                            {band}
                                          </label>
                                        ))}
                                      </div>
                                    </td>

                                    {/* Status */}
                                    <td className="border px-1 py-1 w-16">
                                      <div className="flex flex-col gap-1">
                                        {["Free", "Busy"].map((status) => (
                                          <label key={status} className="flex items-center gap-1">
                                            <input
                                              type="radio"
                                              name={`portStatus-${antennaIndex}-${portIndex}`}
                                              value={status}
                                              checked={Array.isArray(antenna.ports) && antenna.ports[portIndex]?.portStatus === status}
                                              onChange={(e) =>
                                                handlePortChange(antennaIndex, portIndex, "portStatus", e.target.value)
                                              }
                                              className="w-3 h-3 text-blue-600"
                                            />
                                            <span className="text-xs">{status}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </td>

                                    {/* Tilt */}
                                    <td className="border px-1 py-1 w-16">
                                      <input
                                        type="number"
                                        value={Array.isArray(antenna.ports) && antenna.ports[portIndex]?.electricalTilt || ""}
                                        onChange={(e) =>
                                          handlePortChange(antennaIndex, portIndex, "electricalTilt", e.target.value)
                                        }
                                        className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                        step="0.1"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>


                {/* Continue with other conditional fields... */}
                {/* Side Arm Length */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna side arm length (cm)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.sideArmLength}
                        onChange={(e) => handleChange(antennaIndex, 'sideArmLength', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.sideArmLengthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna side arm diameter (cm)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.sideArmDiameter}
                        onChange={(e) => handleChange(antennaIndex, 'sideArmDiameter', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.sideArmDiameterAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Antenna side arm offset from tower leg (cm)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.sideArmOffset}
                        onChange={(e) => handleChange(antennaIndex, 'sideArmOffset', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.sideArmOffsetAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>


                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Length of earth cable connected to the earth bus bar (m)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.earthCableLength}
                        onChange={(e) => handleChange(antennaIndex, 'earthCableLength', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${antenna.earthCableLengthAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Include in Plan */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Is any action planned for Antenna unit ?
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-4">
                        {['Swap / Dismantle', 'No action'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`includeInPlan-${antennaIndex}`}
                              value={option}
                              checked={antenna.includeInPlan === option}
                              onChange={(e) => handleChange(antennaIndex, 'includeInPlan', e.target.value)}
                              className="w-4 h-4"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}


          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {isSubmitting ? "loading..." : "Save"}
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

export default RadioAntenasForm;
