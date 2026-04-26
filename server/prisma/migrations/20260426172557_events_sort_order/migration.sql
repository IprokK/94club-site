-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'СКОРО',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_events" ("category", "created_at", "date", "description", "id", "image", "location", "status", "title", "updated_at") SELECT "category", "created_at", "date", "description", "id", "image", "location", "status", "title", "updated_at" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE INDEX "events_title_idx" ON "events"("title");
CREATE INDEX "events_category_idx" ON "events"("category");
CREATE INDEX "events_sort_order_idx" ON "events"("sort_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
