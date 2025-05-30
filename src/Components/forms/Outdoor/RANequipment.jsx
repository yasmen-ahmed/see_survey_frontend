import React, { useState } from 'react';

const RANBaseBandForm = () => {
  const [formData, setFormData] = useState({
    ranBaseBandLocation: '',
    ranBaseBandVendor: '',
    ranBaseBandType: [],
    newBaseBandInstallLocation: [],
    transmissionCableLength: ''
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-blue-700 mb-4'>RAN Base Band Information</h2>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing RAN base band located in?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.ranBaseBandLocation}
          onChange={(e) => handleChange('ranBaseBandLocation', e.target.value)}
        >
          <option value=''>Select Location</option>
          <option value='Existing cabinet #1'>Existing cabinet #1</option>
          <option value='Existing cabinet #n'>Existing cabinet #n</option>
          <option value='Other'>Other</option>
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing RAN base band vendor</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.ranBaseBandVendor}
          onChange={(e) => handleChange('ranBaseBandVendor', e.target.value)}
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
        <label className='block font-semibold mb-2'>Existing RAN base band type/model</label>
        <div className='space-y-2'>
          {['Nokia Air Scale', 'Nokia Felix', 'Other'].map((type) => (
            <div key={type}>
              <input
                type='checkbox'
                value={type}
                checked={formData.ranBaseBandType.includes(type)}
                onChange={(e) => handleCheckboxChange('ranBaseBandType', e.target.value)}
              />
              <span className='ml-2'>{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Where new Nokia base band can be installed? Choose all applicable</label>
        <div className='space-y-2'>
          {[
            'Existing cabinet #1',
            'Existing cabinet #n',
            'New Nokia cabinet',
            'Other',
          ].map((location) => (
            <div key={location}>
              <input
                type='checkbox'
                value={location}
                checked={formData.newBaseBandInstallLocation.includes(location)}
                onChange={(e) => handleCheckboxChange('newBaseBandInstallLocation', e.target.value)}
              />
              <span className='ml-2'>{location}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Length of Transmission cable (Optical / Electrical) from new Nokia base band to MW IDU/ODF (meter)</label>
        <input
          type='number'
          className='border p-2 rounded w-full'
          value={formData.transmissionCableLength}
          onChange={(e) => handleChange('transmissionCableLength', e.target.value)}
          placeholder='000'
        />
      </div>

      <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
        Submit
      </button>
    </form>
  );
};

export default RANBaseBandForm;

