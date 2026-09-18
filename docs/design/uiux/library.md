# Library

Every collection, and the switch that decides whether it reaches Spotlight.
Second tab.

```
                    Library
 [[ Import dictionary ]]      [ New deck ]

 ╭──────────────────────────────────────────────╮
 │ English → 中文 (demo)                         │
 │ ( Dictionary ) ( en ) ( → zh-Hans )          │
 │ 180 entries · 180 in Spotlight · cap 20000   │
 │ ──────────────────────────────────────────── │
 │ Index in Spotlight                      ─●   │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ 中文 → English (demo)                         │
 │ ( Dictionary ) ( zh-Hans ) ( → en )          │
 │ 125 entries · 125 in Spotlight · cap 20000   │
 │ ──────────────────────────────────────────── │
 │ Index in Spotlight                      ─●   │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ My Flashcards                                │
 │ ( Flashcards ) ( zh-Hans ) ( → en )          │
 │ 12 entries · 12 in Spotlight · cap 20000     │
 │ ──────────────────────────────────────────── │
 │ Index in Spotlight                      ─●   │
 ╰──────────────────────────────────────────────╯

 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  Look up    LIBRARY    Cards     Settings
```

Reached from: tab bar · back from Collection

Tapping anywhere above the divider pushes `collection.md`; the toggle below
it never navigates.

## States

```
empty      No collections yet
           Import a dictionary file or create a
           deck of your own cards.
           ← only after the demo collections are deleted

off        │ CC-CEDICT (full)                  │
           │ ( Dictionary ) ( zh-Hans ) ( → en)│
           │ 122000 entries · 0 in Spotlight   │
           │ Index in Spotlight           ○─   │

capped     │ CC-CEDICT (full)                  │
           │ 122000 entries · 20000 in Spotlight ← cap reached, rest ignored
           │ cap 20000                         │

long name  │ Japanese → English (JMdict, full…│ ← 1 line, then clips
```

## Overlays

### Import sheet

```
 [ Import dictionary ] ──▶ [ Files picker ] ──pick──▶

 ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
  Import hsk-vocabulary.csv
  4821 entries parsed as CSV · 12 rows skipped

  COLLECTION NAME
  ┌────────────────────────────────────────────┐
  │ hsk-vocabulary                             │ ← filename, minus extension
  └────────────────────────────────────────────┘
  SOURCE LANGUAGE
  ┌────────────────────────────────────────────┐
  │ en, ja, de …                               │
  └────────────────────────────────────────────┘
  TRANSLATION LANGUAGE
  ┌────────────────────────────────────────────┐
  │ zh-Hans, en …                              │
  └────────────────────────────────────────────┘

  [[ Import ]]
  [ Cancel ]
```

Counts are shown before anything is written, so a mis-parsed file is
obvious while cancelling is still free.

```
importing   [[ ⟳ ]]                            ← Import swaps to a spinner

cedict      Import cedict_1_0_ts_utf-8_mdbg.u8
            122304 entries parsed as CEDICT
            ← detected from the line shape, not the extension;
              pinyin arrives as chuan2 tong3 and is stored chuán tǒng,
              the traditional form lands in tags so it stays searchable
```

### Alerts

```
 ┌──────────────────────────────────────────┐
 │  Nothing to import                       │
 │  Expected JSON, CSV or TSV with a term   │
 │  and a definition per row.               │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘

 ┌──────────────────────────────────────────┐
 │  Imported                                │
 │  4821 entries added and queued for       │
 │  Spotlight.                              │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘

 ┌──────────────────────────────────────────┐
 │  Could not read that file                │
 │  <system error>                          │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| Import dictionary | tap | Files picker → import sheet |
| import sheet | Import | writes, syncs, alert with the count |
| New deck | tap | creates "New deck", list refreshes |
| card body | tap | → `collection.md` |
| toggle | on | entries queue, sync runs, counts update |
| toggle | off | whole Spotlight domain dropped at once |

## Copy

| Where | String |
|---|---|
| primary action | Import dictionary |
| secondary action | New deck |
| row toggle | Index in Spotlight |
| row meta | `{n}` entries · `{n}` in Spotlight · cap `{n}` |
| empty title | No collections yet |
| empty body | Import a dictionary file or create a deck of your own cards. |

## Formats the sheet accepts

| Format | Shape |
|---|---|
| JSON | array of objects, keys matched loosely (`word`/`term`/`front`, `meaning`/`translation`/`back`, …) |
| CSV / TSV | header row matched the same way, or positional `term, definition` / `term, reading, definition` |
| CC-CEDICT | `傳統 传统 [chuan2 tong3] /tradition/convention/` — the `.u8` file MDBG publishes |

## Notes

- CC-CEDICT is detected by line shape rather than extension, so its derivatives
  and hand-trimmed subsets import without renaming. Numbered pinyin is converted
  to tone marks on the way in, because `chuan2 tong3` is unreadable in a
  Spotlight preview.
- "New deck" creates the collection immediately rather than opening a naming
  dialog; it lands in the list already tappable, and Collection is where every
  other property is edited anyway.
- Import reads the whole file into memory. A 50MB dictionary should be split
  first — the sheet's parsed count is the only warning today.
- Open: no confirmation when switching a large collection off, which silently
  deletes thousands of Spotlight items. Cheap to re-index, so left alone for
  now.
