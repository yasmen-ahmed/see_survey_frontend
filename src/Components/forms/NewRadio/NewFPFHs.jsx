import React, { useState } from 'react';

const initialFPFHForm = {
  installationType: '',
  proposedLocation: '',
  baseHeight: '',
  towerLeg: '',
  dcPowerSource: '',
  dcDistribution: '',
  ethernetLength: '',
  dcCableLength: '',
  earthBusExists: '',
  earthCableLength: '',
};

const NewFPFHForm = () => {
  const [fpfhForms, setFPFHForms] = useState(Array(3).fill().map(() => ({ ...initialFPFHForm })));

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setFPFHForms(prev => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('FPFH Form Data:', fpfhForms);
    // Add API logic or save logic here
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-blue-700">4. New FPFHs</h2>

      {fpfhForms.map((form, index) => (
        <div key={index} className="border border-gray-300 p-6 rounded-xl shadow-md space-y-6 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">4.{index + 1}. New FPFH #{index + 1}</h3>

          <label className="block font-semibold">
            New FPFH installation type:
            <select name="installationType" value={form.installationType} onChange={(e) => handleChange(index, e)} className="block mt-1 w-full">
              <option value="">Select</option>
              <option value="stacked">Stacked with other Nokia modules</option>
              <option value="standalone">Standalone</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="block font-semibold">
            Proposed location of the new FPFH:
            <div className="mt-1 space-y-1">
              {['On ground', 'On tower'].map(loc => (
                <label key={loc} className="block">
                  <input
                    type="radio"
                    name="proposedLocation"
                    value={loc}
                    checked={form.proposedLocation === loc}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>

          {form.proposedLocation === 'On tower' && (
            <>
              <label className="block font-semibold">
                If on tower, new FPFH base height from tower base level (meter):
                <input
                  type="number"
                  name="baseHeight"
                  value={form.baseHeight}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 w-full"
                />
              </label>

              <div className="block font-semibold">
                If on tower, new FPFH will be located at tower leg:
                <div className="mt-1 space-y-1">
                  {['A', 'B', 'C', 'D'].map(leg => (
                    <label key={leg} className="block">
                      <input
                        type="radio"
                        name="towerLeg"
                        value={leg}
                        checked={form.towerLeg === leg}
                        onChange={(e) => handleChange(index, e)}
                        className="mr-2"
                      />
                      {leg}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="block font-semibold">
            FPFH DC power coming from:
            <div className="mt-1 space-y-1">
              {[
                'from new DC rectifier cabinet',
                'from the existing rectifier cabinet',
                'Existing external DC PDU #1',
                'Existing external DC PDU #2',
                'Existing external DC PDU #n'
              ].map(source => (
                <label key={source} className="block">
                  <input
                    type="radio"
                    name="dcPowerSource"
                    value={source}
                    checked={form.dcPowerSource === source}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {source}
                </label>
              ))}
            </div>
          </div>

          {form.dcPowerSource === 'from the existing rectifier cabinet' && (
            <div className="block font-semibold">
              If directly from the existing rectifier cabinet, from which DC distribution inside the rectifier cabinet?
              <div className="mt-1 space-y-1">
                {['BLVD', 'LLVD', 'PDU'].map(dist => (
                  <label key={dist} className="block">
                    <input
                      type="radio"
                      name="dcDistribution"
                      value={dist}
                      checked={form.dcDistribution === dist}
                      onChange={(e) => handleChange(index, e)}
                      className="mr-2"
                    />
                    {dist}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="block font-semibold">
            Length of Ethernet cable between the new FPFH & base band (meter):
            <input
              type="number"
              name="ethernetLength"
              value={form.ethernetLength}
              onChange={(e) => handleChange(index, e)}
              className="block mt-1 w-full"
            />
          </label>

          <label className="block font-semibold">
            Length of DC power cable from the rectifier to the new FPFH (meter):
            <input
              type="number"
              name="dcCableLength"
              value={form.dcCableLength}
              onChange={(e) => handleChange(index, e)}
              className="block mt-1 w-full"
            />
          </label>

          <div className="block font-semibold">
            Earth bus bar exists within max 10m below the antenna & has free holes?
            <div className="mt-1 space-y-1">
              {['Yes', 'No'].map(val => (
                <label key={val} className="block">
                  <input
                    type="radio"
                    name="earthBusExists"
                    value={val}
                    checked={form.earthBusExists === val}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>

          {form.earthBusExists === 'Yes' && (
            <label className="block font-semibold">
              Length of earth cable from proposed FPFH location to earth bus bar (meter):
              <input
                type="number"
                name="earthCableLength"
                value={form.earthCableLength}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 w-full"
              />
            </label>
          )}
        </div>
      ))}

      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit FPFH Info
        </button>
      </div>
    </form>
  );
};

export default NewFPFHForm;
