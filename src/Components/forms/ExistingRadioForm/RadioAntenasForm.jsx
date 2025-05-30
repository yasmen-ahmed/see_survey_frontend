import React, { useState } from "react";

const AntennaForm = ({ antennaNumber }) => {
  const [formData, setFormData] = useState({
    sectorNumber: "",
    swapType: "New",
    technologies: [],
    azimuth: "",
    baseHeight: "",
    towerLeg: "",
    towerLegSection: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        technologies: checked
          ? [...prev.technologies, value]
          : prev.technologies.filter((tech) => tech !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Antenna Data Submitted: ", formData);
    alert(`Antenna #${antennaNumber} data submitted!`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-8 mb-6 space-y-4 border border-gray-300"
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        New Antenna #1{antennaNumber}
      </h2>

      {/* Sector Number */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Sector Number:
        </label>
        <select
          name="sectorNumber"
          onChange={handleChange}
          value={formData.sectorNumber}
          className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Sector</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* New or Swap */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          New or Swap?
        </label>
        <div className="flex gap-4">
          {["New", "Swap"].map((type) => (
            <label key={type} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="swapType"
                value={type}
                onChange={handleChange}
                checked={formData.swapType === type}
                className="w-4 h-4"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Technology */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          New Antenna Technology:
        </label>
        <div className="flex gap-4">
          {["2G", "3G", "4G", "5G"].map((tech) => (
            <label key={tech} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="technologies"
                value={tech}
                onChange={handleChange}
                checked={formData.technologies.includes(tech)}
                className="w-4 h-4"
              />
              {tech}
            </label>
          ))}
        </div>
      </div>

      {/* Azimuth */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Azimuth (° from north):
        </label>
        <input
          type="number"
          name="azimuth"
          value={formData.azimuth}
          onChange={handleChange}
          className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Base Height */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Base height from tower base (m):
        </label>
        <input
          type="number"
          name="baseHeight"
          value={formData.baseHeight}
          onChange={handleChange}
          className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Tower Leg */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Tower leg:
        </label>
        <div className="flex gap-4">
          {["A", "B", "C", "D"].map((leg) => (
            <label key={leg} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="towerLeg"
                value={leg}
                onChange={handleChange}
                checked={formData.towerLeg === leg}
                className="w-4 h-4"
              />
              {leg}
            </label>
          ))}
        </div>
      </div>

      {/* Tower Leg Section */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Tower leg section:
        </label>
        <input
          type="text"
          name="towerLegSection"
          value={formData.towerLegSection}
          onChange={handleChange}
          className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Submit Antenna{antennaNumber}
        </button>
      </div>
    </form>
  );
};

export default AntennaForm;
