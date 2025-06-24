import { useState, useEffect, useCallback, useRef } from 'react';
import antennaStructureImageService from '../services/antennaStructureImageService';
import { showSuccess, showError } from '../utils/notifications';

/**
 * Custom hook for managing antenna structure images
 * @param {string} sessionId - Session ID
 * @param {boolean} autoLoad - Whether to auto-load data on mount
 * @returns {Object} Image management functions and state
 */
export const useAntennaStructureImages = (sessionId, autoLoad = true) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Data state
  const [antennaStructureData, setAntennaStructureData] = useState(null);
  const [images, setImages] = useState({
    total_images: 0,
    images_by_category: {},
    all_images: [],
    available_categories: []
  });

  // Refs for cleanup
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Safe state update - only update if component is still mounted
   */
  const safeSetState = useCallback((updateFunction) => {
    if (mountedRef.current) {
      updateFunction();
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load antenna structure data with images
   */
  const loadData = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await antennaStructureImageService.getAntennaStructureWithImages(sessionId);
      
      safeSetState(() => {
        setAntennaStructureData(response.data.antennaStructureData);
        setImages(response.data.images || {
          total_images: 0,
          images_by_category: {},
          all_images: [],
          available_categories: []
        });
        setLoading(false);
      });

      return response.data;
    } catch (err) {
      console.error('Failed to load antenna structure data:', err);
      safeSetState(() => {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
      throw err;
    }
  }, [sessionId, safeSetState]);

  /**
   * Upload a single image
   */
  const uploadImage = useCallback(async ({
    file,
    imageCategory,
    description = '',
    onProgress = null
  }) => {
    if (!file || !imageCategory) {
      throw new Error('File and image category are required');
    }

    // Validate file
    const validation = antennaStructureImageService.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Validate category
    if (!antennaStructureImageService.validateImageCategory(imageCategory, images.available_categories)) {
      throw new Error('Invalid image category');
    }

    setUploading(true);
    setError(null);

    // Set initial progress
    const progressKey = `${file.name}_${Date.now()}`;
    if (onProgress) {
      setUploadProgress(prev => ({
        ...prev,
        [progressKey]: 0
      }));
    }

    try {
      const result = await antennaStructureImageService.uploadSingleImage(
        sessionId,
        file,
        imageCategory,
        description
      );

      // Update progress to 100%
      if (onProgress) {
        setUploadProgress(prev => ({
          ...prev,
          [progressKey]: 100
        }));
        
        // Remove progress after delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[progressKey];
            return updated;
          });
        }, 1000);
      }

      // Reload data to get updated images
      await loadData();

      safeSetState(() => {
        setUploading(false);
      });

      showSuccess('Image uploaded successfully');
      return result.data;

    } catch (err) {
      console.error('Upload failed:', err);
      
      // Remove progress on error
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[progressKey];
        return updated;
      });

      safeSetState(() => {
        setError(err.message || 'Failed to upload image');
        setUploading(false);
      });

      showError(`Upload failed: ${err.message || 'Please try again'}`);
      throw err;
    }
  }, [sessionId, images.available_categories, safeSetState, loadData]);

  /**
   * Upload multiple images
   */
  const uploadMultipleImages = useCallback(async ({
    files,
    imageCategory,
    description = '',
    onProgress = null
  }) => {
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    if (!imageCategory) {
      throw new Error('Image category is required');
    }

    // Validate all files
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const validation = antennaStructureImageService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors: validation.errors });
      }
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.join(', ')}`
      ).join('\n');
      throw new Error(`Some files are invalid:\n${errorMessages}`);
    }

    // Validate category
    if (!antennaStructureImageService.validateImageCategory(imageCategory, images.available_categories)) {
      throw new Error('Invalid image category');
    }

    setUploading(true);
    setError(null);

    try {
      const result = await antennaStructureImageService.uploadMultipleImages(
        sessionId,
        validFiles,
        imageCategory,
        description
      );

      // Reload data to get updated images
      await loadData();

      safeSetState(() => {
        setUploading(false);
      });

      showSuccess(`${validFiles.length} images uploaded successfully`);
      
      if (invalidFiles.length > 0) {
        showError(`${invalidFiles.length} files were skipped due to validation errors`);
      }

      return result.data;

    } catch (err) {
      console.error('Multiple upload failed:', err);
      safeSetState(() => {
        setError(err.message || 'Failed to upload images');
        setUploading(false);
      });

      showError(`Upload failed: ${err.message || 'Please try again'}`);
      throw err;
    }
  }, [sessionId, images.available_categories, safeSetState, loadData]);

  /**
   * Delete an image
   */
  const deleteImage = useCallback(async (imageId) => {
    if (!imageId) {
      throw new Error('Image ID is required');
    }

    try {
      await antennaStructureImageService.deleteImage(imageId);

      // Reload data to get updated images
      await loadData();

      showSuccess('Image deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      const errorMessage = err.message || 'Failed to delete image';
      setError(errorMessage);
      showError(`Delete failed: ${errorMessage}`);
      throw err;
    }
  }, [loadData]);

  /**
   * Update image metadata
   */
  const updateImage = useCallback(async (imageId, updates) => {
    if (!imageId) {
      throw new Error('Image ID is required');
    }

    try {
      const result = await antennaStructureImageService.updateImage(imageId, updates);

      // Reload data to get updated images
      await loadData();

      showSuccess('Image updated successfully');
      return result.data;
    } catch (err) {
      console.error('Update failed:', err);
      const errorMessage = err.message || 'Failed to update image';
      setError(errorMessage);
      showError(`Update failed: ${errorMessage}`);
      throw err;
    }
  }, [loadData]);

  /**
   * Get images by category
   */
  const getImagesByCategory = useCallback((category) => {
    return images.images_by_category[category] || [];
  }, [images.images_by_category]);

  /**
   * Check if there are images in a specific category
   */
  const hasImagesInCategory = useCallback((category) => {
    const categoryImages = images.images_by_category[category] || [];
    return categoryImages.length > 0;
  }, [images.images_by_category]);

  /**
   * Get all images as a flat array
   */
  const getAllImages = useCallback(() => {
    return images.all_images || [];
  }, [images.all_images]);

  /**
   * Get total number of images
   */
  const getTotalImages = useCallback(() => {
    return images.total_images || 0;
  }, [images.total_images]);

  /**
   * Get available categories
   */
  const getAvailableCategories = useCallback(() => {
    return images.available_categories || [];
  }, [images.available_categories]);

  /**
   * Check if any upload is in progress
   */
  const isUploading = uploading || Object.keys(uploadProgress).length > 0;

  /**
   * Refresh data (re-fetch from server)
   */
  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  /**
   * Create image preview from file
   */
  const createPreview = useCallback(async (file) => {
    try {
      return await antennaStructureImageService.createImagePreview(file);
    } catch (err) {
      console.error('Failed to create preview:', err);
      throw err;
    }
  }, []);

  /**
   * Validate image file
   */
  const validateFile = useCallback((file) => {
    return antennaStructureImageService.validateImageFile(file);
  }, []);

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes) => {
    return antennaStructureImageService.formatFileSize(bytes);
  }, []);

  /**
   * Get organized categories for UI
   */
  const getOrganizedCategories = useCallback(() => {
    return antennaStructureImageService.getOrganizedCategories();
  }, []);

  /**
   * Get category display name
   */
  const getCategoryDisplayName = useCallback((category) => {
    const displayNames = antennaStructureImageService.getCategoryDisplayNames();
    return displayNames[category] || category;
  }, []);

  // Auto-load data on mount or when sessionId changes
  useEffect(() => {
    if (autoLoad && sessionId) {
      loadData();
    }
  }, [autoLoad, sessionId, loadData]);

  // Return all state and functions
  return {
    // State
    loading,
    uploading: isUploading,
    error,
    uploadProgress,

    // Data
    antennaStructureData,
    images,
    
    // Actions
    loadData,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    updateImage,
    refresh,
    clearError,

    // Utility functions
    getImagesByCategory,
    hasImagesInCategory,
    getAllImages,
    getTotalImages,
    getAvailableCategories,
    getOrganizedCategories,
    getCategoryDisplayName,
    createPreview,
    validateFile,
    formatFileSize
  };
};

export default useAntennaStructureImages; 