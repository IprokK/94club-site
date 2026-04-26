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
    // Если backend обслуживает несколько доменов, лучше строить URL от запроса.
    // Nginx должен прокидывать X-Forwarded-Proto.
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    const base = publicBaseUrl || (host ? `${proto}://${host}` : '');
    const url = base ? `${base}/uploads/${req.file.filename}` : `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });

  return router;
}

