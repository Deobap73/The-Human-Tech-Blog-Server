// The-Human-Tech-Blog-Server/src/routes/postRoutes.ts

import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostBySlug,
} from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware'; // Changed from authorizeRoles
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/slug/:slug', getPostBySlug);

// Simplified to isAdmin since you don't want to use authorizeRoles
// Note: This loses the 'editor' role functionality from original
router.post('/', protect, isAdmin, createPost);
router.put('/:id', protect, isAdmin, updatePost);
router.delete('/:id', protect, isAdmin, deletePost);

router.post(
  '/upload',
  protect,
  isAdmin, // Changed from authorizeRoles('admin', 'editor')
  upload.single('image'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    try {
      const result = await uploadToCloudinary(req.file.buffer, 'posts');
      return res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error('[Cloudinary Upload]', error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  }
);

export default router;
