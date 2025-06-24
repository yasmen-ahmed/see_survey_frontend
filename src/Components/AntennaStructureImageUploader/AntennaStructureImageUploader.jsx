import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useAntennaStructureImages from '../../hooks/useAntennaStructureImages';
import antennaStructureImageService from '../../services/antennaStructureImageService';

const AntennaStructureImageUploader = ({ 
  className = "w-[20%]",
  allowMultiple = true,
  maxFiles = 5,
  showPreview = true,
  showUploadProgress = true
}) => {
  const { sessionId } = useParams();
  
  // State for UI interactions
  const [selectedCategory, setSelectedCategory] = useState('structure_general_photo');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, image: null });
  const [editingDescription, setEditingDescription] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // Use the custom hook
  const {
    loading,
    uploading,
    error,
    uploadProgress,
    images,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    updateImage,
    getImagesByCategory,
    hasImagesInCategory,
    getTotalImages,
    getOrganizedCategories,
    getCategoryDisplayName,
    formatFileSize,
    validateFile,
    createPreview,
    clearError
  } = useAntennaStructureImages(sessionId, true);
  
  // Get organized categories for the UI
  const organizedCategories = getOrganizedCategories();

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedCategory]);

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [selectedCategory]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  /**
   * Handle file upload logic
   */
  const handleFileUpload = useCallback(async (files) => {
    if (!selectedCategory) {
      alert('Please select an image category first');
      return;
    }

    try {
      // Validate files first
      const validFiles = [];
      const errors = [];

      for (const file of files) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.errors.join(', ')}`);
        }
      }

      if (errors.length > 0) {
        alert(`Some files are invalid:\n${errors.join('\n')}`);
        if (validFiles.length === 0) return;
      }

      // Limit number of files
      const filesToUpload = validFiles.slice(0, maxFiles);
      if (validFiles.length > maxFiles) {
        alert(`Only the first ${maxFiles} files will be uploaded`);
      }

      // Upload files
      if (filesToUpload.length === 1) {
        await uploadImage({
          file: filesToUpload[0],
          imageCategory: selectedCategory,
          description: ''
        });
      } else {
        await uploadMultipleImages({
          files: filesToUpload,
          imageCategory: selectedCategory,
          description: ''
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      // Error handling is done in the hook
    }
  }, [selectedCategory, maxFiles, uploadImage, uploadMultipleImages, validateFile]);

  /**
   * Handle image deletion with confirmation
   */
  const handleDeleteImage = useCallback(async (imageId, imageName) => {
    if (window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
      try {
        await deleteImage(imageId);
      } catch (err) {
        console.error('Delete error:', err);
        // Error handling is done in the hook
      }
    }
  }, [deleteImage]);

  /**
   * Handle opening image preview modal
   */
  const handleImagePreview = useCallback((image) => {
    setPreviewModal({ open: true, image });
  }, []);

  /**
   * Handle starting description edit
   */
  const handleStartEditDescription = useCallback((imageId, currentDescription) => {
    setEditingDescription(imageId);
    setNewDescription(currentDescription || '');
  }, []);

  /**
   * Handle saving description
   */
  const handleSaveDescription = useCallback(async (imageId) => {
    try {
      await updateImage(imageId, { description: newDescription });
      setEditingDescription(null);
      setNewDescription('');
    } catch (err) {
      console.error('Update error:', err);
      // Error handling is done in the hook
    }
  }, [updateImage, newDescription]);

  /**
   * Handle canceling description edit
   */
  const handleCancelEditDescription = useCallback(() => {
    setEditingDescription(null);
    setNewDescription('');
  }, []);

  /**
   * Render upload progress
   */
  const renderUploadProgress = () => {
    const progressKeys = Object.keys(uploadProgress);
    if (progressKeys.length === 0) return null;

    return (
      <div className="mb-4 space-y-2">
        {progressKeys.map(key => (
          <div key={key} className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress[key]}%` }}
            />
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render image card
   */
  const renderImageCard = (image) => (
    <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => handleImagePreview(image)}
      >
        <img
          src={image.file_url}
          alt={image.original_filename}
          className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
          onError={(e) => {
            e.target.src = '/placeholder-image.png'; // Fallback image
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
            View Full Size
          </span>
        </div>
      </div>

      {/* Image Info */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {image.original_filename}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(image.file_size)}
        </p>

        {/* Description */}
        <div className="mt-2">
          {editingDescription === image.id ? (
            <div className="space-y-2">
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full text-xs border rounded p-1 resize-none"
                rows="2"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => handleSaveDescription(image.id)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditDescription}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="text-xs text-gray-600 cursor-pointer hover:text-blue-600"
              onClick={() => handleStartEditDescription(image.id, image.description)}
            >
              {image.description || 'Click to add description...'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">
            {new Date(image.upload_date || image.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => handleDeleteImage(image.id, image.original_filename)}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`${className} bg-white p-4 rounded-xl shadow-md`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading images...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white p-4 rounded-xl shadow-md h-[858px] flex flex-col`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📸 Structure Images
        </h3>
        <p className="text-sm text-gray-600">
          Total: {getTotalImages()} images
        </p>
      </div>

      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        >
          {organizedCategories.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={allowMultiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="text-gray-600">
          {uploading ? (
            <div>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-2">📷</div>
              <p className="text-sm">
                Drag & drop images here or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max {maxFiles} files, 10MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {showUploadProgress && renderUploadProgress()}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-start">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Images by Selected Category */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            {getCategoryDisplayName(selectedCategory)}
          </h4>
          <p className="text-xs text-gray-500">
            {getImagesByCategory(selectedCategory).length} images
          </p>
        </div>

        <div className="space-y-3">
          {getImagesByCategory(selectedCategory).map(renderImageCard)}
        </div>

        {!hasImagesInCategory(selectedCategory) && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">No images in this category yet</p>
            <p className="text-xs">Upload some images to get started</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewModal.open && previewModal.image && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewModal({ open: false, image: null })}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={previewModal.image.file_url}
              alt={previewModal.image.original_filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-white text-center mt-4">
              <h3 className="text-lg font-medium">{previewModal.image.original_filename}</h3>
              <p className="text-sm opacity-75">
                {getCategoryDisplayName(previewModal.image.image_category)} • {formatFileSize(previewModal.image.file_size)}
              </p>
              {previewModal.image.description && (
                <p className="text-sm mt-2 opacity-90">{previewModal.image.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntennaStructureImageUploader; 