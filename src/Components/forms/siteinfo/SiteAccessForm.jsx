import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";  
function SiteAccessForm() {
  const { sessionId, siteId } = useParams(); 
  const [formData, setFormData] = useState({
    site_access_permission_required: "",
    preferred_time_slot_crane_access: [],
    contact_person_name: "",
    contact_tel_number: "",
    contact_person_name_for_site_key: "",
    contact_tel_number_for_site_key: "",
    available_access_time: [],
    access_to_site_by_road: "",
    type_of_gated_fence: "",
    keys_required: "",
    keys_type: [],  
    material_accessibility_to_site: [],
    stair_lift_height: "",
    stair_lift_width: "",
    stair_lift_depth: "",    
  });
  const images = [
    { label: 'Site entrance', name: 'site_entrance' },
    { label: 'Building Stairs / Lift', name: 'building_stairs_lift' },
    { label: 'Roof entrance', name: 'roof_entrance' },
    { label: 'Base station Shelter / Room', name: 'base_station_shelter_room' },
    { label: 'Site Name on shelter/room', name: 'site_name_on_shelter_room' },
    { label: 'Crane Access to the Street', name: 'crane_access_to_the_street' },
    { label: 'Crane Location', name: 'crane_location' },
    { label: 'Site Environment View', name: 'site_environment_view' },
  ];
  
  
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/site-access/${sessionId}`)
      .then(res => {
        const data = res.data;
        console.log(data)
        setFormData({   
          site_access_permission_required: data.site_access_permission_required || "",
          preferred_time_slot_crane_access: data.preferred_time_slot_crane_access || [],
          contact_person_name: data.contact_person_name ,
          contact_tel_number: data.contact_tel_number || 0,
          available_access_time: data.available_access_time || [],
          access_to_site_by_road: data.access_to_site_by_road || "",  
          contact_person_name_for_site_key: data.contact_person_name_for_site_key || "",
          contact_tel_number_for_site_key: data.contact_tel_number_for_site_key || "",
        type_of_gated_fence: data.type_of_gated_fence|| "",  
          keys_required: data.keys_required || "",
          keys_type: data.keys_type || [],
          material_accessibility_to_site: data.material_accessibility_to_site || [],
          stair_lift_height: data.stair_lift_height || 0,
          stair_lift_width: data.stair_lift_width || 0,
          stair_lift_depth: data.stair_lift_depth || 0,
       }); 
        console.log(formData)
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (["preferred_time_slot_crane_access", "available_access_time", "keys_type", "material_accessibility_to_site"].includes(name)) {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? [...prev[name], value] : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

 

    const payload = {
      site_access_permission_required: formData.site_access_permission_required,
      preferred_time_slot_crane_access: formData.preferred_time_slot_crane_access,
      contact_person_name: formData.contact_person_name,
      contact_tel_number: formData.contact_tel_number,
      available_access_time: formData.available_access_time,
      access_to_site_by_road: formData.access_to_site_by_road,
    type_of_gated_fence: formData.type_of_gated_fence,  
      keys_required: formData.keys_required,
      contact_person_name_for_site_key: formData.contact_person_name_for_site_key,
      contact_tel_number_for_site_key: formData.contact_tel_number_for_site_key,
      keys_type: formData.keys_type,
      material_accessibility_to_site: formData.material_accessibility_to_site,
      stair_lift_height: formData.stair_lift_height,
      stair_lift_width: formData.stair_lift_width,
      stair_lift_depth: formData.stair_lift_depth,    
     
    };

    

    try {
      const response=await axios.put(`${import.meta.env.VITE_API_URL}/api/site-access/${sessionId}`,payload);
      showSuccess('Data submitted successfully!');
      console.log(response.data)
    } catch (err) {
      console.error("Error:", err);
      showError('Error submitting data. Please try again.');
    }
  };


  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Site Access Permission Required</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_access_permission_required"
                  value="Yes"
                  checked={formData.site_access_permission_required === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_access_permission_required"
                  value="No"
                  checked={formData.site_access_permission_required === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Preferred Time Slot for Crane Access</label>
            <div className="flex  gap-2">
              {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferred_time_slot_crane_access"
                    value={slot}
                    checked={formData.preferred_time_slot_crane_access.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>



          <div>
            <label className="block font-medium mb-1">Contact Person Name For Site Access</label>
            <input
              type="text"
              name="contact_person_name"
              value={formData.contact_person_name}
              onChange={handleChange}
              className="w-1/2 p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Contact Tel. Number For Site Access</label>
            <input
              type="number"
              name="contact_tel_number"
              value={formData.contact_tel_number}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>

          

          <div>
            <label className="block font-medium mb-1">Contact Person Name For Site Key</label>
            <input
              type="text"
              name="contact_person_name_for_site_key"
              value={formData.contact_person_name_for_site_key}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Contact Tel. Number For Site Key</label>
            <input
              type="number"
              name="contact_tel_number_for_site_key"
              value={formData.contact_tel_number_for_site_key}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Available Access Time</label>
            <div className="flex  gap-2">
              {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="available_access_time"
                    value={slot}
                    checked={formData.available_access_time.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>


          <div>
            <label className="block font-medium mb-1">Access to Site by Road</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="access_to_site_by_road"
                  value="Yes"
                  checked={formData.access_to_site_by_road === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="access_to_site_by_road"
                  value="No"
                  checked={formData.access_to_site_by_road === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="access_to_site_by_road"
                  value="Other"
                  checked={formData.access_to_site_by_road === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>




          <div>
            <label className="block font-medium mb-1">Type of Gated Fence</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_of_gated_fence"
                  value="Brick Wall"
                  checked={formData.type_of_gated_fence === "Brick Wall"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Brick Wall
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_of_gated_fence"
                  value="Chain Fence"
                  checked={formData.type_of_gated_fence === "Chain Fence"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Chain Fence
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_of_gated_fence"
                  value="Not Exist"
                  checked={formData.type_of_gated_fence === "Not Exist"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Not Exist
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type_of_gated_fence"
                  value="Other"
                  checked={formData.type_of_gated_fence === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>


          <div>
            <label className="block font-medium mb-1">Keys Required</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="keys_required"
                  value="Yes"
                  checked={formData.keys_required === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="keys_required"
                  value="No"
                  checked={formData.keys_required === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="keys_required"
                  value="Other"
                  checked={formData.keys_required === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>

          <div>
            <fieldset className="mb-4">
              <legend className="block font-medium mb-2">Keys Type</legend>
              <div className="flex flex-wrap gap-4">
                {["Site or Building gate", "Shelter door", "Rooftop door", "Cabinet", "Other"].map((slot) => (
                  <label key={slot} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="keys_type"
                      value={slot}
                      checked={formData.keys_type.includes(slot)}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <label className="block font-medium mb-1">Material Accessibility to Site</label>
            <div className="flex flex-wrap gap-4">
              {["By Stairs", "By Lift", "By Crane", "Other"].map((slot) => (
                <label key={slot} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="material_accessibility_to_site"
                    value={slot}
                    checked={formData.material_accessibility_to_site.includes(slot)}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
          </div>


          <div>
            <label className="block font-medium mb-1">Stair/Lift Height (meter)</label>
            <input
              type="number"
              name="stair_lift_height"
              value={formData.stair_lift_height}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Stair/Lift Width (meter)</label>
            <input
              type="number"
              name="stair_lift_width"
              value={formData.stair_lift_width}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>


          <div>
            <label className="block font-medium mb-1">Stair/Lift Depth (meter)</label>
            <input
              type="number"
              name="stair_lift_depth"
              value={formData.stair_lift_depth}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
            />
          </div>





        </div>

        <div className="pt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Save and Continue
          </button>
        </div>
      </div>
      <ImageUploader images={images} />
    </div>
  );
}

export default SiteAccessForm;
