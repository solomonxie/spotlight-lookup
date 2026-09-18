import { createId } from '../lib/id';
import { getDatabase } from './database';
import { Collection, CollectionKind, CollectionStats } from './types';

type CollectionRow = {
  id: string;
  name: string;
  kind: CollectionKind;
  language: string | null;
  target_language: string | null;
  indexed: number;
  index_limit: number;
  created_at: number;
  updated_at: number;
};

type CollectionStatsRow = CollectionRow & {
  entry_count: number;
  indexed_count: number;
};

const toCollection = (row: CollectionRow): Collection => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  language: row.language,
  targetLanguage: row.target_language,
  indexed: row.indexed === 1,
  indexLimit: row.index_limit,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const STATS_QUERY = `
  SELECT c.*,
    (SELECT COUNT(*) FROM entries e WHERE e.collection_id = c.id) AS entry_count,
    (SELECT COUNT(*) FROM entries e WHERE e.collection_id = c.id AND e.indexed_at IS NOT NULL) AS indexed_count
  FROM collections c
`;

export async function listCollections(): Promise<CollectionStats[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CollectionStatsRow>(`${STATS_QUERY} ORDER BY c.kind, c.name`);
  return rows.map((row) => ({
    ...toCollection(row),
    entryCount: row.entry_count,
    indexedCount: row.indexed_count,
  }));
}

export async function getCollection(id: string): Promise<CollectionStats | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CollectionStatsRow>(`${STATS_QUERY} WHERE c.id = ?`, [id]);
  if (!row) return null;
  return { ...toCollection(row), entryCount: row.entry_count, indexedCount: row.indexed_count };
}

export type CollectionInput = {
  name: string;
  kind: CollectionKind;
  language?: string | null;
  targetLanguage?: string | null;
  indexed?: boolean;
  indexLimit?: number;
};

export async function createCollection(input: CollectionInput): Promise<Collection> {
  const db = await getDatabase();
  const now = Date.now();
  const collection: Collection = {
    id: createId('col'),
    name: input.name.trim(),
    kind: input.kind,
    language: input.language?.trim() || null,
    targetLanguage: input.targetLanguage?.trim() || null,
    indexed: input.indexed ?? true,
    indexLimit: input.indexLimit ?? 20000,
    createdAt: now,
    updatedAt: now,
  };
  await db.runAsync(
    `INSERT INTO collections (id, name, kind, language, target_language, indexed, index_limit, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      collection.id,
      collection.name,
      collection.kind,
      collection.language,
      collection.targetLanguage,
      collection.indexed ? 1 : 0,
      collection.indexLimit,
      collection.createdAt,
      collection.updatedAt,
    ]
  );
  return collection;
}

export async function updateCollection(
  id: string,
  patch: Partial<CollectionInput>
): Promise<void> {
  const db = await getDatabase();
  const columns: Record<string, string> = {
    name: 'name',
    kind: 'kind',
    language: 'language',
    targetLanguage: 'target_language',
    indexLimit: 'index_limit',
  };
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, column] of Object.entries(columns)) {
    const value = patch[key as keyof CollectionInput];
    if (value === undefined) continue;
    assignments.push(`${column} = ?`);
    values.push(typeof value === 'string' ? value.trim() || null : (value as number | null));
  }
  if (patch.indexed !== undefined) {
    assignments.push('indexed = ?');
    values.push(patch.indexed ? 1 : 0);
  }
  if (assignments.length === 0) return;

  assignments.push('updated_at = ?');
  values.push(Date.now(), id);
  await db.runAsync(`UPDATE collections SET ${assignments.join(', ')} WHERE id = ?`, values);
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM collections WHERE id = ?', [id]);
}
