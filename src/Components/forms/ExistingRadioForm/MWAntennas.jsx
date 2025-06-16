import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

const MwAntennasForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    antennaCount: "",
    antennas: [],
  });
  const [error, setError] = useState("");

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched MW data:", data);

        if (data && data.mwAntennasData) {
          const mwData = data.mwAntennasData;
          
          // Set the antenna count and antennas array
          const antennaCount = mwData.how_many_mw_antennas_on_tower || "";
          const antennas = mwData.mw_antennas || [];
          
          // Ensure each antenna has the proper structure with id
          const processedAntennas = antennas.map((antenna, index) => ({
            id: antenna.antenna_number || index + 1,
            height: antenna.height || "",
            diameter: antenna.diameter || "",
            azimuth: antenna.azimuth || ""
          }));

          console.log("Processed antennas:", processedAntennas);

          setFormData({
            antennaCount: antennaCount.toString(),
            antennas: processedAntennas
          });
        }
      })
      .catch(err => {
        console.error("Error loading MW antennas data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  const handleAntennaCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (!count || count < 1) {
      setFormData({ antennaCount: "", antennas: [] });
      return;
    }

    // Create antennas array matching the selected count
    const currentAntennas = formData.antennas || [];
    const antennas = Array.from({ length: count }, (_, index) => {
      // Keep existing data if available, otherwise create empty antenna
      if (index < currentAntennas.length) {
        return currentAntennas[index];
      }
      return {
        id: index + 1,
        height: "",
        diameter: "",
        azimuth: "",
      };
    });

    setFormData({ antennaCount: e.target.value, antennas });
    setError(""); // clear previous errors
  };

  const handleAntennaChange = (index, field, value) => {
    const updated = [...formData.antennas];
    updated[index][field] = value;
    setFormData({ ...formData, antennas: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate that all fields are filled
      const isValid = formData.antennas.every(
        (ant) => ant.height && ant.diameter && ant.azimuth
      );

      if (!isValid) {
        setError("Please fill all fields for each MW antenna.");
        return;
      }

      // Prepare data in the format expected by the API
      const submitData = {
        how_many_mw_antennas_on_tower: parseInt(formData.antennaCount),
        mw_antennas: formData.antennas.map((antenna) => ({
          height: parseFloat(antenna.height) || 0,
          diameter: parseFloat(antenna.diameter) || 0,
          azimuth: parseFloat(antenna.azimuth) || 0
        }))
      };

      console.log("Submitting MW antennas data:", submitData);

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/mw-antennas/${sessionId}`, submitData);
      showSuccess('MW antennas data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error submitting MW antennas data:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const images = [
    { label: 'MW Antenna Overview Photo', name: 'mw_antenna_overview_photo' },
    { label: 'MW Antenna Detail Photo', name: 'mw_antenna_detail_photo' },
    { label: 'MW Antenna Installation Photo', name: 'mw_antenna_installation_photo' },
  ];

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* MW Antenna Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="font-semibold mb-2">
                How many MW antennas on the tower?
              </label>
              <select
                name="antennaCount"
                value={formData.antennaCount}
                onChange={handleAntennaCountChange}
                className="border p-3 rounded-md"
                required
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic MW Antenna Table */}
          {formData.antennaCount && parseInt(formData.antennaCount) > 0 && formData.antennas && (
            <div className="">
              <div className="overflow-auto max-h-[400px]">
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th
                        className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                        style={{ width: '300px', minWidth: '300px', maxWidth: '300px' }}
                      >
                        Field Description
                      </th>
                      {Array.from({ length: parseInt(formData.antennaCount) }, (_, i) => (
                        <th
                          key={i}
                          className="border px-4 py-3 text-center font-semibold min-w-[200px] sticky top-0 bg-blue-500 z-20"
                        >
                          MW Antenna #{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* MW antenna height */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna height (meter)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={antenna.height}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'height', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Enter height..."
                            required
                          />
                        </td>
                      ))}
                    </tr>

                    {/* MW antenna diameter */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna diameter (cm)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={antenna.diameter}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'diameter', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Enter diameter..."
                            required
                          />
                        </td>
                      ))}
                    </tr>

                    {/* MW antenna azimuth */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        MW antenna azimuth (degree)
                      </td>
                      {formData.antennas.slice(0, parseInt(formData.antennaCount)).map((antenna, antennaIndex) => (
                        <td key={antennaIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="360"
                            value={antenna.azimuth}
                            onChange={(e) => handleAntennaChange(antennaIndex, 'azimuth', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Enter azimuth..."
                            required
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
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
      <ImageUploader images={images} />
    </div>
  );
};

export default MwAntennasForm;
