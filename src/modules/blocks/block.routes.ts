import { Router } from 'express';
import { createBlock, getBlocks, updateBlock, deleteBlock } from './block.controller.js';
import { verifyFirebaseToken } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

router.post('/', verifyFirebaseToken, isAdmin, createBlock);
router.get('/:parentType/:parentId', verifyFirebaseToken, getBlocks);

router.put('/:id', verifyFirebaseToken, isAdmin, updateBlock);
router.delete('/:id', verifyFirebaseToken, isAdmin, deleteBlock);

export default router;
