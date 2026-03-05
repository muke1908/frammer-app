import { calculateFitToFrame } from './cropCalculations';
import { CANVAS_BASE_WIDTH, ASPECT_RATIOS } from '../constants';

/**
 * Draw cinematic subtitle caption over the image area
 */
function drawCaption(ctx, caption, fit, canvasWidth) {
  const text = caption.trim();
  if (!text) return;

  const fontSize = Math.max(13, Math.round(canvasWidth * 0.026));
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Measure and clip text to fit width
  const maxTextWidth = fit.width * 0.88;
  let displayText = text;
  while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 0) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== text) displayText = displayText.slice(0, -1) + '…';

  const vPad = fontSize * 0.55;
  const barHeight = fontSize + vPad * 2;
  const barY = fit.y + fit.height - barHeight - Math.round(canvasWidth * 0.018);
  const centerX = fit.x + fit.width / 2;

  // Semi-transparent bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.fillRect(fit.x, barY, fit.width, barHeight);

  // Text shadow
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  // White text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(displayText, centerX, barY + vPad + fontSize / 2);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Render image with frame on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} image - Image to render
 * @param {{x: number, y: number, width: number, height: number}} crop - Crop dimensions
 * @param {{aspectRatio: string, background: string, padding: number}} frameConfig - Frame configuration
 * @param {number} pixelRatio - Device pixel ratio for retina displays
 * @param {string} caption - Optional caption text
 */
export function renderFramedImage(canvas, image, crop, frameConfig, pixelRatio = 1, caption = '') {
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
  const scaledPadding = frameConfig.padding * (baseWidth / CANVAS_BASE_WIDTH);
  const fitDimensions = calculateFitToFrame(
    crop.width,
    crop.height,
    baseWidth,
    baseHeight,
    scaledPadding
  );

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw cropped image
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    fitDimensions.x,
    fitDimensions.y,
    fitDimensions.width,
    fitDimensions.height
  );

  // Draw cinematic caption if provided
  drawCaption(ctx, caption, fitDimensions, baseWidth);
}
