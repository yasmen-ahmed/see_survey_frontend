import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import { FaRegTrashAlt } from "react-icons/fa";

const PowerMeterForm = () => {
  const { sessionId } = useParams();

  const [formData, setFormData] = useState({
    serialNumber: "",
    meterReading: "",
    powerSourceType: "",
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbType: "",
  });

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);
        
        if (data) {
          setFormData({
            serialNumber: data.serial_number || "",
            meterReading: data.meter_reading || "",
            powerSourceType: normalizeRadioValue(data.ac_power_source_type) || "",
            cableLength: data.power_cable_config?.length || "",
            crossSection: data.power_cable_config?.cross_section || "",
            mainCBRating: data.main_cb_config?.rating || "",
            cbType: normalizeRadioValue(data.main_cb_config?.type) || "",
          });
        }
      })
      .catch(err => {
        console.error("Error loading power meter data:", err);
        // Don't show error for 404 - might be new data
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Helper function to normalize API values to display format
  const normalizeRadioValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'three_phase': 'Three phase',
      'single_phase': 'Single phase'
    };
    return valueMap[value] || value;
  };

  // Helper function to normalize display values to API format
  const normalizeApiValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'Three phase': 'three_phase',
      'Single phase': 'single_phase'
    };
    return valueMap[value] || value.toLowerCase().replace(' ', '_');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const images = [
    { label: 'Generator photo', name: 'generator_photo' },
    { label: 'Power meter photo overview ', name: 'power_meter_photo_overview' },
    { label: 'Power meter photo zoomed', name: 'power_meter_photo_zoomed' },
    { label: 'Power meter CB photo', name: 'power_meter_cb_photo' },
    { label: 'Power meter cable route photo', name: 'power_meter_cable_route_photo' },    
    { label: 'AC Panel photo overview', name: 'ac_panel_photo_overview' },
    { label: 'AC Panel photo closed', name: 'ac_panel_photo_closed' },
    { label: 'AC Panel photo opened', name: 'ac_panel_photo_opened' },
    { label: 'AC Panel CBs photo', name: 'ac_panel_cbs_photo' },
    { label: 'AC panel free CB', name: 'ac_panel_free_cb' },
    { label: 'Proposed AC CB photo', name: 'proposed_ac_cb_photo' },
    { label: 'AC cable Route Photo to cable tray 1/3', name: 'ac_cable_route_photo_1' },
    { label: 'AC cable Route Photo to cable tray 2/3', name: 'ac_cable_route_photo_2' },
    { label: 'AC cable Route Photo to cable tray 3/3', name: 'ac_cable_route_photo_3' },
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build the payload to match the expected API structure
    const payload = {
      serial_number: formData.serialNumber,
      meter_reading: parseFloat(formData.meterReading) || 0,
      ac_power_source_type: normalizeApiValue(formData.powerSourceType),
      power_cable_config: {
        length: parseFloat(formData.cableLength) || 0,
        cross_section: parseFloat(formData.crossSection) || 0
      },
      main_cb_config: {
        rating: parseFloat(formData.mainCBRating) || 0,
        type: normalizeApiValue(formData.cbType)
      }
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`, payload);
      showSuccess('Power meter data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">  
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Serial Number</label>
            <input
              type="number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Reading</label>
            <input
              type="number"
              step="0.01"
              name="meterReading"
              value={formData.meterReading}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">AC Power Source Type</label>
            <div className="flex gap-6">
              {["Three phase", "Single phase"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="powerSourceType"
                    value={type}
                    checked={formData.powerSourceType === type}
                    onChange={handleChange}
                    className="mr-2"
                    required
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Length of Power Meter Cable (in meters)</label>
            <input
              type="number"
              step="0.1"
              name="cableLength"
              value={formData.cableLength}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Cross Section of Power Cable (in mm²)</label>
            <input
              type="number"
              step="0.1"
              name="crossSection"
              value={formData.crossSection}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Main CB Rating (in Amp)</label>
            <input
              type="number"
              step="0.1"
              name="mainCBRating"
              value={formData.mainCBRating}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">Main CB Type (the CB connecting the power meter with AC)</label>
            <div className="flex gap-6">
              {["Three phase", "Single phase"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="cbType"
                    value={type}
                    checked={formData.cbType === type}
                    onChange={handleChange}
                    className="mr-2"
                    required
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Submit Power Meter Info
            </button>
          </div>
        </form>
      </div>
      <ImageUploader images={images} />
    </div>
  );
};

export default PowerMeterForm;
