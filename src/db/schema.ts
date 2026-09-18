/**
 * `entries_fts` is an external-content FTS5 table: the text lives once in `entries`
 * and the triggers below keep the index in step, which matters when a dictionary
 * import adds six figures of rows.
 */
export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('dictionary', 'flashcards')),
  language TEXT,
  target_language TEXT,
  indexed INTEGER NOT NULL DEFAULT 1,
  index_limit INTEGER NOT NULL DEFAULT 20000,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  reading TEXT,
  definition TEXT NOT NULL,
  example TEXT,
  tags TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  indexed_at INTEGER
);

CREATE INDEX IF NOT EXISTS entries_by_collection ON entries (collection_id);
CREATE INDEX IF NOT EXISTS entries_by_term ON entries (term COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS entries_pending_index ON entries (indexed_at) WHERE indexed_at IS NULL;

CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  term,
  reading,
  definition,
  tags,
  content = 'entries',
  content_rowid = 'rowid',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS entries_fts_insert AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts (rowid, term, reading, definition, tags)
  VALUES (new.rowid, new.term, new.reading, new.definition, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS entries_fts_delete AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts (entries_fts, rowid, term, reading, definition, tags)
  VALUES ('delete', old.rowid, old.term, old.reading, old.definition, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS entries_fts_update AFTER UPDATE ON entries BEGIN
  INSERT INTO entries_fts (entries_fts, rowid, term, reading, definition, tags)
  VALUES ('delete', old.rowid, old.term, old.reading, old.definition, old.tags);
  INSERT INTO entries_fts (rowid, term, reading, definition, tags)
  VALUES (new.rowid, new.term, new.reading, new.definition, new.tags);
END;

-- Deleting a row loses the identifier Spotlight still holds, so park it here first.
CREATE TABLE IF NOT EXISTS index_tombstones (
  entry_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TRIGGER IF NOT EXISTS entries_tombstone AFTER DELETE ON entries
WHEN old.indexed_at IS NOT NULL BEGIN
  INSERT OR REPLACE INTO index_tombstones (entry_id, created_at)
  VALUES (old.id, CAST(strftime('%s', 'now') AS INTEGER) * 1000);
END;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
