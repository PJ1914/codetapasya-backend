/**
 * Central Access Control Service
 * Handles authorization checks across the application
 */
import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../enums/UserRole.enum.js';

export class AccessControlService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: any, permission: Permission): boolean {
    if (!user || !user.role) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user is a specific role
   */
  static hasRole(user: any, role: UserRole): boolean {
    return user?.role === role;
  }

  /**
   * Check if user has any of the given permissions
   */
  static hasAnyPermission(user: any, permissions: Permission[]): boolean {
    return permissions.some((perm) => this.hasPermission(user, perm));
  }

  /**
   * Check if subscription is active (not expired)
   */
  static isSubscriptionActive(user: any): boolean {
    if (!user?.isPremium) return false;
    if (!user.subscriptionExpiry) return true; // No expiry = lifetime
    const now = Math.floor(Date.now() / 1000);
    return user.subscriptionExpiry > now;
  }

  /**
   * Get time remaining on subscription in seconds
   */
  static getSubscriptionTimeRemaining(user: any): number | null {
    if (!user?.isPremium || !user.subscriptionExpiry) return null;
    const now = Math.floor(Date.now() / 1000);
    const remaining = user.subscriptionExpiry - now;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Middleware: Check if user has permission
   */
  static checkPermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      if (!this.hasPermission(user, permission)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Permission denied: ${permission}`,
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware: Check if user has any of multiple permissions
   */
  static checkAnyPermission(...permissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      if (!this.hasAnyPermission(user, permissions)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Permission denied`,
        });
        return;
      }

      next();
    };
  }
}

export default AccessControlService;
