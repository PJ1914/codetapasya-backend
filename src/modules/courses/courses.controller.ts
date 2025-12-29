import { Request, Response } from 'express';
import { CourseService } from './courses.service.js';
import { validateCreateCourse, validateUpdateCourse, validateStatusChange } from './courses.validator.js';
import { CourseStatus } from '../../enums/CourseStatus.enum.js';
import { asyncHandler, BadRequestError, NotFoundError } from '../../middlewares/error.middleware.js';

/**
 * GET /courses - Get all published courses (visible to all authenticated users)
 */
export const getCourses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const courses = await CourseService.getPublishedCourses();
  res.json({
    success: true,
    data: courses,
    count: courses.length,
  });
});

/**
 * GET /admin/courses - Get all courses (admin only)
 */
export const getAllCourses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const courses = await CourseService.getAllCoursesForAdmin();
  res.json({
    success: true,
    data: courses,
    count: courses.length,
  });
});

/**
 * GET /courses/:courseId - Get course details (with enrollment check)
 */
export const getCourseDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const userId = (req as any).user?.uid;

  const course = await CourseService.getCourseById(courseId, userId);
  if (!course) {
    throw NotFoundError('Course not found');
  }

  // If course is not published and user is not admin, hide it
  const userRole = (req as any).user?.role;
  if (course.status !== CourseStatus.PUBLISHED && userRole !== 'admin') {
    throw NotFoundError('Course not available');
  }

  res.json({
    success: true,
    data: course,
  });
});

/**
 * POST /admin/courses - Create a new course (admin only)
 */
export const createCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  validateCreateCourse(req.body);
  const userId = (req as any).user?.uid;
  const course = await CourseService.createCourse(req.body, userId);
  res.status(201).json({
    success: true,
    data: course,
    message: 'Course created successfully',
  });
});

/**
 * PUT /admin/courses/:courseId - Update course metadata (admin only)
 */
export const updateCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  validateUpdateCourse(req.body);
  const updated = await CourseService.updateCourse(courseId, req.body);
  res.json({
    success: true,
    data: updated,
    message: 'Course updated successfully',
  });
});

/**
 * PATCH /admin/courses/:courseId/status - Change course status (admin only)
 */
export const changeCourseStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw BadRequestError('Status is required');
  }

  // Get current status first
  const course = await CourseService.getCourseById(courseId);
  if (!course) {
    throw NotFoundError('Course not found');
  }

  // Validate status transition
  validateStatusChange(course.status, status);

  const result = await CourseService.changeCourseStatus(courseId, status);
  res.json({
    success: true,
    data: result,
    message: `Course status changed to ${status}`,
  });
});

/**
 * DELETE /admin/courses/:courseId - Delete a course (admin only)
 */
export const deleteCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  await CourseService.deleteCourse(courseId);
  res.status(204).send();
});
