import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/notifications';
import ImageUploader from '../../GalleryComponent';

const TransmissionInformationForm = () => {
  const { sessionId } = useParams();
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [formData, setFormData] = useState({
    type_of_transmission: '',
    existing_transmission_base_band_location: '',
    existing_transmission_equipment_vendor: '',
    existing_odf_location: '',
    cable_length_odf_to_baseband: '',
    odf_fiber_cable_type: '',
    how_many_free_ports_odf: '',
    how_many_mw_link_exist: '',
    mw_links: []
  });

  // Fetch existing data when component loads
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/transmission-mw/${sessionId}`)
      .then(res => {
        const data = res.data.data || res.data;
        console.log("Fetched MW data:", data);

        if (data) {
          // Set number of cabinets from API response (for dynamic cabinet options)
          setNumberOfCabinets(data.numberOfCabinets || 0);

          // Handle both nested (transmissionData) and direct response structures
          const transmissionData = data.transmissionData || data;

          console.log("Transmission data:", transmissionData);
          console.log("MW links data:", transmissionData.mw_links);

          setFormData({
            type_of_transmission: transmissionData.type_of_transmission || '',
            existing_transmission_base_band_location: transmissionData.existing_transmission_base_band_location || '',
            existing_transmission_equipment_vendor: transmissionData.existing_transmission_equipment_vendor || '',
            existing_odf_location: transmissionData.existing_odf_location || '',
            cable_length_odf_to_baseband: transmissionData.cable_length_odf_to_baseband || '',
            odf_fiber_cable_type: transmissionData.odf_fiber_cable_type || '',
            how_many_free_ports_odf: transmissionData.how_many_free_ports_odf || '',
            how_many_mw_link_exist: transmissionData.how_many_mw_link_exist || '',
            mw_links: transmissionData.mw_links || []
          });
        }
      })
      .catch(err => {
        console.error("Error loading MW transmission data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      });
  }, [sessionId]);

  // Debug: Log form data changes
  useEffect(() => {
    console.log("Current form data:", formData);
  }, [formData]);

  // Generate cabinet options based on numberOfCabinets
  const generateCabinetOptions = () => {
    const options = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      options.push(`Existing cabinet #${i}`);
    }
    return options;
  };

  const handleChange = (name, value) => {
    console.log(`Changing ${name} to:`, value);
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // When MW links count changes, update the mw_links array
      if (name === 'how_many_mw_link_exist') {
        const count = parseInt(value) || 0;
        const currentLinks = prev.mw_links || [];
        console.log(`Updating MW links count from ${currentLinks.length} to ${count}`);

        if (count > currentLinks.length) {
          // Add new empty links
          const newLinks = [...currentLinks];
          for (let i = currentLinks.length; i < count; i++) {
            newLinks.push({
              link_id: i + 1,
              located_in: '',
              mw_equipment_vendor: '',
              idu_type: '',
              card_type_model: '',
              destination_site_id: '',
              mw_backhauling_type: '',
              ethernet_ports_used: '',
              ethernet_ports_free: ''
            });
          }
          newFormData.mw_links = newLinks;
          console.log('New MW links array:', newLinks);
        } else if (count < currentLinks.length) {
          // Remove excess links
          newFormData.mw_links = currentLinks.slice(0, count);
          console.log('Trimmed MW links array:', newFormData.mw_links);
        }
      }

      return newFormData;
    });
  };

  const handleMWLinkChange = (linkIndex, fieldName, value) => {
    console.log(`Changing MW link ${linkIndex} field ${fieldName} to:`, value);
    setFormData(prev => ({
      ...prev,
      mw_links: prev.mw_links.map((link, index) =>
        index === linkIndex
          ? { ...link, [fieldName]: value }
          : link
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare the data in the format expected by the API (direct structure, not nested)
      const submitData = {
        type_of_transmission: formData.type_of_transmission,
        existing_transmission_base_band_location: formData.existing_transmission_base_band_location,
        existing_transmission_equipment_vendor: formData.existing_transmission_equipment_vendor,
        existing_odf_location: formData.existing_odf_location,
        cable_length_odf_to_baseband: parseFloat(formData.cable_length_odf_to_baseband) || 0,
        odf_fiber_cable_type: formData.odf_fiber_cable_type,
        how_many_free_ports_odf: parseInt(formData.how_many_free_ports_odf) || 0,
        how_many_mw_link_exist: parseInt(formData.how_many_mw_link_exist) || 0,
        mw_links: formData.mw_links.map((link, index) => ({
          link_id: link.link_id || (index + 1), // Ensure link_id is present
          located_in: link.located_in || '',
          mw_equipment_vendor: link.mw_equipment_vendor || '',
          idu_type: link.idu_type || '',
          card_type_model: link.card_type_model || '',
          destination_site_id: link.destination_site_id || '',
          mw_backhauling_type: link.mw_backhauling_type || '',
          ethernet_ports_used: parseInt(link.ethernet_ports_used) || 0,
          ethernet_ports_free: parseInt(link.ethernet_ports_free) || 0
        }))
      };

      console.log("Submitting data:", submitData);

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/transmission-mw/${sessionId}`, submitData);
      showSuccess('MW transmission data submitted successfully!');
      console.log("Response:", response.data);
    } catch (err) {
      console.error("Error:", err);
      showError(`Error submitting data: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const cabinetOptions = generateCabinetOptions();
  const mwVendors = ['Nokia', 'Ericsson', 'Huawei', 'ZTE', 'NEC', 'Other'];
  const backhaulingTypes = ['Ethernet', 'Fiber'];

  const images = [
    { label: 'MW Equipment Overview Photo', name: 'mw_equipment_overview_photo' },
    { label: 'MW IDU Photo', name: 'mw_idu_photo' },
    { label: 'MW ODU Photo', name: 'mw_odu_photo' },
    { label: 'MW Antenna Photo', name: 'mw_antenna_photo' },
    { label: 'ODF Photo', name: 'odf_photo' },
    { label: 'Cable Management Photo', name: 'cable_management_photo' },
  ];

  return (
    <div className="max-h-screen flex items-start space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-[80%]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='overflow-auto max-h-[670px]'>


            {/* Basic Transmission Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Type of transmission</label>
                <div className='space-x-4'>
                  {['Fiber', 'MW'].map((type) => (
                    <label key={type} className='inline-flex items-center'>
                      <input
                        type='radio'
                        name='type_of_transmission'
                        value={type}
                        checked={formData.type_of_transmission === type}
                        onChange={(e) => handleChange('type_of_transmission', e.target.value)}
                      />
                      <span className='ml-2'>{type}</span>
                    </label>
                  ))}
                </div>
                <hr className='mt-2' />
              </div>

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Existing Transmission base band located in?</label>
                <select
                  className='border p-2 rounded w-full'
                  value={formData.existing_transmission_base_band_location}
                  onChange={(e) => handleChange('existing_transmission_base_band_location', e.target.value)}
                >
                  <option value=''>Select Location</option>
                  {cabinetOptions.map((cabinet) => (
                    <option key={cabinet} value={cabinet}>{cabinet}</option>
                  ))}
                  <option value='Other'>Other</option>
                </select>
                <hr className='mt-2' />
              </div>

              <div className='mb-4'>
                <label className='block font-semibold mb-2'>Existing Transmission equipment vendor</label>
                <select
                  className='border p-2 rounded w-full'
                  value={formData.existing_transmission_equipment_vendor}
                  onChange={(e) => handleChange('existing_transmission_equipment_vendor', e.target.value)}
                >
                  <option value=''>Select Vendor</option>
                  {mwVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
                <hr className='mt-2' />
              </div>

              {/* ODF Questions - Only show when Fiber is selected */}
              {formData.type_of_transmission === 'Fiber' && (
                <>
                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>Existing ODF located in?</label>
                    <select
                      className='border p-2 rounded w-full'
                      value={formData.existing_odf_location}
                      onChange={(e) => handleChange('existing_odf_location', e.target.value)}
                    >
                      <option value=''>Select Location</option>
                      {cabinetOptions.map((cabinet) => (
                        <option key={cabinet} value={cabinet}>{cabinet}</option>
                      ))}
                      <option value='Other'>Other</option>
                    </select>
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>Cable length from ODF to Baseband (cm)</label>
                    <input
                      type='number'
                      step='0.1'
                      className='border p-2 rounded w-full'
                      value={formData.cable_length_odf_to_baseband}
                      onChange={(e) => handleChange('cable_length_odf_to_baseband', e.target.value)}
                      placeholder='25.5'
                    />
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>ODF fiber cable type</label>
                    <div className='space-x-4'>
                      {['LC', 'SC', 'FC'].map((type) => (
                        <label key={type} className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='odf_fiber_cable_type'
                            value={type}
                            checked={formData.odf_fiber_cable_type === type}
                            onChange={(e) => handleChange('odf_fiber_cable_type', e.target.value)}
                          />
                          <span className='ml-2'>{type}</span>
                        </label>
                      ))}
                    </div>
                    <hr className='mt-2' />
                  </div>

                  <div className='mb-4'>
                    <label className='block font-semibold mb-2'>How many free ports on ODF?</label>
                    <select
                      className='border p-2 rounded w-full'
                      value={formData.how_many_free_ports_odf}
                      onChange={(e) => handleChange('how_many_free_ports_odf', e.target.value)}
                    >
                      <option value=''>Select</option>
                      {[...Array(15)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <hr className='mt-2' />
                  </div>
                </>
              )}

              {/* MW Questions - Only show when MW is selected */}
              {formData.type_of_transmission === 'MW' && (
                <div className='mb-4'>
                  <label className='block font-semibold mb-2'>How many MW link exist on site?</label>
                  <select
                    className='border p-2 rounded w-full'
                    value={formData.how_many_mw_link_exist}
                    onChange={(e) => {
                      console.log("Changing number of MW links to:", e.target.value);
                      handleChange('how_many_mw_link_exist', e.target.value);
                    }}
                  >
                    <option value=''>Select</option>
                    {[...Array(20)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <hr className='mt-2' />
                </div>
              )}
            </div>

            {/* Dynamic MW Equipment Table - Only show when MW is selected and links exist */}
            {formData.type_of_transmission === 'MW' && formData.how_many_mw_link_exist && parseInt(formData.how_many_mw_link_exist) > 0 && (
              <div className="">

                <div className="">
                  <table className="table-auto w-full border-collapse">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th
                          className="border px-2 py-3 text-left font-semibold sticky top-0 left-0 bg-blue-500 z-30"
                          style={{ width: '300px', minWidth: '300px', maxWidth: '300px' }}
                        >
                          Field Description
                        </th>
                        {Array.from({ length: parseInt(formData.how_many_mw_link_exist) }, (_, i) => (
                          <th
                            key={i}
                            className="border px-4 py-3 text-center font-semibold min-w-[300px] sticky top-0 bg-blue-500 z-20"
                          >
                            MW Link #{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* Located in? */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Located in?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {[...cabinetOptions, 'Other'].map(option => (
                                <label key={option} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={(link.located_in || '').includes(option)}
                                    onChange={(e) => {
                                      const currentValues = (link.located_in || '').split(',').filter(v => v.trim());
                                      const newValues = e.target.checked
                                        ? [...currentValues, option]
                                        : currentValues.filter(v => v !== option);
                                      handleMWLinkChange(linkIndex, 'located_in', newValues.join(', '));
                                    }}
                                    className="w-4 h-4"
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* MW equipment vendor */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          MW equipment vendor
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <div className="grid grid-cols-3 gap-1">
                              {mwVendors.map(vendor => (
                                <label key={vendor} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="radio"
                                    name={`vendor-${linkIndex}`}
                                    value={vendor}
                                    checked={link.mw_equipment_vendor === vendor}
                                    onChange={(e) => handleMWLinkChange(linkIndex, 'mw_equipment_vendor', e.target.value)}
                                    className="w-4 h-4"
                                  />
                                  {vendor}
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* IDU type */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          IDU type
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <input
                              type="text"
                              value={link.idu_type}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'idu_type', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Enter IDU type..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Card type/model */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Card type/model
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <input
                              type="text"
                              value={link.card_type_model}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'card_type_model', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Enter card type/model..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Destination site ID */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          Destination site ID
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <input
                              type="text"
                              value={link.destination_site_id}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'destination_site_id', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Enter destination site ID..."
                            />
                          </td>
                        ))}
                      </tr>

                      {/* MW backhauling type */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          MW backhauling type
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <div className="flex gap-4">
                              {backhaulingTypes.map(type => (
                                <label key={type} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="radio"
                                    name={`backhaulingType-${linkIndex}`}
                                    value={type}
                                    checked={link.mw_backhauling_type === type}
                                    onChange={(e) => handleMWLinkChange(linkIndex, 'mw_backhauling_type', e.target.value)}
                                    className="w-4 h-4"
                                  />
                                  {type}
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* How many ethernet port used? */}
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          How many ethernet port used?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <select
                              value={link.ethernet_ports_used}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'ethernet_ports_used', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                            >
                              <option value="">Select</option>
                              {[...Array(15)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>

                      {/* How many ethernet port free? */}
                      <tr>
                        <td className="border px-4 py-3 font-semibold sticky left-0 bg-blue-400 text-white z-10">
                          How many ethernet port free?
                        </td>
                        {formData.mw_links.slice(0, parseInt(formData.how_many_mw_link_exist)).map((link, linkIndex) => (
                          <td key={linkIndex} className="border px-2 py-2">
                            <select
                              value={link.ethernet_ports_free}
                              onChange={(e) => handleMWLinkChange(linkIndex, 'ethernet_ports_free', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                            >
                              <option value="">Select</option>
                              {[...Array(15)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 font-semibold"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
      <ImageUploader images={images} />
    </div>
  );
};

export default TransmissionInformationForm;
