// The-Human-Tech-Blog-Server/src/middleware/uploadMiddleware.ts

import { Request } from 'express';
import multer from 'multer';

// Armazena o buffer da imagem na memória para posterior upload ao Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
