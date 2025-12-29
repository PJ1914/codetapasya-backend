import admin from 'firebase-admin';
import { config } from './env.js';

if (!admin.apps.length) {
    try {
        if (config.firebase.serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(config.firebase.serviceAccount)
            });
            console.log("Firebase initialized with Service Account");
        } else {
            // Fallback to default credentials (useful for GCP environments)
            admin.initializeApp();
            console.log("Firebase initialized with Application Default Credentials");
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

export const firebaseAuth = admin.auth();
export const firebaseAdmin = admin;
