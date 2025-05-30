import React, { useState } from 'react';

function SitevistinfoForm() {
  const [formData, setFormData] = useState({
    siteId: "",
    siteName: "",
    region: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    siteelevation: "",
    surveyDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Form submitted!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 ">
      <div className="bg-white p-3 rounded-xl shadow-md w-full">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" onSubmit={handleSubmit}>

          {/* Survey Date */}
          <div className="flex flex-col">
            <label htmlFor="surveyDate" className="mb-1 font-semibold">Survey Date</label>
            <input
              type="date"
              name="surveyDate"
              id="surveyDate"
              value={formData.surveyDate}
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
              name="concompany"
              id="concompany"
              value={formData.concompany}
              onChange={handleInputChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          {/* user Email */}
          <div className="flex flex-col">
            <label htmlFor="useremail" className="mb-1 font-semibold">User Email</label>
            <input
              type="email"
              name="useremail"
              id="useremail"
              value={formData.useremail}
              onChange={handleInputChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          {/* surveyor Name*/}
          <div className="flex flex-col">
            <label htmlFor="SurveryorName" className="mb-1 font-semibold">Surveryor Name</label>
            <input
              type="text"
              name="SurveryorName"
              id="SurveryorName"
              value={formData.SurveryorName}
              onChange={handleInputChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          {/* Surveryorphone*/}
          <div className="flex flex-col">
            <label htmlFor="Surveryorphone" className="mb-1 font-semibold">Surveryor Phone</label>
            <input
              type="phone"
              name="Surveryorphone"
              id="Surveryorphone"
              value={formData.Surveryorphone}
              onChange={handleInputChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          {/* NokiaRrep */}
          <div className="flex flex-col">
            <label htmlFor=" nokiaRrep " className="mb-1 font-semibold">Nokia Representative Name</label>
            <input
              type="text"
              name="nokiaRrep "
              id="nokiaRrep "
              value={formData.nokiaRrep }
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
              name="nokiaRreptitle"
              id="nokiaRreptitle"
              value={formData.nokiaRreptitle}
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
              name="customerRepr"
              id="customerRepr"
              value={formData.customerRepr}
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
              name="customerReprTitle"
              id="customerReprTitle"
              value={formData.customerReprTitle}
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
    </div>
  );
}

export default SitevistinfoForm;
