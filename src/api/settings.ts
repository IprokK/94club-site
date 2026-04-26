import { apiFetch } from './client';

export type SiteSettingsPublic = { calendarLabel: string; calendarPath: string };

export async function getSiteSettings() {
  return apiFetch<SiteSettingsPublic>('/api/settings');
}

export async function updateSiteSettings(patch: SiteSettingsPublic) {
  return apiFetch<SiteSettingsPublic>('/api/settings', { method: 'PATCH', body: JSON.stringify(patch) });
}
