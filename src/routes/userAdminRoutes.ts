// src/routes/userAdminRoutes.ts

import express from 'express';
import { isAdmin } from '../middleware/roleMiddleware';
import { listUsers, updateUserRole, updateUserStatus } from '../controllers/userAdminController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, isAdmin, listUsers);
router.patch('/:id/role', protect, isAdmin, updateUserRole);
router.patch('/:id/status', protect, isAdmin, updateUserStatus);

export default router;
