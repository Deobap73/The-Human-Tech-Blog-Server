// ✅ The-Human-Tech-Blog-Server/src/routes/adminSettingsRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { getAdminDashboard, getStats, getActionLogs } from '../controllers/adminController';

const router = express.Router();

// ✅ Rotas protegidas com autenticação e autorização admin
router.get('/dashboard', protect, isAdmin, getAdminDashboard);
router.get('/stats', protect, isAdmin, getStats);
router.get('/logs', protect, isAdmin, getActionLogs);

export default router;
