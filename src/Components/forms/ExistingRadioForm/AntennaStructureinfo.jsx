import React, { useState , useEffect } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { showSuccess, showError } from '../../../utils/notifications';


const AntennaStructureForm = () => {
  const { sessionId } = useParams();

  const [formData, setFormData] = useState({
    hasSketch: "No",
    towerType: [],
    gfHeight: "",
    rtStructureCount: "",
    rtHeights: [],
    buildingHeight: "",
    lightningSystem: "No",
    earthingBusBar: "No",
    freeHoles: "",
  });
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/antenna-structure/${sessionId}`)
      .then(res => {
        const data = res.data.data.antennaStructureData || res.data.antennaStructureData;
        console.log("Fetched data:", data);

        if (data) {
          setFormData({
            hasSketch: data.has_sketch_with_measurements || "",
            towerType: data.tower_type || [],
            gfHeight: data.gf_antenna_structure_height || "",
            rtStructureCount: data.rt_how_many_structures_onsite || "",
            rtHeights: data.rt_existing_heights || [],
            buildingHeight: data.rt_building_height || "",
            lightningSystem: data.lightening_system_installed || "",
            earthingBusBar: data.earthing_bus_bars_exist || "",
            freeHoles: data.how_many_free_holes_bus_bars || ""

          });
        }
      })
      .catch(err => {
        console.error("Error loading RAN equipment data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === "towerType") {
      let updatedTowerTypes = [...formData.towerType];
      if (checked) {
        updatedTowerTypes.push(value);
      } else {
        updatedTowerTypes = updatedTowerTypes.filter((t) => t !== value);
      }
  
      setFormData((prev) => ({
        ...prev,
        towerType: updatedTowerTypes,
        // Clear gfHeight if no GF selected
        gfHeight: updatedTowerTypes.some((t) => t.includes("GF")) ? prev.gfHeight : "",
        rtHeights: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.rtHeights : [],
        buildingHeight: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.buildingHeight : "",
        rtStructureCount: updatedTowerTypes.some((t) => t.includes("RT")) ? prev.rtStructureCount : "",
  
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  

// use to connnect with backend api
const handleSubmit = async (e) => {
  e.preventDefault();

  // Build the payload to match the expected API structure
  const payload = {
      has_sketch_with_measurements: formData.hasSketch,
      tower_type: formData.towerType,
      gf_antenna_structure_height: formData.gfHeight,
      rt_how_many_structures_onsite: formData.rtStructureCount,
      rt_existing_heights: formData.rtHeights,
      rt_building_height: formData.buildingHeight,
      lightening_system_installed: formData.lightningSystem,
      earthing_bus_bars_exist: formData.earthingBusBar,
      how_many_free_holes_bus_bars: formData.freeHoles
  }
  console.log("Payload being sent:", payload);

  try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/antenna-structure/${sessionId}`, payload);
    showSuccess('Antenna structure data submitted successfully!');
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Sketch Availability */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Do you have a sketch with measurements for the site layout?</label>
            <div className="space-x-4">
              <label><input type="radio" name="hasSketch" value="Yes" onChange={handleChange} checked={formData.hasSketch === "Yes"} /> Yes</label>
              <label><input type="radio" name="hasSketch" value="No" onChange={handleChange} checked={formData.hasSketch === "No"} /> No</label>
            </div>
            <hr className='mt-2' />     
          </div>

          {/* Tower Type */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tower Type</label>
            <div className="grid grid-cols-4 gap-2">
              {["GF tower", "GF Monopole", "GF Palm tree", "RT tower", "RT poles", "Wall mounted", "Other"].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    name="towerType"
                    value={type}
                    checked={formData.towerType.includes(type)}
                    onChange={handleChange}
                  />{" "}
                  {type}
                </label>
              ))}
            </div>
            <hr className='mt-2' />     
          </div>

          {/* GF Height */}
          {formData.towerType.some(type => type.includes("GF")) && (
            <div className="flex flex-col">
              <label className="font-semibold mb-1">What is the antenna structure height? (meters)</label>
              <input
              type="number"
              name="gfHeight"
              value={formData.gfHeight}
              onChange={handleChange}
              className="border p-3 rounded-md"
              placeholder="000"
            />
              <hr className='mt-2' /> 
              </div>    
                
            )}

          {/* RT Structure Count */}
          {formData.towerType.some(type => type.includes("RT")) && (
            <>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many structures onsite?</label>
            <select
              name="rtStructureCount"
              value={formData.rtStructureCount}
              onChange={handleChange}
              className="border p-3 rounded-md"
            >
              <option value="">-- Select --</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <hr className='mt-2' /> 
          </div>

       
          <div className="flex flex-col">
            <label className="font-semibold mb-1">What are the existing heights?</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {["3m", "6m", "9m", "12m", "15m", "Other"].map((height) => (
                <label key={height}>
                  <input
                    type="checkbox"
                    name="rtHeights"
                    value={height}
                    checked={formData.rtHeights.includes(height)}
                    onChange={handleChange}
                  />{" "}
                  {height}
                </label>
              ))}
            </div>
            <hr className='mt-2' /> 
          </div>

        
          <div className="flex flex-col">
            <label className="font-semibold mb-1">What is the building height? (meters)</label>
            <input
              type="number"
              name="buildingHeight"
              value={formData.buildingHeight}
              onChange={handleChange}
              className="border p-3 rounded-md"
              placeholder="000"
            />
            <hr className='mt-2' /> 
          </div>
          </>
          )}

          {/* Lightning System */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Lightning system installed on existing towers?</label>
            <div className="space-x-4">
              <label><input type="radio" name="lightningSystem" value="Yes" onChange={handleChange} checked={formData.lightningSystem === "Yes"} /> Yes</label>
              <label><input type="radio" name="lightningSystem" value="No" onChange={handleChange} checked={formData.lightningSystem === "No"} /> No</label>
            </div>
            <hr className='mt-2' /> 
          </div>

          {/* Earthing Bus Bars */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Earthing bus bars exist on towers?</label>
            <div className="space-x-4">
              <label><input type="radio" name="earthingBusBar" value="Yes" onChange={handleChange} checked={formData.earthingBusBar === "Yes"} /> Yes</label>
              <label><input type="radio" name="earthingBusBar" value="No" onChange={handleChange} checked={formData.earthingBusBar === "No"} /> No</label>
            </div>
            <hr className='mt-2' /> 
          </div>

          {/* Free Holes */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many free holes in existing bus bars?</label>
            <select
              name="freeHoles"
              value={formData.freeHoles}
              onChange={handleChange}
              className="border p-3 rounded-md"
            >
              <option value="">-- Select --</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
              <option value="more than 10">More than 10</option>
            </select>
            <hr className='mt-2' /> 
              </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AntennaStructureForm;
