// The-Human-Tech-Blog-Server/src/routes/postRoutes.ts
import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);

// Protegidas
router.post('/', protect, authorizeRoles('admin', 'editor'), createPost);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updatePost);
router.delete('/:id', protect, authorizeRoles('admin'), deletePost);

export default router;
