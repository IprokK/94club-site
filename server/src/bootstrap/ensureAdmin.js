import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

export async function ensureAdminUser({ login, password, role = 'admin' }) {
  if (!login || !password) return;

  const existing = await prisma.user.findUnique({ where: { login } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      login,
      passwordHash,
      role
    }
  });
}

