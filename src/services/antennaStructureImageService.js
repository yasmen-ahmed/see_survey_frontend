import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Antenna Structure Image Service
 * Handles all image operations for antenna structure forms
 */
class AntennaStructureImageService {
  
  /**
   * Upload a single image to antenna structure
   * @param {string} sessionId - Session ID
   * @param {File} imageFile - Image file to upload
   * @param {string} imageCategory - Image category
   * @param {string} description - Optional description
   * @returns {Promise} Upload response
   */
  async uploadSingleImage(sessionId, imageFile, imageCategory, description = '') {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('image_category', imageCategory);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/antenna-structure/${sessionId}/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to upload image',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Upload multiple images to antenna structure
   * @param {string} sessionId - Session ID
   * @param {File[]} imageFiles - Array of image files
   * @param {string} imageCategory - Image category for all files
   * @param {string} description - Optional description
   * @returns {Promise} Upload response
   */
  async uploadMultipleImages(sessionId, imageFiles, imageCategory, description = '') {
    try {
      const formData = new FormData();
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('image_category', imageCategory);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/antenna-structure/${sessionId}/images/upload-multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to upload images',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get antenna structure data with images (uses existing endpoint)
   * @param {string} sessionId - Session ID
   * @returns {Promise} Complete antenna structure data with images
   */
  async getAntennaStructureWithImages(sessionId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/antenna-structure/${sessionId}`);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching antenna structure data:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch data',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get images by category for antenna structure
   * @param {string} sessionId - Session ID
   * @param {string} category - Image category
   * @returns {Promise} Images for specific category
   */
  async getImagesByCategory(sessionId, category) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/antenna-structure/${sessionId}/images?category=${category}`
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching images by category:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch images',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete an image
   * @param {number} imageId - Image ID
   * @returns {Promise} Delete response
   */
  async deleteImage(imageId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/antenna-structure/images/${imageId}`);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete image',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update image metadata
   * @param {number} imageId - Image ID
   * @param {Object} updateData - Update data (description, metadata, etc.)
   * @returns {Promise} Update response
   */
  async updateImage(imageId, updateData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/antenna-structure/images/${imageId}`,
        updateData
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating image:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update image',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Validate image file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    const errors = [];
    
    if (!file) {
      errors.push('No file selected');
      return { valid: false, errors };
    }
    
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be a valid image (JPEG, PNG, GIF, WebP)');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }

  /**
   * Validate image category
   * @param {string} category - Category to validate
   * @param {Array} availableCategories - Available categories from API
   * @returns {boolean} Is valid category
   */
  validateImageCategory(category, availableCategories = []) {
    const defaultCategories = [
      'structure_general_photo',
      'structure_legs_photo_1',
      'structure_legs_photo_2',
      'structure_legs_photo_3',
      'structure_legs_photo_4',
      'building_photo',
      'north_direction_view',
      'cables_route_photo_from_tower_top_1',
      'cables_route_photo_from_tower_top_2',
      'general_structure_photo',
      'custom_photo'
    ];
    
    const categories = availableCategories.length > 0 ? availableCategories : defaultCategories;
    return categories.includes(category);
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create image preview from file
   * @param {File} file - Image file
   * @returns {Promise<string>} Data URL for preview
   */
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image category display names
   * @returns {Object} Category mappings
   */
  getCategoryDisplayNames() {
    return {
      'structure_general_photo': 'Structure General Photo',
      'structure_legs_photo_1': 'Structure Legs Photo 1',
      'structure_legs_photo_2': 'Structure Legs Photo 2',
      'structure_legs_photo_3': 'Structure Legs Photo 3',
      'structure_legs_photo_4': 'Structure Legs Photo 4',
      'building_photo': 'Building Photo',
      'north_direction_view': 'North Direction View',
      'cables_route_photo_from_tower_top_1': 'Cables Route from Tower Top 1/2',
      'cables_route_photo_from_tower_top_2': 'Cables Route from Tower Top 2/2',
      'general_structure_photo': 'General Structure Photo',
      'custom_photo': 'Custom Photo'
    };
  }

  /**
   * Get organized categories for UI
   * @returns {Array} Organized category list
   */
  getOrganizedCategories() {
    return [
      {
        group: 'Structure Photos',
        categories: [
          { value: 'structure_general_photo', label: 'Structure General Photo' },
          { value: 'structure_legs_photo_1', label: 'Structure Legs Photo 1' },
          { value: 'structure_legs_photo_2', label: 'Structure Legs Photo 2' },
          { value: 'structure_legs_photo_3', label: 'Structure Legs Photo 3' },
          { value: 'structure_legs_photo_4', label: 'Structure Legs Photo 4' }
        ]
      },
      {
        group: 'Building & Environment',
        categories: [
          { value: 'building_photo', label: 'Building Photo' },
          { value: 'north_direction_view', label: 'North Direction View' }
        ]
      },
      {
        group: 'Cable Infrastructure',
        categories: [
          { value: 'cables_route_photo_from_tower_top_1', label: 'Cables Route from Tower Top 1/2' },
          { value: 'cables_route_photo_from_tower_top_2', label: 'Cables Route from Tower Top 2/2' }
        ]
      },
      {
        group: 'General',
        categories: [
          { value: 'general_structure_photo', label: 'General Structure Photo' },
          { value: 'custom_photo', label: 'Custom Photo' }
        ]
      }
    ];
  }
}

// Create singleton instance
const antennaStructureImageService = new AntennaStructureImageService();

export default antennaStructureImageService; 