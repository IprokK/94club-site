import { Router } from 'express';
import { raffleController } from '../controllers/raffleController.js';

export function createRaffleRouter({ requireAuth }) {
  const router = Router();

  router.get('/entries', requireAuth, raffleController.listEntries);
  router.patch('/entries/:id', requireAuth, raffleController.patchEntry);

  router.post('/entries', raffleController.createEntry);

  router.get('/winners', raffleController.getWinners);
  router.get('/stats', raffleController.getStats);

  router.post('/draw', requireAuth, raffleController.draw);

  return router;
}

