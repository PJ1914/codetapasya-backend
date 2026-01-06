import { Block } from './block.types.js';
import { generateId } from '../../../utils/id.util.js';
import { BlockType } from '../../enums/BlockType.enum.js';
import { ContentParent } from '../../enums/ContentParent.enum.js';

export class BlockService {
  // in-memory store for blocks (replace with DB integration later)
  private static store: Record<string, Block> = {};

  static async create(payload: Partial<Block>): Promise<Block> {
    const now = Date.now();
    const block: Block = {
      id: generateId('block'),
      parentType: payload.parentType ?? ContentParent.SUBTOPIC,
      parentId: payload.parentId ?? '',
      type: payload.type ?? BlockType.TEXT,
      data: payload.data ?? {},
      order: typeof payload.order === 'number' ? payload.order : 0,
      isPremium: !!payload.isPremium,
      ...payload,
      createdAt: now,
      updatedAt: now,
    } as Block;

    this.store[block.id] = block;
    return block;
  }

  static async listByParent(parentType: string, parentId: string, includePremium = false) {
    const blocks = Object.values(this.store).filter(b => b.parentType === parentType && b.parentId === parentId);
    const visible = includePremium ? blocks : blocks.filter(b => !b.isPremium);
    // sort by order then createdAt
    return visible.sort((a, b) => (a.order - b.order) || (a.createdAt - b.createdAt));
  }

  static async update(id: string, patch: Partial<Block>): Promise<Block | null> {
    const existing = this.store[id];
    if (!existing) return null;
    const updated: Block = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    } as Block;
    this.store[id] = updated;
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    if (!this.store[id]) return false;
    delete this.store[id];
    return true;
  }
}
