export interface SubTopic {
  id: string;
  topicId: string;

  title: string;
  order: number;

  isPublished: boolean;
  isLocked?: boolean;
  isPremiumLocked?: boolean;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number; // soft-delete timestamp
}
