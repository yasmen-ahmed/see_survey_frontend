import React, { useState } from "react";

const ShelterRoomPreparationForm = () => {
  const [formData, setFormData] = useState({
    acType: "",
    acCount: "",
    acCapacity: "",
    acStatus: "",
    cableTray: "",
    spaceInTray: "",
    feederWindowSpace: "",
    feederFreeHoles: "",
    busBars: "",
    busBarFreeHoles: "",
    newTrackFreePositions: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Further logic
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-5 rounded-xl shadow-lg">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Type of Existing Air Conditioner</label>
            <select
              name="acType"
              value={formData.acType}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">-- Select --</option>
              <option value="Split Unit">Split Unit</option>
              <option value="High Wall Unit">High Wall Unit</option>
              <option value="Central Air Conditioning">Central Air Conditioning</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many air conditioners in the room?</label>
            <input
              type="number"
              name="acCount"
              value={formData.acCount}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Air Conditioner System Capacity (Kw)</label>
            <input
              type="text"
              name="acCapacity"
              value={formData.acCapacity}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>
          
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Air Conditioner System Operational Status</label>
            <input
              type="text"
              name="acStatus"
              value={formData.acStatus}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Hieght Under Cable tray(clearence to the ground (m))</label>
            <input
              type="text"
              name="cableTray"
              value={formData.cableTray}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Is there space in cable tray for new cables?</label>
            <input
              type="text"
              name="spaceInTray"
              value={formData.spaceInTray}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Available space in feeder window for cable entry?</label>
            <input
              type="text"
              name="feederWindowSpace"
              value={formData.feederWindowSpace}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Number of free holes in feeder window?</label>
            <input
              type="number"
              name="feederFreeHoles"
              value={formData.feederFreeHoles}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Number of Bus Bars Available in Room</label>
            <input
              type="number"
              name="busBars"
              value={formData.busBars}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Free holes in existing Bus Bar</label>
            <input
              type="number"
              name="busBarFreeHoles"
              value={formData.busBarFreeHoles}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">How many free positions available for new racks Installations?(60cm x 60cm)</label>
            <input
              type="number"
              name="newTrackFreePositions"
              value={formData.newTrackFreePositions}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Cable Tray Photos(Preview Placeholder)</label>
            <div className="border h-40 bg-gray-100 flex items-center justify-center text-gray-500">
              No Image Uploaded
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShelterRoomPreparationForm;
