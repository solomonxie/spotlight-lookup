# Entry

One word or card in full. The landing screen for a Spotlight tap.

```
 ‹ Back              resilient

 ╭──────────────────────────────────────────────╮
 │ resilient                                    │
 │ /rɪˈzɪliənt/                                 │
 │                                              │
 │ adj. 有韧性的；能快速恢复的                     │
 │ A resilient system recovers without a        │
 │ restart.                                     │ ← example, italic
 ╰──────────────────────────────────────────────╯

 DETAILS
 ╭──────────────────────────────────────────────╮
 │ ( English → 中文 (starter) ) ( starter )     │
 │ Indexed 17/09/2026, 21:30:14                 │
 ╰──────────────────────────────────────────────╯

 [[ Edit ]]
 [ Delete ]!
```

Reached from: Look up · Collection · `spotlightlookup://entry/<id>` from a
Spotlight result

The title bar takes the term, so the word is still readable after the card
scrolls away.

## States

```
queued     Queued for the next Spotlight sync

excluded   This collection is excluded from Spotlight

card       │ idempotent                          │ ← no reading, no example
           │                                     │
           │ Running it twice changes nothing    │
           │ more than running it once.          │
           │ ( My Flashcards ) ( engineering )   │

deleted              Entry not found
           It may have been deleted since
           Spotlight last indexed it.
           ← the one state only reachable from Spotlight

loading    (blank background, no spinner)        ← a local read, ~1 frame
```

## Editing

```
 [[ Edit ]] ↓

 ╭──────────────────────────────────────────────╮
 │ TERM                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ resilient                                │ │
 │ └──────────────────────────────────────────┘ │
 │ READING                                      │
 │ ┌──────────────────────────────────────────┐ │
 │ │ /rɪˈzɪliənt/                             │ │
 │ └──────────────────────────────────────────┘ │
 │ DEFINITION                                   │
 │ ┌──────────────────────────────────────────┐ │
 │ │ adj. 有韧性的；能快速恢复的                 │ │
 │ │                                          │ │
 │ └──────────────────────────────────────────┘ │
 │ EXAMPLE                                      │
 │ ┌──────────────────────────────────────────┐ │
 │ │ A resilient system recovers without a    │ │
 │ │ restart.                                 │ │
 │ └──────────────────────────────────────────┘ │
 │ TAGS                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ starter                                  │ │
 │ └──────────────────────────────────────────┘ │
 │ [[ Save ]]                                   │
 │ [ Cancel ]                                   │
 ╰──────────────────────────────────────────────╯
```

Editing replaces the card in place rather than pushing a screen — the same
content, now typeable. Saving re-queues the entry, so Details flips to
"Queued for the next Spotlight sync" until the sync lands.

## Overlays

```
 [ Delete ]! ↓

 ┌──────────────────────────────────────────┐
 │  Delete entry?                           │
 │  It is removed from the app and from     │
 │  Spotlight.                              │
 │        ( Cancel )      [[ Delete ]]!     │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| Edit | tap | card becomes the form |
| Save | tap | writes, `indexed_at` cleared, sync runs |
| Cancel | tap | discards, card returns |
| Delete | tap | alert, then back |

## Copy

| Where | String |
|---|---|
| section | DETAILS |
| indexed | Indexed `{date}` |
| queued | Queued for the next Spotlight sync |
| excluded | This collection is excluded from Spotlight |
| missing title | Entry not found |
| missing body | It may have been deleted since Spotlight last indexed it. |
| destructive | Delete entry? / It is removed from the app and from Spotlight. |

## Notes

- "Entry not found" exists because Spotlight can outlive the row: a result
  tapped between a delete and the next sync lands here. It explains rather
  than 404s.
- Open: no pronunciation audio, no related words, no "next entry" swipe. The
  screen is a destination, not a reading experience, which is the right shape
  for a Spotlight tap but thin when reached from Look up.
