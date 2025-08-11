import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BookImage, Upload, Eye, Download, X } from 'lucide-react';

const Gallery = () => {
  const { sessionId, siteId } = useParams();
  const [galleryData, setGalleryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmptySections, setShowEmptySections] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dieselCount, setDieselCount] = useState(0);
  const [powerSourceType, setPowerSourceType] = useState(''); 
  const [earthBusBarConfig, setEarthBusBarConfig] = useState(0);
  const [freePositionsAvailable, setFreePositionsAvailable] = useState(0);
  const [numberOfCabinets, setNumberOfCabinets] = useState(0);
  const [how_many_base_band_onsite, setHowManyBaseBandOnsite] = useState(0);
  useEffect(() => {
    fetchGalleryData();
  }, [sessionId]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/gallery/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('Gallery API Response:', response.data.data);
        setGalleryData(response.data.data.sections);
        setDieselCount(response.data.data.diesel_count);
        setPowerSourceType(response.data.data.ac_power_source_type);
        setEarthBusBarConfig(response.data.data.earth_bus_bar_config);  
        setFreePositionsAvailable(response.data.data.free_positions_available); 
        setNumberOfCabinets(response.data.data.number_of_cabinets);
        setHowManyBaseBandOnsite(response.data.data.how_many_base_band_onsite);
      } else {
        setError('Failed to fetch gallery data');
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      setError(error.response?.data?.error || 'Failed to fetch gallery data');
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const downloadImage = async (image) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${image.file_url}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleUpload = (sectionKey, category) => {
    // TODO: Implement image upload functionality
    console.log('Upload clicked for:', sectionKey, category);
  };
  const getDynamicAcConnectionCategories = (count) => {
    const categories = ['generator_photo', 'fuel_tank_photo', 'transformer_photo'];
    for (let i = 1; i <= count; i++) {
      categories.push(`generator_photo_1_${i}`);
      categories.push(`generator_photo_2_${i}`);
    }
    return categories;
  };
  const generateElectricalImages = (powerSourceType) => {
    const baseImages = [
      'power_meter_photo_overview',
      'power_meter_photo_zoomed',
      'power_meter_cb_photo',
      'power_meter_cable_route_photo'
    ];
  
    if (powerSourceType === 'three_phase') {
      const threePhaseImages = [
        'phase_to_phase_voltage_l1_l2',
        'phase_to_phase_voltage_l1_l3',
        'phase_to_phase_voltage_l2_l3',
        'existing_phase_1_voltage',
        'existing_phase_2_voltage',
        'existing_phase_3_voltage',
        'existing_phase_1_current',
        'existing_phase_2_current',
        'existing_phase_3_current',
        'sharing_phase_1_current',
        'sharing_phase_2_current',
        'sharing_phase_3_current',
        'earthing_to_neutral_voltage'
      ];
      return [...baseImages, ...threePhaseImages];
    } else if (powerSourceType === 'single_phase') {
      const singlePhaseImages = [
        'existing_phase_1_voltage',
        'existing_phase_1_current',
        'sharing_phase_1_current',
        'earthing_to_neutral_voltage'
      ];
      return [...baseImages, ...singlePhaseImages];
    }
    return baseImages;
  };
  const generateOutdoorGeneralLayoutCategories = (earthBusBarConfig, freePositionsAvailable) => {
    const categories = ['site_outdoor_location_general_photo', 'sketch_layout_photo', 'surrounding_area_pictures_1', 'surrounding_area_pictures_2', 'surrounding_area_pictures_3','surrounding_area_pictures_4'];
    for (let i = 1; i <= earthBusBarConfig; i++) {
      categories.push(`grounding_bus_bar_photo_1_${i}`);
      categories.push(`grounding_bus_bar_photo_2_${i}`);
    }
    for (let i = 1; i <= freePositionsAvailable; i++) {
      categories.push(`free_position_${i}`);
    }
    return categories;
  };
  const generateOutdoorCabinetsCategories = (numberOfCabinets) => {
    const categories = [];
    for (let i = 1; i <= numberOfCabinets; i++) {
      categories.push(`cabinet_${i}_photo_general_photo`);
      categories.push(`cabinet_${i}_photo_1_4`);
      categories.push(`cabinet_${i}_photo_2_4`);
      categories.push(`cabinet_${i}_photo_3_4`);
      categories.push(`cabinet_${i}_photo_4_4`);
      categories.push(`cabinet_${i}_ran_equipment_photo`);
      categories.push(`cabinet_${i}_air_condition_photo`);
      categories.push(`cabinet_${i}_roxtec_picture_inside_cabinet`);
      categories.push(`cabinet_${i}_roxtec_picture_outside_cabinet`);
      categories.push(`cabinet_${i}_roxtec_picture_inside_cabinet_zoomed`);
      categories.push(`cabinet_${i}_roxtec_picture_outside_cabinet_zoomed`);
    }
    return categories;
  };
  const generateRanEquipmentCategories = (how_many_base_band_onsite) => {
    const categories = [];
    for (let i = 1; i <= how_many_base_band_onsite; i++) {
      categories.push(`bts_${i}_photos_front`);
      categories.push(`bts_${i}_photos_back`);
      categories.push(`bts_${i}_photos_left_side`);
      categories.push(`bts_${i}_photos_right_side`);
    }
    return categories;
  };
  // Define all possible sections and their categories based on actual forms
  const allSections = {
    general_site: {
      name: 'General Site Photos',
      categories: [
        'site_entrance', 'site_id_picture', 'site_map_snapshot', 'site_environment',
        'building_stairs_lift', 'roof_entrance', 'base_station_shelter', 'site_name_shelter',
        'crane_access_street', 'crane_location'
      ]
    },
       ac_connection: {
      name: 'AC Connection',
      categories: getDynamicAcConnectionCategories(dieselCount)
    },
    power_meter: {
      name: 'Power Meter',
      categories: generateElectricalImages(powerSourceType)
    },
    ac_panel: {
      name: 'AC Panel',
      categories: [
        'ac_panel_photo_overview', 'ac_panel_photo_closed', 'ac_panel_photo_opened',
        'ac_panel_cbs_photo', 'ac_panel_free_cb', 'proposed_ac_cb_photo',
        'ac_cable_route_photo_1', 'ac_cable_route_photo_2', 'ac_cable_route_photo_3'
      ]
    },
    outdoor_general_layout: {
      name: 'Outdoor General Layout',
      categories: generateOutdoorGeneralLayoutCategories(earthBusBarConfig, freePositionsAvailable)
    },
    outdoor_cabinets: {
      name: 'Outdoor Cabinets',
      categories: generateOutdoorCabinetsCategories(numberOfCabinets)
    },
    ran_equipment: {
      name: 'RAN Equipment',
      categories: generateRanEquipmentCategories(how_many_base_band_onsite)
    },
    antenna_structure: {
      name: 'Antenna Structure',
      categories: [
        'structure_general_photo', 'structure_legs_photo_1', 'structure_legs_photo_2',
        'structure_legs_photo_3', 'structure_legs_photo_4', 'building_photo', 'north_direction_view'
      ]
    },
    antennas: {
      name: 'Antennas',
      categories: [
        'antenna_1_photo', 'antenna_1_azimuth_view_photo', 'antenna_1_mechanical_tilt_photo'
      ]
    },
    radio_units: {
      name: 'Radio Units',
      categories: [
        'radio_unit_1_photo', 'radio_unit_1_front', 'radio_unit_1_back'
      ]
    },
    dc_power_system: {
      name: 'DC Power System',
      categories: [
        'overall_rectifier_cabinet_photo', 'rectifier_module_photo_1', 'rectifier_module_photo_2',
        'rectifier_module_photo_3', 'free_slots_rectifier_modules', 'rectifier_cb_photos',
        'rectifier_free_cb_photo', 'battery_string_photo_1', 'battery_model_photo', 'battery_cb_photo',
        'rectifier_main_ac_cb_photo', 'pdu_photos', 'pdu_free_cb'
      ]
    },
   
  
    mw_antennas: {
      name: 'MW Antennas',
      categories: [
        'mw_1_photo', 'mw_1_Azimuth_view_photo', 'mw_1_label_photo'
      ]
    },
    transmission_mw: {
      name: 'Transmission MW',
      categories: [
        'odf_photo', 'odf_free_port', 'mw_idu_photo_1', 'mw_idu_cards_photo_1',
        'mw_idu_photo_2', 'mw_idu_cards_photo_2', 'mw_idu_photo_3', 'mw_idu_cards_photo_3'
      ]
    },
   
    external_dc_distribution: {
      name: 'External DC Distribution',
      categories: [
        'pdu_1_photo', 'pdu_2_photo', 'pdu_free_ports_photo'
      ]
    },
    new_antennas: {
      name: 'New Antennas',
      categories: [
        'new_antenna_1_photo', 'new_antenna_1_location', 'new_antenna_1_installation'
      ]
    },
    new_radio_units: {
      name: 'New Radio Units',
      categories: [
        'new_radio_1_photo', 'new_radio_1_location', 'new_radio_1_installation'
      ]
    },
    new_fpfhs: {
      name: 'New FPFHs',
      categories: [
        'new_fpfh_1_photo', 'new_fpfh_1_location', 'new_fpfh_1_installation'
      ]
    },
    new_gps: {
      name: 'New GPS',
      categories: [
        'new_gps_1_photo', 'new_gps_1_location', 'new_gps_1_installation'
      ]
    },
    new_mw: {
      name: 'New MW',
      categories: [
        'new_mw_1_front', 'new_mw_1_back', 'new_mw_1_installation'
      ]
    }
  };


  return (
    <div className="h-full flex items-stretch space-x-2 justify-start bg-gray-100 p-2">
      <div className="bg-white p-3 rounded-xl shadow-md w-full h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          
          {/* Toggle Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowEmptySections(!showEmptySections)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showEmptySections
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showEmptySections ? 'Show Images Uploaded' : 'Show All Images'}
            </button>
          </div>
        </div>

        {/* Gallery Sections */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(allSections).map(([sectionKey, sectionInfo]) => {
            const sectionData = galleryData[sectionKey];
            const hasImages = sectionData && Object.keys(sectionData.images).length > 0;
            
            // Skip empty sections if toggle is off
            if (!showEmptySections && !hasImages) {
              return null;
            }

            return (
              <div key={sectionKey} className="bg-white rounded-lg shadow-sm border mb-6">
                {/* Section Header */}
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {sectionInfo.name}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {sectionInfo.categories
  // Filter out empty categories when toggle is off
  .filter(category => {
    if (!showEmptySections) {
      const images = sectionData?.images?.[category] || [];
      return images.length > 0;
    }
    return true;
  })
  .map((category) => {
    const images = sectionData?.images?.[category] || [];
    const hasImage = images.length > 0;
    const image = hasImage ? images[0] : null;

    return (
      <div
        key={category}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {hasImage ? (
            <>
              <img
                src={`${import.meta.env.VITE_API_URL}${image.file_url}`}
                alt={image.original_filename}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleImageClick(image)}
                onError={(e) => {
                  console.error('Image load error:', e);
                  e.target.src = 'data:image/svg+xml;base64,...';
                }}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(image);
                  }}
                  className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image);
                  }}
                  className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <button
                onClick={() => handleUpload(sectionKey, category)}
                className="flex flex-col items-center justify-center space-y-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Upload Image</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Label */}
        <div className="p-3 bg-blue-500">
          <p className="text-sm font-medium text-white text-center">
            {formatCategoryName(category)}
          </p>
        </div>
      </div>
    );
  })}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-end p-4 border-b">
            
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 "
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="flex flex-col gap-6">
                {/* Image */}
                <div className="flex-1">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${selectedImage.file_url}`}
                    alt={selectedImage.original_filename}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => {
                      console.error('Modal image load error:', e);
                      console.log('Failed URL:', e.target.src);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA5MEgxMjVWMTEwSDc1VjkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>

                {/* Image Details */}
                <div className="w-full space-y-4">
                <div className="w-full space-y-4">
                    <h4 className="font-medium text-gray-900 mb-2">Image Details</h4>
                    <dl className="space-y-2 text-sm flex justify-between items-center">
                      <div>
                        <dt className="text-gray-500">Category:</dt>
                        <dd className="text-gray-900">{formatCategoryName(selectedImage.category)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">File Size:</dt>
                        <dd className="text-gray-900">{(selectedImage.file_size / 1024).toFixed(2)} KB</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Type:</dt>
                        <dd className="text-gray-900">{selectedImage.mime_type}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Uploaded:</dt>
                        <dd className="text-gray-900">
                          {new Date(selectedImage.upload_date).toLocaleDateString()}
                        </dd>
                      </div>
                      {selectedImage.description && (
                        <div>
                          <dt className="text-gray-500">Description:</dt>
                          <dd className="text-gray-900">{selectedImage.description}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => downloadImage(selectedImage)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 