import { useState, useCallback } from 'react';
import { exportAtOriginalResolution } from '../utils/canvas/exportHandler';

/**
 * Hook for exporting canvas to image file
 * @returns {Object} Export state and handler
 */
export function useCanvasExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportImage = useCallback(async (image, crop, frameConfig) => {
    try {
      setIsExporting(true);
      setError(null);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `framed-photo-${timestamp}.png`;

      await exportAtOriginalResolution(image, crop, frameConfig, filename);

      setIsExporting(false);
    } catch (err) {
      setError(err.message);
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    error,
    exportImage,
  };
}
