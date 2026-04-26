import jwt from 'jsonwebtoken';

export function signJwt(payload, { secret, expiresIn }) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt(token, { secret }) {
  return jwt.verify(token, secret);
}

export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

