import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import DynamicTable from "../../DynamicTable";

const DcDistributionForm = () => {
  const { sessionId } = useParams();
  const [dcPduExist, setDcPduExist] = useState(null);
  const [pduCount, setPduCount] = useState("");
  const [pdus, setPdus] = useState([]);
  const [error, setError] = useState("");

  const handlePduCountChange = (count) => {
    setPduCount(count);
    const newPdus = Array.from({ length: count }, () => ({
      shared: "",
      model: "",
      location: "",
      towerBaseHeight: "",
      feedCabinet: "",
      feedDistribution: "",
      cbFuse: "",
      cableLength: "",
      cableCrossSection: "",
      hasFreeCbs: "",
      cbDetails: Array.from({ length: 3 }, () => ({ rating: "", connected_module: "" })),
    }));
    setPdus(newPdus);
  };

  const updatePdu = (index, field, value) => {
    const updated = [...pdus];
    updated[index][field] = value;
    setPdus(updated);
  };

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched External DC Distribution data:", data);

        if (data) {
          // Map API data to component state
          const hasSeparateDcPdu = data.has_separate_dc_pdu || "";
          const apiPduCount = data.pdu_count || 0;
          const dcPdus = data.dc_pdus || [];
          
          // Set the main form fields
          setDcPduExist(hasSeparateDcPdu);
          setNumberOfCabinets(data.number_of_cabinets || 0);
          
          if (hasSeparateDcPdu === "Yes" && apiPduCount > 0) {
            setPduCount(apiPduCount.toString());
            
            // Process PDUs data to match component structure
            const processedPdus = Array.from({ length: apiPduCount }, (_, index) => {
              const pdu = dcPdus[index] || {};
              return {
                shared: pdu.is_shared_panel || "",
                model: pdu.dc_distribution_model || "",
                location: pdu.dc_distribution_location || "",
                towerBaseHeight: pdu.pdu_height_from_base || "",
                feedCabinet: pdu.dc_feed_cabinet || "",
                feedDistribution: pdu.dc_feed_distribution_type || "",
                cbFuse: pdu.feeding_dc_cbs || "",
                cableLength: pdu.dc_cable_length || "",
                cableCrossSection: pdu.dc_cable_cross_section || "",
                hasFreeCbs: pdu.has_free_cbs_fuses || "",
                cbDetails: pdu.cb_fuse_ratings ? pdu.cb_fuse_ratings.map(rating => ({
                  rating: rating.rating || "",
                  connected_module: rating.connected_load || ""
                })) : Array.from({ length: 3 }, () => ({ rating: "", connected_module: "" }))
              };
            });
            
            console.log("Processed PDUs:", processedPdus);
            setPdus(processedPdus);
          }
        }
      })
      .catch(err => {
        console.error("Error loading External DC Distribution data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);


  const tableRows = [
    {
      key: 'rating',
      label: 'rating (Amp)',
      type: 'number',
      placeholder: 'Add rating...'
    },
    {
      key: 'connected_module',
      label: 'module',
      type: 'textarea',
      placeholder: 'Module name'
    }
  ];

  const getTableData = useCallback((pduIndex) => {
    if (pdus[pduIndex] && pdus[pduIndex].cbDetails && pdus[pduIndex].cbDetails.length > 0) {
      return pdus[pduIndex].cbDetails.map((item, index) => ({
        id: index + 1,
        rating: item.rating?.toString() || "",
        connected_module: item.connected_module || ""
      }));
    }
    return [];
  }, [pdus]);

  const handleTableDataChange = useCallback((pduIndex, newTableData) => {
    if (!newTableData || newTableData.length === 0) {
      return;
    }

    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: item.rating || "",
        connected_module: item.connected_module || ""
      }));

    const updated = [...pdus];
    updated[pduIndex].cbDetails = processedData;
    setPdus(updated);
  }, [pdus]);

  const images = [
    { label: 'DC Distribution Overview Photo', name: 'dc_distribution_overview_photo' },
    { label: 'DC PDU Detail Photo', name: 'dc_pdu_detail_photo' },
    { label: 'DC Cable Installation Photo', name: 'dc_cable_installation_photo' },
  ];
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    console.log(`Generated ${options.length} cabinet options:`, options);
    return options;
  };
  const cabinetOptions = generateCabinetOptions();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Basic validation
      if (!dcPduExist) {
        setError("Please select if there is a separate DC PDU.");
        return;
      }

      if (dcPduExist === "Yes" && !pduCount) {
        setError("Please select the number of PDUs.");
        return;
      }

      // Prepare data in the format expected by the API
      const submitData = {
        has_separate_dc_pdu: dcPduExist,
        pdu_count: dcPduExist === "Yes" ? parseInt(pduCount) : 0,
        dc_pdus: dcPduExist === "Yes" ? pdus.map((pdu) => ({
          is_shared_panel: pdu.shared || null,
          dc_distribution_model: pdu.model || null,
          dc_distribution_location: pdu.location || null,
          pdu_height_from_base: pdu.location === "On ground level" ? null : (parseFloat(pdu.towerBaseHeight) || null),
          dc_feed_cabinet: pdu.feedCabinet || null,
          dc_feed_distribution_type: pdu.feedDistribution || null,
          feeding_dc_cbs: pdu.cbFuse || null,
          dc_cable_length: parseFloat(pdu.cableLength) || null,
          dc_cable_cross_section: parseFloat(pdu.cableCrossSection) || null,
          has_free_cbs_fuses: pdu.hasFreeCbs || null,
          cb_fuse_ratings: pdu.cbDetails ? pdu.cbDetails.filter(rating => rating.rating && rating.connected_module).map(rating => ({
            rating: parseFloat(rating.rating) || 0,
            connected_load: rating.connected_module
          })) : []
        })) : []
      };

      console.log("Submitting External DC Distribution data:", submitData);

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/external-dc-distribution/${sessionId}`, submitData);
      showSuccess('External DC Distribution data submitted successfully!');
      console.log("Response:", response.data);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error submitting External DC Distribution data:", err);
      showError(`Error submitting data: ${err.response?.data?.error || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Radio: Is there a separate PDU? */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Is there separate DC PDU feeding the radio units, baseband & other equipment?
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dcPduExist"
                    value={option}
                    checked={dcPduExist === option}
                    onChange={() => {
                      setDcPduExist(option);
                      if (option === "No") {
                        setPduCount("");
                        setPdus([]);
                      }
                      setError(""); // Clear error when user makes selection
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>


          {/* Drop-down: How many */}
          {dcPduExist === "Yes" && (
            <div className="flex flex-col">
              <label className="font-semibold mb-1">How many?</label>
              <select
                value={pduCount}
                onChange={(e) => {
                  handlePduCountChange(parseInt(e.target.value));
                  setError(""); // Clear error when user makes selection
                }}
                className="border p-3 rounded-md"
              >
                <option value="">-- Select --</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PDU Details */}
          {/* Dynamic DC PDU Table */}
          {pduCount && parseInt(pduCount) > 0 && pdus.length > 0 && (
            <div className="">
              <div className="overflow-auto max-h-[400px]">
                <table className="table-auto w-full border-collapse">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th
                        className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                        style={{ width: '300px', minWidth: '300px', maxWidth: '300px' }}
                      >
                        Field Description
                      </th>
                      {Array.from({ length: parseInt(pduCount) }, (_, i) => (
                        <th
                          key={i}
                          className="border px-4 py-3 text-center font-semibold min-w-[400px] sticky top-0 bg-blue-500 z-20"
                        >
                          DC PDU #{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Shared panel */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Is this a shared panel with other operator?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <div className="flex gap-4 mt-1">
                            {["Yes", "No"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.shared === opt}
                                  onChange={() => updatePdu(pduIndex, "shared", opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Model */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        What is the model of this DC distribution module?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <div className="grid grid-cols-2 gap-1">
                            {["Nokia FPFH", "Nokia FPFD", "DC panel", "Other"].map((model) => (
                              <label key={model} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.model === model}
                                  onChange={() => updatePdu(pduIndex, "model", model)}
                                />
                                {model}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Location */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Where is this DC module located?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <div className="flex gap-4 mt-1">
                            {["On ground level", "On tower"].map((loc) => (
                              <label key={loc} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.location === loc}
                                  onChange={() => updatePdu(pduIndex, "location", loc)}
                                />
                                {loc}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Tower base height */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC PDU base height from tower base level (meter)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          {pdu.location === "On tower" ? (
                            <input
                              type="number"
                              className="w-full p-2 border rounded text-sm"
                              value={pdu.towerBaseHeight}
                              onChange={(e) => updatePdu(pduIndex, "towerBaseHeight", e.target.value)}
                              placeholder="Enter height..."
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">N/A (On ground level)</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Cabinet source */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC feed is coming from which cabinet?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <select
                            value={pdu.feedCabinet}
                            onChange={(e) => updatePdu(pduIndex, "feedCabinet", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="">-- Select --</option>
                            {cabinetOptions.map((cabinet) => (
                <option key={cabinet} value={cabinet}>{cabinet}</option>
              ))}
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* DC distribution source */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        DC feed is coming from which DC distribution inside the cabinet?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <div className="flex gap-4 mt-1">
                            {["BLVD", "LLVD", "PDU"].map((dist) => (
                              <label key={dist} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.feedDistribution === dist}
                                  onChange={() => updatePdu(pduIndex, "feedDistribution", dist)}
                                />
                                {dist}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* CB/Fuse feeding PDU */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Which DC CB/fuse is feeding the PDU?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <select
                            value={pdu.cbFuse}
                            onChange={(e) => updatePdu(pduIndex, "cbFuse", e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="">-- Select --</option>
                            <option value="CB1">CB1</option>
                            <option value="CB2">CB2</option>
                            <option value="CB3">CB3</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      ))}
                    </tr>

                    {/* Cable length */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Length of DC power cable (m)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            className="w-full p-2 border rounded text-sm"
                            value={pdu.cableLength}
                            onChange={(e) => updatePdu(pduIndex, "cableLength", e.target.value)}
                            placeholder="Enter length..."
                          />
                        </td>
                      ))}
                    </tr>

                    {/* Cable cross-section */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Cross section of DC cable (mm²)
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <input
                            type="number"
                            className="w-full p-2 border rounded text-sm"
                            value={pdu.cableCrossSection}
                            onChange={(e) => updatePdu(pduIndex, "cableCrossSection", e.target.value)}
                            placeholder="Enter cross section..."
                          />
                        </td>
                      ))}
                    </tr>

                    {/* Free CBs */}
                    <tr>
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                        Does the DC PDU have free CBs/Fuses?
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <div className="flex gap-4 mt-1">
                            {["Yes", "No"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={pdu.hasFreeCbs === opt}
                                  onChange={() => updatePdu(pduIndex, "hasFreeCbs", opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* CB/Fuse Details Table */}
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      Ratings of DC CBs/Fuses in the PDU
                      </td>
                      {pdus.slice(0, parseInt(pduCount)).map((pdu, pduIndex) => (
                        <td key={pduIndex} className="border px-2 py-2">
                          <DynamicTable
                            title=""
                            rows={tableRows}
                            initialData={getTableData(pduIndex)}
                            onChange={(newData) => handleTableDataChange(pduIndex, newData)}
                            minColumns={1}
                            autoExpand={true}
                            enableDragDrop={true}
                            enableDelete={true}
                            className=""
                            tableClassName="w-full border border-gray-300"
                            headerClassName="bg-gray-200"
                            cellClassName="border px-2 py-2"
                            labelClassName="border px-4 py-2 font-semibold bg-gray-50"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 font-semibold"
            >
              Save and Continue
            </button>
          </div>
   
        </form>
      </div>
      <ImageUploader images={images} />
    </div>
  );
};

export default DcDistributionForm;
