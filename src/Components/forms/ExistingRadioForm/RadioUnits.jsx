import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaRegTrashAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from "../../GalleryComponent";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const nokiaModels = [
  'AAHF', 'AAHC', 'AAHD', 'AAIA', 'AAHB', 'AAHG', 'AAHE', 'AAOA'
]; // Nokia models as per SE requirements

const operators = ['Operator 1', 'Operator 2', 'Operator 3', 'Operator 4'];
const feederTypes = ['7/8 inch', '1-1/4 inch', '1-5/4 inch', '1/2 inch'];

// Dynamic Table Component
const DynamicTable = ({ data, onChange, unitIndex }) => {
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = {};
    }

    if (colIndex === 0) newData[rowIndex].sector = value;
    else if (colIndex === 1) newData[rowIndex].antenna = value;
    else if (colIndex === 2) newData[rowIndex].jumperLength = value;

    // Auto-add new column if user is filling the last column and the value is not empty
    const isLastColumn = rowIndex === data.length - 1;
    const hasValue = value && value.trim() !== '';

    if (isLastColumn && hasValue) {
      // Add a new empty column
      newData.push({ sector: '', antenna: '', jumperLength: '' });
    }

    onChange(newData);
  };

  const removeColumn = (colIndex) => {
    if (data.length <= 1) return;
    const newData = [...data];
    newData.splice(colIndex, 1);
    onChange(newData);
  };

  const createDropdownOptions = (max) => {
    return Array.from({ length: max }, (_, i) => (
      <option key={i + 1} value={i + 1}>{i + 1}</option>
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">


      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-4 py-3 text-left font-semibold text-sm min-w-[120px]">
                Field
              </th>
              {data.map((_, colIndex) => (
                <th key={colIndex} className="px-4 text-center font-semibold text-sm min-w-[150px] relative">
                  <div className="flex items-center justify-center">
                    <span>#{colIndex + 1}</span>
                    {data.length > 1 && (


                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold absolute right-2"
                        title="Delete this column"
                      >
                        <FaRegTrashAlt />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Sector # Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 font-medium text-gray-700 bg-gray-50">
                Sector #
              </td>
              {data.map((row, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <select
                    value={row.sector || ''}
                    onChange={(e) => handleCellChange(colIndex, 0, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {createDropdownOptions(5)}
                  </select>
                </td>
              ))}
            </tr>

            {/* Antenna # Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-700 bg-gray-50">
                Antenna #
              </td>
              {data.map((row, colIndex) => (
                <td key={colIndex} className="px-4 ">
                  <select
                    value={row.antenna || ''}
                    onChange={(e) => handleCellChange(colIndex, 1, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {createDropdownOptions(5)}
                  </select>
                </td>
              ))}
            </tr>

            {/* Jumper Length Row */}
            <tr className="hover:bg-gray-50">
              <td className="px-4  font-medium text-gray-700 bg-gray-50">
                Jumper length (m)
              </td>
              {data.map((row, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <select
                    value={row.jumperLength || ''}
                    onChange={(e) => handleCellChange(colIndex, 2, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {createDropdownOptions(15)}
                  </select>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RadioUnitsForm = () => {
  const { sessionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [relations, setRelations] = useState({
    cabinet_numbers: [],
    dc_cb_fuse_options: []
  });
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [dcOptions, setDcOptions] = useState({}); // Store DC options per unit index

  const [formData, setFormData] = useState({
    numberOfRadioUnits: 1,
    radioUnits: [
      {
        sector: '',
        antennaConnection: '',
        operator: '',
        baseHeight: '',
        tower_leg: '',
        vendor: '',
        nokiaModel: '',
        nokiaPortCount: '',
        nokiaPortConnectivity: [{ sector: '', antenna: '', jumperLength: '' }],
        otherModel: '',
        otherLength: '',
        otherWidth: '',
        otherDepth: '',
        sideArmType: '',
        sideArmLength: '',
        sideArmDiameter: '',
        sideArmOffset: '',
        dcPowerSource: '',
        dcCbFuse: '',
        dcCableLength: '',
        dcCableCrossSection: '',
        fiberCableLength: '',
        jumperLength: '',
        feederType: '',
        feederLength: '',
        includeInPlan: '',
        earthCableLength: '',
        band: [],
        connectedToBaseBand: [],
        actionPlanned: '',
        technologies: []
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add uploadedImages state
  const [uploadedImages, setUploadedImages] = useState({});

  // Add removedImages state to track explicitly removed images
  const [removedImages, setRemovedImages] = useState({});

  // Add hasUnsavedChanges state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generate cabinet options based on number of cabinets
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Cabinet ${i}`);
    }
    return options;
  };

  // Fetch DC options for a specific cabinet
  const fetchDcOptions = async (unitIndex, cabinetNumber) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/radio-units/cabinet-dc-options/${sessionId}/${cabinetNumber}`
      );

      const options = response.data.dc_options || [];
      setDcOptions(prev => ({
        ...prev,
        [unitIndex]: options
      }));
    } catch (error) {
      console.error('Error fetching DC options:', error);
      setDcOptions(prev => ({
        ...prev,
        [unitIndex]: []
      }));
    }
  };

  // Helper function to map API data to form data
  const mapApiToFormData = useCallback((apiData) => {
    const defaultRadioUnit = {
      sector: '',
      antennaConnection: '',
      operator: '',
      baseHeight: '',
      tower_leg: '',
      vendor: '',
      nokiaModel: '',
      nokiaPortCount: '',
      nokiaPortConnectivity: [{ sector: '', antenna: '', jumperLength: '' }],
      otherModel: '',
      otherLength: '',
      otherWidth: '',
      otherDepth: '',
      sideArmType: '',
      sideArmLength: '',
      sideArmDiameter: '',
      sideArmOffset: '',
      dcPowerSource: '',
      dcCbFuse: '',
      dcCableLength: '',
      dcCableCrossSection: '',
      fiberCableLength: '',
      jumperLength: '',
      feederType: '',
      feederLength: '',
      includeInPlan: '',
      earthCableLength: '',
      band: [],
      connectedToBaseBand: [],
      actionPlanned: '',
      technologies: []
    };

    // Helper function to map DC power source from API to form format
    const mapDcPowerSource = (apiValue) => {
      if (!apiValue) return '';
      if (apiValue === 'New FPFH') return 'External DC PDU #1';
      if (apiValue === 'Existing FPFH') return 'External DC PDU #2';
      if (apiValue === 'Direct from rectifier distribution') return 'Directly from rectifier distribution';
      if (apiValue.startsWith('cabinet_')) {
        const cabinetNum = apiValue.split('_')[1];
        return `Cabinet ${cabinetNum}`;
      }
      return apiValue; // Return as-is if no mapping found
    };

    // Helper function to map side arm from API to form format
    const mapSideArmType = (apiValue) => {
      if (!apiValue) return '';
      if (apiValue === 'shared_side_arm') return 'Shared side arm with other radio units';
      if (apiValue === 'same_antenna_side_arm') return 'Same antenna side arm';
      if (apiValue === 'separate_side_arm') return 'Separate side arm only for the radio unit';
      return apiValue; // Return as-is if no mapping found
    };

    const radioUnits = Array.from({ length: 20 }, (_, index) => {
      const apiUnit = apiData.radio_units?.[index];
      if (!apiUnit) {
        return { ...defaultRadioUnit };
      }

      return {
        sector: apiUnit.new_radio_unit_sector || '',
        antennaConnection: apiUnit.connected_to_antenna || '',
        operator: apiUnit.operator || '',
        baseHeight: apiUnit.base_height?.toString() || '',
        tower_leg: apiUnit.tower_leg || '',
        vendor: apiUnit.vendor || '',
        nokiaModel: apiUnit.nokia_model || '',
        nokiaPortCount: apiUnit.nokia_ports?.toString() || '',
        nokiaPortConnectivity: Array.isArray(apiUnit.nokia_port_connectivity) && apiUnit.nokia_port_connectivity.length > 0
          ? apiUnit.nokia_port_connectivity.map(conn => ({
            sector: conn.sector?.toString() || '',
            antenna: conn.antenna?.toString() || '',
            jumperLength: conn.jumper_length?.toString() || ''
          }))
          : [{ sector: '', antenna: '', jumperLength: '' }],
        otherModel: apiUnit.other_vendor_model || '',
        otherLength: apiUnit.other_length?.toString() || '',
        otherWidth: apiUnit.other_width?.toString() || '',
        otherDepth: apiUnit.other_depth?.toString() || '',
        sideArmType: mapSideArmType(apiUnit.radio_unit_side_arm),
        sideArmLength: apiUnit.radio_unit_side_arm_length?.toString() || '',
        sideArmDiameter: apiUnit.radio_unit_side_arm_diameter?.toString() || '',
        sideArmOffset: apiUnit.radio_unit_side_arm_offset?.toString() || '',
        dcPowerSource: mapDcPowerSource(apiUnit.dc_power_source),
        dcCbFuse: apiUnit.dc_cb_fuse || '',
        dcCableLength: apiUnit.dc_power_cable_length?.toString() || '',
        dcCableCrossSection: apiUnit.dc_power_cable_cross_section?.toString() || '',
        fiberCableLength: apiUnit.fiber_cable_length?.toString() || '',
        jumperLength: apiUnit.jumper_length_antenna_radio?.toString() || '',
        feederType: apiUnit.feeder_type || '',
        feederLength: apiUnit.feeder_length?.toString() || '',
        includeInPlan: apiUnit.swap_upgrade_plan || '',
        earthCableLength: apiUnit.earth_cable_length?.toString() || '',
        band: apiUnit.band || [],
        connectedToBaseBand: apiUnit.connectedToBaseBand || [],
        actionPlanned: apiUnit.actionPlanned || null,
        technologies: apiUnit.technologies || []
      };
    });

    return {
      numberOfRadioUnits: apiData.radio_unit_count || 1,
      radioUnits
    };
  }, []);

  // Helper function to map form data to API format
  const mapFormToApiData = useCallback((formData) => {
    const activeUnits = formData.radioUnits.slice(0, formData.numberOfRadioUnits);

    // Helper function to map DC power source from form to API format
    const mapDcPowerSourceToApi = (formValue) => {
      if (!formValue) return null;
      if (formValue.startsWith('Cabinet ')) {
        const cabinetNum = formValue.split(' ')[1];
        return `cabinet_${cabinetNum}`;
      }
      if (formValue === 'External DC PDU #1') return 'external_pdu_1_main_feed';
      if (formValue === 'External DC PDU #2') return 'external_pdu_2_main_feed';
      if (formValue === 'Directly from rectifier distribution') return 'directly_from_rectifier_distribution';
      return formValue; // Return as-is if no mapping found
    };

    // Helper function to map side arm from form to API format
    const mapSideArmTypeToApi = (formValue) => {
      if (!formValue) return null;
      if (formValue === 'Same antenna side arm') return 'same_antenna_side_arm';
      if (formValue === 'Separate side arm only for the radio unit') return 'separate_side_arm';
      if (formValue === 'Shared side arm with other radio units') return 'shared_side_arm';
      return formValue; // Return as-is if no mapping found
    };

    return {
      radio_unit_count: formData.numberOfRadioUnits,
      radio_units: activeUnits.map((unit, index) => ({
        radio_unit_index: index + 1,
        new_radio_unit_sector: unit.sector || "",
        connected_to_antenna: unit.antennaConnection || "",
        operator: unit.operator || null,
        base_height: unit.baseHeight && unit.baseHeight.trim() !== '' ? parseFloat(unit.baseHeight) : null,
        tower_leg: unit.tower_leg || null,
        vendor: unit.vendor || null,
        nokia_model: unit.vendor === 'Nokia' ? unit.nokiaModel : "",
        nokia_ports: unit.vendor === 'Nokia' && unit.nokiaPortCount ? parseInt(unit.nokiaPortCount) : null,
        nokia_port_connectivity: unit.vendor === 'Nokia' && unit.nokiaPortConnectivity ? unit.nokiaPortConnectivity
          .filter(conn => conn.sector || conn.antenna || conn.jumperLength)
          .map(conn => ({
            sector: conn.sector ? parseInt(conn.sector) : null,
            antenna: conn.antenna ? parseInt(conn.antenna) : null,
            jumper_length: conn.jumperLength ? parseFloat(conn.jumperLength) : null
          })) : [],
        other_vendor_model: unit.vendor && unit.vendor !== 'Nokia' ? unit.otherModel : null,
        other_length: unit.vendor && unit.vendor !== 'Nokia' && unit.otherLength && unit.otherLength.trim() !== '' ? parseFloat(unit.otherLength) : null,
        other_width: unit.vendor && unit.vendor !== 'Nokia' && unit.otherWidth && unit.otherWidth.trim() !== '' ? parseFloat(unit.otherWidth) : null,
        other_depth: unit.vendor && unit.vendor !== 'Nokia' && unit.otherDepth && unit.otherDepth.trim() !== '' ? parseFloat(unit.otherDepth) : null,
        radio_unit_side_arm: mapSideArmTypeToApi(unit.sideArmType),
        radio_unit_side_arm_length: unit.sideArmType !== 'Same antenna side arm' && unit.sideArmLength && unit.sideArmLength.trim() !== '' ? parseFloat(unit.sideArmLength) : null,
        radio_unit_side_arm_diameter: unit.sideArmType !== 'Same antenna side arm' && unit.sideArmDiameter && unit.sideArmDiameter.trim() !== '' ? parseFloat(unit.sideArmDiameter) : null,
        radio_unit_side_arm_offset: unit.sideArmType !== 'Same antenna side arm' && unit.sideArmOffset && unit.sideArmOffset.trim() !== '' ? parseFloat(unit.sideArmOffset) : null,
        dc_power_source: mapDcPowerSourceToApi(unit.dcPowerSource),
        dc_cb_fuse: unit.dcCbFuse || null,
        dc_power_cable_length: unit.dcCableLength && unit.dcCableLength.trim() !== '' ? parseFloat(unit.dcCableLength) : null,
        dc_power_cable_cross_section: unit.dcCableCrossSection && unit.dcCableCrossSection.trim() !== '' ? parseFloat(unit.dcCableCrossSection) : null,
        fiber_cable_length: unit.fiberCableLength && unit.fiberCableLength.trim() !== '' ? parseFloat(unit.fiberCableLength) : null,
        jumper_length_antenna_radio: unit.jumperLength || null,
        feeder_type: unit.feederType || null,
        feeder_length: unit.feederLength && unit.feederLength.trim() !== '' ? parseFloat(unit.feederLength) : null,
        swap_upgrade_plan: unit.includeInPlan || null,
        earth_cable_length: unit.earthCableLength && unit.earthCableLength.trim() !== '' ? parseFloat(unit.earthCableLength) : null,
        // New fields
        band: unit.band || [],
        connectedToBaseBand: unit.connectedToBaseBand || [],
        actionPlanned: unit.actionPlanned || null,
        technologies: unit.technologies || []
      }))
    };
  }, []);

  // Add handleImageUpload function
  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    console.log(`Images uploaded for ${imageCategory}:`, files);

    if (files && files.length > 0) {
      // New image uploaded
      setUploadedImages(prev => ({
        ...prev,
        [imageCategory]: files
      }));
      // Remove from removedImages if it was previously removed
      setRemovedImages(prev => {
        const newRemoved = { ...prev };
        delete newRemoved[imageCategory];
        return newRemoved;
      });
    } else {
      // Image removed by user
      setUploadedImages(prev => {
        const newUploaded = { ...prev };
        delete newUploaded[imageCategory];
        return newUploaded;
      });
      setRemovedImages(prev => ({
        ...prev,
        [imageCategory]: true
      }));
    }

    setHasUnsavedChanges(true);
  };

  // Fetch relations and existing data when component loads
  useEffect(() => {
    setIsInitialLoading(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch relations (cabinet numbers and DC options)
        const relationsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/radio-units/relations/${sessionId}`);
        const relationsData = relationsResponse.data;

        console.log("Fetched relations data:", relationsData);
        setRelations({
          cabinet_numbers: relationsData.cabinet_numbers || [],
          dc_cb_fuse_options: relationsData.dc_cb_fuse_options || []
        });

        // Set number of cabinets from metadata
        setNumberOfCabinets(relationsData.metadata?.total_cabinets || relationsData.cabinet_numbers?.length || 0);

        // Fetch existing radio units data
        try {
          const radioUnitsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/radio-units/${sessionId}`);
          const radioUnitsData = radioUnitsResponse.data.data || radioUnitsResponse.data;

          console.log("Fetched radio units data:", radioUnitsData);

          if (radioUnitsData) {
            const mappedData = mapApiToFormData(radioUnitsData);
            console.log('Mapped form data:', mappedData);
            setFormData(mappedData);

            // Process and set images from the response
            if (radioUnitsData.radio_units?.some(unit => unit.images?.length > 0)) {
              const processedImages = processImagesFromResponse(radioUnitsData.radio_units);
              console.log("Processed images:", processedImages);
              setUploadedImages(processedImages);
              // Clear removedImages state when loading initial data
              setRemovedImages({});
            }

            // Fetch DC options for units that have cabinet selections
            mappedData.radioUnits.forEach((unit, index) => {
              if (unit.dcPowerSource && unit.dcPowerSource.startsWith('Cabinet ')) {
                const cabinetNumber = unit.dcPowerSource.split(' ')[1];
                fetchDcOptions(index, cabinetNumber);
              }
            });
          }

          // Reset unsaved changes flag after loading data
          setHasUnsavedChanges(false);
          setIsInitialLoading(false);
        } catch (radioUnitsError) {
          if (radioUnitsError.response?.status !== 404) {
            console.error("Error loading radio units data:", radioUnitsError);
            showError('Error loading existing radio units data');
          }
          // Reset unsaved changes flag even on error
          setHasUnsavedChanges(false);
          setIsInitialLoading(false);
        }

      } catch (err) {
        console.error("Error loading relations data:", err);
        showError('Error loading form data');
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
  }, [sessionId, mapApiToFormData]);

  const handleRadioUnitCountChange = (e) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    const count = parseInt(e.target.value, 10);

    // Create new array with the desired length
    const newRadioUnits = Array(20).fill(null).map((_, index) => {
      if (index < count) {
        // Keep existing data for units within the new count
        return formData.radioUnits[index] || {
          sector: '',
          antennaConnection: '',
          operator: '',
          baseHeight: '',
          tower_leg: '',
          vendor: '',
          nokiaModel: '',
          nokiaPortCount: '',
          nokiaPortConnectivity: [{ sector: '', antenna: '', jumperLength: '' }],
          otherModel: '',
          otherLength: '',
          otherWidth: '',
          otherDepth: '',
          sideArmType: '',
          sideArmLength: '',
          sideArmDiameter: '',
          sideArmOffset: '',
          dcPowerSource: '',
          dcCbFuse: '',
          dcCableLength: '',
          dcCableCrossSection: '',
          fiberCableLength: '',
          jumperLength: '',
          feederType: '',
          feederLength: '',
          includeInPlan: '',
          earthCableLength: '',
          band: [],
          connectedToBaseBand: [],
          actionPlanned: '',
          technologies: []
        };
      } else {
        // Clear data for units beyond the new count
        return {
          sector: '',
          antennaConnection: '',
          operator: '',
          baseHeight: '',
          tower_leg: '',
          vendor: '',
          nokiaModel: '',
          nokiaPortCount: '',
          nokiaPortConnectivity: [{ sector: '', antenna: '', jumperLength: '' }],
          otherModel: '',
          otherLength: '',
          otherWidth: '',
          otherDepth: '',
          sideArmType: '',
          sideArmLength: '',
          sideArmDiameter: '',
          sideArmOffset: '',
          dcPowerSource: '',
          dcCbFuse: '',
          dcCableLength: '',
          dcCableCrossSection: '',
          fiberCableLength: '',
          jumperLength: '',
          feederType: '',
          feederLength: '',
          includeInPlan: '',
          earthCableLength: '',
          band: [],
          connectedToBaseBand: [],
          actionPlanned: '',
          technologies: []
        };
      }
    });

    // Clear DC options for units that are being removed (beyond the new count)
    if (count < formData.numberOfRadioUnits) {
      const newDcOptions = { ...dcOptions };
      for (let i = count; i < formData.numberOfRadioUnits; i++) {
        delete newDcOptions[i];
      }
      setDcOptions(newDcOptions);
    }

    setFormData({
      ...formData,
      numberOfRadioUnits: count,
      radioUnits: newRadioUnits
    });
    setHasUnsavedChanges(true);
  };

  const handleChange = (unitIndex, field, value) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load

    const newRadioUnits = [...formData.radioUnits];

    if (unitIndex === 0) {
      const numUnits = parseInt(formData.numberOfRadioUnits) || 1;
      for (let i = 1; i < numUnits; i++) {
        if (!newRadioUnits[i][field]) {
          newRadioUnits[i] = {
            ...newRadioUnits[i],
            [field]: value,
            [`${field}AutoFilled`]: true
          };

          // If auto-filling DC power source to a cabinet, fetch DC options for this unit too
          if (field === 'dcPowerSource' && value && value.startsWith('Cabinet ')) {
            const cabinetNumber = value.split(' ')[1];
            fetchDcOptions(i, cabinetNumber);

            // Clear the DC CB/Fuse selection when cabinet changes
            newRadioUnits[i].dcCbFuse = '';
          }
        }
      }
    }

    newRadioUnits[unitIndex] = {
      ...newRadioUnits[unitIndex],
      [field]: value,
      [`${field}AutoFilled`]: false
    };

    setFormData({ ...formData, radioUnits: newRadioUnits });
    setHasUnsavedChanges(true);

    // If changing DC power source to a cabinet, fetch DC options
    if (field === 'dcPowerSource' && value && value.startsWith('Cabinet ')) {
      const cabinetNumber = value.split(' ')[1];
      fetchDcOptions(unitIndex, cabinetNumber);

      // Clear the DC CB/Fuse selection when cabinet changes
      newRadioUnits[unitIndex].dcCbFuse = '';
    }

    // Clear error for this field
    if (errors[`${unitIndex}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${unitIndex}.${field}`];
      setErrors(newErrors);
    }
  };

  const handleTableDataChange = (unitIndex, newData) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    handleChange(unitIndex, 'nokiaPortConnectivity', newData);
  };

  // Add processImagesFromResponse function
  const processImagesFromResponse = (radioUnits) => {
    const imagesByCategory = {};

    radioUnits.forEach((unit, index) => {
      if (unit.images && Array.isArray(unit.images)) {
        unit.images.forEach(img => {
          // For radio units, the category should already be in the correct format
          // like 'radio_unit_1_front', 'radio_unit_1_back', etc.
          let frontendCategory = img.category;

          // If it's in the old format, map it
          if (img.category === 'proposed_location') {
            frontendCategory = `radio_unit_${index + 1}_front`;
          } else if (img.category === 'proposed_location_optional') {
            frontendCategory = `radio_unit_${index + 1}_back`;
          }

          // Ensure the file_url has the correct format
          let fileUrl = img.file_url;
          if (!fileUrl.startsWith('http') && !fileUrl.startsWith('/')) {
            fileUrl = `/${fileUrl}`;
          }

          imagesByCategory[frontendCategory] = [{
            id: img.id,
            file_url: fileUrl,
            url: `${import.meta.env.VITE_API_URL}${fileUrl}`,
            name: img.original_filename || `image_${img.id}`
          }];
        });
      }
    });

    console.log('Processed images from response:', imagesByCategory);
    return imagesByCategory;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const prevFormData = { ...formData };

    try {
      const apiData = mapFormToApiData(formData);
      console.log("Submitting radio units data:", JSON.stringify(apiData, null, 2));
      console.log("Radio unit count being sent:", apiData.radio_unit_count);

      // Create FormData for multipart submission
      const submitFormData = new FormData();

      // Add the radio units data as radio_units_data field
      submitFormData.append('radio_units_data', JSON.stringify(apiData));

      // Handle images - only send fields that have new files or are explicitly removed
      const allImageFields = getAllImages();
      console.log('All image fields:', allImageFields.map(f => f.name));
      console.log('Uploaded images:', Object.keys(uploadedImages));
      console.log('Removed images:', Object.keys(removedImages));

      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        const isExplicitlyRemoved = removedImages[imageField.name];

        console.log(`Processing image field: ${imageField.name}`, { imageFiles, isExplicitlyRemoved });

        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            console.log(`Adding file for ${imageField.name}:`, file.name);
            submitFormData.append(imageField.name, file);
          } else {
            console.log(`Skipping non-File object for ${imageField.name}:`, file);
          }
        } else if (isExplicitlyRemoved) {
          // Only send empty string if image was explicitly removed by user
          console.log(`Adding empty string for explicitly removed ${imageField.name}`);
          submitFormData.append(imageField.name, '');
        } else {
          // Don't send anything for unchanged images
          console.log(`Skipping unchanged image field: ${imageField.name}`);
        }
      });

      // Log FormData entries for debugging
      console.log('FormData entries for submission:');
      for (let pair of submitFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/radio-units/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/radio-units/${sessionId}`);
      const latestData = getResponse.data.data || getResponse.data;

      if (latestData) {
        const mappedData = mapApiToFormData(latestData);
        setFormData(mappedData);

        // Process and update images if they exist
        if (latestData.radio_units?.some(unit => unit.images?.length > 0)) {
          const processedImages = processImagesFromResponse(latestData.radio_units);
          console.log("Processed images from response:", processedImages);
          setUploadedImages(processedImages);
          // Clear removedImages state since we're loading fresh data from backend
          setRemovedImages({});
        } else {
          console.log("No images found in response, keeping existing uploaded images");
          console.log("Current uploadedImages:", uploadedImages);
          // Keep existing uploaded images that are File objects
          const newUploadedImages = {};
          Object.entries(uploadedImages).forEach(([key, files]) => {
            if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
              newUploadedImages[key] = files;
            }
          });
          console.log("Filtered uploadedImages:", newUploadedImages);
          setUploadedImages(newUploadedImages);
          // Clear removedImages state since we're loading fresh data from backend
          setRemovedImages({});
        }
      }

      setHasUnsavedChanges(false); // Reset unsaved changes after successful save
      showSuccess('Radio units data submitted successfully!');
    } catch (err) {
      console.error("Error submitting radio units data:", err);
      console.error("Full error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
      // Restore previous form data if submission failed
      setFormData(prevFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNokiaVendor = () => {
    return formData.radioUnits.some(unit => unit.vendor === 'Nokia');
  };

  const hasOtherVendor = () => {
    return formData.radioUnits.some(unit => unit.vendor && unit.vendor !== 'Nokia');
  };

  // Add these functions before the return statement
  const getRadioUnitImages = (unitNumber) => [
    { label: `Radio Unit #${unitNumber} Front Photo`, name: `radio_unit_${unitNumber}_front` },
    { label: `Radio Unit #${unitNumber} Back Photo`, name: `radio_unit_${unitNumber}_back` },
    { label: `Radio Unit #${unitNumber} Label Photo`, name: `radio_unit_${unitNumber}_label` },
    { label: `Radio Unit #${unitNumber} Side Photo`, name: `radio_unit_${unitNumber}_side` },
    { label: `Radio Unit #${unitNumber} RF jumper ports Photo`, name: `radio_unit_${unitNumber}_rf_jumper_ports` },
    { label: `Radio Unit #${unitNumber} RF Fiber ports Photo`, name: `radio_unit_${unitNumber}_rf_fiber_ports` },
    { label: `Radio Unit #${unitNumber} RF and its mount Photo`, name: `radio_unit_${unitNumber}_rf_and_its_mount` },
    { label: `Radio Unit #${unitNumber} RF label (SN label) Photo`, name: `radio_unit_${unitNumber}_rf_label_sn_label` },
    { label: `Radio Unit #${unitNumber} RF Power Port Photo`, name: `radio_unit_${unitNumber}_rf_power_port` }, 
  ];

  // Generate all image fields based on radio unit count
  const getAllImages = () => {
    if (!formData.numberOfRadioUnits) return [];
    const count = parseInt(formData.numberOfRadioUnits);
    let allImages = [];
    for (let i = 1; i <= count; i++) {
      allImages = [...allImages, ...getRadioUnitImages(i)];
    }
    return allImages;
  };

  // Function to save data via API (for use with useUnsavedChanges hook)
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;

    try {
      const apiData = mapFormToApiData(formData);

      // Create FormData for multipart submission
      const submitFormData = new FormData();
      submitFormData.append('radio_units_data', JSON.stringify(apiData));

      // Handle images - only send fields that have new files or are explicitly removed
      const allImageFields = getAllImages();

      allImageFields.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        const isExplicitlyRemoved = removedImages[imageField.name];

        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            submitFormData.append(imageField.name, file);
          }
        } else if (isExplicitlyRemoved) {
          submitFormData.append(imageField.name, '');
        }
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/radio-units/${sessionId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("Error saving data:", err);
      return false;
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

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



          <div>
            <label className="block text-lg font-semibold mb-1">
              How many radio units on site?
            </label>
            <select
              className="form-input"
              value={formData.numberOfRadioUnits}
              onChange={handleRadioUnitCountChange}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Table Layout */}
          <div className="flex-1 overflow-y-auto mt-5">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th
                    className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-20"
                    style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                  >
                    Field Description
                  </th>
                  {Array.from({ length: formData.numberOfRadioUnits }, (_, i) => (
                    <th
                      key={i}
                    className="border px-4 py-3 text-center font-semibold min-w-[400px] sticky top-0 bg-blue-500 z-10"
                    >
                      Radio Unit #{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Operator */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    If shared site, radio unit belongs to which operator?
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <select
                        value={unit.operator}
                        onChange={(e) => handleChange(unitIndex, 'operator', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${unit.operatorAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                      >
                        <option value="">-- Select --</option>
                        {operators.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                      {errors[`${unitIndex}.operator`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.operator`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit band
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-1 py-1 align-top">
                    <div className="grid grid-cols-4 text-xs gap-1">
                      {["700", "900", "1800", "2100", "2300", "2600", "3500"].map((band) => (
                        <label key={band} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={Array.isArray(unit.band) && unit.band.includes(band) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = Array.isArray(unit.band) && unit.band || [];
                              const updated = checked
                                ? [...current, band]
                                : current.filter((val) => val !== band);
                              handleChange(unitIndex, "band", updated);
                            }}
                          />
                          {band}
                        </label>
                      ))}
                    </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                  Connected to base band (BTS)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-1 py-1 align-top">
                    <div className="grid grid-cols-4 text-xs gap-1">
                      {["Base band 1", "Base band 2", "Base band 3", "Base band 4", "Base band 5", "Base band 6", "Base band 7"].map((band) => (
                        <label key={band} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={Array.isArray(unit.connectedToBaseBand) && unit.connectedToBaseBand.includes(band) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = Array.isArray(unit.connectedToBaseBand) && unit.connectedToBaseBand || [];
                              const updated = checked
                                ? [...current, band]
                                : current.filter((val) => val !== band);
                              handleChange(unitIndex, "connectedToBaseBand", updated);
                            }}
                          />
                          {band}
                        </label>
                      ))}
                    </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                  Radio Module Technology
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-1 py-1 align-top">
                    <div className="grid grid-cols-4 text-xs gap-1">
                      {["2G", "3G", "4G", "5G"].map((tech) => (
                        <label key={tech} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={Array.isArray(unit.technologies) && unit.technologies.includes(tech) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = Array.isArray(unit.technologies) && unit.technologies || [];
                              const updated = checked
                                ? [...current, tech]
                                : current.filter((val) => val !== tech);
                              handleChange(unitIndex, "technologies", updated);
                            }}
                          />
                          {tech}
                        </label>
                      ))}
                    </div>
                    </td>
                  ))}
                </tr>
                {/* Base Height */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit base height from tower base level (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.baseHeight}
                        onChange={(e) => handleChange(unitIndex, 'baseHeight', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${unit.baseHeightAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                        placeholder="000"
                      />
                      {errors[`${unitIndex}.baseHeight`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.baseHeight`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Tower Leg */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit located at tower leg
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <div className={`flex gap-2 ${unit.tower_legAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                        }`}>
                        {['A', 'B', 'C', 'D'].map(leg => (
                          <label key={leg} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`tower_leg-${unitIndex}`}
                              value={leg}
                              checked={unit.tower_leg === leg}
                              onChange={(e) => handleChange(unitIndex, 'tower_leg', e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={unit.tower_legAutoFilled ? 'text-[#006100]' : ''}>
                              {leg}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors[`${unitIndex}.tower_leg`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.tower_leg`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Radio Unit Vendor */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit vendor
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <div className={`grid grid-cols-3 gap-1 ${unit.vendorAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                        }`}>
                        {['Nokia', 'Huawei', 'Ericsson', 'ZTE', 'Other'].map(vendor => (
                          <label key={vendor} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`vendor-${unitIndex}`}
                              value={vendor}
                              checked={unit.vendor === vendor}
                              onChange={(e) => handleChange(unitIndex, 'vendor', e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={unit.vendorAutoFilled ? 'text-[#006100]' : ''}>
                              {vendor}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors[`${unitIndex}.vendor`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.vendor`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Nokia Model - Only show if Nokia is selected */}
                {hasNokiaVendor() && (
                  <>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia, what is the radio unit model?
                      </td>
                      {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                        <td key={unitIndex} className="border px-2 py-2">
                          <select
                            value={unit.nokiaModel}
                            onChange={(e) => handleChange(unitIndex, 'nokiaModel', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${unit.vendor !== 'Nokia' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                              }`}
                            disabled={unit.vendor !== 'Nokia'}
                          >
                            <option value="">-- Select Nokia Model --</option>
                            {nokiaModels.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                          {errors[`${unitIndex}.nokiaModel`] && unit.vendor === 'Nokia' && (
                            <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.nokiaModel`]}</div>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia, how many port?
                      </td>
                      {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                        <td key={unitIndex} className="border px-2 py-2">
                          <div className="flex gap-2 flex-wrap">
                            {['2', '4', '6', '8', '9'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  name={`nokiaPortCount-${unitIndex}`}
                                  value={option}
                                  checked={unit.nokiaPortCount === option}
                                  onChange={(e) => handleChange(unitIndex, 'nokiaPortCount', e.target.value)}
                                  className="w-4 h-4"
                                  disabled={unit.vendor !== 'Nokia'}
                                />
                                <span className={unit.vendor !== 'Nokia' ? 'text-gray-400' : ''}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                          {errors[`${unitIndex}.nokiaPortCount`] && unit.vendor === 'Nokia' && (
                            <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.nokiaPortCount`]}</div>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If Nokia, radio unit port connectivity details
                      </td>
                      {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                        <td key={unitIndex} className="border px-2 py-2">
                          {unit.vendor === 'Nokia' ? (
                            <DynamicTable
                              data={unit.nokiaPortConnectivity}
                              onChange={(newData) => handleTableDataChange(unitIndex, newData)}
                              unitIndex={unitIndex}
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">Nokia vendor not selected</div>
                          )}
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
                        If other vendor, what is the radio unit model?
                      </td>
                      {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                        <td key={unitIndex} className="border px-2 py-2">
                          <input
                            type="text"
                            value={unit.otherModel}
                            onChange={(e) => handleChange(unitIndex, 'otherModel', e.target.value)}
                            className={`w-full p-2 border rounded text-sm ${unit.vendor === 'Nokia' || !unit.vendor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                              }`}
                            placeholder={unit.vendor !== 'Nokia' && unit.vendor ? 'Enter model' : 'N/A'}
                            disabled={unit.vendor === 'Nokia' || !unit.vendor}
                          />
                          {errors[`${unitIndex}.otherModel`] && unit.vendor !== 'Nokia' && unit.vendor && (
                            <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.otherModel`]}</div>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                        If other vendor, radio unit dimensions (cm): Length / Width / Depth
                      </td>

                      {formData.radioUnits
                        .slice(0, formData.numberOfRadioUnits)
                        .map((unit, unitIndex) => {
                          const isDisabled = unit.vendor === 'Nokia' || !unit.vendor;
                          return (
                            <td key={unitIndex} className="border px-2 py-2">
                              <div className="flex gap-1">
                                {/* Length */}
                                <input
                                  type="number"
                                  value={unit.otherLength}
                                  onChange={(e) => handleChange(unitIndex, 'otherLength', e.target.value)}
                                  className={`w-full p-1 border rounded text-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                    }`}
                                  placeholder={isDisabled ? 'N/A' : 'L'}
                                  disabled={isDisabled}
                                />

                                {/* Width */}
                                <input
                                  type="number"
                                  value={unit.otherWidth}
                                  onChange={(e) => handleChange(unitIndex, 'otherWidth', e.target.value)}
                                  className={`w-full p-1 border rounded text-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                    }`}
                                  placeholder={isDisabled ? 'N/A' : 'W'}
                                  disabled={isDisabled}
                                />

                                {/* Depth */}
                                <input
                                  type="number"
                                  value={unit.otherDepth}
                                  onChange={(e) => handleChange(unitIndex, 'otherDepth', e.target.value)}
                                  className={`w-full p-1 border rounded text-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                    }`}
                                  placeholder={isDisabled ? 'N/A' : 'D'}
                                  disabled={isDisabled}
                                />
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                  </>
                )}

                {/* Radio unit side arm */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit side arm (cm)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <div className="space-y-1">
                        {[
                          'Same antenna side arm',
                          'Separate side arm only for the radio unit',
                          'Shared side arm with other radio units'
                        ].map(option => (
                          <label key={option} className="flex items-center gap-1 text-xs">
                            <input
                              type="radio"
                              name={`sideArmType-${unitIndex}`}
                              value={option}
                              checked={unit.sideArmType === option}
                              onChange={(e) => handleChange(unitIndex, 'sideArmType', e.target.value)}
                              className="w-3 h-3"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Side Arm Length - conditional */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If not same side arm as the antenna, What is the radio unit side arm length? (cm)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.sideArmType !== 'Same antenna side arm' ? unit.sideArmLength : ' '}
                        onChange={(e) => handleChange(unitIndex, 'sideArmLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder={unit.sideArmType !== 'Same antenna side arm' ? '000' : 'N/A'}
                        disabled={unit.sideArmType === 'Same antenna side arm'}
                      />
                    </td>
                  ))}
                </tr>

                {/* Side Arm Diameter - conditional */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If not same side arm as the antenna, What is the radio unit side arm diameter? (cm)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.sideArmType !== 'Same antenna side arm' ? unit.sideArmDiameter : ' '}
                        onChange={(e) => handleChange(unitIndex, 'sideArmDiameter', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder={unit.sideArmType !== 'Same antenna side arm' ? '000' : 'N/A'}
                        disabled={unit.sideArmType === 'Same antenna side arm'}
                      />
                    </td>
                  ))}
                </tr>

                {/* Side Arm Offset - conditional */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If not same side arm as the antenna, What is the radio unit side arm offset from tower leg?
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.sideArmType !== 'Same antenna side arm' ? unit.sideArmOffset : ' '}
                        onChange={(e) => handleChange(unitIndex, 'sideArmOffset', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder={unit.sideArmType !== 'Same antenna side arm' ? '000' : 'N/A'}
                        disabled={unit.sideArmType === 'Same antenna side arm'}
                      />
                    </td>
                  ))}
                </tr>

                {/* DC Power Source */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Radio unit DC power coming from
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <select
                        value={unit.dcPowerSource}
                        onChange={(e) => handleChange(unitIndex, 'dcPowerSource', e.target.value)}
                        className={`w-full p-2 border rounded text-sm ${unit.dcPowerSourceAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                          }`}
                      >
                        <option value="">-- Select --</option>
                        {generateCabinetOptions().map(cabinet => (
                          <option key={cabinet} value={cabinet}>
                            {cabinet}
                          </option>
                        ))}

                      </select>
                    </td>
                  ))}
                </tr>

                {/* DC CB/Fuse */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Which DC CB/fuse at the DC source side is feeding the PDU?
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <select
                        value={unit.dcCbFuse}
                        onChange={(e) => handleChange(unitIndex, 'dcCbFuse', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        disabled={!unit.dcPowerSource || !unit.dcPowerSource.startsWith('Cabinet ')}
                      >
                        <option value="">-- Select --</option>
                        {(dcOptions[unitIndex] || []).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.display_text}
                          </option>
                        ))}
                      </select>
                      {!unit.dcPowerSource || !unit.dcPowerSource.startsWith('Cabinet ') ? (
                        <div className="text-xs text-gray-500 mt-1">
                          Select a cabinet first
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>

                {/* DC Cable Length */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Length of the DC power cable from the radio unit to the DC CB/fuse location (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.dcCableLength}
                        onChange={(e) => handleChange(unitIndex, 'dcCableLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* DC Cable Cross Section */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Cross section of DC power cable from the radio unit to the DC CB/fuse (mm2)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.dcCableCrossSection}
                        onChange={(e) => handleChange(unitIndex, 'dcCableCrossSection', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Fiber Cable Length */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Length of fiber cable from the radio unit to the base band (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.fiberCableLength}
                        onChange={(e) => handleChange(unitIndex, 'fiberCableLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Jumper Length */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Length of jumper between the antenna & radio unit (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <select
                        value={unit.jumperLength}
                        onChange={(e) => handleChange(unitIndex, 'jumperLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">-- Select --</option>
                        {Array.from({ length: 15 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Feeder Type */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Feeder type, if exist
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <div className={`grid grid-cols-4 gap-1 ${unit.feederTypeAutoFilled ? 'bg-[#c6efce] text-[#006100]' : ''
                        }`}>
                        {feederTypes.map(type => (
                          <label key={type} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name={`feederType-${unitIndex}`}
                              value={type}
                              checked={unit.feederType === type}
                              onChange={(e) => handleChange(unitIndex, 'feederType', e.target.value)}
                              className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={unit.feederTypeAutoFilled ? 'text-[#006100]' : ''}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Feeder Length */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Feeder length, if exist (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.feederLength}
                        onChange={(e) => handleChange(unitIndex, 'feederLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>


                {/* Earth Cable Length */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Length of earth cable connected to the earth bus bar (m)
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={unit.earthCableLength}
                        onChange={(e) => handleChange(unitIndex, 'earthCableLength', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                
                {/* Include in Plan */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                  Is any action planned for Radio unit ?
                  </td>
                  {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                    <td key={unitIndex} className="border px-2 py-2">
                      <div className="flex gap-4">
                        {['Swap', 'Dismantle', 'No action'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`actionPlanned-${unitIndex}`}
                              value={option}
                              checked={unit.actionPlanned === option}
                              onChange={(e) => handleChange(unitIndex, 'actionPlanned', e.target.value)}
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

export default RadioUnitsForm;
