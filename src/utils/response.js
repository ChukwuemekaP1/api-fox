/**
 * Send a standardized success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} statusCode
 * @param {string} message
 */
const sendSuccess = (res, data = {}, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 */
const sendError = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data: {},
  });
};

module.exports = { sendSuccess, sendError };
