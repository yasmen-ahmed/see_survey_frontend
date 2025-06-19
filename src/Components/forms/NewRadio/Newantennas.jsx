import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';

const initialAntennaForm = {
  operator: '',
  baseHeight: '',
  towerLeg: '',
  sectorNumber: '',
  newOrSwap: '',
  technologies: [],
  azimuth: '',
  angularL1Dimension: '',
  angularL2Dimension: '',
  tubularCrossSection: '',
  towerSection: '',
  sideArmOption: '',
  sideArmLength: '',
  sideArmCrossSection: '',
  sideArmOffset: '',
  earthBusExists: '',
  earthCableLength: '',
};

const operators = ['Operator 1', 'Operator 2', 'Operator 3', 'Operator 4'];
const technologies = ['2G', '3G', '4G', '5G'];
const sideArmOptions = [
  'Use existing empty side arm',
  'Use swapped antenna side arm',
  'New side arm need to be supplied'
];

const NewAntennaForm = () => {
  const { sessionId } = useParams();
  const [antennaCount, setAntennaCount] = useState(1);
  const [antennaForms, setAntennaForms] = useState(Array(6).fill().map(() => ({ ...initialAntennaForm })));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`);
        const data = response.data;
        
        console.log("Fetched new antennas data:", data);
        
        if (data && data.antennas) {
          const count = data.new_antennas_planned || data.antennas.length;
          setAntennaCount(count);
          
          // Map API data to form structure
          const newAntennaForms = Array(6).fill().map((_, index) => {
            if (index < data.antennas.length) {
              const antenna = data.antennas[index];
              return {
                operator: antenna.operator || '',
                baseHeight: antenna.base_height_from_tower || '',
                towerLeg: antenna.tower_leg_location || '',
                sectorNumber: antenna.sector_number || '',
                newOrSwap: antenna.new_or_swap || '',
                technologies: antenna.antenna_technology || [],
                azimuth: antenna.azimuth_angle_shift || '',
                angularL1Dimension: antenna.angular_l1_dimension || '',
                angularL2Dimension: antenna.angular_l2_dimension || '',
                tubularCrossSection: antenna.tubular_cross_section || '',
                towerSection: antenna.tower_leg_section || '',
                sideArmOption: antenna.side_arm_type || '',
                sideArmLength: antenna.side_arm_length || '',
                sideArmCrossSection: antenna.side_arm_cross_section || '',
                sideArmOffset: antenna.side_arm_offset || '',
                earthBusExists: antenna.earth_bus_bar_exists || '',
                earthCableLength: antenna.earth_cable_length || '',
              };
            }
            return { ...initialAntennaForm };
          });
          
          setAntennaForms(newAntennaForms);
        }
      } catch (err) {
        console.error("Error loading new antennas data:", err);
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

  const handleAntennaCountChange = (e) => {
    const count = parseInt(e.target.value, 10);

    // Create new array preserving existing data
    const newAntennaForms = Array(6).fill(null).map((_, index) => {
      if (index < count) {
        // Keep existing data for antennas within the new count
        return antennaForms[index] || { ...initialAntennaForm };
      } else {
        // Clear data for antennas beyond the new count
        return { ...initialAntennaForm };
      }
    });

    setAntennaCount(count);
    setAntennaForms(newAntennaForms);
  };

  const handleChange = (antennaIndex, field, value) => {
    setAntennaForms(prev => {
      const updated = [...prev];
      const antenna = { ...updated[antennaIndex] }; // Clone the specific antenna object

      if (field === 'technologies') {
        const currentTechs = antenna.technologies || [];
        antenna.technologies = currentTechs.includes(value)
          ? currentTechs.filter(t => t !== value)
          : [...currentTechs, value];
      } else {
        antenna[field] = value;
      }

      updated[antennaIndex] = antenna; // Replace with updated antenna object

      return updated;
    });

    // Clear error for this field
    const errorKey = `${antennaIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    antennaForms.slice(0, antennaCount).forEach((antenna, index) => {
      if (!antenna.sectorNumber) {
        newErrors[`${index}.sectorNumber`] = 'Please select sector number';
      }
      if (!antenna.newOrSwap) {
        newErrors[`${index}.newOrSwap`] = 'Please select new or swap';
      }
      if (!antenna.technologies || antenna.technologies.length === 0) {
        newErrors[`${index}.technologies`] = 'Please select at least one technology';
      }
      if (!antenna.baseHeight) {
        newErrors[`${index}.baseHeight`] = 'Please enter base height';
      }
      if (!antenna.towerLeg) {
        newErrors[`${index}.towerLeg`] = 'Please select tower leg';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        new_antennas_planned: antennaCount,
        antennas: antennaForms.slice(0, antennaCount).map((antenna, index) => ({
          antenna_index: index + 1,
          sector_number: antenna.sectorNumber || null,
          new_or_swap: antenna.newOrSwap || null,
          antenna_technology: antenna.technologies || [],
          azimuth_angle_shift: antenna.azimuth ? parseFloat(antenna.azimuth).toFixed(3) : null,
          base_height_from_tower: antenna.baseHeight ? parseFloat(antenna.baseHeight).toFixed(3) : null,
          tower_leg_location: antenna.towerLeg || null,
          tower_leg_section: antenna.towerSection || null,
          angular_l1_dimension: antenna.angularL1Dimension ? parseFloat(antenna.angularL1Dimension).toFixed(2) : null,
          angular_l2_dimension: antenna.angularL2Dimension ? parseFloat(antenna.angularL2Dimension).toFixed(2) : null,
          tubular_cross_section: antenna.tubularCrossSection ? parseFloat(antenna.tubularCrossSection).toFixed(2) : null,
          side_arm_type: antenna.sideArmOption || null,
          side_arm_length: antenna.sideArmLength ? parseFloat(antenna.sideArmLength).toFixed(3) : null,
          side_arm_cross_section: antenna.sideArmCrossSection ? parseFloat(antenna.sideArmCrossSection).toFixed(2) : null,
          side_arm_offset: antenna.sideArmOffset ? parseFloat(antenna.sideArmOffset).toFixed(2) : null,
          earth_bus_bar_exists: antenna.earthBusExists || null,
          earth_cable_length: antenna.earthCableLength ? parseFloat(antenna.earthCableLength).toFixed(2) : null,
        }))
      };

      console.log("Submitting new antennas data:", submitData);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-antennas/${sessionId}`,
        submitData
      );

      showSuccess('New antennas data submitted successfully!');
      console.log("Response:", response.data);
      setErrors({});
    } catch (err) {
      console.error("Error submitting new antennas data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
        <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-600">Loading new antennas data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form onSubmit={handleSubmit} className="space-y-4">

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
                  {Array.from({ length: antennaCount }, (_, i) => (
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
                {/* Sector Number */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Sector Number
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <select
                        value={antenna.sectorNumber}
                        onChange={(e) => handleChange(antennaIndex, 'sectorNumber', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">-- Select --</option>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      {errors[`${antennaIndex}.sectorNumber`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${antennaIndex}.sectorNumber`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* New or swap */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    New or swap?
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-2">
                        {['New', 'Swap'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`newOrSwap-${antennaIndex}`}
                              value={option}
                              checked={antenna.newOrSwap === option}
                              onChange={(e) => handleChange(antennaIndex, 'newOrSwap', e.target.value)}
                              className="w-4 h-4"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      {errors[`${antennaIndex}.newOrSwap`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${antennaIndex}.newOrSwap`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* New antenna technology */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    New antenna technology
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="grid grid-cols-2 gap-1">
                        {technologies.map(tech => (
                          <label key={tech} className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              value={tech}
                              checked={antenna.technologies.includes(tech)}
                              onChange={(e) => handleChange(antennaIndex, 'technologies', e.target.value)}
                              className="w-4 h-4"
                            />
                            {tech}
                          </label>
                        ))}
                      </div>
                      {errors[`${antennaIndex}.technologies`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${antennaIndex}.technologies`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Azimuth */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Azimuth, angle shift from zero north direction (degree)
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.azimuth}
                        onChange={(e) => handleChange(antennaIndex, 'azimuth', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="0000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Base Height */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    New antenna base height from tower base level (meter)
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.baseHeight}
                        onChange={(e) => handleChange(antennaIndex, 'baseHeight', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                      {errors[`${antennaIndex}.baseHeight`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${antennaIndex}.baseHeight`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Tower Leg */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    New antenna will be located at tower leg
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
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
                      {errors[`${antennaIndex}.towerLeg`] && (
                        <div className="text-red-500 text-xs mt-1">{errors[`${antennaIndex}.towerLeg`]}</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Tower leg section */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Tower leg section at the new antenna proposed location
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-2">
                        {['Angular', 'Tubular'].map(section => (
                          <label key={section} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`towerSection-${antennaIndex}`}
                              value={section}
                              checked={antenna.towerSection === section}
                              onChange={(e) =>
                                handleChange(antennaIndex, 'towerSection', e.target.value)
                              }
                              className="w-4 h-4"
                            />
                            {section}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Conditionally render Angular dimensions row if at least one antenna has "Angular" */}
                {antennaForms.slice(0, antennaCount).some(a => a.towerSection === 'Angular') && (
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      If Angular, what are the L1 dimensions? (mm)
                    </td>
                    {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.angularL1Dimension}
                          onChange={(e) =>
                            handleChange(antennaIndex, 'angularL1Dimension', e.target.value)
                          }
                          className={`w-full p-2 border rounded text-sm ${antenna.towerSection !== 'Angular'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : ''
                            }`}
                          placeholder={antenna.towerSection === 'Angular' ? '000' : 'N/A'}
                          disabled={antenna.towerSection !== 'Angular'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* L2 dimensions for Angular */}
                {antennaForms.slice(0, antennaCount).some(a => a.towerSection === 'Angular') && (
                  <tr>
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      If Angular, what are the L2 dimensions? (mm)
                    </td>
                    {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.angularL2Dimension}
                          onChange={(e) =>
                            handleChange(antennaIndex, 'angularL2Dimension', e.target.value)
                          }
                          className={`w-full p-2 border rounded text-sm ${antenna.towerSection !== 'Angular'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : ''
                            }`}
                          placeholder={antenna.towerSection === 'Angular' ? '000' : 'N/A'}
                          disabled={antenna.towerSection !== 'Angular'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* Tubular cross section */}
                {antennaForms.slice(0, antennaCount).some(a => a.towerSection === 'Tubular') && (
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      If Tubular, what are the cross section? (mm)
                    </td>
                    {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.tubularCrossSection}
                          onChange={(e) => handleChange(antennaIndex, 'tubularCrossSection', e.target.value)}
                          className={`w-full p-2 border rounded text-sm ${antenna.towerSection !== 'Tubular'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : ''
                            }`}
                          placeholder={antenna.towerSection === 'Tubular' ? '000' : 'N/A'}
                          disabled={antenna.towerSection !== 'Tubular'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

                {/* New antenna side arm */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    New antenna side arm
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <select
                        value={antenna.sideArmOption}
                        onChange={(e) => handleChange(antennaIndex, 'sideArmOption', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">-- Select --</option>
                        {sideArmOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>

                {/* Side arm length */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If side arm exist, specify the side arm length (meter)
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
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

                {/* Side arm cross section */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If side arm exist, specify the side arm cross section (mm)
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <input
                        type="number"
                        value={antenna.sideArmCrossSection}
                        onChange={(e) => handleChange(antennaIndex, 'sideArmCrossSection', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="000"
                      />
                    </td>
                  ))}
                </tr>

                {/* Side arm offset */}
                <tr className="bg-gray-50">
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                    If side arm exist, specify the side arm offset from the tower leg profile (cm)
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
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

                {/* Earth bus bar exists */}
                <tr>
                  <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                    Earth bus bar exist within max 10m below the antenna & has free holes?
                  </td>
                  {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                    <td key={antennaIndex} className="border px-2 py-2">
                      <div className="flex gap-2">
                        {['Yes', 'No'].map(option => (
                          <label key={option} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`earthBusExists-${antennaIndex}`}
                              value={option}
                              checked={antenna.earthBusExists === option}
                              onChange={(e) =>
                                handleChange(antennaIndex, 'earthBusExists', e.target.value)
                              }
                              className="w-4 h-4"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Earth cable length - only shows if any antenna has 'Yes' */}
                {antennaForms.slice(0, antennaCount).some(a => a.earthBusExists === 'Yes') && (
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10">
                      If yes, what is the length of the earth cable from the proposed antenna location to the earth bus bar? (m)
                    </td>
                    {antennaForms.slice(0, antennaCount).map((antenna, antennaIndex) => (
                      <td key={antennaIndex} className="border px-2 py-2">
                        <input
                          type="number"
                          value={antenna.earthCableLength}
                          onChange={(e) =>
                            handleChange(antennaIndex, 'earthCableLength', e.target.value)
                          }
                          className={`w-full p-2 border rounded text-sm ${antenna.earthBusExists !== 'Yes'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : ''
                            }`}
                          placeholder={antenna.earthBusExists === 'Yes' ? '00' : 'N/A'}
                          disabled={antenna.earthBusExists !== 'Yes'}
                        />
                      </td>
                    ))}
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded font-semibold ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAntennaForm;
