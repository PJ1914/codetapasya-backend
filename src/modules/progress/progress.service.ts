import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { CourseProgress, TopicProgress } from "./progress.types.js";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

/**
 * Get progress for a user in a course
 */
export const getCourseProgress = async (
  userId: string,
  courseId: string
): Promise<CourseProgress | null> => {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROGRESS#${courseId}`
      }
    })
  );

  return (res.Item as CourseProgress) || null;
};

/**
 * Mark a topic as completed and update percentage
 */
export const markTopicCompleted = async (
  userId: string,
  courseId: string,
  topicId: string,
  totalTopics: number
): Promise<CourseProgress> => {
  const existing = await getCourseProgress(userId, courseId);

  let completedTopics: TopicProgress[] =
    existing?.completedTopics || [];

  // Prevent duplicate completion
  if (!completedTopics.find(t => t.topicId === topicId)) {
    completedTopics.push({
      topicId,
      completed: true,
      completedAt: new Date().toISOString()
    });
  }

  const progressPercent = Math.min(
    Math.round((completedTopics.length / totalTopics) * 100),
    100
  );

  const progress: CourseProgress = {
    userId,
    courseId,
    completedTopics,
    progressPercent,
    lastUpdatedAt: new Date().toISOString()
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `PROGRESS#${courseId}`,
        ...progress
      }
    })
  );

  return progress;
};

/**
 * Reset progress (admin / unenroll use-case)
 */
export const resetCourseProgress = async (
  userId: string,
  courseId: string
): Promise<void> => {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROGRESS#${courseId}`
      },
      UpdateExpression:
        "SET completedTopics = :ct, progressPercent = :p, lastUpdatedAt = :u",
      ExpressionAttributeValues: {
        ":ct": [],
        ":p": 0,
        ":u": new Date().toISOString()
      }
    })
  );
};
