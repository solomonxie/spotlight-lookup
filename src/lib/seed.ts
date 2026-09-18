import chineseEnglish from '../../assets/demo/chinese-english.json';
import englishChinese from '../../assets/demo/english-chinese.json';
import flashcards from '../../assets/demo/flashcards.json';
import { createCollection } from '../db/collections';
import { bulkInsertEntries } from '../db/entries';
import { SETTINGS_KEYS, getSetting, setSetting } from '../db/settings';
import { ParsedEntry } from './importers';

const DEMO = [
  {
    name: 'English → 中文 (demo)',
    kind: 'dictionary' as const,
    language: 'en',
    targetLanguage: 'zh-Hans',
    entries: englishChinese as ParsedEntry[],
  },
  {
    name: '中文 → English (demo)',
    kind: 'dictionary' as const,
    language: 'zh-Hans',
    targetLanguage: 'en',
    entries: chineseEnglish as ParsedEntry[],
  },
  {
    name: 'My Flashcards',
    kind: 'flashcards' as const,
    language: 'zh-Hans',
    targetLanguage: 'en',
    entries: flashcards as ParsedEntry[],
  },
];

/**
 * Fills a fresh install with a working English/Chinese dictionary so Spotlight has
 * something to find before any import happens. Everything here is ordinary data —
 * editable, and deletable from Library once the user brings their own.
 */
export async function seedIfEmpty(): Promise<boolean> {
  if (await getSetting(SETTINGS_KEYS.seeded)) return false;

  for (const source of DEMO) {
    const collection = await createCollection({
      name: source.name,
      kind: source.kind,
      language: source.language,
      targetLanguage: source.targetLanguage,
    });
    await bulkInsertEntries(collection.id, source.entries);
  }

  await setSetting(SETTINGS_KEYS.seeded, new Date().toISOString());
  return true;
}
