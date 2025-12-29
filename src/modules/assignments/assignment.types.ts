export type QuestionType = 'mcq' | 'code' | 'text';

export interface BaseQuestion {
    id: string; // Unique ID within the assignment
    type: QuestionType;
    text: string; // The question content
    points: number;
}

export interface MCQQuestion extends BaseQuestion {
    type: 'mcq';
    options: string[]; // ["Option A", "Option B", ...]
    correctOptionIndex: number; // 0-based index of the correct answer (Hidden from student)
}

export interface TestCase {
    input: string; // Stdin or Function Arguments
    expectedOutput: string; // Stdout or Return Value
    isHidden: boolean; // If true, don't show to student
}

export interface CodeQuestion extends BaseQuestion {
    type: 'code';
    language: string; // "python", "javascript", "typescript", "c", "cpp", "java"
    starterCode?: string;
    testCases?: TestCase[]; // For auto-validation
}

export interface TextQuestion extends BaseQuestion {
    type: 'text';
    // Manual grading usually, or regex match
    correctAnswerRegex?: string;
    explanation?: string; // Optional: Model answer
}

export type Question = MCQQuestion | CodeQuestion | TextQuestion;

export interface AssignmentPolicy {
    maxAttempts?: number; // Unlimited if undefined
    latePenaltyPercentPerDay?: number; // e.g. 10
    gracePeriodMinutes?: number; // e.g. 15
}

export interface Assignment {
    id: string;
    title: string;
    course: string;
    description: string;
    dueDate: string;
    totalPoints: number; // Sum of question points
    status?: 'draft' | 'published';

    // The Flexible List of Questions
    questions: Question[];

    // New: Policy Configuration
    policy?: AssignmentPolicy;

    // New: Question Bank Reference (Feature #4)
    fromBankId?: string;

    pk: string; // "ASSIGNMENT"
    sk?: string; // "ASSIGNMENT#{id}"

    created_at?: string;
    updated_at?: string;
    creator_id?: string;
}

// Submission Data
export interface CodeExecutionResult {
    passed: boolean;
    output: string;
    testCaseIndex: number; // Which test case?
    error?: string; // Runtime error
}

export interface UserAnswer {
    questionId: string;
    // For MCQ: index (number), For Code/Text: string
    answer: number | string;

    // Auto-grading results (calculated by backend)
    isCorrect?: boolean;
    pointsAwarded?: number;
    feedback?: string;

    // New: Code Execution Details (Feature #1)
    executionResults?: CodeExecutionResult[];

    // New: Manual Grading (Feature #3)
    manualScore?: number;
    graderComments?: string;
    needsGrading?: boolean; // Text answers default to true
}

export interface AssignmentProgress {
    userId: string;
    assignmentId: string;
    status: 'pending' | 'submitted' | 'graded' | 'overdue' | 'completed' | 'needs_review';

    answers: UserAnswer[]; // List of user's answers

    totalScore?: number; // Calculated score
    attemptCount: number; // New: Feature #2

    submittedAt?: string;
    gradedAt?: string;
    feedback?: string; // Overall feedback

    pk?: string;
    sk?: string;
}

export interface AssignmentWithProgress extends Omit<Assignment, 'status'> {
    status: AssignmentProgress['status'];
    progress?: AssignmentProgress;
}

export interface QuestionBankItem {
    id: string; // Global ID
    question: Question; // Reuse the flexible Question type

    tags: string[]; // e.g., ["python", "arrays", "easy"]
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';

    created_at: string;
    updated_at: string;

    pk: string; // "QUESTION_BANK"
    sk: string; // "QUESTION#{id}"
}
