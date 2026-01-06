import { Request, Response } from 'express';
import { SubTopicService } from './subtopic.service.js';
import { asyncHandler, BadRequestError, NotFoundError } from '../../middlewares/error.middleware.js';
import { validateCreateSubTopic, validateUpdateSubTopic } from './subtopic.validator.js';

export const createSubTopic = asyncHandler(async (req: Request, res: Response) => {
  validateCreateSubTopic(req.body);
  const subtopic = await SubTopicService.create(req.body);
  res.status(201).json(subtopic);
});

export const getSubTopics = asyncHandler(async (req: Request, res: Response) => {
  const topicId = req.params.topicId as string;
  if (!topicId) throw BadRequestError('topicId is required');
  const isAdmin = req.user?.role === 'admin';
  const subtopics = await SubTopicService.listByTopic(topicId, isAdmin, req.user);
  res.json(subtopics);
});

export const updateSubTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  validateUpdateSubTopic(req.body);
  const updated = await SubTopicService.update(id, req.body, req.user);
  if (!updated) throw NotFoundError('SubTopic not found');
  res.json(updated);
});

export const deleteSubTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const ok = await SubTopicService.delete(id);
  if (!ok) throw NotFoundError('SubTopic not found');
  res.status(204).send();
});
