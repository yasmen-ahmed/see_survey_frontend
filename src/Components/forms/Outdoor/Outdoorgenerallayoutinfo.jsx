import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import { FaRegTrashAlt } from "react-icons/fa";

const OutdoorForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    sunshade: '',
    freePositions: '',
    cableTrayHeight: '',
    cableTrayWidth: '',
    cableTrayDepth: '',
    spaceForNewCables: '',
    earthBusBars: '',
    freeHolesInBusBars: '',
    hasSketch: Boolean,
  });
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          setFormData({
            sunshade: data.equipment_area_sunshade || "",
            freePositions: data.free_positions_available || "",
            cableTrayHeight: data.cable_tray_config.height || "",
            cableTrayWidth: data.cable_tray_config.width || "",
            cableTrayDepth: data.cable_tray_config.depth || "",
            spaceForNewCables: data.cable_tray_space_available || "",
            earthBusBars: data.earth_bus_bar_config.available_bars || "",
            freeHolesInBusBars: data.earth_bus_bar_config.free_holes || "",
            hasSketch: data.has_site_sketch || "",
          });

          // Load table data if available
          if (data.cb_fuse_data && data.cb_fuse_data.length > 0) {
            console.log("Loading table data:", data.cb_fuse_data);
            const loadedTableData = data.cb_fuse_data.map((item, index) => ({
              id: index + 1,
              rating: item.rating?.toString() || "",
              connected_module: item.connected_module || ""
            }));
            // Always ensure there's an empty column at the end
            loadedTableData.push({ id: loadedTableData.length + 1, rating: "", connected_module: "" });
            console.log("Processed table data:", loadedTableData);
            setTableData(loadedTableData);
          }
        }
      })
      .catch(err => {
        console.error("Error loading AC panel data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload to match the expected API structure
    const payload = {
      equipment_area_sunshade: formData.sunshade,
      free_positions_available: formData.freePositions,
      cable_tray_config: {
        height: formData.cableTrayHeight,
        width: formData.cableTrayWidth,
        depth: formData.cableTrayDepth
      },
      cable_tray_space_available: formData.spaceForNewCables,
      earth_bus_bar_config: {
        available_bars: formData.earthBusBars,
        free_holes: formData.freeHolesInBusBars
      },
      has_site_sketch: formData.hasSketch
    }
    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/outdoor-general-layout/${sessionId}`, payload);
      showSuccess('Outdoor General Layout data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>


      {/* Sunshade Field */}
      <div>
        <label className='block font-semibold mb-2'>Equipment area covered with sunshade?</label>
        <div className='flex gap-4'>
        {['yes', 'no', 'partially'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='sunshade'
                value={option}
                checked={formData.sunshade === option}
                onChange={handleChange}
                className='mr-2'
              />
               {option.charAt(0).toUpperCase() + option.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Free Positions Field */}
      <div>
        <label className='block font-semibold mb-2'>How many free positions available for new cabinets installation?</label>
        <select
          name='freePositions'
          value={formData.freePositions}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Cable Tray Fields */}
      {['Height of existing cable tray from site floor level (cm)', 'Width of existing cable tray (cm)', 'Depth of existing cable tray (cm)'].map((label, index) => (
        <div key={index}>
          <label className='block font-semibold mb-2'>{label}</label>
          <input
            type='number'
            name={['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]}
            value={formData[['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]]}
            onChange={handleChange}
            className='border p-2 rounded w-full'
          />
        </div>
      ))}

      {/* Space for New Cables */}
      <div>
        <label className='block font-semibold mb-2'>Is there available space on existing cable tray for new cables?</label>
        <div className='flex gap-4'>
          {['Yes', 'No'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='spaceForNewCables'
                value={option}
                checked={formData.spaceForNewCables === option}
                onChange={handleChange}
                className='mr-2'
              />
              {option}
            </label>
          ))}
        </div>

      </div>

      {/* Earth Bus Bars Field */}
      <div>
        <label className='block font-semibold mb-2'>How many Earth bus bar available in cabinets location?</label>
        <select
          name='earthBusBars'
          value={formData.earthBusBars}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[1, 2, 3].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Free Holes in Existing Bus Bars */}
      <div>
        <label className='block font-semibold mb-2'>How many free holes in existing bus bars?</label>
        <select
          name='freeHolesInBusBars'
          value={formData.freeHolesInBusBars}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[1, 2, 3].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Sketch with Measurements */}
      <div>
        <label className='block font-semibold mb-2'>Do you have a sketch with measurements for the site including cabinets?</label>
        {/* <div className='flex gap-4'>
          {['Yes', 'No'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='hasSketch'
                value={option}
                checked={formData.hasSketch === option}
                onChange={handleChange}
                className='mr-2'
              />
              {option}
            </label>
          ))}
        </div> */}
        <div className="flex gap-6">
          {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
            <label key={label} className="inline-flex items-center">
              <input
                type="radio"
                name="hasSketch"
                value={value}
                checked={formData.hasSketch === value}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "hasSketch",
                      value: e.target.value === "true", // convert string to boolean
                    },
                  })
                }
                className="mr-2"
                required
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
        Submit
      </button>
    </form>
  );
};

export default OutdoorForm;

