import { apiFetch } from './client';
import type { Paged } from './events';

export type GalleryDto = {
  id: number;
  title: string;
  tag: string;
  image: string;
  yandexDiskUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GalleryWriteBody = {
  title: string;
  tag: string;
  image: string;
  yandexDiskUrl?: string;
};

export function listGallery(params: { page: number; limit: number; q: string }) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('limit', String(params.limit));
  if (params.q) sp.set('q', params.q);
  return apiFetch<Paged<GalleryDto>>(`/api/gallery?${sp.toString()}`);
}

export function createGallery(input: GalleryWriteBody) {
  return apiFetch<GalleryDto>('/api/gallery', { method: 'POST', body: JSON.stringify(input) });
}

export function updateGallery(id: number, patch: Partial<GalleryWriteBody>) {
  return apiFetch<GalleryDto>(`/api/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function deleteGallery(id: number) {
  return apiFetch<null>(`/api/gallery/${id}`, { method: 'DELETE' });
}

