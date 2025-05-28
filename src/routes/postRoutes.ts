// src/routes/postRoutes.ts

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
import { authorizeRoles } from '../middleware/roleMiddleware';
// Opcional: upload de imagens
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

console.log('[postRoutes] Post routes loaded.'); // Added debug log
// GET /api/posts          — List all posts
router.get('/', getPosts);
console.log('[postRoutes] GET / - Get all posts route registered.'); // Added debug log

// GET /api/posts/search?q= — Search posts
router.get('/search', searchPosts);
console.log('[postRoutes] GET /search - Search posts route registered.'); // Added debug log

// GET /api/posts/slug/:slug — Get post by slug (with language detection)
router.get('/slug/:slug', detectLanguage, getPostBySlug);
console.log('[postRoutes] GET /slug/:slug - Get post by slug route registered.'); // Added debug log

// GET /api/posts/:id      — Get post by ID
router.get('/:id', getPostById);
console.log('[postRoutes] GET /:id - Get post by ID route registered.'); // Added debug log

// POST /api/posts         — Create post (admin/editor only)
router.post('/', protect, authorizeRoles('admin', 'editor'), createPost);
console.log('[postRoutes] POST / - Create post route registered (admin/editor).'); // Added debug log

// PUT /api/posts/:id      — Update post (admin/editor only)
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updatePost);
console.log('[postRoutes] PUT /:id - Update post route registered (admin/editor).'); // Added debug log

// DELETE /api/posts/:id   — Delete post (admin/editor only)
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deletePost);
console.log('[postRoutes] DELETE /:id - Delete post route registered (admin/editor).'); // Added debug log

// POST /api/posts/publish/:id — Publish draft
router.post('/publish/:id', protect, authorizeRoles('admin', 'editor'), publishDraft);
console.log('[postRoutes] POST /publish/:id - Publish draft route registered (admin/editor).'); // Added debug log

// (Opcional) POST /api/posts/upload — Upload image for posts
router.post(
  '/upload',
  protect,
  authorizeRoles('admin', 'editor'),
  upload.single('image'),
  async (req, res) => {
    console.log('[postRoutes] POST /upload - Image upload attempt.'); // Added debug log
    if (!req.file) {
      console.warn('[postRoutes] POST /upload - No image file provided.'); // Added debug log
      return res.status(400).json({ message: 'No image file provided' });
    }
    try {
      console.log('[postRoutes] POST /upload - Uploading image to Cloudinary.'); // Added debug log
      const result = await uploadToCloudinary(req.file.buffer, 'posts');
      console.log(`[postRoutes] POST /upload - Image uploaded. URL: ${result.secure_url}`); // Added debug log
      return res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error('[Cloudinary Upload]', error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  }
);
console.log('[postRoutes] POST /upload - Image upload route registered.'); // Added debug log

export default router;
