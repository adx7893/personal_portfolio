import { MulterError } from 'multer';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const message = err?.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    details: err?.details || undefined,
  });
};

