import { v4 as uuid } from "uuid";
import { QuizAttempt, QuizQuestion } from "./quiz.types.js";
import { saveQuizAttempt } from "./quiz.attempts.js";

export const evaluateQuiz = (
  questions: QuizQuestion[],
  userAnswers: number[][]
) => {
  let score = 0;
  let maxScore = 0;

  questions.forEach((q, index) => {
    maxScore += q.points;

    const correct =
      JSON.stringify(q.correctAnswer.sort()) ===
      JSON.stringify((userAnswers[index] || []).sort());

    if (correct) score += q.points;
  });

  return { score, maxScore };
};

export const submitQuizAttempt = async (
  quizId: string,
  userId: string,
  questions: QuizQuestion[],
  answers: number[][]
): Promise<QuizAttempt> => {
  const { score, maxScore } = evaluateQuiz(questions, answers);

  const attempt: QuizAttempt = {
    attemptId: uuid(),
    quizId,
    userId,
    answers,
    score,
    maxScore,
    submittedAt: new Date().toISOString()
  };

  await saveQuizAttempt(attempt);
  return attempt;
};
