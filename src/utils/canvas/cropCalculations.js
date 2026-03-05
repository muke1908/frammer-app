import { CROP_PRESETS } from '../constants';

/**
 * Calculate crop dimensions based on preset
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {string} preset - Crop preset ('none' | '16:9' | '9:16')
 * @param {number} offsetX - Manual X offset (default 0)
 * @param {number} offsetY - Manual Y offset (default 0)
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function calculateCrop(imageWidth, imageHeight, preset, offsetX = 0, offsetY = 0) {
  if (preset === CROP_PRESETS.NONE) {
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }

  const presetRatios = {
    [CROP_PRESETS.LANDSCAPE]: 16 / 9,
    [CROP_PRESETS.PORTRAIT]: 9 / 16,
  };

  const targetRatio = presetRatios[preset];
  if (!targetRatio) {
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }

  const imageRatio = imageWidth / imageHeight;

  let cropWidth, cropHeight, x, y;

  if (imageRatio > targetRatio) {
    // Image is wider than target ratio - crop width
    cropHeight = imageHeight;
    cropWidth = cropHeight * targetRatio;
    x = (imageWidth - cropWidth) / 2;
    y = 0;
  } else {
    // Image is taller than target ratio - crop height
    cropWidth = imageWidth;
    cropHeight = cropWidth / targetRatio;
    x = 0;
    y = (imageHeight - cropHeight) / 2;
  }

  // Apply manual offset, clamped to valid range
  const maxOffsetX = imageWidth - cropWidth;
  const maxOffsetY = imageHeight - cropHeight;

  const finalX = Math.max(0, Math.min(maxOffsetX, x + offsetX));
  const finalY = Math.max(0, Math.min(maxOffsetY, y + offsetY));

  return {
    x: Math.round(finalX),
    y: Math.round(finalY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Calculate fit-to-frame dimensions
 * Ensures image fits within frame while maintaining aspect ratio
 * @param {number} imageWidth - Cropped image width
 * @param {number} imageHeight - Cropped image height
 * @param {number} frameWidth - Frame width
 * @param {number} frameHeight - Frame height
 * @param {number} framePadding - Frame padding in pixels
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function calculateFitToFrame(
  imageWidth,
  imageHeight,
  frameWidth,
  frameHeight,
  framePadding
) {
  const availableWidth = frameWidth - framePadding * 2;
  const availableHeight = frameHeight - framePadding * 2;

  const imageRatio = imageWidth / imageHeight;
  const availableRatio = availableWidth / availableHeight;

  let drawWidth, drawHeight;

  if (imageRatio > availableRatio) {
    // Image is wider - fit to width
    drawWidth = availableWidth;
    drawHeight = drawWidth / imageRatio;
  } else {
    // Image is taller - fit to height
    drawHeight = availableHeight;
    drawWidth = drawHeight * imageRatio;
  }

  // Center the image
  const x = (frameWidth - drawWidth) / 2;
  const y = (frameHeight - drawHeight) / 2;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(drawWidth),
    height: Math.round(drawHeight),
  };
}
