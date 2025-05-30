import React, { useState } from "react";

const DcDistributionForm = () => {
  const [dcPduExist, setDcPduExist] = useState(null);
  const [pduCount, setPduCount] = useState("");
  const [pdus, setPdus] = useState([]);

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
      cbDetails: Array.from({ length: 3 }, () => ({ rating: "", load: "" })),
    }));
    setPdus(newPdus);
  };

  const updatePdu = (index, field, value) => {
    const updated = [...pdus];
    updated[index][field] = value;
    setPdus(updated);
  };

  const updateCbDetail = (pduIndex, cbIndex, field, value) => {
    const updated = [...pdus];
    updated[pduIndex].cbDetails[cbIndex][field] = value;
    setPdus(updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full space-y-6">
      <h2 className="text-xl font-bold">External DC Distribution, PDU</h2>

      {/* Radio: Is there a separate PDU? */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">
          Is there a separate DC PDU feeding the radio units, baseband & other equipment?
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
            onChange={(e) => handlePduCountChange(parseInt(e.target.value))}
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
      {pdus.map((pdu, i) => (
        <div className="border-t pt-6 mt-6 space-y-4">
          <h3 className="font-bold text-lg"> External DC PDU #{i + 1}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shared panel */}
            <div>
              <label className="font-semibold">Shared with other operator?</label>
              <div className="flex gap-4 mt-1">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pdu.shared === opt}
                      onChange={() => updatePdu(i, "shared", opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="font-semibold">Model of DC distribution module</label>
              <select
                value={pdu.model}
                onChange={(e) => updatePdu(i, "model", e.target.value)}
                className="border p-3 rounded-md mt-1 w-full"
              >
                <option value="">-- Select --</option>
                {["Nokia FPFH", "Nokia FPFD", "DC panel", "Other"].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="font-semibold">Location of DC module</label>
              <div className="flex gap-4 mt-1">
                {["On ground level", "On tower"].map((loc) => (
                  <label key={loc} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pdu.location === loc}
                      onChange={() => updatePdu(i, "location", loc)}
                    />
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            {/* Tower base height */}
            {pdu.location === "On tower" && (
              <div>
                <label className="font-semibold">
                  DC PDU base height from tower base level (m)
                </label>
                <input
                  type="number"
                  className="border p-3 rounded-md mt-1 w-full"
                  value={pdu.towerBaseHeight}
                  onChange={(e) =>
                    updatePdu(i, "towerBaseHeight", e.target.value)
                  }
                />
              </div>
            )}

            {/* Cabinet source */}
            <div>
              <label className="font-semibold">
                DC feed is coming from which cabinet?
              </label>
              <select
                value={pdu.feedCabinet}
                onChange={(e) => updatePdu(i, "feedCabinet", e.target.value)}
                className="border p-3 rounded-md mt-1 w-full"
              >
                <option value="">-- Select --</option>
                <option value="Existing cabinet #1">Existing cabinet #1</option>
                <option value="Existing cabinet #n">Existing cabinet #n</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* DC distribution source */}
            <div>
              <label className="font-semibold">
                DC feed is coming from which DC distribution inside cabinet?
              </label>
              <div className="flex gap-4 mt-1">
                {["BLVD", "LLVD", "PDU"].map((dist) => (
                  <label key={dist} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pdu.feedDistribution === dist}
                      onChange={() => updatePdu(i, "feedDistribution", dist)}
                    />
                    {dist}
                  </label>
                ))}
              </div>
            </div>

            {/* CB/Fuse feeding PDU */}
            <div>
              <label className="font-semibold">Which DC CB/fuse is feeding the PDU?</label>
              <select
                value={pdu.cbFuse}
                onChange={(e) => updatePdu(i, "cbFuse", e.target.value)}
                className="border p-3 rounded-md mt-1 w-full"
              >
                <option value="">-- Select --</option>
                <option value="CB1">CB1</option>
                <option value="CB2">CB2</option>
                <option value="CB3">CB3</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Cable length and cross-section */}
            <div>
              <label className="font-semibold">
                Length of DC power cable (m)
              </label>
              <input
                type="number"
                className="border p-3 rounded-md mt-1 w-full"
                value={pdu.cableLength}
                onChange={(e) => updatePdu(i, "cableLength", e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">
                Cross section of DC cable (mm²)
              </label>
              <input
                type="number"
                className="border p-3 rounded-md mt-1 w-full"
                value={pdu.cableCrossSection}
                onChange={(e) => updatePdu(i, "cableCrossSection", e.target.value)}
              />
            </div>

            {/* Free CBs */}
            <div>
              <label className="font-semibold">Does the DC PDU have free CBs/Fuses?</label>
              <div className="flex gap-4 mt-1">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pdu.hasFreeCbs === opt}
                      onChange={() => updatePdu(i, "hasFreeCbs", opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CB Table */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-300 text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">CB/Fuse #</th>
                  <th className="p-2 border">Rating (A)</th>
                  <th className="p-2 border">Connected Load</th>
                </tr>
              </thead>
              <tbody>
                {pdu.cbDetails.map((cb, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">#{idx + 1}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={cb.rating}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateCbDetail(i, idx, "rating", e.target.value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={cb.load}
                        className="w-full p-1 border rounded"
                        onChange={(e) =>
                          updateCbDetail(i, idx, "load", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DcDistributionForm;
