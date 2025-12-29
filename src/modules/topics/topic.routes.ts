import { Router } from 'express';
import { createTopic, getTopics, updateTopic, deleteTopic } from './topic.controller.js';
import { verifyFirebaseToken } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

router.post('/', verifyFirebaseToken, isAdmin, createTopic);
router.get('/:courseId', verifyFirebaseToken, getTopics);

router.put('/:id', verifyFirebaseToken, isAdmin, updateTopic);
router.delete('/:id', verifyFirebaseToken, isAdmin, deleteTopic);

export default router;
