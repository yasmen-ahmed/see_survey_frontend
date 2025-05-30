import React, { useState } from 'react';

const TransmissionInformationForm = () => {
  const [formData, setFormData] = useState({
    transmissionType: '',
    transmissionBaseBandLocation: '',
    transmissionVendor: '',
    odfLocation: '',
    cableLength: '',
    odfCableType: '',
    freePorts: '',
    mwLinks: ''
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-blue-700 mb-4'>Transmission Information</h2>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Type of transmission</label>
        <div className='space-x-4'>
          {['Fiber', 'MW'].map((type) => (
            <label key={type} className='inline-flex items-center'>
              <input
                type='radio'
                name='transmissionType'
                value={type}
                checked={formData.transmissionType === type}
                onChange={(e) => handleChange('transmissionType', e.target.value)}
              />
              <span className='ml-2'>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing Transmission base band located in?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.transmissionBaseBandLocation}
          onChange={(e) => handleChange('transmissionBaseBandLocation', e.target.value)}
        >
          <option value=''>Select Location</option>
          <option value='Existing cabinet #1'>Existing cabinet #1</option>
          <option value='Existing cabinet #n'>Existing cabinet #n</option>
          <option value='Other'>Other</option>
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Existing Transmission equipment vendor</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.transmissionVendor}
          onChange={(e) => handleChange('transmissionVendor', e.target.value)}
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
        <label className='block font-semibold mb-2'>Existing ODF located in?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.odfLocation}
          onChange={(e) => handleChange('odfLocation', e.target.value)}
        >
          <option value=''>Select Location</option>
          <option value='Existing cabinet #1'>Existing cabinet #1</option>
          <option value='Existing cabinet #n'>Existing cabinet #n</option>
          <option value='Other'>Other</option>
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>Cable length from ODF to Baseband (cm)</label>
        <input
          type='number'
          className='border p-2 rounded w-full'
          value={formData.cableLength}
          onChange={(e) => handleChange('cableLength', e.target.value)}
          placeholder='000'
        />
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>ODF fiber cable type</label>
        <div className='space-x-4'>
          {['LC', 'SC', 'FC'].map((type) => (
            <label key={type} className='inline-flex items-center'>
              <input
                type='radio'
                name='odfCableType'
                value={type}
                checked={formData.odfCableType === type}
                onChange={(e) => handleChange('odfCableType', e.target.value)}
              />
              <span className='ml-2'>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>How many free ports on ODF?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.freePorts}
          onChange={(e) => handleChange('freePorts', e.target.value)}
        >
          {[...Array(15)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>How many MW link exist on site?</label>
        <select
          className='border p-2 rounded w-full'
          value={formData.mwLinks}
          onChange={(e) => handleChange('mwLinks', e.target.value)}
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

export default TransmissionInformationForm;
