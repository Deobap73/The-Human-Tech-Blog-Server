// The-Human-Tech-Blog-Server/src/routes/adminSettingsRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { getSettings, updateSettings } from '../controllers/adminSettingsController';
import { getAdminDashboard, getStats, getAdminLogs } from '../controllers/adminController';

const router = express.Router();

router.get('/', protect, isAdmin, getSettings); // <-- Novo endpoint GET
router.put('/', protect, isAdmin, updateSettings); // <-- Novo endpoint PUT
router.get('/dashboard', protect, isAdmin, getAdminDashboard);
router.get('/stats', protect, isAdmin, getStats);
router.get('/logs', protect, isAdmin, getAdminLogs);

export default router;
