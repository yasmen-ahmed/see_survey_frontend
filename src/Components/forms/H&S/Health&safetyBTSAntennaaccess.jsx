import React from 'react';

const questions = [
  'Safety climbing system correctly installed (fixing elements, connection screws, fall arrestors) according to safety specifications',
  'Walking path situated according to safety specifications',
  'Where people can walk in front of MW antennas, antennas height from walkway: exclusion zone should be clearly identified',
  'Non-authorized access to the front of antennas and dishes adequately prevented',
  'BTS/Pole access lighting working and sufficient',
  'Safe access to BTS and poles granted',
  'Pathway blocks/walking grids correctly installed'
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

const HealthAndSafetyTab2 = () => {
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
          Save and Submit
        </button>
      </div>
    </div>
  );
};

export default HealthAndSafetyTab2;

