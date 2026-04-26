-- Восстанавливаем порядок: как при сортировке id DESC (сначала с большим id)
CREATE TABLE "_event_sort" AS
SELECT
  "id" AS eid,
  (ROW_NUMBER() OVER (ORDER BY "id" DESC) - 1) AS s
FROM "events";

UPDATE "events"
SET "sort_order" = (SELECT s FROM "_event_sort" WHERE eid = "events"."id");

DROP TABLE "_event_sort";
