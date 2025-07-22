import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/notifications";
import ImageUploader from "../../GalleryComponent";
import { FaRegTrashAlt } from "react-icons/fa";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const PowerMeterForm = () => {
  const { sessionId } = useParams();

  const [formData, setFormData] = useState({
    serialNumber: "",
    meterReading: "",
    powerSourceType: "",
    cableLength: "",
    crossSection: "",
    mainCBRating: "",
    cbType: "",
    // Electrical measurements fields
    existingPhase1Voltage: "",
    existingPhase2Voltage: "",
    existingPhase3Voltage: "",
    existingPhase1Current: "",
    existingPhase2Current: "",
    existingPhase3Current: "",
    sharingPhase1Current: "",
    sharingPhase2Current: "",
    sharingPhase3Current: "",
    phaseToPhaseL1L2: "",
    phaseToPhaseL1L3: "",
    phaseToPhaseL2L3: "",
    earthingToNeutralVoltage: ""
  });

  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingApi,setLoadingApi] =useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Function to save data via API
  const saveDataToAPI = async () => {
    if (!hasUnsavedChanges) return true;
    
    try {
      setLoadingApi(true);
      const formDataToSend = new FormData();

      // Build the payload to match the expected API structure
      const payload = {
        serial_number: formData.serialNumber || '',
        meter_reading: formData.meterReading ? parseFloat(formData.meterReading) : null,
        ac_power_source_type: formData.powerSourceType ? normalizeApiValue(formData.powerSourceType) : null,
        // Electrical measurements
        electrical_measurements: {
          existing_phase_1_voltage: formData.existingPhase1Voltage ? parseFloat(formData.existingPhase1Voltage) : null,
          existing_phase_2_voltage: formData.existingPhase2Voltage ? parseFloat(formData.existingPhase2Voltage) : null,
          existing_phase_3_voltage: formData.existingPhase3Voltage ? parseFloat(formData.existingPhase3Voltage) : null,
          existing_phase_1_current: formData.existingPhase1Current ? parseFloat(formData.existingPhase1Current) : null,
          existing_phase_2_current: formData.existingPhase2Current ? parseFloat(formData.existingPhase2Current) : null,
          existing_phase_3_current: formData.existingPhase3Current ? parseFloat(formData.existingPhase3Current) : null,
          sharing_phase_1_current: formData.sharingPhase1Current ? parseFloat(formData.sharingPhase1Current) : null,
          sharing_phase_2_current: formData.sharingPhase2Current ? parseFloat(formData.sharingPhase2Current) : null,
          sharing_phase_3_current: formData.sharingPhase3Current ? parseFloat(formData.sharingPhase3Current) : null,
          phase_to_phase_l1_l2: formData.phaseToPhaseL1L2 ? parseFloat(formData.phaseToPhaseL1L2) : null,
          phase_to_phase_l1_l3: formData.phaseToPhaseL1L3 ? parseFloat(formData.phaseToPhaseL1L3) : null,
          phase_to_phase_l2_l3: formData.phaseToPhaseL2L3 ? parseFloat(formData.phaseToPhaseL2L3) : null,
          earthing_to_neutral_voltage: formData.earthingToNeutralVoltage ? parseFloat(formData.earthingToNeutralVoltage) : null
        }
      };

      // Only add power_cable_config if either length or cross_section has a value
      if (formData.cableLength || formData.crossSection) {
        payload.power_cable_config = {
          length: formData.cableLength ? parseFloat(formData.cableLength) : null,
          cross_section: formData.crossSection ? parseFloat(formData.crossSection) : null
        };
      }

      // Only add main_cb_config if either rating or type has a value
      if (formData.mainCBRating || formData.cbType) {
        payload.main_cb_config = {
          rating: formData.mainCBRating ? parseFloat(formData.mainCBRating) : null,
          type: formData.cbType ? normalizeApiValue(formData.cbType) : null
        };
      }

      // Add data fields to FormData
      formDataToSend.append('data', JSON.stringify(payload));

      // Add images if they exist
      images.forEach(imageField => {
        const imageFiles = uploadedImages[imageField.name];
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          const file = imageFiles[0];
          if (file instanceof File) {
            formDataToSend.append(imageField.name, file);
          }
        }
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setHasUnsavedChanges(false);
      showSuccess('Data saved successfully!');
      return true;
    } catch (err) {
      console.error("Error saving data:", err);
      showError('Error saving data. Please try again.');
      return false;
    } finally {
      setLoadingApi(false);
    }
  };

  // Use the unsaved changes hook
  useUnsavedChanges(hasUnsavedChanges, saveDataToAPI);

  // Fetch existing data when component loads
  useEffect(() => {
    if (!sessionId) return;

    setIsInitialLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/power-meter/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched data:", data);
        
        if (data) {
          setFormData({
            serialNumber: data.serial_number || "",
            meterReading: data.meter_reading || "",
            powerSourceType: normalizeRadioValue(data.ac_power_source_type) || "",
            cableLength: data.power_cable_config?.length || "",
            crossSection: data.power_cable_config?.cross_section || "",
            mainCBRating: data.main_cb_config?.rating || "",
            cbType: normalizeRadioValue(data.main_cb_config?.type) || "",
            // Electrical measurements
            existingPhase1Voltage: data.electrical_measurements?.existing_phase_1_voltage || "",
            existingPhase2Voltage: data.electrical_measurements?.existing_phase_2_voltage || "",
            existingPhase3Voltage: data.electrical_measurements?.existing_phase_3_voltage || "",
            existingPhase1Current: data.electrical_measurements?.existing_phase_1_current || "",
            existingPhase2Current: data.electrical_measurements?.existing_phase_2_current || "",
            existingPhase3Current: data.electrical_measurements?.existing_phase_3_current || "",
            sharingPhase1Current: data.electrical_measurements?.sharing_phase_1_current || "",
            sharingPhase2Current: data.electrical_measurements?.sharing_phase_2_current || "",
            sharingPhase3Current: data.electrical_measurements?.sharing_phase_3_current || "",
            phaseToPhaseL1L2: data.electrical_measurements?.phase_to_phase_l1_l2 || "",
            phaseToPhaseL1L3: data.electrical_measurements?.phase_to_phase_l1_l3 || "",
            phaseToPhaseL2L3: data.electrical_measurements?.phase_to_phase_l2_l3 || "",
            earthingToNeutralVoltage: data.electrical_measurements?.earthing_to_neutral_voltage || ""
          });

          // Process existing images
          if (data.images && data.images.length > 0) {
            const processedImages = {};
            data.images.forEach(image => {
              processedImages[image.image_category] = [{
                id: image.id,
                file_url: image.file_url,
                name: image.original_filename
              }];
            });
            setUploadedImages(processedImages);
          }
        }

        // Reset unsaved changes flag after loading data
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Error loading power meter data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
        // Reset unsaved changes flag even on error
        setHasUnsavedChanges(false);
        setIsInitialLoading(false);
      });
  }, [sessionId]);

  // Clear Phase 2, Phase 3, and Phase-to-Phase values when switching to Single phase
  useEffect(() => {
    if (formData.powerSourceType === 'Single phase') {
      setFormData(prev => ({
        ...prev,
        existingPhase2Voltage: "",
        existingPhase3Voltage: "",
        existingPhase2Current: "",
        existingPhase3Current: "",
        sharingPhase2Current: "",
        sharingPhase3Current: "",
        phaseToPhaseL1L2: "",
        phaseToPhaseL1L3: "",
        phaseToPhaseL2L3: ""
      }));
    }
  }, [formData.powerSourceType]);

  // Helper functions for value normalization
  const normalizeRadioValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'three_phase': 'Three phase',
      'single_phase': 'Single phase'
    };
    return valueMap[value] || value;
  };

  const normalizeApiValue = (value) => {
    if (!value) return '';
    const valueMap = {
      'Three phase': 'three_phase',
      'Single phase': 'single_phase'
    };
    return valueMap[value] || value.toLowerCase().replace(' ', '_');
  };

  const handleChange = (e) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (imageCategory, files) => {
    if (isInitialLoading) return; // Don't set unsaved changes during initial load
    
    setHasUnsavedChanges(true);
    console.log(`Images uploaded for ${imageCategory}:`, files);
    setUploadedImages(prev => ({
      ...prev,
      [imageCategory]: files
    }));
  };

  // Generate electrical measurement images based on power source type
  const generateElectricalImages = () => {
    const baseImages = [
    { label: 'Power meter photo overview', name: 'power_meter_photo_overview' },
    { label: 'Power meter photo zoomed', name: 'power_meter_photo_zoomed' },
    { label: 'Power meter CB photo', name: 'power_meter_cb_photo' },
      { label: 'Power meter cable route photo', name: 'power_meter_cable_route_photo' }
    ];

    if (formData.powerSourceType === 'Three phase') {
      // All electrical measurement images for three phase
      const electricalImages = [
        { label: 'Phase to phase voltage (V) L1 L2', name: 'phase_to_phase_voltage_l1_l2' },
        { label: 'Phase to phase voltage (V) L1 L3', name: 'phase_to_phase_voltage_l1_l3' },
        { label: 'Phase to phase voltage (V) L2 L3', name: 'phase_to_phase_voltage_l2_l3' },
        { label: 'Existing Phase 1 Voltage (V)', name: 'existing_phase_1_voltage' },
        { label: 'Existing Phase 2 Voltage (V)', name: 'existing_phase_2_voltage' },
        { label: 'Existing Phase 3 Voltage (V)', name: 'existing_phase_3_voltage' },
        { label: 'Existing Phase 1 current (A)', name: 'existing_phase_1_current' },
        { label: 'Existing Phase 2 current (A)', name: 'existing_phase_2_current' },
        { label: 'Existing Phase 3 current (A)', name: 'existing_phase_3_current' },
        { label: 'Sharing Phase 1 current (A)', name: 'sharing_phase_1_current' },
        { label: 'Sharing Phase 2 current (A)', name: 'sharing_phase_2_current' },
        { label: 'Sharing Phase 3 current (A)', name: 'sharing_phase_3_current' },
        { label: 'Earthing to Neutral Voltage (V)', name: 'earthing_to_neutral_voltage' }
      ];
      return [...baseImages, ...electricalImages];
    } else if (formData.powerSourceType === 'Single phase') {
      // Only red-highlighted images for single phase
      const singlePhaseImages = [
        { label: 'Existing Phase 1 Voltage (V)', name: 'existing_phase_1_voltage' },
        { label: 'Existing Phase 1 current (A)', name: 'existing_phase_1_current' },
        { label: 'Sharing Phase 1 current (A)', name: 'sharing_phase_1_current' },
        { label: 'Earthing to Neutral Voltage (V)', name: 'earthing_to_neutral_voltage' }
      ];
      return [...baseImages, ...singlePhaseImages];
    }
    
    return baseImages;
  };

  const images = generateElectricalImages();
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const saved = await saveDataToAPI();
      if (saved) {
        showSuccess('Power meter data submitted successfully!');
      }
    } catch (err) {
      console.error("Error:", err);
      showError('Error submitting data. Please try again.');
    }
  };

  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
    <div className="bg-white p-3 rounded-xl shadow-md w-[80%] h-full flex flex-col"> 
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
        <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Serial Number</label>
            <input
              type="number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Power Meter Reading</label>
            <input
              type="number"
              step="0.01"
              name="meterReading"
              value={formData.meterReading}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">AC Power Source Type</label>
            <div className="flex gap-6">
              {["Three phase", "Single phase"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="powerSourceType"
                    value={type}
                    checked={formData.powerSourceType === type}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Electrical Measurements Section */}
          {formData.powerSourceType && (
            <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-blue-700">Electrical Measurements</h3>
              
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voltage Measurements */}
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold  ">Voltage Measurements (V)</h4>
                  
                  {formData.powerSourceType === 'Three phase' ? (
                   <div className="flex justify-between gap-4">
                     
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase1Voltage"
                          value={formData.existingPhase1Voltage}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 1 voltage"
                        />
                     
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase2Voltage"
                          value={formData.existingPhase2Voltage}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="phase 2 voltage"
                        />
                      
                     
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase3Voltage"
                          value={formData.existingPhase3Voltage}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 3 voltage"
                        />
                   
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        name="existingPhase1Voltage"
                        value={formData.existingPhase1Voltage}
                        onChange={handleChange}
                        className="form-input "
                        placeholder="phase 1 voltage"
                      />
                    </div>
                  )}
                </div>

                {/* Current Measurements */}
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold ">Existing Current Measurements (A)</h4>
                  
                  {formData.powerSourceType === 'Three phase' ? (
                    <div className="flex justify-between gap-4">
                    
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase1Current"
                          value={formData.existingPhase1Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 1 current"
                        />
                  
                     
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase2Current"
                          value={formData.existingPhase2Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 2 current"
                        />
                    
                     
                        <input
                          type="number"
                          step="0.1"
                          name="existingPhase3Current"
                          value={formData.existingPhase3Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 3 current"
                        />
                      
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        name="existingPhase1Current"
                        value={formData.existingPhase1Current}
                        onChange={handleChange}
                        className="form-input "
                        placeholder="phase 1 current"
                      />
                    </div>
                  )}
                </div>

                {/* Sharing Current Measurements */}
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold  mb-3">Sharing Current Measurements (A)</h4>
                  
                  {formData.powerSourceType === 'Three phase' ? (
                    <div className="flex justify-between gap-4">
                    
                        <input
                          type="number"
                          step="0.1"
                          name="sharingPhase1Current"
                          value={formData.sharingPhase1Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 1 current"
                        />
                   
                        <input
                          type="number"
                          step="0.1"
                          name="sharingPhase2Current"
                          value={formData.sharingPhase2Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 2 current"
                        />
               
                        <input
                          type="number"
                          step="0.1"
                          name="sharingPhase3Current"
                          value={formData.sharingPhase3Current}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase 3 current"
                        />
                    
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        name="sharingPhase1Current"
                        value={formData.sharingPhase1Current}
                        onChange={handleChange}
                        className="form-input "
                        placeholder="phase 1 current"
                      />
                    </div>
                  )}
                </div>

                {/* Phase to Phase Voltage Measurements - Only for Three Phase */}
                {formData.powerSourceType === 'Three phase' && (
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-3">Phase to Phase Voltage Measurements (V)</h4>
                    <div className="flex justify-between gap-4">
                     
                       
                        <input
                          type="number"
                          step="0.1"
                          name="phaseToPhaseL1L2"
                          value={formData.phaseToPhaseL1L2}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase to phase voltage (V) L1 L2"
                        />
                      
                        <input
                          type="number"
                          step="0.1"
                          name="phaseToPhaseL1L3"
                          value={formData.phaseToPhaseL1L3}
                          onChange={handleChange}
                          className="form-input "
                          placeholder="phase to phase voltage (V) L1 L3"
                        />
                    
                        <input
                          type="number"
                          step="0.1"
                          name="phaseToPhaseL2L3"
                          value={formData.phaseToPhaseL2L3}
                          onChange={handleChange}
                            className="form-input "
                          placeholder="phase to phase voltage (V) L2 L3"
                        />
                    
                    </div>
                  </div>
                )}

                {/* Earthing to Neutral - Always shown (red highlighted) */}
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold  mb-3">Earthing to Neutral Voltage (V)</h4>
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      name="earthingToNeutralVoltage"
                      value={formData.earthingToNeutralVoltage}
                      onChange={handleChange}
                      className="form-input "
                      placeholder="earthing to neutral voltage (V)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Length of Power Meter Cable (in meters)</label>
            <input
              type="number"
              step="0.1"
              name="cableLength"
              value={formData.cableLength}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Cross Section of Power Cable (in mm²)</label>
            <input
              type="number"
              step="0.1"
              name="crossSection"
              value={formData.crossSection}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Main CB Rating (in Amp)</label>
            <input
              type="number"
              step="0.1"
              name="mainCBRating"
              value={formData.mainCBRating}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-2">Main CB Type (the CB connecting the power meter with AC)</label>
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
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          </div>
          </div>
          <div className="mt-6 flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {loadingApi ? "loading...": "Save"}  
          </button>
       
          </div>

       
        </form>
      </div>
      <ImageUploader 
        images={images}
        onImageUpload={handleImageUpload}
        uploadedImages={uploadedImages}
      />
    </div>
  );
};

export default PowerMeterForm;
