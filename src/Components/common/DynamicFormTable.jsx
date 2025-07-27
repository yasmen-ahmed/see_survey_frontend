import React from 'react';
import useUnsavedChanges from '../../hooks/useUnsavedChanges';

const DynamicFormTable = ({
  title = '',
  entityName = 'Item',
  entityCount = 0,
  entities = [],
  questions = [],
  errors = {},
  onChange = () => {},
  onSubmit = (e) => e.preventDefault(),
  isSubmitting = false,
  maxHeight = '600px',
  showSubmitButton = true,
  submitButtonText = 'Save',
  hasUnsavedChanges = false,
  saveDataToAPI = null
}) => {
  if (saveDataToAPI) {
    useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);
  }

  const safeEntities = Array.isArray(entities) ? entities : [];

  const getRowBackgroundClass = (index) => index % 2 === 0 ? '' : 'bg-gray-50';

  const getHeaderClass = (question) =>
    question.isConditional
      ? 'border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10'
      : 'border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10';

  const renderField = (question, entityIndex) => {
    const entity = safeEntities[entityIndex] || {};
    const fieldValue = entity[question.key] || (question.type === 'checkbox' ? [] : '');
    const errorKey = `${entityIndex}.${question.key}`;
    const hasError = errors[errorKey];
    const isDisabled = question.condition && !question.condition(entity);

    const fieldClass = `w-full p-2 border rounded text-sm ${
      isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
    } ${hasError ? 'border-red-500' : 'border-gray-300'}`;

    switch (question.type) {
      case 'select':
        return (
          <div>
            <select
              value={fieldValue}
              onChange={(e) => onChange(entityIndex, question.key, e.target.value)}
              className={fieldClass}
              disabled={isDisabled}
            >
              <option value="">-- Select --</option>
              {(question.options || []).map((option, idx) => (
                <option key={idx} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {hasError && <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>}
          </div>
        );

        case 'radio':
          return (
            <div>
              <div className="flex gap-2 flex-wrap">
                {(question.options || []).map((option, idx) => {
                  const value = option.value || option;
                  return (
                    <label key={idx} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name={`${question.key}-${entityIndex}`}
                        value={value}
                        checked={fieldValue === value}
                        onChange={(e) => onChange(entityIndex, question.key, value)}
                        className="w-4 h-4"
                        disabled={isDisabled}
                      />
                      {option.label || value}
                    </label>
                  );
                })}
              </div>
        
              {/* Conditionally render "Other" input */}
              {question.showOtherInput && fieldValue === 'Other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={safeEntities[entityIndex]?.[question.otherKey] || ''}
                    onChange={(e) => onChange(entityIndex, question.otherKey, e.target.value)}
                    placeholder="Please specify"
                    className={`w-full p-2 mt-1 border rounded text-sm ${
                      errors[`${entityIndex}.${question.otherKey}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`${entityIndex}.${question.otherKey}`] && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors[`${entityIndex}.${question.otherKey}`]}
                    </div>
                  )}
                </div>
              )}
              {hasError && <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>}
            </div>
          );
        
          case 'checkbox':
            return (
              <div>
                <div className="grid grid-cols-2 gap-1">
                  {(question.options || []).map((option, idx) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const label = typeof option === 'object' ? option.label : option;
                    const isChecked = Array.isArray(fieldValue) && fieldValue.includes(optionValue);
          
                    return (
                      <label key={idx} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          value={optionValue}
                          checked={isChecked}
                          onChange={(e) => {
                            const currentValue = Array.isArray(fieldValue) ? fieldValue : [];
                            const isCurrentlyChecked = currentValue.includes(optionValue);
                            const updated = isCurrentlyChecked
                              ? currentValue.filter((v) => v !== optionValue)
                              : [...currentValue, optionValue];
                            onChange(entityIndex, question.key, updated);
                          }}
                          className="w-4 h-4"
                          disabled={isDisabled}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
                {hasError && <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>}
              </div>
            );
          
      case 'number':
      case 'text':
      default:
        return (
          <div>
            <input
              type={question.type || 'text'}
              value={fieldValue}
              onChange={(e) => onChange(entityIndex, question.key, e.target.value)}
              className={fieldClass}
              placeholder={
                isDisabled ? question.disabledPlaceholder || 'N/A' : question.placeholder
              }
              disabled={isDisabled}
            />
            {hasError && <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>}
          </div>
        );
    }
  };

  if (!questions.length) {
    return (
      <div className="text-center p-4">
        <p>No questions configured for this form.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
      {title && (
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="text-sm font-medium">⚠️ You have unsaved changes</p>
          <p className="text-sm">Don’t forget to save before leaving this page.</p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.submit}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th
                className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-20"
                style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
              >
                Field Description
              </th>
              {Array.from({ length: Math.max(1, entityCount) }, (_, i) => (
                <th
                  key={i}
                  className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-10"
                >
                  {entityName} #{i + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {questions.map((question, questionIndex) => {
              const isGroup = question.type === 'group';
              const shouldRender = !question.showCondition ||
                safeEntities.slice(0, entityCount).some(entity => question.showCondition(entity));

              if (!shouldRender) return null;

              return (
                <tr key={question.key || `group-${questionIndex}`} className={getRowBackgroundClass(questionIndex)}>
                  <td className={getHeaderClass(question)}>{question.label}</td>
                  {Array.from({ length: Math.max(1, entityCount) }, (_, i) => {
                    const entity = safeEntities[i] || {};

                    return (
                      <td key={i} className="border px-4 py-2">
                        {isGroup ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {question.fields.map((fieldKey) => {
                              const fieldValue = entity[fieldKey] || '';
                              const errorKey = `${i}.${fieldKey}`;
                              const hasError = errors[errorKey];
                              const fieldMeta = questions.find(q => q.key === fieldKey) || {};

                              return (
                                <div key={fieldKey}>
                                  <input
                                    type="number"
                                    placeholder={fieldMeta.placeholder || ''}
                                    className={`w-full p-2 border rounded text-sm ${
                                      hasError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    value={fieldValue}
                                    onChange={(e) => onChange(i, fieldKey, e.target.value)}
                                  />
                                  {hasError && (
                                    <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          renderField(question, i)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      {showSubmitButton && (
        <div className="flex-shrink-0 pt-6 pb-4 flex justify-center border-t bg-white">
          <button
            type="submit"
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : submitButtonText}
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicFormTable;
