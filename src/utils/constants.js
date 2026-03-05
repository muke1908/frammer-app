/**
 * Application Constants
 */

// Aspect Ratios
export const ASPECT_RATIOS = {
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
};

// Crop Presets
export const CROP_PRESETS = {
  NONE: 'none',
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
};

// Frame Backgrounds
export const FRAME_BACKGROUNDS = {
  BLACK: 'black',
  WHITE: 'white',
};

// File Validation
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];

// Canvas Settings
export const DEFAULT_FRAME_PADDING = 40; // pixels
export const EXPORT_SCALE_FACTOR = 2; // 2x for high quality export
export const CANVAS_BASE_WIDTH = 1920; // Full HD width

// Error Messages - Actionable and specific
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Image is too large (max 50MB). Try compressing it or use a different photo.',
  INVALID_TYPE: "This file type isn't supported. Please upload a JPG, PNG, HEIC, or WebP image.",
  LOAD_FAILED: 'Failed to load image. The file may be corrupted. Try a different photo.',
  EXPORT_FAILED: 'Failed to export image. Please try again.',
};
