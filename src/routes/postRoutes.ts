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
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

// Rotas multilíngue e padrão
router.get('/', getPosts);
router.get('/search', searchPosts);
// Importante: detectLanguage antes do controller!
router.get('/:lang/posts/slug/:slug', detectLanguage, getPostBySlug);
router.get('/:id', getPostById);

router.post('/', protect, authorizeRoles('admin', 'editor'), createPost);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updatePost);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deletePost);
router.post('/publish/:id', protect, authorizeRoles('admin', 'editor'), publishDraft);

router.post(
  '/upload',
  protect,
  authorizeRoles('admin', 'editor'),
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
