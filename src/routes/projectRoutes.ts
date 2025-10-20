// /src/routes/projectRoutes.ts
'use strict';

import { Router } from 'express';
import {
  getProjectBySlugHandler,
  listProjectsHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Public
router.get('/', listProjectsHandler);
router.get('/:slug', getProjectBySlugHandler);

// Admin CRUD (JWT + admin)
router.post('/', protect, isAdmin, createProjectHandler);
router.put('/:id', protect, isAdmin, updateProjectHandler);
router.delete('/:id', protect, isAdmin, deleteProjectHandler);

export default router;
