import React, { useState } from "react";

const outdoor = () => {
  const [formData, setFormData] = useState({
    vendor: "",
    dcRecCount: "",
    rectifierInstalled: "",
    rectifierModel: "",
    rectifierCapacity: "",
    freeSlots: "",
    hasBLVD: "",
    blvdFreeCBs: "",
    hasLLVDC: "",
    llvdcFreeCBs: "",
    hasPDU: "",
    pduFreeCBs: "",
    batteryStrings: "",
    batteryType: "",
    batteryVendor: "",
    totalBatteryCapacity: "",
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("DC Power System Form Submitted:", formData);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col">
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
        
        <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Dropdown */}
              <div>
                <label className="block font-semibold mb-2">Coming Soon</label>
                
              </div>

              {/* Other Fields */}
              {inputField({ label: "How Many Existing DC REC", name: "dcRecCount", type: "number" })}
              {inputField({ label: "How Many Existing Rectifier Module Install", name: "rectifierInstalled", type: "number" })}
              {inputField({ label: "Rectifier Module Model", name: "rectifierModel" })}
              {inputField({ label: "Rectifier Model Capacity (Single Module)", name: "rectifierCapacity" })}
              {inputField({ label: "How Many Free Slots Available For New Rectifier", name: "freeSlots", type: "number" })}

              {radioField({ label: "Is There BLVD In The DC Power REC?", name: "hasBLVD" })}
              {radioField({ label: "Does The BLVD Has Free CBs?", name: "blvdFreeCBs" })}
              {radioField({ label: "Is There LLVDC In The DC REC?", name: "hasLLVDC" })}
              {radioField({ label: "Does The LLVDC Has Free CBs?", name: "llvdcFreeCBs" })}
              {radioField({ label: "Is There PDU In The Cabinet?", name: "hasPDU" })}
              {radioField({ label: "Does PDU Has Free CBs?", name: "pduFreeCBs" })}

              {inputField({ label: "How Many Battery Exist String (Shelter)", name: "batteryStrings", type: "number" })}
              {inputField({ label: "Battery Type", name: "batteryType" })}
              {inputField({ label: "Battery Vendor", name: "batteryVendor" })}
              {inputField({ label: "Total Battery Capacity (AH)", name: "totalBatteryCapacity", type: "number" })}
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 text-center">Existing BLVD CBs Rating and Connected Load</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200 text-center">
                      <th className="border border-gray-300 p-2">CB Info</th>
                      {Array.from({ length: 10 }, (_, i) => (
                        <th key={i} className="border border-gray-300 p-2">CB{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* CB Fuse Rating Row */}
                    <tr className="text-center">
                      <td className="border border-gray-300 p-2 font-semibold">CB Fuse Rating</td>
                      {Array.from({ length: 10 }, (_, i) => (
                        <td key={i} className="border border-gray-300 p-2">
                          <select name={`cbFuseRating${i + 1}`} className="w-full p-1 border rounded">
                            <option value="">Select</option>
                            <option value="10A">10A</option>
                            <option value="16A">16A</option>
                            <option value="20A">20A</option>
                            <option value="32A">32A</option>
                            <option value="63A">63A</option>
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* Connected Load Row */}
                    <tr className="text-center">
                      <td className="border border-gray-300 p-2 font-semibold">Connected Load</td>
                      {Array.from({ length: 10 }, (_, i) => (
                        <td key={i} className="border border-gray-300 p-2">
                          <select name={`connectedLoad${i + 1}`} className="w-full p-1 border rounded">
                            <option value="">Select</option>
                            <option value="100W">100W</option>
                            <option value="250W">250W</option>
                            <option value="500W">500W</option>
                            <option value="750W">750W</option>
                            <option value="1000W">1000W</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Save Button at Bottom - Fixed */}
          <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Helper functions
  function inputField({ label, name, type = "text" }) {
    return (
      <div key={name}>
        <label className="block font-semibold mb-2">{label}</label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />
      </div>
    );
  }

  function radioField({ label, name }) {
    return (
      <div key={name}>
        <label className="block font-semibold mb-2">{label}</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name={name}
              value="Yes"
              checked={formData[name] === "Yes"}
              onChange={handleChange}
              className="mr-1"
              required
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name={name}
              value="No"
              checked={formData[name] === "No"}
              onChange={handleChange}
              className="mr-1"
            />
            No
          </label>
        </div>
      </div>
    );
  }
};

export default outdoor;
