import { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';

const initialFpfhForm = {
  installationType: '',
  proposedLocation: '',
  baseHeight: '',
  towerLeg: '',
  dcPowerSource: '',
  dcDistribution: '',
  ethernetLength: '',
  dcCableLength: '',
  earthBusExists: '',
  earthCableLength: '',
};

export const useFpfhForm = (sessionId) => {
  const [fpfhCount, setFpfhCount] = useState(1);
  const [fpfhForms, setFpfhForms] = useState(Array(6).fill().map(() => ({ ...initialFpfhForm })));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});

  // Load existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/new-fpfh/${sessionId}`);
        const responseData = response.data;
        
        console.log("Fetched new FPFHs data:", responseData);
        
        if (responseData) {
          // Get count from new_fpfh_installed
          const count = responseData.new_fpfh_installed || 1;
          setFpfhCount(count);
          
          // Map API data to form structure - now handling array
          const newFpfhForms = Array(6).fill().map((_, index) => {
            if (index < responseData.fpfhs?.length) {
              // Map each FPFH from the array
              const fpfhData = responseData.fpfhs[index];
              return {
                installationType: fpfhData.fpfh_installation_type || '',
                proposedLocation: fpfhData.fpfh_location || '',
                baseHeight: fpfhData.fpfh_base_height || '',
                towerLeg: fpfhData.fpfh_tower_leg || '',
                dcPowerSource: fpfhData.fpfh_dc_power_source || '',
                dcDistribution: fpfhData.dc_distribution_source || '',
                ethernetLength: fpfhData.ethernet_cable_length || '',
                dcCableLength: fpfhData.dc_power_cable_length || '',
                earthBusExists: fpfhData.earth_bus_bar_exists || '',
                earthCableLength: fpfhData.earth_cable_length || '',
                images: {
                  new_fpfh_proposed_location: fpfhData.images?.filter(img => img.category === 'new_fpfh_proposed_location')?.map(img => ({
                    id: img.id,
                    file_url: img.file_url
                  })) || [],
                  new_fpfh_proposed_location_optional_photo: fpfhData.images?.filter(img => img.category === 'new_fpfh_proposed_location_optional_photo')?.map(img => ({
                    id: img.id,
                    file_url: img.file_url
                  })) || []
                }
              };
            }
            return { ...initialFpfhForm };
          });
          
          setFpfhForms(newFpfhForms);

          // Set up initial images state from response
          const initialImages = {};
          responseData.fpfhs?.forEach((fpfh, index) => {
            if (fpfh.images) {
              fpfh.images.forEach(img => {
                const fpfhNumber = index + 1;
                const imageKey = img.category === `new_fpfh_${fpfhNumber}_proposed_location`
                  ? `new_fpfh_${fpfhNumber}_proposed_location`
                  : `new_fpfh_${fpfhNumber}_proposed_location_optional_photo`;
                
                initialImages[imageKey] = initialImages[imageKey] || [];
                initialImages[imageKey].push({
                  id: img.id,
                  file_url: img.file_url
                });
              });
            }
          });
          setUploadedImages(initialImages);
        }
      } catch (err) {
        console.error("Error loading new FPFHs data:", err);
        if (err.response?.status !== 404) {
          showError('Error loading existing data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleFpfhCountChange = (count) => {
    const newCount = parseInt(count, 10);
    setFpfhCount(newCount);

    // Create new array preserving existing data
    const newFpfhForms = Array(6).fill(null).map((_, index) => {
      if (index < newCount) {
        // Keep existing data for FPFHs within the new count
        return fpfhForms[index] || { ...initialFpfhForm };
      } else {
        // Clear data for FPFHs beyond the new count
        return { ...initialFpfhForm };
      }
    });

    setFpfhForms(newFpfhForms);

    // Clean up images for removed FPFHs
    setUploadedImages(prev => {
      const newImages = { ...prev };
      Object.keys(newImages).forEach(key => {
        const fpfhNumber = parseInt(key.match(/\d+/)[0]);
        if (fpfhNumber > newCount) {
          delete newImages[key];
        }
      });
      return newImages;
    });
  };

  const handleChange = (fpfhIndex, field, value) => {
    setFpfhForms(prev => {
      const updated = [...prev];
      const fpfh = { ...updated[fpfhIndex] }; // Clone the specific FPFH object

      // Handle image changes differently
      if (field.startsWith('images.')) {
        const imageCategory = field.split('.')[1];
        fpfh.images = {
          ...fpfh.images,
          [imageCategory]: value
        };
      } else {
        fpfh[field] = value;

        // Clear dependent fields when changing certain values
        if (field === 'proposedLocation' && value !== 'On tower') {
          fpfh.baseHeight = '';
          fpfh.towerLeg = '';
        }
        
        if (field === 'dcPowerSource' && value !== 'from the existing rectifier cabinet') {
          fpfh.dcDistribution = '';
        }

        if (field === 'earthBusExists' && value !== 'Yes') {
          fpfh.earthCableLength = '';
        }
      }

      updated[fpfhIndex] = fpfh; // Replace with updated FPFH object

      return updated;
    });

    // Clear error for this field
    const errorKey = `${fpfhIndex}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fpfhForms.slice(0, fpfhCount).forEach((fpfh, index) => {
      if (!fpfh.installationType) {
        newErrors[`${index}.installationType`] = 'Please select installation type';
      }
      if (!fpfh.proposedLocation) {
        newErrors[`${index}.proposedLocation`] = 'Please select proposed location';
      }
      if (!fpfh.dcPowerSource) {
        newErrors[`${index}.dcPowerSource`] = 'Please select DC power source';
      }
      if (!fpfh.ethernetLength) {
        newErrors[`${index}.ethernetLength`] = 'Please enter ethernet cable length';
      }
      if (!fpfh.dcCableLength) {
        newErrors[`${index}.dcCableLength`] = 'Please enter DC cable length';
      }
      if (!fpfh.earthBusExists) {
        newErrors[`${index}.earthBusExists`] = 'Please select earth bus bar option';
      }

      // Validate required images
      const requiredImageKey = `new_fpfh_${index + 1}_proposed_location`;
      if (!uploadedImages[requiredImageKey]?.length) {
        newErrors[requiredImageKey] = 'Please upload proposed location photo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {


    setIsSubmitting(true);
    console.log('Starting form submission...');

    try {
      const formData = new FormData();
      
      // Add the form data
      const submitData = {
        new_fpfh_installed: fpfhCount,
        fpfhs: fpfhForms.slice(0, fpfhCount).map((fpfh, index) => ({
          fpfh_index: index + 1,
          fpfh_installation_type: fpfh.installationType || '',
          fpfh_location: fpfh.proposedLocation || '',
          fpfh_base_height: fpfh.baseHeight ? parseFloat(fpfh.baseHeight) : null,
          fpfh_tower_leg: fpfh.towerLeg || null,
          fpfh_dc_power_source: fpfh.dcPowerSource || '',
          dc_distribution_source: fpfh.dcDistribution || '',
          ethernet_cable_length: fpfh.ethernetLength ? parseFloat(fpfh.ethernetLength) : null,
          dc_power_cable_length: fpfh.dcCableLength ? parseFloat(fpfh.dcCableLength) : null,
          earth_bus_bar_exists: fpfh.earthBusExists || '',
          earth_cable_length: fpfh.earthCableLength ? parseFloat(fpfh.earthCableLength) : null,
        }))
      };

      console.log('Form data prepared:', submitData);
      formData.append('data', JSON.stringify(submitData));

      // Append all images
      Object.entries(uploadedImages).forEach(([key, files]) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file instanceof File) {
            console.log('Appending file:', key, file.name);
            formData.append(key, file);
          }
        }
      });

      console.log('Making API request...');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/new-fpfh/${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('API response received:', response.data);

      if (response.data.results) {
        // Update the form data with the response
        const newFpfhForms = Array(6).fill().map((_, index) => {
          if (index < response.data.results.length) {
            const fpfhData = response.data.results[index].data;
            return {
              installationType: fpfhData.fpfh_installation_type || '',
              proposedLocation: fpfhData.fpfh_location || '',
              baseHeight: fpfhData.fpfh_base_height || '',
              towerLeg: fpfhData.fpfh_tower_leg || '',
              dcPowerSource: fpfhData.fpfh_dc_power_source || '',
              dcDistribution: fpfhData.dc_distribution_source || '',
              ethernetLength: fpfhData.ethernet_cable_length || '',
              dcCableLength: fpfhData.dc_power_cable_length || '',
              earthBusExists: fpfhData.earth_bus_bar_exists || '',
              earthCableLength: fpfhData.earth_cable_length || '',
              images: fpfhData.images?.reduce((acc, img) => {
                const fpfhNumber = img.fpfh_index || 1; // Default to 1 if not specified
                let imageKey;

                // Log the raw image data
                console.log('Raw image data:', img);

                // Match exactly with the backend category structure
                if (img.category == `new_fpfh_${fpfhNumber}_proposed_location`) {
                  imageKey = `new_fpfh_${fpfhNumber}_proposed_location`;
                } else {
                  imageKey = `new_fpfh_${fpfhNumber}_proposed_location_optional_photo`;
                }

                // Log the assigned key and URL
                console.log('Image processing:', {
                  category: img.category,
                  assignedKey: imageKey,
                  fileUrl: img.file_url
                });

                // Initialize array if needed
                acc[imageKey] = acc[imageKey] || [];
                
                // Add the image with consistent URL structure
                acc[imageKey].push({
                  id: img.id,
                  url: `${import.meta.env.VITE_API_URL}/${img.file_url}`,
                  file_url: img.file_url,
                  category: img.category // Keep the original category
                });

                return acc;
              }, {})
            };
          }
          return { ...initialFpfhForm };
        });
        
        setFpfhForms(newFpfhForms);

        // Update uploaded images state
        const newUploadedImages = {};
        response.data.results.forEach((result, index) => {
          if (result.data.images) {
            result.data.images.forEach(img => {
              const fpfhNumber = index + 1;
              const imageKey = img.category === 'new_fpfh_proposed_location' 
                ? `new_fpfh_${fpfhNumber}_proposed_location`
                : `new_fpfh_${fpfhNumber}_proposed_location_optional_photo`;
              
              newUploadedImages[imageKey] = newUploadedImages[imageKey] || [];
              newUploadedImages[imageKey].push({
                id: img.id,
                file_url: img.file_url
              });
            });
          }
        });
        setUploadedImages(newUploadedImages);
      }

      showSuccess('FPFHs saved successfully');
    } catch (err) {
      console.error('Error saving FPFHs:', err);
      showError('Error saving FPFHs');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fpfhCount,
    fpfhForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleFpfhCountChange,
    handleChange,
    handleSubmit,
  };
}; 