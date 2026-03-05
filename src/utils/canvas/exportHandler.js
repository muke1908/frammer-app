import { CANVAS_BASE_WIDTH, ASPECT_RATIOS, ERROR_MESSAGES } from '../constants';
import { calculateFitToFrame } from './cropCalculations';

/**
 * Draw caption (same logic as frameRenderer, for export)
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
 * Detect iOS (iPhone/iPad/iPod) where <a download> saves to Files, not Photos.
 */
function isIOS() {
  return /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
}

/**
 * Convert a data URL to a Blob synchronously.
 * Critical for iOS: toDataURL is sync so navigator.share() stays within
 * the user gesture context (toBlob's callback fires in a new task, losing it).
 */
function dataURLToBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Trigger a standard <a download> save (Android / desktop).
 */
function downloadBlob(blob, filename) {
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
 * Build the export canvas with frame + image + caption.
 * All operations are synchronous so the canvas is ready immediately.
 */
function buildExportCanvas(image, crop, frameConfig, captionConfig) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  const frameAspectRatio =
    frameConfig.aspectRatio === ASPECT_RATIOS.LANDSCAPE ? 16 / 9 : 9 / 16;

  const frameWidth = Math.max(CANVAS_BASE_WIDTH, crop.width);
  const frameHeight = Math.round(frameWidth / frameAspectRatio);

  canvas.width = frameWidth;
  canvas.height = frameHeight;

  ctx.fillStyle = frameConfig.background === 'black' ? '#000000' : '#FFFFFF';
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const fitDimensions = calculateFitToFrame(
    crop.width,
    crop.height,
    frameWidth,
    frameHeight,
    frameConfig.padding * (frameWidth / CANVAS_BASE_WIDTH)
  );

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    fitDimensions.x, fitDimensions.y, fitDimensions.width, fitDimensions.height
  );

  drawCaption(ctx, captionConfig, fitDimensions, frameWidth);

  return canvas;
}

/**
 * Export at original resolution with frame, crop, and optional caption.
 * On iOS: uses toDataURL (sync) so navigator.share() keeps the user gesture.
 * On other platforms: uses toBlob for efficiency, falls back to <a download>.
 */
export async function exportAtOriginalResolution(
  image,
  crop,
  frameConfig,
  filename = 'framed-photo.png',
  captionConfig = null
) {
  const canvas = buildExportCanvas(image, crop, frameConfig, captionConfig);

  // iOS path: toDataURL is synchronous, preserving the user gesture context
  // so that navigator.share() is not blocked by NotAllowedError.
  if (isIOS() && navigator.share && navigator.canShare) {
    const blob = dataURLToBlob(canvas.toDataURL('image/png'));
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return;
    }
  }

  // Non-iOS or share not supported: use toBlob + <a download>
  await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(ERROR_MESSAGES.EXPORT_FAILED));
          return;
        }
        downloadBlob(blob, filename);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}
