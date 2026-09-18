# Collection

One collection's Spotlight settings and its entries. Pushed from Library.

```
 ‹ Library     English → 中文 (starter)

 ╭──────────────────────────────────────────────╮
 │ Index in Spotlight                      ─●   │
 │ 15 of 15 entries are in system search.       │ ← state, stays inline
 ╰──────────────────────────────────────────────╯

 COLLECTION
 ╭──────────────────────────────────────────────╮
 │ NAME                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ English → 中文 (starter)                  │ │
 │ └──────────────────────────────────────────┘ │
 │ SOURCE LANGUAGE                              │
 │ ┌──────────────────────────────────────────┐ │
 │ │ en                                       │ │
 │ └──────────────────────────────────────────┘ │
 │ TRANSLATION LANGUAGE                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ zh-Hans                                  │ │
 │ └──────────────────────────────────────────┘ │
 │ MAX ENTRIES IN SPOTLIGHT  ⓘ                  │
 │ ┌──────────────────────────────────────────┐ │
 │ │ 20000                                    │ │
 │ └──────────────────────────────────────────┘ │
 │ [[ Save ]]                                   │
 ╰──────────────────────────────────────────────╯

 ENTRIES (15)
 ╭──────────────────────────────────────────────╮
 │ serendipity                                  │
 │ n. 意外发现珍奇事物的本领；机缘巧合             │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ resilient                                    │
 │ adj. 有韧性的；能快速恢复的                     │
 ╰──────────────────────────────────────────────╯

 [ Delete collection ]!
```

Reached from: Library → tap a collection card

## States

```
off        │ Index in Spotlight               ○─ │
           │ 0 of 8210 entries are in system     │
           │ search.                             │

partial    │ 20000 of 84000 entries are in       │ ← cap reached
           │ system search.                      │

empty      ENTRIES (0)
                     Empty collection
             Nothing has been added here yet.

first 100  ENTRIES (84000)                        ← list shows 100 newest,
           …                                        no pagination yet
```

## Overlays

```
 tap ⓘ on MAX ENTRIES ↓

 ┌──────────────────────────────────────────┐
 │  Why a cap                               │
 │  Core Spotlight slows down on very large │
 │  indexes. A cap keeps a big dictionary   │
 │  usable by indexing only its first N     │
 │  entries, which works best when the file │
 │  is ordered by frequency.                │
 │                            [ Got it ]    │
 └──────────────────────────────────────────┘

 [ Delete collection ]! ↓

 ┌──────────────────────────────────────────┐
 │  Delete collection?                      │
 │  Every entry in it leaves the app and    │
 │  Spotlight.                              │
 │        ( Cancel )      [[ Delete ]]!     │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| toggle | change | saves immediately, sync runs, counts refresh |
| Save | tap | writes the four fields, then re-syncs |
| entry row | tap | → `entry.md` |
| Delete collection | tap | alert, then back to Library |

## Copy

| Where | String |
|---|---|
| toggle | Index in Spotlight |
| state line | `{n}` of `{n}` entries are in system search. |
| section | COLLECTION · ENTRIES (`{n}`) |
| ⓘ title | Why a cap |
| empty title | Empty collection |
| empty body | Nothing has been added here yet. |
| destructive | Delete collection / Delete collection? / Every entry in it leaves the app and Spotlight. |

## Notes

- The toggle saves on change while the text fields need Save: a switch that
  needed confirming would be a broken switch, and a field that saved per
  keystroke would re-sync on every character.
- Lowering the cap does not remove already-indexed entries; it only stops new
  ones. Rebuild from Settings to apply it downward.
- Open: entries list is capped at 100 with no way to page or search within a
  collection. Fine for a deck, wrong for an 84k dictionary.
