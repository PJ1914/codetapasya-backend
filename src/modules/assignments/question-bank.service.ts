import { dynamoDB } from '../../config/dynamo.js';
import { GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { QuestionBankItem, Question } from './assignment.types.js';
import crypto from 'crypto';

const TABLE_NAME = "codetapasya-assignments";

export class QuestionBankService {

    // Add a Question to the Bank
    static async addQuestion(data: any): Promise<QuestionBankItem> {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const item: QuestionBankItem = {
            id,
            question: {
                ...data.question,
                id: id // Ensure internal question ID matches bank ID
            },
            tags: data.tags || [],
            category: data.category || 'General',
            difficulty: data.difficulty || 'medium',
            created_at: now,
            updated_at: now,
            pk: "QUESTION_BANK",
            sk: `QUESTION#${id}`
        };

        await dynamoDB.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));

        return item;
    }

    // Get All Questions (with optional filters)
    static async getQuestions(filters?: { tag?: string; category?: string }): Promise<QuestionBankItem[]> {
        // Since it's a bank, we might have thousands. A Query is better than Scan.
        // We query by PK = "QUESTION_BANK"
        const result = await dynamoDB.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: { ":pk": "QUESTION_BANK" }
        }));

        let items = (result.Items || []) as QuestionBankItem[];

        // In-memory filtering (DynamoDB filtering is limited on non-key attributes without GSI)
        if (filters?.tag) {
            items = items.filter(q => q.tags.includes(filters.tag!));
        }
        if (filters?.category) {
            items = items.filter(q => q.category === filters.category);
        }

        return items;
    }

    // Get Single Question
    static async getQuestionById(id: string): Promise<QuestionBankItem | null> {
        const result = await dynamoDB.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: "QUESTION_BANK",
                SK: `QUESTION#${id}`
            }
        }));
        return (result.Item as QuestionBankItem) || null;
    }

    // Delete Question
    static async deleteQuestion(id: string) {
        await dynamoDB.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: "QUESTION_BANK",
                SK: `QUESTION#${id}`
            }
        }));
        return { message: "Question deleted" };
    }
}
