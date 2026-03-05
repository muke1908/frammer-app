import { ERROR_MESSAGES } from '../constants';

/**
 * Load image from file and extract metadata
 * @param {File} file - Image file to load
 * @returns {Promise<Object>} Image data object
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error(ERROR_MESSAGES.INVALID_TYPE));
      return;
    }

    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.onload = () => {
        resolve({
          original: img,
          width: img.width,
          height: img.height,
          naturalWidth: img.width,
          naturalHeight: img.height,
          aspectRatio: img.width / img.height,
          file: file,
        });
      };

      img.onerror = () => reject(new Error(ERROR_MESSAGES.LOAD_FAILED));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error(ERROR_MESSAGES.LOAD_FAILED));
    reader.readAsDataURL(file);
  });
}
