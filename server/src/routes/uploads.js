import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function createUploadsRouter({ uploadsDir, publicBaseUrl }) {
  ensureDir(uploadsDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 12) || '';
      const safeExt = ext.replace(/[^.\w]/g, '');
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }
  });

  const router = Router();

  router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE' });
    const url = `${publicBaseUrl}/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });

  return router;
}

