import { Request, Response, NextFunction } from 'express';
import { AccessControlService } from '../services/access-control.service.js';

/**
 * Premium user middleware
 * Checks if user is authenticated AND has active premium subscription
 * Uses AccessControlService for centralized subscription logic
 *
 * Apply ONLY to:
 * - blocks (content)
 * - quizzes
 * - assignments
 * - live-class content
 *
 * DO NOT apply to:
 * - course listing
 * - course metadata / overview
 * - course structure (topics, subtopics navigation)
 */
export const isPremiumUser = (
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

  const isSubscriptionActive = AccessControlService.isSubscriptionActive(user);

  if (!isSubscriptionActive) {
    res.status(402).json({
      error: 'PaymentRequired',
      message: 'Premium subscription required to access this content',
      isPremium: user.isPremium,
      subscriptionExpiry: user.subscriptionExpiry,
    });
    return;
  }

  next();
};
