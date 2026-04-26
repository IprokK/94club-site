import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const statusSchema = z.enum(['СКОРО', 'ПРОШЛО', 'ЧЕРНОВИК']);

const eventCreateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  status: statusSchema.optional()
});

const eventUpdateSchema = eventCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'EMPTY_UPDATE'
});

function parseListParams(req) {
  const page = Math.max(1, Number(req.query.page || 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10) || 10));
  const q = String(req.query.q || '').trim();
  const skip = (page - 1) * limit;
  return { page, limit, skip, q };
}

export const eventsController = {
  async list(req, res) {
    const { page, limit, skip, q } = parseListParams(req);
    const where = q
      ? {
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { location: { contains: q } },
            { description: { contains: q } }
          ]
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { id: 'desc' }, skip, take: limit }),
      prisma.event.count({ where })
    ]);

    res.json({ items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  },

  async get(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'BAD_ID' });
    const item = await prisma.event.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(item);
  },

  async create(req, res) {
    const parsed = eventCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });
    const created = await prisma.event.create({ data: parsed.data });
    res.status(201).json(created);
  },

  async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'BAD_ID' });

    const parsed = eventUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });

    try {
      const updated = await prisma.event.update({ where: { id }, data: parsed.data });
      res.json(updated);
    } catch {
      res.status(404).json({ error: 'NOT_FOUND' });
    }
  },

  async remove(req, res) {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'BAD_ID' });
    try {
      await prisma.event.delete({ where: { id } });
      res.status(204).end();
    } catch {
      res.status(404).json({ error: 'NOT_FOUND' });
    }
  }
};

