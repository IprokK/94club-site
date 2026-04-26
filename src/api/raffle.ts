import { apiFetch } from './client';

export type RaffleEntry = {
  id: number;
  name: string;
  vk: string | null;
  telegram: string | null;
  ticketNumber: string;
  createdAt: string;
};

export type RaffleWinner = {
  place: 1 | 2 | 3 | 4;
  createdAt: string;
  entry: { id: number; name: string; ticketNumber: string };
};

export type RaffleStats = { entries: number; winners: number };

export async function createRaffleEntry(input: { name: string; vk: string; telegram: string }) {
  return apiFetch<RaffleEntry>('/api/raffle/entries', {
    method: 'POST',
    body: JSON.stringify(input)
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

