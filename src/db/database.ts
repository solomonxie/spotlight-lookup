import * as SQLite from 'expo-sqlite';

import { SCHEMA } from './schema';

const DATABASE_NAME = 'spotlight-lookup.db';

let connection: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  connection ??= SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
    await db.execAsync(SCHEMA);
    return db;
  });
  return connection;
}

export type { SQLiteDatabase } from 'expo-sqlite';
