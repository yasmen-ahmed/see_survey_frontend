import React from 'react';

const DynamicFormTable = ({
  title,
  entityName,
  entityCount,
  entities,
  questions,
  errors,
  onChange,
  onSubmit,
  isSubmitting = false,
  maxHeight = '600px',
  showSubmitButton = true,
  submitButtonText = 'Save and Continue'
}) => {
  const renderField = (question, entityIndex) => {
    const entity = entities[entityIndex] || {};
    const fieldValue = entity[question.key] || (question.type === 'checkbox' ? [] : '');
    const errorKey = `${entityIndex}.${question.key}`;
    const hasError = errors[errorKey];

    // Check if field should be disabled based on conditional logic
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
              {question.options.map((option, idx) => (
                <option key={idx} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            <div className="flex gap-2 flex-wrap">
              {question.options.map((option, idx) => (
                <label key={idx} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name={`${question.key}-${entityIndex}`}
                    value={option.value || option}
                    checked={fieldValue === (option.value || option)}
                    onChange={(e) => onChange(entityIndex, question.key, e.target.value)}
                    className="w-4 h-4"
                    disabled={isDisabled}
                  />
                  {option.label || option}
                </label>
              ))}
            </div>
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <div className="grid grid-cols-2 gap-1">
              {question.options.map((option, idx) => {
                const optionValue = option.value || option;
                const isChecked = Array.isArray(fieldValue) && fieldValue.includes(optionValue);
                return (
                  <label key={idx} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      value={optionValue}
                      checked={isChecked}
                      onChange={(e) => onChange(entityIndex, question.key, e.target.value)}
                      className="w-4 h-4"
                      disabled={isDisabled}
                    />
                    {option.label || option}
                  </label>
                );
              })}
            </div>
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>
            )}
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
              placeholder={isDisabled ? (question.disabledPlaceholder || 'N/A') : question.placeholder}
              disabled={isDisabled}
            />
            {hasError && (
              <div className="text-red-500 text-xs mt-1">{errors[errorKey]}</div>
            )}
          </div>
        );
    }
  };

  const getRowBackgroundClass = (index) => {
    return index % 2 === 0 ? '' : 'bg-gray-50';
  };

  const getHeaderClass = (question) => {
    if (question.isConditional) {
      return 'border px-4 py-3 font-semibold sticky left-0 bg-blue-300 text-white z-10';
    }
    return 'border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10';
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form onSubmit={onSubmit} className="space-y-4">
          {title && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Table Layout */}
          <div className="overflow-auto" style={{ maxHeight }}>
            <table className="table-auto w-full border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th
                    className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                    style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}
                  >
                    Field Description
                  </th>
                  {Array.from({ length: entityCount }, (_, i) => (
                    <th
                      key={i}
                      className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-20"
                    >
                      {entityName} #{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {questions.map((question, questionIndex) => {
                  // Check if this question should be rendered based on conditional logic
                  const shouldRender = !question.showCondition || 
                    entities.slice(0, entityCount).some(entity => question.showCondition(entity));

                  if (!shouldRender) return null;

                  return (
                    <tr key={question.key} className={getRowBackgroundClass(questionIndex)}>
                      <td className={getHeaderClass(question)}>
                        {question.label}
                      </td>
                      {entities.slice(0, entityCount).map((entity, entityIndex) => (
                        <td key={entityIndex} className="border px-2 py-2">
                          {renderField(question, entityIndex)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showSubmitButton && (
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 text-white rounded font-semibold ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : submitButtonText}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DynamicFormTable; 