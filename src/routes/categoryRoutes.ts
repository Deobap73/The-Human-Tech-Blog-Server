// ✅ The-Human-Tech-Blog-Server/src/routes/categoryRoutes.ts
import express from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  getPostsByCategorySlug,
  getCategoryBySlug,
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, authorizeRoles('admin', 'editor'), createCategory);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deleteCategory);
router.get('/:slug/posts', getPostsByCategorySlug);
router.get('/:slug', getCategoryBySlug);

export default router;
