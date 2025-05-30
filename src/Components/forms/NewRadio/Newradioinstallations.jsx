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

const dropdownOptions = ['1', '2', '3', '4', '5', 'Not applicable'];

const questions = [
  'How many new sectors planned?',
  'How many new antenna planned?',
  'How many new radio unit planned?',
  'How many existing antenna will be swapped?',
  'How many existing radio unit will be swapped?',
  'How many new FPFH will be installed?'
];

const NewSectorPlanningTab = () => {
  const handleSaveAndContinue = () => {
    alert('Data Saved! Moving to the next section...');
  };

  return (
    <div className='grid gap-4 p-4'>
      {questions.map((question, index) => (
        <Card key={index} className='p-4'>
          <CardContent>
            <div className='mb-2 font-semibold'>{question}</div>
            <select className='border rounded-md p-2 w-full'>
              {dropdownOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      ))}

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

export default NewSectorPlanningTab;

