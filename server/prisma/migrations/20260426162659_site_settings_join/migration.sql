-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "calendar_label" TEXT NOT NULL DEFAULT 'календарь',
    "calendar_path" TEXT NOT NULL DEFAULT '/events',
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "join_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "join_requests_created_at_idx" ON "join_requests"("created_at");
