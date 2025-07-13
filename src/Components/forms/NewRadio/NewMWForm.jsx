import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mwQuestions } from '../../../config/mwQuestions';
import ImageUploader from '../../GalleryComponent';
import { getNewMWData, saveNewMWData } from '../../../services/newMwService';
import { showSuccess, showError } from "../../../utils/notifications";

const API_BASE_URL = import.meta.env.VITE_API_URL; // fallback if needed

function clearAutoFilledFlags(formData) {
  const newFormData = {};
  Object.entries(formData).forEach(([mwKey, fields]) => {
    const cleanedFields = {};
    Object.entries(fields).forEach(([fieldKey, value]) => {
      if (!fieldKey.endsWith('AutoFilled')) {
        cleanedFields[fieldKey] = value;
      }
    });
    newFormData[mwKey] = cleanedFields;
  });
  return newFormData;
}


const NewMWForm = () => {
  const { sessionId,siteId } = useParams();
  const [mwCount, setMwCount] = useState(1);
  const [formData, setFormData] = useState({});
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bgColorFillAuto = "bg-[#c6efce]";
  const colorFillAuto = 'text-[#006100]';

  const getMwImages = (index) => {
    return [
      {
        id: `mw_${index}_front`,
        name: `mw_${index}_front`,
        label: `New MW #${index} Front View`,
        category: 'new_mw',
        required: true
      },
      {
        id: `mw_${index}_idulocation_optional`,
        name: `mw_${index}_idulocation_optional`,
        label: `New MU IDU  #${index} Proposed Location optional photo`,
        category: 'new_mw',
        required: false
      },
      {
        id: `mw_${index}_odu_proposed`,
        name: `mw_${index}_odu_proposed`,
        label: `New MU ODU #${index} proposed `,
        category: 'new_mw',
        required: false
      }
      ,
      {
        id: `mw_${index}_odu_location_optional`,
        name: `mw_${index}_odu_location_optional`,
        label: `New MU ODU #${index} Proposed Location optional photo `,
        category: 'new_mw',
        required: false
      }
    ];
  };

  const allImages = useMemo(() => {
    if (!mwCount) return [];
    const count = parseInt(mwCount);
    let images = [];
    for (let i = 1; i <= count; i++) {
      images = [...images, ...getMwImages(i)];
    }
    return images;
  }, [mwCount]);

  const handleImageUpload = (imageName, files) => {
    setUploadedImages(prev => ({
      ...prev,
      [imageName]: files
    }));
    setHasUnsavedChanges(true);
  };

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value);
    setHasUnsavedChanges(true);
    setMwCount(count);

    // Initialize form data for new columns
    const newFormData = {};
    for (let i = 1; i <= count; i++) {
      if (!formData[`mw${i}`]) {
        newFormData[`mw${i}`] = mwQuestions.reduce((acc, q) => {
          acc[q.id] = '';
          return acc;
        }, {});
      } else {
        newFormData[`mw${i}`] = formData[`mw${i}`];
      }
    }
    setFormData(newFormData);
  };

  const handleInputChange = (mwIndex, fieldId, value) => {
    setHasUnsavedChanges(true);
    setFormData(prev => {
      const updated = { ...prev };
      
      // Update the changed MW
      if (!updated[`mw${mwIndex}`]) {
        updated[`mw${mwIndex}`] = {};
      }
      
      updated[`mw${mwIndex}`] = {
        ...updated[`mw${mwIndex}`],
        [fieldId]: value,
        [`${fieldId}AutoFilled`]: false // The changed field is not auto-filled
      };

      // Only auto-fill if the change is in the first column (mwIndex === 1)
      if (mwIndex === 1) {
        // Auto-fill empty fields in other MWs
        for (let i = 2; i <= mwCount; i++) { // Start from 2 since 1 is the source
          if (!updated[`mw${i}`]) {
            updated[`mw${i}`] = {};
          }
          // Only auto-fill if the field is empty or was previously auto-filled
          if (!updated[`mw${i}`][fieldId] || updated[`mw${i}`][`${fieldId}AutoFilled`]) {
            updated[`mw${i}`] = {
              ...updated[`mw${i}`],
              [fieldId]: value,
              [`${fieldId}AutoFilled`]: true
            };
          }
        }
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    let isValid = true;
    const errors = [];

    for (let i = 1; i <= mwCount; i++) {
      const mwData = formData[`mw${i}`] || {};
      mwQuestions.forEach(question => {
        if (question.required && !mwData[question.id]) {
          isValid = false;
          errors.push(`MW ${i}: ${question.label} is required`);
        }
        if (question.allowOther && mwData[question.id] === 'Other' && !mwData[`${question.id}Other`]) {
          isValid = false;
          errors.push(`MW ${i}: Please specify other ${question.label}`);
        }
      });
    }

    if (!isValid) {
      alert(errors.join('\n'));
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Build payload
      const mwArray = [];
      for (let i = 1; i <= mwCount; i++) {
        mwArray.push({
          mw_index: i,
          fields: formData[`mw${i}`] || {}
        });
      }

      const payload = new FormData();
      payload.append('fields', JSON.stringify(mwArray));

      // Append images (only new File objects)
      Object.entries(uploadedImages).forEach(([category, files]) => {
        if (Array.isArray(files) && files.length > 0) {
          const file = files[0];
          if (file instanceof File) {
            payload.append(category, file);
          }
        }
      });

      const response = await saveNewMWData(sessionId, payload);

      if (response.success) {
        showSuccess('Antenna configuration data and images submitted successfully!');
        setHasUnsavedChanges(false);
        const cleanedFormData = clearAutoFilledFlags(formData);
        setFormData(cleanedFormData);
         // Remove autofill highlights
        loadExistingData();
      } else {
        alert(response.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch existing data on mount
  const loadExistingData = async () => {
    setIsLoading(true);
    try {
      const res = await getNewMWData(sessionId);
      if (res.success && Array.isArray(res.data)) {
        const fetchedImages = {};
        const fetchedFormData = {};

        res.data.forEach(item => {
          const { mw_index, fields, images } = item;
          if (fields) {
            fetchedFormData[`mw${mw_index}`] = Object.fromEntries(
              Object.entries(fields).filter(([key]) => !key.endsWith('AutoFilled'))
            );
            
          }
          if (Array.isArray(images)) {
            images.forEach(img => {
              fetchedImages[img.image_category] = [
                {
                  file_url: img.file_url,
                  url: img.url // absolute URL added by backend helper
                }
              ];
            });
          }
        });

        // Determine count
        const maxIndex = Math.max(1, ...res.data.map(d => d.mw_index || 1));
        setMwCount(maxIndex);
        setFormData(fetchedFormData);
        setUploadedImages(fetchedImages);
      }
    } catch (err) {
      console.error('Failed to load MW data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExistingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderInput = (question, value, onChange, mwIndex) => {
    switch (question.type) {
      case 'select':
        return (
          <div>
            <select
              value={value}
              onChange={onChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData[`mw${mwIndex}`]?.[`${question.id}AutoFilled`] 
                  ? `${bgColorFillAuto} ${colorFillAuto}` 
                  : ''
              }`}
              required={question.required}
            >
              <option value="">Select {question.label}</option>
              {question.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {question.allowOther && value === 'Other' && (
              <input
                type="text"
                value={formData[`mw${mwIndex}`]?.[`${question.id}Other`] || ''}
                onChange={(e) => handleInputChange(mwIndex, `${question.id}Other`, e.target.value)}
                placeholder={`Specify other ${question.label}`}
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>
        );
      case 'radio':
        return (
          <div className={`flex gap-4 p-2 rounded ${
            formData[`mw${mwIndex}`]?.[`${question.id}AutoFilled`] 
              ? bgColorFillAuto
              : ''
          }`}>
            {question.options.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={opt}
                  checked={value === opt}
                  onChange={onChange}
                  required={question.required}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className={formData[`mw${mwIndex}`]?.[`${question.id}AutoFilled`] ? colorFillAuto : ''}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData[`mw${mwIndex}`]?.[`${question.id}AutoFilled`] 
                ? `${bgColorFillAuto} ${colorFillAuto}` 
                : ''
            }`}
            required={question.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData[`mw${mwIndex}`]?.[`${question.id}AutoFilled`] 
                ? `${bgColorFillAuto} ${colorFillAuto}` 
                : ''
            }`}
            required={question.required}
          />
        );
    }
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">
                  ⚠️ You have unsaved changes
                </p>
                <p className="text-sm">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <label className="font-semibold mb-2">
            How many new MW planned?
          </label>
          <select
            value={mwCount}
            onChange={handleCountChange}
            className="form-input"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="overflow-auto max-h-[550px]">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th
                    className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                    style={{ width: '300px', minWidth: '300px', maxWidth: '300px' }}
                  >
                    Field Description
                  </th>
                  {Array.from({ length: mwCount }, (_, i) => i + 1).map(i => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[200px] sticky top-0 bg-blue-500 z-20"
                    >
                      New MW {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mwQuestions.map(question => (
                  <tr key={question.id} className="bg-gray-50">
                    <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-500 text-white z-10">
                      {question.label}
                    </td>
                    {Array.from({ length: mwCount }, (_, i) => i + 1).map(mwIndex => (
                      <td key={mwIndex} className="border px-2 py-2">
                        {renderInput(
                          question,
                          formData[`mw${mwIndex}`]?.[question.id] || '',
                          (e) => handleInputChange(mwIndex, question.id, e.target.value),
                          mwIndex
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      <ImageUploader
        images={allImages}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default NewMWForm;