import { type DB, type Scalar, open } from '@op-engineering/op-sqlite';

import { normalizeSearchText } from '../lib/normalize';
import { SCHEMA, SCHEMA_VERSION } from './schema';

const DATABASE_NAME = 'spotlight-lookup.db';

export type Params = Scalar[];

export type Statement = {
  executeAsync(params?: Params): Promise<void>;
  finalizeAsync(): Promise<void>;
};

/**
 * The query surface the rest of `src/db` is written against. Keeping it here means a
 * change of SQLite driver stays a change of one file.
 */
export class Database {
  constructor(private readonly db: DB) {}

  async execAsync(sql: string): Promise<void> {
    await this.db.execute(sql);
  }

  async runAsync(sql: string, params: Params = []): Promise<void> {
    await this.db.execute(sql, params);
  }

  async getAllAsync<T>(sql: string, params: Params = []): Promise<T[]> {
    const { rows } = await this.db.execute(sql, params);
    return rows as T[];
  }

  async getFirstAsync<T>(sql: string, params: Params = []): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, params);
    return rows[0] ?? null;
  }

  async prepareAsync(sql: string): Promise<Statement> {
    const statement = this.db.prepareStatement(sql);
    return {
      async executeAsync(params: Params = []) {
        await statement.bind(params);
        await statement.execute();
      },
      async finalizeAsync() {},
    };
  }

  async withTransactionAsync(body: () => Promise<void>): Promise<void> {
    await this.db.execute('BEGIN');
    try {
      await body();
      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }
}

let connection: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  connection ??= (async () => {
    const db = new Database(open({ name: DATABASE_NAME }));
    await migrate(db);
    return db;
  })();
  return connection;
}

async function addMissingColumns(db: Database): Promise<void> {
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
async function backfillNormalizedText(db: Database): Promise<void> {
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
async function migrate(db: Database): Promise<void> {
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
