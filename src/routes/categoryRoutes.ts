// /src/routes/categoryRoutes.ts
import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPostsByCategory, // NEW - suporta slug e id
  getCategoryBySlug, // LEGACY, pode remover depois se não usares
} from /*  getPostsByCategorySlug, */ '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, authorizeRoles('admin', 'editor'), createCategory);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deleteCategory);

// NOVO: suporta slug ou ObjectId
router.get('/:slugOrId/posts', getPostsByCategory);

// LEGACY: rota antiga, remove quando possível
// router.get('/:slug/posts', getPostsByCategorySlug);

router.get('/:slug', getCategoryBySlug);

export default router;
