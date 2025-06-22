import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";

const RadioAntenasForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    numberOfAntennas: '',
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
    }))
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
            };
          });

    return {
      numberOfAntennas: apiData.antenna_count?.toString() || '',
            antennas: mergedAntennas
    };
  };

  // Helper function to map form data to API format
  const mapFormToApiData = (formData) => {
    const activeAntennas = formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 0);
    
    return {
      antenna_count: parseInt(formData.numberOfAntennas) || 0,
      antennas: activeAntennas.map(antenna => {
        const apiAntenna = {
          is_shared_site: antenna.operator ? true : false,
          base_height: antenna.baseHeight,
          tower_leg: antenna.towerLeg,
          sector: parseInt(antenna.sector) || null,
          technology: antenna.technology,
          azimuth_angle: antenna.azimuth,
          mechanical_tilt_exist: antenna.mechanicalTiltExist === 'Yes',
          electrical_tilt: antenna.electricalTilt,
          ret_connectivity: antenna.retConnectivity,
          vendor: antenna.vendor,
          side_arm_length: antenna.sideArmLength,
          side_arm_diameter: antenna.sideArmDiameter,
          side_arm_offset: antenna.sideArmOffset,
          earth_cable_length: antenna.earthCableLength,
          included_in_upgrade: antenna.includeInPlan === 'Yes'
        };

        // Add operator only if shared site
        if (antenna.operator) {
          apiAntenna.operator = antenna.operator;
        }

        // Add mechanical tilt only if it exists
        if (antenna.mechanicalTiltExist === 'Yes' && antenna.mechanicalTilt) {
          apiAntenna.mechanical_tilt = antenna.mechanicalTilt;
        }

        // Add Nokia-specific fields
        if (antenna.vendor === 'Nokia') {
          apiAntenna.is_active_antenna = antenna.isNokiaActive === 'Yes';
          if (antenna.nokiaModuleName) {
            apiAntenna.nokia_module_name = antenna.nokiaModuleName;
          }
          if (antenna.nokiaFiberCount) {
            apiAntenna.nokia_fiber_count = parseInt(antenna.nokiaFiberCount);
          }
          if (antenna.nokiaFiberLength) {
            apiAntenna.nokia_fiber_length = antenna.nokiaFiberLength;
          }
        }

        // Add other vendor fields
        if (antenna.vendor && antenna.vendor !== 'Nokia') {
          if (antenna.otherModelNumber) {
            apiAntenna.other_model_number = antenna.otherModelNumber;
          }
          if (antenna.otherLength) {
            apiAntenna.other_length = antenna.otherLength;
          }
          if (antenna.otherWidth) {
            apiAntenna.other_width = antenna.otherWidth;
          }
          if (antenna.otherDepth) {
            apiAntenna.other_depth = antenna.otherDepth;
          }
          if (antenna.otherPortType.length > 0) {
            apiAntenna.other_port_types = antenna.otherPortType;
          }
          if (antenna.otherBands.length > 0) {
            apiAntenna.other_bands = antenna.otherBands;
          }
          if (antenna.otherPortCount) {
            apiAntenna.other_total_ports = parseInt(antenna.otherPortCount);
          }
          if (antenna.otherFreePorts) {
            apiAntenna.other_free_ports = parseInt(antenna.otherFreePorts);
          }
          if (antenna.otherFreeBands.length > 0) {
            apiAntenna.other_free_port_bands = antenna.otherFreeBands;
          }
          if (antenna.otherRadioUnits) {
            apiAntenna.other_connected_radio_units = parseInt(antenna.otherRadioUnits);
          }
        }

        return apiAntenna;
      })
    };
  };

  // Fetch existing data when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/antenna-configuration/${sessionId}`);
        const apiData = response.data.data || response.data;
        
        console.log("Fetched antenna configuration data:", apiData);
        
        if (apiData) {
          const mappedData = mapApiToFormData(apiData);
          setFormData(mappedData);
        }
      } catch (err) {
        console.error("Error loading antenna configuration data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleChange = (antennaIndex, fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      antennas: prev.antennas.map((antenna, index) =>
        index === antennaIndex
          ? { ...antenna, [fieldName]: value }
          : antenna
      )
    }));
  };

  const handleCheckboxChange = (antennaIndex, fieldName, value, checked) => {
    setFormData(prev => ({
      ...prev,
      antennas: prev.antennas.map((antenna, index) =>
        index === antennaIndex
          ? {
            ...antenna,
            [fieldName]: checked
              ? [...antenna[fieldName], value]
              : antenna[fieldName].filter(item => item !== value)
          }
          : antenna
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.numberOfAntennas) {
        setError("Please select the number of antennas.");
        return;
      }

      const apiData = mapFormToApiData(formData);
      console.log("Submitting antenna configuration data:", apiData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/antenna-configuration/${sessionId}`, 
        apiData
      );
      
      showSuccess('Antenna configuration data submitted successfully!');
      console.log("Response:", response.data);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

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

  const images = [
    { label: 'Radio Antenna Overview Photo', name: 'radio_antenna_overview_photo' },
    { label: 'Antenna Detail Photo', name: 'antenna_detail_photo' },
    { label: 'Tower Leg Installation Photo', name: 'tower_leg_installation_photo' },
  ];

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Loading antenna configuration data...</div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Number of Antennas Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block font-semibold mb-2">How many antennas on site?</label>
            <select
              name="numberOfAntennas"
              value={formData.numberOfAntennas}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, numberOfAntennas: e.target.value }));
                setError("");
              }}
              className="border p-3 rounded-md w-48"
              required
            >
          
              {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

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
                  {Array.from({ length: parseInt(formData.numberOfAntennas) || 1 }, (_, i) => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-20"
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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
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
                        className="w-full p-2 border rounded text-sm"
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
                      <div className="grid grid-cols-2 gap-1">
                        {['2G', '3G', '4G', '5G'].map(tech => (
                          <label key={tech} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={antenna.technology.includes(tech)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'technology', tech, e.target.checked)}
                              className="w-4 h-4"
                            />
                            {tech}
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
                        className="w-full p-2 border rounded text-sm"
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
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`mechanicalTiltExist-${antennaIndex}`}
                              value={option}
                              checked={antenna.mechanicalTiltExist === option}
                              onChange={(e) => handleChange(antennaIndex, 'mechanicalTiltExist', e.target.value)}
                              className="w-4 h-4"
                            />
                            {option}
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
                          className={`w-full p-2 border rounded text-sm ${antenna.mechanicalTiltExist !== 'Yes' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
                          placeholder={antenna.mechanicalTiltExist === 'Yes' ? '0000' : 'N/A'}
                          disabled={antenna.mechanicalTiltExist !== 'Yes'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* Electrical Tilt */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Electrical tilt (degree)
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.electricalTilt}
                        onChange={(e) => handleChange(antennaIndex, 'electricalTilt', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="0000"
                      />
                    </td>
                  ))}
                </tr>

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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">-- Select --</option>
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
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0000"
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
                          className={`w-full p-2 border rounded text-sm ${antenna.vendor === 'Nokia' || !antenna.vendor 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
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
                              className={`w-full p-2 border rounded text-sm ${antenna.vendor === 'Nokia' || !antenna.vendor 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
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
                          className={`w-full p-2 border rounded text-sm ${antenna.vendor === 'Nokia' || !antenna.vendor 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
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
                          className={`w-full p-2 border rounded text-sm ${antenna.vendor === 'Nokia' || !antenna.vendor 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : ''}`}
                          placeholder={antenna.vendor !== 'Nokia' && antenna.vendor ? '0000' : 'N/A'}
                          disabled={antenna.vendor === 'Nokia' || !antenna.vendor}
                        />
                      </td>
                    ))}
                  </tr>     

                  <tr>
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
                              checked={antenna.otherPortType.includes(port)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherPortType', port, e.target.checked)}
                              className="w-4 h-4"
                            />
                            {port}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr>

                  <tr>
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
                              checked={antenna.otherBands.includes(band)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherBands', band, e.target.checked)}
                              className="w-4 h-4"
                            />
                            {band}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr>

                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If other vendor, total number of antenna ports
                    </td>
                    {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.otherPortCount}
                          onChange={(e) => handleChange(antennaIndex, 'otherPortCount', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0000"
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
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0000"
                        />
                      </td>
                    ))}
                  </tr>

                  <tr>
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
                              checked={antenna.otherFreeBands.includes(freeBand)}
                              onChange={(e) => handleCheckboxChange(antennaIndex, 'otherFreeBands', freeBand, e.target.checked)}
                              className="w-4 h-4"
                            />
                            {freeBand}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                  </tr>

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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
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
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Include in Plan */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    This antenna included in the swap or upgrade plan
                  </td>
                  {formData.antennas.slice(0, parseInt(formData.numberOfAntennas) || 1).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(option => (
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
      <ImageUploader images={images} />
    </div>
  );
};

export default RadioAntenasForm;
