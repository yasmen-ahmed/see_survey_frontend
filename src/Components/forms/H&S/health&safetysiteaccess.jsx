import React from 'react';

const questions = [
  'Access road in safe condition for all seasons',
  'Site access safe & secure from unauthorized person',
  'Safe usage of access (ascent, elevator, stairs, ladder) ensured',
  'Site safe from damages by environmental influence',
  'Permanent fence correctly installed around the site',
  'Access and egress to and from the site equipment (tower, shelter etc) are safe and free from hazards',
  'Designated walkway routes free of tripping and slipping hazards',
  'Designated walkway routes protected from radiation hazards (antenna, microwave)',
  'Emergency exists are clearly visible and free of obstacles',
  'Vehicles used to access the site in good condition and can follow the NSN safe driving rules',
  'All rubbish and unused material has been removed/Site clean',
  'Are safe manual handling practices in place',
  "All ladder length long enough above exit place or other support aid's existing",
  'Special permits (road blocking permits, crane placement permit etc.)',
  'Are all ladders used for access in a good condition and free from obvious damage or defects'
];

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

const HealthAndSafetyTab1 = () => {
  const handleSaveAndContinue = () => {
    alert('Data Saved! Moving to the next section...');
  };

  return (
    <div className='grid gap-4 p-4'>
      {questions.map((question, index) => (
        <Card key={index} className='p-4'>
          <CardContent>
            <div className='mb-2 font-semibold'>{question}</div>
            <RadioGroup name={`radio-group-${index}`} defaultValue='not_applicable'>
              <RadioGroupItem value='yes' label='Yes' />
              <RadioGroupItem value='no' label='No' />
              <RadioGroupItem value='not_applicable' label='Not applicable' />
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
<div>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Save and Continue
        </button>
      </div>
          </div>
    
  );
};

export default HealthAndSafetyTab1;
