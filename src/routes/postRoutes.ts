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
// Se usares upload para imagens
import upload from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

// Busca todos os posts
router.get('/', getPosts);

// Busca posts por pesquisa (query param q=)
router.get('/search', searchPosts);

// Busca post multilíngue por slug (deteta idioma no middleware)
router.get('/slug/:slug', detectLanguage, getPostBySlug);

// Busca post por ID
router.get('/:id', getPostById);

// Criar post (apenas admin/editor)
router.post('/', protect, authorizeRoles('admin', 'editor'), createPost);

// Atualizar post (apenas admin/editor)
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updatePost);

// Apagar post (apenas admin/editor)
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deletePost);

// Publicar draft
router.post('/publish/:id', protect, authorizeRoles('admin', 'editor'), publishDraft);

// Opcional: upload de imagem

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
