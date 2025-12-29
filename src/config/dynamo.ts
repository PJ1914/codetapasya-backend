import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from './env.js';

const dynamoClient = new DynamoDBClient({
  region: config.aws.region,
  credentials:
    config.aws.accessKeyId && config.aws.secretAccessKey
      ? {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        }
      : undefined,
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table names from environment config
export const TABLES = {
  USERS: config.dynamodb.usersTable,
  COURSES: config.dynamodb.coursesTable,
  ENROLLMENTS: config.dynamodb.enrollmentsTable,
  SUBSCRIPTIONS: config.dynamodb.subscriptionsTable,
  TOPICS: config.dynamodb.topicsTable,
  BLOCKS: config.dynamodb.blocksTable,
  PROGRESS: config.dynamodb.progressTable,
};

// Helper queries
export async function queryByUserId(table: string, userId: string) {
  const cmd = new QueryCommand({
    TableName: table,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  });
  return docClient.send(cmd);
}

export async function queryByIndex(table: string, indexName: string, key: string, value: any) {
  const cmd = new QueryCommand({
    TableName: table,
    IndexName: indexName,
    KeyConditionExpression: `${key} = :val`,
    ExpressionAttributeValues: { ':val': value },
  });
  return docClient.send(cmd);
}
