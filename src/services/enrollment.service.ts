/**
 * Enrollment Service
 * Handles user enrollment, unenrollment, and progress updates
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: number; // epoch seconds
  progressPercent: number;
}

export class EnrollmentService {
  /**
   * Enroll user into a course
   */
  static async enrollUser(
    userId: string,
    courseId: string
  ): Promise<void> {
    const enrollment: Enrollment = {
      userId,
      courseId,
      enrolledAt: Math.floor(Date.now() / 1000),
      progressPercent: 0
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `COURSE#${courseId}`,
          ...enrollment
        }
      })
    );
  }

  /**
   * Unenroll user from a course
   */
  static async unenrollUser(
    userId: string,
    courseId: string
  ): Promise<void> {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `COURSE#${courseId}`
        }
      })
    );
  }

  /**
   * Get enrollment details
   */
  static async getEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    const res = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `COURSE#${courseId}`
        }
      })
    );

    return (res.Item as Enrollment) || null;
  }

  /**
   * Update progress percentage
   */
  static async updateProgress(
    userId: string,
    courseId: string,
    progressPercent: number
  ): Promise<void> {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `COURSE#${courseId}`
        },
        UpdateExpression: "SET progressPercent = :p",
        ExpressionAttributeValues: {
          ":p": progressPercent
        }
      })
    );
  }
}

export default EnrollmentService;
