import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRequired } from './middleware/auth.js';
import { createAuthRouter } from './routes/auth.js';
import { createEventsRouter } from './routes/events.js';
import { createGalleryRouter } from './routes/gallery.js';
import { createUploadsRouter } from './routes/uploads.js';
import { ensureAdminUser } from './bootstrap/ensureAdmin.js';
import { prisma } from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CORS_ORIGINS = String(process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const SERVE_FRONTEND = String(process.env.SERVE_FRONTEND || 'false').toLowerCase() === 'true';

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';
const ADMIN_ROLE = process.env.ADMIN_ROLE || 'admin';

// Prisma читает DATABASE_URL из env; для dev подстрахуемся
process.env.DATABASE_URL = DATABASE_URL;

const app = express();
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin, cb) => {
      // same-origin / server-to-server / curl
      if (!origin) return cb(null, true);
      if (CORS_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));

const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, { fallthrough: false }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', createAuthRouter({ jwtSecret: JWT_SECRET, jwtExpiresIn: JWT_EXPIRES_IN }));

const requireAuth = authRequired({ jwtSecret: JWT_SECRET });
app.use('/api/events', requireAuth, createEventsRouter());
app.use('/api/gallery', requireAuth, createGalleryRouter());
app.use('/api/uploads', requireAuth, createUploadsRouter({ uploadsDir, publicBaseUrl: PUBLIC_BASE_URL }));

if (SERVE_FRONTEND) {
  const distDir = path.resolve(__dirname, '../../dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

async function main() {
  await prisma.$connect();
  await ensureAdminUser({ login: ADMIN_LOGIN, password: ADMIN_PASSWORD, role: ADMIN_ROLE });
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${PUBLIC_BASE_URL} (port ${PORT})`);
  });
}

main().catch(async (e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

