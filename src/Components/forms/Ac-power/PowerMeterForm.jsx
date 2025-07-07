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
    cbType: ""
  });

  const [uploadedImages, setUploadedImages] = useState({});

  // Fetch existing data when component loads
  useEffect(() => {
    if (!sessionId) return;

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
            cbType: normalizeRadioValue(data.main_cb_config?.type) || ""
          });

          // Process existing images
          if (data.images && data.images.length > 0) {
            const processedImages = {};
            data.images.forEach(image => {
              processedImages[image.image_category] = [{
                id: image.id,
                file_url: image.file_url,
                name: image.original_filename
              }];
            });
            setUploadedImages(processedImages);
          }
        }
      })
      .catch(err => {
        console.error("Error loading power meter data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Helper functions for value normalization
  const normalizeRadioValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'three_phase': 'Three phase',
      'single_phase': 'Single phase'
    };
    return valueMap[value] || value;
  };

  const normalizeApiValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'Three phase': 'three_phase',
      'Single phase': 'single_phase'
    };
    return valueMap[value] || value.toLowerCase().replace(' ', '_');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (imageCategory, files) => {
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  const images = [
    { label: 'Power meter photo overview', name: 'power_meter_photo_overview' },
    { label: 'Power meter photo zoomed', name: 'power_meter_photo_zoomed' },
    { label: 'Power meter CB photo', name: 'power_meter_cb_photo' },
    { label: 'Power meter cable route photo', name: 'power_meter_cable_route_photo' }
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();

    // Build the payload to match the expected API structure
    const payload = {
      serial_number: formData.serialNumber || '',
      meter_reading: formData.meterReading ? parseFloat(formData.meterReading) : null,
      ac_power_source_type: formData.powerSourceType ? normalizeApiValue(formData.powerSourceType) : null
    };

    // Only add power_cable_config if either length or cross_section has a value
    if (formData.cableLength || formData.crossSection) {
      payload.power_cable_config = {
        length: formData.cableLength ? parseFloat(formData.cableLength) : null,
        cross_section: formData.crossSection ? parseFloat(formData.crossSection) : null
      };
    }

    // Only add main_cb_config if either rating or type has a value
    if (formData.mainCBRating || formData.cbType) {
      payload.main_cb_config = {
        rating: formData.mainCBRating ? parseFloat(formData.mainCBRating) : null,
        type: formData.cbType ? normalizeApiValue(formData.cbType) : null
      };
    }

    // Add data fields to FormData
    formDataToSend.append('data', JSON.stringify(payload));

    // Add images if they exist
    images.forEach(imageField => {
      const imageFiles = uploadedImages[imageField.name];
      if (Array.isArray(imageFiles) && imageFiles.length > 0) {
        const file = imageFiles[0];
        if (file instanceof File) {
          formDataToSend.append(imageField.name, file);
        }
      }
    });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // After successful submission, fetch the latest data
      const getResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`);
      const latestData = getResponse.data.data;

      if (latestData) {
        // Update form data
        setFormData({
          serialNumber: latestData.serial_number || "",
          meterReading: latestData.meter_reading || "",
          powerSourceType: normalizeRadioValue(latestData.ac_power_source_type) || "",
          cableLength: latestData.power_cable_config?.length || "",
          crossSection: latestData.power_cable_config?.cross_section || "",
          mainCBRating: latestData.main_cb_config?.rating || "",
          cbType: normalizeRadioValue(latestData.main_cb_config?.type) || ""
        });

        // Process and update images
        if (latestData.images && latestData.images.length > 0) {
          const processedImages = {};
          latestData.images.forEach(image => {
            processedImages[image.image_category] = [{
              id: image.id,
              file_url: image.file_url,
              name: image.original_filename
            }];
          });
          setUploadedImages(processedImages);
        }
      }

      showSuccess('Power meter data submitted successfully!');
    } catch (error) {
      console.error("Error submitting power meter data:", error);
      showError(error.response?.data?.error?.message || 'Error submitting data');
    }
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">  
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Serial Number</label>
            <input
              type="number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="form-input"
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
              className="form-input"
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
              className="form-input"
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
              className="form-input"
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
              className="form-input"
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
      <ImageUploader 
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default PowerMeterForm;
