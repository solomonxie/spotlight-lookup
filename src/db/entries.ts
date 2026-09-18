import { createId } from '../lib/id';
import { editDistance, normalizeSearchText, trigrams, typoBudget } from '../lib/normalize';
import { SQLiteDatabase, getDatabase } from './database';
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
  term_norm: string;
  reading_norm: string;
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

/** Precise tiers first; `fuzzy` only runs when they came up short. */
const RANK = { exact: 0, prefix: 1, words: 2, substring: 3, fuzzy: 4 } as const;

/** Enough precise hits on screen means a typo pass would only add noise. */
const FUZZY_TRIGGER = 8;
const FUZZY_CANDIDATES = 200;

const phrase = (value: string) => `"${value.replace(/"/g, '""')}"`;

const ftsQuery = (query: string): string | null => {
  const cleaned = query.replace(/"/g, '""').trim();
  return /[\p{L}\p{N}]/u.test(cleaned) ? `"${cleaned}"*` : null;
};

/**
 * Five tiers over two indexes. `term_norm` and `reading_norm` hold the query-shaped
 * form of each entry — lower case, no tone marks, no spaces — so `xiexie` reaches
 * 谢谢 and `cafe` reaches `café` without the user producing the diacritics.
 */
export async function searchEntries(query: string, limit = 60): Promise<EntryWithCollection[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const db = await getDatabase();
  const norm = normalizeSearchText(trimmed);
  const branches = ['SELECT id, 0 AS rank FROM entries WHERE term = ? COLLATE NOCASE'];
  const params: (string | number)[] = [trimmed];

  if (norm) {
    branches.push(
      `SELECT id, ${RANK.exact} AS rank FROM entries WHERE term_norm = ? OR reading_norm = ?`,
      `SELECT id, ${RANK.prefix} AS rank FROM entries WHERE term_norm LIKE ? OR reading_norm LIKE ?`
    );
    params.push(norm, norm, `${norm}%`, `${norm}%`);
  }

  const fts = ftsQuery(trimmed);
  if (fts) {
    branches.push(
      `SELECT id, ${RANK.words} AS rank FROM entries
       WHERE rowid IN (SELECT rowid FROM entries_fts WHERE entries_fts MATCH ?)`
    );
    params.push(fts);
  }

  if (norm.length >= 3) {
    branches.push(
      `SELECT id, ${RANK.substring} AS rank FROM entries
       WHERE rowid IN (SELECT rowid FROM entries_fuzzy WHERE entries_fuzzy MATCH ?)`
    );
    params.push(phrase(norm));
  } else if (norm) {
    // A trigram index cannot represent a one- or two-character query, which is most
    // of Chinese. Those scan instead — the columns are headwords, so it stays cheap.
    branches.push(
      `SELECT id, ${RANK.substring} AS rank FROM entries
       WHERE term_norm LIKE ? OR reading_norm LIKE ?`
    );
    params.push(`%${norm}%`, `%${norm}%`);
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

  const results = rows.map(toJoinedEntry);
  if (results.length >= FUZZY_TRIGGER || results.length >= limit || norm.length < 3) {
    return results;
  }

  const seen = new Set(results.map((entry) => entry.id));
  const near = await fuzzyMatches(db, norm, seen, limit - results.length);
  return [...results, ...near];
}

/**
 * Trigram overlap finds the candidates, edit distance decides. A misspelling still
 * shares most of its three-character runs with the word meant, so `resilent` reaches
 * `resilient`; bm25 puts the best overlap first and the distance budget cuts the rest.
 */
async function fuzzyMatches(
  db: SQLiteDatabase,
  norm: string,
  seen: Set<string>,
  limit: number
): Promise<EntryWithCollection[]> {
  const budget = typoBudget(norm.length);
  const grams = trigrams(norm);
  if (budget === 0 || grams.length === 0 || limit <= 0) return [];

  const rows = await db.getAllAsync<JoinedEntryRow>(
    `SELECT e.*, c.name AS collection_name, c.kind AS collection_kind, c.indexed AS collection_indexed
     FROM entries_fuzzy
     JOIN entries e ON e.rowid = entries_fuzzy.rowid
     JOIN collections c ON c.id = e.collection_id
     WHERE entries_fuzzy MATCH ?
     ORDER BY bm25(entries_fuzzy) ASC
     LIMIT ?`,
    [grams.map(phrase).join(' OR '), FUZZY_CANDIDATES]
  );

  return rows
    .filter((row) => !seen.has(row.id))
    .map((row) => ({
      row,
      distance: Math.min(
        editDistance(norm, row.term_norm, budget),
        row.reading_norm ? editDistance(norm, row.reading_norm, budget) : budget + 1
      ),
    }))
    .filter((hit) => hit.distance <= budget)
    .sort((a, b) => a.distance - b.distance || a.row.term.length - b.row.term.length)
    .slice(0, limit)
    .map((hit) => toJoinedEntry(hit.row));
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

/**
 * Round-robins across collections instead of taking a flat newest-first slice: a
 * freshly imported dictionary shares one timestamp across every row, and would
 * otherwise bury every other collection. A just-added entry still lands first,
 * since it is rank 1 in its collection and the newest among the rank-1 rows.
 */
export async function recentEntries(limit = 30): Promise<EntryWithCollection[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<JoinedEntryRow & { rank: number }>(
    `SELECT * FROM (
       SELECT e.*, e.rowid AS row_id, c.name AS collection_name, c.kind AS collection_kind,
              c.indexed AS collection_indexed,
              ROW_NUMBER() OVER (
                PARTITION BY e.collection_id ORDER BY e.updated_at DESC, e.rowid DESC
              ) AS rank
       FROM entries e JOIN collections c ON c.id = e.collection_id
     )
     ORDER BY rank ASC, updated_at DESC, row_id DESC
     LIMIT ?`,
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
    `INSERT INTO entries (id, collection_id, term, reading, definition, example, tags,
                          created_at, updated_at, indexed_at, term_norm, reading_norm)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
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
      normalizeSearchText(entry.term),
      normalizeSearchText(entry.reading),
    ]
  );
  return entry;
}

export async function updateEntry(id: string, patch: Partial<NewEntry>): Promise<void> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<EntryRow>('SELECT * FROM entries WHERE id = ?', [id]);
  if (!current) return;

  const optional = (value: string | null | undefined, fallback: string | null) =>
    value === undefined ? fallback : (value?.trim() ?? '') || null;
  const required = (value: string | undefined, fallback: string) =>
    value === undefined ? fallback : value.trim() || fallback;

  const term = required(patch.term, current.term);
  const reading = optional(patch.reading, current.reading);

  // Rewritten whole rather than patched: the normalised columns depend on two of the
  // fields, so a partial update would need to read the row back anyway.
  await db.runAsync(
    `UPDATE entries
     SET term = ?, reading = ?, definition = ?, example = ?, tags = ?,
         term_norm = ?, reading_norm = ?, updated_at = ?, indexed_at = NULL
     WHERE id = ?`,
    [
      term,
      reading,
      required(patch.definition, current.definition),
      optional(patch.example, current.example),
      optional(patch.tags, current.tags),
      normalizeSearchText(term),
      normalizeSearchText(reading),
      Date.now(),
      id,
    ]
  );
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
      `INSERT INTO entries (id, collection_id, term, reading, definition, example, tags,
                            created_at, updated_at, indexed_at, term_norm, reading_norm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`
    );
    try {
      for (const row of rows) {
        const term = row.term.trim();
        const definition = row.definition.trim();
        if (!term || !definition) continue;
        const reading = row.reading?.trim() || null;
        await statement.executeAsync([
          createId('entry'),
          collectionId,
          term,
          reading,
          definition,
          row.example?.trim() || null,
          row.tags?.trim() || null,
          now,
          now,
          normalizeSearchText(term),
          normalizeSearchText(reading),
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
