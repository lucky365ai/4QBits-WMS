import winston from 'winston';
import { config } from '../config/config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: config.logFile,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP request logging
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...meta,
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Audit logging for admin actions
export const logAudit = (action: string, userId: number, entityType: string, entityId?: number, details?: any) => {
  logger.info('AUDIT', {
    action,
    userId,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Security logging
export const logSecurity = (event: string, details: any) => {
  logger.warn('SECURITY', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, details?: any) => {
  logger.info('PERFORMANCE', {
    operation,
    duration,
    details,
    timestamp: new Date().toISOString(),
  });
};