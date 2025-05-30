import React, { useState } from 'react';

function SiteInformationForm() {
  const [formData, setFormData] = useState({
    site_location_id: 0,
    site_area: "",
    site_ownership: "",
    shared_site: false,
    telecom_operators: [],
    ac_power_sharing: false,
    dc_power_sharing: false,
    site_topology: "",
    site_type: "",
    planned_scope: [],
    existing_rack_location: [],
    planned_rack_location: [],
    existing_technology: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultiChange = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter((opt) => opt.selected).map((opt) => opt.value);
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Site Location Form submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">

  
      {/* Site Details */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Site Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Site Location ID</label>
            <input type="number" name="site_location_id" value={formData.site_location_id} onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter ID" />
          </div>
          <div>
            <label className="block font-medium mb-1">Site Area</label>
            <input type="text" name="site_area" value={formData.site_area} onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 200 sq.ft" />
          </div>
          <div>
            <label className="block font-medium mb-1">Site Ownership</label>
            <input type="text" name="site_ownership" value={formData.site_ownership} onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center pt-6">
            <input type="checkbox" name="shared_site" checked={formData.shared_site} onChange={handleChange}
              className="mr-2" />
            <label className="font-medium">Shared Site</label>
          </div>
        </div>
      </section>
  
      {/* Sharing Details */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Power Sharing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input type="checkbox" name="ac_power_sharing" checked={formData.ac_power_sharing} onChange={handleChange}
              className="mr-2" />
            <label className="font-medium">AC Power Sharing</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="dc_power_sharing" checked={formData.dc_power_sharing} onChange={handleChange}
              className="mr-2" />
            <label className="font-medium">DC Power Sharing</label>
          </div>
        </div>
      </section>
  
      {/* Telecom Operators */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Telecom Operators</h2>
        <div className="space-y-3">
          {formData.telecom_operators.map((op, index) => (
            <input key={index} type="text" value={op}
              onChange={(e) => handleArrayChange(e, 'telecom_operators', index)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Operator ${index + 1}`} />
          ))}
        </div>
      </section>
  
      {/* Site Topology & Type */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Topology & Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Site Topology</label>
            <input type="text" name="site_topology" value={formData.site_topology} onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-medium mb-1">Site Type</label>
            <input type="text" name="site_type" value={formData.site_type} onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>
  
      {/* Planned Scope */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Planned Scope</h2>
        <div className="space-y-3">
          {formData.planned_scope.map((val, index) => (
            <input key={index} type="text" value={val}
              onChange={(e) => handleArrayChange(e, 'planned_scope', index)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Scope ${index + 1}`} />
          ))}
        </div>
      </section>
  
      {/* Rack Locations */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Rack Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Existing Rack Location</label>
            <div className="space-y-2">
              {formData.existing_rack_location.map((val, index) => (
                <input key={index} type="text" value={val}
                  onChange={(e) => handleArrayChange(e, 'existing_rack_location', index)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Planned Rack Location</label>
            <div className="space-y-2">
              {formData.planned_rack_location.map((val, index) => (
                <input key={index} type="text" value={val}
                  onChange={(e) => handleArrayChange(e, 'planned_rack_location', index)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              ))}
            </div>
          </div>
        </div>
      </section>
  
      {/* Existing Technology */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Existing Technology</h2>
        <div className="space-y-3">
          {formData.existing_technology.map((val, index) => (
            <input key={index} type="text" value={val}
              onChange={(e) => handleArrayChange(e, 'existing_technology', index)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Technology ${index + 1}`} />
          ))}
        </div>
      </section>
  
      {/* Submit */}
      <div className="pt-6 text-center">
        <button type="submit"
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
          Save and Continue
        </button>
      </div>
    </div>
  </div>
  
  );
}

export default SiteInformationForm;
