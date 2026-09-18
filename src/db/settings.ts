import { getDatabase } from './database';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

export async function getFlag(key: string, fallback: boolean): Promise<boolean> {
  const value = await getSetting(key);
  return value === null ? fallback : value === '1';
}

export async function setFlag(key: string, value: boolean): Promise<void> {
  await setSetting(key, value ? '1' : '0');
}

export const SETTINGS_KEYS = {
  seeded: 'seeded',
  autoSync: 'auto_sync',
} as const;
