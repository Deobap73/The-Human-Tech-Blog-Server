// /src/routes/userRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // import uploadMiddleware
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

// Agora aceita avatar por multipart/form-data
router.patch('/me', protect, upload.single('avatar'), updateMe);

export default router;
