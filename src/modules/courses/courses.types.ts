import { CourseStatus } from '../../enums/CourseStatus.enum.js';

export interface Course {
  courseId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  isPremium: boolean;
  status: CourseStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  enrollmentCount: number;
}

export interface Topic {
  topicId: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Block {
  blockId: string;
  topicId: string;
  courseId: string;
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive';
  title: string;
  content: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Enrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrolledAt: number;
  completionPercentage: number;
  lastAccessedAt?: number;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  isPremium: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  price?: number;
  isPremium?: boolean;
}

export interface ChangeCourseStatusInput {
  status: CourseStatus;
}
