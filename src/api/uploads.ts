import { apiFetch } from './client';

export async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append('image', file);
  return apiFetch<{ url: string }>('/api/uploads', { method: 'POST', body: fd });
}

