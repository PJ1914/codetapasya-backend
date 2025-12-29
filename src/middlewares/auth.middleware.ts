import { Request, Response, NextFunction } from 'express';
<<<<<<< HEAD
import admin from 'firebase-admin';
import { UserRole } from '../enums/UserRole.enum.js';

/**
 * Initialize Firebase Admin SDK once on module load
 * Uses GOOGLE_APPLICATION_CREDENTIALS environment variable or explicit projectId
 */
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('[Firebase] Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
  }
}

/**
 * Verify Firebase ID token and extract user claims
 * Attaches user object to request with exactly: uid, email, role, isPremium, subscriptionExpiry
 * Does NOT enforce business logic (role/premium checks) — those belong in dedicated middleware
 */
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Bearer token',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const d = decoded as any;

    // Extract custom claims from Firebase token (may be nested or top-level)
    const role = d.role ?? d.custom_claims?.role ?? UserRole.USER;
    const isPremium = d.isPremium === true || d.custom_claims?.isPremium === true || false;
    const subscriptionExpiry = d.subscriptionExpiry ?? d.custom_claims?.subscriptionExpiry ?? null;

    (req as any).user = {
      uid: d.uid,
      email: d.email || '',
      role,
      isPremium,
      subscriptionExpiry,
    };

    next();
  } catch (err: any) {
    console.error('[Auth] Token verification failed:', err.message);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
=======
import { firebaseAuth } from '../config/firebase.js';
>>>>>>> de5be0518acafe56f9e23d8db2ce3e57463e8719

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'user' // Assumes 'role' custom claim, defaults to 'user'
        };
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
