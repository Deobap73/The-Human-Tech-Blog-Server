// The-Human-Tech-Blog-Server/src/middleware/uploadMiddleware.ts

import { Request } from 'express';
import multer from 'multer';

// Max size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allow image/* and PDF
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed'));
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
