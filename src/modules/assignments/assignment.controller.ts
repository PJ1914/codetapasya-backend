import { Request, Response } from 'express';
import { AssignmentService } from './assignment.service.js';
import { AIService } from './ai.service.js';
import { QuestionBankService } from './question-bank.service.js';

export const generateQuestions = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const questions = await AIService.generateQuestions(prompt);
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getAssignments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const assignments = await AssignmentService.getAssignments(userId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const submitAssignment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const { answers } = req.body; // Expecting array of { questionId, answer }

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: "Answers array is required" });
        }

        const result = await AssignmentService.submitAssignment(userId, id, answers);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // Basic validation could go here
        if (!data.title || !data.course || !data.dueDate || !data.points) {
            return res.status(400).json({ error: "Missing required fields: title, course, dueDate, points" });
        }

        const result = await AssignmentService.createAssignment(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const result = await AssignmentService.updateAssignment(id, data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await AssignmentService.deleteAssignment(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const addQuestionToBank = async (req: Request, res: Response) => {
    try {
        const item = await QuestionBankService.addQuestion(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getQuestionsFromBank = async (req: Request, res: Response) => {
    try {
        const { tag, category } = req.query;
        const items = await QuestionBankService.getQuestions({
            tag: tag as string,
            category: category as string
        });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteQuestionFromBank = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await QuestionBankService.deleteQuestion(id);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Manual Grading Controllers
export const getSubmissionDetail = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params;
        const result = await AssignmentService.getSubmission(id, userId);
        if (!result) return res.status(404).json({ error: "Submission not found" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const gradeSubmission = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params;
        // grades: [{ questionId, pointsAwarded, feedback }]
        const { grades } = req.body;

        const result = await AssignmentService.gradeSubmission(id, userId, grades);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


export const getAssignmentDetail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const result = await AssignmentService.getAssignmentWithProgress(id, userId);

        if (!result) return res.status(404).json({ error: "Assignment not found" });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const debugAssignmentData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const assignment = await AssignmentService.getAssignmentById(id);
        if (!assignment) return res.status(404).json({ error: "Assignment not found" });

        // Return only grading-relevant info
        const debugInfo = assignment.questions?.map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            correctOptionIndexType: typeof q.correctOptionIndex
        }));

        res.json({ debugInfo });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const leaderboard = await AssignmentService.getLeaderboard(id);
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
