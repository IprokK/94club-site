import { Router } from 'express';
import { galleryController } from '../controllers/galleryController.js';

export function createGalleryRouter({ requireAuth }) {
  const router = Router();
  router.get('/', galleryController.list);
  router.get('/:id', galleryController.get);
  router.post('/', requireAuth, galleryController.create);
  router.patch('/:id', requireAuth, galleryController.update);
  router.delete('/:id', requireAuth, galleryController.remove);
  return router;
}

