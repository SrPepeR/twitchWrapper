/**
 * 404 handler - Handles not found routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 401 handler - Handles unauthorized access
 */
const unauthorizedHandler = (req, res) => {
  res.status(401).json({
    success: false,
    error: "Twitch token is expired or invalid, please re-authenticate",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error handler - Handles server errors
 */
const errorHandler = (err, _req, res, _next) => {
  console.error("Error stack:", err.stack);

  // If the error already has a status code, use it
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  unauthorizedHandler,
  errorHandler,
};
