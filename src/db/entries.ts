import { createId } from '../lib/id';
import { getDatabase } from './database';
import { CollectionKind, Entry, EntryWithCollection, NewEntry } from './types';

type EntryRow = {
  id: string;
  collection_id: string;
  term: string;
  reading: string | null;
  definition: string;
  example: string | null;
  tags: string | null;
  created_at: number;
  updated_at: number;
  indexed_at: number | null;
};

type JoinedEntryRow = EntryRow & {
  collection_name: string;
  collection_kind: CollectionKind;
  collection_indexed: number;
};

const toEntry = (row: EntryRow): Entry => ({
  id: row.id,
  collectionId: row.collection_id,
  term: row.term,
  reading: row.reading,
  definition: row.definition,
  example: row.example,
  tags: row.tags,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  indexedAt: row.indexed_at,
});

const toJoinedEntry = (row: JoinedEntryRow): EntryWithCollection => ({
  ...toEntry(row),
  collectionName: row.collection_name,
  collectionKind: row.collection_kind,
  collectionIndexed: row.collection_indexed === 1,
});

const JOIN_SELECT = `
  SELECT e.*, c.name AS collection_name, c.kind AS collection_kind, c.indexed AS collection_indexed
  FROM entries e JOIN collections c ON c.id = e.collection_id
`;

/**
 * Wildcards are stripped rather than escaped: an ESCAPE clause would stop SQLite
 * from answering the prefix match out of the `term COLLATE NOCASE` index.
 */
const likePrefix = (query: string) => `${query.replace(/[%_]/g, '')}%`;

const ftsQuery = (query: string): string | null => {
  const cleaned = query.replace(/"/g, '""').trim();
  return /[\p{L}\p{N}]/u.test(cleaned) ? `"${cleaned}"*` : null;
};

export async function searchEntries(query: string, limit = 60): Promise<EntryWithCollection[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const db = await getDatabase();
  const fts = ftsQuery(trimmed);
  const branches = [
    'SELECT id, 0 AS rank FROM entries WHERE term = ? COLLATE NOCASE',
    'SELECT id, 1 AS rank FROM entries WHERE term LIKE ?',
  ];
  const params: (string | number)[] = [trimmed, likePrefix(trimmed)];

  if (fts) {
    branches.push(
      'SELECT id, 2 AS rank FROM entries WHERE rowid IN (SELECT rowid FROM entries_fts WHERE entries_fts MATCH ?)'
    );
    params.push(fts);
  }
  params.push(limit);

  const rows = await db.getAllAsync<JoinedEntryRow & { rank: number }>(
    `WITH hits AS (${branches.join(' UNION ALL ')})
     SELECT e.*, c.name AS collection_name, c.kind AS collection_kind, c.indexed AS collection_indexed,
            MIN(h.rank) AS rank
     FROM hits h
     JOIN entries e ON e.id = h.id
     JOIN collections c ON c.id = e.collection_id
     GROUP BY e.id
     ORDER BY rank ASC, LENGTH(e.term) ASC, e.term COLLATE NOCASE ASC
     LIMIT ?`,
    params
  );
  return rows.map(toJoinedEntry);
}

export async function getEntry(id: string): Promise<EntryWithCollection | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<JoinedEntryRow>(`${JOIN_SELECT} WHERE e.id = ?`, [id]);
  return row ? toJoinedEntry(row) : null;
}

export async function listEntries(
  collectionId: string,
  limit = 200,
  offset = 0
): Promise<Entry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EntryRow>(
    `SELECT * FROM entries WHERE collection_id = ?
     ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [collectionId, limit, offset]
  );
  return rows.map(toEntry);
}

export async function recentEntries(limit = 30): Promise<EntryWithCollection[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<JoinedEntryRow>(
    `${JOIN_SELECT} ORDER BY e.updated_at DESC LIMIT ?`,
    [limit]
  );
  return rows.map(toJoinedEntry);
}

export async function createEntry(input: NewEntry): Promise<Entry> {
  const db = await getDatabase();
  const now = Date.now();
  const entry: Entry = {
    id: createId('entry'),
    collectionId: input.collectionId,
    term: input.term.trim(),
    reading: input.reading?.trim() || null,
    definition: input.definition.trim(),
    example: input.example?.trim() || null,
    tags: input.tags?.trim() || null,
    createdAt: now,
    updatedAt: now,
    indexedAt: null,
  };
  await db.runAsync(
    `INSERT INTO entries (id, collection_id, term, reading, definition, example, tags, created_at, updated_at, indexed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      entry.id,
      entry.collectionId,
      entry.term,
      entry.reading,
      entry.definition,
      entry.example,
      entry.tags,
      entry.createdAt,
      entry.updatedAt,
    ]
  );
  return entry;
}

export async function updateEntry(id: string, patch: Partial<NewEntry>): Promise<void> {
  const db = await getDatabase();
  const columns: Record<string, string> = {
    term: 'term',
    reading: 'reading',
    definition: 'definition',
    example: 'example',
    tags: 'tags',
  };
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, column] of Object.entries(columns)) {
    const value = patch[key as keyof NewEntry];
    if (value === undefined) continue;
    assignments.push(`${column} = ?`);
    values.push(typeof value === 'string' ? value.trim() || null : value);
  }
  if (assignments.length === 0) return;

  // Editing the text invalidates whatever Spotlight already holds for this entry.
  assignments.push('updated_at = ?', 'indexed_at = NULL');
  values.push(Date.now(), id);
  await db.runAsync(`UPDATE entries SET ${assignments.join(', ')} WHERE id = ?`, values);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}

export async function bulkInsertEntries(
  collectionId: string,
  rows: Omit<NewEntry, 'collectionId'>[]
): Promise<number> {
  if (rows.length === 0) return 0;
  const db = await getDatabase();
  const now = Date.now();
  let inserted = 0;

  await db.withTransactionAsync(async () => {
    const statement = await db.prepareAsync(
      `INSERT INTO entries (id, collection_id, term, reading, definition, example, tags, created_at, updated_at, indexed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`
    );
    try {
      for (const row of rows) {
        const term = row.term.trim();
        const definition = row.definition.trim();
        if (!term || !definition) continue;
        await statement.executeAsync([
          createId('entry'),
          collectionId,
          term,
          row.reading?.trim() || null,
          definition,
          row.example?.trim() || null,
          row.tags?.trim() || null,
          now,
          now,
        ]);
        inserted += 1;
      }
    } finally {
      await statement.finalizeAsync();
    }
  });
  return inserted;
}

export async function countEntries(): Promise<{ total: number; indexed: number; pending: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number; indexed: number; pending: number }>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN e.indexed_at IS NOT NULL THEN 1 ELSE 0 END) AS indexed,
            SUM(CASE WHEN e.indexed_at IS NULL AND c.indexed = 1 THEN 1 ELSE 0 END) AS pending
     FROM entries e JOIN collections c ON c.id = e.collection_id`
  );
  return { total: row?.total ?? 0, indexed: row?.indexed ?? 0, pending: row?.pending ?? 0 };
}
