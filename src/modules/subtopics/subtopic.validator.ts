import { BadRequestError } from '../../middlewares/error.middleware.js';

export const validateCreateSubTopic = (data: any): void => {
  if (!data || typeof data !== 'object') throw BadRequestError('Invalid payload');

  if (!data.topicId || typeof data.topicId !== 'string') {
    throw BadRequestError('topicId is required and must be a string');
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

  if (data.isLocked !== undefined && typeof data.isLocked !== 'boolean') {
    throw BadRequestError('isLocked must be a boolean');
  }
};

export const validateUpdateSubTopic = (data: any): void => {
  if (!data || typeof data !== 'object') throw BadRequestError('Invalid payload');

  if (data.topicId !== undefined && typeof data.topicId !== 'string') {
    throw BadRequestError('topicId must be a string');
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

  if (data.isLocked !== undefined && typeof data.isLocked !== 'boolean') {
    throw BadRequestError('isLocked must be a boolean');
  }
};
