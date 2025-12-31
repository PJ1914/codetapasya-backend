import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { LiveClass, LiveClassAttendance } from "./liveClass.types.js";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE!;

/**
 * Create a live class (Admin)
 */
export const createLiveClass = async (
  data: Omit<LiveClass, "liveClassId" | "createdAt" | "updatedAt" | "status">
): Promise<LiveClass> => {
  const liveClass: LiveClass = {
    liveClassId: uuid(),
    status: "SCHEDULED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `COURSE#${liveClass.courseId}`,
        SK: `LIVECLASS#${liveClass.liveClassId}`,
        ...liveClass
      }
    })
  );

  return liveClass;
};

/**
 * Get all live classes for a course
 */
export const getLiveClassesByCourse = async (courseId: string) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `COURSE#${courseId}`,
        ":sk": "LIVECLASS#"
      }
    })
  );

  return res.Items || [];
};

/**
 * Mark attendance when user joins
 */
export const markAttendance = async (
  liveClassId: string,
  userId: string
): Promise<void> => {
  const attendance: LiveClassAttendance = {
    liveClassId,
    userId,
    joinedAt: new Date().toISOString()
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `LIVECLASS#${liveClassId}`,
        SK: `USER#${userId}`,
        ...attendance
      }
    })
  );
};

/**
 * Upload recording & mark completed
 */
export const completeLiveClass = async (
  courseId: string,
  liveClassId: string,
  recordingUrl: string
): Promise<void> => {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `COURSE#${courseId}`,
        SK: `LIVECLASS#${liveClassId}`
      },
      UpdateExpression:
        "SET #s = :s, recordingUrl = :r, updatedAt = :u",
      ExpressionAttributeNames: {
        "#s": "status"
      },
      ExpressionAttributeValues: {
        ":s": "COMPLETED",
        ":r": recordingUrl,
        ":u": new Date().toISOString()
      }
    })
  );
};
