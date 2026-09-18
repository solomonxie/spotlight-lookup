# Library

Every collection, and the switch that decides whether it reaches Spotlight.
Second tab.

```
                    Library
 [[ Import dictionary ]]      [ New deck ]

 ╭──────────────────────────────────────────────╮
 │ English → 中文 (starter)                      │
 │ ( Dictionary ) ( en ) ( → zh-Hans )          │
 │ 15 entries · 15 in Spotlight · cap 20000     │
 │ ──────────────────────────────────────────── │
 │ Index in Spotlight                      ─●   │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ My Flashcards                                │
 │ ( Flashcards ) ( en )                        │
 │ 3 entries · 3 in Spotlight · cap 20000       │
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

off        │ Old JLPT deck                     │
           │ ( Dictionary ) ( ja )             │
           │ 8210 entries · 0 in Spotlight     │
           │ Index in Spotlight           ○─   │

capped     │ CEDICT                            │
           │ 12000 entries · 20000 in Spotlight│ ← cap reached, rest ignored
           │ cap 20000                         │

long name  │ Japanese → English (JMdict, full…│ ← 1 line, then clips
```

## Overlays

### Import sheet

```
 [ Import dictionary ] ──▶ [ Files picker ] ──pick──▶

 ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
  Import cedict-frequency.csv
  4821 entries parsed as CSV · 12 rows skipped

  COLLECTION NAME
  ┌────────────────────────────────────────────┐
  │ cedict-frequency                           │ ← filename, minus extension
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

## Notes

- "New deck" creates the collection immediately rather than opening a naming
  dialog; it lands in the list already tappable, and Collection is where every
  other property is edited anyway.
- Import reads the whole file into memory. A 50MB dictionary should be split
  first — the sheet's parsed count is the only warning today.
- Open: no confirmation when switching a large collection off, which silently
  deletes thousands of Spotlight items. Cheap to re-index, so left alone for
  now.
