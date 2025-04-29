// The-Human-Tech-Blog-Server/src/middleware/uploadMiddleware.ts
import { Request } from 'express';
import multer from 'multer';

// Aceitar somente imagens
const storage = multer.memoryStorage();
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images are allowed'));
};

const upload = multer({ storage, fileFilter });

export default upload;
