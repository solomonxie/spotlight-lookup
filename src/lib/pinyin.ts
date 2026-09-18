const TONE_MARKS: Record<string, string> = {
  a: 'āáǎà',
  e: 'ēéěè',
  i: 'īíǐì',
  o: 'ōóǒò',
  u: 'ūúǔù',
  ü: 'ǖǘǚǜ',
};

const VOWELS = 'aeiouü';

/** Standard placement: an `a` or `e` always takes it, then the `o` of `ou`, else the last vowel. */
function markedVowelIndex(letters: string): number {
  const lower = letters.toLowerCase();
  for (const vowel of ['a', 'e']) {
    const at = lower.indexOf(vowel);
    if (at >= 0) return at;
  }
  const ou = lower.indexOf('ou');
  if (ou >= 0) return ou;

  for (let i = lower.length - 1; i >= 0; i -= 1) {
    if (VOWELS.includes(lower[i])) return i;
  }
  return -1;
}

/** `chuan2` → `chuán`. Numbered pinyin is unreadable in a Spotlight preview. */
export function syllableToToneMarks(raw: string): string {
  const syllable = raw.replace(/u:/gi, 'ü').replace(/v/g, 'ü').replace(/V/g, 'Ü');
  const match = /^([a-zü]+)([1-5])$/i.exec(syllable);
  if (!match) return syllable;

  const [, letters, tone] = match;
  const index = Number(tone) - 1;
  if (index > 3) return letters; // neutral tone carries no mark

  const at = markedVowelIndex(letters);
  const marks = at >= 0 ? TONE_MARKS[letters[at].toLowerCase()] : undefined;
  if (!marks) return letters;

  const marked = letters[at] === letters[at].toUpperCase() ? marks[index].toUpperCase() : marks[index];
  return letters.slice(0, at) + marked + letters.slice(at + 1);
}

/** `[chuan2 tong3]` → `chuán tǒng`. Non-syllables (punctuation, Latin) pass through. */
export function pinyinToToneMarks(pinyin: string): string {
  return pinyin
    .trim()
    .split(/\s+/)
    .map(syllableToToneMarks)
    .join(' ')
    .trim();
}
