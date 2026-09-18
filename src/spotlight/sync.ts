import {
  deleteAll,
  deleteDomains,
  deleteItems,
  indexItems,
  isSpotlightAvailable,
  SpotlightItem,
} from '@/modules/spotlight-index';

import { getDatabase } from '../db/database';

/** Core Spotlight rejects very large batches, and smaller ones keep the UI responsive. */
const BATCH_SIZE = 400;

export type SyncProgress = {
  phase: 'removing' | 'indexing' | 'done';
  done: number;
  total: number;
};

export type SyncResult = {
  available: boolean;
  indexed: number;
  removed: number;
};

type PendingRow = {
  id: string;
  collection_id: string;
  collection_name: string;
  kind: string;
  language: string | null;
  term: string;
  reading: string | null;
  definition: string;
  example: string | null;
  tags: string | null;
  term_norm: string;
  reading_norm: string;
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
};

function toSpotlightItem(row: PendingRow): SpotlightItem {
  const tags = row.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [];
  const subtitle = [row.reading, row.collection_name].filter(Boolean).join(' · ');
  const body = [row.definition, row.example].filter(Boolean).join('\n');

  return {
    id: row.id,
    domain: row.collection_id,
    title: row.term,
    subtitle,
    body,
    // The normalised forms ride along so system search reaches an entry from an
    // ASCII keyboard: `xiexie` matches 谢谢 even though its reading is `xiè xie`.
    keywords: Array.from(
      new Set(
        [
          row.term,
          row.reading,
          row.term_norm,
          row.reading_norm,
          row.collection_name,
          row.language,
          ...tags,
        ].filter(Boolean) as string[]
      )
    ),
  };
}

export async function syncSpotlight(
  options: { rebuild?: boolean; onProgress?: (progress: SyncProgress) => void } = {}
): Promise<SyncResult> {
  const { rebuild = false, onProgress } = options;
  if (!isSpotlightAvailable()) {
    return { available: false, indexed: 0, removed: 0 };
  }

  const db = await getDatabase();
  let removed = 0;

  if (rebuild) {
    await deleteAll();
    await db.execAsync('UPDATE entries SET indexed_at = NULL; DELETE FROM index_tombstones;');
  }

  // Collections the user switched off keep their identifiers in Spotlight until dropped by domain.
  const staleDomains = await db.getAllAsync<{ collection_id: string }>(
    `SELECT DISTINCT e.collection_id FROM entries e
     JOIN collections c ON c.id = e.collection_id
     WHERE e.indexed_at IS NOT NULL AND c.indexed = 0`
  );
  if (staleDomains.length > 0) {
    const ids = staleDomains.map((row) => row.collection_id);
    onProgress?.({ phase: 'removing', done: 0, total: ids.length });
    await deleteDomains(ids);
    await db.runAsync(
      `UPDATE entries SET indexed_at = NULL WHERE collection_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
  }

  // Rows deleted while indexed leave a tombstone, including cascades from a deleted collection.
  const tombstones = await db.getAllAsync<{ entry_id: string }>(
    'SELECT entry_id FROM index_tombstones'
  );
  for (const batch of chunk(tombstones.map((row) => row.entry_id), BATCH_SIZE)) {
    await deleteItems(batch);
    await db.runAsync(
      `DELETE FROM index_tombstones WHERE entry_id IN (${batch.map(() => '?').join(',')})`,
      batch
    );
    removed += batch.length;
    onProgress?.({ phase: 'removing', done: removed, total: tombstones.length });
  }

  const collections = await db.getAllAsync<{
    id: string;
    index_limit: number;
    indexed_count: number;
    pending_count: number;
  }>(
    `SELECT c.id, c.index_limit,
            (SELECT COUNT(*) FROM entries e WHERE e.collection_id = c.id AND e.indexed_at IS NOT NULL) AS indexed_count,
            (SELECT COUNT(*) FROM entries e WHERE e.collection_id = c.id AND e.indexed_at IS NULL) AS pending_count
     FROM collections c WHERE c.indexed = 1`
  );

  const roomFor = (collection: { index_limit: number; indexed_count: number; pending_count: number }) =>
    Math.max(0, Math.min(collection.pending_count, collection.index_limit - collection.indexed_count));

  let indexed = 0;
  const total = collections.reduce((sum, collection) => sum + roomFor(collection), 0);

  for (const collection of collections) {
    const room = roomFor(collection);
    if (room <= 0) continue;

    const pending = await db.getAllAsync<PendingRow>(
      `SELECT e.id, e.collection_id, e.term, e.reading, e.definition, e.example, e.tags,
              e.term_norm, e.reading_norm,
              c.name AS collection_name, c.kind, c.language
       FROM entries e JOIN collections c ON c.id = e.collection_id
       WHERE e.collection_id = ? AND e.indexed_at IS NULL
       ORDER BY e.rowid LIMIT ?`,
      [collection.id, room]
    );

    for (const batch of chunk(pending, BATCH_SIZE)) {
      await indexItems(batch.map(toSpotlightItem));
      const ids = batch.map((row) => row.id);
      await db.runAsync(
        `UPDATE entries SET indexed_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`,
        [Date.now(), ...ids]
      );
      indexed += batch.length;
      onProgress?.({ phase: 'indexing', done: indexed, total });
    }
  }

  onProgress?.({ phase: 'done', done: indexed, total });
  return { available: true, indexed, removed };
}

export async function clearSpotlightIndex(): Promise<void> {
  const db = await getDatabase();
  await deleteAll();
  await db.execAsync('UPDATE entries SET indexed_at = NULL; DELETE FROM index_tombstones;');
}
