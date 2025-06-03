import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageUploader from "../../GalleryComponent";

function SitevistinfoForm() {
  const { sessionId, siteId } = useParams(); 
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
    { label: 'Base station Shelter / Room', name: 'base_station_shelter_room' },
    { label: 'Site Name on shelter/room', name: 'site_name_on_shelter_room' },    
    { label: 'Crane Access to the Street', name: 'crane_access_to_the_street' },
    { label: 'Crane Location', name: 'crane_location' },
    { label: 'Site Environment View', name: 'site_environment_view' },
  ];
  

  useEffect(() => {
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
      })
      .catch(err => console.error("Error loading survey details:", err));
  }, [sessionId, siteId]);

  // Handle input change for form fields
  const handleInputChange = (e) => {
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

    // Prepare the payload excluding images for now
    const { frontImage, sideImage, topImage, ...dataWithoutImages } = formData;

    const payload = {
      surveyor_name: dataWithoutImages.surveyor_name,
      subcontractor_company: dataWithoutImages.subcontractor_company,
      surveyor_phone: dataWithoutImages.surveyor_phone,
      nokia_representative_name: dataWithoutImages.nokia_representative_name,
      nokia_representative_title: dataWithoutImages.nokia_representative_title,
      customer_representative_name: dataWithoutImages.customer_representative_name,
      customer_representative_title: dataWithoutImages.customer_representative_title,
      survey_date: dataWithoutImages.survey_date,
     
    };

    

    try {
      const response=await axios.put(`${import.meta.env.VITE_API_URL}/api/site-visit-info/${sessionId}`,payload);
      alert("Data submitted successfully!");
      console.log(response)
    } catch (err) {
      console.error("Error:", err);
      alert("Error submitting data. Please try again.");
    }
  };

  return (
  <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" onSubmit={handleSubmit}>

          {/* Survey Date */}
          <div className="flex flex-col">
            <label htmlFor="survey_date" className="mb-1 font-semibold">Survey Date</label>
            <input
              type="date"
              name="survey_date"
              id="survey_date"
              value={formData.survey_date}
              onChange={handleInputChange}
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
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
              className="border p-3 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center">
            <button type="submit" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">
              Save and Continue
            </button>
          </div>
        </form>
      </div>
      <ImageUploader images={images} />
    </div>
  );
}

export default SitevistinfoForm;
