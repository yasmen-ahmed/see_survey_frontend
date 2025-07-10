import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialMwForm = {
  siteDirection: '',
  mwOduType: '',
  mwOduTypeOther: '',
  mwOduDiameter: '',
  mwOduHeight: '',
  mwOduAzimuth: '',
  mwOduRequiredMount: '',
  mwOduPowerCableLength: '',
  mwOduPowerSource: '',
  mwOduFiberLength: '',
  mwOduTowerLeg: '',
  iduMwUnitType: '',
  iduMwPowerCableLength: '',
  iduProposedLocation: ''
};

const useMwForm = (sessionId) => {
  const [mwCount, setMwCount] = useState(1);
  const [mwForms, setMwForms] = useState([{ ...initialMwForm }]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleMwCountChange = useCallback((count) => {
    const newCount = parseInt(count, 10);
    if (newCount >= 1 && newCount <= 5) {
      setMwCount(newCount);
      setMwForms(prevForms => {
        const newForms = [...prevForms];
        if (newCount > prevForms.length) {
          // Add new forms
          for (let i = prevForms.length; i < newCount; i++) {
            newForms.push({ ...initialMwForm });
          }
        } else {
          // Remove excess forms
          newForms.splice(newCount);
        }
        return newForms;
      });
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleChange = useCallback((index, field, value) => {
    setMwForms(prevForms => {
      const newForms = [...prevForms];
      newForms[index] = {
        ...newForms[index],
        [field]: value
      };
      return newForms;
    });
    setHasUnsavedChanges(true);
  }, []);

  const validateForms = useCallback(() => {
    const newErrors = {};
    mwForms.forEach((form, index) => {
      const formErrors = {};
      if (!form.siteDirection) {
        formErrors.siteDirection = 'Site direction is required';
      }
      if (!form.mwOduType) {
        formErrors.mwOduType = 'MW ODU type is required';
      }
      if (form.mwOduType === 'Other' && !form.mwOduTypeOther) {
        formErrors.mwOduTypeOther = 'Please specify the MW ODU type';
      }
      if (!form.mwOduDiameter) {
        formErrors.mwOduDiameter = 'MW ODU diameter is required';
      }
      if (!form.mwOduHeight) {
        formErrors.mwOduHeight = 'MW ODU height is required';
      }
      if (!form.mwOduAzimuth) {
        formErrors.mwOduAzimuth = 'MW ODU Azimuth is required';
      }
      if (form.mwOduAzimuth && (form.mwOduAzimuth < 0 || form.mwOduAzimuth > 360)) {
        formErrors.mwOduAzimuth = 'Azimuth must be between 0 and 360 degrees';
      }
      
      if (Object.keys(formErrors).length > 0) {
        newErrors[index] = formErrors;
      }
    });
    return newErrors;
  }, [mwForms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForms();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data to be sent:', mwForms);
      setHasUnsavedChanges(false);
      toast.success('MW configuration saved successfully');
      console.log('Submitted MW data:', mwForms);
    } catch (error) {
      console.error('Error saving MW data:', error);
      toast.error('Failed to save MW configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    mwCount,
    mwForms,
    errors,
    isLoading,
    isSubmitting,
    uploadedImages,
    setUploadedImages,
    handleMwCountChange,
    handleChange,
    handleSubmit,
    hasUnsavedChanges
  };
};

export default useMwForm; 