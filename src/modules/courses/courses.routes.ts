import { Router } from 'express';
import {
  getCourses,
  getAllCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  changeCourseStatus,
  deleteCourse
} from './courses.controller.js';

import { verifyFirebaseToken } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';
import { isPremiumUser } from '../../middlewares/premium.middleware.js';

const router = Router();

/* USER ROUTES */
// Get all published courses (any authenticated user)
router.get('/courses', verifyFirebaseToken, getCourses);

// Get single course details - premium users only
router.get('/courses/:courseId', verifyFirebaseToken, isPremiumUser, getCourseDetails);

/* ADMIN ROUTES */
// Get all courses (draft, published, archived) - admin only
router.get('/admin/courses', verifyFirebaseToken, isAdmin, getAllCourses);

// Create a new course
router.post('/admin/courses', verifyFirebaseToken, isAdmin, createCourse);

// Update course metadata
router.put('/admin/courses/:courseId', verifyFirebaseToken, isAdmin, updateCourse);

// Change course status (Draft -> Published -> Archived)
router.patch('/admin/courses/:courseId/status', verifyFirebaseToken, isAdmin, changeCourseStatus);

// Delete a course permanently
router.delete('/admin/courses/:courseId', verifyFirebaseToken, isAdmin, deleteCourse);

export default router;
