import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: process.cwd() + '/.env', override: true });

const loadFirebaseCredentials = () => {
    // Priority 1: Path from Env
    if (process.env.FIREBASE_CREDENTIALS_PATH) {
        try {
            const credentialPath = path.resolve(process.cwd(), process.env.FIREBASE_CREDENTIALS_PATH);
            if (fs.existsSync(credentialPath)) {
                return JSON.parse(fs.readFileSync(credentialPath, 'utf-8'));
            }
        } catch (error) {
            console.warn("Failed to load Firebase credentials from path:", error);
        }
    }

    // Priority 2: JSON String from Env
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
            console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT json");
        }
    }

    return undefined;
};

export const config = {
    port: process.env.PORT || 3000,
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
    },
    firebase: {
        serviceAccount: loadFirebaseCredentials()
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || ''
    }
};
