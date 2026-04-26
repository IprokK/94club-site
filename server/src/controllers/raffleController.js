import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const entryCreateSchema = z.object({
  name: z.string().min(2).max(80),
  vk: z.string().trim().min(2).max(120).optional().or(z.literal('')),
  telegram: z.string().trim().min(2).max(120).optional().or(z.literal(''))
});

function normalizeHandle(s) {
  const v = String(s || '').trim();
  return v ? v.replace(/^@/, '') : '';
}

function formatTicket(id) {
  return `#${String(id).padStart(4, '0')}`;
}

export const raffleController = {
  async createEntry(req, res) {
    const parsed = entryCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });

    const name = parsed.data.name.trim();
    const vk = normalizeHandle(parsed.data.vk);
    const telegram = normalizeHandle(parsed.data.telegram);

    if (!vk && !telegram) {
      return res.status(400).json({ error: 'NEED_VK_OR_TELEGRAM' });
    }

    // 1 билет на пользователя (по vk или telegram)
    const existing = await prisma.raffleEntry.findFirst({
      where: {
        OR: [
          vk ? { vk } : undefined,
          telegram ? { telegram } : undefined
        ].filter(Boolean)
      }
    });
    if (existing) {
      return res.status(409).json({ error: 'ALREADY_HAS_TICKET', ticketNumber: existing.ticketNumber });
    }

    const created = await prisma.$transaction(async (tx) => {
      // временный ticketNumber, обновим после получения id
      const entry = await tx.raffleEntry.create({
        data: { name, vk: vk || null, telegram: telegram || null, ticketNumber: 'PENDING' }
      });
      const ticketNumber = formatTicket(entry.id);
      return await tx.raffleEntry.update({
        where: { id: entry.id },
        data: { ticketNumber }
      });
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      vk: created.vk,
      telegram: created.telegram,
      ticketNumber: created.ticketNumber,
      createdAt: created.createdAt
    });
  },

  async getWinners(req, res) {
    const winners = await prisma.raffleWinner.findMany({
      orderBy: { place: 'asc' },
      include: { entry: true }
    });
    return res.json({
      winners: winners.map((w) => ({
        place: w.place,
        createdAt: w.createdAt,
        entry: {
          id: w.entry.id,
          name: w.entry.name,
          ticketNumber: w.entry.ticketNumber
        }
      }))
    });
  },

  async getStats(req, res) {
    const [entries, winners] = await Promise.all([
      prisma.raffleEntry.count(),
      prisma.raffleWinner.count()
    ]);
    res.json({ entries, winners });
  },

  async draw(req, res) {
    const place = Number(req.body?.place);
    if (![1, 2, 3, 4].includes(place)) return res.status(400).json({ error: 'BAD_PLACE' });

    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });

    const alreadyPlace = await prisma.raffleWinner.findUnique({ where: { place } });
    if (alreadyPlace) return res.status(409).json({ error: 'PLACE_ALREADY_DRAWN' });

    const alreadyWinnerIds = (await prisma.raffleWinner.findMany({ select: { entryId: true } })).map((x) => x.entryId);

    const pool = await prisma.raffleEntry.findMany({
      where: alreadyWinnerIds.length ? { id: { notIn: alreadyWinnerIds } } : undefined,
      select: { id: true }
    });

    if (!pool.length) return res.status(409).json({ error: 'NO_ENTRIES_LEFT' });

    const pick = pool[Math.floor(Math.random() * pool.length)];

    const winner = await prisma.raffleWinner.create({
      data: { place, entryId: pick.id },
      include: { entry: true }
    });

    return res.status(201).json({
      place: winner.place,
      entry: {
        id: winner.entry.id,
        name: winner.entry.name,
        ticketNumber: winner.entry.ticketNumber
      },
      createdAt: winner.createdAt
    });
  }
};

