import React, { useState } from 'react';

function SiteAccessForm() {
  const [formData, setFormData] = useState({
    site_access_permission_required: [],
    Contanct_person_Name_For_Site_Access: "",
    Contact_Tel_number_for_site_access: "",
    Access_to_site_by_roads: false,
    Type_of_gated_fence: [],
    keys_required: "",
    stair_lift_dimensions_Depth: "",
    stair_lift_dimensions_Height: "",
    stair_lift_dimensions_Width: "",
    prefered_time_slot_for_crane_access: [],
    Availabe_Access_Time: [],
    Keys_Type: [],
    Material_Accessabality_to_site: [],
    shared_site: false,
    ac_power_sharing: false,
    dc_power_sharing: false,
    telecom_operators: [""],
    site_topology: "",
    site_type: "",
    planned_scope: [""],
    existing_rack_location: [""],
    planned_rack_location: [""],
    existing_technology: [""],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (e, key, index) => {
    const newArray = [...formData[key]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [key]: newArray,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Site Access Form submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">
        {/*<h2 className="text-xl font-semibold text-gray-700 mb-6">Site Access Form</h2>*/}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
  <label className="block font-medium mb-1">Site Access Permission Required</label>
  <select
    name="site_access_permission_required"
    value={formData.site_access_permission_required}
    onChange={handleChange}
    className="w-full p-3 border rounded-md"
  >
    <option value="" disabled hidden>Find items...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>
          <div>
            <label className="block font-medium mb-1">Contanct Person Name For Site Access</label>
            <input type="text" name="Contanct_person_Name_For_Site_Access" value={formData.Contanct_person_Name_For_Site_Access} onChange={handleChange}
              className="w-full p-3 border rounded-md" />
          </div>
          <div>
            <label className="block font-medium mb-1">Contact Tel. number for Access</label>
            <input type="text" name="Contanct_person_Name_For_Site_Access" value={formData.Contanct_person_Name_For_Site_Access} onChange={handleChange}
              className="w-full p-3 border rounded-md" />
          </div>
          <div>
  <label className="block font-medium mb-1">Access to Site By Road</label>
  <select
    name="Access_to_site_by_roads"
    value={formData.Access_to_site_by_roads}
    onChange={handleChange}
    className="w-full p-3 border rounded-md"
  >
    <option value="" disabled hidden>Find Items</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
    <option value="Other">Other</option>
  </select>
</div>
<div>
  <label className="block font-medium mb-1">Type of Gated Fence</label>
  <select
    name="Type_of_gated_fence"
    value={formData.Type_of_gated_fence}
    onChange={handleChange}
    className="w-full p-3 border rounded-md"
  >
    <option value="" disabled hidden>Find Items</option>
    <option value="Brick Wall">Brick Wall</option>
    <option value="Chain Fence">Chain Fence</option>
    <option value="Not Exist">Not Exist</option>
    <option value="Other">Other</option>
  </select>
</div>

          <div>
            <label className="block font-medium mb-1">Keys required</label>
            <input type="text" name="Contact_Tel_number_for_site_access" value={formData.Contact_Tel_number_for_site_access} onChange={handleChange}
              className="w-full p-3 border rounded-md" placeholder="Find Items"/>
          </div>
          <div>
            <label className="block font-medium mb-1">Stair / Lift dimensions, Depth (meter)</label>
            <input type="text" name="stair_lift_dimensions_Depth" value={formData.stair_lift_dimensions_Depth} onChange={handleChange}
              className="w-full p-3 border rounded-md"/>
          </div>
          <div>
            <label className="block font-medium mb-1">Stair / Lift dimensions, Hight (meter)</label>
            <input type="text" name="stair_lift_dimensions_Height" value={formData.stair_lift_dimensions_Height} onChange={handleChange}
              className="w-full p-3 border rounded-md"/>
          </div>
          <div>
            <label className="block font-medium mb-1">Stair / Lift dimensions, Width (meter)</label>
            <input type="text" name="stair_lift_dimensions_Width" value={formData.stair_lift_dimensions_Width} onChange={handleChange}
              className="w-full p-3 border rounded-md"/>
          </div>
          <div>
            <label className="block font-medium mb-1">Preferred time slot for crane access</label>
            <input type="text" name="prefered_time_slot_for_crane_access" value={formData.prefered_time_slot_for_crane_access} onChange={handleChange}
              className="w-full p-3 border rounded-md" placeholder="Find Items"/>
          </div>
          <div>
            <label className="block font-medium mb-1">Available access time</label>
            <input type="text" name="Availabe_Access_Time" value={formData.Availabe_Access_Time} onChange={handleChange}
              className="w-full p-3 border rounded-md" placeholder="Find Items"/>
            
          </div>
          <div>
            <label className="block font-medium mb-1">Keys type</label>
            <input type="text" name="Keys_Type" value={formData.Keys_Type} onChange={handleChange}
              className="w-full p-3 border rounded-md" placeholder="Find Items"/>
            
          </div>
          <div>
            <label className="block font-medium mb-1">Material accessibility to site</label>
            <input type="text" name="Material_Accessabality_to_site" value={formData.Material_Accessabality_to_site} onChange={handleChange}
              className="w-full p-3 border rounded-md" placeholder="Find Items"/>
            
          </div>
        
       
        </div>

       
        <div className="pt-6 text-center">
          <button onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default SiteAccessForm;
