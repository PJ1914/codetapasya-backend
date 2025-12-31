import { Request, Response } from "express";
import { submitQuizAttempt } from "./quiz.service.js";
import { QuizQuestion } from "./quiz.types.js";

/**
 * POST /quizzes/:quizId/submit
 */
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.uid;
    const { questions, answers } = req.body;

    if (!questions || !answers) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const attempt = await submitQuizAttempt(
      quizId,
      userId,
      questions as QuizQuestion[],
      answers
    );

    return res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        score: attempt.score,
        maxScore: attempt.maxScore,
        submittedAt: attempt.submittedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Quiz submission failed" });
  }
};
