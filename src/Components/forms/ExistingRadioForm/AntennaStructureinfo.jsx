import React, { useState } from "react";
import axios from "axios";

const AntennaStructureForm = () => {
  const [formData, setFormData] = useState({
    hasSketch: "no",
    towerType: [],
    gfHeight: "",
    rtStructureCount: "",
    rtHeights: [],
    buildingHeight: "",
    lightningSystem: "no",
    earthingBusBar: "no",
    freeHoles: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "towerType") {
      const updated = checked
        ? [...formData.towerType, value]
        : formData.towerType.filter((item) => item !== value);
      setFormData({ ...formData, towerType: updated });
    } else if (type === "checkbox" && name === "rtHeights") {
      const updated = checked
        ? [...formData.rtHeights, value]
        : formData.rtHeights.filter((item) => item !== value);
      setFormData({ ...formData, rtHeights: updated });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

// use to connnect with backend api

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("${import.meta.env.VITE_API_URL}/", formData);
      alert("Antenna structure data submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Please try again.");
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2">
      <div className="bg-white p-4 rounded-xl shadow-md w-full">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Sketch Availability */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Do you have a sketch with measurements for the site layout?</label>
            <div className="space-x-4">
              <label><input type="radio" name="hasSketch" value="yes" onChange={handleChange} checked={formData.hasSketch === "yes"} /> Yes</label>
              <label><input type="radio" name="hasSketch" value="no" onChange={handleChange} checked={formData.hasSketch === "no"} /> No</label>
            </div>
          </div>

          {/* Tower Type */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tower Type</label>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* GF Height */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">If GF, what is the antenna structure height? (meters)</label>
            <input
              type="number"
              name="gfHeight"
              value={formData.gfHeight}
              onChange={handleChange}
              className="border p-3 rounded-md"
              placeholder="000"
            />
          </div>

          {/* RT Structure Count */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">If RT, how many structures onsite?</label>
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
          </div>

          {/* RT Heights */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">If RT, what are the existing heights?</label>
            <div className="grid grid-cols-3 gap-2">
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
          </div>

          {/* Building Height */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">If RT, what is the building height? (meters)</label>
            <input
              type="number"
              name="buildingHeight"
              value={formData.buildingHeight}
              onChange={handleChange}
              className="border p-3 rounded-md"
              placeholder="000"
            />
          </div>

          {/* Lightning System */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Lightning system installed on existing towers?</label>
            <div className="space-x-4">
              <label><input type="radio" name="lightningSystem" value="yes" onChange={handleChange} checked={formData.lightningSystem === "yes"} /> Yes</label>
              <label><input type="radio" name="lightningSystem" value="no" onChange={handleChange} checked={formData.lightningSystem === "no"} /> No</label>
            </div>
          </div>

          {/* Earthing Bus Bars */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Earthing bus bars exist on towers?</label>
            <div className="space-x-4">
              <label><input type="radio" name="earthingBusBar" value="yes" onChange={handleChange} checked={formData.earthingBusBar === "yes"} /> Yes</label>
              <label><input type="radio" name="earthingBusBar" value="no" onChange={handleChange} checked={formData.earthingBusBar === "no"} /> No</label>
            </div>
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
