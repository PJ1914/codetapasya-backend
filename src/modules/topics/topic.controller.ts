import { Request, Response } from 'express';
import { TopicService } from './topic.service.js';
import { asyncHandler, BadRequestError, NotFoundError } from '../../middlewares/error.middleware.js';
import { validateCreateTopic, validateUpdateTopic } from './topic.validator.js';

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  validateCreateTopic(req.body);
  const topic = await TopicService.create(req.body);
  res.status(201).json(topic);
});

export const getTopics = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  if (!courseId) throw BadRequestError('courseId is required');
  const isAdmin = req.user?.role === 'admin';
  const topics = await TopicService.listByCourse(courseId, isAdmin);
  res.json(topics);
});

export const updateTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  validateUpdateTopic(req.body);
  const updated = await TopicService.update(id, req.body);
  if (!updated) throw NotFoundError('Topic not found');
  res.json(updated);
});

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const ok = await TopicService.delete(id);
  if (!ok) throw NotFoundError('Topic not found');
  res.status(204).send();
});
