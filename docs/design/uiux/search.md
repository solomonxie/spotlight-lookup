# Look up

In-app search over every entry. First tab, the app's home.

```
                    Look up
 ┌──────────────────────────────────────────────┐
 │ Search every indexed word and card           │
 └──────────────────────────────────────────────┘

 RECENT                          ← one from each collection, newest first

 ╭──────────────────────────────────────────────╮
 │ 走后门  zǒu hòu mén                           │
 │ To pull strings; to use back-door            │
 │ connections.                                 │
 │ My Flashcards          ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ 忘记  wàng jì                                 │
 │ to forget                                    │
 │ 中文 → English (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ forget  /fərˈɡet/                            │
 │ v. 忘记；遗忘                                  │
 │ English → 中文 (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯

 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  LOOK UP    Library    Cards     Settings
```

Reached from: launch · back from Entry · tab bar

RECENT round-robins the collections. A freshly imported dictionary writes one
timestamp across every row, so a flat newest-first list would show that import
and nothing else; an entry the user just added is still first, being the
newest of the rank-one rows.

## Typing

```
 ┌──────────────────────────────────────────────┐
 │ coffee▌                                  ✕   │
 └──────────────────────────────────────────────┘

 3 matches                                     ← replaces RECENT

 ╭──────────────────────────────────────────────╮
 │ coffee  /ˈkɔːfi/                             │ ← exact term, rank 0
 │ n. 咖啡                                       │
 │ English → 中文 (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ 咖啡  kā fēi                                  │ ← found by its definition
 │ coffee                                       │
 │ 中文 → English (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ sugar  /ˈʃʊɡər/                              │ ← found by its example,
 │ n. 糖；食糖                                    │   "No sugar in my coffee"
 │ English → 中文 (demo)  ●  in Spotlight       │
 ╰──────────────────────────────────────────────╯
```

Results refresh 180ms after the last keystroke. Ranking: exact term, then
prefix, then full-text across definition, example and tags — which is why one
English query reaches both directions of the dictionary.

## States

```
empty      Your library is empty
           Import a dictionary file or add a
           flashcard to start filling Spotlight.
           ← only after the demo data is deleted

no match   Nothing found
           No entry matches "asdf". Import a
           dictionary or add a card for it.

1 match    1 match                              ← singular, not "1 matches"

999+       60 matches                           ← hard cap, no pagination

expo go    ╭──────────────────────────────────╮
           │ Running without Core Spotlight — │
           │ in-app search works, but system  │
           │ Spotlight indexing needs a       │
           │ development build.               │
           ╰──────────────────────────────────╯
           ← banner sits under the field, above the list
```

## Interactions

| Target | Action | Result |
|---|---|---|
| field | type | debounced search, 180ms |
| field | `✕` | clears, list returns to RECENT |
| row | tap | → `entry.md` |
| list | drag | dismisses the keyboard |
| tab | return to it | RECENT reloads, so a new card appears |

## Copy

| Where | String |
|---|---|
| placeholder | Search every indexed word and card |
| idle header | RECENT |
| results header | `{n}` match / `{n}` matches |
| empty title | Your library is empty |
| empty body | Import a dictionary file or add a flashcard to start filling Spotlight. |
| no-match title | Nothing found |
| no-match body | No entry matches "`{query}`". Import a dictionary or add a card for it. |

## Notes

- No search history and no suggestions: the system Spotlight field is the one
  people are meant to reach for, and duplicating its affordances here invites
  using the wrong one.
- CJK headwords match exactly and by prefix. `unicode61` does not segment
  Chinese or Japanese, so searching inside a Chinese definition is word-based —
  `咖啡` is found by its own headword and by the English gloss, not by a
  substring of a longer Chinese sentence.
- Open: the ● / ○ dot per row is engineering state. Useful while the sync is
  new, probably noise once it is trusted. Revisit after device testing.
