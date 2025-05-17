// src/routes/adminSettingsRoutes.ts

import express from 'express';
import { getAdminSettings, updateAdminSettings } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getAdminSettings);
router.put('/', protect, updateAdminSettings);

export default router;
