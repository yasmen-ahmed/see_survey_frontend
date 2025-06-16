import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Use ref to track user interaction state
  const userInteractionRef = useRef(false);
  const initializedRef = useRef(false);

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

  // Update parent component when data changes (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      memoizedOnChange(tableData);
    }, 300);

    return () => clearTimeout(timer);
  }, [tableData, memoizedOnChange]);

  // Update internal state when initialData changes (only on initial load or external changes)
  useEffect(() => {
    // Skip if this is from user interaction or already initialized with data
    if (userInteractionRef.current || initializedRef.current) {
      return;
    }

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
      
      setTableData(newData);
      initializedRef.current = true;
    }
  }, [initialData, autoExpand, rows]);

  // Ensure we always have an empty column at the end for auto-expansion
  useEffect(() => {
    if (!autoExpand || userInteractionRef.current) return;
    
    setTableData(prev => {
      const lastColumn = prev[prev.length - 1];
      if (!lastColumn) return prev;
      
      const hasContent = rows.some(row => {
        const value = lastColumn[row.key];
        return value && value.toString().trim() !== '';
      });
      
      // If the last column has content, add a new empty column
      if (hasContent) {
        const maxId = Math.max(...prev.map(item => item.id));
        const newColumn = createEmptyColumn(maxId + 1);
        console.log("Adding maintenance empty column");
        return [...prev, newColumn];
      }
      
      return prev;
    });
  }, [tableData, autoExpand, rows]); // Run whenever tableData changes

  // Handle input changes with immediate auto-expansion
  const handleTableChange = (columnId, fieldKey, value) => {
    console.log(`Typing in column ${columnId}, field ${fieldKey}, value: "${value}"`);
    userInteractionRef.current = true;
    
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

        console.log(`Column index: ${columnIndex}, is last: ${isLastColumn}, has content: ${hasContent}, total columns: ${updated.length}`);

        // If user typed in the last column and it has content, add a new empty column
        if (isLastColumn && hasContent) {
          const maxId = Math.max(...updated.map(item => item.id));
          const newColumn = createEmptyColumn(maxId + 1);
          updated.push(newColumn);
          console.log(`Added new column with ID ${newColumn.id}, total columns now: ${updated.length}`);
        }
      }

      return updated;
    });
    
    // Reset user interaction flag after a delay
    setTimeout(() => {
      userInteractionRef.current = false;
    }, 1000);
  };

  // Delete a specific column
  const deleteColumn = (columnId) => {
    if (!enableDelete) return;
    
    userInteractionRef.current = true;
    
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
    
    // Reset user interaction flag after a delay
    setTimeout(() => {
      userInteractionRef.current = false;
    }, 1000);
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

  // Clean up empty columns (except the last one for auto-expansion) - IMPROVED VERSION
  const cleanupTable = () => {
    if (!autoExpand) return;
    
    console.log("Cleanup triggered, current table data:", tableData.length);
    userInteractionRef.current = true;
    
    setTableData(prev => {
      // Keep columns that have content
      const withContent = [];
      const withoutContent = [];
      
      for (let i = 0; i < prev.length; i++) {
        const item = prev[i];
        const hasContent = rows.some(row => {
          const value = item[row.key];
          return value && value.toString().trim() !== '';
        });
        
        if (hasContent) {
          withContent.push(item);
        } else {
          withoutContent.push(item);
        }
      }
      
      console.log(`Columns with content: ${withContent.length}, without content: ${withoutContent.length}`);
      
      // Start with all columns that have content
      let cleaned = [...withContent];
      
      // Always keep at least one empty column at the end for typing
      if (withoutContent.length > 0) {
        // Keep the last empty column (highest ID)
        const lastEmpty = withoutContent.reduce((latest, current) => 
          current.id > latest.id ? current : latest
        );
        cleaned.push(lastEmpty);
      } else {
        // No empty columns exist, create one
        const maxId = cleaned.length > 0 ? Math.max(...cleaned.map(item => item.id)) : 0;
        cleaned.push(createEmptyColumn(maxId + 1));
      }
      
      // Ensure we have at least minColumns
      while (cleaned.length < minColumns) {
        const maxId = Math.max(...cleaned.map(item => item.id));
        cleaned.push(createEmptyColumn(maxId + 1));
      }
      
      // Sort by ID to maintain order
      cleaned.sort((a, b) => a.id - b.id);
      
      console.log(`After cleanup: ${cleaned.length} columns`);
      
      return cleaned;
    });
    
    // Reset user interaction flag after a delay
    setTimeout(() => {
      userInteractionRef.current = false;
    }, 1000);
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