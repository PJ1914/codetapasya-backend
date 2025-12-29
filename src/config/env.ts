<<<<<<< HEAD
/**
 * Environment Configuration
 * Load and validate environment variables from .env file
 */

interface EnvConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  dynamodb: {
    usersTable: string;
    coursesTable: string;
    enrollmentsTable: string;
    subscriptionsTable: string;
    topicsTable: string;
    blocksTable: string;
    progressTable: string;
  };
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

export const config: EnvConfig = {
  port: getEnvNumber('PORT', 3000),
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  firebase: {
    projectId: getEnv('FIREBASE_PROJECT_ID', 'codetapasya'),
    privateKey: getEnv('FIREBASE_PRIVATE_KEY', ''),
    clientEmail: getEnv('FIREBASE_CLIENT_EMAIL', ''),
  },
  aws: {
    region: getEnv('AWS_REGION', 'ap-south-1'),
    accessKeyId: getEnv('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY', ''),
  },
  dynamodb: {
    usersTable: getEnv('DYNAMODB_USERS_TABLE', 'users'),
    coursesTable: getEnv('DYNAMODB_COURSES_TABLE', 'courses'),
    enrollmentsTable: getEnv('DYNAMODB_ENROLLMENTS_TABLE', 'enrollments'),
    subscriptionsTable: getEnv('DYNAMODB_SUBSCRIPTIONS_TABLE', 'subscriptions'),
    topicsTable: getEnv('DYNAMODB_TOPICS_TABLE', 'topics'),
    blocksTable: getEnv('DYNAMODB_BLOCKS_TABLE', 'blocks'),
    progressTable: getEnv('DYNAMODB_PROGRESS_TABLE', 'progress'),
  },
};

export default config;
=======
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
>>>>>>> de5be0518acafe56f9e23d8db2ce3e57463e8719
