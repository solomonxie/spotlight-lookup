# Dictionary and Flashcard Lookup from iOS Spotlight

> 🚧 Work in progress — builds and runs, but not yet tested on a physical device or released.

Pull down on the Home Screen, type a word, and see its definition and translation right in the
results — the way Bing Dictionary and friends do it, except you decide what gets indexed: which
dictionaries, which languages, and your own flashcards.

Built with React Native and Expo (SDK 57), iOS only.

## What it does

- **Anything you add is searchable from the system.** Entries are pushed into Core Spotlight with the
  headword as the title and the pronunciation plus definition as the preview text, so the answer is
  visible without opening the app.
- **Tapping a result opens that entry** in the app for the full definition, example, and tags.
- **You choose what is indexed.** Each collection has its own switch, language tags, and a cap on how
  many entries it contributes to the system index.
- **Two kinds of collections:** imported dictionaries and hand-written flashcards. Both behave
  identically in Spotlight.
- **In-app search too**, backed by SQLite FTS5, with exact matches first, then prefixes, then
  full-text hits across definitions and tags.

## Expo Go is not enough

Core Spotlight is a native framework, so it cannot exist inside the stock Expo Go binary. The app
detects this and degrades gracefully: everything works except system indexing, which is what you want
while iterating on screens.

```sh
npm install
npm start          # Expo Go — UI work, in-app search, no Spotlight
npm run ios        # development build — the real thing
```

`npm run ios` prebuilds the native project, compiles the local Spotlight module, and installs a
development build you can keep using with `npm start` afterwards.

## Importing a dictionary

Library → **Import dictionary** accepts JSON, CSV, and TSV. Column names are matched loosely, so
most exports work untouched:

| Meaning | Accepted headers |
| --- | --- |
| headword | `term`, `word`, `headword`, `front`, `question` |
| pronunciation | `reading`, `phonetic`, `pinyin`, `kana`, `ipa` |
| definition | `definition`, `meaning`, `translation`, `back`, `answer` |
| example | `example`, `sentence`, `usage` |
| tags | `tags`, `category`, `pos`, `deck` |

Headerless files are read positionally as `term, definition` or `term, reading, definition`. Sample
files live in `examples/`.

Set the source and translation language on the collection after importing; both are fed to Spotlight
as keywords, so `zh-Hans` finds your Chinese decks.

## Keeping the index in step

Indexing is incremental. New and edited entries are queued, pushed in batches on launch and after
every change, and removed from Spotlight when you delete them or switch their collection off.
Settings shows what is indexed, what is waiting, and offers a full rebuild.

Two things worth knowing:

- Core Spotlight gets slow well before a full 100k-headword dictionary fits, which is why every
  collection has a **max entries** cap (20,000 by default). Frequency-ordered dictionaries work best.
- Items are indexed with no expiration date. iOS otherwise drops untouched entries after a month.

## Known limits

- CJK headwords match exactly and by prefix; FTS5's `unicode61` tokenizer does not segment Chinese or
  Japanese, so full-text search inside definitions is word-based only.
- Import reads the whole file into memory. Very large dictionaries should be split before importing.
- Android and web are out of scope — `platforms` is pinned to `ios`.
