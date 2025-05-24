// src/routes/userRoutes.ts

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getMe,
  getMyPosts,
  getMyDrafts,
  getMyBookmarks,
  getMyComments,
  updateMe,
} from '../controllers/userController';

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/me/posts', protect, getMyPosts);
router.get('/me/drafts', protect, getMyDrafts);
router.get('/me/bookmarks', protect, getMyBookmarks);
router.get('/me/comments', protect, getMyComments);
router.patch('/me', protect, updateMe);

export default router;
