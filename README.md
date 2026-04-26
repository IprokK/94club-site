# 94 Club Site

Многостраничный сайт 94 Club в фирменном стиле: чёрный фон, кислотный лайм, белый и розово-красные акценты.

## Что внутри

- Главная
- О клубе
- Мероприятия
- Галерея
- Присоединиться
- Партнёрам
- Админ-панель
- Картинки и материалы в `public/assets` и `src/assets`

## Запуск

```bash
npm install
npm run dev
```

Открыть в браузере:

```text
http://localhost:5173
```

## Сборка

```bash
npm run build
```

## Админ-панель

Админка работает как мини‑CMS:

- `/admin/login` — вход (JWT)
- `/admin` — защищённая админ-панель
- CRUD для событий и галереи (SQLite через Prisma)
- загрузка изображений (multer) + предпросмотр
- поиск и пагинация

### Запуск (dev)

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### Прод (build) — рекомендуемая схема для доменов

- Nginx раздаёт `dist/` как статику
- Nginx проксирует `/api` и `/uploads` на Node backend (127.0.0.1:8787)
- Frontend обращается к API по относительным путям `/api/*` (работает и в build)

Для backend в `server/.env` выставить:

- `PUBLIC_BASE_URL="https://94club.ru"` (или `https://94club.online`)
- `CORS_ORIGINS="https://94club.ru,https://94club.online"`
