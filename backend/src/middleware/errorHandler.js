import { AppError } from '../utils/errors.js';
import fs from 'fs';
import path from 'path';

export function errorHandler(err, req, res, next) {
  const logEntry = `[${new Date().toISOString()}] ${req.id || 'NO-ID'} ${req.method} ${req.url}: ${err.stack}\n\n`;
  fs.appendFileSync(path.join(process.cwd(), 'error.log'), logEntry);
  console.error(err);

  // Handle CSRF errors from csrf-csrf library (throws ForbiddenError)
  const isCsrfError = err.code === 'EBADCSRFTOKEN' || 
    (err.name === 'ForbiddenError' && err.message?.toLowerCase().includes('csrf')) ||
    (err.status === 403 && err.message?.toLowerCase().includes('csrf'));
  
  if (isCsrfError) {
    console.error('CSRF Error details:');
    console.error('- Header x-csrf-token:', req.headers['x-csrf-token']);
    console.error('- Cookie ps-csrf-secret:', req.cookies?.['ps-csrf-secret'] ? 'present' : 'missing');
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token, please refresh the page and try again',
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle unexpected errors with status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
}
