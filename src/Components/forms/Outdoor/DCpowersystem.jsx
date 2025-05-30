import React, { useState } from 'react';

const DCPowerInformationForm = () => {
  const [formData, setFormData] = useState({
    rectifierLocation: '',
    rectifierVendor: '',
    rectifierModel: '',
    rectifierModules: '',
    moduleCapacity: '',
    totalCapacity: '',
    freeSlots: '',
    batteryLocation: '',
    batteryVendor: '',
    batteryType: '',
    batteryStrings: '',
    batteryCapacity: '',
    batteryFreeSlots: '',
    batteryInstallation: []
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value) => {
    setFormData((prev) => {
      const updatedList = prev.batteryInstallation.includes(value)
        ? prev.batteryInstallation.filter((item) => item !== value)
        : [...prev.batteryInstallation, value];
      return { ...prev, batteryInstallation: updatedList };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-blue-700 mb-4'>DC Power Information</h2>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing DC rectifiers are located in?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.rectifierLocation}
          onChange={(e) => handleChange('rectifierLocation', e.target.value)}
        >
          <option value=''>Select Location</option>
          <option value='Existing cabinet #1'>Existing cabinet #1</option>
          <option value='Existing cabinet #n'>Existing cabinet #n</option>
          <option value='Other'>Other</option>
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing DC rectifiers vendor</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.rectifierVendor}
          onChange={(e) => handleChange('rectifierVendor', e.target.value)}
        >
          <option value=''>Select Vendor</option>
          <option value='Nokia'>Nokia</option>
          <option value='Ericson'>Ericson</option>
          <option value='Huawei'>Huawei</option>
          <option value='ZTE'>ZTE</option>
          <option value='Other'>Other</option>
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing DC rectifiers model</label>
        <input
          type='text'
          className='border p-2 rounded w-full'
          value={formData.rectifierModel}
          onChange={(e) => handleChange('rectifierModel', e.target.value)}
          placeholder='Model'
        />
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>How many existing DC rectifier modules?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.rectifierModules}
          onChange={(e) => handleChange('rectifierModules', e.target.value)}
        >
          {[...Array(20)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
        Submit
      </button>
    </form>
  );
};

export default DCPowerInformationForm;
