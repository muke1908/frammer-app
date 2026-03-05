import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES, ERROR_MESSAGES } from './constants';

/**
 * Validate if file is an accepted image type
 * @param {File} file - File to validate
 * @returns {boolean}
 */
export function isValidFileType(file) {
  return ACCEPTED_FILE_TYPES.includes(file.type) || file.type.startsWith('image/');
}

/**
 * Validate if file size is within limits
 * @param {File} file - File to validate
 * @returns {boolean}
 */
export function isValidFileSize(file) {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Validate file and return error message if invalid
 * @param {File} file - File to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateFile(file) {
  if (!file) {
    return 'No file provided';
  }

  if (!isValidFileType(file)) {
    return ERROR_MESSAGES.INVALID_TYPE;
  }

  if (!isValidFileSize(file)) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  return null;
}
