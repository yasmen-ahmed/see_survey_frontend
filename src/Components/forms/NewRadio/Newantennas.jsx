import React, { useState } from 'react';

const initialAntennaForm = {
  sectorNumber: '',
  newOrSwap: '',
  technologies: [],
  azimuth: '',
  baseHeight: '',
  towerLeg: '',
  towerSection: '',
  angularDimensions: '',
  tubularCrossSection: '',
  sideArmOption: '',
  sideArmLength: '',
  sideArmCross: '',
  sideArmOffset: '',
  earthBusExists: '',
  earthCableLength: '',
};

const NewAntennaForm = () => {
  const [antennaForms, setAntennaForms] = useState(Array(6).fill().map(() => ({ ...initialAntennaForm })));

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    setAntennaForms(prev => {
      const updated = [...prev];
      if (type === 'checkbox' && name === 'technologies') {
        const techs = updated[index].technologies;
        updated[index].technologies = checked
          ? [...techs, value]
          : techs.filter(t => t !== value);
      } else {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-blue-700">New Antennas</h2>

      {antennaForms.map((form, index) => (
        <div key={index} className="border border-gray-300 p-6 rounded-xl shadow-md space-y-6 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">New Antenna #{index + 1}</h3>

          <div className="space-y-4">
            <label className="block font-semibold">
              <span className="font-bold">Sector Number:</span>
              <select
                name="sectorNumber"
                onChange={(e) => handleChange(index, e)}
                value={form.sectorNumber}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              >
                <option value="">Select Sector</option>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </label>

            <div>
              <span className="font-bold">New or swap?</span>
              <div className="flex gap-4 mt-2">
                {['New', 'Swap'].map(opt => (
                  <label key={opt} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="newOrSwap"
                      value={opt}
                      checked={form.newOrSwap === opt}
                      onChange={(e) => handleChange(index, e)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold">New antenna technology:</span>
              <div className="flex flex-wrap gap-4 mt-2">
                {['2G', '3G', '4G', '5G'].map(tech => (
                  <label key={tech} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="technologies"
                      value={tech}
                      checked={form.technologies.includes(tech)}
                      onChange={(e) => handleChange(index, e)}
                      className="mr-2"
                    />
                    {tech}
                  </label>
                ))}
              </div>
            </div>

            <label className="block font-semibold">
              <span className="font-bold">Azimuth (° from north):</span>
              <input
                type="number"
                name="azimuth"
                value={form.azimuth}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </label>

            <label className="block font-semibold">
              <span className="font-bold">Base height from tower base (m):</span>
              <input
                type="number"
                name="baseHeight"
                value={form.baseHeight}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </label>

            <div>
              <span className="font-bold">Tower leg:</span>
              <div className="flex gap-4 mt-2">
                {['A', 'B', 'C', 'D'].map(leg => (
                  <label key={leg} className="inline-flex items-center">
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

            <div>
              <span className="font-bold">Tower leg section:</span>
              <div className="flex gap-4 mt-2">
                {['Angular', 'Tubular'].map(type => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="towerSection"
                      value={type}
                      checked={form.towerSection === type}
                      onChange={(e) => handleChange(index, e)}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {form.towerSection === 'Angular' && (
              <label className="block font-semibold">
                <span className="font-bold">Dimensions (L1 x L2 in mm):</span>
                <input
                  type="text"
                  name="angularDimensions"
                  value={form.angularDimensions}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </label>
            )}

            {form.towerSection === 'Tubular' && (
              <label className="block font-semibold">
                <span className="font-bold">Cross section (mm):</span>
                <input
                  type="number"
                  name="tubularCrossSection"
                  value={form.tubularCrossSection}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </label>
            )}

            <label className="block font-semibold">
              <span className="font-bold">New antenna side arm:</span>
              <select
                name="sideArmOption"
                value={form.sideArmOption}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              >
                <option value="">Select</option>
                <option value="existing">Use existing empty side arm</option>
                <option value="swapped">Use swapped antenna side arm</option>
                <option value="new">New side arm need to be supplied</option>
              </select>
            </label>

            <label className="block font-semibold">
              <span className="font-bold">Side arm length (m):</span>
              <input
                type="number"
                name="sideArmLength"
                value={form.sideArmLength}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </label>

            <label className="block font-semibold">
              <span className="font-bold">Side arm cross section (mm):</span>
              <input
                type="number"
                name="sideArmCross"
                value={form.sideArmCross}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </label>

            <label className="block font-semibold">
              <span className="font-bold">Side arm offset from tower leg (cm):</span>
              <input
                type="number"
                name="sideArmOffset"
                value={form.sideArmOffset}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </label>

            <div>
              <span className="font-bold">Earth bus bar exists within 10m?</span>
              <div className="flex gap-4 mt-2">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="earthBusExists"
                      value={opt}
                      checked={form.earthBusExists === opt}
                      onChange={(e) => handleChange(index, e)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {form.earthBusExists === 'Yes' && (
              <label className="block font-semibold">
                <span className="font-bold">Earth cable length to bus bar (m):</span>
                <input
                  type="number"
                  name="earthCableLength"
                  value={form.earthCableLength}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </label>
            )}
          </div>
        </div>
      ))}
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save and continue
        </button>
      </div>
    
    </div>
  );
};

export default NewAntennaForm;
