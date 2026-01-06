import { Topic } from './topic.types.js';
import { generateId } from '../../../utils/id.util.js';

export class TopicService {
  private static store: Record<string, Topic> = {};

  static async create(payload: Partial<Topic>): Promise<Topic> {
    const now = Date.now();
    const topic: Topic = {
      id: generateId('topic'),
      courseId: payload.courseId ?? '',
      title: payload.title ?? 'Untitled Topic',
      description: payload.description,
      order: typeof payload.order === 'number' ? payload.order : 0,
      isPublished: !!payload.isPublished,
      ...payload,
      createdAt: now,
      updatedAt: now,
    } as Topic;

    this.store[topic.id] = topic;
    return topic;
  }

  static async listByCourse(courseId: string, isAdmin = false) {
    const topics = Object.values(this.store).filter(t => t.courseId === courseId);
    const visible = isAdmin ? topics : topics.filter(t => t.isPublished);
    return visible.sort((a, b) => (a.order - b.order) || (a.createdAt - b.createdAt));
  }

  static async update(id: string, patch: Partial<Topic>): Promise<Topic | null> {
    const existing = this.store[id];
    if (!existing) return null;
    const updated: Topic = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    } as Topic;
    this.store[id] = updated;
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    if (!this.store[id]) return false;
    delete this.store[id];
    return true;
  }
}
