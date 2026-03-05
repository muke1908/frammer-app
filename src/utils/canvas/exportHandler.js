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
export function isIOS() {
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
 * Output is always a fixed resolution:
 *   Landscape (16:9) → 1920 × 1080
 *   Portrait  (9:16) → 1080 × 1920
 */
function buildExportCanvas(image, crop, frameConfig, captionConfig) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  const isLandscape = frameConfig.aspectRatio === ASPECT_RATIOS.LANDSCAPE;
  const frameWidth  = isLandscape ? 1920 : 1080;
  const frameHeight = isLandscape ? 1080 : 1920;

  canvas.width  = frameWidth;
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
 * Build a JPEG data URL synchronously — used on iOS for the save overlay.
 * Fixed output: 1920×1080 (landscape) or 1080×1920 (portrait).
 */
export function buildExportJpegURL(image, crop, frameConfig, captionConfig = null) {
  return buildExportCanvas(image, crop, frameConfig, captionConfig)
    .toDataURL('image/jpeg', 0.92);
}

/**
 * Export at original resolution with frame, crop, and optional caption.
 *
 * iOS strategy (in order):
 *   1. Web Share API with JPEG file — synchronous blob prep keeps gesture context.
 *      AbortError = user cancelled, treat as success.
 *   2. Fallback: open blob URL in new tab so user can save from Safari share sheet.
 *
 * Non-iOS: toBlob + <a download> (works on Android Chrome / desktop).
 */
export async function exportAtOriginalResolution(
  image,
  crop,
  frameConfig,
  filename = 'framed-photo.png',
  captionConfig = null
) {
  const canvas = buildExportCanvas(image, crop, frameConfig, captionConfig);

  if (isIOS()) {
    // Use JPEG — smaller than PNG, less likely to hit memory limits on iOS.
    // toDataURL is synchronous so the entire blob is ready before any await,
    // keeping navigator.share() within the original user gesture activation.
    const jpgFilename = filename.replace(/\.png$/i, '.jpg');
    const blob = dataURLToBlob(canvas.toDataURL('image/jpeg', 0.92));
    const file = new File([blob], jpgFilename, { type: 'image/jpeg' });

    // Try Web Share API (iOS 15+ supports file sharing)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: jpgFilename });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // User dismissed the sheet — that's fine
        // Any other error: fall through to blob-URL fallback below
      }
    }

    // Fallback: open the image in a new tab.
    // In Safari the user can tap the share button → "Save Image" to Photos.
    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobURL;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobURL), 60_000);
    return;
  }

  // Non-iOS: toBlob + <a download>
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
