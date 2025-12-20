import { Router } from 'express';
import {
    getAssignments,
    submitAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    generateQuestions
} from './assignment.controller.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

import { isAuthenticated } from '../../middlewares/auth.middleware.js';

// Public / Student Routes
router.get('/', isAuthenticated, getAssignments);
router.post('/:id/submit', isAuthenticated, submitAssignment);

// Admin Routes
router.post('/generate', isAuthenticated, isAdmin, generateQuestions);
router.post('/', isAuthenticated, isAdmin, createAssignment);
router.put('/:id', isAuthenticated, isAdmin, updateAssignment);
router.delete('/:id', isAuthenticated, isAdmin, deleteAssignment);

// Question Bank Routes
// Question Bank Routes
import {
    addQuestionToBank, getQuestionsFromBank, deleteQuestionFromBank,
    getSubmissionDetail, gradeSubmission
} from './assignment.controller.js';

router.get('/questions/bank', isAuthenticated, isAdmin, getQuestionsFromBank);
router.post('/questions/bank', isAuthenticated, isAdmin, addQuestionToBank);
router.delete('/questions/bank/:id', isAuthenticated, isAdmin, deleteQuestionFromBank);

// Grading Routes (Admin)
router.get('/:id/submissions/:userId', isAuthenticated, isAdmin, getSubmissionDetail);
router.post('/:id/submissions/:userId/grade', isAuthenticated, isAdmin, gradeSubmission);

// Leaderboard Route (Student + Admin)
import { getLeaderboard, debugAssignmentData } from './assignment.controller.js';
router.get('/:id/leaderboard', isAuthenticated, getLeaderboard);

// DEBUG: Check Assignment Data (Admin)
// DEBUG: Check Assignment Data (Admin)
router.get('/:id/debug', isAuthenticated, debugAssignmentData);

// Student Detail View (Helper to fetch assignment + specific user progress)
import { getAssignmentDetail } from './assignment.controller.js';
router.get('/:id', isAuthenticated, getAssignmentDetail);

export default router;
