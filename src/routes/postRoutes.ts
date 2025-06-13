// /src/routes/postRoutes.ts

import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostBySlug,
  publishDraft,
  searchPosts,
} from '../controllers/postController';
import { detectLanguage } from '../middleware/detectLanguage';
import { protect } from '../middleware/authMiddleware';
import { csrfWithLogging } from '../middleware/csrfMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/slug/:slug', detectLanguage, getPostBySlug);
router.get('/:id', getPostById);

router.post('/', protect, authorizeRoles('admin', 'editor'), csrfWithLogging, createPost);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), csrfWithLogging, updatePost);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), csrfWithLogging, deletePost);
router.post(
  '/publish/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  csrfWithLogging,
  publishDraft
);

// Image upload: multer needs to parse FormData BEFORE CSRF!
router.post(
  '/upload',
  protect,
  authorizeRoles('admin', 'editor'),
  upload.single('image'), // multer primeiro!
  csrfWithLogging, // csrf depois
  async (req, res) => {
    console.log('[postRoutes] POST /upload - Image upload attempt.');
    if (!req.file) {
      console.warn('[postRoutes] POST /upload - No image file provided.');
      return res.status(400).json({ message: 'No image file provided' });
    }
    try {
      console.log('[postRoutes] POST /upload - Uploading image to Cloudinary.');
      const result = await uploadToCloudinary(req.file.buffer, 'posts');
      console.log(`[postRoutes] POST /upload - Image uploaded. URL: ${result.secure_url}`);
      return res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error('[Cloudinary Upload]', error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  }
);

export default router;
