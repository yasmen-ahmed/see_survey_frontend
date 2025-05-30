import React, { useState, useEffect } from "react";

const AcInformationForm = () => {
  const [powerSource, setPowerSource] = useState("");
  const [formData, setFormData] = useState({
    hasGenerator: "no",
    generatorCount: 0,
    generatorDetails: [],
  });

  useEffect(() => {
    if (formData.hasGenerator === "yes" && formData.generatorCount > 0) {
      const details = Array.from({ length: formData.generatorCount }, () => ({
        operationalStatus: "",
        capacity: "",
        fuelType: "",
      }));
      setFormData((prev) => ({
        ...prev,
        generatorDetails: details,
      }));
    }
  }, [formData.generatorCount, formData.hasGenerator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting", { powerSource, ...formData });
    // Submission logic here
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      const updated = [...formData.generatorDetails];
      updated[index][name] = value;
      setFormData((prev) => ({
        ...prev,
        generatorDetails: updated,
      }));
    } else if (name === "powerSource") {
      setPowerSource(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-full">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          {/* Power Source Selection */}
          <div className="flex flex-col md:col-span-2">
            <label className="font-semibold mb-1">Select Power Source</label>
            <select
              name="powerSource"
              value={powerSource}
              onChange={handleInputChange}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select --</option>
              <option value="AC">AC Source</option>
              <option value="Generator">Generator</option>
            </select>
          </div>

          {/* AC Source Form */}
          {powerSource === "AC" && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold mb-4">AC Source Information</h3>
              {/* Add your AC form fields here */}
              <p className="text-gray-600">AC Source form coming soon...</p>
            </div>
          )}

       {powerSource === "Generator" && (
        <div className="md:col-span-2">
        <h3 className="text-lg font-bold mb-4">Generator Source Information</h3>
    
        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-1">Number of Generators</label>
          <select
            name="generatorCount"
            value={formData.generatorCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                generatorCount: parseInt(e.target.value),
                generatorDetails: Array.from({ length: parseInt(e.target.value) }, () => ({
                  kva: "",
                  status: "",
                })),
              })
            }
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select --</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
    
        {formData.generatorDetails.length > 0 &&
          formData.generatorDetails.map((gen, index) => (
            <div key={index} className="border p-4 rounded-lg mb-6 bg-gray-50">
              <h4 className="font-semibold mb-2">Generator #{index + 1}</h4>
    
              <div className="flex flex-col mb-4">
                <label className="font-semibold mb-1">KVA Capacity</label>
                <input
                  type="number"
                  name="kva"
                  value={gen.kva}
                  onChange={(e) => {
                    const updated = [...formData.generatorDetails];
                    updated[index].kva = e.target.value;
                    setFormData({ ...formData, generatorDetails: updated });
                  }}
                  className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
    
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Operational Status</label>
                <select
                  name="status"
                  value={gen.status}
                  onChange={(e) => {
                    const updated = [...formData.generatorDetails];
                    updated[index].status = e.target.value;
                    setFormData({ ...formData, generatorDetails: updated });
                  }}
                  className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Active">Active</option>
                  <option value="Faulty">Faulty</option>
                  <option value="Not Working">Not Working</option>
                  <option value="Standby">Standby</option>
                </select>
              </div>
            </div>
          ))}
      </div>
       )}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcInformationForm;
