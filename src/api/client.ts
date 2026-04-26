const TOKEN_KEY = '94club-admin-token';

export type ApiError = { status: number; error: string };

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getBaseUrl() {
  // Dev: Vite proxy направляет /api на backend.
  // Prod/деплой: можно задать VITE_API_BASE_URL, например "https://94club.ru".
  return (import.meta as any).env?.VITE_API_BASE_URL || '';
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, { ...init, headers });
  } catch {
    const err: ApiError = { status: 0, error: 'NETWORK_ERROR' };
    throw err;
  }
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    const err: ApiError = { status: res.status, error: body?.error || 'REQUEST_FAILED' };
    throw err;
  }
  return (await parseJsonSafe(res)) as T;
}

