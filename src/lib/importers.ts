export type ParsedEntry = {
  term: string;
  reading?: string | null;
  definition: string;
  example?: string | null;
  tags?: string | null;
};

export type ImportPreview = {
  format: 'json' | 'csv' | 'tsv';
  entries: ParsedEntry[];
  skipped: number;
};

const FIELD_ALIASES: Record<keyof ParsedEntry, string[]> = {
  term: ['term', 'word', 'headword', 'front', 'question', 'key', 'entry'],
  reading: ['reading', 'phonetic', 'pronunciation', 'pinyin', 'kana', 'romaji', 'ipa'],
  definition: ['definition', 'meaning', 'translation', 'back', 'answer', 'value', 'gloss'],
  example: ['example', 'sentence', 'usage', 'context'],
  tags: ['tags', 'tag', 'category', 'pos', 'deck'],
};

const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/[\s_-]/g, '');

function resolveField(keys: string[], field: keyof ParsedEntry): string | undefined {
  const aliases = FIELD_ALIASES[field].map(normalizeKey);
  return keys.find((key) => aliases.includes(normalizeKey(key)));
}

function splitRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === '') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  return rows;
}

function fromDelimited(text: string, delimiter: string): ParsedEntry[] {
  const rows = splitRows(text, delimiter);
  if (rows.length === 0) return [];

  const header = rows[0].map((value) => value.trim());
  const termKey = resolveField(header, 'term');
  const definitionKey = resolveField(header, 'definition');
  const hasHeader = Boolean(termKey && definitionKey);

  if (!hasHeader) {
    // Positional fallback: term, definition or term, reading, definition.
    return rows.map((row) => {
      const [first = '', second = '', third = ''] = row.map((value) => value.trim());
      return third
        ? { term: first, reading: second, definition: third }
        : { term: first, definition: second };
    });
  }

  const columnOf = (field: keyof ParsedEntry) => {
    const key = resolveField(header, field);
    return key ? header.indexOf(key) : -1;
  };
  const columns = {
    term: columnOf('term'),
    reading: columnOf('reading'),
    definition: columnOf('definition'),
    example: columnOf('example'),
    tags: columnOf('tags'),
  };
  const valueAt = (row: string[], column: number) =>
    column >= 0 ? (row[column] ?? '').trim() || null : null;

  return rows.slice(1).map((row) => ({
    term: valueAt(row, columns.term) ?? '',
    reading: valueAt(row, columns.reading),
    definition: valueAt(row, columns.definition) ?? '',
    example: valueAt(row, columns.example),
    tags: valueAt(row, columns.tags),
  }));
}

function fromJson(text: string): ParsedEntry[] {
  const data = JSON.parse(text);
  const records: Record<string, unknown>[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { entries?: unknown[] }).entries)
      ? ((data as { entries: Record<string, unknown>[] }).entries)
      : [];

  return records.map((record) => {
    const keys = Object.keys(record);
    const read = (field: keyof ParsedEntry) => {
      const key = resolveField(keys, field);
      const value = key ? record[key] : undefined;
      if (value === null || value === undefined) return null;
      return Array.isArray(value) ? value.join('; ') : String(value).trim() || null;
    };
    return {
      term: read('term') ?? '',
      reading: read('reading'),
      definition: read('definition') ?? '',
      example: read('example'),
      tags: read('tags'),
    };
  });
}

function detectFormat(fileName: string, text: string): ImportPreview['format'] {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'json' || /^\s*[[{]/.test(text)) return 'json';
  if (extension === 'csv') return 'csv';
  if (extension === 'tsv') return 'tsv';
  // .txt and friends: whichever separator the first line actually uses.
  const firstLine = text.slice(0, text.indexOf('\n') + 1 || undefined);
  return firstLine.includes('\t') ? 'tsv' : 'csv';
}

export function parseImportFile(fileName: string, text: string): ImportPreview {
  const format = detectFormat(fileName, text);

  const parsed =
    format === 'json'
      ? fromJson(text)
      : fromDelimited(text, format === 'csv' ? ',' : '\t');

  const entries = parsed.filter((entry) => entry.term.trim() && entry.definition.trim());
  return { format, entries, skipped: parsed.length - entries.length };
}
