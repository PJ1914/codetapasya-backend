import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../enums/UserRole.enum.js';
import { AccessControlService } from '../services/access-control.service.js';

/**
 * Admin role middleware
 * Checks if user is authenticated AND has admin role
 * Uses centralized access control service
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
    return;
  }

  if (!AccessControlService.hasRole(user, UserRole.ADMIN)) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access only',
    });
    return;
  }

  next();
};

/**
 * Factory middleware: Check for specific role
 */
export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    if (!AccessControlService.hasRole(user, role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `${role} access required`,
      });
      return;
    }

    next();
  };
};
