import { Request, Response } from 'express';
import { BlockService } from './block.service.js';
import { asyncHandler, BadRequestError, NotFoundError } from '../../middlewares/error.middleware.js';
import { validateCreateBlock, validateUpdateBlock } from './block.validator.js';

export const createBlock = asyncHandler(async (req: Request, res: Response) => {
  validateCreateBlock(req.body);
  const block = await BlockService.create(req.body);
  res.status(201).json(block);
});

export const getBlocks = asyncHandler(async (req: Request, res: Response) => {
  const { parentType, parentId } = req.params;
  if (!parentType || !parentId) throw BadRequestError('parentType and parentId are required');
  const blocks = await BlockService.listByParent(parentType, parentId, req.user?.isPremium ?? false);
  res.json(blocks);
});

export const updateBlock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  validateUpdateBlock(req.body);
  const updated = await BlockService.update(id, req.body);
  if (!updated) throw NotFoundError('Block not found');
  res.json(updated);
});

export const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const ok = await BlockService.delete(id);
  if (!ok) throw NotFoundError('Block not found');
  res.status(204).send();
});
