import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";

function SiteInformationForm() {
  
const { sessionId, siteId } = useParams();   
const [formData, setFormData] = useState({
    site_located_at: "",
    site_ownership: "",
    shared_site: "",
    other_telecom_operator_exist_onsite: [],
    ac_power_sharing: "",
    dc_power_sharing: "",
    site_topology: "",
    site_type: "",
    planned_scope: [],
    location_of_existing_telecom_racks_cabinets: [],
    location_of_planned_new_telecom_racks_cabinets: [],
    existing_technology: []
  });

    useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/site-area-info/${sessionId}`)
      .then(res => {
        const data = res.data;
        console.log(data)
        setFormData({
          site_located_at: data.site_located_at || "",
          site_ownership: data.site_ownership || "",
          shared_site: data.shared_site || "",
          other_telecom_operator_exist_onsite: data.other_telecom_operator_exist_onsite|| [],
          ac_power_sharing: data.ac_power_sharing || "",
          dc_power_sharing: data.dc_power_sharing || "",
          site_topology: data.site_topology || "",
          site_type: data.site_type || "",
          planned_scope: data.planned_scope || [],
          location_of_existing_telecom_racks_cabinets: data.location_of_existing_telecom_racks_cabinets || [],
          location_of_planned_new_telecom_racks_cabinets: data.location_of_planned_new_telecom_racks_cabinets || [],
          existing_technology: data.existing_technology || []
         
        }); 
        console.log(formData)
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (["other_telecom_operator_exist_onsite","planned_scope", "location_of_existing_telecom_racks_cabinets", "location_of_planned_new_telecom_racks_cabinets", "existing_technology"].includes(name)) {
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
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

 

    const payload = {
      site_located_at: formData.site_located_at,
      site_ownership: formData.site_ownership,
      shared_site: formData.shared_site,
      other_telecom_operator_exist_onsite: formData.other_telecom_operator_exist_onsite,
      ac_power_sharing: formData.ac_power_sharing,
      dc_power_sharing: formData.dc_power_sharing,
      site_topology: formData.site_topology,
      site_type: formData.site_type,
      planned_scope: formData.planned_scope,
      location_of_existing_telecom_racks_cabinets: formData.location_of_existing_telecom_racks_cabinets ,
      location_of_planned_new_telecom_racks_cabinets: formData.location_of_planned_new_telecom_racks_cabinets,
      existing_technology: formData.existing_technology,
    };
         
   
    

    try {
      const response=await axios.put(`${import.meta.env.VITE_API_URL}/api/site-area-info/${sessionId}`,payload);
      alert("Data submitted successfully!");
      console.log(response.data)
    } catch (err) {
      console.error("Error:", err);
      alert("Error submitting data. Please try again.");
    }
  };

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    
          <div>
            <label className="block font-medium mb-1">Site Located at</label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Downtown"
                  checked={formData.site_located_at === "Downtown"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Downtown
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Suburb"
                  checked={formData.site_located_at === "Suburb"}
                  onChange={handleChange}
                  className="mr-2"
                />
           Suburb
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Rural area"
                  checked={formData.site_located_at === "Rural area"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Rural area
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Highway Road"
                  checked={formData.site_located_at === "Highway Road"}
                  onChange={handleChange}
                  className="mr-2"
                />
               Highway Road
              </label>
              <label className="flex items-center col-span-2">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Hills or Mountain"
                  checked={formData.site_located_at === "Hills or Mountain"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Hills or Mountain
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Shore"
                  checked={formData.site_located_at === "Shore"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Shore
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_located_at"
                  value="Other"
                  checked={formData.site_located_at === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
            <hr className='mt-1'/>
          </div>


          <div>
            <label className="block font-medium mb-1">Site Ownership</label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_ownership"
                  value="Operator"
                  checked={formData.site_ownership === "Operator"}
                  onChange={handleChange}
                  className="mr-2"
                />
               Operator
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_ownership"
                  value="Tower Company"
                  checked={formData.site_ownership === "Tower Company"}
                  onChange={handleChange}
                  className="mr-2"
                />
           Tower Company
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_ownership"
                  value=" Other Operator"
                  checked={formData.site_ownership === " Other Operator"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other Operator
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_ownership"
                  value=" Utility Company"
                  checked={formData.site_ownership === " Utility Company"}
                  onChange={handleChange}
                  className="mr-2"
                />
               Utility Company
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_ownership"
                  value="Other"
                  checked={formData.site_ownership === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
         
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Shared Site</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shared_site"
                  value="Yes"
                  checked={formData.shared_site === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shared_site"
                  value="No"
                  checked={formData.shared_site === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Other Telecom Operator exist onsite </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {["Operator 1", "Operator 2", "Operator 3", "Operator 4"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="other_telecom_operator_exist_onsite"
                    value={slot}
                    checked={formData.other_telecom_operator_exist_onsite.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">AC Power Sharing</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ac_power_sharing"
                  value="Yes"
                  checked={formData.ac_power_sharing === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ac_power_sharing"
                  value="No"
                  checked={formData.ac_power_sharing === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">DC Power Sharing</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dc_power_sharing"
                  value="Yes"
                  checked={formData.dc_power_sharing === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dc_power_sharing"  
                  value="No"
                  checked={formData.dc_power_sharing === "No"}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>  
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Site Topology</label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_topology"
                  value="Ground Field"
                  checked={formData.site_topology === "Ground Field"}
                  onChange={handleChange}
                  className="mr-2"
                />
               Ground Field
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_topology"
                  value="Roof Top"
                  checked={formData.site_topology === "Roof Top"}
                  onChange={handleChange}
                  className="mr-2"
                />
          Roof Top
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_topology"
                  value="Other"
                  checked={formData.site_topology === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
             
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Site Type</label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_type"
                  value="Normal radio site"
                  checked={formData.site_type === "Normal radio site"}
                  onChange={handleChange}
                  className="mr-2"
                />
             Normal radio site
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_type"
                  value="Hub site"
                  checked={formData.site_type === "Hub site"}
                  onChange={handleChange}
                  className="mr-2"
                />
         Hub site
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_type"
                  value="Corpo site"
                  checked={formData.site_type === "Corpo site"}
                  onChange={handleChange}
                  className="mr-2"
                />
               Corpo site
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="site_type"
                  value="Other"
                  checked={formData.site_type === "Other"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
             
            </div>
            <hr className='mt-1'/>
          </div>
          <div>
            <label className="block font-medium mb-1">Planned Scope</label>
            <div className="flex  gap-2">
              {["New Site", "Upgrade", "Modernization", "Swap"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox" 
                    name="planned_scope"
                    value={slot}
                    checked={formData.planned_scope.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
            <hr className='mt-1'/>
                  </div>
          
          <div>
            <label className="block font-medium mb-1">Location of Existing Telecom Racks & Cabinets </label>
            <div className="flex gap-2">
              {["Outdoor", "Shelter", "Room", "Data Center", "Other"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="location_of_existing_telecom_racks_cabinets"
                    value={slot}
                    checked={formData.location_of_existing_telecom_racks_cabinets.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Location of Planned New Telecom Racks & Cabinets </label>
            <div className="flex gap-2">
              {["Outdoor", "Shelter", "Room", "Data Center", "Other"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="location_of_planned_new_telecom_racks_cabinets"
                    value={slot}
                    checked={formData.location_of_planned_new_telecom_racks_cabinets.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
                </div>
            <hr className='mt-1'/>
          </div>

          <div>
            <label className="block font-medium mb-1">Existing Technology </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {["2G", "3G", "4G", "5G", "Other"].map((slot) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="existing_technology"
                    value={slot}
                    checked={formData.existing_technology.includes(slot)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {slot}
                </label>
              ))}
            </div>
            <hr className='mt-1'/>
          </div>
  </div>
      {/* Submit */}
      <div className="pt-6 text-center">
        <button type="submit"
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
          Save and Continue
        </button>
      </div>
    </div>
    <ImageUploader images={images} />
  </div>
  
  );
}

export default SiteInformationForm;
