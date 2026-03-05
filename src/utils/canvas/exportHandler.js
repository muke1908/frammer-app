import { EXPORT_SCALE_FACTOR, CANVAS_BASE_WIDTH, ASPECT_RATIOS, ERROR_MESSAGES } from '../constants';
import { calculateFitToFrame } from './cropCalculations';

/**
 * Draw caption (same logic as frameRenderer, for export)
 * @param {CanvasRenderingContext2D} ctx
 * @param {{text: string, size: number, italic: boolean, color: string}} captionConfig
 * @param {{x: number, y: number, width: number, height: number}} fit
 * @param {number} canvasWidth
 */
function drawCaption(ctx, captionConfig, fit, canvasWidth) {
  if (!captionConfig) return;
  const text = captionConfig.text.trim();
  if (!text) return;

  const scaledSize = captionConfig.size * (canvasWidth / 1920);
  const fontSize = Math.max(8, Math.round(scaledSize));
  const style = captionConfig.italic ? 'italic ' : '';
  ctx.font = `${style}${fontSize}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = fit.width * 0.88;
  let displayText = captionConfig.text.trim();
  while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 0) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== text) displayText = displayText.slice(0, -1) + '…';

  const bottomMargin = Math.round(canvasWidth * 0.018);
  const textY = fit.y + fit.height - bottomMargin - fontSize / 2;
  const centerX = fit.x + fit.width / 2;

  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = Math.max(2, fontSize * 0.12);
  ctx.lineJoin = 'round';
  ctx.strokeText(displayText, centerX, textY);

  ctx.fillStyle = captionConfig.color;
  ctx.fillText(displayText, centerX, textY);
}

/**
 * Detect iOS (iPhone/iPad) where <a download> saves to Files instead of Photos
 */
function isIOS() {
  return /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
}

/**
 * Save a blob to device. On iOS uses Web Share API so the user can save to Photos.
 * Falls back to <a download> on other platforms.
 */
async function saveBlobToDevice(blob, filename) {
  if (isIOS() && navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return;
    }
  }
  // Standard download for non-iOS
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export canvas to high-quality PNG file
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas to export
 * @param {string} filename - Filename for download
 * @returns {Promise<void>}
 */
export function exportCanvasImage(sourceCanvas, filename = 'framed-photo.png') {
  return new Promise((resolve, reject) => {
    // Create export canvas at higher resolution
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d', { alpha: false });

    // Scale up for high quality
    exportCanvas.width = sourceCanvas.width * EXPORT_SCALE_FACTOR;
    exportCanvas.height = sourceCanvas.height * EXPORT_SCALE_FACTOR;

    // Enable high-quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw source canvas scaled up
    ctx.scale(EXPORT_SCALE_FACTOR, EXPORT_SCALE_FACTOR);
    ctx.drawImage(sourceCanvas, 0, 0);

    // Convert to blob
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(ERROR_MESSAGES.EXPORT_FAILED));
          return;
        }
        saveBlobToDevice(blob, filename).then(resolve).catch(reject);
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Export at original resolution
 * Renders image at source dimensions for maximum quality
 * @param {HTMLImageElement} image - Original image
 * @param {{x: number, y: number, width: number, height: number}} crop - Crop dimensions
 * @param {{aspectRatio: string, background: string, padding: number}} frameConfig - Frame config
 * @param {string} filename - Filename for download
 * @returns {Promise<void>}
 */
export function exportAtOriginalResolution(
  image,
  crop,
  frameConfig,
  filename = 'framed-photo.png',
  captionConfig = null
) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    // Calculate frame dimensions
    const frameAspectRatio =
      frameConfig.aspectRatio === ASPECT_RATIOS.LANDSCAPE ? 16 / 9 : 9 / 16;

    // Use original crop dimensions as base, scale to reasonable export size
    const targetWidth = Math.max(CANVAS_BASE_WIDTH, crop.width);
    const frameWidth = targetWidth;
    const frameHeight = Math.round(frameWidth / frameAspectRatio);

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    // Draw frame background
    ctx.fillStyle = frameConfig.background === 'black' ? '#000000' : '#FFFFFF';
    ctx.fillRect(0, 0, frameWidth, frameHeight);

    // Calculate fit
    const fitDimensions = calculateFitToFrame(
      crop.width,
      crop.height,
      frameWidth,
      frameHeight,
      frameConfig.padding * (frameWidth / CANVAS_BASE_WIDTH)
    );

    // Enable high-quality smoothing
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
    drawCaption(ctx, captionConfig, fitDimensions, frameWidth);

    // Export
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(ERROR_MESSAGES.EXPORT_FAILED));
          return;
        }
        saveBlobToDevice(blob, filename).then(resolve).catch(reject);
      },
      'image/png',
      1.0
    );
  });
}
