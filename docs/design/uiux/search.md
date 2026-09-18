# Look up

In-app search over every entry. First tab, the app's home.

```
                    Look up
 ┌──────────────────────────────────────────────┐
 │ Search every indexed word and card           │
 └──────────────────────────────────────────────┘

 RECENT

 ╭──────────────────────────────────────────────╮
 │ idempotent                                   │
 │ Running it twice changes nothing more than   │
 │ running it once.                             │
 │ My Flashcards           ●  in Spotlight      │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ resilient  /rɪˈzɪliənt/                      │
 │ adj. 有韧性的；能快速恢复的                     │
 │ English → 中文 (starter) ●  in Spotlight     │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ ephemeral  /ɪˈfem(ə)rəl/                     │
 │ adj. 短暂的；转瞬即逝的                        │
 │ English → 中文 (starter) ●  in Spotlight     │
 ╰──────────────────────────────────────────────╯

 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  LOOK UP    Library    Cards     Settings
```

Reached from: launch · back from Entry · tab bar

## Typing

```
 ┌──────────────────────────────────────────────┐
 │ resil▌                                   ✕   │ ← clear button while editing
 └──────────────────────────────────────────────┘

 2 matches                                       ← replaces RECENT

 ╭──────────────────────────────────────────────╮
 │ resilient  /rɪˈzɪliənt/                      │ ← exact/prefix hits first
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ resilience  /rɪˈzɪliəns/                     │
 ╰──────────────────────────────────────────────╯
```

Results refresh 180ms after the last keystroke. Ranking: exact term, then
prefix, then full-text across definition, example and tags — so searching
`recover` finds `resilient` through its example sentence.

## States

```
empty      Your library is empty
           Import a dictionary file or add a
           flashcard to start filling Spotlight.

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
  Chinese or Japanese, so full-text search inside a definition is word-based.
- Open: the ● / ○ dot per row is engineering state. Useful while the sync is
  new, probably noise once it is trusted. Revisit after device testing.
