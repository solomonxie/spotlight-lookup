# Cards

Write a flashcard and have it searchable from the Home Screen seconds later.
Third tab.

```
                     Cards
 ╭──────────────────────────────────────────────╮
 │ FRONT                                        │
 │ ┌──────────────────────────────────────────┐ │
 │ │ Term or question                         │ │
 │ └──────────────────────────────────────────┘ │
 │ BACK                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ Definition, translation or answer        │ │
 │ │                                          │ │
 │ └──────────────────────────────────────────┘ │
 │ TAGS                                         │
 │ ┌──────────────────────────────────────────┐ │
 │ │ comma, separated                         │ │
 │ └──────────────────────────────────────────┘ │
 │ [[ Add card ]]                               │
 ╰──────────────────────────────────────────────╯

 CARDS IN MY FLASHCARDS
 ╭──────────────────────────────────────────────╮
 │ idempotent                                   │
 │ Running it twice changes nothing more than   │
 │ running it once.                             │
 ╰──────────────────────────────────────────────╯
 ╭──────────────────────────────────────────────╮
 │ backpressure                                 │
 │ A consumer signalling a producer to slow     │
 │ down.                                        │
 ╰──────────────────────────────────────────────╯

 ────────────────────────────────────────────────
   ⌕           ▤          ▦           ⚙
  Look up    Library    CARDS     Settings
```

Reached from: tab bar

The form sits above the list, not behind a `+`: adding is the reason to open
this tab, and a card takes three fields.

## States

```
empty      No cards yet
           Anything you add here becomes
           searchable from the Home Screen.

saving     [[ ⟳ ]]                              ← fields stay filled until
                                                  the write succeeds

multi-deck DECK
           ( My Flashcards ) ( JLPT N2 ) ( Kanji )
                 ^^^^^^^^^^^^ selected, accent border
           ← only appears with 2+ flashcard decks

no deck    [[ Add card ]] ──▶ creates "My Flashcards", then saves
```

## Overlays

```
 ┌──────────────────────────────────────────┐
 │  Missing text                            │
 │  A card needs both a front and a back.   │
 │                                 ( OK )   │
 └──────────────────────────────────────────┘
```

## Interactions

| Target | Action | Result |
|---|---|---|
| Add card | tap | writes, clears the form, syncs in the background |
| Add card | empty front or back | alert, nothing written |
| deck chip | tap | switches the list and the save target |
| card row | tap | — (not yet; see Notes) |
| tab | return to it | list reloads |

## Copy

| Where | String |
|---|---|
| labels | FRONT · BACK · TAGS |
| placeholders | Term or question · Definition, translation or answer · comma, separated |
| action | Add card |
| section | Cards in `{deck}` |
| empty title | No cards yet |
| empty body | Anything you add here becomes searchable from the Home Screen. |
| error | Missing text / A card needs both a front and a back. |

## Notes

- Front/back rather than term/definition: this tab is for memorisation, and
  the back is often a question's answer rather than a dictionary sense. The
  same two columns are what a dictionary import fills.
- Deck chips are hidden at one deck so the common case is one screen with no
  chrome.
- Open: rows here do not push Entry, so a typo on a card can only be fixed by
  finding it in Look up. Should route the same as an EntryRow.
- Open: no review or spaced-repetition mode. The cards are for lookup today;
  "memorization" in the product goal is only half served.
