// src/routes/categoryRoutes.ts

import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPostsByCategorySlug,
  getCategoryBySlug,
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, authorizeRoles('admin', 'editor'), createCategory);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deleteCategory);
router.get('/:slug/posts', getPostsByCategorySlug);
router.get('/:slug', getCategoryBySlug);

export default router;
