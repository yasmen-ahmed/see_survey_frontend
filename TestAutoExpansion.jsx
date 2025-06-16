import React, { useState } from 'react';
import DynamicTable from './src/Components/DynamicTable';

const TestAutoExpansion = () => {
  const [data, setData] = useState([]);

  const rows = [
    {
      key: 'rating',
      label: 'CB Rating (Amp)',
      type: 'number',
      placeholder: 'Enter rating...'
    },
    {
      key: 'connected_load',
      label: 'Connected Load',
      type: 'textarea',
      placeholder: 'Describe connected load...'
    }
  ];

  const handleChange = (newData) => {
    console.log("Data changed:", newData);
    setData(newData);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auto-Expansion Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Test Steps:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Type "25" in the first column's rating field</li>
          <li>Verify a new empty column appears</li>
          <li>Type "50" in the second column's rating field</li>
          <li>Verify a third column appears</li>
          <li>Type "100" in the third column's rating field</li>
          <li>Verify a fourth column appears</li>
          <li>Delete the second column using the trash icon</li>
          <li>Verify the table maintains proper structure</li>
        </ol>
      </div>

      <div className="border-2 border-blue-200 p-4 rounded">
        <DynamicTable
          title="CB Ratings Test Table"
          rows={rows}
          initialData={data}
          onChange={handleChange}
          minColumns={1}
          autoExpand={true}
          enableDragDrop={true}
          enableDelete={true}
          className=""
          tableClassName="w-full border border-gray-300"
          headerClassName="bg-gray-200"
          cellClassName="border px-2 py-2"
          labelClassName="border px-2 py-2 font-semibold bg-gray-50 text-xs"
        />
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Current Data:</h3>
        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestAutoExpansion; 