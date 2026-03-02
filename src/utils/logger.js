/**
 * Logger utility for HTTP request logging
 * Provides a stream interface for Morgan middleware
 */

/**
 * Returns a stream interface for Morgan middleware
 * @returns {Object} Stream object with write method
 */
const getLoggerStream = () => {
  return {
    write: (message) => {
      if (message && typeof message === 'string') {
        console.log(message.trim());
      }
    }
  };
};

module.exports = { getLoggerStream };
