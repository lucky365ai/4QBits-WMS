import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger, logError } from '../utils/logger';
import { config } from '../config/config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error
  logError('Error occurred', error, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    details = prismaError.details;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    details = config.nodeEnv === 'development' ? error.message : undefined;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = extractValidationErrors(error);
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MulterError') {
    const multerError = handleMulterError(error as any);
    statusCode = multerError.statusCode;
    message = multerError.message;
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    message,
    statusCode,
  };

  // Include details in development or for client errors
  if (details || (config.nodeEnv === 'development' && statusCode >= 500)) {
    errorResponse.details = details || error.message;
  }

  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
  details?: any;
} {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const field = error.meta?.target as string[];
      return {
        statusCode: 409,
        message: `${field ? field.join(', ') : 'Field'} already exists`,
        details: { field, constraint: 'unique' },
      };
    }

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Record not found',
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Invalid reference to related record',
        details: { constraint: 'foreign_key' },
      };

    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        message: 'Required relation missing',
        details: { constraint: 'required_relation' },
      };

    case 'P2021':
      // Table does not exist
      return {
        statusCode: 500,
        message: 'Database configuration error',
      };

    case 'P2022':
      // Column does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
      };

    default:
      return {
        statusCode: 500,
        message: 'Database error',
        details: config.nodeEnv === 'development' ? error.message : undefined,
      };
  }
}

function handleMulterError(error: any): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        message: 'File too large',
      };

    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        message: 'Too many files',
      };

    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        message: 'Unexpected file field',
      };

    default:
      return {
        statusCode: 400,
        message: 'File upload error',
      };
  }
}

function extractValidationErrors(error: any): any {
  if (error.details) {
    return error.details.map((detail: any) => ({
      field: detail.path?.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));
  }
  return undefined;
}

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
};

// Async error wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};