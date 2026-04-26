import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const patchSchema = z.object({
  calendarLabel: z.string().min(1).max(80),
  calendarPath: z.string().min(1).max(200)
});

function isSafeInternalPath(p) {
  if (!p.startsWith('/')) return false;
  if (p.includes('//')) return false;
  if (p.includes('..')) return false;
  if (p.includes(':')) return false;
  return true;
}

export const settingsController = {
  async get(req, res) {
    let row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!row) {
      row = await prisma.siteSettings.create({
        data: { id: 1, calendarLabel: 'календарь', calendarPath: '/events' }
      });
    }
    res.json({ calendarLabel: row.calendarLabel, calendarPath: row.calendarPath });
  },

  async update(req, res) {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });
    const { calendarLabel, calendarPath } = parsed.data;
    if (!isSafeInternalPath(calendarPath)) return res.status(400).json({ error: 'BAD_PATH' });
    const row = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, calendarLabel, calendarPath },
      update: { calendarLabel, calendarPath }
    });
    res.json({ calendarLabel: row.calendarLabel, calendarPath: row.calendarPath });
  }
};
