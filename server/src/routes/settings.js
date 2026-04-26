import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';

export function createSettingsRouter({ requireAuth }) {
  const router = Router();
  router.get('/', settingsController.get);
  router.patch('/', requireAuth, settingsController.update);
  return router;
}
