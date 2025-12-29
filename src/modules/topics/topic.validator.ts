import { BadRequestError } from '../../middlewares/error.middleware.js';

export const validateCreateTopic = (data: any): void => {
  if (!data || typeof data !== 'object') throw BadRequestError('Invalid payload');

  if (!data.courseId || typeof data.courseId !== 'string') {
    throw BadRequestError('courseId is required and must be a string');
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw BadRequestError('title is required and must be a non-empty string');
  }

  if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 0)) {
    throw BadRequestError('order must be a non-negative number');
  }

  if (data.isPublished !== undefined && typeof data.isPublished !== 'boolean') {
    throw BadRequestError('isPublished must be a boolean');
  }
};

export const validateUpdateTopic = (data: any): void => {
  if (!data || typeof data !== 'object') throw BadRequestError('Invalid payload');

  if (data.courseId !== undefined && typeof data.courseId !== 'string') {
    throw BadRequestError('courseId must be a string');
  }

  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
    throw BadRequestError('title must be a non-empty string');
  }

  if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 0)) {
    throw BadRequestError('order must be a non-negative number');
  }

  if (data.isPublished !== undefined && typeof data.isPublished !== 'boolean') {
    throw BadRequestError('isPublished must be a boolean');
  }
};
