import { EXPORT_SCALE_FACTOR, CANVAS_BASE_WIDTH, ASPECT_RATIOS, ERROR_MESSAGES } from '../constants';
import { calculateFitToFrame } from './cropCalculations';

/**
 * Draw cinematic subtitle caption (same logic as frameRenderer, for export)
 */
function drawCaption(ctx, caption, fit, canvasWidth) {
  const text = caption.trim();
  if (!text) return;

  const fontSize = Math.max(20, Math.round(canvasWidth * 0.026));
  ctx.font = `600 italic ${fontSize}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

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

  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.fillRect(fit.x, barY, fit.width, barHeight);

  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = '#F5C518';
  ctx.fillText(displayText, centerX, barY + vPad + fontSize / 2);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
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
  caption = ''
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

    // Draw cinematic caption if provided
    drawCaption(ctx, caption, fitDimensions, frameWidth);

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
