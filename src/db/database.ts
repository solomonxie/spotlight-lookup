import * as SQLite from 'expo-sqlite';

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

/**
 * `entries_fts` is derived from `entries`, so any change to its columns is applied by
 * throwing the index away and rebuilding it rather than by writing a real migration.
 */
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  if (version < SCHEMA_VERSION) {
    await db.execAsync('DROP TABLE IF EXISTS entries_fts;');
  }
  await db.execAsync(SCHEMA);
  if (version < SCHEMA_VERSION) {
    await db.execAsync(
      `INSERT INTO entries_fts (entries_fts) VALUES ('rebuild'); PRAGMA user_version = ${SCHEMA_VERSION};`
    );
  }
}

export type { SQLiteDatabase } from 'expo-sqlite';
