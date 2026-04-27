import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const entryCreateSchema = z.object({
  name: z.string().min(2).max(120),
  vk: z.string().min(1).max(200),
  telegram: z.string().min(1).max(200)
});

const entryPatchSchema = z
  .object({
    conditionVkOk: z.boolean().optional(),
    conditionTgOk: z.boolean().optional(),
    verifiedNote: z.union([z.string().max(800), z.null()]).optional()
  })
  .refine((v) => v.conditionVkOk !== undefined || v.conditionTgOk !== undefined || v.verifiedNote !== undefined, {
    message: 'EMPTY_PATCH'
  });

function normalizeHandle(s) {
  const v = String(s || '').trim();
  return v ? v.replace(/^@/, '') : '';
}

/** Ключ ФИО: без лишних пробелов, нижний регистр */
function normalizeFioKey(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Ключ VK: ник/путь без домена и лишнего */
function normalizeVkKey(s) {
  let v = normalizeHandle(s);
  if (!v) return '';
  v = v.toLowerCase();
  v = v.replace(/^https?:\/\//, '');
  v = v.replace(/^m\./, '');
  v = v.replace(/^vk\.com\//, '');
  v = v.replace(/^vkontakte\.ru\//, '');
  v = v.split('?')[0].split('/')[0];
  v = v.replace(/\/$/, '');
  return v;
}

/** Ключ Telegram */
function normalizeTgKey(s) {
  let v = normalizeHandle(s).toLowerCase();
  v = v.replace(/^https?:\/\//, '');
  v = v.replace(/^t\.me\//, '');
  v = v.split('?')[0].split('/')[0];
  return v;
}

const TICKET_MIN = 1;
const TICKET_MAX = 9999;
const TICKET_GENERATION_ATTEMPTS = 40;

function formatTicket(n) {
  return `#${String(n).padStart(4, '0')}`;
}

function makeRandomTicketNumber() {
  return formatTicket(randomInt(TICKET_MIN, TICKET_MAX + 1));
}

function isTicketNumberConflict(error) {
  if (error?.code !== 'P2002') return false;
  const target = error?.meta?.target;
  if (Array.isArray(target)) return target.includes('ticketNumber') || target.includes('ticket_number');
  return String(target || '').includes('ticketNumber') || String(target || '').includes('ticket_number');
}

function parseListParams(req) {
  const page = Math.max(1, Number(req.query.page || 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20) || 20));
  const q = String(req.query.q || '').trim();
  const skip = (page - 1) * limit;
  return { page, limit, skip, q };
}

function entryToJson(e) {
  return {
    id: e.id,
    name: e.name,
    nameKey: e.nameKey,
    vk: e.vk,
    vkKey: e.vkKey,
    telegram: e.telegram,
    tgKey: e.tgKey,
    ticketNumber: e.ticketNumber,
    createdAt: e.createdAt,
    conditionVkOk: e.conditionVkOk,
    conditionTgOk: e.conditionTgOk,
    verifiedNote: e.verifiedNote
  };
}

export const raffleController = {
  async listEntries(req, res) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const { page, limit, skip, q } = parseListParams(req);
    const where = q
      ? {
          OR: [
            { name: { contains: q } },
            { vk: { contains: q } },
            { telegram: { contains: q } },
            { ticketNumber: { contains: q } }
          ]
        }
      : undefined;
    const [items, total] = await Promise.all([
      prisma.raffleEntry.findMany({ where, orderBy: { id: 'desc' }, skip, take: limit }),
      prisma.raffleEntry.count({ where })
    ]);
    return res.json({
      items: items.map(entryToJson),
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit))
    });
  },

  async patchEntry(req, res) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'BAD_ID' });
    const parsed = entryPatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });
    const data = {};
    if (parsed.data.conditionVkOk !== undefined) data.conditionVkOk = parsed.data.conditionVkOk;
    if (parsed.data.conditionTgOk !== undefined) data.conditionTgOk = parsed.data.conditionTgOk;
    if (parsed.data.verifiedNote !== undefined) data.verifiedNote = parsed.data.verifiedNote;
    try {
      const updated = await prisma.raffleEntry.update({ where: { id }, data });
      return res.json(entryToJson(updated));
    } catch {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
  },

  async createEntry(req, res) {
    const parsed = entryCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });

    const nameRaw = parsed.data.name.trim();
    const vkRaw = parsed.data.vk.trim();
    const tgRaw = parsed.data.telegram.trim();

    const nameKey = normalizeFioKey(nameRaw);
    const vkKey = normalizeVkKey(vkRaw);
    const tgKey = normalizeTgKey(tgRaw);

    if (!nameKey || !vkKey || !tgKey) {
      return res.status(400).json({ error: 'NEED_NAME_VK_TELEGRAM' });
    }

    const dupName = await prisma.raffleEntry.findUnique({ where: { nameKey } });
    if (dupName) {
      return res.status(409).json({ error: 'DUPLICATE_NAME', ticketNumber: dupName.ticketNumber });
    }
    const dupVk = await prisma.raffleEntry.findUnique({ where: { vkKey } });
    if (dupVk) {
      return res.status(409).json({ error: 'DUPLICATE_VK', ticketNumber: dupVk.ticketNumber });
    }
    const dupTg = await prisma.raffleEntry.findUnique({ where: { tgKey } });
    if (dupTg) {
      return res.status(409).json({ error: 'DUPLICATE_TELEGRAM', ticketNumber: dupTg.ticketNumber });
    }

    let created;
    try {
      created = await prisma.$transaction(async (tx) => {
        for (let attempt = 0; attempt < TICKET_GENERATION_ATTEMPTS; attempt += 1) {
          const ticketNumber = makeRandomTicketNumber();
          const existingTicket = await tx.raffleEntry.findUnique({
            where: { ticketNumber },
            select: { id: true }
          });
          if (existingTicket) continue;

          try {
            return await tx.raffleEntry.create({
              data: {
                name: nameRaw,
                nameKey,
                vk: vkRaw,
                vkKey,
                telegram: tgRaw,
                tgKey,
                ticketNumber,
                conditionVkOk: false,
                conditionTgOk: false
              }
            });
          } catch (error) {
            if (isTicketNumberConflict(error)) continue;
            throw error;
          }
        }
        throw new Error('TICKET_POOL_EXHAUSTED');
      });
    } catch (error) {
      if (error?.message === 'TICKET_POOL_EXHAUSTED') {
        return res.status(409).json({ error: 'NO_FREE_TICKET_NUMBERS' });
      }
      throw error;
    }

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
    const [entries, winners, eligible] = await Promise.all([
      prisma.raffleEntry.count(),
      prisma.raffleWinner.count(),
      prisma.raffleEntry.count({ where: { conditionVkOk: true, conditionTgOk: true } })
    ]);
    res.json({ entries, winners, eligible });
  },

  async draw(req, res) {
    const place = Number(req.body?.place);
    if (![1, 2, 3, 4].includes(place)) return res.status(400).json({ error: 'BAD_PLACE' });

    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });

    const alreadyPlace = await prisma.raffleWinner.findUnique({ where: { place } });
    if (alreadyPlace) return res.status(409).json({ error: 'PLACE_ALREADY_DRAWN' });

    const alreadyWinnerIds = (await prisma.raffleWinner.findMany({ select: { entryId: true } })).map((x) => x.entryId);

    const baseWhere = {
      conditionVkOk: true,
      conditionTgOk: true
    };
    const where = alreadyWinnerIds.length
      ? { ...baseWhere, id: { notIn: alreadyWinnerIds } }
      : baseWhere;

    const pool = await prisma.raffleEntry.findMany({
      where,
      select: { id: true }
    });

    if (!pool.length) {
      return res.status(409).json({ error: 'NO_ELIGIBLE_ENTRIES' });
    }

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
