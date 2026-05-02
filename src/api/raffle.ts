import { apiFetch } from './client';
import type { Paged } from './events';

export type RaffleEntry = {
  id: number;
  name: string;
  vk: string;
  telegram: string;
  ticketNumber: string;
  createdAt: string;
  /** Сервер вернул существующую запись (тот же VK или Telegram), без новой регистрации */
  alreadyHadTicket?: boolean;
};

export type RaffleEntryAdmin = {
  id: number;
  name: string;
  nameKey: string;
  vk: string;
  vkKey: string;
  telegram: string;
  tgKey: string;
  ticketNumber: string;
  createdAt: string;
  conditionVkOk: boolean;
  conditionTgOk: boolean;
  verifiedNote: string | null;
};

export type RaffleWinner = {
  place: 1 | 2 | 3 | 4;
  createdAt: string;
  entry: { id: number; name: string; ticketNumber: string };
};

export type RaffleStats = { entries: number; winners: number; eligible: number };

export async function createRaffleEntry(input: { name: string; vk: string; telegram: string }) {
  return apiFetch<RaffleEntry>('/api/raffle/entries', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function listRaffleEntriesAdmin(params: { page: number; limit: number; q: string }) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('limit', String(params.limit));
  if (params.q) sp.set('q', params.q);
  return apiFetch<Paged<RaffleEntryAdmin>>(`/api/raffle/entries?${sp.toString()}`);
}

export async function patchRaffleEntry(
  id: number,
  patch: { conditionVkOk?: boolean; conditionTgOk?: boolean; verifiedNote?: string | null }
) {
  return apiFetch<RaffleEntryAdmin>(`/api/raffle/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function getRaffleWinners() {
  return apiFetch<{ winners: RaffleWinner[] }>('/api/raffle/winners');
}

export async function getRaffleStats() {
  return apiFetch<RaffleStats>('/api/raffle/stats');
}

export async function drawWinner(place: 1 | 2 | 3 | 4) {
  return apiFetch<RaffleWinner>('/api/raffle/draw', {
    method: 'POST',
    body: JSON.stringify({ place })
  });
}
