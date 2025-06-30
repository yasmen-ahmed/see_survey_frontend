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
    images: {
      power_meter_photo_overview: null,
      power_meter_photo_zoomed: null,
      power_meter_cb_photo: null,
      power_meter_cable_route_photo: null
    }
  });

  // Fetch existing data when component loads
  useEffect(() => {
    if (!sessionId) return;

    axios.get(`${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);
        
        if (data) {
          const updatedFormData = {
            serialNumber: data.serial_number || "",
            meterReading: data.meter_reading || "",
            powerSourceType: normalizeRadioValue(data.ac_power_source_type) || "",
            cableLength: data.power_cable_config?.length || "",
            crossSection: data.power_cable_config?.cross_section || "",
            mainCBRating: data.main_cb_config?.rating || "",
            cbType: normalizeRadioValue(data.main_cb_config?.type) || "",
            images: {
              power_meter_photo_overview: null,
              power_meter_photo_zoomed: null,
              power_meter_cb_photo: null,
              power_meter_cable_route_photo: null
            }
          };

          // Process existing images
          if (data.images && data.images.length > 0) {
            data.images.forEach(image => {
              const imageUrl = image.file_url.startsWith('http') 
                ? image.file_url 
                : `${import.meta.env.VITE_API_URL}${image.file_url}`;
              
              if (updatedFormData.images.hasOwnProperty(image.image_category)) {
                updatedFormData.images[image.image_category] = {
                  preview: imageUrl,
                  existingUrl: imageUrl
                };
              }
            });
          }

          setFormData(updatedFormData);
        }
      })
      .catch(err => {
        console.error("Error loading power meter data:", err);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [name]: {
          file: file,
          preview: file ? URL.createObjectURL(file) : prev.images[name]?.preview,
          existingUrl: prev.images[name]?.existingUrl
        }
      }
    }));
  };

  const images = [
    { 
      label: 'Power meter photo overview', 
      name: 'power_meter_photo_overview',
      value: formData.images.power_meter_photo_overview?.preview || formData.images.power_meter_photo_overview?.existingUrl
    },
    { 
      label: 'Power meter photo zoomed', 
      name: 'power_meter_photo_zoomed',
      value: formData.images.power_meter_photo_zoomed?.preview || formData.images.power_meter_photo_zoomed?.existingUrl
    },
    { 
      label: 'Power meter CB photo', 
      name: 'power_meter_cb_photo',
      value: formData.images.power_meter_cb_photo?.preview || formData.images.power_meter_cb_photo?.existingUrl
    },
    { 
      label: 'Power meter cable route photo', 
      name: 'power_meter_cable_route_photo',
      value: formData.images.power_meter_cable_route_photo?.preview || formData.images.power_meter_cable_route_photo?.existingUrl
    }
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
    Object.entries(formData.images).forEach(([category, imageData]) => {
      if (imageData?.file) {
        formDataToSend.append(category, imageData.file);
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
      
      showSuccess('Power meter data submitted successfully!');
      console.log("Response:", response.data);

      // Update the form with the new data including new image URLs
      if (response.data.data) {
        const newData = response.data.data;
        if (newData.images) {
          const updatedImages = { ...formData.images };
          newData.images.forEach(img => {
            const imageUrl = img.file_url.startsWith('http') 
              ? img.file_url 
              : `${import.meta.env.VITE_API_URL}${img.file_url}`;
            
            if (updatedImages.hasOwnProperty(img.image_category)) {
              updatedImages[img.image_category] = {
                preview: imageUrl,
                existingUrl: imageUrl
              };
            }
          });
          
          setFormData(prev => ({
            ...prev,
            images: updatedImages
          }));
        }
      }
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
      <ImageUploader 
        images={images}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default PowerMeterForm;
