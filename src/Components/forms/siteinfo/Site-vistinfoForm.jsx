import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";
import { showSuccess, showError } from "../../../utils/notifications";
import useImageManager from "../../../hooks/useImageManager";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

function SitevistinfoForm() {
  const { sessionId, siteId } = useParams(); 
  const { uploadedImages, handleImageUpload, saveImages, loading } = useImageManager(sessionId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const [formData, setFormData] = useState({
    session_id:  "",
    surveyor_name: "",
    subcontractor_company: "",
    surveyor_phone: "",
    nokia_representative_name: "",
    nokia_representative_title: "",
    customer_representative_name: "",
    customer_representative_title: "",
    survey_date: "",
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
  ];
  

  useEffect(() => {
    setLoadingApi(true)
    axios.get(`${import.meta.env.VITE_API_URL}/api/site-visit-info/${sessionId}`)
      .then(res => {
        const data = res.data[0];
        setFormData({
          session_id: sessionId || data.session_id || "",
          surveyor_name: data.surveyor_name || "",
          subcontractor_company: data.subcontractor_company,
          surveyor_phone: data.surveyor_phone || "",
          nokia_representative_name: data.nokia_representative_name || "",
          nokia_representative_title: data.nokia_representative_title || "",
          customer_representative_name: data.customer_representative_name || "",
          customer_representative_title: data.customer_representative_title || "",
          survey_date: data.survey_date ? new Date(data.survey_date).toISOString().slice(0,10) : ""
        }); 
        console.log(formData)
        setLoadingApi(false)
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  // Handle input change for form fields
  const handleInputChange = (e) => {
    setHasUnsavedChanges(true);
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], // Save file in state (not sent to backend yet)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
  };  
  
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

  // Function to save data via API (for use with useUnsavedChanges hook)
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      const payload = {
        surveyor_name: formData.surveyor_name,
        subcontractor_company: formData.subcontractor_company,
        surveyor_phone: formData.surveyor_phone,
        nokia_representative_name: formData.nokia_representative_name,
        nokia_representative_title: formData.nokia_representative_title,
        customer_representative_name: formData.customer_representative_name,
        customer_representative_title: formData.customer_representative_title,
        survey_date: formData.survey_date,
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/site-visit-info/${sessionId}`, payload);
      
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

  if (loading ) {
    return <div>Loading...</div>;
  }

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
        <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Survey Date */}
          <div className="flex flex-col">
            <label htmlFor="survey_date" className="mb-1 font-semibold">Survey Date</label>
            <input
              type="date"
              name="survey_date"
              id="survey_date"
              value={formData.survey_date}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* contractor comapy*/}
          <div className="flex flex-col">
            <label htmlFor="concompany" className="mb-1 font-semibold">SubContractor Company</label>
            <input
              type="text"
              name="subcontractor_company"
              id="subcontractor_company"
              value={formData.subcontractor_company }
              onChange={handleInputChange}
              className="form-input"
              required
              disabled
            />
          </div>

          {/* surveyor Name*/}
          <div className="flex flex-col">
            <label htmlFor="SurveryorName" className="mb-1 font-semibold">Surveryor Name</label>
            <input
              type="text"
              name="surveyor_name"
              id="surveyor_name"
              value={formData.surveyor_name}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled
            />
          </div>

          {/* Surveryorphone*/}
          <div className="flex flex-col">
            <label htmlFor="Surveryorphone" className="mb-1 font-semibold">Surveryor Phone</label>
            <input
              type="phone"
              name="surveyor_phone"
              id="surveyor_phone"
              value={formData.surveyor_phone}
              onChange={handleInputChange}
              className="form-input" 
              required
              disabled
            />
          </div>

          {/* NokiaRrep */}
          <div className="flex flex-col">
            <label htmlFor=" nokiaRrep " className="mb-1 font-semibold">Nokia Representative Name</label>
            <input
              type="text"
              name="nokia_representative_name"
              id="nokia_representative_name"
              value={formData.nokia_representative_name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* nokiaRreptitle */}
          <div className="flex flex-col">
            <label htmlFor="nokiaRreptitle" className="mb-1 font-semibold">Nokia Representative Title</label>
            <input
              type="text"
              name="nokia_representative_title"
              id="nokia_representative_title"
              value={formData.nokia_representative_title}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* customerRepr */}
          <div className="flex flex-col">
            <label htmlFor="customerRepr" className="mb-1 font-semibold">Customer Representative Name</label>
            <input
              type="text"
              name="customer_representative_name"
              id="customer_representative_name"
              value={formData.customer_representative_name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* customerReprTitle */}
          <div className="flex flex-col">
            <label htmlFor="customerReprTitle" className="mb-1 font-semibold">Customer Representative Title</label>
            <input
              type="text"
              name="customer_representative_title"
              id="customer_representative_title"
              value={formData.customer_representative_title}
              onChange={handleInputChange}
                className="form-input"
            />
          </div>
</div>
          {/* Save Button at Bottom */}
          <div className="mt-auto pt-6 flex justify-center">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              {loadingApi ? "loading...": "Save"}  
            </button>
          </div>
        </form>
      </div>
      <ImageUploader 
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
}

export default SitevistinfoForm;
