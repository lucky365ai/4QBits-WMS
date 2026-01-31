import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../database/connection';
import { AppError } from '../utils/AppError';
import { logSecurity } from '../utils/logger';
import { AuthenticatedRequest } from '../types/express';

export { AuthenticatedRequest };

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        isVerified: true,
        isApproved: true,
      },
    });

    if (!user) {
      logSecurity('Invalid token - user not found', { userId: decoded.userId });
      throw new AppError('Invalid token', 401);
    }

    // Email verification removed for deployment simplicity

    if (user.role === 'GUEST_SPEAKER' && !user.isApproved) {
      throw new AppError('Account pending approval', 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      logSecurity('Invalid JWT token', { error: error.message });
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          isVerified: true,
          isApproved: true,
        },
      });

      if (user && (user.role !== 'GUEST_SPEAKER' || user.isApproved)) {
        req.user = user;
      }
    }

    next();
  } catch (error: any) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Admin-only middleware with hidden access
export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    logSecurity('Admin access attempt denied', {
      userId: req.user?.id,
      userRole: req.user?.role,
      path: req.path,
      ip: req.ip,
    });
    return next(new AppError('Access denied', 404)); // Return 404 to hide admin routes
  }
  next();
};

// Speaker or Admin access
export const speakerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['SPEAKER', 'ADMIN'].includes(req.user.role)) {
    return next(new AppError('Speaker or admin access required', 403));
  }
  next();
};

// Student access (for registrations, etc.)
export const studentAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['STUDENT', 'ADMIN'].includes(req.user.role)) {
    return next(new AppError('Student access required', 403));
  }
  next();
};

// Resource ownership check
export const checkResourceOwnership = (resourceType: 'workshop' | 'registration' | 'feedback') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const resourceId = parseInt(req.params.id);

      if (req.user.role === 'ADMIN') {
        return next(); // Admin can access all resources
      }

      let hasAccess = false;

      switch (resourceType) {
        case 'workshop': {
          const workshop = await prisma.workshop.findUnique({
            where: { id: resourceId },
            select: { speakerId: true },
          });
          hasAccess = workshop?.speakerId === req.user.id;
          break;
        }

        case 'registration': {
          const registration = await prisma.registration.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          hasAccess = registration?.userId === req.user.id;
          break;
        }

        case 'feedback': {
          const feedback = await prisma.feedback.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          hasAccess = feedback?.userId === req.user.id;
          break;
        }
      }

      if (!hasAccess) {
        logSecurity('Resource access denied', {
          userId: req.user.id,
          resourceType,
          resourceId,
          path: req.path,
        });
        return next(new AppError('Access denied', 403));
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

// Helper function to extract token from request
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookies for token
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

// Generate JWT token
export const generateToken = (userId: number): string => {
  const payload = { userId };
  const secret = config.jwtSecret;
  const options: jwt.SignOptions = { expiresIn: config.jwtExpiresIn as any };

  return jwt.sign(payload, secret, options);
};

// Verify token without throwing errors
export const verifyToken = (token: string): any | null => {
  try {
    const secret = config.jwtSecret;
    return jwt.verify(token, secret);
  } catch (error: any) {
    return null;
  }
};