import { apiFetch, clearToken, setToken } from './client';

export type AuthUser = { id: number; login: string; role: string };
export type LoginResponse = { token: string; user: AuthUser };

export async function login(login: string, password: string) {
  const res = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password })
  });
  setToken(res.token);
  return res;
}

export function logout() {
  clearToken();
}

