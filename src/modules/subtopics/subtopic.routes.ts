import { Router } from 'express';
import { createSubTopic, getSubTopics, updateSubTopic, deleteSubTopic } from './subtopic.controller.js';
import { verifyFirebaseToken } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

router.post('/', verifyFirebaseToken, isAdmin, createSubTopic);
router.get('/:topicId', verifyFirebaseToken, getSubTopics);

router.put('/:id', verifyFirebaseToken, isAdmin, updateSubTopic);
router.delete('/:id', verifyFirebaseToken, isAdmin, deleteSubTopic);

export default router;
