import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signJwt } from '../lib/auth.js';

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
});

export function createAuthController({ jwtSecret, jwtExpiresIn }) {
  return {
    async login(req, res) {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });

      const { login, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { login } });
      if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

      const token = signJwt(
        { sub: String(user.id), login: user.login, role: user.role },
        { secret: jwtSecret, expiresIn: jwtExpiresIn }
      );

      return res.json({
        token,
        user: { id: user.id, login: user.login, role: user.role }
      });
    }
  };
}

