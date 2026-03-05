import { useState } from 'react';
import { validateFile } from '../utils/validators';
import { loadImage } from '../utils/canvas/imageProcessor';

/**
 * Hook for handling file upload with drag & drop
 * @param {Function} onFileLoad - Callback when file is successfully loaded
 * @param {Object} toast - Toast notification object with success/error/info methods
 * @returns {Object} Upload state and handlers
 */
export function useFileUpload(onFileLoad, toast) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Load image
      const imageData = await loadImage(file);
      onFileLoad(imageData);

      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      // Show error toast with actionable message
      if (toast) {
        toast.error(err.message);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if leaving the drop zone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return {
    isDragging,
    isLoading,
    error,
    handlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onChange: handleFileInput,
    },
  };
}
