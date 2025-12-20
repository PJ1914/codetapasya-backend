import { dynamoDB } from '../../config/dynamo.js';
import { GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Assignment, AssignmentProgress, AssignmentWithProgress, UserAnswer, Question } from './assignment.types.js';
import { CodeExecutionService } from './code-execution.service.js';

const ASSIGNMENTS_TABLE = "codetapasya-assignments";
const USER_PROGRESS_TABLE = "codetapasya-userprogress";

export class AssignmentService {

    // Fetch all assignments (Sanitize answers for students)
    static async getAssignments(userId: string): Promise<AssignmentWithProgress[]> {
        try {
            // 1. Fetch Assignments
            const assignmentsResult = await dynamoDB.send(new QueryCommand({
                TableName: ASSIGNMENTS_TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": "ASSIGNMENTS" }
            }));

            const assignments = (assignmentsResult.Items || []) as any[];

            // 2. Fetch User Progress
            const progressResult = await dynamoDB.send(new QueryCommand({
                TableName: USER_PROGRESS_TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": `USER#${userId}` }
            }));

            const progressMap = new Map<string, any>();
            (progressResult.Items || []).forEach(item => {
                if (item.assignment_id) progressMap.set(item.assignment_id, item);
            });

            return assignments.map(a => {
                const progress = progressMap.get(a.assignment_id);

                // Map DB fields back to TS Types
                const questions: Question[] = a.questions || [];

                // SECURITY: Remove correct answers from questions before sending to frontend
                const sanitizedQuestions = questions.map(q => {
                    const sanitized = { ...q };
                    if (sanitized.type === 'mcq') {
                        delete (sanitized as any).correctOptionIndex;
                    }
                    if (sanitized.type === 'code') {
                        // Keep test cases but maybe hide hidden ones? For now keep all for transparency or remove outputs.
                    }
                    return sanitized;
                });

                return {
                    id: a.assignment_id,
                    title: a.title,
                    course: a.course,
                    description: a.description,
                    dueDate: a.due_date,
                    totalPoints: a.points, // Legacy mapping
                    questions: sanitizedQuestions,
                    status: progress ? (progress.status || 'pending').toLowerCase() : 'pending',
                    pk: a.PK,
                    progress: progress ? {
                        userId: progress.user_id,
                        assignmentId: progress.assignment_id,
                        status: progress.status,
                        answers: progress.answers || [],
                        totalScore: progress.total_score,
                        attemptCount: progress.attempts_count || 1,
                        submittedAt: progress.submitted_at
                    } : undefined
                };
            });

        } catch (error) {
            console.error("Error fetching assignments:", error);
            throw new Error("Failed to fetch assignments");
        }
    }

    // --- SUBMISSION with AUTO-VALIDATION ---
    static async submitAssignment(userId: string, assignmentId: string, userAnswers: UserAnswer[]) {
        // 1. Fetch original assignment to get correct answers
        const assignmentResult = await dynamoDB.send(new GetCommand({
            TableName: ASSIGNMENTS_TABLE,
            Key: {
                PK: "ASSIGNMENTS",
                SK: `ASSIGNMENT#${assignmentId}`
            }
        }));

        const assignment = assignmentResult.Item as any;
        if (!assignment) throw new Error("Assignment not found");

        const questions: Question[] = assignment.questions || [];
        let totalScore = 0;

        // 2. Validate Answers
        const gradedAnswers = await Promise.all(userAnswers.map(async (ans) => {
            const question = questions.find(q => q.id === ans.questionId);
            if (!question) return ans; // Unknown question?

            let isCorrect = false;
            let pAwarded = 0;

            // Validation Logic
            if (question.type === 'mcq') {
                const userAnswerStr = String(ans.answer).trim();
                const correctIndexStr = String(question.correctOptionIndex);

                // Check by Index
                if (userAnswerStr === correctIndexStr) {
                    isCorrect = true;
                    pAwarded = question.points;
                }
                // Strategy 2: Value Match (Fallback)
                else if (question.options && question.options[question.correctOptionIndex] === userAnswerStr) {
                    isCorrect = true;
                    pAwarded = question.points;
                }
            }
            else if (question.type === 'text') {
                // Basic Check 
                isCorrect = true;
            }
            else if (question.type === 'code') {
                const codeQuestion = question as any;
                if (codeQuestion.testCases && codeQuestion.testCases.length > 0) {
                    const validation = await CodeExecutionService.validateCodeSubmission(
                        codeQuestion.language,
                        String(ans.answer),
                        codeQuestion.testCases
                    );

                    isCorrect = validation.scorePercent === 1;
                    pAwarded = Math.round(question.points * validation.scorePercent);
                    (ans as any).executionResults = validation.results;

                } else {
                    const code = String(ans.answer || "").trim();
                    // Award 0 points if code is too short, assuming invalid
                    if (code.length < 5) {
                        isCorrect = false;
                        pAwarded = 0;
                    } else {
                        isCorrect = true;
                        pAwarded = question.points;
                    }
                }
            }

            if (pAwarded > 0) totalScore += pAwarded;

            return {
                ...ans,
                isCorrect,
                pointsAwarded: pAwarded,
                executionResults: (ans as any).executionResults
            };
        }));

        const now = new Date().toISOString();

        // Retrieve previous progress for attempt counting
        const previousProgress = await dynamoDB.send(new GetCommand({
            TableName: USER_PROGRESS_TABLE,
            Key: { PK: `USER#${userId}`, SK: `ASSIGNMENT#${assignmentId}` }
        }));

        const currentAttempt = (previousProgress.Item?.attempts_count || 0) + 1;

        // Policy Check: Max Attempts
        const policy = assignment.policy || {};
        if (policy.maxAttempts && currentAttempt > policy.maxAttempts) {
            throw new Error(`Maximum attempts (${policy.maxAttempts}) exceeded.`);
        }

        // Policy Check: Late Penalty
        if (assignment.due_date && new Date(now) > new Date(assignment.due_date)) {
            // Apply Penalty (10% deduction per policy default)
            const penaltyPercent = policy.latePenaltyPercentPerDay || 10;
            const deduction = Math.round(totalScore * (penaltyPercent / 100));
            totalScore = Math.max(0, totalScore - deduction);
        }

        const item = {
            PK: `USER#${userId}`,
            SK: `ASSIGNMENT#${assignmentId}`,
            assignment_id: assignmentId,
            user_id: userId,

            status: "Submitted",

            answers: gradedAnswers,
            total_score: totalScore,
            attempts_count: currentAttempt,

            submitted_at: now,
            updated_at: now
        };

        await dynamoDB.send(new PutCommand({
            TableName: USER_PROGRESS_TABLE,
            Item: item
        }));

        return {
            message: "Assignment submitted successfully",
            gradedAnswers,
            totalScore
        };
    }

    // Fetch Single Assignment with Progress (Student View)
    static async getAssignmentWithProgress(assignmentId: string, userId: string) {
        // 1. Get Assignment
        const result = await dynamoDB.send(new GetCommand({
            TableName: ASSIGNMENTS_TABLE,
            Key: {
                PK: "ASSIGNMENTS",
                SK: `ASSIGNMENT#${assignmentId}`
            }
        }));
        const assignment = result.Item;
        if (!assignment) return null;

        // 2. Get Progress
        const progressResult = await dynamoDB.send(new GetCommand({
            TableName: USER_PROGRESS_TABLE,
            Key: {
                PK: `USER#${userId}`,
                SK: `ASSIGNMENT#${assignmentId}`
            }
        }));
        const progress = progressResult.Item;

        // 3. Security Sanitize (remove correctOptionIndex)
        const questions: Question[] = assignment.questions || [];
        const sanitizedQuestions = questions.map(q => {
            const sanitized = { ...q };
            if (sanitized.type === 'mcq') {
                delete (sanitized as any).correctOptionIndex;
            }
            return sanitized;
        });

        return {
            ...assignment,
            questions: sanitizedQuestions,
            progress: progress ? {
                userId: progress.user_id,
                assignmentId: progress.assignment_id,
                status: progress.status,
                answers: progress.answers || [],
                totalScore: progress.total_score,
                attemptCount: progress.attempts_count || 0,
                submittedAt: progress.submitted_at
            } : null
        };
    }


    // Helper: Get Raw Assignment
    static async getAssignmentById(assignmentId: string) {
        const result = await dynamoDB.send(new GetCommand({
            TableName: ASSIGNMENTS_TABLE,
            Key: {
                PK: "ASSIGNMENTS",
                SK: `ASSIGNMENT#${assignmentId}`
            }
        }));
        return result.Item;
    }

    // Create Assignment (Admin)
    static async createAssignment(data: any) {
        const assignmentId = data.id || crypto.randomUUID();

        const item = {
            PK: "ASSIGNMENTS",
            SK: `ASSIGNMENT#${assignmentId}`,
            assignment_id: assignmentId,
            title: data.title,
            course: data.course,
            description: data.description,
            due_date: data.dueDate,
            points: data.totalPoints,
            questions: data.questions,
            policy: data.policy,
            created_at: new Date().toISOString(),
            status: 'published'
        };

        await dynamoDB.send(new PutCommand({
            TableName: ASSIGNMENTS_TABLE,
            Item: item
        }));

        return { message: "Assignment created successfully", id: assignmentId };
    }

    // ADMIN ONLY: Update
    static async updateAssignment(id: string, data: any) {
        // Simplify update for now: Overwrite essential fields
        // Managing complex list updates via UpdateExpression is hard. 
        // Recommended: Fetch -> Merge -> Put (Overwrite)

        // For this demo, let's assume we just Put (Replace) specific fields if we want robustness,
        // but let's stick to update attributes for simple fields

        const updateParts: string[] = [];
        const attrNames: Record<string, string> = {};
        const attrValues: Record<string, any> = {};

        if (data.questions) {
            updateParts.push("#q = :q");
            attrNames["#q"] = "questions";
            attrValues[":q"] = data.questions;
        }
        // ... other fields (title, etc) - keeping it brief for this iteration

        if (updateParts.length > 0) {
            await dynamoDB.send(new UpdateCommand({
                TableName: ASSIGNMENTS_TABLE,
                Key: { PK: "ASSIGNMENTS", SK: `ASSIGNMENT#${id}` },
                UpdateExpression: `SET ${updateParts.join(", ")}`,
                ExpressionAttributeNames: attrNames,
                ExpressionAttributeValues: attrValues
            }));
        }

        return { message: "Assignment updated" };
    }

    // ADMIN ONLY: Delete an assignment
    static async deleteAssignment(id: string) {
        await dynamoDB.send(new DeleteCommand({
            TableName: ASSIGNMENTS_TABLE,
            Key: {
                PK: "ASSIGNMENTS",
                SK: `ASSIGNMENT#${id}`
            }
        }));
        return { message: "Assignment deleted successfully" };
    }

    // --- MANUAL GRADING (Admin) ---

    // 1. Get a specific student's submission detail
    static async getSubmission(assignmentId: string, studentUserId: string) {
        // Fetch User Progress
        const result = await dynamoDB.send(new GetCommand({
            TableName: USER_PROGRESS_TABLE,
            Key: {
                PK: `USER#${studentUserId}`,
                SK: `ASSIGNMENT#${assignmentId}`
            }
        }));

        if (!result.Item) return null;
        return result.Item;
    }

    // 2. Update grades/feedback for a submission
    static async gradeSubmission(assignmentId: string, studentUserId: string, grades: {
        questionId: string;
        pointsAwarded: number;
        feedback?: string;
    }[]) {
        // 1. Fetch current submission
        const currentData = await this.getSubmission(assignmentId, studentUserId);
        if (!currentData) throw new Error("Submission not found");

        const answers = (currentData.answers || []) as UserAnswer[];
        let totalScore = 0;

        // 2. Update specific answers
        const updatedAnswers = answers.map(ans => {
            const gradeUpdate = grades.find(g => g.questionId === ans.questionId);

            if (gradeUpdate) {
                // Update score and feedback
                const newAns = {
                    ...ans,
                    pointsAwarded: gradeUpdate.pointsAwarded,
                    feedback: gradeUpdate.feedback,
                    manualScore: gradeUpdate.pointsAwarded, // Audit trail
                    needsGrading: false,
                    isCorrect: gradeUpdate.pointsAwarded > 0 // Simple heuristic
                };
                totalScore += newAns.pointsAwarded;
                return newAns;
            }

            // Keep existing score
            totalScore += (ans.pointsAwarded || 0);
            return ans;
        });

        // 3. Save back to DynamoDB
        const now = new Date().toISOString();

        await dynamoDB.send(new UpdateCommand({
            TableName: USER_PROGRESS_TABLE,
            Key: {
                PK: `USER#${studentUserId}`,
                SK: `ASSIGNMENT#${assignmentId}`
            },
            UpdateExpression: "SET answers = :a, total_score = :s, #st = :st, graded_at = :g",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: {
                ":a": updatedAnswers,
                ":s": totalScore,
                ":st": "Graded",
                ":g": now
            }
        }));

        return { message: "Grades updated successfully", totalScore };
    }

    // --- LEADERBOARD ---
    static async getLeaderboard(assignmentId: string) {
        // Ideally use a GSI (Global Secondary Index) on assignment_id + total_score for scale.
        // For now, prototype with Scan/Filter (Not scalable but functional for demo).
        // WARNING: In production, configure GSI: PK=assignment_id, SK=total_score (desc)

        // Using Scan with FilterExpression
        const command = new ScanCommand({
            TableName: USER_PROGRESS_TABLE,
            FilterExpression: "assignment_id = :aid",
            ExpressionAttributeValues: {
                ":aid": assignmentId
            }
        });

        const result = await dynamoDB.send(command);
        const items = (result.Items || []) as any[];

        // Sort by Score Descending in memory
        items.sort((a, b) => b.total_score - a.total_score);

        // Map to safe public structure
        return items.map((item, index) => ({
            rank: index + 1,
            userId: item.user_id, // In real app, join with Users service to get 'John Doe'
            score: item.total_score,
            submittedAt: item.submitted_at,
            status: item.status
        }));
    }
}
