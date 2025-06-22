import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaRegTrashAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../../../utils/notifications';

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
        operator: '',
        baseHeight: '',
        towerLeg: '',
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
        earthCableLength: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});
  

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
      operator: '',
      baseHeight: '',
      towerLeg: '',
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
      earthCableLength: ''
    };

    // Helper function to map DC power source from API to form format
    const mapDcPowerSource = (apiValue) => {
      if (!apiValue) return '';
      if (apiValue.startsWith('cabinet_')) {
        const cabinetNum = apiValue.split('_')[1];
        return `Cabinet ${cabinetNum}`;
      }
      if (apiValue === 'external_pdu_1_main_feed') return 'External DC PDU #1';
      if (apiValue === 'external_pdu_2_main_feed') return 'External DC PDU #2';
      if (apiValue === 'directly_from_rectifier_distribution') return 'Directly from rectifier distribution';
      return apiValue; // Return as-is if no mapping found
    };

    // Helper function to map side arm from API to form format
    const mapSideArmType = (apiValue) => {
      if (!apiValue) return '';
      if (apiValue === 'same_antenna_side_arm') return 'Same antenna side arm';
      if (apiValue === 'separate_side_arm') return 'Separate side arm only for the radio unit';
      if (apiValue === 'shared_side_arm') return 'Shared side arm with other radio units';
      return apiValue; // Return as-is if no mapping found
    };

    const radioUnits = Array.from({ length: 20 }, (_, index) => {
      const apiUnit = apiData.radio_units?.[index];
      if (!apiUnit) {
        return { ...defaultRadioUnit };
      }

      return {
        operator: apiUnit.operator || '',
        baseHeight: apiUnit.base_height?.toString() || '',
        towerLeg: apiUnit.tower_leg || '',
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
        jumperLength: apiUnit.jumper_length_antenna_radio || '',
        feederType: apiUnit.feeder_type || '',
        feederLength: apiUnit.feeder_length?.toString() || '',
        includeInPlan: apiUnit.swap_upgrade_plan || '',
        earthCableLength: apiUnit.earth_cable_length?.toString() || ''
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
      radio_units: activeUnits.map(unit => {
        const apiUnit = {
          operator: unit.operator || null,
          base_height: unit.baseHeight ? parseFloat(unit.baseHeight) : null,
          tower_leg: unit.towerLeg || null,
          vendor: unit.vendor || null,
          dc_power_source: mapDcPowerSourceToApi(unit.dcPowerSource),
          dc_cb_fuse: unit.dcCbFuse || null,
          dc_power_cable_length: unit.dcCableLength ? parseFloat(unit.dcCableLength) : null,
          dc_power_cable_cross_section: unit.dcCableCrossSection ? parseFloat(unit.dcCableCrossSection) : null,
          fiber_cable_length: unit.fiberCableLength ? parseFloat(unit.fiberCableLength) : null,
          jumper_length_antenna_radio: unit.jumperLength || null,
          feeder_type: unit.feederType || null,
          feeder_length: unit.feederLength ? parseFloat(unit.feederLength) : null,
          swap_upgrade_plan: unit.includeInPlan || null,
          earth_cable_length: unit.earthCableLength ? parseFloat(unit.earthCableLength) : null
        };

        // Add Nokia-specific fields
        if (unit.vendor === 'Nokia') {
          apiUnit.nokia_model = unit.nokiaModel || null;
          apiUnit.nokia_ports = unit.nokiaPortCount || null;
          apiUnit.nokia_port_connectivity = unit.nokiaPortConnectivity
            .filter(conn => conn.sector || conn.antenna || conn.jumperLength)
            .map(conn => ({
              sector: conn.sector ? parseInt(conn.sector) : null,
              antenna: conn.antenna ? parseInt(conn.antenna) : null,
              jumper_length: conn.jumperLength ? parseFloat(conn.jumperLength) : null
            }));
        }

        // Add other vendor fields
        if (unit.vendor && unit.vendor !== 'Nokia') {
          apiUnit.other_vendor_model = unit.otherModel || null;
          apiUnit.other_length = unit.otherLength ? parseFloat(unit.otherLength) : null;
          apiUnit.other_width = unit.otherWidth ? parseFloat(unit.otherWidth) : null;
          apiUnit.other_depth = unit.otherDepth ? parseFloat(unit.otherDepth) : null;
        }

        // Add side arm fields - always include if sideArmType is selected
        if (unit.sideArmType) {
          apiUnit.radio_unit_side_arm = mapSideArmTypeToApi(unit.sideArmType);
          if (unit.sideArmType !== 'Same antenna side arm') {
            apiUnit.radio_unit_side_arm_length = unit.sideArmLength ? parseFloat(unit.sideArmLength) : null;
            apiUnit.radio_unit_side_arm_diameter = unit.sideArmDiameter ? parseFloat(unit.sideArmDiameter) : null;
            apiUnit.radio_unit_side_arm_offset = unit.sideArmOffset ? parseFloat(unit.sideArmOffset) : null;
          }
        }

        return apiUnit;
      })
    };
  }, []);

  // Fetch relations and existing data when component loads
  useEffect(() => {
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
            setFormData(mappedData);
            
            // Fetch DC options for units that have cabinet selections
            mappedData.radioUnits.forEach((unit, index) => {
              if (unit.dcPowerSource && unit.dcPowerSource.startsWith('Cabinet ')) {
                const cabinetNumber = unit.dcPowerSource.split(' ')[1];
                fetchDcOptions(index, cabinetNumber);
              }
            });
          }
        } catch (radioUnitsError) {
          if (radioUnitsError.response?.status !== 404) {
            console.error("Error loading radio units data:", radioUnitsError);
            showError('Error loading existing radio units data');
          }
        }
        
      } catch (err) {
        console.error("Error loading relations data:", err);
        showError('Error loading form data');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId, mapApiToFormData]);

  const handleRadioUnitCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    
    // Create new array with the desired length
    const newRadioUnits = Array(20).fill(null).map((_, index) => {
      if (index < count) {
        // Keep existing data for units within the new count
        return formData.radioUnits[index] || {
          operator: '',
          baseHeight: '',
          towerLeg: '',
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
          earthCableLength: ''
        };
      } else {
        // Clear data for units beyond the new count
        return {
          operator: '',
          baseHeight: '',
          towerLeg: '',
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
          earthCableLength: ''
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
  };

  const handleChange = (unitIndex, field, value) => {
    const newRadioUnits = [...formData.radioUnits];
    newRadioUnits[unitIndex] = {
      ...newRadioUnits[unitIndex],
      [field]: value
    };

    setFormData({
      ...formData,
      radioUnits: newRadioUnits
    });

    // If changing DC power source to a cabinet, fetch DC options
    if (field === 'dcPowerSource' && value && value.startsWith('Cabinet ')) {
      const cabinetNumber = value.split(' ')[1]; // Extract cabinet number from "Cabinet X"
      fetchDcOptions(unitIndex, cabinetNumber);
      
      // Clear the DC CB/Fuse selection when cabinet changes
      newRadioUnits[unitIndex].dcCbFuse = '';
      setFormData({
        ...formData,
        radioUnits: newRadioUnits
      });
    }

    // Clear error for this field
    if (errors[`${unitIndex}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${unitIndex}.${field}`];
      setErrors(newErrors);
    }
  };

  const handleTableDataChange = (unitIndex, newData) => {
    handleChange(unitIndex, 'nokiaPortConnectivity', newData);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const apiData = mapFormToApiData(formData);
      console.log("Submitting radio units data:", apiData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/radio-units/${sessionId}`, 
        apiData
      );
      
      showSuccess('Radio units data submitted successfully!');
      console.log("Response:", response.data);
      setErrors({}); // Clear any previous errors
    } catch (err) {
      console.error("Error submitting radio units data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const hasNokiaVendor = () => {
    return formData.radioUnits.some(unit => unit.vendor === 'Nokia');
  };

  const hasOtherVendor = () => {
    return formData.radioUnits.some(unit => unit.vendor && unit.vendor !== 'Nokia');
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Loading radio units data...</div>
          </div>
        ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-lg font-semibold mb-1">
          How many radio units on site?
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
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
  <div className="overflow-auto max-h-[600px]">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th
                    className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                    style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                  >
                    Field Description
                  </th>
                    {Array.from({ length: formData.numberOfRadioUnits }, (_, i) => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-20"
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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
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
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D'].map(leg => (
                          <label key={leg} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                                name={`towerLeg-${unitIndex}`}
                              value={leg}
                                checked={unit.towerLeg === leg}
                                onChange={(e) => handleChange(unitIndex, 'towerLeg', e.target.value)}
                              className="w-4 h-4"
                            />
                            {leg}
                          </label>
                        ))}
                      </div>
                        {errors[`${unitIndex}.towerLeg`] && (
                          <div className="text-red-500 text-xs mt-1">{errors[`${unitIndex}.towerLeg`]}</div>
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
                        <div className="grid grid-cols-3 gap-1">
                          {['Nokia', 'Huawei', 'Ericsson', 'ZTE', 'Other'].map(vendor => (
                          <label key={vendor} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                                name={`vendor-${unitIndex}`}
                              value={vendor}
                                checked={unit.vendor === vendor}
                                onChange={(e) => handleChange(unitIndex, 'vendor', e.target.value)}
                              className="w-4 h-4"
                            />
                            {vendor}
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
                              className={`w-full p-2 border rounded text-sm ${unit.vendor !== 'Nokia'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : ''}`}
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
                              className={`w-full p-2 border rounded text-sm ${unit.vendor === 'Nokia' || !unit.vendor
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
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
                          If other vendor, radio unit dimensions, length (cm)
                    </td>
                        {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                          <td key={unitIndex} className="border px-2 py-2">
                        <input
                          type="number"
                              value={unit.otherLength}
                              onChange={(e) => handleChange(unitIndex, 'otherLength', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${unit.vendor === 'Nokia' || !unit.vendor
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
                              placeholder={unit.vendor !== 'Nokia' && unit.vendor ? '000' : 'N/A'}
                              disabled={unit.vendor === 'Nokia' || !unit.vendor}
                        />
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                          If other vendor, radio unit dimensions, width (cm)
                    </td>
                        {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                          <td key={unitIndex} className="border px-2 py-2">
                        <input
                          type="number"
                              value={unit.otherWidth}
                              onChange={(e) => handleChange(unitIndex, 'otherWidth', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${unit.vendor === 'Nokia' || !unit.vendor
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
                              placeholder={unit.vendor !== 'Nokia' && unit.vendor ? '000' : 'N/A'}
                              disabled={unit.vendor === 'Nokia' || !unit.vendor}
                        />
                      </td>
                    ))}
                  </tr>   

                      <tr className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                          If other vendor, radio unit dimensions, depth (cm)
                    </td>
                        {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                          <td key={unitIndex} className="border px-2 py-2">
                        <input
                          type="number"
                              value={unit.otherDepth}
                              onChange={(e) => handleChange(unitIndex, 'otherDepth', e.target.value)}
                              className={`w-full p-2 border rounded text-sm ${unit.vendor === 'Nokia' || !unit.vendor
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
                              placeholder={unit.vendor !== 'Nokia' && unit.vendor ? '000' : 'N/A'}
                              disabled={unit.vendor === 'Nokia' || !unit.vendor}
                        />
                      </td>
                    ))}
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
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                      If not same side arm as the antenna, What is the radio unit side arm length? (cm)
                    </td>
                    {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                      <td key={unitIndex} className="border px-2 py-2">
                            <input
                          type="number"
                          value={unit.sideArmLength}
                          onChange={(e) => handleChange(unitIndex, 'sideArmLength', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="000"
                          disabled={unit.sideArmType === 'Same antenna side arm'}
                        />
                    </td>
                  ))}
                  </tr>

                  {/* Side Arm Diameter - conditional */}
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                      If not same side arm as the antenna, What is the radio unit side arm diameter? (cm)
                    </td>
                    {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                      <td key={unitIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={unit.sideArmDiameter}
                          onChange={(e) => handleChange(unitIndex, 'sideArmDiameter', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="000"
                          disabled={unit.sideArmType === 'Same antenna side arm'}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Side Arm Offset - conditional */}
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                      If not same side arm as the antenna, What is the radio unit side arm offset from tower leg?
                    </td>
                    {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                      <td key={unitIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={unit.sideArmOffset}
                          onChange={(e) => handleChange(unitIndex, 'sideArmOffset', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="000"
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
                          className="w-full p-2 border rounded text-sm"
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
                        <div className="grid grid-cols-4 gap-1">
                          {feederTypes.map(type => (
                            <label key={type} className="flex items-center gap-1 text-xs">
                              <input
                                type="radio"
                                name={`feederType-${unitIndex}`}
                                value={type}
                                checked={unit.feederType === type}
                                onChange={(e) => handleChange(unitIndex, 'feederType', e.target.value)}
                                className="w-3 h-3"
                              />
                              {type}
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

                {/* Include in Plan */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                      This radio unit included in the swap or upgrade plan
                  </td>
                    {formData.radioUnits.slice(0, formData.numberOfRadioUnits).map((unit, unitIndex) => (
                      <td key={unitIndex} className="border px-2 py-2">
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                                name={`includeInPlan-${unitIndex}`}
                              value={option}
                                checked={unit.includeInPlan === option}
                                onChange={(e) => handleChange(unitIndex, 'includeInPlan', e.target.value)}
                              className="w-4 h-4"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
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
        )}
    </div>
    </div>
  );
};

export default RadioUnitsForm;
