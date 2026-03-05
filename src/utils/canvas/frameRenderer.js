import { calculateFitToFrame } from './cropCalculations';
import { CANVAS_BASE_WIDTH, ASPECT_RATIOS } from '../constants';

/**
 * Render image with frame on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} image - Image to render
 * @param {{x: number, y: number, width: number, height: number}} crop - Crop dimensions
 * @param {{aspectRatio: string, background: string, padding: number}} frameConfig - Frame configuration
 * @param {number} pixelRatio - Device pixel ratio for retina displays
 */
export function renderFramedImage(canvas, image, crop, frameConfig, pixelRatio = 1) {
  const ctx = canvas.getContext('2d', { alpha: false });

  // Calculate canvas dimensions based on frame aspect ratio
  const frameAspectRatio =
    frameConfig.aspectRatio === ASPECT_RATIOS.LANDSCAPE ? 16 / 9 : 9 / 16;

  // Adjust base width for smaller screens
  const maxWidth = Math.min(window.innerWidth - 64, CANVAS_BASE_WIDTH);
  const baseWidth = maxWidth;
  const baseHeight = Math.round(baseWidth / frameAspectRatio);

  // Scale for retina displays
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;

  // Set CSS dimensions for proper display
  canvas.style.width = `${baseWidth}px`;
  canvas.style.height = `${baseHeight}px`;

  // Scale context for retina
  ctx.scale(pixelRatio, pixelRatio);

  // Draw frame background
  ctx.fillStyle = frameConfig.background === 'black' ? '#000000' : '#FFFFFF';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Calculate where to draw the image
  const fitDimensions = calculateFitToFrame(
    crop.width,
    crop.height,
    baseWidth,
    baseHeight,
    frameConfig.padding
  );

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw cropped image
  ctx.drawImage(
    image,
    crop.x, // Source x
    crop.y, // Source y
    crop.width, // Source width
    crop.height, // Source height
    fitDimensions.x, // Destination x
    fitDimensions.y, // Destination y
    fitDimensions.width, // Destination width
    fitDimensions.height // Destination height
  );
}
