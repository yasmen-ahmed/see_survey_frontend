import React, { useState } from "react";

const TransmissionMWForm = () => {
  const [formData, setFormData] = useState({
    spaceAvailable: [],
    mw1DestinationId: "",
    mw2DestinationId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, spaceAvailable: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Transmission MW Form Submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-5 rounded-xl shadow-lg">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Multi-select at top */}
          <div className="md:col-span-2">
            <label className="font-semibold mb-2 block">
              Space Available for New MW Installation (Choose all applicable)
            </label>
            <select
              multiple
              name="spaceAvailable"
              value={formData.spaceAvailable}
              onChange={handleMultiSelect}
              className="border p-3 rounded-md w-full"
              required
            >
              <option value="Roof">Roof</option>
              <option value="Pole Mount">Pole Mount</option>
              <option value="Wall Bracket">Wall Bracket</option>
              <option value="Existing Rack">Existing Rack</option>
              <option value="Ground Pole">Ground Pole</option>
            </select>
          </div>

            {/* Section heading */}
            <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mt-10 mb-3 bg-blue-600 text-white p-3">
              MW Links Details
            </h3>
          </div>


          {/* MW1 Destination ID */}
          <div className="flex flex-col">

            <label className="font-semibold mb-1">MW1 Destination ID</label>
            <input
              type="text"
              name="mw1DestinationId"
              value={formData.mw1DestinationId}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          {/* MW2 Destination ID */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">MW2 Destination ID</label>
            <input
              type="text"
              name="mw2DestinationId"
              value={formData.mw2DestinationId}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransmissionMWForm;
