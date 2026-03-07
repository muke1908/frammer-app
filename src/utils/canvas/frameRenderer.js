import { calculateFitToFrame } from './cropCalculations';
import { CANVAS_BASE_WIDTH, ASPECT_RATIOS } from '../constants';

/**
 * Draw caption over the image area
 * @param {CanvasRenderingContext2D} ctx
 * @param {{text: string, size: number, italic: boolean, color: string}} captionConfig
 * @param {{x: number, y: number, width: number, height: number}} fit
 * @param {number} canvasWidth
 */
function drawCaption(ctx, captionConfig, fit, canvasWidth) {
  if (!captionConfig) return;
  const text = captionConfig.text.trim();
  if (!text) return;

  // Scale font size: size values (12-18) are relative units; multiply by 4 so
  // the caption is actually readable on both the preview and the full-res export.
  const scaledSize = captionConfig.size * 4 * (canvasWidth / 1920);
  const fontSize = Math.max(12, Math.round(scaledSize));
  const style = captionConfig.italic ? 'italic ' : '';
  ctx.font = `${style}${fontSize}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Clip text to fit width
  const maxTextWidth = fit.width * 0.88;
  let displayText = text;
  while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 0) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== text) displayText = displayText.slice(0, -1) + '…';

  const bottomMargin = Math.round(canvasWidth * 0.018);
  const textY = fit.y + fit.height - bottomMargin - fontSize / 2;
  const centerX = fit.x + fit.width / 2;

  // Stroke outline for readability (no background bar)
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = Math.max(2, fontSize * 0.12);
  ctx.lineJoin = 'round';
  ctx.strokeText(displayText, centerX, textY);

  // Fill text
  ctx.fillStyle = captionConfig.color;
  ctx.fillText(displayText, centerX, textY);
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
export function renderFramedImage(canvas, image, crop, frameConfig, pixelRatio = 1, captionConfig = null) {
  const ctx = canvas.getContext('2d', { alpha: false });

  // Calculate canvas dimensions based on frame aspect ratio
  const frameAspectRatio =
    frameConfig.aspectRatio === ASPECT_RATIOS.LANDSCAPE ? 16 / 9 : 9 / 16;

  // Use the container's actual layout width so CSS max-width constraints are
  // respected and the canvas never overflows on desktop.
  const containerWidth = canvas.parentElement?.clientWidth || 800;
  const baseWidth = Math.min(containerWidth, CANVAS_BASE_WIDTH);
  const baseHeight = Math.round(baseWidth / frameAspectRatio);

  // Scale for retina displays
  canvas.width = baseWidth * pixelRatio;
  canvas.height = baseHeight * pixelRatio;

  // Keep CSS dimensions in sync with actual layout width (no overflow)
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

  // Draw caption if provided
  drawCaption(ctx, captionConfig, fitDimensions, baseWidth);
}
