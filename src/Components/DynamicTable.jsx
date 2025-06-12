import React, { useState, useEffect, useCallback } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

const DynamicTable = ({
  title = "Dynamic Table",
  rows = [], // Array of row configurations: [{ key: 'rating', label: 'CB/fuse rating (Amp)', type: 'number', placeholder: 'Add rating...' }]
  initialData = [], // Initial table data
  onChange, // Callback function when data changes: (newData) => {}
  minColumns = 1, // Minimum number of columns to keep
  autoExpand = true, // Whether to auto-expand when typing in last column
  enableDragDrop = true, // Whether to enable drag & drop functionality
  enableDelete = true, // Whether to enable column deletion
  className = "",
  tableClassName = "w-full border border-gray-300",
  headerClassName = "bg-gray-200",
  cellClassName = "border px-2 py-2",
  labelClassName = "border px-4 py-2 font-semibold bg-gray-50"
}) => {
  // Create initial empty column if no data provided
  const createEmptyColumn = (id = 1) => {
    const emptyColumn = { id };
    rows.forEach(row => {
      emptyColumn[row.key] = '';
    });
    return emptyColumn;
  };

  const [tableData, setTableData] = useState(() => {
    if (initialData && initialData.length > 0) {
      const processedData = initialData.map((item, index) => ({
        ...item,
        id: item.id || index + 1
      }));
      
      // Always ensure there's an empty column at the end for auto-expansion
      if (autoExpand) {
        const maxId = Math.max(...processedData.map(item => item.id));
        const lastColumn = processedData[processedData.length - 1];
        const hasContent = rows.some(row => {
          const value = lastColumn[row.key];
          return value && value.toString().trim() !== '';
        });
        
        if (hasContent) {
          processedData.push(createEmptyColumn(maxId + 1));
        }
      }
      
      return processedData;
    }
    
    // Create initial empty column
    return [createEmptyColumn(1)];
  });

  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

  // Memoize the onChange callback to prevent infinite re-renders
  const memoizedOnChange = useCallback((data) => {
    if (onChange) {
      // Filter out completely empty columns before sending to parent
      const filteredData = data.filter(item => {
        return rows.some(row => {
          const value = item[row.key];
          return value && value.toString().trim() !== '';
        });
      });
      onChange(filteredData);
    }
  }, [onChange, rows]);

  // Update parent component when data changes (with debouncing only for parent updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      memoizedOnChange(tableData);
    }, 300); // Increased debounce time for parent updates only

    return () => clearTimeout(timer);
  }, [tableData, memoizedOnChange]);

  // Update internal state when initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const newData = initialData.map((item, index) => ({
        ...item,
        id: item.id || index + 1
      }));
      
      // Always ensure there's an empty column at the end for auto-expansion
      if (autoExpand) {
        const maxId = Math.max(...newData.map(item => item.id));
        const lastColumn = newData[newData.length - 1];
        const hasContent = rows.some(row => {
          const value = lastColumn[row.key];
          return value && value.toString().trim() !== '';
        });
        
        if (hasContent) {
          newData.push(createEmptyColumn(maxId + 1));
        }
      }
      
      // Only update if data structure has actually changed
      const currentDataString = JSON.stringify(tableData.map(item => {
        const { id, ...rest } = item;
        return rest;
      }));
      const newDataString = JSON.stringify(newData.map(item => {
        const { id, ...rest } = item;
        return rest;
      }));
      
      if (currentDataString !== newDataString) {
        setTableData(newData);
      }
    } else if (tableData.length === 0) {
      // If initialData is empty and we have no data, create initial empty column
      setTableData([createEmptyColumn(1)]);
    }
  }, [initialData, autoExpand, rows]);

  // Handle input changes with immediate auto-expansion
  const handleTableChange = (columnId, fieldKey, value) => {
    setTableData(prev => {
      // Update the specific cell
      const updated = prev.map(item =>
        item.id === columnId ? { ...item, [fieldKey]: value } : item
      );

      // Auto-expansion logic - check if we need to add a new column
      if (autoExpand) {
        const columnIndex = updated.findIndex(item => item.id === columnId);
        const isLastColumn = columnIndex === updated.length - 1;
        const hasContent = value && value.toString().trim() !== '';

        // If user typed in the last column and it has content, add a new empty column
        if (isLastColumn && hasContent) {
          const maxId = Math.max(...updated.map(item => item.id));
          const newColumn = createEmptyColumn(maxId + 1);
          updated.push(newColumn);
        }
      }

      return updated;
    });
  };

  // Delete a specific column
  const deleteColumn = (columnId) => {
    if (!enableDelete) return;
    
    setTableData(prev => {
      const filtered = prev.filter(item => item.id !== columnId);
      
      // Always keep at least the minimum number of columns
      if (filtered.length < minColumns) {
        const maxId = Math.max(...prev.map(item => item.id), 0);
        const newColumn = createEmptyColumn(maxId + 1);
        return [...filtered, newColumn];
      }
      
      // If no columns left, create an empty one
      if (filtered.length === 0) {
        return [createEmptyColumn(1)];
      }
      
      // Ensure there's always an empty column at the end for auto-expansion
      if (autoExpand) {
        const lastColumn = filtered[filtered.length - 1];
        const hasContent = rows.some(row => {
          const value = lastColumn[row.key];
          return value && value.toString().trim() !== '';
        });
        
        if (hasContent) {
          const maxId = Math.max(...filtered.map(item => item.id));
          filtered.push(createEmptyColumn(maxId + 1));
        }
      }
      
      return filtered;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (!enableDragDrop) return;
    
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    if (!enableDragDrop) return;
    
    e.target.style.opacity = '';
    setDraggedColumnIndex(null);
  };

  const handleDragOver = (e) => {
    if (!enableDragDrop) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    if (!enableDragDrop) return;
    
    e.preventDefault();

    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) {
      return;
    }

    setTableData(prev => {
      const newData = [...prev];
      const draggedItem = newData[draggedColumnIndex];

      // Remove the dragged item
      newData.splice(draggedColumnIndex, 1);

      // Insert at the new position
      newData.splice(dropIndex, 0, draggedItem);

      return newData;
    });

    setDraggedColumnIndex(null);
  };

  // Clean up empty columns (except the last one for auto-expansion)
  const cleanupTable = () => {
    if (!autoExpand) return;
    
    setTableData(prev => {
      // Keep columns that have content, plus always keep the last column for typing
      const cleaned = [];
      
      for (let i = 0; i < prev.length; i++) {
        const item = prev[i];
        const hasContent = rows.some(row => {
          const value = item[row.key];
          return value && value.toString().trim() !== '';
        });
        
        // Keep if it has content, or if it's the last column
        if (hasContent || i === prev.length - 1) {
          cleaned.push(item);
        }
      }
      
      // Ensure we have at least minColumns
      while (cleaned.length < minColumns) {
        const maxId = cleaned.length > 0 ? Math.max(...cleaned.map(item => item.id)) : 0;
        cleaned.push(createEmptyColumn(maxId + 1));
      }
      
      // Ensure there's always an empty column at the end
      const lastColumn = cleaned[cleaned.length - 1];
      const lastHasContent = rows.some(row => {
        const value = lastColumn[row.key];
        return value && value.toString().trim() !== '';
      });
      
      if (lastHasContent) {
        const maxId = Math.max(...cleaned.map(item => item.id));
        cleaned.push(createEmptyColumn(maxId + 1));
      }
      
      return cleaned;
    });
  };

  // Render input based on type
  const renderInput = (row, item, index) => {
    const baseClassName = "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
    const value = item[row.key] || '';

    const commonProps = {
      value,
      onChange: (e) => handleTableChange(item.id, row.key, e.target.value),
      onBlur: cleanupTable,
      className: baseClassName,
      placeholder: row.placeholder || `Add ${row.label.toLowerCase()}...`,
    };

    switch (row.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`${baseClassName} resize-none overflow-hidden leading-tight`}
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select</option>
            {row.options?.map((option, idx) => (
              <option key={idx} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      case 'number':
        return <input {...commonProps} type="number" />;
      case 'text':
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-xl font-semibold mt-10 mb-3 bg-blue-600 text-white p-3">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className={headerClassName}>
            <tr>
              <th className="border px-4 py-2 w-48">Field</th>
              {tableData.map((_, index) => (
                <th
                  key={`header-${index}`}
                  className={`border px-4 py-2 w-32 relative cursor-move select-none ${
                    draggedColumnIndex === index ? 'bg-blue-200' : ''
                  }`}
                  draggable={enableDragDrop}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  title={enableDragDrop ? "Drag to reorder columns" : ""}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>#{index + 1}</span>
                    {enableDelete && tableData.length > minColumns && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(tableData[index].id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold absolute right-2"
                        title="Delete this column"
                      >
                        <FaRegTrashAlt />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.key}>
                <td className={labelClassName}>
                  {row.label}
                </td>
                {tableData.map((item, index) => (
                  <td
                    key={`${row.key}-${item.id}-${index}`}
                    className={`${cellClassName} ${
                      draggedColumnIndex === index ? 'bg-blue-100' : ''
                    }`}
                  >
                    {renderInput(row, item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable; 