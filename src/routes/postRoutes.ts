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
import { authorizeRoles } from '../middleware/roleMiddleware';
// CSRF is already applied globally in app.ts!
// import { csrfWithLogging } from '../middleware/csrfMiddleware';
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

console.log('[postRoutes] Post routes loaded.'); // Added debug log

router.get('/', getPosts);
console.log('[postRoutes] GET / - Get all posts route registered.');

router.get('/search', searchPosts);
console.log('[postRoutes] GET /search - Search posts route registered.');

router.get('/slug/:slug', detectLanguage, getPostBySlug);
console.log('[postRoutes] GET /slug/:slug - Get post by slug route registered.');

router.get('/:id', getPostById);
console.log('[postRoutes] GET /:id - Get post by ID route registered.');

router.post('/', protect, authorizeRoles('admin', 'editor'), createPost);
console.log('[postRoutes] POST / - Create post route registered (admin/editor).');

router.put('/:id', protect, authorizeRoles('admin', 'editor'), updatePost);
console.log('[postRoutes] PUT /:id - Update post route registered (admin/editor).');

router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deletePost);
console.log('[postRoutes] DELETE /:id - Delete post route registered (admin/editor).');

router.post('/publish/:id', protect, authorizeRoles('admin', 'editor'), publishDraft);
console.log('[postRoutes] POST /publish/:id - Publish draft route registered (admin/editor).');

// (OPCIONAL) POST /api/posts/upload — Upload image for posts
router.post(
  '/upload',
  protect,
  authorizeRoles('admin', 'editor'),
  upload.single('image'),
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
console.log('[postRoutes] POST /upload - Image upload route registered.');

export default router;
