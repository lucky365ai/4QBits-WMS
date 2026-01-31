import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(this: Response, chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};