import React, { useState } from 'react';

const OutdoorForm = () => {
  const [formData, setFormData] = useState({
    sunshade: '',
    freePositions: '',
    cableTrayHeight: '',
    cableTrayWidth: '',
    cableTrayDepth: '',
    spaceForNewCables: '',
    earthBusBars: '',
    freeHolesInBusBars: '',
    hasSketch: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 space-y-6 bg-white rounded-xl shadow-md'>
      <h2 className='text-2xl font-bold text-blue-700 mb-4'>Outdoor Form</h2>

      {/* Sunshade Field */}
      <div>
        <label className='block font-semibold mb-2'>Equipment area covered with sunshade?</label>
        <div className='flex gap-4'>
          {['Yes', 'No', 'Partially'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='sunshade'
                value={option}
                checked={formData.sunshade === option}
                onChange={handleChange}
                className='mr-2'
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Free Positions Field */}
      <div>
        <label className='block font-semibold mb-2'>How many free positions available for new cabinets installation?</label>
        <select
          name='freePositions'
          value={formData.freePositions}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Cable Tray Fields */}
      {['Height of existing cable tray from site floor level (cm)', 'Width of existing cable tray (cm)', 'Depth of existing cable tray (cm)'].map((label, index) => (
        <div key={index}>
          <label className='block font-semibold mb-2'>{label}</label>
          <input
            type='number'
            name={['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]}
            value={formData[['cableTrayHeight', 'cableTrayWidth', 'cableTrayDepth'][index]]}
            onChange={handleChange}
            className='border p-2 rounded w-full'
          />
        </div>
      ))}

      {/* Space for New Cables */}
      <div>
        <label className='block font-semibold mb-2'>Is there available space on existing cable tray for new cables?</label>
        <div className='flex gap-4'>
          {['Yes', 'No'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='spaceForNewCables'
                value={option}
                checked={formData.spaceForNewCables === option}
                onChange={handleChange}
                className='mr-2'
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Earth Bus Bars Field */}
      <div>
        <label className='block font-semibold mb-2'>How many Earth bus bar available in cabinets location?</label>
        <select
          name='earthBusBars'
          value={formData.earthBusBars}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[1, 2, 3].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Free Holes in Existing Bus Bars */}
      <div>
        <label className='block font-semibold mb-2'>How many free holes in existing bus bars?</label>
        <select
          name='freeHolesInBusBars'
          value={formData.freeHolesInBusBars}
          onChange={handleChange}
          className='border p-2 rounded w-full'
        >
          <option value=''>Select</option>
          {[1, 2, 3].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Sketch with Measurements */}
      <div>
        <label className='block font-semibold mb-2'>Do you have a sketch with measurements for the site including cabinets?</label>
        <div className='flex gap-4'>
          {['Yes', 'No'].map((option) => (
            <label key={option} className='flex items-center'>
              <input
                type='radio'
                name='hasSketch'
                value={option}
                checked={formData.hasSketch === option}
                onChange={handleChange}
                className='mr-2'
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
        Submit
      </button>
    </form>
  );
};

export default OutdoorForm;

