/**
 * Centralized error handling utility
 */

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {string} customMessage - Custom error message
 * @param {boolean} showAlert - Whether to show alert dialog
 */
export const handleError = (error, customMessage = 'Terjadi kesalahan, mohon coba lagi.', showAlert = true) => {
  console.error('Error occurred:', error);
  
  if (showAlert) {
    alert(customMessage);
  }
  
  return {
    success: false,
    error: customMessage,
    details: error.message || 'Unknown error'
  };
};

/**
 * Handle API response errors
 * @param {Response} response - Fetch response object
 * @param {string} context - Context of the API call
 */
export const handleApiError = (response, context = 'API call') => {
  const message = `${context} failed: ${response.status} ${response.statusText}`;
  console.error(message);
  
  return {
    success: false,
    error: message,
    status: response.status
  };
};

/**
 * Handle network errors
 * @param {Error} error - Network error
 * @param {string} context - Context of the network call
 */
export const handleNetworkError = (error, context = 'Network request') => {
  const message = `${context} failed: Periksa koneksi internet Anda`;
  console.error(message, error);
  
  return {
    success: false,
    error: message,
    type: 'network'
  };
};

/**
 * Validate required parameters
 * @param {object} params - Parameters to validate
 * @param {array} required - Array of required parameter names
 * @returns {object} Validation result
 */
export const validateParams = (params, required = []) => {
  const missing = required.filter(param => !params[param]);
  
  if (missing.length > 0) {
    const message = `Parameter yang diperlukan tidak lengkap: ${missing.join(', ')}`;
    return {
      valid: false,
      error: message,
      missing
    };
  }
  
  return {
    valid: true
  };
};

/**
 * Safe async function wrapper
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} context - Context for error handling
 * @returns {Function} Wrapped function
 */
export const safeAsync = (asyncFn, context = 'Async operation') => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error, `${context} gagal`, false);
    }
  };
};

/**
 * Retry mechanism for failed operations
 * @param {Function} operation - Operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Operation result
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries) {
        console.warn(`Operation failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
