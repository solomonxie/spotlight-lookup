/**
 * Whitespace, punctuation and the modifier letters IPA leans on. Combining marks
 * are stripped too, which is what makes a tone-marked pinyin reading reachable
 * from an ASCII keyboard: `xiè xie` and `xiexie` normalise to the same key.
 */
const NOISE =
  /[\s̀-ͯʰ-˿!-/:-@[-`{-~ -⁯　-〿！-／：-＠［-｀｛-｠]+/g;

export function normalizeSearchText(value: string | null | undefined): string {
  if (!value) return '';
  const decomposed = typeof value.normalize === 'function' ? value.normalize('NFD') : value;
  return decomposed.replace(NOISE, '').toLowerCase();
}

/** Edit distance, capped: anything past `max` is not a near miss and stops early. */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (!a.length || !b.length) return Math.max(a.length, b.length);

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowBest = current[0];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      rowBest = Math.min(rowBest, current[j]);
    }
    if (rowBest > max) return max + 1;
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

/** How many edits a word of this length may be off by before it stops being a typo. */
export function typoBudget(length: number): number {
  if (length <= 3) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  return 3;
}

export function trigrams(value: string): string[] {
  if (value.length < 3) return [];
  const out: string[] = [];
  for (let i = 0; i + 3 <= value.length; i += 1) out.push(value.slice(i, i + 3));
  return Array.from(new Set(out));
}
