import { Router } from 'express';
import { joinController } from '../controllers/joinController.js';

export function createJoinRouter({ requireAuth }) {
  const router = Router();
  router.post('/', joinController.create);
  router.get('/', requireAuth, joinController.list);
  return router;
}
