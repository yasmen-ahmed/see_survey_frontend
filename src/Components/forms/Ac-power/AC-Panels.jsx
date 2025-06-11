import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import { FaRegTrashAlt } from "react-icons/fa";

const ACPanelForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbType: "",
    hasFreeCBs: Boolean,
    free_cb_spaces: "",
    cb_fuse_data: [],
  });

  // Dynamic table data - starts with one column
  const [tableData, setTableData] = useState([
    { id: 1, rating: "", connected_module: "" }
  ]);

  // Drag and drop state
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);

  // Helper function to normalize display values to API format
  const normalizeApiValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'Three phase': 'three_phase',
      'Single phase': 'single_phase'
    };
    return valueMap[value] || value.toLowerCase().replace(' ', '_');
  };

  // Helper function to normalize API values to display format
  const normalizeDisplayValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'three_phase': 'Three phase',
      'single_phase': 'Single phase'
    };
    return valueMap[value] || value;
  };

  // Helper function to normalize boolean to integer for radio buttons
  const normalizeBooleanToInt = (value) => {
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return value;
  };

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/ac-panel/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          setFormData({
            cableLength: data.power_cable_config?.length || "",
            crossSection: data.power_cable_config?.cross_section || "",
            mainCBRating: data.main_cb_config?.rating || "",
            cbType: normalizeDisplayValue(data.main_cb_config?.type) || "",
            hasFreeCBs: data.has_free_cbs || "",
            free_cb_spaces: data.free_cb_spaces || "",
            cb_fuse_data: data.cb_fuse_data || [],
          });

          // Load table data if available
          if (data.cb_fuse_data && data.cb_fuse_data.length > 0) {
            console.log("Loading table data:", data.cb_fuse_data);
            const loadedTableData = data.cb_fuse_data.map((item, index) => ({
              id: index + 1,
              rating: item.rating?.toString() || "",
              connected_module: item.connected_module || ""
            }));
            // Always ensure there's an empty column at the end
            loadedTableData.push({ id: loadedTableData.length + 1, rating: "", connected_module: "" });
            console.log("Processed table data:", loadedTableData);
            setTableData(loadedTableData);
          }
        }
      })
      .catch(err => {
        console.error("Error loading AC panel data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Debug: Log form data and table data changes
  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("TableData updated:", tableData);
  }, [tableData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {


      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const images = [
    { label: 'Generator photo', name: 'generator_photo' },
    { label: 'Power meter photo overview ', name: 'power_meter_photo_overview' },
    { label: 'Power meter photo zoomed', name: 'power_meter_photo_zoomed' },
    { label: 'Power meter CB photo', name: 'power_meter_cb_photo' },
    { label: 'Power meter cable route photo', name: 'power_meter_cable_route_photo' },
    { label: 'AC Panel photo overview', name: 'ac_panel_photo_overview' },
    { label: 'AC Panel photo closed', name: 'ac_panel_photo_closed' },
    { label: 'AC Panel photo opened', name: 'ac_panel_photo_opened' },
    { label: 'AC Panel CBs photo', name: 'ac_panel_cbs_photo' },
    { label: 'AC panel free CB', name: 'ac_panel_free_cb' },
    { label: 'Proposed AC CB photo', name: 'proposed_ac_cb_photo' },
    { label: 'AC cable Route Photo to cable tray 1/3', name: 'ac_cable_route_photo_1' },
    { label: 'AC cable Route Photo to cable tray 2/3', name: 'ac_cable_route_photo_2' },
    { label: 'AC cable Route Photo to cable tray 3/3', name: 'ac_cable_route_photo_3' },
  ];

  // Handle table input changes
  const handleTableChange = (columnId, field, value) => {
    setTableData(prev => {
      const updated = prev.map(item =>
        item.id === columnId ? { ...item, [field]: value } : item
      );

      // Check if this is the last column and has content
      const isLastColumn = columnId === Math.max(...prev.map(item => item.id));
      const hasContent = value.trim() !== '';

      // If user typed in the last column and it has content, add a new column
      if (isLastColumn && hasContent) {
        const nextId = Math.max(...prev.map(item => item.id)) + 1;
        updated.push({ id: nextId, rating: "", connected_module: "" });
      }

      return updated;
    });
  };

  // Delete a specific column
  const deleteColumn = (columnId) => {
    setTableData(prev => {
      const filtered = prev.filter(item => item.id !== columnId);
      // Always keep at least one column
      return filtered.length > 0 ? filtered : [{ id: 1, rating: "", connected_module: "" }];
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    // Add some visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedColumnIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
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

  // Remove empty columns except the last one
  const cleanupTable = () => {
    setTableData(prev => {
      const nonEmpty = prev.filter((item, index) =>
        item.rating.trim() !== '' || item.connected_module.trim() !== '' || index === prev.length - 1
      );
      return nonEmpty.length > 0 ? nonEmpty : [{ id: 1, rating: "", connected_module: "" }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload to match the expected API structure
    const payload = {
      power_cable_config: {
        length: parseFloat(formData.cableLength) || 0,
        cross_section: parseFloat(formData.crossSection) || 0
      },
      main_cb_config: {
        rating: parseFloat(formData.mainCBRating) || 0,
        type: normalizeApiValue(formData.cbType)
      },
      cb_fuse_data: tableData
        .filter(item => item.rating.trim() !== '' || item.connected_module.trim() !== '')
        .map(item => ({
          rating: parseFloat(item.rating) || 0,
          connected_module: item.connected_module || ""
        })),
      has_free_cbs: formData.hasFreeCBs,
      free_cb_spaces: parseInt(formData.free_cb_spaces) || 0,
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/ac-panel/${sessionId}`, payload);
      showSuccess('AC Panel data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex  items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Length of Power Cable (m)</label>
            <input
              type="number"
              name="cableLength"
              value={formData.cableLength}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Cross Section of Cable (mm²)</label>
            <input
              type="number"
              name="crossSection"
              value={formData.crossSection}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">AC Panel Main CB Rating (Amp)</label>
            <input
              type="number"
              name="mainCBRating"
              value={formData.mainCBRating}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">AC Panel Main CB Type</label>
            <div className="flex gap-6">
              {["Three phase", "Single phase"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="cbType"
                    value={type}
                    checked={formData.cbType === type}
                    onChange={handleChange}
                    className="mr-2"
                    required
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">Does AC Panel Have Free CBs?</label>
            <div className="flex gap-6">
              {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                <label key={label} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasFreeCBs"
                    value={value}
                    checked={formData.hasFreeCBs === value}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "hasFreeCBs",
                          value: e.target.value === "true", // convert string to boolean
                        },
                      })
                    }
                    className="mr-2"
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>


          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              How many free space to add new AC CBs in the panel?
            </label>
            <select
              name="free_cb_spaces"
              value={formData.free_cb_spaces}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

        </form>

        <h3 className="text-xl font-semibold mt-10 mb-3 bg-blue-600 text-white p-3">
          AC panel CBs ratings & connected loads
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2 w-48">CBs/Fuses</th>

                {tableData.map((_, index) => (
                  <th
                    key={index}
                    className={`border px-4 py-2 w-32 relative cursor-move select-none ${draggedColumnIndex === index ? 'bg-blue-200' : ''
                      }`}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    title="Drag to reorder columns"
                  >
                    <div className="flex items-center justify-center gap-2">

                      <span>#{index + 1}</span>
                      {tableData.length > 1 && index < tableData.length - 1 && (
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
              {/* CB/Fuses rating row */}
              <tr>
                <td className="border px-4 py-2 font-semibold bg-gray-50">
                  CB/fuse rating (Amp)
                </td>

                {tableData.map((item, index) => (
                  <td
                    key={`rating-${item.id}`}
                    className={`border px-2 py-2 ${draggedColumnIndex === index ? 'bg-blue-100' : ''
                      }`}
                  >
                    <input
                      type="number"
                      value={item.rating}
                      onChange={(e) => handleTableChange(item.id, 'rating', e.target.value)}
                      onBlur={cleanupTable}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={"Add rating..."}
                    />
                  </td>
                ))}
              </tr>

              {/* Name of connected module row */}
              <tr>
                <td className="border px-4 py-2 font-semibold bg-gray-50">
                  Name of connected module
                </td>

                {tableData.map((item, index) => (
                  <td
                    key={`module-${item.id}`}
                    className={`border px-2 py-2 ${draggedColumnIndex === index ? 'bg-blue-100' : ''
                      }`}
                  >
                    <textarea
                      value={item.connected_module}
                      onChange={(e) => handleTableChange(item.id, 'connected_module', e.target.value)}
                      onBlur={cleanupTable}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden leading-tight"
                      placeholder="Module name"
                      rows={1}
                      onInput={(e) => {
                        e.target.style.height = 'auto'; // Reset height
                        e.target.style.height = `${e.target.scrollHeight}px`; // Grow to fit content
                      }}
                    />

                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
      <ImageUploader images={images} />
    </div>
  );
};

export default ACPanelForm;
