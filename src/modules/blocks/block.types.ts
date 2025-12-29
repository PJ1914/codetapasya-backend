import { BlockType } from '../../enums/BlockType.enum.js';
import { ContentParent } from '../../enums/ContentParent.enum.js';

export interface Block {
  id: string;
  parentType: ContentParent; // subtopic | live_class | assignment
  parentId: string;

  type: BlockType; // text | image | video | quiz | interactive
  data: any;

  order: number;
  isPremium: boolean;

  createdAt: number;
  updatedAt: number;
}
