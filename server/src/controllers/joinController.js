import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createSchema = z.object({
  name: z.string().min(1).max(120),
  contact: z.string().min(1).max(200),
  message: z.string().min(1).max(4000)
});

async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('telegram notify', e);
  }
}

export const joinController = {
  async create(req, res) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });
    const { name, contact, message } = parsed.data;
    const row = await prisma.joinRequest.create({ data: { name, contact, message } });
    const text = `94 Club — заявка #${row.id}\nИмя: ${name}\nКонтакт: ${contact}\n\n${message}`;
    await notifyTelegram(text);
    res.status(201).json({ ok: true, id: row.id });
  },

  async list(req, res) {
    const page = Math.max(1, Number(req.query.page || 1) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20) || 20));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.joinRequest.findMany({ orderBy: { id: 'desc' }, skip, take: limit }),
      prisma.joinRequest.count()
    ]);
    res.json({ items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  }
};
