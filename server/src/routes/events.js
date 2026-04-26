import { Router } from 'express';
import { eventsController } from '../controllers/eventsController.js';

export function createEventsRouter() {
  const router = Router();
  router.get('/', eventsController.list);
  router.get('/:id', eventsController.get);
  router.post('/', eventsController.create);
  router.patch('/:id', eventsController.update);
  router.delete('/:id', eventsController.remove);
  return router;
}

