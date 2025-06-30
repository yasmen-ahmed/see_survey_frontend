import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import DynamicTable from "../../DynamicTable";

const ACPanelForm = () => {
  const { sessionId } = useParams();
  const [formData, setFormData] = useState({
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbType: "",
    hasFreeCBs: false,
    free_cb_spaces: "",
    cb_fuse_data: [],
    images: {
      ac_panel_photo_overview: null,
      ac_panel_photo_closed: null,
      ac_panel_photo_opened: null,
      ac_panel_cbs_photo: null,
      ac_panel_free_cb: null,
      proposed_ac_cb_photo: null,
      ac_cable_route_photo_1: null,
      ac_cable_route_photo_2: null,
      ac_cable_route_photo_3: null
    }
  });

  // Configuration for the dynamic table rows
  const tableRows = [
    {
      key: 'rating',
      label: 'CB/fuse rating (Amp)',
      type: 'number',
      placeholder: 'Add rating...'
    },
    {
      key: 'connected_module',
      label: 'Name of connected module',
      type: 'textarea',
      placeholder: 'Module name'
    }
  ];

  // Handle table data changes
  const handleTableDataChange = useCallback((newTableData) => {
    if (!newTableData) {
      setFormData(prev => ({
        ...prev,
        cb_fuse_data: []
      }));
      return;
    }

    const processedData = newTableData
      .filter(item => {
        const rating = item.rating?.toString().trim() || '';
        const module = item.connected_module?.toString().trim() || '';
        return rating !== '' || module !== '';
      })
      .map(item => ({
        rating: parseFloat(item.rating) || 0,
        connected_module: item.connected_module?.trim() || ""
      }));
    
    setFormData(prev => ({
      ...prev,
      cb_fuse_data: processedData
    }));
  }, []);

  // Transform cb_fuse_data to table format
  const getTableData = useCallback(() => {
    if (!Array.isArray(formData.cb_fuse_data)) {
      return [];
    }
    return formData.cb_fuse_data.map((item, index) => ({
      id: index + 1,
      rating: item.rating?.toString() || "",
      connected_module: item.connected_module || ""
    }));
  }, [formData.cb_fuse_data]);

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

  // Fetch existing data when component loads
  useEffect(() => {
    if (!sessionId) return;

    axios.get(`${import.meta.env.VITE_API_URL}/api/ac-panel/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);

        if (data) {
          const updatedFormData = {
            cableLength: data.power_cable_config?.length?.toString() || "",
            crossSection: data.power_cable_config?.cross_section?.toString() || "",
            mainCBRating: data.main_cb_config?.rating?.toString() || "",
            cbType: normalizeDisplayValue(data.main_cb_config?.type) || "",
            hasFreeCBs: Boolean(data.has_free_cbs),
            free_cb_spaces: data.free_cb_spaces?.toString() || "",
            cb_fuse_data: data.cb_fuse_data || [],
            images: {
              ac_panel_photo_overview: null,
              ac_panel_photo_closed: null,
              ac_panel_photo_opened: null,
              ac_panel_cbs_photo: null,
              ac_panel_free_cb: null,
              proposed_ac_cb_photo: null,
              ac_cable_route_photo_1: null,
              ac_cable_route_photo_2: null,
              ac_cable_route_photo_3: null
            }
          };

          // Process existing images
          if (data.images && data.images.length > 0) {
            data.images.forEach(image => {
              const imageUrl = image.file_url.startsWith('http') 
                ? image.file_url 
                : `${import.meta.env.VITE_API_URL}${image.file_url}`;
              
              if (updatedFormData.images.hasOwnProperty(image.image_category)) {
                updatedFormData.images[image.image_category] = {
                  preview: imageUrl,
                  existingUrl: imageUrl
                };
              }
            });
          }

          setFormData(updatedFormData);
        }
      })
      .catch(err => {
        console.error("Error loading AC panel data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [name]: {
          file: file,
          preview: file ? URL.createObjectURL(file) : prev.images[name]?.preview,
          existingUrl: prev.images[name]?.existingUrl
        }
      }
    }));
  };

  const images = [
    { label: 'AC Panel photo overview', name: 'ac_panel_photo_overview', value: formData.images.ac_panel_photo_overview?.preview || formData.images.ac_panel_photo_overview?.existingUrl },
    { label: 'AC Panel photo closed', name: 'ac_panel_photo_closed', value: formData.images.ac_panel_photo_closed?.preview || formData.images.ac_panel_photo_closed?.existingUrl },
    { label: 'AC Panel photo opened', name: 'ac_panel_photo_opened', value: formData.images.ac_panel_photo_opened?.preview || formData.images.ac_panel_photo_opened?.existingUrl },
    { label: 'AC Panel CBs photo', name: 'ac_panel_cbs_photo', value: formData.images.ac_panel_cbs_photo?.preview || formData.images.ac_panel_cbs_photo?.existingUrl },
    { label: 'AC panel free CB', name: 'ac_panel_free_cb', value: formData.images.ac_panel_free_cb?.preview || formData.images.ac_panel_free_cb?.existingUrl },
    { label: 'Proposed AC CB photo', name: 'proposed_ac_cb_photo', value: formData.images.proposed_ac_cb_photo?.preview || formData.images.proposed_ac_cb_photo?.existingUrl },
    { label: 'AC cable Route Photo to cable tray 1/3', name: 'ac_cable_route_photo_1', value: formData.images.ac_cable_route_photo_1?.preview || formData.images.ac_cable_route_photo_1?.existingUrl },
    { label: 'AC cable Route Photo to cable tray 2/3', name: 'ac_cable_route_photo_2', value: formData.images.ac_cable_route_photo_2?.preview || formData.images.ac_cable_route_photo_2?.existingUrl },
    { label: 'AC cable Route Photo to cable tray 3/3', name: 'ac_cable_route_photo_3', value: formData.images.ac_cable_route_photo_3?.preview || formData.images.ac_cable_route_photo_3?.existingUrl }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Ensure cb_fuse_data is an array
    const cb_fuse_data = Array.isArray(formData.cb_fuse_data) ? formData.cb_fuse_data : [];

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
      cb_fuse_data: cb_fuse_data,
      has_free_cbs: formData.hasFreeCBs,
      free_cb_spaces: parseInt(formData.free_cb_spaces) || 0
    };

    // Add data fields to FormData
    Object.entries(payload).forEach(([key, value]) => {
      formDataToSend.append(key, JSON.stringify(value));
    });

    // Add images if they exist
    Object.entries(formData.images).forEach(([category, imageData]) => {
      if (imageData?.file) {
        formDataToSend.append(category, imageData.file);
      }
    });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/ac-panel/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      showSuccess('AC Panel data submitted successfully!');
      console.log("Response:", response.data);

      // Update the form with the new data including new image URLs
      if (response.data.data) {
        const newData = response.data.data;
        if (newData.images) {
          setFormData(prev => ({
            ...prev,
            images: {
              ...prev.images,
              ...Object.fromEntries(
                newData.images.map(img => [
                  img.image_category,
                  {
                    file: null,
                    preview: img.file_url.startsWith('http') 
                      ? img.file_url 
                      : `${import.meta.env.VITE_API_URL}${img.file_url}`,
                    existingUrl: img.file_url.startsWith('http') 
                      ? img.file_url 
                      : `${import.meta.env.VITE_API_URL}${img.file_url}`
                  }
                ])
              )
            }
          }));
        }
      }
    } catch (err) {
      console.error("Error:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
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

        <DynamicTable
          title="AC panel CBs ratings & connected loads"
          rows={tableRows}
          initialData={getTableData()}
          onChange={handleTableDataChange}
          minColumns={1}
          autoExpand={true}
          enableDragDrop={true}
          enableDelete={true}
          className=""
          tableClassName="w-full border border-gray-300"
          headerClassName="bg-gray-200"
          cellClassName="border px-2 py-2"
          labelClassName="border px-4 py-2 font-semibold bg-gray-50"
        />

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
      <ImageUploader 
        images={images}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default ACPanelForm;
