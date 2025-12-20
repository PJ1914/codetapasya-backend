import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase.js';

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
