import React, { useState } from "react";

const PowerMeterForm = () => {
  const [formData, setFormData] = useState({
    serialNumber: "",
    meterReading: "",
    powerSourceType: "",
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbReading: "",
    mainCBReading: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Power Meter Data Submitted:", formData);
    // Submit logic here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-full">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Serial Number</label>
            <input
              type="text"
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
              name="meterReading"
              value={formData.meterReading}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">AC Power Source Type</label>
            <select
              name="powerSourceType"
              value={formData.powerSourceType}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">-- Select --</option>
              <option value="1 Phase">1 Phase</option>
              <option value="3 Phase">3 Phase</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Length of Power Meter Cable (in meters)</label>
            <input
              type="number"
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
              type="text"
              name="crossSection"
              value={formData.crossSection}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Main CB Rating (in Amps)</label>
            <input
              type="number"
              name="mainCBRating"
              value={formData.mainCBRating}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Main CB Type(the CB connecting the power meter with AC)</label>
            <select
              name="cbType"
              value={formData.cbType}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">-- Select --</option>
              <option value="1 Phase">CB 1</option>
              <option value="3 Phase">CB 2</option>
            </select>
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
    </div>
  );
};

export default PowerMeterForm;
