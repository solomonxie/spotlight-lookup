export type CollectionKind = 'dictionary' | 'flashcards';

export type Collection = {
  id: string;
  name: string;
  kind: CollectionKind;
  language: string | null;
  targetLanguage: string | null;
  indexed: boolean;
  indexLimit: number;
  createdAt: number;
  updatedAt: number;
};

export type Entry = {
  id: string;
  collectionId: string;
  term: string;
  reading: string | null;
  definition: string;
  example: string | null;
  tags: string | null;
  createdAt: number;
  updatedAt: number;
  indexedAt: number | null;
};

export type EntryWithCollection = Entry & {
  collectionName: string;
  collectionKind: CollectionKind;
  collectionIndexed: boolean;
};

export type CollectionStats = Collection & {
  entryCount: number;
  indexedCount: number;
};

export type NewEntry = {
  collectionId: string;
  term: string;
  reading?: string | null;
  definition: string;
  example?: string | null;
  tags?: string | null;
};
