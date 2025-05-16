// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware'; // Changed from authorizeRoles

const router = express.Router();

router.get('/', getCategories);

// Changed all authorizeRoles('admin') to isAdmin
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
