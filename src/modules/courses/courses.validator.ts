import { CourseStatus } from '../../enums/CourseStatus.enum.js';

export const validateCreateCourse = (data: any): void => {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }
  if (!data.category || typeof data.category !== 'string') {
    throw new Error('Category is required');
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    throw new Error('Price must be a non-negative number');
  }
  if (typeof data.isPremium !== 'boolean') {
    throw new Error('isPremium must be a boolean');
  }
  if (data.tags && !Array.isArray(data.tags)) {
    throw new Error('Tags must be an array');
  }
};

export const validateUpdateCourse = (data: any): void => {
  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
    throw new Error('Title must be a non-empty string');
  }
  if (data.description !== undefined && (typeof data.description !== 'string' || data.description.trim().length === 0)) {
    throw new Error('Description must be a non-empty string');
  }
  if (data.category !== undefined && typeof data.category !== 'string') {
    throw new Error('Category must be a string');
  }
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    throw new Error('Price must be a non-negative number');
  }
  if (data.isPremium !== undefined && typeof data.isPremium !== 'boolean') {
    throw new Error('isPremium must be a boolean');
  }
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    throw new Error('Tags must be an array');
  }
};

/**
 * Validate status change with enum validation
 * Ensures only valid transitions are allowed
 */
export const validateStatusChange = (fromStatus: CourseStatus, toStatus: string): void => {
  const allowed = Object.values(CourseStatus) as string[];
  if (!allowed.includes(toStatus)) {
    throw new Error(`Invalid course status. Allowed: ${allowed.join(', ')}`);
  }

  // Optional: Define allowed state transitions
  const validTransitions: Record<CourseStatus, CourseStatus[]> = {
    [CourseStatus.DRAFT]: [CourseStatus.PUBLISHED, CourseStatus.ARCHIVED],
    [CourseStatus.PUBLISHED]: [CourseStatus.ARCHIVED, CourseStatus.DRAFT],
    [CourseStatus.ARCHIVED]: [CourseStatus.DRAFT, CourseStatus.PUBLISHED],
  };

  if (!validTransitions[fromStatus]?.includes(toStatus as CourseStatus)) {
    throw new Error(
      `Invalid status transition from ${fromStatus} to ${toStatus}. Allowed transitions: ${validTransitions[fromStatus]?.join(', ') || 'none'}`
    );
  }
};
