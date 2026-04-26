-- CreateTable
CREATE TABLE "raffle_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "vk" TEXT,
    "telegram" TEXT,
    "ticket_number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "raffle_winners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entry_id" INTEGER NOT NULL,
    "place" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "raffle_winners_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "raffle_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "raffle_entries_vk_key" ON "raffle_entries"("vk");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_entries_telegram_key" ON "raffle_entries"("telegram");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_entries_ticket_number_key" ON "raffle_entries"("ticket_number");

-- CreateIndex
CREATE INDEX "raffle_entries_created_at_idx" ON "raffle_entries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_winners_entry_id_key" ON "raffle_winners"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_winners_place_key" ON "raffle_winners"("place");
