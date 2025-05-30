import React, { useState } from 'react';

const OutdoorCabinetsForm = () => {
  const [formData, setFormData] = useState({
    numberOfCabinets: '',
    cabinets: Array(10).fill({
      type: [],
      vendor: '',
      model: '',
      antiTheft: '',
      coolingType: '',
      coolingCapacity: '',
      compartments: '',
      hardware: [],
      acPowerFeed: '',
      cbNumber: '',
      powerCableLength: '',
      powerCableCrossSection: '',
      blvd: '',
      blvdFreeCBs: '',
      llvd: '',
      llvdFreeCBs: '',
      pdu: '',
      pduFreeCBs: '',
      internalLayout: '',
      freeU: '',
    }),
  });

  const handleChange = (index, name, value) => {
    const updatedCabinets = [...formData.cabinets];
    updatedCabinets[index] = { ...updatedCabinets[index], [name]: value };
    setFormData((prev) => ({ ...prev, cabinets: updatedCabinets }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-blue-700 mb-4'>Outdoor Cabinets Form</h2>

      <div className='mb-4'>
        <label className='block font-semibold mb-2'>How many cabinets existing on site?</label>
        <select
          name='numberOfCabinets'
          value={formData.numberOfCabinets}
          onChange={(e) => setFormData({ ...formData, numberOfCabinets: e.target.value })}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {Array.from({ length: parseInt(formData.numberOfCabinets || 0) }).map((_, index) => (
        <div key={index} className='p-4 border rounded-lg mb-4'>
          <h3 className='text-lg font-semibold mb-2'>Cabinet #{index + 1}</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block font-semibold mb-2'>Cabinet Type</label>
              <div className='space-y-2'>
                {['RAN', 'MW', 'Power', 'All in one', 'Other'].map((type) => (
                  <label key={type} className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={formData.cabinets[index].type.includes(type)}
                      onChange={(e) =>
                        handleChange(
                          index,
                          'type',
                          e.target.checked
                            ? [...formData.cabinets[index].type, type]
                            : formData.cabinets[index].type.filter((t) => t !== type)
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className='block font-semibold mb-2'>Cabinet Vendor</label>
              <div className='space-y-2'>
                {['Nokia', 'Ericson', 'Huawei', 'ZTE', 'Eltek', 'Vertiv'].map((vendor) => (
                  <label key={vendor} className='flex items-center gap-2'>
                    <input
                      type='radio'
                      name={`vendor-${index}`}
                      value={vendor}
                      checked={formData.cabinets[index].vendor === vendor}
                      onChange={(e) => handleChange(index, 'vendor', e.target.value)}
                    />
                    {vendor}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
        Submit
      </button>
    </form>
  );
};

export default OutdoorCabinetsForm;

