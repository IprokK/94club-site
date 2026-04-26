import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';

export function createAuthRouter({ jwtSecret, jwtExpiresIn }) {
  const router = Router();
  const controller = createAuthController({ jwtSecret, jwtExpiresIn });

  router.post('/login', controller.login);
  return router;
}

