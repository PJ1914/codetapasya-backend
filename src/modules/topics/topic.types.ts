export interface Topic {
  id: string;
  courseId: string;

  title: string;
  description?: string;
  order: number;

  isPublished: boolean;
  createdAt: number;
  updatedAt?: number;
}
