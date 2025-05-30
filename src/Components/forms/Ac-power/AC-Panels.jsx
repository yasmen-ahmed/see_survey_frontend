import React, { useState } from "react";

const ACPanelForm = () => {
  const [formData, setFormData] = useState({
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbType: "",
    hasFreeCBs: "",
    freeSpaceCount: "",
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
    console.log("AC Panel Data Submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-full">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Length of Power Cable (m)</label>
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
            <label className="font-semibold mb-1">Cross Section of Cable (mm²)</label>
            <input
              type="number"
              name="crossSection"
              value={formData.crossSection}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">AC Panel Main CB Rating (Amp)</label>
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
            <label className="font-semibold mb-1">AC Panel Main CB Type</label>
            <select
              name="cbType"
              value={formData.cbType}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">-- Select --</option>
              <option value="MCB">MCB</option>
              <option value="MCCB">MCCB</option>
              <option value="RCB">RCB</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Does AC Panel Have Free CBs?</label>
            <select
              name="hasFreeCBs"
              value={formData.hasFreeCBs}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Free Space to Add New CBs</label>
            <input
              type="number"
              name="freeSpaceCount"
              value={formData.freeSpaceCount}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
       < h3 className="text-xl font-semibold mt-10 mb-3 bg-blue-600 text-white p-3">AC Panel, CBs Rating, and Connected Load</h3>
<table className="w-full border border-gray-300">
  <thead className="bg-gray-200">
    <tr>
      <th className="border px-4 py-2">CB Fuse Rating</th>
      <th className="border px-4 py-2">Connected Modules</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border px-4 py-2">10A</td>
      <td className="border px-4 py-2">Lighting</td>
    </tr>
    <tr>
      <td className="border px-4 py-2">16A</td>
      <td className="border px-4 py-2">Sockets</td>
    </tr>
  </tbody>
</table>
      </div>
    </div>
  );
};

export default ACPanelForm;
