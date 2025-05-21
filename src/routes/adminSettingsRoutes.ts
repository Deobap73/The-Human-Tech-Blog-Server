// ✅ The-Human-Tech-Blog-Server/src/routes/adminSettingsRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { getAdminDashboard, getStats, getAdminLogs } from '../controllers/adminController';

const router = express.Router();

// ✅ Todas as rotas protegidas com autenticação e autorização admin
router.get('/dashboard', protect, isAdmin, getAdminDashboard);
router.get('/stats', protect, isAdmin, getStats);
router.get('/logs', protect, isAdmin, getAdminLogs);

export default router;
