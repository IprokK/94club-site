import { Router } from 'express';
import { eventsController } from '../controllers/eventsController.js';

export function createEventsRouter({ requireAuth }) {
  const router = Router();
  router.get('/', eventsController.list);
  router.get('/:id', eventsController.get);
  router.post('/', requireAuth, eventsController.create);
  router.patch('/:id', requireAuth, eventsController.update);
  router.delete('/:id', requireAuth, eventsController.remove);
  return router;
}

