/** Общая обрезка для полей «ник / ссылка» */

function normalizeHandle(s) {
  const v = String(s || '').trim();
  return v ? v.replace(/^@/, '') : '';
}

/**
 * Первый сегмент пути vk.com, который сам по себе не является страницей профиля.
 * Сегменты вида id123, club123, write123 обрабатываются отдельно.
 */
const VK_RESERVED_SEGMENTS = new Set([
  'im',
  'feed',
  'friends',
  'friend',
  'groups',
  'group',
  'video',
  'videos',
  'clips',
  'audio',
  'audios',
  'mail',
  'messages',
  'settings',
  'search',
  'join',
  'away',
  'widget',
  'apps',
  'services',
  'docs',
  'photos',
  'album',
  'topic',
  'wall',
  'edit',
  'write',
  'login',
  'restore',
  'activate',
  'stats',
  'ads',
  'support',
  'bugs',
  'dev'
]);

/**
 * Ключ уникальности VK: из ссылки или ника.
 * Раньше всё после vk.com обрезалось до первого сегмента — vk.com/im?sel=… давало ключ «im» для всех.
 */
export function normalizeVkKey(s) {
  const trimmed = normalizeHandle(s);
  if (!trimmed) return '';
  const raw = trimmed.toLowerCase();

  const fromPlainString = () => {
    let v = raw.replace(/^https?:\/\//, '');
    v = v.replace(/^m\./, '');
    v = v.replace(/^vk\.com\//, '').replace(/^vkontakte\.ru\//, '');
    const parts = v.split('?')[0].split('/').filter(Boolean);
    return parts[0] || '';
  };

  const looksLikeVkUrl = /vk\.com|vkontakte\.ru|^\s*https?:\/\//i.test(raw);

  if (!looksLikeVkUrl) {
    return fromPlainString();
  }

  try {
    const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^m\./, '');
    if (!host.endsWith('vk.com') && !host.endsWith('vkontakte.ru')) {
      return fromPlainString();
    }

    const segments = (u.pathname || '/').split('/').filter(Boolean);
    const first = segments[0] || '';

    if (first === 'im') {
      const sel = u.searchParams.get('sel');
      if (sel && /^-?\d+$/.test(sel)) {
        return sel.startsWith('-') ? `club${sel.slice(1)}` : `id${sel}`;
      }
      return '';
    }

    if (first.startsWith('write')) {
      const idPart = first.slice('write'.length);
      if (/^-?\d+$/.test(idPart)) {
        return idPart.startsWith('-') ? `club${idPart.slice(1)}` : `id${idPart}`;
      }
    }

    if (!first) return '';

    if (VK_RESERVED_SEGMENTS.has(first)) {
      return '';
    }

    return first.startsWith('@') ? first.slice(1) : first;
  } catch {
    return fromPlainString();
  }
}

/**
 * Ключ Telegram; t.me/s/name раньше превращался в «s» для всех каналов с префиксом /s/.
 */
export function normalizeTgKey(s) {
  const trimmed = normalizeHandle(s);
  if (!trimmed) return '';
  const raw = trimmed.toLowerCase();

  const fromPlainString = () => {
    let v = raw.replace(/^https?:\/\//, '');
    v = v.replace(/^(t\.me|telegram\.me)\//, '');
    const parts = v.split('?')[0].split('/').filter(Boolean);
    if (parts[0] === 's' && parts[1]) return parts[1];
    if (parts[0] === 's') return '';
    return parts[0] || '';
  };

  const looksLikeTgUrl = /t\.me|telegram\.me|^\s*https?:\/\//i.test(raw);

  if (!looksLikeTgUrl) {
    return fromPlainString();
  }

  try {
    const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^www\./, '');
    if (!host.endsWith('t.me') && !host.endsWith('telegram.me')) {
      return fromPlainString();
    }

    const segments = u.pathname.split('/').filter(Boolean);
    if (!segments.length) return '';

    if (segments[0] === 's') {
      return segments[1] || '';
    }

    if (segments[0].startsWith('+')) {
      return segments[0];
    }

    return segments[0];
  } catch {
    return fromPlainString();
  }
}
