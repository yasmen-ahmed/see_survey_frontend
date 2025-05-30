import React from 'react';

const Card = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div className='p-2'>
    {children}
  </div>
);

const RadioGroup = ({ name, defaultValue, children, className }) => (
  <div className={`flex gap-4 ${className}`}>
    {React.Children.map(children, child => React.cloneElement(child, { name }))}
  </div>
);

const RadioGroupItem = ({ value, label, name }) => (
  <label className='flex items-center gap-2'>
    <input type='radio' name={name} value={value} />
    {label}
  </label>
);

const GPSAntennaTab = () => {
  const handleSaveAndContinue = () => {
    alert('Data Saved! Moving to the next section...');
  };

  return (
    <div className='grid gap-4 p-4'>
      <Card className='p-4'>
        <CardContent>
          <div className='mb-2 font-semibold'>New GPS antenna proposed location</div>
          <RadioGroup name='gps-location' defaultValue='on_tower'>
            <RadioGroupItem value='on_tower' label='On tower' />
            <RadioGroupItem value='on_building' label='On building' />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className='p-4'>
        <CardContent>
          <div className='mb-2 font-semibold'>New GPS antenna height from tower base level (meter)</div>
          <input type='number' className='border rounded-md p-2 w-full' placeholder='00' />
        </CardContent>
      </Card>

      <Card className='p-4'>
        <CardContent>
          <div className='mb-2 font-semibold'>Cable length from the new GPS antenna location to the base band (meter)</div>
          <input type='number' className='border rounded-md p-2 w-full' placeholder='00' />
        </CardContent>
      </Card>

      <div className='flex justify-start'>
        <button
          onClick={handleSaveAndContinue}
          className='mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md shadow-sm text-sm'
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default GPSAntennaTab;

