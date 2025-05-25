// The-Human-Tech-Blog-Server/src/routes/analyticsRoutes.ts
import express from 'express';
import { getKPIs } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// Somente admin/editor pode ver analytics avançada
router.get('/kpis', protect, authorizeRoles('admin', 'editor'), getKPIs);

export default router;
