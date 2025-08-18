import React, { useState, useEffect, useCallback } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

const DynamicTable = ({
  title = "Dynamic Table",
  rows = [], // [{ key: 'rating', label: 'CB/fuse rating (Amp)', type: 'number', placeholder: 'Add rating...' }]
  initialData = [],
  onChange,
  minRows = 1,
  autoExpand = true,
  enableDelete = true,
  className = "",
  tableClassName = "w-full border border-gray-300",
  headerClassName = "bg-gray-200",
  cellClassName = "border px-2 py-2",
  labelClassName = "border px-4 py-2 font-semibold bg-gray-50"
}) => {
  const createEmptyRow = (id = 1) => {
    const row = { id };
    rows.forEach(col => row[col.key] = "");
    return row;
  };

  const [tableData, setTableData] = useState(() => {
    if (initialData.length > 0) {
      return initialData.map((item, i) => ({ ...item, id: item.id || i + 1 }));
    }
    return [createEmptyRow(1)];
  });

  // Notify parent on change
  const memoizedOnChange = useCallback((data) => {
    if (onChange) {
      const filtered = data.filter(item =>
        rows.some(col => item[col.key]?.toString().trim() !== "")
      );
      onChange(filtered);
    }
  }, [onChange, rows]);

  useEffect(() => {
    memoizedOnChange(tableData);
  }, [tableData, memoizedOnChange]);

  const handleChange = (rowId, key, value) => {
    setTableData(prev => {
      const updated = prev.map(r => r.id === rowId ? { ...r, [key]: value } : r);

      // auto expand: if editing last row with content
      if (autoExpand) {
        const lastRow = updated[updated.length - 1];
        const hasContent = rows.some(col => lastRow[col.key]?.toString().trim() !== "");
        if (hasContent) {
          updated.push(createEmptyRow(updated.length + 1));
        }
      }
      return updated;
    });
  };

  const deleteRow = (rowId) => {
    if (!enableDelete) return;
    setTableData(prev => {
      const filtered = prev.filter(r => r.id !== rowId);
      if (filtered.length < minRows) {
        filtered.push(createEmptyRow(filtered.length + 1));
      }
      return filtered;
    });
  };

  const renderInput = (col, row) => {
    const value = row[col.key] || "";
    const commonProps = {
      value,
      onChange: e => handleChange(row.id, col.key, e.target.value),
      placeholder: col.placeholder || `Add ${col.label.toLowerCase()}...`,
      className: "w-full p-2 border rounded"
    };

    switch (col.type) {
      case "textarea":
        return <textarea {...commonProps} rows={1} />;
      case "select":
        return (
          <select {...commonProps}>
            <option value="">Select</option>
            {col.options?.map((opt, i) => (
              <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
        );
      case "number":
        return <input {...commonProps} type="number" />;
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-xl font-semibold mt-4 mb-3 bg-blue-600 text-white p-3">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className={headerClassName}>
            <tr>
              {rows.map(col => (
                <th key={col.key} className="border px-4 py-2">{col.label}</th>
              ))}
              {enableDelete && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={row.id}>
                {rows.map(col => (
                  <td key={`${col.key}-${row.id}`} className={cellClassName}>
                    {renderInput(col, row)}
                  </td>
                ))}
                {enableDelete && (
                  <td className="text-center">
                    {tableData.length > minRows && (
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaRegTrashAlt />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
