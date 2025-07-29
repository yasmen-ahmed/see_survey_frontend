import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useImageManager from "../../../hooks/useImageManager";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

function SiteAccessForm() {
  const { sessionId, siteId } = useParams();
  const { uploadedImages, handleImageUpload, saveImages, loading } = useImageManager(sessionId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false)
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
    // New fields for access problems
    environment_cultural_problems: "",
    environment_cultural_problems_details: "",
    aviation_problems: "",
    aviation_problems_details: "",
    military_problems: "",
    military_problems_details: "",
    why_crane_needed: "",
    need_crane_permission: ""
  });
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


  useEffect(() => {
    setLoadingApi(true)
    axios.get(`${import.meta.env.VITE_API_URL}/api/site-access/${sessionId}`)
      .then(res => {
        const data = res.data;
        console.log(data)
        setFormData({
          site_access_permission_required: data.site_access_permission_required || "",
          preferred_time_slot_crane_access: data.preferred_time_slot_crane_access || [],
          contact_person_name: data.contact_person_name,
          contact_tel_number: data.contact_tel_number || 0,
          available_access_time: data.available_access_time || [],
          access_to_site_by_road: data.access_to_site_by_road || "",
          contact_person_name_for_site_key: data.contact_person_name_for_site_key || "",
          contact_tel_number_for_site_key: data.contact_tel_number_for_site_key || "",
          type_of_gated_fence: data.type_of_gated_fence || "",
          keys_required: data.keys_required || "",
          keys_type: data.keys_type || [],
          material_accessibility_to_site: data.material_accessibility_to_site || [],
          stair_lift_height: data.stair_lift_height || 0,
          stair_lift_width: data.stair_lift_width || 0,
          stair_lift_depth: data.stair_lift_depth || 0,
          // New fields for access problems
          environment_cultural_problems: data.environment_cultural_problems || "",
          environment_cultural_problems_details: data.environment_cultural_problems_details || "",
          aviation_problems: data.aviation_problems || "",
          aviation_problems_details: data.aviation_problems_details || "",
          military_problems: data.military_problems || "",
          military_problems_details: data.military_problems_details || "",
          why_crane_needed: data.why_crane_needed || "",
          need_crane_permission: data.need_crane_permission || ""
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

  // Function to save data via API (for use with useUnsavedChanges hook)
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;

    try {
      setLoadingApi(true);
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
        // New access problems fields
        environment_cultural_problems: formData.environment_cultural_problems,
        environment_cultural_problems_details: formData.environment_cultural_problems_details,
        aviation_problems: formData.aviation_problems,
        aviation_problems_details: formData.aviation_problems_details,
        military_problems: formData.military_problems,
        military_problems_details: formData.military_problems_details,
        why_crane_needed: formData.why_crane_needed,
        need_crane_permission: formData.need_crane_permission
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/site-access/${sessionId}`, payload);

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
        {hasUnsavedChanges && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
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
            <hr className="mt-2" />
          </div>

         


          <div>
            <label className="block font-medium mb-1">Contact Person Name For Site Access</label>
            <input
              type="text"
              name="contact_person_name"
              value={formData.contact_person_name}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />

          </div>

          <div>
            <label className="block font-medium mb-1">Contact Tel. Number For Site Access</label>
            <input
              type="number"
              name="contact_tel_number"
              value={formData.contact_tel_number}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
          </div>



          <div>
            <label className="block font-medium mb-1">Contact Person Name For Site Key</label>
            <input
              type="text"
              name="contact_person_name_for_site_key"
              value={formData.contact_person_name_for_site_key}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
          </div>

          <div>
            <label className="block font-medium mb-1">Contact Tel. Number For Site Key</label>
            <input
              type="number"
              name="contact_tel_number_for_site_key"
              value={formData.contact_tel_number_for_site_key}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
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
            <hr className="mt-2" />
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
            <hr className="mt-2" />
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
            <hr className="mt-2" />
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
            <hr className="mt-2" />
          </div>

          <div>
            <fieldset className="">
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
                      className=""
                    />
                    <span>{slot}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <hr className="mt-2" />
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
                    className=""
                  />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
            <hr className="mt-2" />
          </div>
          {
            formData.material_accessibility_to_site.includes("By Crane") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 p-4 rounded-lg col-span-2"> 
                {/* Why Crane is Needed */}
                <div>
                  <label className='block font-semibold '>Why Crane is needed</label>
                  <textarea
                    name="why_crane_needed"
                    value={formData.why_crane_needed}
                    onChange={handleChange}
                    className="form-input w-full"
                    rows="1"
                    placeholder="Please explain here..."
                  />
                </div>

                {/* Need Crane Permission */}
                <div>
                  <label className='block font-semibold '>Need crane permission</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="need_crane_permission"
                        value="Yes"
                        checked={formData.need_crane_permission === "Yes"}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="need_crane_permission"
                        value="No"
                        checked={formData.need_crane_permission === "No"}
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
            <hr className="mt-2" />

          </div>

              </div>

            )

          }

          <div>
            <label className="block font-medium mb-1">Stair/Lift Height (meter)</label>
            <input
              type="number"
              name="stair_lift_height"
              value={formData.stair_lift_height}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
          </div>

          <div>
            <label className="block font-medium mb-1">Stair/Lift Width (meter)</label>
            <input
              type="number"
              name="stair_lift_width"
              value={formData.stair_lift_width}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
          </div>


          <div>
            <label className="block font-medium mb-1">Stair/Lift Depth (meter)</label>
            <input
              type="number"
              name="stair_lift_depth"
              value={formData.stair_lift_depth}
              onChange={handleChange}
              className="form-input"
            />
            <hr className="mt-2" />
          </div>



          {/* Access Problems Section */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-100 p-4 rounded-lg col-span-2">
            <h2 className='text-2xl font-bold text-blue-700 mb-4 col-span-2'>Access Problems</h2>
            {/* Environment or Cultural Problems */}
            <div>
              <label className='block font-semibold mb-2'>Are there any environment or cultural problems?</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="environment_cultural_problems"
                    value="Yes"
                    checked={formData.environment_cultural_problems === "Yes"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="environment_cultural_problems"
                    value="No"
                    checked={formData.environment_cultural_problems === "No"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {formData.environment_cultural_problems === "Yes" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Specify the problem:</label>
                  <textarea
                    name="environment_cultural_problems_details"
                    value={formData.environment_cultural_problems_details}
                    onChange={handleChange}
                    className="form-input w-full"
                    rows="1"
                    placeholder="Please describe the problems..."
                  />
                </div>
              )}
            </div>

            {/* Aviation Problems */}
            <div>
              <label className='block font-semibold mb-2'>Are there any Aviation problems?</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="aviation_problems"
                    value="Yes"
                    checked={formData.aviation_problems === "Yes"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="aviation_problems"
                    value="No"
                    checked={formData.aviation_problems === "No"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {formData.aviation_problems === "Yes" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Specify the problem:</label>
                  <textarea
                    name="aviation_problems_details"
                    value={formData.aviation_problems_details}
                    onChange={handleChange}
                    className="form-input w-full"
                    rows="1"
                    placeholder="Please describe the problems..."
                  />
                </div>
              )}
            </div>

            {/* Military Problems */}
            <div>
              <label className='block font-semibold mb-2'>Any military problems?</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="military_problems"
                    value="Yes"
                    checked={formData.military_problems === "Yes"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="military_problems"
                    value="No"
                    checked={formData.military_problems === "No"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {formData.military_problems === "Yes" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Specify the problem:</label>
                  <textarea
                    name="military_problems_details"
                    value={formData.military_problems_details}
                    onChange={handleChange}
                    className="form-input w-full"
                    rows="1"
                    placeholder="Please describe the problems..."
                  />
                </div>
              )}
            </div>
          </div>


        </div>

        <div className="mt-auto pt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {loadingApi ? "loading..." : "Save"}
          </button>
        </div>
      </div>
      <ImageUploader
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
}

export default SiteAccessForm;
