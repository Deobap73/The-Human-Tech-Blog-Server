// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express from 'express';
import { register } from '../controllers/authController'; // named import

const router = express.Router();
router.post('/register', register);
export default router;
