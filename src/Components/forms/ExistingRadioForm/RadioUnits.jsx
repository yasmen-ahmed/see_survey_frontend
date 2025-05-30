import React, { useState } from 'react';

const nokiaModels = ['Nokia Model 1', 'Nokia Model 2', 'Nokia Model 3']; // replace with real models
const operators = ['Operator 1', 'Operator 2', 'Operator 3', 'Operator 4'];
const sideArms = [
  'Same antenna side arm',
  'Separate side arm only for the radio unit',
  'Shared side arm with other radio units',
  'Other',
];
const dcSources = [
  'Directly from rectifier distribution',
  'External DC PDU #1',
  'External DC PDU #2',
  'External DC PDU #n',
];
const feederTypes = ['7/8 inch', '1-1/4 inch', '1-5/4 inch', '1/2 inch'];

const RadioUnitsForm = () => {
  const [unitCount, setUnitCount] = useState(1);
  const [units, setUnits] = useState(Array(1).fill({ vendor: '' }));

  const handleUnitCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setUnitCount(count);
    setUnits(Array(count).fill({ vendor: '' }));
  };

  const handleVendorChange = (index, vendor) => {
    const updated = [...units];
    updated[index].vendor = vendor;
    setUnits(updated);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow space-y-8">
      <div>
        <label className="block text-lg font-semibold mb-1">
          How many radio units on site?
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
          value={unitCount}
          onChange={handleUnitCountChange}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      {units.map((unit, index) => (
        <div key={index} className="border-t pt-4 space-y-4">
          <h2 className="text-xl font-bold">  Radio Unit #{index + 1}</h2>

          {/* Operator */}
          <div>
            <label className="block font-medium">If shared site, radio unit belongs to which operator?</label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              {operators.map((op, i) => (
                <option key={i}>{op}</option>
              ))}
            </select>
          </div>

          {/* Base Height */}
          <div>
            <label className="block font-medium">Radio unit base height from tower base level (m)</label>
            <input type="number" className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          {/* Tower Leg */}
          <div>
            <label className="block font-medium">Radio unit located at tower leg</label>
            <div className="flex gap-4 mt-1">
              {['A', 'B', 'C', 'D'].map((leg) => (
                <label key={leg} className="flex items-center gap-2">
                  <input type="radio" name={`towerLeg-${index}`} value={leg} />
                  {leg}
                </label>
              ))}
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block font-medium">Radio unit vendor</label>
            <div className="flex flex-wrap gap-4 mt-1">
              {['Nokia', 'Huawei', 'Ericsson', 'ZTE', 'Other'].map((vendor) => (
                <label key={vendor} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`vendor-${index}`}
                    value={vendor}
                    onChange={() => handleVendorChange(index, vendor)}
                    checked={units[index].vendor === vendor}
                  />
                  {vendor}
                </label>
              ))}
            </div>
          </div>

          {/* Nokia specific */}
          {units[index].vendor === 'Nokia' && (
            <>
              <div>
                <label className="block font-medium">If Nokia, what is the radio unit model?</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  {nokiaModels.map((model, i) => (
                    <option key={i}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium">If Nokia, how many ports?</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  {[2, 4, 6, 8, 9].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium">If Nokia, radio unit port connectivity details</label>
                <table className="w-full border border-gray-300 text-sm text-left">
                  <thead>
                    <tr>
                      {Array.from({ length: 9 }, (_, i) => (
                        <th key={i} className="border px-2 py-1">Port {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }, (_, row) => (
                      <tr key={row}>
                        {Array.from({ length: 9 }, (_, col) => (
                          <td key={col} className="border p-1">
                            <input className="w-full p-1 border border-gray-200 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Other Vendor */}
          {units[index].vendor === 'Other' && (
            <>
              <div>
                <label className="block font-medium">Other vendor model</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
              </div>

              {['length', 'width', 'depth'].map((dim) => (
                <div key={dim}>
                  <label className="block font-medium">Radio unit {dim} (cm)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-md p-2" />
                </div>
              ))}
            </>
          )}

          {/* Side arm */}
          <div>
            <label className="block font-medium">Radio unit side arm (cm)</label>
            <div className="flex flex-col gap-2 mt-1">
              {sideArms.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="radio" name={`sideArm-${index}`} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* More inputs */}
          {[
            'side arm length',
            'side arm diameter',
            'side arm offset from tower leg',
            'Length of the DC power cable from the radio unit to the DC CB/fuse location (m)',
            'Cross section of DC power cable from the radio unit to the DC CB/fuse (mm2)',
            'Length of fiber cable from the radio unit to the base band (m)',
            'Feeder length, if exist (m)',
            'Length of earth cable connected to the earth bus bar (m)',
          ].map((label, i) => (
            <div key={i}>
              <label className="block font-medium">{label}</label>
              <input type="number" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          ))}

          {/* DC source */}
          <div>
            <label className="block font-medium">Radio unit DC power coming from</label>
            <div className="flex flex-col gap-2 mt-1">
              {dcSources.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="radio" name={`dcSource-${index}`} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Jumper length */}
          <div>
            <label className="block font-medium">Length of jumper between the antenna & radio unit (m)</label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Feeder type */}
          <div>
            <label className="block font-medium">Feeder type, if exist</label>
            <div className="flex flex-wrap gap-4 mt-1">
              {feederTypes.map((ft, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="radio" name={`feederType-${index}`} />
                  {ft}
                </label>
              ))}
            </div>
          </div>

          {/* Included in upgrade plan */}
          <div>
            <label className="block font-medium">Included in swap/upgrade plan?</label>
            <div className="flex gap-4 mt-1">
              {['Yes', 'No'].map((v) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="radio" name={`includedUpgrade-${index}`} value={v} />
                  {v}
                </label>
              ))}
            
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4 text-right">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Submit Radio Units
        </button>
      </div>
    </div>
    
  );
};

export default RadioUnitsForm;
