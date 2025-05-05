// The-Human-Tech-Blog-Server/src/routes/bookmarkRoutes.ts

import express from 'express';
import { toggleBookmark, getBookmarks } from '../controllers/bookmarkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, toggleBookmark);
router.get('/', protect, getBookmarks);

export default router;
