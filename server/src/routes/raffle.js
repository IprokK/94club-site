import { Router } from 'express';
import { raffleController } from '../controllers/raffleController.js';

export function createRaffleRouter({ requireAuth }) {
  const router = Router();

  // публично: получение билета
  router.post('/entries', raffleController.createEntry);

  // публично: показать победителей/статы (можно использовать на лендинге)
  router.get('/winners', raffleController.getWinners);
  router.get('/stats', raffleController.getStats);

  // админ: розыгрыш
  router.post('/draw', requireAuth, raffleController.draw);

  return router;
}

