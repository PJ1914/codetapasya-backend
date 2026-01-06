import { SubTopic } from './subtopic.types.js';
import { generateId } from '../../../utils/id.util.js';
import { AccessControlService } from '../../services/access-control.service.js';
import { CourseService } from '../courses/courses.service.js';
import { BadRequestError } from '../../middlewares/error.middleware.js';

export class SubTopicService {
  private static store: Record<string, SubTopic> = {};

  static async create(payload: Partial<SubTopic>): Promise<SubTopic> {
    const now = Date.now();
    const subtopic: SubTopic = {
      id: generateId('subtopic'),
      topicId: payload.topicId ?? '',
      title: payload.title ?? 'Untitled SubTopic',
      order: typeof payload.order === 'number' ? payload.order : 0,
      isPublished: !!payload.isPublished,
      isLocked: payload.isLocked,
      isPremiumLocked: payload.isPremiumLocked,
      ...payload,
      createdAt: now,
      updatedAt: now,
    } as SubTopic;

    this.store[subtopic.id] = subtopic;
    return subtopic;
  }

  static async listByTopic(topicId: string, isAdmin = false, user?: any) {
    const subtopics = Object.values(this.store)
      .filter(st => st.topicId === topicId && !st.deletedAt); // exclude soft-deleted
    
    let visible = subtopics;
    if (!isAdmin) {
      visible = subtopics.filter(st => st.isPublished);
      // Filter premium-locked content for non-premium users
      if (!AccessControlService.isSubscriptionActive(user)) {
        visible = visible.filter(st => !st.isPremiumLocked);
      }
    }
    return visible.sort((a, b) => (a.order - b.order) || (a.createdAt - b.createdAt));
  }

  static async update(id: string, patch: Partial<SubTopic>, user?: any): Promise<SubTopic | null> {
    const existing = this.store[id];
    if (!existing || existing.deletedAt) return null;

    // Check if course is archived - prevent updates
    if (patch.topicId || existing.topicId) {
      const topicId = patch.topicId || existing.topicId;
      // Note: This assumes CourseService exists and can fetch by topicId
      // Adjust this logic based on your actual course/topic relationship
      const courseStatus = await this.getCourseStatusByTopic(topicId);
      if (courseStatus === 'archived') {
        throw BadRequestError('Cannot update SubTopic when parent Course is archived');
      }
    }

    const updated: SubTopic = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    } as SubTopic;
    this.store[id] = updated;
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const existing = this.store[id];
    if (!existing || existing.deletedAt) return false;
    
    // Soft delete: set deletedAt timestamp
    this.store[id] = { ...existing, deletedAt: Date.now() };
    return true;
  }

  // Helper to get course status by topic (placeholder - adjust to your DB)
  private static async getCourseStatusByTopic(topicId: string): Promise<string | null> {
    // This is a placeholder. In production, query your database
    // For now, return null to allow operations
    return null;
  }
}
