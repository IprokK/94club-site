import { apiFetch } from './client';

export type EventStatus = 'СКОРО' | 'ПРОШЛО' | 'ЧЕРНОВИК';

export type EventDto = {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export function toPublicEventStatus(s: EventStatus): 'Скоро' | 'Прошло' | 'Черновик' {
  if (s === 'ПРОШЛО') return 'Прошло';
  if (s === 'ЧЕРНОВИК') return 'Черновик';
  return 'Скоро';
}

export type Paged<T> = { items: T[]; page: number; limit: number; total: number; pages: number };

export function listEvents(params: { page: number; limit: number; q: string }) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('limit', String(params.limit));
  if (params.q) sp.set('q', params.q);
  return apiFetch<Paged<EventDto>>(`/api/events?${sp.toString()}`);
}

export function createEvent(input: Omit<EventDto, 'id' | 'createdAt' | 'updatedAt'>) {
  return apiFetch<EventDto>('/api/events', { method: 'POST', body: JSON.stringify(input) });
}

export function updateEvent(id: number, patch: Partial<Omit<EventDto, 'id' | 'createdAt' | 'updatedAt'>>) {
  return apiFetch<EventDto>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function deleteEvent(id: number) {
  return apiFetch<null>(`/api/events/${id}`, { method: 'DELETE' });
}

