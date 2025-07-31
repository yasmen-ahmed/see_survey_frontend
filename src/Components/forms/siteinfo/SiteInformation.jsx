import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useImageManager from "../../../hooks/useImageManager";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";
import { useReadOnly } from "../../../hooks/useReadOnly";

function SiteInformationForm({ readOnly = false }) {
  
const { sessionId, siteId } = useParams();   
const { uploadedImages, handleImageUpload, saveImages, loading } = useImageManager(sessionId);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [loadingApi,setLoadingApi] =useState(false) 
const { isReadOnly, getInputProps, getButtonProps } = useReadOnly();
  
// Use the readOnly prop or the context readOnly state
const isFormReadOnly = readOnly || isReadOnly;
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

  // Function to save data via API (for use with useUnsavedChanges hook)
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
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

      await axios.put(`${import.meta.env.VITE_API_URL}/api/site-area-info/${sessionId}`, payload);
      
      // Save images
      const imagesSaved = await saveImages();
      if (!imagesSaved) {
        throw new Error('Failed to save images');
      }
      
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("Error saving data:", err);
      return false;
    } finally {
      setLoadingApi(false);
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

    useEffect(() => {
      setLoadingApi(true)
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
        setLoadingApi(false)
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  const handleChange = (e) => {
    setHasUnsavedChanges(true);
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
    { label: 'Base station Shelter / Room', name: 'base_station_shelter' },
    { label: 'Site Name on shelter/room', name: 'site_name_shelter' },    
    { label: 'Crane Access to the Street', name: 'crane_access_street' },
    { label: 'Crane Location', name: 'crane_location' },
    { label: 'Site Environment View', name: 'site_environment' },
    { label: 'Site Map Snapshot', name: 'site_map_snapshot' },
    { label: 'Site ID Picture', name: 'site_id_picture' },
  ];
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Data submitted successfully!');
      }
    } catch (err) {
      console.error("Error:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  return (
    <div className="h-full flex items-start space-x-2 justify-start bg-gray-100 p-">
    <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full overflow-y-auto flex flex-col">
       {/* Unsaved Changes Warning */}
       {hasUnsavedChanges && !isFormReadOnly && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">
                  ⚠️ You have unsaved changes     
                </p>
                <p className="text-sm">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          </div>
        )}  
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                    {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                  {...getInputProps()}
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
                    {...getInputProps()}
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
                    {...getInputProps()}
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
                    {...getInputProps()}
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
                    {...getInputProps()}
                  />
                  {slot}
                </label>
              ))}
            </div>
            <hr className='mt-1'/>
          </div>
  </div>
      {/* Submit */}
      <div className="mt-auto pt-6 flex justify-center">
        <button type="submit"
          onClick={handleSubmit}
          {...getButtonProps()}
          className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
          {loadingApi ? "loading...": "Save"}  
        </button>
      </div>
    </div>
    <ImageUploader 
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
        readOnly={isFormReadOnly}
      />
  </div>
  
  );
}

export default SiteInformationForm;
