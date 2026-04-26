import { getBearerToken, verifyJwt } from '../lib/auth.js';

export function authRequired({ jwtSecret }) {
  return (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

    try {
      const payload = verifyJwt(token, { secret: jwtSecret });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
  };
}

