import React, { useState } from "react";

const ShelterRTelecomRoomForm = () => {
  const [formData, setFormData] = useState({
    height: "",
    width: "",
    depth: "",
    hardware: [],
    sketchAvailable: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        hardware: checked
          ? [...prev.hardware, value]
          : prev.hardware.filter((item) => item !== value),
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
    console.log("Submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Room Height (m)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Room Width (m)</label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Room Depth (m)</label>
            <input
              type="number"
              name="depth"
              value={formData.depth}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div class="form-section">
          <div class="form-section">
          <div class="form-section">
  <label for="hardware" class="font-semibold mb-1">Type of Existing Telecom Hardware</label>
  <select name="hardware" id="hardware" multiple class="border p-3 rounded-md w-full">
    <option value="RAN">RAN</option>
    <option value="Transmission">Transmission</option>
    <option value="DC Rectifier">DC Rectifier</option>
    <option value="Batteries">Batteries</option>
    <option value="No Hardware">No Hardware</option>
  </select>
  <small class="text-gray-500">Hold Ctrl (or ⌘ Command on Mac) to select multiple options</small>
</div>
</div>
</div>



          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-2">Do you have sketch measurement for the room?</label>
            <div className="flex gap-6">
              <label>
                <input
                  type="radio"
                  name="sketchAvailable"
                  value="Yes"
                  checked={formData.sketchAvailable === "Yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="sketchAvailable"
                  value="No"
                  checked={formData.sketchAvailable === "No"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>

          {/* Placeholder for images */}
          <div>
            <label className="block font-medium mb-2">Batteries Photo (Preview Placeholder)</label>
            <div className="border h-40 bg-gray-100 flex items-center justify-center text-gray-500">
              No Image Uploaded
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Rectifier Photo (Preview Placeholder)</label>
            <div className="border h-40 bg-gray-100 flex items-center justify-center text-gray-500">
              No Image Uploaded
            </div>
          </div>
       
          <div>
            <label className="block font-medium mb-2">Other Hardware Photo (Preview Placeholder)</label>
            <div className="border h-40 bg-gray-100 flex items-center justify-center text-gray-500">
              No Image Uploaded
            </div>
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

        {/* Empty table at bottom */}
        <h3 className="text-xl font-semibold mt-10 mb-3">Hardware Summary</h3>
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Hardware Type</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Picture</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2" colSpan="3" align="center">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShelterRTelecomRoomForm;
