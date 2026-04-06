/**
 * Centralized error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for internal tracking
    console.error(`[SERVER ERROR] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Determine status code (default to 500)
    const statusCode = err.status || 500;

    // Send standardized JSON response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An internal server error occurred. Please try again later.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;