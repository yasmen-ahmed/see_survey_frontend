import React, { useState } from 'react';

const initialRadioForm = {
  sector: '',
  antennaConnection: '',
  technologies: [],
  model: '',
  location: '',
  feederLength: '',
  towerLegSection: '',
  angularDimensions: '',
  tubularSection: '',
  sideArmOption: '',
  sideArmLength: '',
  sideArmCrossSection: '',
  sideArmOffset: '',
  dcPowerSource: '',
  dcCableLength: '',
  fiberLength: '',
  jumperLength: '',
  earthBusExists: '',
  earthCableLength: '',
};

const NewRadioUnitsForm = () => {
  const [radioForms, setRadioForms] = useState(Array(3).fill().map(() => ({ ...initialRadioForm })));

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    setRadioForms(prev => {
      const updated = [...prev];
      if (type === 'checkbox') {
        const techs = new Set(updated[index].technologies);
        checked ? techs.add(value) : techs.delete(value);
        updated[index].technologies = Array.from(techs);
      } else {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Radio Unit Form Data:', radioForms);
    // Logic to save/send data
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-indigo-700">3. New Radio Units</h2>

      {radioForms.map((form, index) => (
        <div key={index} className="border border-gray-300 p-6 rounded-xl shadow-md space-y-6 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">3.{index + 1}. New Radio Unit #{index + 1}</h3>

          <label className="block font-semibold">
            New radio unit sector:
            <select name="sector" value={form.sector} onChange={(e) => handleChange(index, e)} className="block mt-1 w-full">
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <div className="block font-semibold">
            Connected to new or existing antenna?
            <div className="mt-1 space-y-1">
              {['New', 'Existing'].map(opt => (
                <label key={opt} className="block">
                  <input
                    type="radio"
                    name="antennaConnection"
                    value={opt}
                    checked={form.antennaConnection === opt}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="block font-semibold">
            Connected antenna technology:
            <div className="mt-1 space-y-1">
              {['2G', '3G', '4G', '5G'].map(tech => (
                <label key={tech} className="inline-block mr-4">
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
            New radio unit model:
            <select name="model" value={form.model} onChange={(e) => handleChange(index, e)} className="block mt-1 w-full">
              <option value="">Select model</option>
              {/* Replace with actual Nokia models */}
              <option value="Model A">Model A</option>
              <option value="Model B">Model B</option>
              <option value="Model C">Model C</option>
            </select>
          </label>

          <div className="block font-semibold">
            New radio unit will be located at:
            <div className="mt-1 space-y-1">
              {['Tower leg A', 'Tower leg B', 'Tower leg C', 'Tower leg D', 'On the ground'].map(loc => (
                <label key={loc} className="block">
                  <input
                    type="radio"
                    name="location"
                    value={loc}
                    checked={form.location === loc}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>

          {form.location === 'On the ground' && (
            <label className="block font-semibold">
              If on the ground, what is the feeder length until the antenna? (meter):
              <input
                type="number"
                name="feederLength"
                value={form.feederLength}
                onChange={(e) => handleChange(index, e)}
                className="block mt-1 w-full"
              />
            </label>
          )}

          {form.location.startsWith('Tower leg') && (
            <>
              <div className="block font-semibold">
                If tower leg, what is the tower leg section?
                <div className="mt-1 space-y-1">
                  {['Angular', 'Tubular'].map(sec => (
                    <label key={sec} className="block">
                      <input
                        type="radio"
                        name="towerLegSection"
                        value={sec}
                        checked={form.towerLegSection === sec}
                        onChange={(e) => handleChange(index, e)}
                        className="mr-2"
                      />
                      {sec}
                    </label>
                  ))}
                </div>
              </div>

              {form.towerLegSection === 'Angular' && (
                <label className="block font-semibold">
                  Angular dimensions (L1 x L2 in mm):
                  <input
                    type="text"
                    name="angularDimensions"
                    value={form.angularDimensions}
                    onChange={(e) => handleChange(index, e)}
                    className="block mt-1 w-full"
                    placeholder="e.g., 100 x 100"
                  />
                </label>
              )}

              {form.towerLegSection === 'Tubular' && (
                <label className="block font-semibold">
                  Tubular cross section (mm):
                  <input
                    type="number"
                    name="tubularSection"
                    value={form.tubularSection}
                    onChange={(e) => handleChange(index, e)}
                    className="block mt-1 w-full"
                  />
                </label>
              )}
            </>
          )}

          <label className="block font-semibold">
            New radio unit side arm:
            <select name="sideArmOption" value={form.sideArmOption} onChange={(e) => handleChange(index, e)} className="block mt-1 w-full">
              <option value="">Select</option>
              <option value="empty">Use existing empty side arm</option>
              <option value="antenna">Use existing antenna side arm</option>
              <option value="new">New side arm need to be supplied</option>
            </select>
          </label>

          {form.sideArmOption && (
            <>
              <label className="block font-semibold">
                Side arm length (meter):
                <input
                  type="number"
                  name="sideArmLength"
                  value={form.sideArmLength}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 w-full"
                />
              </label>

              <label className="block font-semibold">
                Side arm cross section (mm):
                <input
                  type="number"
                  name="sideArmCrossSection"
                  value={form.sideArmCrossSection}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 w-full"
                />
              </label>

              <label className="block font-semibold">
                Side arm offset from tower leg profile (cm):
                <input
                  type="number"
                  name="sideArmOffset"
                  value={form.sideArmOffset}
                  onChange={(e) => handleChange(index, e)}
                  className="block mt-1 w-full"
                />
              </label>
            </>
          )}

          <div className="block font-semibold">
            DC power source:
            <div className="mt-1 space-y-1">
              {['Direct from rectifier distribution', 'New FPFH', 'Existing FPFH', 'Existing DC PDU (not FPFH)'].map(src => (
                <label key={src} className="block">
                  <input
                    type="radio"
                    name="dcPowerSource"
                    value={src}
                    checked={form.dcPowerSource === src}
                    onChange={(e) => handleChange(index, e)}
                    className="mr-2"
                  />
                  {src}
                </label>
              ))}
            </div>
          </div>

          <label className="block font-semibold">
            Length of DC power cable (meter):
            <input
              type="number"
              name="dcCableLength"
              value={form.dcCableLength}
              onChange={(e) => handleChange(index, e)}
              className="block mt-1 w-full"
            />
          </label>

          <label className="block font-semibold">
            Length of fiber cable to base band (meter):
            <input
              type="number"
              name="fiberLength"
              value={form.fiberLength}
              onChange={(e) => handleChange(index, e)}
              className="block mt-1 w-full"
            />
          </label>

          <label className="block font-semibold">
            Length of jumper to antenna (meter):
            <input
              type="number"
              name="jumperLength"
              value={form.jumperLength}
              onChange={(e) => handleChange(index, e)}
              className="block mt-1 w-full"
            />
          </label>

          <div className="block font-semibold">
            Earth bus bar exists within 10m & has free holes?
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
              Length of earth cable (meter):
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
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Submit Radio Unit Info
        </button>
      </div>
    </form>
  );
};

export default NewRadioUnitsForm;
