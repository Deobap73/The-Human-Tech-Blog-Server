// The-Human-Tech-Blog-Server/src/routes/commentModerationRoutes.ts

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
  listPendingComments,
  approveComment,
  rejectComment,
} from '../controllers/commentModerationController';

const router = express.Router();

router.get('/pending', protect, authorizeRoles('admin', 'editor'), listPendingComments);
router.patch('/:id/approve', protect, authorizeRoles('admin', 'editor'), approveComment);
router.patch('/:id/reject', protect, authorizeRoles('admin', 'editor'), rejectComment);

export default router;
