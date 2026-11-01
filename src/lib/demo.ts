import { useSyncExternalStore } from 'react';

import chineseEnglish from '../../assets/demo/chinese-english.json';
import englishChinese from '../../assets/demo/english-chinese.json';
import flashcards from '../../assets/demo/flashcards.json';
import presets from '../../demo/collections.json';
import { createCollection } from '../db/collections';
import { getAppState, getDatabase, setAppState, setDemoDatabase } from '../db/database';
import { bulkInsertEntries } from '../db/entries';
import { SETTINGS_KEYS, getSetting, setSetting } from '../db/settings';
import type { CollectionKind } from '../db/types';
import type { ParsedEntry } from './importers';

/**
 * Demo mode: a separate database filled from `demo/collections.json`. While it is on,
 * nothing is pushed to or removed from Core Spotlight, and the real database is not opened.
 */
type DemoState = { on: boolean; revision: number };

let state: DemoState = { on: false, revision: 0 };
const listeners = new Set<() => void>();

function publish(next: DemoState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export const isDemo = () => state.on;

/** `revision` changes on every switch and reset, so screens can remount on fresh data. */
export function useDemo(): DemoState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );
}

/** Picks the store the app was last on; call before the first `getDatabase()`. */
export async function loadDemo(): Promise<void> {
  const on = (await getAppState('demo').catch(() => null)) === '1';
  setDemoDatabase(on);
  if (on) await seedDemoIfEmpty();
  publish({ on, revision: state.revision });
}

export async function setDemo(on: boolean): Promise<void> {
  if (on === state.on) return;
  setDemoDatabase(on);
  if (on) await seedDemoIfEmpty();
  await setAppState('demo', on ? '1' : '0');
  publish({ on, revision: state.revision + 1 });
}

/** Back to the preset in `demo/`. */
export async function resetDemo(): Promise<void> {
  if (!state.on) return;
  const db = await getDatabase();
  await db.execAsync('DELETE FROM collections; DELETE FROM index_tombstones; DELETE FROM settings;');
  await seedDemoIfEmpty();
  publish({ on: true, revision: state.revision + 1 });
}

type Preset = {
  name: string;
  kind: string;
  language: string;
  targetLanguage: string;
  added: string;
  source?: string;
  entries?: (ParsedEntry & { added?: string })[];
};

const SOURCES: Record<string, ParsedEntry[]> = {
  'english-chinese': englishChinese as ParsedEntry[],
  'chinese-english': chineseEnglish as ParsedEntry[],
  flashcards: flashcards as ParsedEntry[],
};

async function seedDemoIfEmpty(): Promise<void> {
  if (await getSetting(SETTINGS_KEYS.seeded)) return;
  const db = await getDatabase();
  const now = new Date();

  for (const preset of presets as Preset[]) {
    const entries = preset.entries ?? SOURCES[preset.source ?? ''] ?? [];
    const collection = await createCollection({
      name: preset.name,
      kind: preset.kind as CollectionKind,
      language: preset.language,
      targetLanguage: preset.targetLanguage,
    });
    await bulkInsertEntries(collection.id, entries);

    const added = relativeDate(preset.added, now) ?? now.getTime();
    await db.runAsync('UPDATE collections SET created_at = ?, updated_at = ? WHERE id = ?', [added, added, collection.id]);
    await db.runAsync('UPDATE entries SET created_at = ?, updated_at = ? WHERE collection_id = ?', [added, added, collection.id]);
    for (const entry of preset.entries ?? []) {
      const at = entry.added ? relativeDate(entry.added, now) : null;
      if (at === null) continue;
      await db.runAsync(
        'UPDATE entries SET created_at = ?, updated_at = ? WHERE collection_id = ? AND term = ?',
        [at, at, collection.id, entry.term.trim()]
      );
    }
  }

  // Marks the demo store as filled; the real app's first-run seed never runs here.
  await setSetting(SETTINGS_KEYS.seeded, now.toISOString());
}

/** `@today-3 08:15` / `@today 07:48` → epoch ms, local time. */
export function relativeDate(text: string, now: Date = new Date()): number | null {
  const match = /^@today(?:([+-]\d+))?(?: (\d{1,2}):(\d{2}))?$/.exec(text);
  if (!match) return null;
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(match[1] ?? 0));
  if (match[2] !== undefined) date.setHours(Number(match[2]), Number(match[3]));
  return date.getTime();
}
