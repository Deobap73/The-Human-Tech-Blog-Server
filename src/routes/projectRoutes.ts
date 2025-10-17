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

const router = Router();

// Public
router.get('/', listProjectsHandler);
router.get('/:slug', getProjectBySlugHandler);

// Admin CRUD (ligar autenticação do teu projeto quando quiseres)
// Ex.: import { authenticateJWT } from '../middleware/authMiddleware';
// Ex.: import { roleMiddleware } from '../middleware/roleMiddleware';
// router.post('/', authenticateJWT, roleMiddleware(['admin']), createProjectHandler);
router.post('/', createProjectHandler);
router.put('/:id', updateProjectHandler);
router.delete('/:id', deleteProjectHandler);

export default router;
