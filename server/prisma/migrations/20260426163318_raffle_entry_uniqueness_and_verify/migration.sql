-- Перенос raffle_entries: уникальные ключи + флаги проверки условий
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_raffle_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "name_key" TEXT NOT NULL,
    "vk" TEXT NOT NULL,
    "vk_key" TEXT NOT NULL,
    "telegram" TEXT NOT NULL,
    "tg_key" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition_vk_ok" BOOLEAN NOT NULL DEFAULT false,
    "condition_tg_ok" BOOLEAN NOT NULL DEFAULT false,
    "verified_note" TEXT
);

INSERT INTO "new_raffle_entries" (
  "id", "name", "name_key", "vk", "vk_key", "telegram", "tg_key",
  "ticket_number", "created_at", "condition_vk_ok", "condition_tg_ok", "verified_note"
)
SELECT
  "id",
  "name",
  trim(lower("name")) || '-' || "id" AS "name_key",
  coalesce("vk", '') AS "vk",
  CASE
    WHEN "vk" IS NULL OR trim("vk") = '' THEN 'vk-legacy-' || "id"
    ELSE trim(lower(replace("vk", '@', ''))) || '-' || "id"
  END AS "vk_key",
  coalesce("telegram", '') AS "telegram",
  CASE
    WHEN "telegram" IS NULL OR trim("telegram") = '' THEN 'tg-legacy-' || "id"
    ELSE trim(lower(replace("telegram", '@', ''))) || '-' || "id"
  END AS "tg_key",
  "ticket_number",
  "created_at",
  0,
  0,
  NULL
FROM "raffle_entries";

DROP TABLE "raffle_entries";
ALTER TABLE "new_raffle_entries" RENAME TO "raffle_entries";

CREATE UNIQUE INDEX "raffle_entries_name_key_key" ON "raffle_entries"("name_key");
CREATE UNIQUE INDEX "raffle_entries_vk_key_key" ON "raffle_entries"("vk_key");
CREATE UNIQUE INDEX "raffle_entries_tg_key_key" ON "raffle_entries"("tg_key");
CREATE UNIQUE INDEX "raffle_entries_ticket_number_key" ON "raffle_entries"("ticket_number");
CREATE INDEX "raffle_entries_created_at_idx" ON "raffle_entries"("created_at");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
