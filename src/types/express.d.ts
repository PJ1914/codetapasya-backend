import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      uid: string;
      email?: string;
      role?: 'admin' | 'user';
      isPremium?: boolean;
      subscriptionExpiry?: number | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
