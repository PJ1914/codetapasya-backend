export interface TopicProgress {
  topicId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedTopics: TopicProgress[];
  progressPercent: number;
  lastUpdatedAt: string;
}
