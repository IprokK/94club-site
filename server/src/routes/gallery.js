import { Router } from 'express';
import { galleryController } from '../controllers/galleryController.js';

export function createGalleryRouter() {
  const router = Router();
  router.get('/', galleryController.list);
  router.get('/:id', galleryController.get);
  router.post('/', galleryController.create);
  router.patch('/:id', galleryController.update);
  router.delete('/:id', galleryController.remove);
  return router;
}

