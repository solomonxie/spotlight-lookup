import * as SQLite from 'expo-sqlite';

import { normalizeSearchText } from '../lib/normalize';
import { SCHEMA, SCHEMA_VERSION } from './schema';

const DATABASE_NAME = 'spotlight-lookup.db';

let connection: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  connection ??= SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
    await migrate(db);
    return db;
  });
  return connection;
}

async function addMissingColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(entries)');
  if (columns.length === 0) return; // fresh database; CREATE TABLE covers it

  const present = new Set(columns.map((column) => column.name));
  for (const column of ['term_norm', 'reading_norm']) {
    if (!present.has(column)) {
      await db.execAsync(`ALTER TABLE entries ADD COLUMN ${column} TEXT NOT NULL DEFAULT '';`);
    }
  }
}

/** SQLite cannot fold tone marks, so the normalised columns are filled from JavaScript. */
async function backfillNormalizedText(db: SQLite.SQLiteDatabase): Promise<void> {
  const rows = await db.getAllAsync<{ id: string; term: string; reading: string | null }>(
    "SELECT id, term, reading FROM entries WHERE term_norm = ''"
  );
  if (rows.length === 0) return;

  await db.withTransactionAsync(async () => {
    const statement = await db.prepareAsync(
      'UPDATE entries SET term_norm = ?, reading_norm = ? WHERE id = ?'
    );
    try {
      for (const row of rows) {
        await statement.executeAsync([
          normalizeSearchText(row.term),
          normalizeSearchText(row.reading),
          row.id,
        ]);
      }
    } finally {
      await statement.finalizeAsync();
    }
  });
}

/**
 * Both search indexes are derived from `entries`, so a schema change throws them
 * away and rebuilds rather than migrating them row by row.
 */
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  const stale = version < SCHEMA_VERSION;

  if (stale) {
    await db.execAsync('DROP TABLE IF EXISTS entries_fts; DROP TABLE IF EXISTS entries_fuzzy;');
    await addMissingColumns(db);
  }

  await db.execAsync(SCHEMA);

  if (stale) {
    // Rebuild before the backfill, not after: an external-content FTS5 table treats a
    // 'delete' for a row it never indexed as corruption, and the backfill's UPDATE
    // fires exactly that trigger on every row.
    await db.execAsync(
      `INSERT INTO entries_fts (entries_fts) VALUES ('rebuild');
       INSERT INTO entries_fuzzy (entries_fuzzy) VALUES ('rebuild');`
    );
    await backfillNormalizedText(db);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

export type { SQLiteDatabase } from 'expo-sqlite';
