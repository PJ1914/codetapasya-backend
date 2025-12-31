export type QuizStatus = "DRAFT" | "PUBLISHED";

export interface Quiz {
  quizId: string;
  courseId: string;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  questionId: string;
  quizId: string;
  type: "MCQ" | "MULTI_SELECT" | "TRUE_FALSE";
  question: string;
  options: string[];
  correctAnswer: number[]; // index-based (hidden from user)
  points: number;
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  userId: string;
  answers: number[][];
  score: number;
  maxScore: number;
  submittedAt: string;
}
