// The-Human-Tech-Blog-Server/src/routes/sponsor.routes.ts

import express from 'express';
import {
  createSponsor,
  getSponsors,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsor.controller';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getSponsors);
router.post('/', upload.single('logo'), createSponsor);
router.put('/:id', upload.single('logo'), updateSponsor);
router.delete('/:id', deleteSponsor);

export default router;
