/**
 * Одноразово пересчитывает vk_key и tg_key из сохранённых полей vk / telegram
 * после исправления normalizeVkKey / normalizeTgKey (старые ключи вроде «im» или «s»).
 *
 * Запуск из папки server: node scripts/recompute-raffle-identity-keys.js
 */
import { prisma } from '../src/lib/prisma.js';
import { normalizeTgKey, normalizeVkKey } from '../src/lib/raffleIdentityKeys.js';

const rows = await prisma.raffleEntry.findMany({
  select: { id: true, vk: true, vkKey: true, telegram: true, tgKey: true }
});

let updated = 0;
let skipped = 0;
let failed = 0;

for (const row of rows) {
  const vkKey = normalizeVkKey(row.vk);
  const tgKey = normalizeTgKey(row.telegram);

  if (!vkKey || !tgKey) {
    skipped += 1;
    console.warn(
      `[пропуск id=${row.id}] не удалось получить ключи из vk="${row.vk}" telegram="${row.telegram}"`
    );
    continue;
  }

  if (vkKey === row.vkKey && tgKey === row.tgKey) {
    continue;
  }

  try {
    await prisma.raffleEntry.update({
      where: { id: row.id },
      data: { vkKey, tgKey }
    });
    updated += 1;
    console.log(`OK id=${row.id} vkKey ${row.vkKey} → ${vkKey} | tgKey ${row.tgKey} → ${tgKey}`);
  } catch (e) {
    failed += 1;
    console.error(`[конфликт уникальности id=${row.id}]`, e.message);
  }
}

console.log(`Готово: обновлено ${updated}, без изменений ${rows.length - updated - skipped - failed}, пропуск ${skipped}, ошибок ${failed}`);
await prisma.$disconnect();
