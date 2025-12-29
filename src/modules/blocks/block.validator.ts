import { BlockType } from '../../enums/BlockType.enum.js';
import { ContentParent } from '../../enums/ContentParent.enum.js';

export const validateCreateBlock = (data: any): void => {
  if (!data || typeof data !== 'object') throw new Error('Invalid payload');

  if (!data.parentType || !Object.values(ContentParent).includes(data.parentType)) {
    throw new Error('parentType is required and must be one of: ' + Object.values(ContentParent).join(', '));
  }

  if (!data.parentId || typeof data.parentId !== 'string') {
    throw new Error('parentId is required and must be a string');
  }

  if (!data.type || !Object.values(BlockType).includes(data.type)) {
    throw new Error('type is required and must be one of: ' + Object.values(BlockType).join(', '));
  }

  if (data.order === undefined || typeof data.order !== 'number' || data.order < 0) {
    throw new Error('order is required and must be a non-negative number');
  }

  if (data.isPremium !== undefined && typeof data.isPremium !== 'boolean') {
    throw new Error('isPremium must be a boolean');
  }
};

export const validateUpdateBlock = (data: any): void => {
  if (!data || typeof data !== 'object') throw new Error('Invalid payload');

  if (data.parentType !== undefined && !Object.values(ContentParent).includes(data.parentType)) {
    throw new Error('parentType must be one of: ' + Object.values(ContentParent).join(', '));
  }

  if (data.parentId !== undefined && typeof data.parentId !== 'string') {
    throw new Error('parentId must be a string');
  }

  if (data.type !== undefined && !Object.values(BlockType).includes(data.type)) {
    throw new Error('type must be one of: ' + Object.values(BlockType).join(', '));
  }

  if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 0)) {
    throw new Error('order must be a non-negative number');
  }

  if (data.isPremium !== undefined && typeof data.isPremium !== 'boolean') {
    throw new Error('isPremium must be a boolean');
  }
};


