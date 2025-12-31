import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { QuizAttempt } from "./quiz.types.js";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export const saveQuizAttempt = async (attempt: QuizAttempt) => {
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `QUIZ#${attempt.quizId}`,
        SK: `ATTEMPT#${attempt.attemptId}`,
        ...attempt
      }
    })
  );
};

export const getUserAttempts = async (
  quizId: string,
  userId: string
): Promise<QuizAttempt[]> => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":pk": `QUIZ#${quizId}`,
        ":sk": "ATTEMPT#",
        ":uid": userId
      }
    })
  );

  return (res.Items as QuizAttempt[]) || [];
};
