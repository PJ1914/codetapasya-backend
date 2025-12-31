/**
 * Aggregation Service
 * Handles analytics and dashboard-level aggregations
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export class AggregationService {
  /**
   * Get all courses a user is enrolled in
   */
  static async getUserEnrollments(userId: string) {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "COURSE#"
        }
      })
    );

    return res.Items || [];
  }

  /**
   * Get user quiz statistics
   * Requires a GSI where GSI1PK = USER#<userId>
   */
  static async getUserQuizStats(userId: string) {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`
        }
      })
    );

    const attempts = res.Items || [];

    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce(
      (sum: number, a: any) => sum + (a.score || 0),
      0
    );

    return {
      totalAttempts,
      totalScore
    };
  }

  /**
   * Get enrollment count for a course (Admin analytics)
   */
  static async getCourseEnrollmentCount(courseId: string): Promise<number> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: {
          ":pk": `COURSE#${courseId}`
        }
      })
    );

    return res.Items?.length || 0;
  }
}

export default AggregationService;

