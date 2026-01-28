// ./src/routes/postRoutes.ts
'use strict';

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

// IMPORTANTE: Importar o middleware de normalização
import { normalizeInstagramImage } from '../middleware/normalizeInstagramImage';

const router = express.Router();

// Rotas públicas
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/slug/:slug', detectLanguage, getPostBySlug);
router.get('/:id', getPostById);

// Rotas protegidas - criação de post
router.post(
  '/',
  protect,
  authorizeRoles('admin', 'editor'),
  normalizeInstagramImage, // <-- ADICIONAR AQUI: normaliza instagramImage para string
  csrfWithLogging,
  createPost,
);

// Rotas protegidas - atualização de post
router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  normalizeInstagramImage, // <-- ADICIONAR AQUI: normaliza instagramImage para string
  csrfWithLogging,
  updatePost,
);

// Rotas protegidas - exclusão de post
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), csrfWithLogging, deletePost);

// Rota para publicar draft
router.post(
  '/publish/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  csrfWithLogging,
  publishDraft,
);

// Rota de upload de imagem (mantida para compatibilidade)
router.post(
  '/upload',
  protect,
  authorizeRoles('admin', 'editor'),
  upload.single('image'),
  csrfWithLogging,
  async (req, res) => {
    console.log('[postRoutes] POST /upload - Image upload attempt.');

    if (!req.file) {
      console.warn('[postRoutes] POST /upload - No image file provided.');
      return res.status(400).json({ message: 'No image file provided' });
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer, 'posts');
      return res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error('[Cloudinary Upload]', error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
);

export default router;
