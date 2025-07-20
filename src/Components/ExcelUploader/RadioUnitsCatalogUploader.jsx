import React, { useState } from 'react';
import axios from 'axios';

const RadioUnitsCatalogUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/radio-units-catalog/upload-excel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      ['item code', 'item name', 'item description', 'max of full', 'max of busy', 'power connector type', 'hardware type', 'antenna connector interface number', 'antenna connector interface type'],
      ['472835A', 'FZNN', 'Flexi RRH 1TX 2300', '245.00', '', 'APPC DC Power Connector is Required', 'RRH', '2', 'N type'],
      ['473997A', 'AHPMDA', 'AirScale tri RRH 2T2R B8/20/28 (n8/n20/n28) 240 W', '1065.70', '731.70', 'APPC DC Power Connector is Required', 'RRH', '2', '4.3-10'],
      ['473368A', 'FRIJ', 'AirScale RRH 4T4R 160 W', '703.00', '504.00', 'Inbuilt 3 pole screw terminal', 'RRH', '4', ''],
      ['474242A', 'AHBCB', 'AirScale dual RRH 4T4R n5/B29 240 W', '892.98', '660.35', 'APPC DC Power Connector is Required', 'RRH', '4', '']
    ];

    // Convert to CSV format
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'radio-units-catalog-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Radio Units Catalog Excel Upload</h2>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload an Excel file (.xlsx or .xls) with the required columns</li>
          <li>• <strong>Required columns:</strong> "item code", "item name"</li>
          <li>• <strong>Optional columns:</strong> "item description", "max of full", "max of busy", "power connector type", "hardware type", "antenna connector interface number", "antenna connector interface type"</li>
          <li>• Empty cells will be handled automatically based on data type</li>
          <li>• Existing items with the same item_code will be updated</li>
        </ul>
      </div>

      {/* Template Download */}
      <div className="mb-6">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          📥 Download Template
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Excel File:
        </label>
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`px-6 py-2 rounded font-medium transition-colors ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload Excel File'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">✅ Upload Results:</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.summary.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.summary.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{result.summary.skipped}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{result.summary.errors}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          {/* Sample Results */}
          {result.results && result.results.length > 0 && (
            <div>
              <h4 className="font-medium text-green-800 mb-2">Sample Results:</h4>
              <div className="max-h-40 overflow-y-auto">
                {result.results.slice(0, 10).map((item, index) => (
                  <div key={index} className="text-sm mb-1">
                    <span className="font-medium">Row {item.row}:</span> {item.item_code} - 
                    <span className={`ml-1 ${
                      item.status === 'created' ? 'text-green-600' : 
                      item.status === 'updated' ? 'text-blue-600' : 
                      'text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {result.results.length > 10 && (
                  <div className="text-sm text-gray-500">
                    ... and {result.results.length - 10} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RadioUnitsCatalogUploader; 