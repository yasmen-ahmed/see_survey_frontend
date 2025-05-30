import React, { useState } from "react";

const RANForm = () => {
  const [form, setForm] = useState({
    vendors: [],
    hasFreeSlot: "",
    rackType: "",
    hvLocationOptions: [],
  });

  const vendorOptions = ["Nokia", "Samsung", "Huawei", "Ericsson"];
  const rackOptions = ["Open ", "90° Rack", "Closed Rack"];
  const locationOptions = ["wall mount", "In existing Rack","New Rack", "Other"];

  const handleVendorChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      vendors: checked
        ? [...prev.vendors, value]
        : prev.vendors.filter((v) => v !== value),
    }));
  };

  const handleLocationChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      hvLocationOptions: checked
        ? [...prev.hvLocationOptions, value]
        : prev.hvLocationOptions.filter((v) => v !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    // API or other logic here
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Vendors */}
          <div>
            <label className="block font-medium mb-2">Ran Equipment Vendor (Multiple)</label>
            <div className="space-y-1">
              {vendorOptions.map((vendor) => (
                <label key={vendor} className="block">
                  <input
                    type="checkbox"
                    value={vendor}
                    checked={form.vendors.includes(vendor)}
                    onChange={handleVendorChange}
                    className="mr-2"
                  />
                  {vendor}
                </label>
              ))}
            </div>
          </div>

          {/* Free Slot Question */}
          <div>
            <label className="block font-medium mb-2">Is There Any Free Slot In Existing RAN Rack For New  Nokia HV Installation?</label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="hasFreeSlot"
                  value="Yes"
                  checked={form.hasFreeSlot === "Yes"}
                  onChange={(e) => setForm({ ...form, hasFreeSlot: e.target.value })}
                  className="mr-2"
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasFreeSlot"
                  value="No"
                  checked={form.hasFreeSlot === "No"}
                  onChange={(e) => setForm({ ...form, hasFreeSlot: e.target.value })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Type of Rack */}
          <div>
            <label className="block font-medium mb-2">Type Of Rack With Free Slot</label>
            <select
              name="rackType"
              value={form.rackType}
              onChange={(e) => setForm({ ...form, rackType: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- Select --</option>
              {rackOptions.map((rack) => (
                <option key={rack} value={rack}>{rack}</option>
              ))}
            </select>
          </div>

          {/* HV Location */}
          <div>
            <label className="block font-medium mb-2">Is There More Location Available For New Nokia HV? (Check all that apply)</label>
            <div className="space-y-1">
              {locationOptions.map((option) => (
                <label key={option} className="block">
                  <input
                    type="checkbox"
                    value={option}
                    checked={form.hvLocationOptions.includes(option)}
                    onChange={handleLocationChange}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Submit RAN Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RANForm;
