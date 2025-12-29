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
