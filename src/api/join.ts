import { apiFetch } from './client';
import type { Paged } from './events';

export type JoinRequestDto = {
  id: number;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
};

export async function createJoinRequest(input: { name: string; contact: string; message: string }) {
  return apiFetch<{ ok: boolean; id: number }>('/api/join', { method: 'POST', body: JSON.stringify(input) });
}

export async function listJoinRequests(params: { page: number; limit: number }) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('limit', String(params.limit));
  return apiFetch<Paged<JoinRequestDto>>(`/api/join?${sp.toString()}`);
}
