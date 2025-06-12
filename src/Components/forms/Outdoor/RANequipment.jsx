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
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
 

      <div className='mb-4'>
        <label className='block font-semibold '>Existing RAN base band located in?</label>
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
        <hr className='my-5'/>
      </div>
     

      <div className=''>
        <label className='block font-semibold '>Existing RAN base band vendor</label>
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
        <hr className='my-5'/>
      </div>

      <div className=''>
        <label className='block font-semibold '>Existing RAN base band type/model</label>
        <div className=' grid grid-cols-3'>
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
        <hr className='my-5'/>
      </div>

      <div className=''>
        <label className='block font-semibold '>Where new Nokia base band can be installed? Choose all applicable</label>
        <div className='grid grid-cols-5'>
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
        <hr className='my-5'/>
      </div>

      <div className=''>
        <label className='block font-semibold '>Length of Transmission cable (Optical / Electrical) from new Nokia base band to MW IDU/ODF (meter)</label>
        <input
          type='number'
          className='border p-2 rounded w-full'
          value={formData.transmissionCableLength}
          onChange={(e) => handleChange('transmissionCableLength', e.target.value)}
          placeholder='000'
        />
          <hr className='my-5'/>
      </div>

 

    

      <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save and Continue
            </button>
          </div>
    </form>
    </div>
     </div>
  );
};

export default RANBaseBandForm;

