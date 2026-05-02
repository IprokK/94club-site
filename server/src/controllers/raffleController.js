import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { normalizeTgKey, normalizeVkKey } from '../lib/raffleIdentityKeys.js';

/** Ключи сообщества VK / канала TG (через запятую в RAFFLE_BLOCKED_VK_KEYS / RAFFLE_BLOCKED_TG_KEYS), чтобы не принимать «общую» ссылку клуба как личную */
function parseCommaBlockedKeys(raw) {
  return new Set(
    String(raw ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

const RAFFLE_BLOCKED_VK_KEYS = parseCommaBlockedKeys(process.env.RAFFLE_BLOCKED_VK_KEYS);
const RAFFLE_BLOCKED_TG_KEYS = parseCommaBlockedKeys(process.env.RAFFLE_BLOCKED_TG_KEYS);

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

/** Ключ ФИО: без лишних пробелов, нижний регистр */
function normalizeFioKey(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Возврат «того же билета» только если совпали все три ключа — иначе можно выдать чужую заявку (общая ссылка на клуб). */
function matchesRaffleTriple(entry, nameKey, vkKey, tgKey) {
  return entry.nameKey === nameKey && entry.vkKey === vkKey && entry.tgKey === tgKey;
}

const TICKET_MIN = 1;
const TICKET_MAX = 9999;
/** Сначала пробуем только «красивые» (ABBA / четыре одинаковые цифры). */
const TICKET_PRETTY_ATTEMPTS = 250;
/** Если мест в этом подмножестве не хватает или номера заняты старыми записями — любой свободный 0001–9999. */
const TICKET_ANY_ATTEMPTS = 600;

function formatTicket(n) {
  return `#${String(n).padStart(4, '0')}`;
}

function makePrettyTicketNumber() {
  // "Красивые" номера:
  // - одинаковые цифры: 1111..9999
  // - зеркальные (палиндром 4 цифры): ABBA, включая ведущий 0 (например, 0110)
  //
  // Важно: ticketNumber хранится как строка, но форматируем строго 4 цифры.
  const pick = randomInt(0, 10);

  // ~20% — одинаковые цифры
  if (pick < 2) {
    const d = randomInt(1, 10); // 1..9 (0000 запрещаем)
    return formatTicket(Number(`${d}${d}${d}${d}`));
  }

  // ~80% — палиндром ABBA (00..99), кроме 0000
  while (true) {
    const a = randomInt(0, 10);
    const b = randomInt(0, 10);
    if (a === 0 && b === 0) continue; // 0000
    const n = Number(`${a}${b}${b}${a}`);
    if (n < TICKET_MIN || n > TICKET_MAX) continue;
    return formatTicket(n);
  }
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

/** Ответ публичной формы розыгрыша (без админ-полей). При повторе VK/TG — флаг alreadyHadTicket. */
function entryToPublicJson(entry, { recovered = false } = {}) {
  const o = {
    id: entry.id,
    name: entry.name,
    vk: entry.vk,
    telegram: entry.telegram,
    ticketNumber: entry.ticketNumber,
    createdAt: entry.createdAt
  };
  if (recovered) o.alreadyHadTicket = true;
  return o;
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

    if (!nameKey) {
      return res.status(400).json({ error: 'NEED_NAME_VK_TELEGRAM' });
    }
    if (!vkKey) {
      return res.status(400).json({ error: 'NEED_VK_PROFILE_URL' });
    }
    if (!tgKey) {
      return res.status(400).json({ error: 'NEED_TELEGRAM_HANDLE' });
    }

    if (RAFFLE_BLOCKED_VK_KEYS.size > 0 && RAFFLE_BLOCKED_VK_KEYS.has(vkKey)) {
      return res.status(400).json({ error: 'RAFFLE_USE_PERSONAL_VK' });
    }
    if (RAFFLE_BLOCKED_TG_KEYS.size > 0 && RAFFLE_BLOCKED_TG_KEYS.has(tgKey)) {
      return res.status(400).json({ error: 'RAFFLE_USE_PERSONAL_TELEGRAM' });
    }

    const dupVk = await prisma.raffleEntry.findUnique({ where: { vkKey } });
    if (dupVk) {
      if (matchesRaffleTriple(dupVk, nameKey, vkKey, tgKey)) {
        return res.status(200).json(entryToPublicJson(dupVk, { recovered: true }));
      }
      return res.status(409).json({ error: 'RAFFLE_VK_NOT_UNIQUE' });
    }
    const dupTg = await prisma.raffleEntry.findUnique({ where: { tgKey } });
    if (dupTg) {
      if (matchesRaffleTriple(dupTg, nameKey, vkKey, tgKey)) {
        return res.status(200).json(entryToPublicJson(dupTg, { recovered: true }));
      }
      return res.status(409).json({ error: 'RAFFLE_TG_NOT_UNIQUE' });
    }
    const dupName = await prisma.raffleEntry.findUnique({ where: { nameKey } });
    if (dupName) {
      if (matchesRaffleTriple(dupName, nameKey, vkKey, tgKey)) {
        return res.status(200).json(entryToPublicJson(dupName, { recovered: true }));
      }
      return res.status(409).json({ error: 'DUPLICATE_NAME' });
    }

    let created;
    try {
      created = await prisma.$transaction(async (tx) => {
        const maxAttempts = TICKET_PRETTY_ATTEMPTS + TICKET_ANY_ATTEMPTS;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const ticketNumber =
            attempt < TICKET_PRETTY_ATTEMPTS
              ? makePrettyTicketNumber()
              : formatTicket(randomInt(TICKET_MIN, TICKET_MAX + 1));
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
      // Два параллельных запроса с тем же VK обходят findUnique, но ловятся уникальным индексом.
      if (error?.code === 'P2002') {
        const [byVk, byTg, byName] = await Promise.all([
          prisma.raffleEntry.findUnique({ where: { vkKey } }),
          prisma.raffleEntry.findUnique({ where: { tgKey } }),
          prisma.raffleEntry.findUnique({ where: { nameKey } })
        ]);
        const recovered =
          byVk && matchesRaffleTriple(byVk, nameKey, vkKey, tgKey)
            ? byVk
            : byTg && matchesRaffleTriple(byTg, nameKey, vkKey, tgKey)
              ? byTg
              : byName && matchesRaffleTriple(byName, nameKey, vkKey, tgKey)
                ? byName
                : null;
        if (recovered) {
          return res.status(200).json(entryToPublicJson(recovered, { recovered: true }));
        }
        if (byVk) return res.status(409).json({ error: 'RAFFLE_VK_NOT_UNIQUE' });
        if (byTg) return res.status(409).json({ error: 'RAFFLE_TG_NOT_UNIQUE' });
        if (byName) return res.status(409).json({ error: 'DUPLICATE_NAME' });
      }
      throw error;
    }

    return res.status(201).json(entryToPublicJson(created));
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
