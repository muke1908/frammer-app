import { useRef, useEffect } from 'react';
import { renderFramedImage } from '../../utils/canvas/frameRenderer';

/**
 * Hook for managing canvas rendering
 * @param {HTMLImageElement} image - Image to render
 * @param {{x: number, y: number, width: number, height: number}} crop - Crop dimensions
 * @param {{aspectRatio: string, background: string, padding: number}} frameConfig - Frame configuration
 * @returns {React.RefObject} Canvas ref
 */
export function useCanvas(image, crop, frameConfig) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const pixelRatio = window.devicePixelRatio || 1;

    renderFramedImage(canvas, image, crop, frameConfig, pixelRatio);
  }, [image, crop, frameConfig]);

  return canvasRef;
}
