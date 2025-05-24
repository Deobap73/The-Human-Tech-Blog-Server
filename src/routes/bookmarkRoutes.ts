// The-Human-Tech-Blog-Server/src/routes/bookmarkRoutes.ts

import express from 'express';
import { toggleBookmark, getBookmarks, deleteBookmark } from '../controllers/bookmarkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, toggleBookmark);
router.get('/', protect, getBookmarks);
router.delete('/:postId', protect, deleteBookmark);

export default router;
